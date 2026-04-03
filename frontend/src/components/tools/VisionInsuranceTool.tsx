'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  FileText,
  CreditCard,
  RefreshCw,
  Building,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface VisionInsuranceToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  memberId: string;
  groupNumber: string;
  planType: string;
  insuranceProvider: string;
  subscriberName: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: string;
  terminationDate?: string;
  phone: string;
  email: string;
  createdAt: string;
}

interface InsurancePlan {
  id: string;
  providerId: string;
  planName: string;
  planType: 'basic' | 'enhanced' | 'premium';
  examCopay: number;
  frameAllowance: number;
  lensAllowance: number;
  contactLensAllowance: number;
  examFrequency: number; // months
  frameFrequency: number; // months
  lensFrequency: number; // months
  contactLensFrequency: number; // months
  outOfNetworkCoverage: number; // percentage
  notes: string;
}

interface InsuranceProvider {
  id: string;
  name: string;
  payerId: string;
  phone: string;
  website: string;
  portalUrl?: string;
  submissionMethod: 'electronic' | 'paper' | 'both';
  averagePaymentDays: number;
  createdAt: string;
}

interface EligibilityCheck {
  id: string;
  patientId: string;
  checkDate: string;
  status: 'verified' | 'pending' | 'denied' | 'expired';
  examEligible: boolean;
  examNextEligibleDate?: string;
  frameEligible: boolean;
  frameNextEligibleDate?: string;
  lensEligible: boolean;
  lensNextEligibleDate?: string;
  contactLensEligible: boolean;
  contactLensNextEligibleDate?: string;
  remainingFrameAllowance: number;
  remainingLensAllowance: number;
  remainingContactLensAllowance: number;
  notes: string;
  verifiedBy: string;
  createdAt: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  patientId: string;
  providerId: string;
  serviceDate: string;
  claimType: 'exam' | 'frame' | 'lens' | 'contact-lens' | 'medical';
  billedAmount: number;
  allowedAmount: number;
  patientResponsibility: number;
  insurancePayment: number;
  status: 'submitted' | 'pending' | 'approved' | 'denied' | 'paid' | 'appealed';
  submissionDate: string;
  paymentDate?: string;
  denialReason?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const INSURANCE_PROVIDERS = [
  { id: 'vsp', name: 'VSP Vision Care', payerId: 'VSP01' },
  { id: 'eyemed', name: 'EyeMed Vision Care', payerId: 'EYE01' },
  { id: 'davis', name: 'Davis Vision', payerId: 'DAV01' },
  { id: 'spectera', name: 'Spectera', payerId: 'SPE01' },
  { id: 'superior', name: 'Superior Vision', payerId: 'SUP01' },
  { id: 'humana', name: 'Humana Vision', payerId: 'HUM01' },
  { id: 'aetna', name: 'Aetna Vision', payerId: 'AET01' },
  { id: 'bcbs', name: 'Blue Cross Blue Shield', payerId: 'BCBS01' },
  { id: 'medicare', name: 'Medicare', payerId: 'MED01' },
  { id: 'medicaid', name: 'Medicaid', payerId: 'MCD01' },
];

const CLAIM_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'denied', label: 'Denied', color: 'red' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'appealed', label: 'Appealed', color: 'purple' },
];

const CLAIM_TYPES = [
  { value: 'exam', label: 'Eye Exam' },
  { value: 'frame', label: 'Frames' },
  { value: 'lens', label: 'Lenses' },
  { value: 'contact-lens', label: 'Contact Lenses' },
  { value: 'medical', label: 'Medical Eye Exam' },
];

// Column configuration for exports
const CLAIM_COLUMNS: ColumnConfig[] = [
  { key: 'claimNumber', header: 'Claim #', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'serviceDate', header: 'Service Date', type: 'date' },
  { key: 'claimType', header: 'Type', type: 'string' },
  { key: 'billedAmount', header: 'Billed', type: 'currency' },
  { key: 'allowedAmount', header: 'Allowed', type: 'currency' },
  { key: 'insurancePayment', header: 'Insurance Paid', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const PATIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'memberId', header: 'Member ID', type: 'string' },
  { key: 'insuranceProvider', header: 'Insurance', type: 'string' },
  { key: 'planType', header: 'Plan', type: 'string' },
];

const ELIGIBILITY_COLUMNS: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'checkDate', header: 'Check Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'examEligible', header: 'Exam Eligible', type: 'string' },
  { key: 'frameEligible', header: 'Frame Eligible', type: 'string' },
  { key: 'remainingFrameAllowance', header: 'Frame Allowance', type: 'currency' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateClaimNumber = () => `CLM-${Date.now().toString(36).toUpperCase()}`;

const formatDate = (dateString: string) => {
  if (!dateString) return '';
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
  }).format(amount);
};

// Main Component
export const VisionInsuranceTool: React.FC<VisionInsuranceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: patients,
    addItem: addPatientToBackend,
    updateItem: updatePatientBackend,
    deleteItem: deletePatientBackend,
    isSynced: patientsSynced,
    isSaving: patientsSaving,
    lastSaved: patientsLastSaved,
    syncError: patientsSyncError,
    forceSync: forcePatientsSync,
  } = useToolData<Patient>('vision-insurance-patients', [], PATIENT_COLUMNS);

  const {
    data: eligibilityChecks,
    addItem: addEligibilityCheckToBackend,
    updateItem: updateEligibilityCheckBackend,
    deleteItem: deleteEligibilityCheckBackend,
  } = useToolData<EligibilityCheck>('vision-eligibility', [], ELIGIBILITY_COLUMNS);

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
  } = useToolData<Claim>('vision-claims', [], CLAIM_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'eligibility' | 'claims' | 'patients' | 'analytics'>('eligibility');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New patient form state
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    memberId: '',
    groupNumber: '',
    planType: '',
    insuranceProvider: '',
    subscriberName: '',
    relationship: 'self',
    effectiveDate: '',
    phone: '',
    email: '',
  });

  // New eligibility check state
  const [newEligibility, setNewEligibility] = useState<Partial<EligibilityCheck>>({
    status: 'pending',
    examEligible: false,
    frameEligible: false,
    lensEligible: false,
    contactLensEligible: false,
    remainingFrameAllowance: 0,
    remainingLensAllowance: 0,
    remainingContactLensAllowance: 0,
    notes: '',
    verifiedBy: '',
  });

  // New claim form state
  const [newClaim, setNewClaim] = useState<Partial<Claim>>({
    claimType: 'exam',
    serviceDate: new Date().toISOString().split('T')[0],
    billedAmount: 0,
    allowedAmount: 0,
    patientResponsibility: 0,
    insurancePayment: 0,
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patient || params.memberId || params.insuranceData) {
        setNewPatient({
          ...newPatient,
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          memberId: params.memberId || '',
          insuranceProvider: params.insuranceProvider || params.insurance || '',
        });
        setShowPatientForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add patient
  const addPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.memberId) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Member ID)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const patient: Patient = {
      id: generateId(),
      firstName: newPatient.firstName || '',
      lastName: newPatient.lastName || '',
      dateOfBirth: newPatient.dateOfBirth || '',
      memberId: newPatient.memberId || '',
      groupNumber: newPatient.groupNumber || '',
      planType: newPatient.planType || '',
      insuranceProvider: newPatient.insuranceProvider || '',
      subscriberName: newPatient.subscriberName || '',
      relationship: newPatient.relationship || 'self',
      effectiveDate: newPatient.effectiveDate || '',
      phone: newPatient.phone || '',
      email: newPatient.email || '',
      createdAt: new Date().toISOString(),
    };

    addPatientToBackend(patient);
    setSelectedPatientId(patient.id);
    setShowPatientForm(false);
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      memberId: '',
      groupNumber: '',
      planType: '',
      insuranceProvider: '',
      subscriberName: '',
      relationship: 'self',
      effectiveDate: '',
      phone: '',
      email: '',
    });
  };

  // Add eligibility check
  const addEligibilityCheck = () => {
    if (!selectedPatientId) {
      setValidationMessage('Please select a patient first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const eligibility: EligibilityCheck = {
      id: generateId(),
      patientId: selectedPatientId,
      checkDate: new Date().toISOString(),
      status: (newEligibility.status as EligibilityCheck['status']) || 'pending',
      examEligible: newEligibility.examEligible || false,
      examNextEligibleDate: newEligibility.examNextEligibleDate,
      frameEligible: newEligibility.frameEligible || false,
      frameNextEligibleDate: newEligibility.frameNextEligibleDate,
      lensEligible: newEligibility.lensEligible || false,
      lensNextEligibleDate: newEligibility.lensNextEligibleDate,
      contactLensEligible: newEligibility.contactLensEligible || false,
      contactLensNextEligibleDate: newEligibility.contactLensNextEligibleDate,
      remainingFrameAllowance: newEligibility.remainingFrameAllowance || 0,
      remainingLensAllowance: newEligibility.remainingLensAllowance || 0,
      remainingContactLensAllowance: newEligibility.remainingContactLensAllowance || 0,
      notes: newEligibility.notes || '',
      verifiedBy: newEligibility.verifiedBy || '',
      createdAt: new Date().toISOString(),
    };

    addEligibilityCheckToBackend(eligibility);
    setShowEligibilityForm(false);
    resetEligibilityForm();
  };

  const resetEligibilityForm = () => {
    setNewEligibility({
      status: 'pending',
      examEligible: false,
      frameEligible: false,
      lensEligible: false,
      contactLensEligible: false,
      remainingFrameAllowance: 0,
      remainingLensAllowance: 0,
      remainingContactLensAllowance: 0,
      notes: '',
      verifiedBy: '',
    });
  };

  // Add claim
  const addClaim = () => {
    if (!selectedPatientId) {
      setValidationMessage('Please select a patient first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatientId);
    const provider = INSURANCE_PROVIDERS.find((p) => p.name === patient?.insuranceProvider);

    const claim: Claim = {
      id: generateId(),
      claimNumber: generateClaimNumber(),
      patientId: selectedPatientId,
      providerId: provider?.id || '',
      serviceDate: newClaim.serviceDate || new Date().toISOString(),
      claimType: (newClaim.claimType as Claim['claimType']) || 'exam',
      billedAmount: newClaim.billedAmount || 0,
      allowedAmount: newClaim.allowedAmount || 0,
      patientResponsibility: newClaim.patientResponsibility || 0,
      insurancePayment: newClaim.insurancePayment || 0,
      status: 'submitted',
      submissionDate: new Date().toISOString(),
      notes: newClaim.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addClaimToBackend(claim);
    setShowClaimForm(false);
    resetClaimForm();
  };

  const resetClaimForm = () => {
    setNewClaim({
      claimType: 'exam',
      serviceDate: new Date().toISOString().split('T')[0],
      billedAmount: 0,
      allowedAmount: 0,
      patientResponsibility: 0,
      insurancePayment: 0,
      notes: '',
    });
  };

  // Update claim status
  const updateClaimStatus = (claimId: string, status: Claim['status']) => {
    const updates: Partial<Claim> = { status, updatedAt: new Date().toISOString() };
    if (status === 'paid') {
      updates.paymentDate = new Date().toISOString();
    }
    updateClaimBackend(claimId, updates);
  };

  // Delete claim
  const deleteClaim = async (claimId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this claim?');
    if (confirmed) {
      deleteClaimBackend(claimId);
    }
  };

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const patient = patients.find((p) => p.id === claim.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        patientName.includes(searchTerm.toLowerCase()) ||
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [claims, patients, searchTerm, filterStatus]);

  // Analytics
  const analytics = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const monthlyClaims = claims.filter((c) => new Date(c.submissionDate) >= thisMonth);
    const monthlyBilled = monthlyClaims.reduce((sum, c) => sum + c.billedAmount, 0);
    const monthlyCollected = monthlyClaims.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.insurancePayment, 0);

    const pendingClaims = claims.filter((c) => c.status === 'pending' || c.status === 'submitted');
    const pendingAmount = pendingClaims.reduce((sum, c) => sum + c.billedAmount, 0);

    const deniedClaims = claims.filter((c) => c.status === 'denied');
    const denialRate = claims.length > 0 ? (deniedClaims.length / claims.length) * 100 : 0;

    const avgDaysToPayment = claims
      .filter((c) => c.status === 'paid' && c.paymentDate)
      .reduce((sum, c) => {
        const days = Math.floor((new Date(c.paymentDate!).getTime() - new Date(c.submissionDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / claims.filter((c) => c.status === 'paid').length || 0;

    return {
      totalClaims: claims.length,
      monthlyBilled,
      monthlyCollected,
      pendingClaims: pendingClaims.length,
      pendingAmount,
      denialRate,
      avgDaysToPayment: Math.round(avgDaysToPayment),
      verifiedPatients: eligibilityChecks.filter((e) => e.status === 'verified').length,
    };
  }, [claims, eligibilityChecks]);

  const getStatusColor = (status: string) => {
    const statusConfig = CLAIM_STATUSES.find((s) => s.value === status);
    switch (statusConfig?.color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-700';
      case 'blue':
        return 'bg-blue-100 text-blue-700';
      case 'green':
        return 'bg-green-100 text-green-700';
      case 'red':
        return 'bg-red-100 text-red-700';
      case 'purple':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.visionInsurance.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.visionInsurance.visionInsuranceVerification', 'Vision Insurance Verification')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.visionInsurance.verifyEligibilityTrackClaimsAnd', 'Verify eligibility, track claims, and manage insurance billing')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="vision-insurance" toolName="Vision Insurance" />

              <SyncStatus
                isSynced={claimsSynced}
                isSaving={claimsSaving}
                lastSaved={claimsLastSaved}
                syncError={claimsSyncError}
                onForceSync={forceClaimsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = claims.map((c) => {
                    const patient = patients.find((p) => p.id === c.patientId);
                    return {
                      ...c,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  exportToCSV(exportData, CLAIM_COLUMNS, { filename: 'vision-insurance-claims' });
                }}
                onExportExcel={() => {
                  const exportData = claims.map((c) => {
                    const patient = patients.find((p) => p.id === c.patientId);
                    return {
                      ...c,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  exportToExcel(exportData, CLAIM_COLUMNS, { filename: 'vision-insurance-claims' });
                }}
                onExportJSON={() => {
                  const exportData = claims.map((c) => {
                    const patient = patients.find((p) => p.id === c.patientId);
                    return {
                      ...c,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  exportToJSON(exportData, { filename: 'vision-insurance-claims' });
                }}
                onExportPDF={async () => {
                  const exportData = claims.map((c) => {
                    const patient = patients.find((p) => p.id === c.patientId);
                    return {
                      ...c,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  await exportToPDF(exportData, CLAIM_COLUMNS, {
                    filename: 'vision-insurance-claims',
                    title: 'Vision Insurance Claims Report',
                    subtitle: `${claims.length} claims | Billed: ${formatCurrency(analytics.monthlyBilled)}`,
                  });
                }}
                onPrint={() => {
                  const exportData = claims.map((c) => {
                    const patient = patients.find((p) => p.id === c.patientId);
                    return {
                      ...c,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  printData(exportData, CLAIM_COLUMNS, { title: 'Vision Insurance Claims' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = claims.map((c) => {
                    const patient = patients.find((p) => p.id === c.patientId);
                    return {
                      ...c,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  return await copyUtil(exportData, CLAIM_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visionInsurance.monthlyBilled', 'Monthly Billed')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.monthlyBilled)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visionInsurance.collected', 'Collected')}</p>
              <p className={`text-xl font-bold text-green-500`}>
                {formatCurrency(analytics.monthlyCollected)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visionInsurance.pending', 'Pending')}</p>
              <p className={`text-xl font-bold text-yellow-500`}>
                {analytics.pendingClaims}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visionInsurance.denialRate', 'Denial Rate')}</p>
              <p className={`text-xl font-bold ${analytics.denialRate > 10 ? 'text-red-500' : 'text-green-500'}`}>
                {analytics.denialRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'eligibility', label: 'Eligibility', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'claims', label: 'Claims', icon: <FileText className="w-4 h-4" /> },
              { id: 'patients', label: 'Patients', icon: <User className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <Building className="w-4 h-4" /> },
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

        {/* Eligibility Tab */}
        {activeTab === 'eligibility' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.visionInsurance.eligibilityVerification', 'Eligibility Verification')}
              </h2>
              <button
                onClick={() => setShowEligibilityForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.visionInsurance.newVerification', 'New Verification')}
              </button>
            </div>

            <div className="grid gap-4">
              {eligibilityChecks.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <Shield className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.visionInsurance.noEligibilityChecksYetVerify', 'No eligibility checks yet. Verify a patient\'s insurance eligibility.')}
                  </p>
                </div>
              ) : (
                eligibilityChecks.map((check) => {
                  const patient = patients.find((p) => p.id === check.patientId);
                  return (
                    <div
                      key={check.id}
                      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            check.status === 'verified' ? 'bg-green-100 text-green-600' :
                            check.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {check.status === 'verified' ? <CheckCircle className="w-5 h-5" /> :
                             check.status === 'pending' ? <Clock className="w-5 h-5" /> :
                             <XCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Checked: {formatDate(check.checkDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.exam', 'Exam')}</p>
                              {check.examEligible ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </div>
                            <div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.frames', 'Frames')}</p>
                              {check.frameEligible ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </div>
                            <div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.lenses', 'Lenses')}</p>
                              {check.lensEligible ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </div>
                            <div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.contacts', 'Contacts')}</p>
                              {check.contactLensEligible ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.visionInsurance.frameAllowance', 'Frame Allowance')}
                            </p>
                            <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(check.remainingFrameAllowance)}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteEligibilityCheckBackend(check.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.visionInsurance.searchClaims', 'Search claims...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
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
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.visionInsurance.allStatuses', 'All Statuses')}</option>
                  {CLAIM_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowClaimForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.visionInsurance.newClaim', 'New Claim')}
                </button>
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              {filteredClaims.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.visionInsurance.noClaimsFoundSubmitA', 'No claims found. Submit a new insurance claim.')}
                  </p>
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const patient = patients.find((p) => p.id === claim.patientId);
                  return (
                    <div
                      key={claim.id}
                      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(claim.status)}`}>
                            {CLAIM_STATUSES.find((s) => s.value === claim.status)?.label}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {claim.claimNumber}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'} - {CLAIM_TYPES.find((t) => t.value === claim.claimType)?.label}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.billed', 'Billed')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(claim.billedAmount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.allowed', 'Allowed')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(claim.allowedAmount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.visionInsurance.insPayment', 'Ins. Payment')}</p>
                            <p className={`font-medium text-green-500`}>
                              {formatCurrency(claim.insurancePayment)}
                            </p>
                          </div>
                          <div>
                            <select
                              value={claim.status}
                              onChange={(e) => updateClaimStatus(claim.id, e.target.value as Claim['status'])}
                              className={`text-sm px-2 py-1 rounded border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            >
                              {CLAIM_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => deleteClaim(claim.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.visionInsurance.insurancePatients', 'Insurance Patients')}
              </h2>
              <button
                onClick={() => setShowPatientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.visionInsurance.addPatient', 'Add Patient')}
              </button>
            </div>

            <div className="grid gap-4">
              {patients.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.visionInsurance.noPatientsYetAddA', 'No patients yet. Add a patient with insurance information.')}
                  </p>
                </div>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                          <CreditCard className="w-5 h-5 text-[#0D9488]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Member ID: {patient.memberId} | Group: {patient.groupNumber || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {patient.insuranceProvider}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {patient.planType}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setShowEligibilityForm(true);
                          }}
                          className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                          title={t('tools.visionInsurance.checkEligibility', 'Check Eligibility')}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setShowClaimForm(true);
                          }}
                          className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                          title={t('tools.visionInsurance.newClaim2', 'New Claim')}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePatientBackend(patient.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.visionInsurance.totalClaims', 'Total Claims')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalClaims}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.visionInsurance.pendingAmount', 'Pending Amount')}</h3>
              </div>
              <p className={`text-3xl font-bold text-yellow-500`}>
                {formatCurrency(analytics.pendingAmount)}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.visionInsurance.avgDaysToPay', 'Avg Days to Pay')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.avgDaysToPayment}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.visionInsurance.verifiedPatients', 'Verified Patients')}</h3>
              </div>
              <p className={`text-3xl font-bold text-green-500`}>
                {analytics.verifiedPatients}
              </p>
            </div>
          </div>
        )}

        {/* Patient Form Modal */}
        {showPatientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.visionInsurance.addInsurancePatient', 'Add Insurance Patient')}
                  </h2>
                  <button
                    onClick={() => setShowPatientForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.firstName', 'First Name *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.lastName', 'Last Name *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.memberId', 'Member ID *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.memberId}
                        onChange={(e) => setNewPatient({ ...newPatient, memberId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.groupNumber', 'Group Number')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.groupNumber}
                        onChange={(e) => setNewPatient({ ...newPatient, groupNumber: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.insuranceProvider', 'Insurance Provider')}
                      </label>
                      <select
                        value={newPatient.insuranceProvider}
                        onChange={(e) => setNewPatient({ ...newPatient, insuranceProvider: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.visionInsurance.selectProvider', 'Select provider...')}</option>
                        {INSURANCE_PROVIDERS.map((provider) => (
                          <option key={provider.id} value={provider.name}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.planType', 'Plan Type')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.planType}
                        onChange={(e) => setNewPatient({ ...newPatient, planType: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.dateOfBirth', 'Date of Birth')}
                      </label>
                      <input
                        type="date"
                        value={newPatient.dateOfBirth}
                        onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.effectiveDate', 'Effective Date')}
                      </label>
                      <input
                        type="date"
                        value={newPatient.effectiveDate}
                        onChange={(e) => setNewPatient({ ...newPatient, effectiveDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowPatientForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.visionInsurance.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addPatient}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.visionInsurance.addPatient2', 'Add Patient')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Form Modal */}
        {showEligibilityForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.visionInsurance.eligibilityVerification2', 'Eligibility Verification')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEligibilityForm(false);
                      resetEligibilityForm();
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visionInsurance.selectPatient', 'Select Patient *')}
                    </label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="">{t('tools.visionInsurance.selectAPatient', 'Select a patient...')}</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} - {p.memberId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.status', 'Status')}
                      </label>
                      <select
                        value={newEligibility.status}
                        onChange={(e) => setNewEligibility({ ...newEligibility, status: e.target.value as EligibilityCheck['status'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="pending">{t('tools.visionInsurance.pending2', 'Pending')}</option>
                        <option value="verified">{t('tools.visionInsurance.verified', 'Verified')}</option>
                        <option value="denied">{t('tools.visionInsurance.denied', 'Denied')}</option>
                        <option value="expired">{t('tools.visionInsurance.expired', 'Expired')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.verifiedBy', 'Verified By')}
                      </label>
                      <input
                        type="text"
                        value={newEligibility.verifiedBy}
                        onChange={(e) => setNewEligibility({ ...newEligibility, verifiedBy: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEligibility.examEligible}
                        onChange={(e) => setNewEligibility({ ...newEligibility, examEligible: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.visionInsurance.examEligible', 'Exam Eligible')}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEligibility.frameEligible}
                        onChange={(e) => setNewEligibility({ ...newEligibility, frameEligible: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.visionInsurance.frameEligible', 'Frame Eligible')}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEligibility.lensEligible}
                        onChange={(e) => setNewEligibility({ ...newEligibility, lensEligible: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.visionInsurance.lensEligible', 'Lens Eligible')}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEligibility.contactLensEligible}
                        onChange={(e) => setNewEligibility({ ...newEligibility, contactLensEligible: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.visionInsurance.contactLensEligible', 'Contact Lens Eligible')}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.frameAllowance2', 'Frame Allowance')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newEligibility.remainingFrameAllowance}
                        onChange={(e) => setNewEligibility({ ...newEligibility, remainingFrameAllowance: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.lensAllowance', 'Lens Allowance')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newEligibility.remainingLensAllowance}
                        onChange={(e) => setNewEligibility({ ...newEligibility, remainingLensAllowance: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.contactAllowance', 'Contact Allowance')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newEligibility.remainingContactLensAllowance}
                        onChange={(e) => setNewEligibility({ ...newEligibility, remainingContactLensAllowance: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visionInsurance.notes', 'Notes')}
                    </label>
                    <textarea
                      value={newEligibility.notes}
                      onChange={(e) => setNewEligibility({ ...newEligibility, notes: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEligibilityForm(false);
                      resetEligibilityForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.visionInsurance.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addEligibilityCheck}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.visionInsurance.saveVerification', 'Save Verification')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Form Modal */}
        {showClaimForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.visionInsurance.submitInsuranceClaim', 'Submit Insurance Claim')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowClaimForm(false);
                      resetClaimForm();
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.selectPatient2', 'Select Patient *')}
                      </label>
                      <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.visionInsurance.selectAPatient2', 'Select a patient...')}</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} - {p.insuranceProvider}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.claimType', 'Claim Type')}
                      </label>
                      <select
                        value={newClaim.claimType}
                        onChange={(e) => setNewClaim({ ...newClaim, claimType: e.target.value as Claim['claimType'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {CLAIM_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visionInsurance.serviceDate', 'Service Date')}
                    </label>
                    <input
                      type="date"
                      value={newClaim.serviceDate}
                      onChange={(e) => setNewClaim({ ...newClaim, serviceDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.billedAmount', 'Billed Amount ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newClaim.billedAmount}
                        onChange={(e) => setNewClaim({ ...newClaim, billedAmount: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.allowedAmount', 'Allowed Amount ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newClaim.allowedAmount}
                        onChange={(e) => setNewClaim({ ...newClaim, allowedAmount: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.patientResponsibility', 'Patient Responsibility ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newClaim.patientResponsibility}
                        onChange={(e) => setNewClaim({ ...newClaim, patientResponsibility: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.visionInsurance.insurancePayment', 'Insurance Payment ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newClaim.insurancePayment}
                        onChange={(e) => setNewClaim({ ...newClaim, insurancePayment: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visionInsurance.notes2', 'Notes')}
                    </label>
                    <textarea
                      value={newClaim.notes}
                      onChange={(e) => setNewClaim({ ...newClaim, notes: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowClaimForm(false);
                      resetClaimForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.visionInsurance.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={addClaim}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.visionInsurance.submitClaim', 'Submit Claim')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionInsuranceTool;
