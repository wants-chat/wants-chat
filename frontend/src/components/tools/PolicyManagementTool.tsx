'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  FileText,
  Shield,
  User,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Car,
  Home,
  Heart,
  Activity,
  Briefcase,
  Bell,
  History,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
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

interface PolicyManagementToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type InsuranceType = 'auto' | 'home' | 'life' | 'health' | 'business';
type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'suspended';

interface Policyholder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Policy {
  id: string;
  policyNumber: string;
  holderId: string;
  insuranceType: InsuranceType;
  carrier: string;
  effectiveDate: string;
  expirationDate: string;
  premium: number;
  deductible: number;
  coverageLimit: number;
  status: PolicyStatus;
  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  lastPaymentDate: string;
  nextPaymentDate: string;
  autoRenew: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PolicyDocument {
  id: string;
  policyId: string;
  name: string;
  type: 'declaration' | 'endorsement' | 'certificate' | 'amendment' | 'other';
  uploadDate: string;
  fileSize: string;
}

interface PolicyActivity {
  id: string;
  policyId: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

// Constants
const INSURANCE_TYPES: { type: InsuranceType; label: string; icon: React.ReactNode }[] = [
  { type: 'auto', label: 'Auto', icon: <Car className="w-4 h-4" /> },
  { type: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { type: 'life', label: 'Life', icon: <Heart className="w-4 h-4" /> },
  { type: 'health', label: 'Health', icon: <Activity className="w-4 h-4" /> },
  { type: 'business', label: 'Business', icon: <Briefcase className="w-4 h-4" /> },
];

const STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'text-green-500 bg-green-500/10', icon: <CheckCircle className="w-4 h-4" /> },
  pending: { label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10', icon: <Clock className="w-4 h-4" /> },
  expired: { label: 'Expired', color: 'text-red-500 bg-red-500/10', icon: <XCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'text-gray-500 bg-gray-500/10', icon: <XCircle className="w-4 h-4" /> },
  suspended: { label: 'Suspended', color: 'text-orange-500 bg-orange-500/10', icon: <AlertCircle className="w-4 h-4" /> },
};

const CARRIERS = [
  'SafeGuard Insurance',
  'LifeShield Co.',
  'Premier Coverage',
  'National Trust Insurance',
  'ValueFirst Insurance',
];

// Column configuration for exports
const POLICY_COLUMNS: ColumnConfig[] = [
  { key: 'policyNumber', header: 'Policy Number', type: 'string' },
  { key: 'holderName', header: 'Policyholder', type: 'string' },
  { key: 'insuranceType', header: 'Type', type: 'string' },
  { key: 'carrier', header: 'Carrier', type: 'string' },
  { key: 'effectiveDate', header: 'Effective Date', type: 'date' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'premium', header: 'Premium', type: 'currency' },
  { key: 'deductible', header: 'Deductible', type: 'currency' },
  { key: 'coverageLimit', header: 'Coverage Limit', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const HOLDER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generatePolicyNumber = () => `POL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const PolicyManagementTool: React.FC<PolicyManagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: policyholders,
    addItem: addHolderToBackend,
    updateItem: updateHolderBackend,
    deleteItem: deleteHolderBackend,
    isSynced: holdersSynced,
    isSaving: holdersSaving,
    lastSaved: holdersLastSaved,
    syncError: holdersSyncError,
    forceSync: forceHoldersSync,
  } = useToolData<Policyholder>('policy-holders', [], HOLDER_COLUMNS);

  const {
    data: policies,
    addItem: addPolicyToBackend,
    updateItem: updatePolicyBackend,
    deleteItem: deletePolicyBackend,
    isSynced: policiesSynced,
    isSaving: policiesSaving,
    lastSaved: policiesLastSaved,
    syncError: policiesSyncError,
    forceSync: forcePoliciesSync,
  } = useToolData<Policy>('policies', [], POLICY_COLUMNS);

  const {
    data: documents,
    addItem: addDocumentToBackend,
    deleteItem: deleteDocumentBackend,
  } = useToolData<PolicyDocument>('policy-documents', [], []);

  const {
    data: activities,
    addItem: addActivityToBackend,
  } = useToolData<PolicyActivity>('policy-activities', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'policies' | 'holders' | 'documents' | 'analytics'>('policies');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InsuranceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PolicyStatus | 'all'>('all');
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [showHolderForm, setShowHolderForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedHolder, setSelectedHolder] = useState<Policyholder | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);

  // Form state for new/edit policy
  const [policyForm, setPolicyForm] = useState<Partial<Policy>>({
    insuranceType: 'auto',
    carrier: CARRIERS[0],
    premium: 0,
    deductible: 500,
    coverageLimit: 100000,
    status: 'pending',
    paymentFrequency: 'monthly',
    autoRenew: true,
    notes: '',
  });

  // Form state for new/edit holder
  const [holderForm, setHolderForm] = useState<Partial<Policyholder>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Filter policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const holder = policyholders.find((h) => h.id === policy.holderId);
      const holderName = holder ? `${holder.firstName} ${holder.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holderName.includes(searchTerm.toLowerCase()) ||
        policy.carrier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || policy.insuranceType === filterType;
      const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [policies, policyholders, searchTerm, filterType, filterStatus]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status === 'active');
    const totalPremium = activePolicies.reduce((sum, p) => sum + p.premium, 0);
    const avgPremium = activePolicies.length > 0 ? totalPremium / activePolicies.length : 0;

    const expiringIn30Days = policies.filter((p) => {
      const expDate = new Date(p.expirationDate);
      const now = new Date();
      const diff = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30 && p.status === 'active';
    });

    const byType: Record<InsuranceType, number> = {
      auto: 0,
      home: 0,
      life: 0,
      health: 0,
      business: 0,
    };

    policies.forEach((p) => {
      if (p.status === 'active') {
        byType[p.insuranceType]++;
      }
    });

    return {
      totalPolicies: policies.length,
      activePolicies: activePolicies.length,
      totalPremium,
      avgPremium,
      expiringIn30Days: expiringIn30Days.length,
      byType,
      totalHolders: policyholders.length,
    };
  }, [policies, policyholders]);

  // Add policy handler
  const handleAddPolicy = () => {
    if (!policyForm.holderId) {
      setValidationMessage('Please select a policyholder');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const effectiveDate = new Date();
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    const newPolicy: Policy = {
      id: generateId(),
      policyNumber: generatePolicyNumber(),
      holderId: policyForm.holderId || '',
      insuranceType: policyForm.insuranceType as InsuranceType,
      carrier: policyForm.carrier || CARRIERS[0],
      effectiveDate: effectiveDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      premium: policyForm.premium || 0,
      deductible: policyForm.deductible || 500,
      coverageLimit: policyForm.coverageLimit || 100000,
      status: 'pending',
      paymentFrequency: policyForm.paymentFrequency || 'monthly',
      lastPaymentDate: '',
      nextPaymentDate: effectiveDate.toISOString(),
      autoRenew: policyForm.autoRenew ?? true,
      notes: policyForm.notes || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    addPolicyToBackend(newPolicy);
    addActivityToBackend({
      id: generateId(),
      policyId: newPolicy.id,
      action: 'Policy Created',
      description: `New ${policyForm.insuranceType} policy created`,
      performedBy: 'System',
      timestamp: now.toISOString(),
    });

    setShowPolicyForm(false);
    setPolicyForm({
      insuranceType: 'auto',
      carrier: CARRIERS[0],
      premium: 0,
      deductible: 500,
      coverageLimit: 100000,
      status: 'pending',
      paymentFrequency: 'monthly',
      autoRenew: true,
      notes: '',
    });
  };

  // Add holder handler
  const handleAddHolder = () => {
    if (!holderForm.firstName || !holderForm.lastName || !holderForm.email) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newHolder: Policyholder = {
      id: generateId(),
      firstName: holderForm.firstName || '',
      lastName: holderForm.lastName || '',
      email: holderForm.email || '',
      phone: holderForm.phone || '',
      dateOfBirth: holderForm.dateOfBirth || '',
      address: holderForm.address || '',
      city: holderForm.city || '',
      state: holderForm.state || '',
      zipCode: holderForm.zipCode || '',
    };

    addHolderToBackend(newHolder);
    setShowHolderForm(false);
    setHolderForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
  };

  // Update policy status
  const handleUpdateStatus = (policyId: string, newStatus: PolicyStatus) => {
    updatePolicyBackend(policyId, { status: newStatus, updatedAt: new Date().toISOString() });
    addActivityToBackend({
      id: generateId(),
      policyId,
      action: 'Status Updated',
      description: `Policy status changed to ${newStatus}`,
      performedBy: 'System',
      timestamp: new Date().toISOString(),
    });
  };

  // Delete policy
  const handleDeletePolicy = async (policyId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this policy?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deletePolicyBackend(policyId);
  };

  // Delete holder
  const handleDeleteHolder = async (holderId: string) => {
    const holderPolicies = policies.filter((p) => p.holderId === holderId);
    if (holderPolicies.length > 0) {
      setValidationMessage('Cannot delete policyholder with active policies');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this policyholder?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteHolderBackend(holderId);
  };

  // Get holder name
  const getHolderName = (holderId: string) => {
    const holder = policyholders.find((h) => h.id === holderId);
    return holder ? `${holder.firstName} ${holder.lastName}` : 'Unknown';
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const dataWithNames = filteredPolicies.map((p) => ({
      ...p,
      holderName: getHolderName(p.holderId),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(dataWithNames, POLICY_COLUMNS, 'policies');
        break;
      case 'excel':
        exportToExcel(dataWithNames, POLICY_COLUMNS, 'policies');
        break;
      case 'json':
        exportToJSON(dataWithNames, 'policies');
        break;
      case 'pdf':
        exportToPDF(dataWithNames, POLICY_COLUMNS, 'Policies Report');
        break;
    }
  };

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('tools.policyManagement.policyManagement', 'Policy Management')}</h1>
            <p className="text-sm text-muted-foreground">{t('tools.policyManagement.manageInsurancePoliciesAndPolicyholders', 'Manage insurance policies and policyholders')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="policy-management" toolName="Policy Management" />

          <SyncStatus
            isSynced={policiesSynced && holdersSynced}
            isSaving={policiesSaving || holdersSaving}
            lastSaved={policiesLastSaved || holdersLastSaved}
            error={policiesSyncError || holdersSyncError}
            onRetry={() => { forcePoliciesSync(); forceHoldersSync(); }}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {['policies', 'holders', 'documents', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('tools.policyManagement.searchPolicies', 'Search policies...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as InsuranceType | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.policyManagement.allTypes', 'All Types')}</option>
              {INSURANCE_TYPES.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PolicyStatus | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.policyManagement.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowPolicyForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {t('tools.policyManagement.addPolicy', 'Add Policy')}
            </button>
          </div>

          {/* Policies List */}
          <div className="space-y-3">
            {filteredPolicies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('tools.policyManagement.noPoliciesFound', 'No policies found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredPolicies.map((policy) => (
                <Card key={policy.id} className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedPolicyId(expandedPolicyId === policy.id ? null : policy.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${STATUS_CONFIG[policy.status].color}`}>
                          {INSURANCE_TYPES.find((t) => t.type === policy.insuranceType)?.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{policy.policyNumber}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_CONFIG[policy.status].color}`}>
                              {STATUS_CONFIG[policy.status].label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getHolderName(policy.holderId)} - {policy.carrier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(policy.premium)}</p>
                          <p className="text-sm text-muted-foreground">/{policy.paymentFrequency}</p>
                        </div>
                        {expandedPolicyId === policy.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedPolicyId === policy.id && (
                    <div className="px-4 pb-4 border-t border-border pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.policyManagement.effectiveDate', 'Effective Date')}</p>
                          <p className="font-medium">{formatDate(policy.effectiveDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.policyManagement.expirationDate', 'Expiration Date')}</p>
                          <p className="font-medium">{formatDate(policy.expirationDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.policyManagement.deductible', 'Deductible')}</p>
                          <p className="font-medium">{formatCurrency(policy.deductible)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.policyManagement.coverageLimit', 'Coverage Limit')}</p>
                          <p className="font-medium">{formatCurrency(policy.coverageLimit)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus(policy.id, 'active')}
                          className="px-3 py-1.5 text-sm bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"
                          disabled={policy.status === 'active'}
                        >
                          {t('tools.policyManagement.activate', 'Activate')}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(policy.id, 'suspended')}
                          className="px-3 py-1.5 text-sm bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20"
                        >
                          {t('tools.policyManagement.suspend', 'Suspend')}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(policy.id, 'cancelled')}
                          className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                        >
                          {t('tools.policyManagement.cancel', 'Cancel')}
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Policyholders Tab */}
      {activeTab === 'holders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('tools.policyManagement.searchPolicyholders', 'Search policyholders...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <button
              onClick={() => setShowHolderForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {t('tools.policyManagement.addPolicyholder', 'Add Policyholder')}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {policyholders
              .filter((h) =>
                searchTerm === '' ||
                `${h.firstName} ${h.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((holder) => {
                const holderPolicies = policies.filter((p) => p.holderId === holder.id);
                return (
                  <Card key={holder.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{holder.firstName} {holder.lastName}</p>
                            <p className="text-sm text-muted-foreground">{holder.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHolder(holder.id)}
                          className="p-1 hover:bg-red-500/10 rounded text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{holder.phone}</p>
                        <p>{holder.address}</p>
                        <p>{holder.city}, {holder.state} {holder.zipCode}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm">
                          <span className="text-muted-foreground">{t('tools.policyManagement.policies', 'Policies:')}</span>{' '}
                          <span className="font-medium">{holderPolicies.length}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.policyManagement.totalPolicies', 'Total Policies')}</p>
                  <p className="text-2xl font-bold">{analytics.totalPolicies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.policyManagement.activePolicies', 'Active Policies')}</p>
                  <p className="text-2xl font-bold">{analytics.activePolicies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.policyManagement.totalPremium', 'Total Premium')}</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalPremium)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.policyManagement.expiring30Days', 'Expiring (30 days)')}</p>
                  <p className="text-2xl font-bold">{analytics.expiringIn30Days}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies by Type */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.policyManagement.policiesByType', 'Policies by Type')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {INSURANCE_TYPES.map(({ type, label, icon }) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span>{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${analytics.totalPolicies > 0 ? (analytics.byType[type] / analytics.totalPolicies) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{analytics.byType[type]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.policyManagement.quickStats', 'Quick Stats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.policyManagement.totalPolicyholders', 'Total Policyholders')}</p>
                  <p className="text-xl font-bold">{analytics.totalHolders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.policyManagement.avgPremium', 'Avg Premium')}</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.avgPremium)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('tools.policyManagement.documentManagementComingSoon', 'Document management coming soon')}</p>
          </CardContent>
        </Card>
      )}

      {/* Add Policy Modal */}
      {showPolicyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.policyManagement.addNewPolicy', 'Add New Policy')}</CardTitle>
              <button onClick={() => setShowPolicyForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.policyholder', 'Policyholder *')}</label>
                <select
                  value={policyForm.holderId || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, holderId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">{t('tools.policyManagement.selectPolicyholder', 'Select policyholder')}</option>
                  {policyholders.map((h) => (
                    <option key={h.id} value={h.id}>{h.firstName} {h.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.insuranceType', 'Insurance Type')}</label>
                  <select
                    value={policyForm.insuranceType}
                    onChange={(e) => setPolicyForm({ ...policyForm, insuranceType: e.target.value as InsuranceType })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {INSURANCE_TYPES.map(({ type, label }) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.carrier', 'Carrier')}</label>
                  <select
                    value={policyForm.carrier}
                    onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.premium', 'Premium')}</label>
                  <input
                    type="number"
                    value={policyForm.premium || 0}
                    onChange={(e) => setPolicyForm({ ...policyForm, premium: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.deductible2', 'Deductible')}</label>
                  <input
                    type="number"
                    value={policyForm.deductible || 500}
                    onChange={(e) => setPolicyForm({ ...policyForm, deductible: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.coverageLimit2', 'Coverage Limit')}</label>
                  <input
                    type="number"
                    value={policyForm.coverageLimit || 100000}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverageLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.paymentFrequency', 'Payment Frequency')}</label>
                <select
                  value={policyForm.paymentFrequency}
                  onChange={(e) => setPolicyForm({ ...policyForm, paymentFrequency: e.target.value as Policy['paymentFrequency'] })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="monthly">{t('tools.policyManagement.monthly', 'Monthly')}</option>
                  <option value="quarterly">{t('tools.policyManagement.quarterly', 'Quarterly')}</option>
                  <option value="semi-annual">{t('tools.policyManagement.semiAnnual', 'Semi-Annual')}</option>
                  <option value="annual">{t('tools.policyManagement.annual', 'Annual')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.notes', 'Notes')}</label>
                <textarea
                  value={policyForm.notes || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background h-20"
                  placeholder={t('tools.policyManagement.additionalNotes', 'Additional notes...')}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={policyForm.autoRenew ?? true}
                  onChange={(e) => setPolicyForm({ ...policyForm, autoRenew: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoRenew" className="text-sm">{t('tools.policyManagement.autoRenewPolicy', 'Auto-renew policy')}</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowPolicyForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.policyManagement.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddPolicy}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.policyManagement.addPolicy2', 'Add Policy')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Holder Modal */}
      {showHolderForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.policyManagement.addNewPolicyholder', 'Add New Policyholder')}</CardTitle>
              <button onClick={() => setShowHolderForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={holderForm.firstName || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={holderForm.lastName || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.email', 'Email *')}</label>
                  <input
                    type="email"
                    value={holderForm.email || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={holderForm.phone || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.dateOfBirth', 'Date of Birth')}</label>
                <input
                  type="date"
                  value={holderForm.dateOfBirth || ''}
                  onChange={(e) => setHolderForm({ ...holderForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.address', 'Address')}</label>
                <input
                  type="text"
                  value={holderForm.address || ''}
                  onChange={(e) => setHolderForm({ ...holderForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.city', 'City')}</label>
                  <input
                    type="text"
                    value={holderForm.city || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.state', 'State')}</label>
                  <input
                    type="text"
                    value={holderForm.state || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.policyManagement.zipCode', 'Zip Code')}</label>
                  <input
                    type="text"
                    value={holderForm.zipCode || ''}
                    onChange={(e) => setHolderForm({ ...holderForm, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowHolderForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.policyManagement.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleAddHolder}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.policyManagement.addPolicyholder2', 'Add Policyholder')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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

export default PolicyManagementTool;
