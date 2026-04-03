'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  UserPlus,
  Briefcase,
  Hash,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface AccountOpeningToolProps {
  uiConfig?: UIConfig;
}

// Types
type AccountType = 'checking' | 'savings' | 'money_market' | 'cd' | 'business_checking' | 'business_savings';
type AccountStatus = 'pending' | 'approved' | 'rejected' | 'under_review' | 'documents_required';
type CustomerType = 'individual' | 'joint' | 'business' | 'trust';

interface AccountApplication {
  id: string;
  applicationNumber: string;
  accountType: AccountType;
  customerType: CustomerType;
  status: AccountStatus;
  // Primary applicant
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Employment
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'student' | 'unemployed';
  employer: string;
  occupation: string;
  annualIncome: number;
  // Account details
  initialDeposit: number;
  fundingSource: 'transfer' | 'cash' | 'check' | 'wire';
  purposeOfAccount: string;
  // Compliance
  citizenshipStatus: 'us_citizen' | 'resident_alien' | 'non_resident';
  idType: 'drivers_license' | 'passport' | 'state_id' | 'military_id';
  idNumber: string;
  idExpiration: string;
  // Joint account (optional)
  jointApplicantName?: string;
  jointApplicantSSN?: string;
  // Business (optional)
  businessName?: string;
  businessEIN?: string;
  businessType?: string;
  // Tracking
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const ACCOUNT_TYPES: { value: AccountType; label: string; icon: React.ReactNode; minDeposit: number }[] = [
  { value: 'checking', label: 'Personal Checking', icon: <CreditCard className="w-4 h-4" />, minDeposit: 25 },
  { value: 'savings', label: 'Personal Savings', icon: <DollarSign className="w-4 h-4" />, minDeposit: 100 },
  { value: 'money_market', label: 'Money Market', icon: <DollarSign className="w-4 h-4" />, minDeposit: 2500 },
  { value: 'cd', label: 'Certificate of Deposit', icon: <Shield className="w-4 h-4" />, minDeposit: 1000 },
  { value: 'business_checking', label: 'Business Checking', icon: <Briefcase className="w-4 h-4" />, minDeposit: 100 },
  { value: 'business_savings', label: 'Business Savings', icon: <Building2 className="w-4 h-4" />, minDeposit: 500 },
];

const STATUS_CONFIG: Record<AccountStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: <Eye className="w-4 h-4" /> },
  documents_required: { label: 'Docs Required', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-4 h-4" /> },
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Column configuration for exports
const APPLICATION_COLUMNS: ColumnConfig[] = [
  { key: 'applicationNumber', header: 'Application #', type: 'string' },
  { key: 'accountType', header: 'Account Type', type: 'string' },
  { key: 'customerType', header: 'Customer Type', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'initialDeposit', header: 'Initial Deposit', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'submittedAt', header: 'Submitted', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateAppNumber = () => `ACC-${Date.now().toString().slice(-8)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Initial form state
const getInitialFormState = (): Partial<AccountApplication> => ({
  accountType: 'checking',
  customerType: 'individual',
  status: 'pending',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  ssn: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
  employmentStatus: 'employed',
  employer: '',
  occupation: '',
  annualIncome: 0,
  initialDeposit: 0,
  fundingSource: 'transfer',
  purposeOfAccount: '',
  citizenshipStatus: 'us_citizen',
  idType: 'drivers_license',
  idNumber: '',
  idExpiration: '',
  notes: '',
});

export const AccountOpeningTool: React.FC<AccountOpeningToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  // useToolData hook for backend sync
  const {
    data: applications,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<AccountApplication>('account-opening', [], APPLICATION_COLUMNS);

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Local UI State
  const [activeTab, setActiveTab] = useState<'applications' | 'new' | 'analytics'>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AccountApplication>>(getInitialFormState());
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        setFormData({
          accountType: params.accountType || 'checking',
          customerType: params.customerType || 'individual',
          status: params.status || 'pending',
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          phone: params.phone || '',
          dateOfBirth: params.dateOfBirth || '',
          ssn: params.ssn || '',
          address: params.address || '',
          city: params.city || '',
          state: params.state || '',
          zipCode: params.zipCode || '',
          country: params.country || 'USA',
          employmentStatus: params.employmentStatus || 'employed',
          employer: params.employer || '',
          occupation: params.occupation || '',
          annualIncome: params.annualIncome || 0,
          initialDeposit: params.initialDeposit || 0,
          fundingSource: params.fundingSource || 'transfer',
          purposeOfAccount: params.purposeOfAccount || '',
          citizenshipStatus: params.citizenshipStatus || 'us_citizen',
          idType: params.idType || 'drivers_license',
          idNumber: params.idNumber || '',
          idExpiration: params.idExpiration || '',
          notes: params.notes || '',
        });
        setActiveTab('new');
        setIsEditFromGallery(true);
      } else if (params.firstName || params.lastName || params.email) {
        // Regular prefill from AI
        setFormData({
          ...getInitialFormState(),
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setActiveTab('new');
      }
    }
  }, [uiConfig?.params]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesType = filterType === 'all' || app.accountType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [applications, searchTerm, filterStatus, filterType]);

  // Analytics
  const analytics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'pending').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const underReview = applications.filter(a => a.status === 'under_review').length;
    const docsRequired = applications.filter(a => a.status === 'documents_required').length;
    const totalDeposits = applications.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.initialDeposit, 0);

    const byType = ACCOUNT_TYPES.reduce((acc, type) => {
      acc[type.value] = applications.filter(a => a.accountType === type.value).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, pending, approved, rejected, underReview, docsRequired, totalDeposits, byType };
  }, [applications]);

  // Form handlers
  const handleSubmit = () => {
    const now = new Date().toISOString();

    if (editingId) {
      updateItem(editingId, {
        ...formData,
        updatedAt: now,
      });
      setEditingId(null);
    } else {
      const newApplication: AccountApplication = {
        ...formData as AccountApplication,
        id: generateId(),
        applicationNumber: generateAppNumber(),
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newApplication);
    }

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'account-opening',
        accountType: formData.accountType,
        customerType: formData.customerType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        ssn: formData.ssn,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        employmentStatus: formData.employmentStatus,
        employer: formData.employer,
        occupation: formData.occupation,
        annualIncome: formData.annualIncome,
        initialDeposit: formData.initialDeposit,
        fundingSource: formData.fundingSource,
        purposeOfAccount: formData.purposeOfAccount,
        citizenshipStatus: formData.citizenshipStatus,
        idType: formData.idType,
        idNumber: formData.idNumber,
        idExpiration: formData.idExpiration,
        notes: formData.notes,
      });
    }

    setFormData(getInitialFormState());
    setShowForm(false);
    setActiveTab('applications');
  };

  const handleEdit = (application: AccountApplication) => {
    setFormData(application);
    setEditingId(application.id);
    setShowForm(true);
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: AccountStatus) => {
    updateItem(id, {
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCancel = () => {
    setFormData(getInitialFormState());
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.accountOpening.accountOpening', 'Account Opening')}</h1>
              <p className="text-gray-500 text-sm">{t('tools.accountOpening.manageBankAccountApplications', 'Manage bank account applications')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="account-opening" toolName="Account Opening" />

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
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'applications', label: 'Applications', icon: <FileText className="w-4 h-4" /> },
            { id: 'new', label: 'New Application', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <DollarSign className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.accountOpening.searchApplications', 'Search applications...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('tools.accountOpening.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('tools.accountOpening.allAccountTypes', 'All Account Types')}</option>
              {ACCOUNT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Applications List */}
          <div className="space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.accountOpening.noApplicationsFound', 'No applications found')}</h3>
                <p className="text-gray-500 mb-4">{t('tools.accountOpening.startByCreatingANew', 'Start by creating a new account application')}</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.accountOpening.newApplication', 'New Application')}
                </button>
              </div>
            ) : (
              filteredApplications.map(app => (
                <div key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{app.applicationNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[app.status].color}`}>
                              {STATUS_CONFIG[app.status].label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.firstName} {app.lastName} - {ACCOUNT_TYPES.find(t => t.value === app.accountType)?.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(app.initialDeposit)}</div>
                          <div className="text-xs text-gray-500">{formatDate(app.submittedAt)}</div>
                        </div>
                        {expandedId === app.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.accountOpening.contactInformation', 'Contact Information')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {app.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {app.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {app.city}, {app.state} {app.zipCode}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.accountOpening.employment', 'Employment')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>{app.occupation}</div>
                            <div>{app.employer}</div>
                            <div>Income: {formatCurrency(app.annualIncome)}/yr</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.accountOpening.accountDetails', 'Account Details')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Funding: {app.fundingSource}</div>
                            <div>Purpose: {app.purposeOfAccount}</div>
                            <div>ID: {app.idType.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('tools.accountOpening.updateStatus', 'Update Status:')}</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as AccountStatus)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(app)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Application Tab */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? t('tools.accountOpening.editApplication', 'Edit Application') : t('tools.accountOpening.newAccountApplication', 'New Account Application')}
          </h2>

          <div className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.accountOpening.accountType', 'Account Type')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ACCOUNT_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: type.value })}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      formData.accountType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.accountType === type.value ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {type.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">Min: {formatCurrency(type.minDeposit)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.accountOpening.customerType', 'Customer Type')}</label>
              <div className="flex gap-3">
                {[
                  { value: 'individual', label: 'Individual' },
                  { value: 'joint', label: 'Joint Account' },
                  { value: 'business', label: 'Business' },
                  { value: 'trust', label: 'Trust' },
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, customerType: type.value as CustomerType })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.customerType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.firstName', 'First Name')}</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.lastName', 'Last Name')}</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.email', 'Email')}</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.phone', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.dateOfBirth', 'Date of Birth')}</label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.ssn', 'SSN')}</label>
                <input
                  type="text"
                  value={formData.ssn || ''}
                  onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                  placeholder={t('tools.accountOpening.xxxXxXxxx', 'XXX-XX-XXXX')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.streetAddress', 'Street Address')}</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.city', 'City')}</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.state', 'State')}</label>
                  <select
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    {US_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.zipCode', 'ZIP Code')}</label>
                  <input
                    type="text"
                    value={formData.zipCode || ''}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.employmentStatus', 'Employment Status')}</label>
                <select
                  value={formData.employmentStatus || 'employed'}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as typeof formData.employmentStatus })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employed">{t('tools.accountOpening.employed', 'Employed')}</option>
                  <option value="self_employed">{t('tools.accountOpening.selfEmployed', 'Self Employed')}</option>
                  <option value="retired">{t('tools.accountOpening.retired', 'Retired')}</option>
                  <option value="student">{t('tools.accountOpening.student', 'Student')}</option>
                  <option value="unemployed">{t('tools.accountOpening.unemployed', 'Unemployed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.occupation', 'Occupation')}</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.employer', 'Employer')}</label>
                <input
                  type="text"
                  value={formData.employer || ''}
                  onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.annualIncome', 'Annual Income')}</label>
                <input
                  type="number"
                  value={formData.annualIncome || ''}
                  onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.initialDeposit', 'Initial Deposit')}</label>
                <input
                  type="number"
                  value={formData.initialDeposit || ''}
                  onChange={(e) => setFormData({ ...formData, initialDeposit: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.fundingSource', 'Funding Source')}</label>
                <select
                  value={formData.fundingSource || 'transfer'}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value as typeof formData.fundingSource })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="transfer">{t('tools.accountOpening.bankTransfer', 'Bank Transfer')}</option>
                  <option value="cash">{t('tools.accountOpening.cash', 'Cash')}</option>
                  <option value="check">{t('tools.accountOpening.check', 'Check')}</option>
                  <option value="wire">{t('tools.accountOpening.wireTransfer', 'Wire Transfer')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.purposeOfAccount', 'Purpose of Account')}</label>
                <input
                  type="text"
                  value={formData.purposeOfAccount || ''}
                  onChange={(e) => setFormData({ ...formData, purposeOfAccount: e.target.value })}
                  placeholder={t('tools.accountOpening.eGPersonalSavingsBusiness', 'e.g., Personal savings, Business operations, etc.')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ID Verification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.idType', 'ID Type')}</label>
                <select
                  value={formData.idType || 'drivers_license'}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value as typeof formData.idType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="drivers_license">{t('tools.accountOpening.driverSLicense', 'Driver\'s License')}</option>
                  <option value="passport">{t('tools.accountOpening.passport', 'Passport')}</option>
                  <option value="state_id">{t('tools.accountOpening.stateId', 'State ID')}</option>
                  <option value="military_id">{t('tools.accountOpening.militaryId', 'Military ID')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.idNumber', 'ID Number')}</label>
                <input
                  type="text"
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.idExpiration', 'ID Expiration')}</label>
                <input
                  type="date"
                  value={formData.idExpiration || ''}
                  onChange={(e) => setFormData({ ...formData, idExpiration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.accountOpening.notes', 'Notes')}</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t('tools.accountOpening.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Save className="w-4 h-4" />
                {editingId ? t('tools.accountOpening.updateApplication', 'Update Application') : t('tools.accountOpening.submitApplication', 'Submit Application')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.accountOpening.totalApplications', 'Total Applications')}</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.accountOpening.pendingReview', 'Pending Review')}</div>
              <div className="text-2xl font-bold text-yellow-600">{analytics.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.accountOpening.approved', 'Approved')}</div>
              <div className="text-2xl font-bold text-green-600">{analytics.approved}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.accountOpening.totalDeposits', 'Total Deposits')}</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.totalDeposits)}</div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.accountOpening.statusBreakdown', 'Status Breakdown')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = applications.filter(a => a.status === key).length;
                return (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${config.color} mb-2`}>
                      {config.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{config.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Account Type */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.accountOpening.byAccountType', 'By Account Type')}</h3>
            <div className="space-y-3">
              {ACCOUNT_TYPES.map(type => {
                const count = analytics.byType[type.value] || 0;
                const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                return (
                  <div key={type.value} className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      {type.icon}
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default AccountOpeningTool;
