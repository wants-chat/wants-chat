'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  FileX,
  FilePlus,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Upload,
  Download,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  Phone,
  Mail,
  X,
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
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ClaimsProcessingToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ClaimType = 'auto_collision' | 'auto_comprehensive' | 'property_damage' | 'liability' | 'medical' | 'theft' | 'natural_disaster' | 'other';
type ClaimStatus = 'submitted' | 'under_review' | 'pending_info' | 'approved' | 'denied' | 'paid' | 'closed';
type ClaimPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Claimant {
  id: string;
  policyNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  claimantId: string;
  policyNumber: string;
  claimType: ClaimType;
  status: ClaimStatus;
  priority: ClaimPriority;
  dateOfLoss: string;
  dateReported: string;
  description: string;
  claimAmount: number;
  approvedAmount: number;
  paidAmount: number;
  deductible: number;
  adjusterAssigned: string;
  estimatedResolution: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ClaimDocument {
  id: string;
  claimId: string;
  name: string;
  type: 'photo' | 'police_report' | 'medical_record' | 'estimate' | 'invoice' | 'correspondence' | 'other';
  uploadDate: string;
  uploadedBy: string;
}

interface ClaimNote {
  id: string;
  claimId: string;
  author: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
}

interface ClaimPayment {
  id: string;
  claimId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  payee: string;
}

// Constants
const CLAIM_TYPES: { type: ClaimType; label: string }[] = [
  { type: 'auto_collision', label: 'Auto Collision' },
  { type: 'auto_comprehensive', label: 'Auto Comprehensive' },
  { type: 'property_damage', label: 'Property Damage' },
  { type: 'liability', label: 'Liability' },
  { type: 'medical', label: 'Medical' },
  { type: 'theft', label: 'Theft' },
  { type: 'natural_disaster', label: 'Natural Disaster' },
  { type: 'other', label: 'Other' },
];

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'text-blue-500 bg-blue-500/10', icon: <FilePlus className="w-4 h-4" /> },
  under_review: { label: 'Under Review', color: 'text-yellow-500 bg-yellow-500/10', icon: <Clock className="w-4 h-4" /> },
  pending_info: { label: 'Pending Info', color: 'text-orange-500 bg-orange-500/10', icon: <AlertTriangle className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'text-green-500 bg-green-500/10', icon: <CheckCircle className="w-4 h-4" /> },
  denied: { label: 'Denied', color: 'text-red-500 bg-red-500/10', icon: <XCircle className="w-4 h-4" /> },
  paid: { label: 'Paid', color: 'text-purple-500 bg-purple-500/10', icon: <DollarSign className="w-4 h-4" /> },
  closed: { label: 'Closed', color: 'text-gray-500 bg-gray-500/10', icon: <FileCheck className="w-4 h-4" /> },
};

const PRIORITY_CONFIG: Record<ClaimPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-500 bg-gray-500/10' },
  medium: { label: 'Medium', color: 'text-blue-500 bg-blue-500/10' },
  high: { label: 'High', color: 'text-orange-500 bg-orange-500/10' },
  urgent: { label: 'Urgent', color: 'text-red-500 bg-red-500/10' },
};

const ADJUSTERS = ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Emily Brown', 'David Lee'];

// Column configuration for exports
const CLAIM_COLUMNS: ColumnConfig[] = [
  { key: 'claimNumber', header: 'Claim Number', type: 'string' },
  { key: 'claimantName', header: 'Claimant', type: 'string' },
  { key: 'policyNumber', header: 'Policy Number', type: 'string' },
  { key: 'claimType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'dateOfLoss', header: 'Date of Loss', type: 'date' },
  { key: 'claimAmount', header: 'Claim Amount', type: 'currency' },
  { key: 'approvedAmount', header: 'Approved Amount', type: 'currency' },
  { key: 'adjusterAssigned', header: 'Adjuster', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateClaimNumber = () => `CLM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

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
export const ClaimsProcessingTool: React.FC<ClaimsProcessingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: claimants,
    addItem: addClaimantToBackend,
    updateItem: updateClaimantBackend,
    deleteItem: deleteClaimantBackend,
    isSynced: claimantsSynced,
    isSaving: claimantsSaving,
    lastSaved: claimantsLastSaved,
    syncError: claimantsSyncError,
    forceSync: forceClaimantsSync,
  } = useToolData<Claimant>('claims-claimants', [], []);

  const {
    data: claims,
    addItem: addClaimToBackend,
    updateItem: updateClaimBackend,
    deleteItem: deleteClaimBackend,
    isSynced: claimsSynced,
    isSaving: claimsSaving,
    lastSaved: claimsLastSaved,
    syncError: claimsSyncError,
    forceSync: forceClaimsSync,
  } = useToolData<Claim>('claims', [], CLAIM_COLUMNS);

  const {
    data: documents,
    addItem: addDocumentToBackend,
    deleteItem: deleteDocumentBackend,
  } = useToolData<ClaimDocument>('claims-documents', [], []);

  const {
    data: notes,
    addItem: addNoteToBackend,
  } = useToolData<ClaimNote>('claims-notes', [], []);

  const {
    data: payments,
    addItem: addPaymentToBackend,
  } = useToolData<ClaimPayment>('claims-payments', [], []);

  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'claims' | 'queue' | 'payments' | 'analytics'>('claims');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ClaimType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ClaimPriority | 'all'>('all');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Form state for new claim
  const [claimForm, setClaimForm] = useState<Partial<Claim>>({
    claimType: 'auto_collision',
    priority: 'medium',
    description: '',
    claimAmount: 0,
    deductible: 500,
    adjusterAssigned: '',
    notes: '',
  });

  // Form state for payment
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'check',
    payee: '',
    reference: '',
  });

  // Claimant form
  const [claimantForm, setClaimantForm] = useState<Partial<Claimant>>({
    policyNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Filter claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const claimant = claimants.find((c) => c.id === claim.claimantId);
      const claimantName = claimant ? `${claimant.firstName} ${claimant.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claimantName.includes(searchTerm.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || claim.claimType === filterType;
      const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || claim.priority === filterPriority;

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [claims, claimants, searchTerm, filterType, filterStatus, filterPriority]);

  // Processing queue - claims that need attention
  const processingQueue = useMemo(() => {
    return claims
      .filter((c) => ['submitted', 'under_review', 'pending_info'].includes(c.status))
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [claims]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalClaims = claims.length;
    const openClaims = claims.filter((c) => !['closed', 'denied', 'paid'].includes(c.status)).length;
    const totalClaimAmount = claims.reduce((sum, c) => sum + c.claimAmount, 0);
    const totalApproved = claims.reduce((sum, c) => sum + c.approvedAmount, 0);
    const totalPaid = claims.reduce((sum, c) => sum + c.paidAmount, 0);

    const byStatus: Record<ClaimStatus, number> = {
      submitted: 0,
      under_review: 0,
      pending_info: 0,
      approved: 0,
      denied: 0,
      paid: 0,
      closed: 0,
    };

    const byType: Record<ClaimType, number> = {
      auto_collision: 0,
      auto_comprehensive: 0,
      property_damage: 0,
      liability: 0,
      medical: 0,
      theft: 0,
      natural_disaster: 0,
      other: 0,
    };

    claims.forEach((c) => {
      byStatus[c.status]++;
      byType[c.claimType]++;
    });

    const avgProcessingDays = claims
      .filter((c) => c.status === 'closed' || c.status === 'paid')
      .reduce((acc, c) => {
        const start = new Date(c.dateReported);
        const end = new Date(c.updatedAt);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / Math.max(claims.filter((c) => ['closed', 'paid'].includes(c.status)).length, 1);

    return {
      totalClaims,
      openClaims,
      totalClaimAmount,
      totalApproved,
      totalPaid,
      byStatus,
      byType,
      avgProcessingDays: Math.round(avgProcessingDays),
      approvalRate: totalClaims > 0 ? Math.round((byStatus.approved + byStatus.paid + byStatus.closed) / totalClaims * 100) : 0,
    };
  }, [claims]);

  // Get claimant name
  const getClaimantName = (claimantId: string) => {
    const claimant = claimants.find((c) => c.id === claimantId);
    return claimant ? `${claimant.firstName} ${claimant.lastName}` : 'Unknown';
  };

  // Add new claimant
  const handleAddClaimant = () => {
    if (!claimantForm.firstName || !claimantForm.lastName) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newClaimant: Claimant = {
      id: generateId(),
      policyNumber: claimantForm.policyNumber || '',
      firstName: claimantForm.firstName || '',
      lastName: claimantForm.lastName || '',
      email: claimantForm.email || '',
      phone: claimantForm.phone || '',
      address: claimantForm.address || '',
    };

    addClaimantToBackend(newClaimant);
    setClaimForm({ ...claimForm, claimantId: newClaimant.id, policyNumber: newClaimant.policyNumber });
    setClaimantForm({
      policyNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  // Add new claim
  const handleAddClaim = () => {
    if (!claimForm.claimantId) {
      setValidationMessage('Please select or add a claimant');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const newClaim: Claim = {
      id: generateId(),
      claimNumber: generateClaimNumber(),
      claimantId: claimForm.claimantId || '',
      policyNumber: claimForm.policyNumber || '',
      claimType: claimForm.claimType as ClaimType,
      status: 'submitted',
      priority: claimForm.priority as ClaimPriority,
      dateOfLoss: claimForm.dateOfLoss || now.toISOString(),
      dateReported: now.toISOString(),
      description: claimForm.description || '',
      claimAmount: claimForm.claimAmount || 0,
      approvedAmount: 0,
      paidAmount: 0,
      deductible: claimForm.deductible || 500,
      adjusterAssigned: claimForm.adjusterAssigned || '',
      estimatedResolution: '',
      notes: claimForm.notes || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    addClaimToBackend(newClaim);
    setShowClaimForm(false);
    setClaimForm({
      claimType: 'auto_collision',
      priority: 'medium',
      description: '',
      claimAmount: 0,
      deductible: 500,
      adjusterAssigned: '',
      notes: '',
    });
  };

  // Update claim status
  const handleUpdateStatus = (claimId: string, newStatus: ClaimStatus) => {
    updateClaimBackend(claimId, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  // Approve claim
  const handleApproveClaim = (claim: Claim, approvedAmount: number) => {
    updateClaimBackend(claim.id, {
      status: 'approved',
      approvedAmount,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add payment
  const handleAddPayment = () => {
    if (!selectedClaim || paymentForm.amount <= 0) {
      setValidationMessage('Please enter a valid payment amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const payment: ClaimPayment = {
      id: generateId(),
      claimId: selectedClaim.id,
      amount: paymentForm.amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference || generateId(),
      payee: paymentForm.payee,
    };

    addPaymentToBackend(payment);

    const newPaidAmount = selectedClaim.paidAmount + paymentForm.amount;
    updateClaimBackend(selectedClaim.id, {
      paidAmount: newPaidAmount,
      status: newPaidAmount >= selectedClaim.approvedAmount ? 'paid' : selectedClaim.status,
      updatedAt: new Date().toISOString(),
    });

    setShowPaymentForm(false);
    setPaymentForm({ amount: 0, paymentMethod: 'check', payee: '', reference: '' });
  };

  // Add note
  const handleAddNote = (claimId: string) => {
    if (!newNote.trim()) return;

    addNoteToBackend({
      id: generateId(),
      claimId,
      author: 'Current User',
      content: newNote,
      timestamp: new Date().toISOString(),
      isInternal: true,
    });

    setNewNote('');
  };

  // Delete claim
  const handleDeleteClaim = async (claimId: string) => {
    const confirmed = await confirm({
      title: 'Delete Claim',
      message: 'Are you sure you want to delete this claim?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (confirmed) {
      deleteClaimBackend(claimId);
    }
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const dataWithNames = filteredClaims.map((c) => ({
      ...c,
      claimantName: getClaimantName(c.claimantId),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(dataWithNames, CLAIM_COLUMNS, 'claims');
        break;
      case 'excel':
        exportToExcel(dataWithNames, CLAIM_COLUMNS, 'claims');
        break;
      case 'json':
        exportToJSON(dataWithNames, 'claims');
        break;
      case 'pdf':
        exportToPDF(dataWithNames, CLAIM_COLUMNS, 'Claims Report');
        break;
    }
  };

  return (
    <>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <FileCheck className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('tools.claimsProcessing.claimsProcessing', 'Claims Processing')}</h1>
            <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.trackAndProcessInsuranceClaims', 'Track and process insurance claims')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="claims-processing" toolName="Claims Processing" />

          <SyncStatus
            isSynced={claimsSynced && claimantsSynced}
            isSaving={claimsSaving || claimantsSaving}
            lastSaved={claimsLastSaved || claimantsLastSaved}
            error={claimsSyncError || claimantsSyncError}
            onRetry={() => { forceClaimsSync(); forceClaimantsSync(); }}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.totalClaims', 'Total Claims')}</p>
                <p className="text-2xl font-bold">{analytics.totalClaims}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.openClaims', 'Open Claims')}</p>
                <p className="text-2xl font-bold">{analytics.openClaims}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.totalPaid', 'Total Paid')}</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.approvalRate', 'Approval Rate')}</p>
                <p className="text-2xl font-bold">{analytics.approvalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {['claims', 'queue', 'payments', 'analytics'].map((tab) => (
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
            {tab === 'queue' && processingQueue.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {processingQueue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('tools.claimsProcessing.searchClaims', 'Search claims...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ClaimType | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.claimsProcessing.allTypes', 'All Types')}</option>
              {CLAIM_TYPES.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ClaimStatus | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.claimsProcessing.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowClaimForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {t('tools.claimsProcessing.newClaim', 'New Claim')}
            </button>
          </div>

          {/* Claims List */}
          <div className="space-y-3">
            {filteredClaims.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('tools.claimsProcessing.noClaimsFound', 'No claims found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredClaims.map((claim) => (
                <Card key={claim.id} className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${STATUS_CONFIG[claim.status].color}`}>
                          {STATUS_CONFIG[claim.status].icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{claim.claimNumber}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_CONFIG[claim.status].color}`}>
                              {STATUS_CONFIG[claim.status].label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${PRIORITY_CONFIG[claim.priority].color}`}>
                              {PRIORITY_CONFIG[claim.priority].label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getClaimantName(claim.claimantId)} - {CLAIM_TYPES.find((t) => t.type === claim.claimType)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(claim.claimAmount)}</p>
                          <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.claimed', 'Claimed')}</p>
                        </div>
                        {expandedClaimId === claim.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedClaimId === claim.id && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.dateOfLoss', 'Date of Loss')}</p>
                          <p className="font-medium">{formatDate(claim.dateOfLoss)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.dateReported', 'Date Reported')}</p>
                          <p className="font-medium">{formatDate(claim.dateReported)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.approvedAmount', 'Approved Amount')}</p>
                          <p className="font-medium">{formatCurrency(claim.approvedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.paidAmount', 'Paid Amount')}</p>
                          <p className="font-medium">{formatCurrency(claim.paidAmount)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('tools.claimsProcessing.description', 'Description')}</p>
                        <p className="text-sm">{claim.description || 'No description provided'}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus(claim.id, 'under_review')}
                          className="px-3 py-1.5 text-sm bg-yellow-500/10 text-yellow-600 rounded-lg hover:bg-yellow-500/20"
                        >
                          {t('tools.claimsProcessing.startReview', 'Start Review')}
                        </button>
                        <button
                          onClick={() => {
                            const amount = prompt('Enter approved amount:', claim.claimAmount.toString());
                            if (amount) handleApproveClaim(claim, parseFloat(amount));
                          }}
                          className="px-3 py-1.5 text-sm bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20"
                        >
                          {t('tools.claimsProcessing.approve', 'Approve')}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(claim.id, 'denied')}
                          className="px-3 py-1.5 text-sm bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20"
                        >
                          {t('tools.claimsProcessing.deny', 'Deny')}
                        </button>
                        {claim.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowPaymentForm(true);
                            }}
                            className="px-3 py-1.5 text-sm bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500/20"
                          >
                            {t('tools.claimsProcessing.addPayment2', 'Add Payment')}
                          </button>
                        )}
                        <div className="flex-1" />
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Notes section */}
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-2">{t('tools.claimsProcessing.notes', 'Notes')}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder={t('tools.claimsProcessing.addANote', 'Add a note...')}
                            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
                          />
                          <button
                            onClick={() => handleAddNote(claim.id)}
                            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                          >
                            {t('tools.claimsProcessing.add', 'Add')}
                          </button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {notes
                            .filter((n) => n.claimId === claim.id)
                            .map((note) => (
                              <div key={note.id} className="p-2 bg-muted/50 rounded-lg text-sm">
                                <div className="flex justify-between text-muted-foreground text-xs mb-1">
                                  <span>{note.author}</span>
                                  <span>{formatDate(note.timestamp)}</span>
                                </div>
                                <p>{note.content}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Processing Queue Tab */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Processing Queue ({processingQueue.length})</h2>
          {processingQueue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">{t('tools.claimsProcessing.allClaimsHaveBeenProcessed', 'All claims have been processed!')}</p>
              </CardContent>
            </Card>
          ) : (
            processingQueue.map((claim) => (
              <Card key={claim.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${PRIORITY_CONFIG[claim.priority].color}`}>
                        {claim.priority === 'urgent' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{claim.claimNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {getClaimantName(claim.claimantId)} - {formatCurrency(claim.claimAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_CONFIG[claim.status].color}`}>
                        {STATUS_CONFIG[claim.status].label}
                      </span>
                      <button
                        onClick={() => {
                          setExpandedClaimId(claim.id);
                          setActiveTab('claims');
                        }}
                        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        {t('tools.claimsProcessing.process', 'Process')}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('tools.claimsProcessing.recentPayments', 'Recent Payments')}</h2>
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('tools.claimsProcessing.noPaymentsRecordedYet', 'No payments recorded yet')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => {
                const claim = claims.find((c) => c.id === payment.claimId);
                return (
                  <Card key={payment.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {claim?.claimNumber} - {payment.payee}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{payment.paymentMethod}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.claimsProcessing.claimsByStatus', 'Claims by Status')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${analytics.totalClaims > 0 ? (analytics.byStatus[status as ClaimStatus] / analytics.totalClaims) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{analytics.byStatus[status as ClaimStatus]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.claimsProcessing.claimsByType', 'Claims by Type')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CLAIM_TYPES.map(({ type, label }) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${analytics.totalClaims > 0 ? (analytics.byType[type] / analytics.totalClaims) * 100 : 0}%`,
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
              <CardTitle className="text-lg">{t('tools.claimsProcessing.financialSummary', 'Financial Summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.totalClaimed', 'Total Claimed')}</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.totalClaimAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.totalApproved', 'Total Approved')}</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.totalApproved)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.totalPaid2', 'Total Paid')}</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.claimsProcessing.avgProcessingDays', 'Avg Processing Days')}</p>
                  <p className="text-xl font-bold">{analytics.avgProcessingDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Claim Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.claimsProcessing.fileNewClaim', 'File New Claim')}</CardTitle>
              <button onClick={() => setShowClaimForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Claimant selection or creation */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.claimant', 'Claimant')}</label>
                <select
                  value={claimForm.claimantId || ''}
                  onChange={(e) => {
                    const claimant = claimants.find((c) => c.id === e.target.value);
                    setClaimForm({
                      ...claimForm,
                      claimantId: e.target.value,
                      policyNumber: claimant?.policyNumber || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">{t('tools.claimsProcessing.selectClaimantOrAddNew', 'Select claimant or add new')}</option>
                  {claimants.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              {/* New claimant form */}
              {!claimForm.claimantId && (
                <div className="p-3 border border-border rounded-lg space-y-3">
                  <p className="text-sm font-medium">{t('tools.claimsProcessing.addNewClaimant', 'Add New Claimant')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t('tools.claimsProcessing.firstName', 'First Name')}
                      value={claimantForm.firstName || ''}
                      onChange={(e) => setClaimantForm({ ...claimantForm, firstName: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.claimsProcessing.lastName', 'Last Name')}
                      value={claimantForm.lastName || ''}
                      onChange={(e) => setClaimantForm({ ...claimantForm, lastName: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('tools.claimsProcessing.policyNumber', 'Policy Number')}
                    value={claimantForm.policyNumber || ''}
                    onChange={(e) => setClaimantForm({ ...claimantForm, policyNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                  <button
                    onClick={handleAddClaimant}
                    className="w-full px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80"
                  >
                    {t('tools.claimsProcessing.addClaimant', 'Add Claimant')}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.claimType', 'Claim Type')}</label>
                  <select
                    value={claimForm.claimType}
                    onChange={(e) => setClaimForm({ ...claimForm, claimType: e.target.value as ClaimType })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {CLAIM_TYPES.map(({ type, label }) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.priority', 'Priority')}</label>
                  <select
                    value={claimForm.priority}
                    onChange={(e) => setClaimForm({ ...claimForm, priority: e.target.value as ClaimPriority })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                      <option key={priority} value={priority}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.dateOfLoss2', 'Date of Loss')}</label>
                <input
                  type="date"
                  value={claimForm.dateOfLoss?.split('T')[0] || ''}
                  onChange={(e) => setClaimForm({ ...claimForm, dateOfLoss: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.claimAmount', 'Claim Amount')}</label>
                  <input
                    type="number"
                    value={claimForm.claimAmount || 0}
                    onChange={(e) => setClaimForm({ ...claimForm, claimAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.deductible', 'Deductible')}</label>
                  <input
                    type="number"
                    value={claimForm.deductible || 500}
                    onChange={(e) => setClaimForm({ ...claimForm, deductible: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.adjuster', 'Adjuster')}</label>
                <select
                  value={claimForm.adjusterAssigned || ''}
                  onChange={(e) => setClaimForm({ ...claimForm, adjusterAssigned: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">{t('tools.claimsProcessing.assignAdjuster', 'Assign adjuster')}</option>
                  {ADJUSTERS.map((adj) => (
                    <option key={adj} value={adj}>{adj}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.description2', 'Description')}</label>
                <textarea
                  value={claimForm.description || ''}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background h-20"
                  placeholder={t('tools.claimsProcessing.describeTheIncident', 'Describe the incident...')}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowClaimForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.claimsProcessing.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddClaim}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.claimsProcessing.fileClaim', 'File Claim')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentForm && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.claimsProcessing.addPayment', 'Add Payment')}</CardTitle>
              <button onClick={() => setShowPaymentForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Claim: {selectedClaim.claimNumber}</p>
                <p className="text-sm">Approved: {formatCurrency(selectedClaim.approvedAmount)}</p>
                <p className="text-sm">Already Paid: {formatCurrency(selectedClaim.paidAmount)}</p>
                <p className="text-sm font-medium">Remaining: {formatCurrency(selectedClaim.approvedAmount - selectedClaim.paidAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.amount', 'Amount')}</label>
                <input
                  type="number"
                  value={paymentForm.amount || 0}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.paymentMethod', 'Payment Method')}</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="check">{t('tools.claimsProcessing.check', 'Check')}</option>
                  <option value="ach">{t('tools.claimsProcessing.achTransfer', 'ACH Transfer')}</option>
                  <option value="wire">{t('tools.claimsProcessing.wireTransfer', 'Wire Transfer')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.claimsProcessing.payeeName', 'Payee Name')}</label>
                <input
                  type="text"
                  value={paymentForm.payee}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payee: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder={t('tools.claimsProcessing.enterPayeeName', 'Enter payee name')}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.claimsProcessing.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddPayment}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.claimsProcessing.processPayment', 'Process Payment')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </>
  );
};

export default ClaimsProcessingTool;
