'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  User,
  Mail,
  Phone,
  FileText,
  Briefcase,
  Calendar,
  MapPin,
  Star,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ExternalLink,
  Download,
  Send,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
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

interface ApplicantTrackerToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ApplicantStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
type Source = 'linkedin' | 'indeed' | 'referral' | 'company-website' | 'job-board' | 'agency' | 'other';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  jobId: string;
  jobTitle: string;
  status: ApplicantStatus;
  source: Source;
  resumeUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  yearsExperience: number;
  currentCompany: string;
  currentTitle: string;
  expectedSalary: number;
  noticePeriod: string;
  skills: string[];
  rating: number;
  notes: string[];
  appliedDate: string;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  applicantId: string;
  author: string;
  content: string;
  createdAt: string;
}

// Constants
const APPLICANT_STATUSES: { value: ApplicantStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'screening', label: 'Screening', color: 'purple' },
  { value: 'interview', label: 'Interview', color: 'yellow' },
  { value: 'offer', label: 'Offer', color: 'orange' },
  { value: 'hired', label: 'Hired', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'gray' },
];

const SOURCES: { value: Source; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'referral', label: 'Referral' },
  { value: 'company-website', label: 'Company Website' },
  { value: 'job-board', label: 'Job Board' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' },
];

const PIPELINE_STAGES: ApplicantStatus[] = ['new', 'screening', 'interview', 'offer', 'hired'];

// Column configuration for exports
const APPLICANT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'jobTitle', header: 'Applied For', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'source', header: 'Source', type: 'string' },
  { key: 'yearsExperience', header: 'Experience (Years)', type: 'number' },
  { key: 'currentCompany', header: 'Current Company', type: 'string' },
  { key: 'expectedSalary', header: 'Expected Salary', type: 'currency' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'appliedDate', header: 'Applied Date', type: 'date' },
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
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTimeAgo = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Main Component
export const ApplicantTrackerTool: React.FC<ApplicantTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: applicants,
    addItem: addApplicantToBackend,
    updateItem: updateApplicantBackend,
    deleteItem: deleteApplicantBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Applicant>('applicant-tracker', [], APPLICANT_COLUMNS);

  // Local UI State
  const [viewMode, setViewMode] = useState<'list' | 'pipeline' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        setNewApplicant({
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          phone: params.phone || '',
          location: params.location || '',
          jobId: params.jobId || '',
          jobTitle: params.jobTitle || '',
          status: params.status || 'new',
          source: params.source || 'linkedin',
          resumeUrl: params.resumeUrl || '',
          linkedinUrl: params.linkedinUrl || '',
          portfolioUrl: params.portfolioUrl || '',
          coverLetter: params.coverLetter || '',
          yearsExperience: params.yearsExperience || 0,
          currentCompany: params.currentCompany || '',
          currentTitle: params.currentTitle || '',
          expectedSalary: params.expectedSalary || 0,
          noticePeriod: params.noticePeriod || '',
          skills: params.skills || [],
          rating: params.rating || 0,
          notes: params.notes || [],
        });
        setViewMode('create');
        setIsEditFromGallery(true);
      } else if (params.firstName || params.email || params.jobTitle) {
        // Regular prefill from AI
        setNewApplicant(prev => ({
          ...prev,
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          jobTitle: params.jobTitle || '',
        }));
        setViewMode('create');
      }
    }
  }, [uiConfig?.params]);

  // New applicant form state
  const [newApplicant, setNewApplicant] = useState<Partial<Applicant>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    jobId: '',
    jobTitle: '',
    status: 'new',
    source: 'linkedin',
    resumeUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    coverLetter: '',
    yearsExperience: 0,
    currentCompany: '',
    currentTitle: '',
    expectedSalary: 0,
    noticePeriod: '',
    skills: [],
    rating: 0,
    notes: [],
  });

  const [tempSkill, setTempSkill] = useState('');
  const [tempNote, setTempNote] = useState('');

  // Filter applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || applicant.status === filterStatus;
      const matchesSource = filterSource === 'all' || applicant.source === filterSource;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [applicants, searchTerm, filterStatus, filterSource]);

  // Pipeline view data
  const pipelineData = useMemo(() => {
    const data: Record<ApplicantStatus, Applicant[]> = {
      new: [],
      screening: [],
      interview: [],
      offer: [],
      hired: [],
      rejected: [],
      withdrawn: [],
    };
    applicants.forEach((a) => {
      data[a.status].push(a);
    });
    return data;
  }, [applicants]);

  // Analytics
  const analytics = useMemo(() => {
    const total = applicants.length;
    const byStatus = applicants.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = applicants.reduce((acc, a) => {
      acc[a.source] = (acc[a.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgRating = applicants.length > 0
      ? applicants.reduce((sum, a) => sum + a.rating, 0) / applicants.length
      : 0;

    const hireRate = total > 0 ? ((byStatus['hired'] || 0) / total) * 100 : 0;

    return { total, byStatus, bySource, avgRating, hireRate };
  }, [applicants]);

  // Add skill
  const addSkill = () => {
    if (tempSkill.trim()) {
      setNewApplicant((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), tempSkill.trim()],
      }));
      setTempSkill('');
    }
  };

  // Save applicant
  const saveApplicant = () => {
    if (!newApplicant.firstName || !newApplicant.lastName || !newApplicant.email) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const applicant: Applicant = {
      id: editingApplicant?.id || generateId(),
      firstName: newApplicant.firstName || '',
      lastName: newApplicant.lastName || '',
      email: newApplicant.email || '',
      phone: newApplicant.phone || '',
      location: newApplicant.location || '',
      jobId: newApplicant.jobId || '',
      jobTitle: newApplicant.jobTitle || '',
      status: newApplicant.status || 'new',
      source: newApplicant.source || 'linkedin',
      resumeUrl: newApplicant.resumeUrl || '',
      linkedinUrl: newApplicant.linkedinUrl || '',
      portfolioUrl: newApplicant.portfolioUrl || '',
      coverLetter: newApplicant.coverLetter || '',
      yearsExperience: newApplicant.yearsExperience || 0,
      currentCompany: newApplicant.currentCompany || '',
      currentTitle: newApplicant.currentTitle || '',
      expectedSalary: newApplicant.expectedSalary || 0,
      noticePeriod: newApplicant.noticePeriod || '',
      skills: newApplicant.skills || [],
      rating: newApplicant.rating || 0,
      notes: newApplicant.notes || [],
      appliedDate: editingApplicant?.appliedDate || new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
      createdAt: editingApplicant?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingApplicant) {
      updateApplicantBackend(applicant.id, applicant);
    } else {
      addApplicantToBackend(applicant);
    }

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'applicant-tracker',
        firstName: newApplicant.firstName,
        lastName: newApplicant.lastName,
        email: newApplicant.email,
        phone: newApplicant.phone,
        location: newApplicant.location,
        jobId: newApplicant.jobId,
        jobTitle: newApplicant.jobTitle,
        status: newApplicant.status,
        source: newApplicant.source,
        resumeUrl: newApplicant.resumeUrl,
        linkedinUrl: newApplicant.linkedinUrl,
        portfolioUrl: newApplicant.portfolioUrl,
        coverLetter: newApplicant.coverLetter,
        yearsExperience: newApplicant.yearsExperience,
        currentCompany: newApplicant.currentCompany,
        currentTitle: newApplicant.currentTitle,
        expectedSalary: newApplicant.expectedSalary,
        noticePeriod: newApplicant.noticePeriod,
        skills: newApplicant.skills,
        rating: newApplicant.rating,
      });
    }

    resetForm();
    setViewMode('list');
  };

  const resetForm = () => {
    setNewApplicant({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      jobId: '',
      jobTitle: '',
      status: 'new',
      source: 'linkedin',
      resumeUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      coverLetter: '',
      yearsExperience: 0,
      currentCompany: '',
      currentTitle: '',
      expectedSalary: 0,
      noticePeriod: '',
      skills: [],
      rating: 0,
      notes: [],
    });
    setEditingApplicant(null);
    setTempSkill('');
    setTempNote('');
  };

  const editApplicant = (applicant: Applicant) => {
    setEditingApplicant(applicant);
    setNewApplicant(applicant);
    setViewMode('create');
  };

  const deleteApplicant = async (applicantId: string) => {
    const confirmed = await confirm({
      title: 'Delete Applicant',
      message: 'Are you sure you want to delete this applicant? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteApplicantBackend(applicantId);
      if (selectedApplicant?.id === applicantId) {
        setSelectedApplicant(null);
      }
    }
  };

  const moveApplicant = (applicant: Applicant, newStatus: ApplicantStatus) => {
    updateApplicantBackend(applicant.id, {
      ...applicant,
      status: newStatus,
      lastActivityDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateRating = (applicant: Applicant, rating: number) => {
    updateApplicantBackend(applicant.id, {
      ...applicant,
      rating,
      updatedAt: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: ApplicantStatus) => {
    const statusConfig = APPLICANT_STATUSES.find((s) => s.value === status);
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[statusConfig?.color || 'gray'];
  };

  // Export handlers
  const handleExport = (format: string) => {
    const exportData = filteredApplicants.map((a) => ({
      ...a,
      skills: a.skills.join('; '),
      notes: a.notes.join('; '),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, APPLICANT_COLUMNS, 'applicants');
        break;
      case 'excel':
        exportToExcel(exportData, APPLICANT_COLUMNS, 'applicants');
        break;
      case 'json':
        exportToJSON(exportData, 'applicants');
        break;
      case 'pdf':
        exportToPDF(exportData, APPLICANT_COLUMNS, 'Applicant Tracker Report');
        break;
      case 'print':
        printData(exportData, APPLICANT_COLUMNS, 'Applicant Tracker Report');
        break;
    }
  };

  const renderStars = (rating: number, interactive = false, applicant?: Applicant) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && applicant && updateRating(applicant, star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Validation Toast */}
      {validationMessage && (
        <div className="mx-4 mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">{validationMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.applicantTracker.applicantTracker', 'Applicant Tracker')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.applicantTracker.trackAndManageJobApplicants', 'Track and manage job applicants')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="applicant-tracker" toolName="Applicant Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {(['list', 'pipeline', 'create'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (mode === 'create') resetForm();
                setViewMode(mode);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {mode === 'list' ? 'List View' : mode === 'pipeline' ? 'Pipeline' : (editingApplicant ? t('tools.applicantTracker.editApplicant', 'Edit Applicant') : t('tools.applicantTracker.addApplicant2', 'Add Applicant'))}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.applicantTracker.totalApplicants', 'Total Applicants')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.byStatus['new'] || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.applicantTracker.new', 'New')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{analytics.byStatus['interview'] || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.applicantTracker.inInterview', 'In Interview')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics.byStatus['hired'] || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.applicantTracker.hired', 'Hired')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analytics.hireRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.applicantTracker.hireRate', 'Hire Rate')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.applicantTracker.searchApplicants', 'Search applicants...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.applicantTracker.allStatuses', 'All Statuses')}</option>
                {APPLICANT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.applicantTracker.allSources', 'All Sources')}</option>
                {SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Applicant List */}
            {filteredApplicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.applicantTracker.noApplicantsFound', 'No applicants found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {applicants.length === 0
                    ? t('tools.applicantTracker.addYourFirstApplicantTo', 'Add your first applicant to get started.') : t('tools.applicantTracker.tryAdjustingYourSearchOr', 'Try adjusting your search or filters.')}
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.applicantTracker.addApplicant', 'Add Applicant')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplicants.map((applicant) => (
                  <Card key={applicant.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                              {applicant.firstName[0]}{applicant.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {applicant.firstName} {applicant.lastName}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                                {APPLICANT_STATUSES.find((s) => s.value === applicant.status)?.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{applicant.currentTitle} at {applicant.currentCompany}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {applicant.jobTitle}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {applicant.location || 'Not specified'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Applied {getTimeAgo(applicant.appliedDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {renderStars(applicant.rating, true, applicant)}
                          <div className="flex gap-2">
                            <button
                              onClick={() => editApplicant(applicant)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteApplicant(applicant.id)}
                              className="p-1.5 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <a
                          href={`mailto:${applicant.email}`}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Mail className="w-4 h-4" />
                          {t('tools.applicantTracker.email', 'Email')}
                        </a>
                        {applicant.linkedinUrl && (
                          <a
                            href={applicant.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t('tools.applicantTracker.linkedin', 'LinkedIn')}
                          </a>
                        )}
                        {applicant.resumeUrl && (
                          <a
                            href={applicant.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Download className="w-4 h-4" />
                            {t('tools.applicantTracker.resume', 'Resume')}
                          </a>
                        )}
                        <div className="flex-1" />
                        <select
                          value={applicant.status}
                          onChange={(e) => moveApplicant(applicant, e.target.value as ApplicantStatus)}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {APPLICANT_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              Move to {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'pipeline' && (
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {PIPELINE_STAGES.map((stage) => {
                const statusConfig = APPLICANT_STATUSES.find((s) => s.value === stage);
                const stageApplicants = pipelineData[stage];

                return (
                  <div
                    key={stage}
                    className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{statusConfig?.label}</h3>
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                        {stageApplicants.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {stageApplicants.map((applicant) => (
                        <Card key={applicant.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                {applicant.firstName[0]}{applicant.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {applicant.firstName} {applicant.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{applicant.jobTitle}</p>
                              </div>
                            </div>
                            {renderStars(applicant.rating)}
                            <div className="flex gap-1 mt-2">
                              {stage !== 'hired' && (
                                <button
                                  onClick={() => {
                                    const nextIndex = PIPELINE_STAGES.indexOf(stage) + 1;
                                    if (nextIndex < PIPELINE_STAGES.length) {
                                      moveApplicant(applicant, PIPELINE_STAGES[nextIndex]);
                                    }
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  {t('tools.applicantTracker.advance', 'Advance')}
                                </button>
                              )}
                              <button
                                onClick={() => moveApplicant(applicant, 'rejected')}
                                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'create' && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{editingApplicant ? t('tools.applicantTracker.editApplicant2', 'Edit Applicant') : t('tools.applicantTracker.addNewApplicant', 'Add New Applicant')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newApplicant.firstName}
                      onChange={(e) => setNewApplicant({ ...newApplicant, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newApplicant.lastName}
                      onChange={(e) => setNewApplicant({ ...newApplicant, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.email2', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={newApplicant.email}
                      onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newApplicant.phone}
                      onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={newApplicant.location}
                      onChange={(e) => setNewApplicant({ ...newApplicant, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.applicantTracker.cityState', 'City, State')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.source', 'Source')}
                    </label>
                    <select
                      value={newApplicant.source}
                      onChange={(e) => setNewApplicant({ ...newApplicant, source: e.target.value as Source })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {SOURCES.map((source) => (
                        <option key={source.value} value={source.value}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.appliedForJobTitle', 'Applied For (Job Title)')}
                    </label>
                    <input
                      type="text"
                      value={newApplicant.jobTitle}
                      onChange={(e) => setNewApplicant({ ...newApplicant, jobTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.status', 'Status')}
                    </label>
                    <select
                      value={newApplicant.status}
                      onChange={(e) => setNewApplicant({ ...newApplicant, status: e.target.value as ApplicantStatus })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {APPLICANT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.currentCompany', 'Current Company')}
                    </label>
                    <input
                      type="text"
                      value={newApplicant.currentCompany}
                      onChange={(e) => setNewApplicant({ ...newApplicant, currentCompany: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.currentTitle', 'Current Title')}
                    </label>
                    <input
                      type="text"
                      value={newApplicant.currentTitle}
                      onChange={(e) => setNewApplicant({ ...newApplicant, currentTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.yearsOfExperience', 'Years of Experience')}
                    </label>
                    <input
                      type="number"
                      value={newApplicant.yearsExperience}
                      onChange={(e) => setNewApplicant({ ...newApplicant, yearsExperience: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.expectedSalary', 'Expected Salary')}
                    </label>
                    <input
                      type="number"
                      value={newApplicant.expectedSalary}
                      onChange={(e) => setNewApplicant({ ...newApplicant, expectedSalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.resumeUrl', 'Resume URL')}
                    </label>
                    <input
                      type="url"
                      value={newApplicant.resumeUrl}
                      onChange={(e) => setNewApplicant({ ...newApplicant, resumeUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.applicantTracker.https', 'https://...')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.linkedinUrl', 'LinkedIn URL')}
                    </label>
                    <input
                      type="url"
                      value={newApplicant.linkedinUrl}
                      onChange={(e) => setNewApplicant({ ...newApplicant, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.applicantTracker.httpsLinkedinComIn', 'https://linkedin.com/in/...')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.applicantTracker.portfolioUrl', 'Portfolio URL')}
                    </label>
                    <input
                      type="url"
                      value={newApplicant.portfolioUrl}
                      onChange={(e) => setNewApplicant({ ...newApplicant, portfolioUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.applicantTracker.https2', 'https://...')}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.applicantTracker.skills', 'Skills')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tempSkill}
                      onChange={(e) => setTempSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.applicantTracker.addASkill', 'Add a skill...')}
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newApplicant.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                      >
                        {skill}
                        <button
                          onClick={() =>
                            setNewApplicant({
                              ...newApplicant,
                              skills: newApplicant.skills?.filter((_, i) => i !== idx),
                            })
                          }
                          className="hover:text-green-600"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveApplicant}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingApplicant ? t('tools.applicantTracker.updateApplicant', 'Update Applicant') : t('tools.applicantTracker.addApplicant3', 'Add Applicant')}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setViewMode('list');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('tools.applicantTracker.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ApplicantTrackerTool;
