'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Search,
  Filter,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

interface JobPostingToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'filled';
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  locationType: 'onsite' | 'remote' | 'hybrid';
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryType: 'hourly' | 'annual';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  status: JobStatus;
  applicantCount: number;
  viewCount: number;
  postedDate: string;
  closingDate: string;
  hiringManager: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

const JOB_STATUSES: { value: JobStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'closed', label: 'Closed', color: 'red' },
  { value: 'filled', label: 'Filled', color: 'blue' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
];

// Column configuration for exports
const JOB_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Job Title', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'locationType', header: 'Location Type', type: 'string' },
  { key: 'jobType', header: 'Job Type', type: 'string' },
  { key: 'experienceLevel', header: 'Experience Level', type: 'string' },
  { key: 'salaryMin', header: 'Salary Min', type: 'currency' },
  { key: 'salaryMax', header: 'Salary Max', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'applicantCount', header: 'Applicants', type: 'number' },
  { key: 'viewCount', header: 'Views', type: 'number' },
  { key: 'postedDate', header: 'Posted Date', type: 'date' },
  { key: 'closingDate', header: 'Closing Date', type: 'date' },
  { key: 'hiringManager', header: 'Hiring Manager', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number, type: 'hourly' | 'annual' = 'annual') => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return type === 'hourly' ? `${formatted}/hr` : `${formatted}/yr`;
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
export const JobPostingTool: React.FC<JobPostingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: jobs,
    addItem: addJobToBackend,
    updateItem: updateJobBackend,
    deleteItem: deleteJobBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<JobPosting>('job-postings', [], JOB_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // New job form state
  const [newJob, setNewJob] = useState<Partial<JobPosting>>({
    title: '',
    department: '',
    location: '',
    locationType: 'onsite',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 50000,
    salaryMax: 80000,
    salaryType: 'annual',
    description: '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: [],
    status: 'draft',
    hiringManager: '',
    closingDate: '',
  });

  // Temp state for list inputs
  const [tempRequirement, setTempRequirement] = useState('');
  const [tempResponsibility, setTempResponsibility] = useState('');
  const [tempBenefit, setTempBenefit] = useState('');
  const [tempSkill, setTempSkill] = useState('');

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [jobs, searchTerm, filterStatus, filterDepartment]);

  // Analytics
  const analytics = useMemo(() => {
    const activeJobs = jobs.filter((j) => j.status === 'active').length;
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);
    const totalViews = jobs.reduce((sum, j) => sum + j.viewCount, 0);
    const avgApplicationRate = totalViews > 0 ? (totalApplicants / totalViews) * 100 : 0;

    const byDepartment = jobs.reduce((acc, job) => {
      acc[job.department] = (acc[job.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { activeJobs, totalApplicants, totalViews, avgApplicationRate, byDepartment, byStatus };
  }, [jobs]);

  // Add list item helpers
  const addRequirement = () => {
    if (tempRequirement.trim()) {
      setNewJob((prev) => ({
        ...prev,
        requirements: [...(prev.requirements || []), tempRequirement.trim()],
      }));
      setTempRequirement('');
    }
  };

  const addResponsibility = () => {
    if (tempResponsibility.trim()) {
      setNewJob((prev) => ({
        ...prev,
        responsibilities: [...(prev.responsibilities || []), tempResponsibility.trim()],
      }));
      setTempResponsibility('');
    }
  };

  const addBenefit = () => {
    if (tempBenefit.trim()) {
      setNewJob((prev) => ({
        ...prev,
        benefits: [...(prev.benefits || []), tempBenefit.trim()],
      }));
      setTempBenefit('');
    }
  };

  const addSkill = () => {
    if (tempSkill.trim()) {
      setNewJob((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), tempSkill.trim()],
      }));
      setTempSkill('');
    }
  };

  // Save job
  const saveJob = () => {
    if (!newJob.title || !newJob.department) {
      setValidationMessage('Please fill in required fields (Title, Department)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const job: JobPosting = {
      id: editingJob?.id || generateId(),
      title: newJob.title || '',
      department: newJob.department || '',
      location: newJob.location || '',
      locationType: newJob.locationType || 'onsite',
      jobType: newJob.jobType || 'full-time',
      experienceLevel: newJob.experienceLevel || 'mid',
      salaryMin: newJob.salaryMin || 0,
      salaryMax: newJob.salaryMax || 0,
      salaryType: newJob.salaryType || 'annual',
      description: newJob.description || '',
      requirements: newJob.requirements || [],
      responsibilities: newJob.responsibilities || [],
      benefits: newJob.benefits || [],
      skills: newJob.skills || [],
      status: newJob.status || 'draft',
      applicantCount: editingJob?.applicantCount || 0,
      viewCount: editingJob?.viewCount || 0,
      postedDate: newJob.status === 'active' && !editingJob?.postedDate ? new Date().toISOString() : (editingJob?.postedDate || ''),
      closingDate: newJob.closingDate || '',
      hiringManager: newJob.hiringManager || '',
      createdAt: editingJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingJob) {
      updateJobBackend(job.id, job);
    } else {
      addJobToBackend(job);
    }

    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      department: '',
      location: '',
      locationType: 'onsite',
      jobType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 50000,
      salaryMax: 80000,
      salaryType: 'annual',
      description: '',
      requirements: [],
      responsibilities: [],
      benefits: [],
      skills: [],
      status: 'draft',
      hiringManager: '',
      closingDate: '',
    });
    setEditingJob(null);
    setTempRequirement('');
    setTempResponsibility('');
    setTempBenefit('');
    setTempSkill('');
  };

  const editJob = (job: JobPosting) => {
    setEditingJob(job);
    setNewJob(job);
    setActiveTab('create');
  };

  const deleteJob = useCallback(async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Delete Job Posting',
      message: 'Are you sure you want to delete this job posting? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteJobBackend(jobId);
    }
  }, [confirm, deleteJobBackend]);

  const toggleJobStatus = (job: JobPosting) => {
    const newStatus: JobStatus = job.status === 'active' ? 'paused' : 'active';
    updateJobBackend(job.id, {
      ...job,
      status: newStatus,
      postedDate: newStatus === 'active' && !job.postedDate ? new Date().toISOString() : job.postedDate,
      updatedAt: new Date().toISOString(),
    });
  };

  const duplicateJob = (job: JobPosting) => {
    const newJobData: JobPosting = {
      ...job,
      id: generateId(),
      title: `${job.title} (Copy)`,
      status: 'draft',
      applicantCount: 0,
      viewCount: 0,
      postedDate: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addJobToBackend(newJobData);
  };

  const getStatusColor = (status: JobStatus) => {
    const statusConfig = JOB_STATUSES.find((s) => s.value === status);
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[statusConfig?.color || 'gray'];
  };

  // Export handlers
  const handleExport = (format: string) => {
    const exportData = filteredJobs.map((job) => ({
      ...job,
      requirements: job.requirements.join('; '),
      responsibilities: job.responsibilities.join('; '),
      benefits: job.benefits.join('; '),
      skills: job.skills.join('; '),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, JOB_COLUMNS, 'job-postings');
        break;
      case 'excel':
        exportToExcel(exportData, JOB_COLUMNS, 'job-postings');
        break;
      case 'json':
        exportToJSON(exportData, 'job-postings');
        break;
      case 'pdf':
        exportToPDF(exportData, JOB_COLUMNS, 'Job Postings Report');
        break;
      case 'print':
        printData(exportData, JOB_COLUMNS, 'Job Postings Report');
        break;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.jobPosting.jobPostingManager', 'Job Posting Manager')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.jobPosting.createAndManageJobListings', 'Create and manage job listings')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="job-posting" toolName="Job Posting" />

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

        {/* Tabs */}
        <div className="flex gap-2">
          {(['list', 'create', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'create') resetForm();
                setActiveTab(tab);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'list' ? 'All Jobs' : tab === 'create' ? (editingJob ? t('tools.jobPosting.editJob', 'Edit Job') : t('tools.jobPosting.createJob2', 'Create Job')) : 'Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.jobPosting.searchJobs', 'Search jobs...')}
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
                <option value="all">{t('tools.jobPosting.allStatuses', 'All Statuses')}</option>
                {JOB_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.jobPosting.allDepartments', 'All Departments')}</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Job List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.jobPosting.noJobsFound', 'No jobs found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {jobs.length === 0
                    ? t('tools.jobPosting.createYourFirstJobPosting', 'Create your first job posting to get started.') : t('tools.jobPosting.tryAdjustingYourSearchOr', 'Try adjusting your search or filters.')}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.jobPosting.createJob', 'Create Job')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {JOB_STATUSES.find((s) => s.value === job.status)?.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location} ({job.locationType})
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {JOB_TYPES.find((t) => t.value === job.jobType)?.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(job.salaryMin, job.salaryType)} - {formatCurrency(job.salaryMax, job.salaryType)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">{job.applicantCount}</span>
                              <span className="text-gray-500">applicants</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">{job.viewCount} views</span>
                            </div>
                          </div>
                          {expandedJobId === job.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedJobId === job.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.jobPosting.description', 'Description')}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{job.description || 'No description provided.'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.jobPosting.details', 'Details')}</h4>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <p>Experience: {EXPERIENCE_LEVELS.find((e) => e.value === job.experienceLevel)?.label}</p>
                                <p>Hiring Manager: {job.hiringManager || 'Not assigned'}</p>
                                <p>Posted: {formatDate(job.postedDate)}</p>
                                <p>Closing: {formatDate(job.closingDate)}</p>
                              </div>
                            </div>
                          </div>

                          {job.skills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.jobPosting.requiredSkills', 'Required Skills')}</h4>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editJob(job);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              {t('tools.jobPosting.edit', 'Edit')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleJobStatus(job);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                            >
                              {job.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {job.status === 'active' ? t('tools.jobPosting.pause', 'Pause') : t('tools.jobPosting.activate', 'Activate')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateJob(job);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                            >
                              <Copy className="w-4 h-4" />
                              {t('tools.jobPosting.duplicate', 'Duplicate')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteJob(job.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingJob ? t('tools.jobPosting.editJobPosting', 'Edit Job Posting') : t('tools.jobPosting.createNewJobPosting', 'Create New Job Posting')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.jobTitle', 'Job Title *')}
                    </label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.jobPosting.eGSeniorSoftwareEngineer', 'e.g., Senior Software Engineer')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.department', 'Department *')}
                    </label>
                    <select
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('tools.jobPosting.selectDepartment', 'Select Department')}</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.jobPosting.eGSanFranciscoCa', 'e.g., San Francisco, CA')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.locationType', 'Location Type')}
                    </label>
                    <select
                      value={newJob.locationType}
                      onChange={(e) => setNewJob({ ...newJob, locationType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="onsite">{t('tools.jobPosting.onSite', 'On-site')}</option>
                      <option value="remote">{t('tools.jobPosting.remote', 'Remote')}</option>
                      <option value="hybrid">{t('tools.jobPosting.hybrid', 'Hybrid')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.jobType', 'Job Type')}
                    </label>
                    <select
                      value={newJob.jobType}
                      onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value as JobType })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.experienceLevel', 'Experience Level')}
                    </label>
                    <select
                      value={newJob.experienceLevel}
                      onChange={(e) => setNewJob({ ...newJob, experienceLevel: e.target.value as ExperienceLevel })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.salaryMin', 'Salary Min')}
                    </label>
                    <input
                      type="number"
                      value={newJob.salaryMin}
                      onChange={(e) => setNewJob({ ...newJob, salaryMin: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.salaryMax', 'Salary Max')}
                    </label>
                    <input
                      type="number"
                      value={newJob.salaryMax}
                      onChange={(e) => setNewJob({ ...newJob, salaryMax: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.salaryType', 'Salary Type')}
                    </label>
                    <select
                      value={newJob.salaryType}
                      onChange={(e) => setNewJob({ ...newJob, salaryType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="annual">{t('tools.jobPosting.annual', 'Annual')}</option>
                      <option value="hourly">{t('tools.jobPosting.hourly', 'Hourly')}</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.jobPosting.jobDescription', 'Job Description')}
                  </label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.jobPosting.describeTheRoleAndResponsibilities', 'Describe the role and responsibilities...')}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.jobPosting.requiredSkills2', 'Required Skills')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tempSkill}
                      onChange={(e) => setTempSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.jobPosting.addASkill', 'Add a skill...')}
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newJob.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                      >
                        {skill}
                        <button
                          onClick={() =>
                            setNewJob({
                              ...newJob,
                              skills: newJob.skills?.filter((_, i) => i !== idx),
                            })
                          }
                          className="hover:text-blue-600"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.hiringManager', 'Hiring Manager')}
                    </label>
                    <input
                      type="text"
                      value={newJob.hiringManager}
                      onChange={(e) => setNewJob({ ...newJob, hiringManager: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.jobPosting.managerName', 'Manager name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.applicationDeadline', 'Application Deadline')}
                    </label>
                    <input
                      type="date"
                      value={newJob.closingDate?.split('T')[0] || ''}
                      onChange={(e) => setNewJob({ ...newJob, closingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.jobPosting.status', 'Status')}
                    </label>
                    <select
                      value={newJob.status}
                      onChange={(e) => setNewJob({ ...newJob, status: e.target.value as JobStatus })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {JOB_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveJob}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingJob ? t('tools.jobPosting.updateJob', 'Update Job') : t('tools.jobPosting.createJob3', 'Create Job')}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('list');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('tools.jobPosting.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.jobPosting.activeJobs', 'Active Jobs')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeJobs}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.jobPosting.totalApplicants', 'Total Applicants')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalApplicants}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.jobPosting.totalViews', 'Total Views')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.jobPosting.applicationRate', 'Application Rate')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.avgApplicationRate.toFixed(1)}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('tools.jobPosting.jobsByDepartment', 'Jobs by Department')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.byDepartment).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{dept}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / jobs.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('tools.jobPosting.jobsByStatus', 'Jobs by Status')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.byStatus).map(([status, count]) => {
                      const statusConfig = JOB_STATUSES.find((s) => s.value === status);
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status as JobStatus)}`}>
                            {statusConfig?.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(count / jobs.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {validationMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg shadow-lg border border-red-300 dark:border-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{validationMessage}</span>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default JobPostingTool;
