'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  ClipboardCheck,
  FileSearch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Shield,
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  Scale,
  Target,
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
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface UnderwritingReviewToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ApplicationType = 'auto' | 'home' | 'life' | 'health' | 'business';
type ReviewStatus = 'pending' | 'in_review' | 'info_needed' | 'approved' | 'declined' | 'referred';
type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  annualIncome: number;
  creditScore: number;
}

interface Application {
  id: string;
  applicationNumber: string;
  applicantId: string;
  applicationType: ApplicationType;
  status: ReviewStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  requestedCoverage: number;
  suggestedPremium: number;
  finalPremium: number;
  underwriterId: string;
  submittedDate: string;
  reviewStartDate: string;
  decisionDate: string;
  notes: string;
  flags: string[];
  createdAt: string;
  updatedAt: string;
}

interface RiskFactor {
  id: string;
  applicationId: string;
  category: string;
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  notes: string;
}

interface Underwriter {
  id: string;
  name: string;
  specialties: ApplicationType[];
  activeReviews: number;
  maxCapacity: number;
}

interface ReviewNote {
  id: string;
  applicationId: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'note' | 'decision' | 'request';
}

// Constants
const APPLICATION_TYPES: { type: ApplicationType; label: string }[] = [
  { type: 'auto', label: 'Auto Insurance' },
  { type: 'home', label: 'Home Insurance' },
  { type: 'life', label: 'Life Insurance' },
  { type: 'health', label: 'Health Insurance' },
  { type: 'business', label: 'Business Insurance' },
];

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Review', color: 'text-gray-500 bg-gray-500/10', icon: <Clock className="w-4 h-4" /> },
  in_review: { label: 'In Review', color: 'text-blue-500 bg-blue-500/10', icon: <FileSearch className="w-4 h-4" /> },
  info_needed: { label: 'Info Needed', color: 'text-orange-500 bg-orange-500/10', icon: <AlertTriangle className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'text-green-500 bg-green-500/10', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'text-red-500 bg-red-500/10', icon: <XCircle className="w-4 h-4" /> },
  referred: { label: 'Referred', color: 'text-purple-500 bg-purple-500/10', icon: <Scale className="w-4 h-4" /> },
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; range: string }> = {
  very_low: { label: 'Very Low', color: 'text-green-600 bg-green-500/10', range: '0-20' },
  low: { label: 'Low', color: 'text-green-500 bg-green-500/10', range: '21-40' },
  medium: { label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10', range: '41-60' },
  high: { label: 'High', color: 'text-orange-500 bg-orange-500/10', range: '61-80' },
  very_high: { label: 'Very High', color: 'text-red-500 bg-red-500/10', range: '81-100' },
};

const UNDERWRITERS: Underwriter[] = [
  { id: 'uw1', name: 'Jennifer Martinez', specialties: ['auto', 'home'], activeReviews: 12, maxCapacity: 20 },
  { id: 'uw2', name: 'Robert Chen', specialties: ['life', 'health'], activeReviews: 8, maxCapacity: 15 },
  { id: 'uw3', name: 'Amanda Foster', specialties: ['business'], activeReviews: 5, maxCapacity: 10 },
  { id: 'uw4', name: 'Michael Thompson', specialties: ['auto', 'home', 'business'], activeReviews: 15, maxCapacity: 25 },
];

const RISK_CATEGORIES = [
  'Credit History',
  'Claims History',
  'Driving Record',
  'Property Condition',
  'Health Status',
  'Occupation Risk',
  'Location Risk',
  'Coverage Amount',
];

// Column configuration for exports
const APPLICATION_COLUMNS: ColumnConfig[] = [
  { key: 'applicationNumber', header: 'Application #', type: 'string' },
  { key: 'applicantName', header: 'Applicant', type: 'string' },
  { key: 'applicationType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'riskLevel', header: 'Risk Level', type: 'string' },
  { key: 'riskScore', header: 'Risk Score', type: 'number' },
  { key: 'requestedCoverage', header: 'Coverage', type: 'currency' },
  { key: 'suggestedPremium', header: 'Suggested Premium', type: 'currency' },
  { key: 'underwriter', header: 'Underwriter', type: 'string' },
  { key: 'submittedDate', header: 'Submitted', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateAppNumber = () => `APP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

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

const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 20) return 'very_low';
  if (score <= 40) return 'low';
  if (score <= 60) return 'medium';
  if (score <= 80) return 'high';
  return 'very_high';
};

// Main Component
export const UnderwritingReviewTool: React.FC<UnderwritingReviewToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumModalApp, setPremiumModalApp] = useState<Application | null>(null);
  const [customPremium, setCustomPremium] = useState<string>('');

  // useToolData hooks for backend sync
  const {
    data: applicants,
    addItem: addApplicantToBackend,
    updateItem: updateApplicantBackend,
    deleteItem: deleteApplicantBackend,
    isSynced: applicantsSynced,
    isSaving: applicantsSaving,
    lastSaved: applicantsLastSaved,
    syncError: applicantsSyncError,
    forceSync: forceApplicantsSync,
  } = useToolData<Applicant>('underwriting-applicants', [], []);

  const {
    data: applications,
    addItem: addApplicationToBackend,
    updateItem: updateApplicationBackend,
    deleteItem: deleteApplicationBackend,
    isSynced: applicationsSynced,
    isSaving: applicationsSaving,
    lastSaved: applicationsLastSaved,
    syncError: applicationsSyncError,
    forceSync: forceApplicationsSync,
  } = useToolData<Application>('underwriting-applications', [], APPLICATION_COLUMNS);

  const {
    data: riskFactors,
    addItem: addRiskFactorToBackend,
    deleteItem: deleteRiskFactorBackend,
  } = useToolData<RiskFactor>('underwriting-risk-factors', [], []);

  const {
    data: reviewNotes,
    addItem: addReviewNoteToBackend,
  } = useToolData<ReviewNote>('underwriting-notes', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'queue' | 'applications' | 'analytics'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ApplicationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Form states
  const [applicationForm, setApplicationForm] = useState<Partial<Application>>({
    applicationType: 'auto',
    requestedCoverage: 100000,
    notes: '',
  });

  const [applicantForm, setApplicantForm] = useState<Partial<Applicant>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: '',
    annualIncome: 50000,
    creditScore: 700,
  });

  // Risk factor form
  const [riskFactorForm, setRiskFactorForm] = useState({
    category: RISK_CATEGORIES[0],
    factor: '',
    impact: 'neutral' as 'positive' | 'negative' | 'neutral',
    weight: 5,
    notes: '',
  });

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const applicant = applicants.find((a) => a.id === app.applicantId);
      const applicantName = applicant ? `${applicant.firstName} ${applicant.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicantName.includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || app.applicationType === filterType;
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesRisk = filterRisk === 'all' || app.riskLevel === filterRisk;

      return matchesSearch && matchesType && matchesStatus && matchesRisk;
    });
  }, [applications, applicants, searchTerm, filterType, filterStatus, filterRisk]);

  // Review queue - applications awaiting review
  const reviewQueue = useMemo(() => {
    return applications
      .filter((a) => ['pending', 'in_review', 'info_needed'].includes(a.status))
      .sort((a, b) => {
        // Sort by risk score descending, then by date ascending
        if (a.riskScore !== b.riskScore) {
          return b.riskScore - a.riskScore;
        }
        return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
      });
  }, [applications]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const declined = applications.filter((a) => a.status === 'declined').length;
    const pending = applications.filter((a) => ['pending', 'in_review', 'info_needed'].includes(a.status)).length;

    const avgRiskScore = applications.length > 0
      ? Math.round(applications.reduce((sum, a) => sum + a.riskScore, 0) / applications.length)
      : 0;

    const totalCoverage = applications
      .filter((a) => a.status === 'approved')
      .reduce((sum, a) => sum + a.requestedCoverage, 0);

    const totalPremium = applications
      .filter((a) => a.status === 'approved')
      .reduce((sum, a) => sum + a.finalPremium, 0);

    const byType: Record<ApplicationType, { total: number; approved: number }> = {
      auto: { total: 0, approved: 0 },
      home: { total: 0, approved: 0 },
      life: { total: 0, approved: 0 },
      health: { total: 0, approved: 0 },
      business: { total: 0, approved: 0 },
    };

    applications.forEach((a) => {
      byType[a.applicationType].total++;
      if (a.status === 'approved') byType[a.applicationType].approved++;
    });

    const avgProcessingDays = applications
      .filter((a) => a.decisionDate)
      .reduce((acc, a) => {
        const start = new Date(a.submittedDate);
        const end = new Date(a.decisionDate);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / Math.max(applications.filter((a) => a.decisionDate).length, 1);

    return {
      total,
      approved,
      declined,
      pending,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      avgRiskScore,
      totalCoverage,
      totalPremium,
      byType,
      avgProcessingDays: Math.round(avgProcessingDays),
    };
  }, [applications]);

  // Get applicant name
  const getApplicantName = (applicantId: string) => {
    const applicant = applicants.find((a) => a.id === applicantId);
    return applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown';
  };

  // Get underwriter name
  const getUnderwriterName = (underwriterId: string) => {
    const uw = UNDERWRITERS.find((u) => u.id === underwriterId);
    return uw ? uw.name : 'Unassigned';
  };

  // Calculate risk score from factors
  const calculateRiskScore = (appId: string): number => {
    const factors = riskFactors.filter((f) => f.applicationId === appId);
    if (factors.length === 0) return 50;

    let score = 50; // Base score
    factors.forEach((f) => {
      if (f.impact === 'negative') score += f.weight;
      else if (f.impact === 'positive') score -= f.weight;
    });

    return Math.max(0, Math.min(100, score));
  };

  // Add new applicant
  const handleAddApplicant = () => {
    if (!applicantForm.firstName || !applicantForm.lastName) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newApplicant: Applicant = {
      id: generateId(),
      firstName: applicantForm.firstName || '',
      lastName: applicantForm.lastName || '',
      email: applicantForm.email || '',
      phone: applicantForm.phone || '',
      dateOfBirth: applicantForm.dateOfBirth || '',
      occupation: applicantForm.occupation || '',
      annualIncome: applicantForm.annualIncome || 0,
      creditScore: applicantForm.creditScore || 700,
    };

    addApplicantToBackend(newApplicant);
    setApplicationForm({ ...applicationForm, applicantId: newApplicant.id });
    setApplicantForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      occupation: '',
      annualIncome: 50000,
      creditScore: 700,
    });
  };

  // Submit new application
  const handleSubmitApplication = () => {
    if (!applicationForm.applicantId) {
      setValidationMessage('Please select or add an applicant');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const riskScore = Math.floor(Math.random() * 60) + 20; // Simulated initial risk score

    const newApplication: Application = {
      id: generateId(),
      applicationNumber: generateAppNumber(),
      applicantId: applicationForm.applicantId || '',
      applicationType: applicationForm.applicationType as ApplicationType,
      status: 'pending',
      riskLevel: getRiskLevel(riskScore),
      riskScore,
      requestedCoverage: applicationForm.requestedCoverage || 100000,
      suggestedPremium: Math.round((applicationForm.requestedCoverage || 100000) * 0.02 * (1 + riskScore / 100)),
      finalPremium: 0,
      underwriterId: '',
      submittedDate: now.toISOString(),
      reviewStartDate: '',
      decisionDate: '',
      notes: applicationForm.notes || '',
      flags: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    addApplicationToBackend(newApplication);
    setShowApplicationForm(false);
    setApplicationForm({
      applicationType: 'auto',
      requestedCoverage: 100000,
      notes: '',
    });
  };

  // Start review
  const handleStartReview = (appId: string, underwriterId: string) => {
    updateApplicationBackend(appId, {
      status: 'in_review',
      underwriterId,
      reviewStartDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Make decision
  const handleDecision = (app: Application, decision: 'approved' | 'declined' | 'referred', finalPremium?: number) => {
    const updates: Partial<Application> = {
      status: decision,
      decisionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (decision === 'approved' && finalPremium !== undefined) {
      updates.finalPremium = finalPremium;
    }

    updateApplicationBackend(app.id, updates);

    addReviewNoteToBackend({
      id: generateId(),
      applicationId: app.id,
      author: getUnderwriterName(app.underwriterId) || 'System',
      content: `Application ${decision.toUpperCase()}${finalPremium ? ` with premium ${formatCurrency(finalPremium)}` : ''}`,
      timestamp: new Date().toISOString(),
      type: 'decision',
    });
  };

  // Add risk factor
  const handleAddRiskFactor = (appId: string) => {
    if (!riskFactorForm.factor.trim()) return;

    addRiskFactorToBackend({
      id: generateId(),
      applicationId: appId,
      category: riskFactorForm.category,
      factor: riskFactorForm.factor,
      impact: riskFactorForm.impact,
      weight: riskFactorForm.weight,
      notes: riskFactorForm.notes,
    });

    // Update risk score
    const newScore = calculateRiskScore(appId);
    updateApplicationBackend(appId, {
      riskScore: newScore,
      riskLevel: getRiskLevel(newScore),
      updatedAt: new Date().toISOString(),
    });

    setRiskFactorForm({
      category: RISK_CATEGORIES[0],
      factor: '',
      impact: 'neutral',
      weight: 5,
      notes: '',
    });
  };

  // Add note
  const handleAddNote = (appId: string) => {
    if (!newNote.trim()) return;

    addReviewNoteToBackend({
      id: generateId(),
      applicationId: appId,
      author: 'Current User',
      content: newNote,
      timestamp: new Date().toISOString(),
      type: 'note',
    });

    setNewNote('');
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const dataWithNames = filteredApplications.map((a) => ({
      ...a,
      applicantName: getApplicantName(a.applicantId),
      underwriter: getUnderwriterName(a.underwriterId),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(dataWithNames, APPLICATION_COLUMNS, 'underwriting-applications');
        break;
      case 'excel':
        exportToExcel(dataWithNames, APPLICATION_COLUMNS, 'underwriting-applications');
        break;
      case 'json':
        exportToJSON(dataWithNames, 'underwriting-applications');
        break;
      case 'pdf':
        exportToPDF(dataWithNames, APPLICATION_COLUMNS, 'Underwriting Review Report');
        break;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('tools.underwritingReview.underwritingReview', 'Underwriting Review')}</h1>
            <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.evaluateAndApproveInsuranceApplications', 'Evaluate and approve insurance applications')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="underwriting-review" toolName="Underwriting Review" />

          <SyncStatus
            isSynced={applicationsSynced && applicantsSynced}
            isSaving={applicationsSaving || applicantsSaving}
            lastSaved={applicationsLastSaved || applicantsLastSaved}
            error={applicationsSyncError || applicantsSyncError}
            onRetry={() => { forceApplicationsSync(); forceApplicantsSync(); }}
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
                <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.totalApplications', 'Total Applications')}</p>
                <p className="text-2xl font-bold">{analytics.total}</p>
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
                <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.pendingReview', 'Pending Review')}</p>
                <p className="text-2xl font-bold">{analytics.pending}</p>
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
                <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.approvalRate', 'Approval Rate')}</p>
                <p className="text-2xl font-bold">{analytics.approvalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.avgRiskScore', 'Avg Risk Score')}</p>
                <p className="text-2xl font-bold">{analytics.avgRiskScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {['queue', 'applications', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab === 'queue' ? 'Review Queue' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'queue' && reviewQueue.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {reviewQueue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Review Queue Tab */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Applications Awaiting Review ({reviewQueue.length})</h2>
            <button
              onClick={() => setShowApplicationForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {t('tools.underwritingReview.newApplication2', 'New Application')}
            </button>
          </div>

          {reviewQueue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">{t('tools.underwritingReview.noApplicationsPendingReview', 'No applications pending review!')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviewQueue.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${RISK_CONFIG[app.riskLevel].color}`}>
                          {app.riskScore >= 60 ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <FileSearch className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{app.applicationNumber}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_CONFIG[app.status].color}`}>
                              {STATUS_CONFIG[app.status].label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${RISK_CONFIG[app.riskLevel].color}`}>
                              Risk: {app.riskScore}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getApplicantName(app.applicantId)} - {APPLICATION_TYPES.find((t) => t.type === app.applicationType)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Coverage: {formatCurrency(app.requestedCoverage)} | Suggested Premium: {formatCurrency(app.suggestedPremium)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <select
                            onChange={(e) => handleStartReview(app.id, e.target.value)}
                            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background"
                            defaultValue=""
                          >
                            <option value="" disabled>{t('tools.underwritingReview.assignTo', 'Assign to...')}</option>
                            {UNDERWRITERS.filter((u) =>
                              u.specialties.includes(app.applicationType) &&
                              u.activeReviews < u.maxCapacity
                            ).map((uw) => (
                              <option key={uw.id} value={uw.id}>{uw.name}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                          {t('tools.underwritingReview.review', 'Review')}
                        </button>
                      </div>
                    </div>

                    {expandedAppId === app.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        {/* Applicant Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
                            const applicant = applicants.find((a) => a.id === app.applicantId);
                            return applicant ? (
                              <>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.creditScore', 'Credit Score')}</p>
                                  <p className="font-medium">{applicant.creditScore}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.annualIncome', 'Annual Income')}</p>
                                  <p className="font-medium">{formatCurrency(applicant.annualIncome)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.occupation', 'Occupation')}</p>
                                  <p className="font-medium">{applicant.occupation || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.submitted', 'Submitted')}</p>
                                  <p className="font-medium">{formatDate(app.submittedDate)}</p>
                                </div>
                              </>
                            ) : null;
                          })()}
                        </div>

                        {/* Risk Factors */}
                        <div>
                          <p className="text-sm font-medium mb-2">{t('tools.underwritingReview.riskFactors', 'Risk Factors')}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {riskFactors
                              .filter((f) => f.applicationId === app.id)
                              .map((factor) => (
                                <span
                                  key={factor.id}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    factor.impact === 'negative'
                                      ? 'bg-red-500/10 text-red-500'
                                      : factor.impact === 'positive'
                                      ? 'bg-green-500/10 text-green-500'
                                      : 'bg-gray-500/10 text-gray-500'
                                  }`}
                                >
                                  {factor.impact === 'negative' ? (
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                  ) : factor.impact === 'positive' ? (
                                    <TrendingDown className="w-3 h-3 inline mr-1" />
                                  ) : null}
                                  {factor.factor} ({factor.weight})
                                </span>
                              ))}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <select
                              value={riskFactorForm.category}
                              onChange={(e) => setRiskFactorForm({ ...riskFactorForm, category: e.target.value })}
                              className="px-2 py-1 text-sm border border-border rounded bg-background"
                            >
                              {RISK_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder={t('tools.underwritingReview.factorDescription', 'Factor description')}
                              value={riskFactorForm.factor}
                              onChange={(e) => setRiskFactorForm({ ...riskFactorForm, factor: e.target.value })}
                              className="flex-1 min-w-[150px] px-2 py-1 text-sm border border-border rounded bg-background"
                            />
                            <select
                              value={riskFactorForm.impact}
                              onChange={(e) => setRiskFactorForm({ ...riskFactorForm, impact: e.target.value as 'positive' | 'negative' | 'neutral' })}
                              className="px-2 py-1 text-sm border border-border rounded bg-background"
                            >
                              <option value="positive">{t('tools.underwritingReview.positive', 'Positive')}</option>
                              <option value="neutral">{t('tools.underwritingReview.neutral', 'Neutral')}</option>
                              <option value="negative">{t('tools.underwritingReview.negative', 'Negative')}</option>
                            </select>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={riskFactorForm.weight}
                              onChange={(e) => setRiskFactorForm({ ...riskFactorForm, weight: parseInt(e.target.value) || 5 })}
                              className="w-16 px-2 py-1 text-sm border border-border rounded bg-background"
                            />
                            <button
                              onClick={() => handleAddRiskFactor(app.id)}
                              className="px-3 py-1 text-sm bg-muted text-foreground rounded hover:bg-muted/80"
                            >
                              {t('tools.underwritingReview.add', 'Add')}
                            </button>
                          </div>
                        </div>

                        {/* Decision Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <button
                            onClick={() => handleDecision(app, 'approved', app.suggestedPremium)}
                            className="px-4 py-2 text-sm bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {t('tools.underwritingReview.approveStandard', 'Approve (Standard)')}
                          </button>
                          <button
                            onClick={() => {
                              setPremiumModalApp(app);
                              setCustomPremium((app.suggestedPremium * 1.2).toString());
                              setPremiumModalOpen(true);
                            }}
                            className="px-4 py-2 text-sm bg-yellow-500/10 text-yellow-600 rounded-lg hover:bg-yellow-500/20"
                          >
                            {t('tools.underwritingReview.approveModified', 'Approve (Modified)')}
                          </button>
                          <button
                            onClick={() => handleDecision(app, 'declined')}
                            className="px-4 py-2 text-sm bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            {t('tools.underwritingReview.decline', 'Decline')}
                          </button>
                          <button
                            onClick={() => handleDecision(app, 'referred')}
                            className="px-4 py-2 text-sm bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500/20"
                          >
                            <Scale className="w-4 h-4 inline mr-1" />
                            {t('tools.underwritingReview.refer', 'Refer')}
                          </button>
                          <button
                            onClick={() => updateApplicationBackend(app.id, { status: 'info_needed', updatedAt: new Date().toISOString() })}
                            className="px-4 py-2 text-sm bg-orange-500/10 text-orange-600 rounded-lg hover:bg-orange-500/20"
                          >
                            {t('tools.underwritingReview.requestInfo', 'Request Info')}
                          </button>
                        </div>

                        {/* Notes */}
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm font-medium mb-2">{t('tools.underwritingReview.reviewNotes', 'Review Notes')}</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder={t('tools.underwritingReview.addANote', 'Add a note...')}
                              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
                            />
                            <button
                              onClick={() => handleAddNote(app.id)}
                              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                            >
                              {t('tools.underwritingReview.add2', 'Add')}
                            </button>
                          </div>
                          <div className="mt-2 space-y-2">
                            {reviewNotes
                              .filter((n) => n.applicationId === app.id)
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                              .map((note) => (
                                <div key={note.id} className={`p-2 rounded-lg text-sm ${
                                  note.type === 'decision' ? 'bg-green-500/10' : 'bg-muted/50'
                                }`}>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('tools.underwritingReview.searchApplications', 'Search applications...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ApplicationType | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.underwritingReview.allTypes', 'All Types')}</option>
              {APPLICATION_TYPES.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReviewStatus | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.underwritingReview.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.underwritingReview.allRiskLevels', 'All Risk Levels')}</option>
              {Object.entries(RISK_CONFIG).map(([risk, config]) => (
                <option key={risk} value={risk}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Applications List */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">{t('tools.underwritingReview.application', 'Application')}</th>
                  <th className="text-left py-3 px-4">{t('tools.underwritingReview.applicant', 'Applicant')}</th>
                  <th className="text-left py-3 px-4">{t('tools.underwritingReview.type', 'Type')}</th>
                  <th className="text-left py-3 px-4">{t('tools.underwritingReview.status', 'Status')}</th>
                  <th className="text-left py-3 px-4">{t('tools.underwritingReview.risk', 'Risk')}</th>
                  <th className="text-right py-3 px-4">{t('tools.underwritingReview.coverage', 'Coverage')}</th>
                  <th className="text-right py-3 px-4">{t('tools.underwritingReview.premium', 'Premium')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      {t('tools.underwritingReview.noApplicationsFound', 'No applications found')}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{app.applicationNumber}</td>
                      <td className="py-3 px-4">{getApplicantName(app.applicantId)}</td>
                      <td className="py-3 px-4">{APPLICATION_TYPES.find((t) => t.type === app.applicationType)?.label}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_CONFIG[app.status].color}`}>
                          {STATUS_CONFIG[app.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${RISK_CONFIG[app.riskLevel].color}`}>
                          {app.riskScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(app.requestedCoverage)}</td>
                      <td className="py-3 px-4 text-right">
                        {app.status === 'approved' ? formatCurrency(app.finalPremium) : formatCurrency(app.suggestedPremium)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.underwritingReview.applicationsByType', 'Applications by Type')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {APPLICATION_TYPES.map(({ type, label }) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${analytics.total > 0 ? (analytics.byType[type].total / analytics.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        {analytics.byType[type].approved}/{analytics.byType[type].total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.underwritingReview.underwriterWorkload', 'Underwriter Workload')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {UNDERWRITERS.map((uw) => (
                  <div key={uw.id} className="flex items-center justify-between">
                    <span className="text-sm">{uw.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            uw.activeReviews / uw.maxCapacity > 0.8 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{
                            width: `${(uw.activeReviews / uw.maxCapacity) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {uw.activeReviews}/{uw.maxCapacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.underwritingReview.performanceSummary', 'Performance Summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.totalCoverageWritten', 'Total Coverage Written')}</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.totalCoverage)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.totalPremiumWritten', 'Total Premium Written')}</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.totalPremium)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.avgProcessingDays', 'Avg Processing Days')}</p>
                  <p className="text-xl font-bold">{analytics.avgProcessingDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.underwritingReview.declineRate', 'Decline Rate')}</p>
                  <p className="text-xl font-bold">
                    {analytics.total > 0 ? Math.round((analytics.declined / analytics.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Application Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.underwritingReview.newApplication', 'New Application')}</CardTitle>
              <button onClick={() => setShowApplicationForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Applicant selection */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.underwritingReview.applicant2', 'Applicant')}</label>
                <select
                  value={applicationForm.applicantId || ''}
                  onChange={(e) => setApplicationForm({ ...applicationForm, applicantId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">{t('tools.underwritingReview.selectApplicantOrAddNew', 'Select applicant or add new')}</option>
                  {applicants.map((a) => (
                    <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                  ))}
                </select>
              </div>

              {/* New applicant form */}
              {!applicationForm.applicantId && (
                <div className="p-3 border border-border rounded-lg space-y-3">
                  <p className="text-sm font-medium">{t('tools.underwritingReview.addNewApplicant', 'Add New Applicant')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t('tools.underwritingReview.firstName', 'First Name *')}
                      value={applicantForm.firstName || ''}
                      onChange={(e) => setApplicantForm({ ...applicantForm, firstName: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.underwritingReview.lastName', 'Last Name *')}
                      value={applicantForm.lastName || ''}
                      onChange={(e) => setApplicantForm({ ...applicantForm, lastName: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder={t('tools.underwritingReview.creditScore2', 'Credit Score')}
                      value={applicantForm.creditScore || 700}
                      onChange={(e) => setApplicantForm({ ...applicantForm, creditScore: parseInt(e.target.value) || 700 })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                    <input
                      type="number"
                      placeholder={t('tools.underwritingReview.annualIncome2', 'Annual Income')}
                      value={applicantForm.annualIncome || 50000}
                      onChange={(e) => setApplicantForm({ ...applicantForm, annualIncome: parseFloat(e.target.value) || 0 })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('tools.underwritingReview.occupation2', 'Occupation')}
                    value={applicantForm.occupation || ''}
                    onChange={(e) => setApplicantForm({ ...applicantForm, occupation: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                  <button
                    onClick={handleAddApplicant}
                    className="w-full px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80"
                  >
                    {t('tools.underwritingReview.addApplicant', 'Add Applicant')}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.underwritingReview.applicationType', 'Application Type')}</label>
                <select
                  value={applicationForm.applicationType}
                  onChange={(e) => setApplicationForm({ ...applicationForm, applicationType: e.target.value as ApplicationType })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  {APPLICATION_TYPES.map(({ type, label }) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.underwritingReview.requestedCoverage', 'Requested Coverage')}</label>
                <input
                  type="number"
                  value={applicationForm.requestedCoverage || 100000}
                  onChange={(e) => setApplicationForm({ ...applicationForm, requestedCoverage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.underwritingReview.notes', 'Notes')}</label>
                <textarea
                  value={applicationForm.notes || ''}
                  onChange={(e) => setApplicationForm({ ...applicationForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background h-20"
                  placeholder={t('tools.underwritingReview.additionalInformation', 'Additional information...')}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.underwritingReview.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSubmitApplication}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.underwritingReview.submitApplication', 'Submit Application')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Premium Input Modal */}
      {premiumModalOpen && premiumModalApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.underwritingReview.enterFinalPremium', 'Enter Final Premium')}</CardTitle>
              <button onClick={() => setPremiumModalOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.underwritingReview.finalPremiumAmount', 'Final Premium Amount')}</label>
                <input
                  type="number"
                  value={customPremium}
                  onChange={(e) => setCustomPremium(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder={t('tools.underwritingReview.enterPremiumAmount', 'Enter premium amount')}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setPremiumModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.underwritingReview.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    if (customPremium && premiumModalApp) {
                      handleDecision(premiumModalApp, 'approved', parseFloat(customPremium));
                      setPremiumModalOpen(false);
                      setPremiumModalApp(null);
                      setCustomPremium('');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.underwritingReview.approve', 'Approve')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default UnderwritingReviewTool;
