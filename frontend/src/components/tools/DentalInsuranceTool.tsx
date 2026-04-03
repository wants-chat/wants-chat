'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Shield,
  User,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  CreditCard,
  Building2,
  Percent,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired';
type ClaimStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'denied' | 'paid' | 'appealed';
type CoverageType = 'preventive' | 'basic' | 'major' | 'orthodontic';

interface InsurancePlan {
  id: string;
  carrierId: string;
  carrierName: string;
  planName: string;
  groupNumber: string;
  effectiveDate: string;
  terminationDate?: string;
  annualMax: number;
  deductibleIndividual: number;
  deductibleFamily: number;
  preventiveCoverage: number;
  basicCoverage: number;
  majorCoverage: number;
  orthodonticCoverage: number;
  orthodonticMax: number;
  waitingPeriods: {
    preventive: number;
    basic: number;
    major: number;
    orthodontic: number;
  };
  frequencyLimits: {
    examPerYear: number;
    cleaningsPerYear: number;
    bitewingsPerYear: number;
    fullMouthXrays: number; // months
  };
}

interface PatientInsurance {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  subscriberId: string;
  subscriberName: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  plan: InsurancePlan;
  usedBenefits: number;
  remainingBenefits: number;
  deductibleMet: number;
  lastVerified?: string;
  verificationStatus: VerificationStatus;
  notes: string;
}

interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  claimNumber: string;
  dateOfService: string;
  procedureCodes: string[];
  totalCharged: number;
  insuranceEstimate: number;
  insurancePaid: number;
  patientResponsibility: number;
  status: ClaimStatus;
  submittedDate?: string;
  processedDate?: string;
  checkNumber?: string;
  denialReason?: string;
  notes: string;
}

interface Predetermination {
  id: string;
  patientId: string;
  patientName: string;
  procedures: {
    code: string;
    description: string;
    fee: number;
    estimatedCoverage: number;
  }[];
  totalFee: number;
  estimatedInsurance: number;
  estimatedPatient: number;
  submittedDate: string;
  responseDate?: string;
  status: 'pending' | 'approved' | 'partial' | 'denied';
  expiresDate?: string;
  notes: string;
}

type TabType = 'verification' | 'claims' | 'predeterminations' | 'analytics';

const INSURANCE_CARRIERS = [
  { id: 'delta', name: 'Delta Dental' },
  { id: 'metlife', name: 'MetLife' },
  { id: 'cigna', name: 'Cigna' },
  { id: 'aetna', name: 'Aetna' },
  { id: 'guardian', name: 'Guardian' },
  { id: 'united', name: 'United Healthcare' },
  { id: 'humana', name: 'Humana' },
  { id: 'bcbs', name: 'Blue Cross Blue Shield' },
  { id: 'principal', name: 'Principal' },
  { id: 'ameritas', name: 'Ameritas' },
];

const DEFAULT_PLAN: InsurancePlan = {
  id: '',
  carrierId: '',
  carrierName: '',
  planName: '',
  groupNumber: '',
  effectiveDate: '',
  annualMax: 1500,
  deductibleIndividual: 50,
  deductibleFamily: 150,
  preventiveCoverage: 100,
  basicCoverage: 80,
  majorCoverage: 50,
  orthodonticCoverage: 50,
  orthodonticMax: 1500,
  waitingPeriods: {
    preventive: 0,
    basic: 6,
    major: 12,
    orthodontic: 12,
  },
  frequencyLimits: {
    examPerYear: 2,
    cleaningsPerYear: 2,
    bitewingsPerYear: 1,
    fullMouthXrays: 60,
  },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configurations for export
const insuranceColumns: ColumnConfig[] = [
  { key: 'id', header: 'Record ID', type: 'string' },
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'carrierName', header: 'Carrier', type: 'string' },
  { key: 'subscriberId', header: 'Subscriber ID', type: 'string' },
  { key: 'annualMax', header: 'Annual Max', type: 'currency' },
  { key: 'usedBenefits', header: 'Used Benefits', type: 'currency' },
  { key: 'remainingBenefits', header: 'Remaining', type: 'currency' },
  { key: 'verificationStatus', header: 'Status', type: 'string' },
  { key: 'lastVerified', header: 'Last Verified', type: 'date' },
];

const claimColumns: ColumnConfig[] = [
  { key: 'claimNumber', header: 'Claim #', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'dateOfService', header: 'Service Date', type: 'date' },
  { key: 'totalCharged', header: 'Charged', type: 'currency' },
  { key: 'insurancePaid', header: 'Ins Paid', type: 'currency' },
  { key: 'patientResponsibility', header: 'Patient Owes', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

interface DentalInsuranceToolProps {
  uiConfig?: UIConfig;
}

export const DentalInsuranceTool: React.FC<DentalInsuranceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('verification');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientInsurance | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [newClaim, setNewClaim] = useState<Partial<InsuranceClaim>>({});

  // Initialize useToolData hooks for backend persistence
  const {
    data: insuranceRecords,
    addItem: addInsurance,
    updateItem: updateInsurance,
    deleteItem: deleteInsurance,
    isSynced: insuranceSynced,
    isSaving: insuranceSaving,
    lastSaved: insuranceLastSaved,
    syncError: insuranceSyncError,
    forceSync: forceInsuranceSync,
  } = useToolData<PatientInsurance>(
    'dental-insurance',
    [],
    insuranceColumns,
    { autoSave: true }
  );

  const {
    data: claims,
    addItem: addClaim,
    updateItem: updateClaim,
    deleteItem: deleteClaim,
  } = useToolData<InsuranceClaim>(
    'dental-claims',
    [],
    claimColumns,
    { autoSave: true }
  );

  const {
    data: predeterminations,
    addItem: addPredetermination,
    updateItem: updatePredetermination,
    deleteItem: deletePredetermination,
  } = useToolData<Predetermination>(
    'dental-predeterminations',
    [],
    [],
    { autoSave: true }
  );

  // Form state for new insurance record
  const [newInsurance, setNewInsurance] = useState<Partial<PatientInsurance>>({
    plan: { ...DEFAULT_PLAN },
  });

  // Export handlers
  const handleExportCSV = () => {
    const exportData = insuranceRecords.map(record => ({
      ...record,
      carrierName: record.plan.carrierName,
      annualMax: record.plan.annualMax,
    }));
    exportToCSV(exportData, insuranceColumns, { filename: 'dental-insurance-export' });
  };

  const handleExportExcel = () => {
    const exportData = insuranceRecords.map(record => ({
      ...record,
      carrierName: record.plan.carrierName,
      annualMax: record.plan.annualMax,
    }));
    exportToExcel(exportData, insuranceColumns, { filename: 'dental-insurance-export' });
  };

  const handleExportJSON = () => {
    exportToJSON({ insuranceRecords, claims, predeterminations }, { filename: 'dental-insurance-export' });
  };

  const handleExportPDF = async () => {
    const exportData = insuranceRecords.map(record => ({
      ...record,
      carrierName: record.plan.carrierName,
      annualMax: record.plan.annualMax,
    }));
    await exportToPDF(exportData, insuranceColumns, {
      filename: 'dental-insurance-export',
      title: 'Dental Insurance Records',
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const exportData = insuranceRecords.map(record => ({
      ...record,
      carrierName: record.plan.carrierName,
      annualMax: record.plan.annualMax,
    }));
    return copyUtil(exportData, insuranceColumns);
  };

  const handlePrint = () => {
    const exportData = insuranceRecords.map(record => ({
      ...record,
      carrierName: record.plan.carrierName,
      annualMax: record.plan.annualMax,
    }));
    printData(exportData, insuranceColumns, { title: 'Dental Insurance Records' });
  };

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patientName) {
        setNewInsurance({
          ...newInsurance,
          patientName: params.patientName as string,
        });
        setShowAddForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter records based on search
  const filteredInsurance = insuranceRecords.filter(record =>
    record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.subscriberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.plan.carrierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClaims = claims.filter(claim =>
    claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new insurance record
  const handleAddInsurance = () => {
    if (!newInsurance.patientName || !newInsurance.subscriberId) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const record: PatientInsurance = {
      id: generateId(),
      patientId: generateId(),
      patientName: newInsurance.patientName || '',
      dateOfBirth: newInsurance.dateOfBirth || '',
      subscriberId: newInsurance.subscriberId || '',
      subscriberName: newInsurance.subscriberName || newInsurance.patientName || '',
      relationship: newInsurance.relationship || 'self',
      plan: {
        ...DEFAULT_PLAN,
        ...newInsurance.plan,
        id: generateId(),
      },
      usedBenefits: 0,
      remainingBenefits: newInsurance.plan?.annualMax || DEFAULT_PLAN.annualMax,
      deductibleMet: 0,
      verificationStatus: 'pending',
      notes: newInsurance.notes || '',
    };

    addInsurance(record);
    setNewInsurance({ plan: { ...DEFAULT_PLAN } });
    setShowAddForm(false);
  };

  // Verify insurance
  const handleVerifyInsurance = (recordId: string) => {
    // Simulate verification process
    updateInsurance(recordId, {
      verificationStatus: 'verified',
      lastVerified: new Date().toISOString(),
    });
  };

  // Submit claim
  const handleSubmitClaim = () => {
    if (!newClaim.patientName || !newClaim.dateOfService) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const claim: InsuranceClaim = {
      id: generateId(),
      patientId: newClaim.patientId || generateId(),
      patientName: newClaim.patientName || '',
      claimNumber: `CLM-${Date.now().toString().slice(-8)}`,
      dateOfService: newClaim.dateOfService || '',
      procedureCodes: newClaim.procedureCodes || [],
      totalCharged: newClaim.totalCharged || 0,
      insuranceEstimate: newClaim.insuranceEstimate || 0,
      insurancePaid: 0,
      patientResponsibility: newClaim.totalCharged || 0,
      status: 'draft',
      notes: newClaim.notes || '',
    };

    addClaim(claim);
    setNewClaim({});
    setShowClaimForm(false);
  };

  // Update claim status
  const handleUpdateClaimStatus = (claimId: string, status: ClaimStatus) => {
    const updates: Partial<InsuranceClaim> = { status };
    if (status === 'submitted') {
      updates.submittedDate = new Date().toISOString();
    } else if (status === 'paid' || status === 'approved' || status === 'denied') {
      updates.processedDate = new Date().toISOString();
    }
    updateClaim(claimId, updates);
  };

  // Analytics
  const getAnalytics = () => {
    const totalPatients = insuranceRecords.length;
    const verifiedCount = insuranceRecords.filter(r => r.verificationStatus === 'verified').length;
    const totalClaims = claims.length;
    const paidClaims = claims.filter(c => c.status === 'paid');
    const pendingClaims = claims.filter(c => c.status === 'pending' || c.status === 'submitted');
    const deniedClaims = claims.filter(c => c.status === 'denied');
    const totalBilled = claims.reduce((acc, c) => acc + c.totalCharged, 0);
    const totalCollected = paidClaims.reduce((acc, c) => acc + c.insurancePaid, 0);
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    return {
      totalPatients,
      verifiedCount,
      totalClaims,
      paidClaimsCount: paidClaims.length,
      pendingClaimsCount: pendingClaims.length,
      deniedClaimsCount: deniedClaims.length,
      totalBilled,
      totalCollected,
      collectionRate,
      avgClaimValue: totalClaims > 0 ? totalBilled / totalClaims : 0,
    };
  };

  const analytics = getAnalytics();

  const getStatusColor = (status: VerificationStatus | ClaimStatus) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      verified: '#10b981',
      failed: '#dc2626',
      expired: '#6b7280',
      draft: '#6b7280',
      submitted: '#3b82f6',
      approved: '#10b981',
      denied: '#dc2626',
      paid: '#059669',
      appealed: '#8b5cf6',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <Shield className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.dentalInsurance.dentalInsuranceVerification', 'Dental Insurance Verification')}
              </CardTitle>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.dentalInsurance.verifyCoverageAndManageClaims', 'Verify coverage and manage claims')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="dental-insurance" toolName="Dental Insurance" />

            <SyncStatus
              isSynced={insuranceSynced}
              isSaving={insuranceSaving}
              lastSaved={insuranceLastSaved}
              syncError={insuranceSyncError}
              onRetry={forceInsuranceSync}
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {(['verification', 'claims', 'predeterminations', 'analytics'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'bg-gray-800 text-white border-b-2 border-green-500'
                  : 'bg-white text-green-600 border-b-2 border-green-500'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4 space-y-4">
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.dentalInsurance.searchByPatientSubscriberId', 'Search by patient, subscriber ID, or carrier...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                {t('tools.dentalInsurance.addPatient', 'Add Patient')}
              </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dentalInsurance.addPatientInsurance', 'Add Patient Insurance')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dentalInsurance.patientName', 'Patient Name *')}
                    </label>
                    <input
                      type="text"
                      value={newInsurance.patientName || ''}
                      onChange={(e) => setNewInsurance({ ...newInsurance, patientName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dentalInsurance.subscriberId', 'Subscriber ID *')}
                    </label>
                    <input
                      type="text"
                      value={newInsurance.subscriberId || ''}
                      onChange={(e) => setNewInsurance({ ...newInsurance, subscriberId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dentalInsurance.insuranceCarrier', 'Insurance Carrier')}
                    </label>
                    <select
                      value={newInsurance.plan?.carrierId || ''}
                      onChange={(e) => {
                        const carrier = INSURANCE_CARRIERS.find(c => c.id === e.target.value);
                        setNewInsurance({
                          ...newInsurance,
                          plan: {
                            ...newInsurance.plan!,
                            carrierId: e.target.value,
                            carrierName: carrier?.name || '',
                          }
                        });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.dentalInsurance.selectCarrier', 'Select carrier...')}</option>
                      {INSURANCE_CARRIERS.map(carrier => (
                        <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dentalInsurance.groupNumber', 'Group Number')}
                    </label>
                    <input
                      type="text"
                      value={newInsurance.plan?.groupNumber || ''}
                      onChange={(e) => setNewInsurance({
                        ...newInsurance,
                        plan: { ...newInsurance.plan!, groupNumber: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dentalInsurance.annualMaximum', 'Annual Maximum ($)')}
                    </label>
                    <input
                      type="number"
                      value={newInsurance.plan?.annualMax || ''}
                      onChange={(e) => setNewInsurance({
                        ...newInsurance,
                        plan: { ...newInsurance.plan!, annualMax: parseFloat(e.target.value) || 0 }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dentalInsurance.relationship', 'Relationship')}
                    </label>
                    <select
                      value={newInsurance.relationship || 'self'}
                      onChange={(e) => setNewInsurance({ ...newInsurance, relationship: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="self">{t('tools.dentalInsurance.self', 'Self')}</option>
                      <option value="spouse">{t('tools.dentalInsurance.spouse', 'Spouse')}</option>
                      <option value="child">{t('tools.dentalInsurance.child', 'Child')}</option>
                      <option value="other">{t('tools.dentalInsurance.other', 'Other')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewInsurance({ plan: { ...DEFAULT_PLAN } });
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.dentalInsurance.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAddInsurance}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.dentalInsurance.addPatient2', 'Add Patient')}
                  </button>
                </div>
              </div>
            )}

            {/* Insurance Records List */}
            <div className="space-y-4">
              {filteredInsurance.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.dentalInsurance.noInsuranceRecordsFoundAdd', 'No insurance records found. Add a patient to get started.')}
                  </p>
                </div>
              ) : (
                filteredInsurance.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                          <Building2 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.patientName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {record.plan.carrierName} - ID: {record.subscriberId}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Group: {record.plan.groupNumber || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.annualMax', 'Annual Max')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${record.plan.annualMax.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.remaining', 'Remaining')}</p>
                          <p className={`font-medium ${record.remainingBenefits > 500 ? 'text-green-500' : 'text-orange-500'}`}>
                            ${record.remainingBenefits.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: getStatusColor(record.verificationStatus) }}
                        >
                          {record.verificationStatus}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyInsurance(record.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                            title={t('tools.dentalInsurance.verifyInsurance', 'Verify Insurance')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInsurance(record.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Coverage Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.preventive', 'Preventive')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.plan.preventiveCoverage}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.basic', 'Basic')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.plan.basicCoverage}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.major', 'Major')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.plan.majorCoverage}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.deductible', 'Deductible')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${record.plan.deductibleIndividual}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.dentalInsurance.searchClaims', 'Search claims...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowClaimForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                {t('tools.dentalInsurance.newClaim', 'New Claim')}
              </button>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.dentalInsurance.noClaimsFoundCreateA', 'No claims found. Create a new claim to get started.')}
                  </p>
                </div>
              ) : (
                filteredClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {claim.claimNumber}
                          </h3>
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: getStatusColor(claim.status) }}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {claim.patientName} - DOS: {new Date(claim.dateOfService).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${claim.totalCharged.toLocaleString()}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Ins Paid: ${claim.insurancePaid.toLocaleString()}
                          </p>
                        </div>
                        <select
                          value={claim.status}
                          onChange={(e) => handleUpdateClaimStatus(claim.id, e.target.value as ClaimStatus)}
                          className={`px-2 py-1 text-sm rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="draft">{t('tools.dentalInsurance.draft', 'Draft')}</option>
                          <option value="submitted">{t('tools.dentalInsurance.submitted', 'Submitted')}</option>
                          <option value="pending">{t('tools.dentalInsurance.pending', 'Pending')}</option>
                          <option value="approved">{t('tools.dentalInsurance.approved', 'Approved')}</option>
                          <option value="denied">{t('tools.dentalInsurance.denied', 'Denied')}</option>
                          <option value="paid">{t('tools.dentalInsurance.paid', 'Paid')}</option>
                          <option value="appealed">{t('tools.dentalInsurance.appealed', 'Appealed')}</option>
                        </select>
                        <button
                          onClick={() => deleteClaim(claim.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predeterminations Tab */}
      {activeTab === 'predeterminations' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="text-center py-12">
              <FileText className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {t('tools.dentalInsurance.predeterminationManagementComingSoon', 'Predetermination management coming soon.')}
              </p>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.dentalInsurance.submitTreatmentPlansForPre', 'Submit treatment plans for pre-approval from insurance carriers.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.dentalInsurance.insuranceAnalytics', 'Insurance Analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.totalPatients', 'Total Patients')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalPatients}
                </p>
                <p className={`text-sm text-green-500`}>
                  {analytics.verifiedCount} verified
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.totalClaims', 'Total Claims')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalClaims}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {analytics.pendingClaimsCount} pending
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.collectionRate', 'Collection Rate')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.collectionRate.toFixed(1)}%
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.totalBilled', 'Total Billed')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalBilled.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.totalCollected', 'Total Collected')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalCollected.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dentalInsurance.avgClaimValue', 'Avg Claim Value')}</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.avgClaimValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto max-w-sm p-4 rounded-lg bg-red-500 text-white shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{validationMessage}</p>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default DentalInsuranceTool;
