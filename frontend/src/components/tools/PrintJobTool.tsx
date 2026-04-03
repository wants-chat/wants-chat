'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Printer,
  Plus,
  Trash2,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  User,
  FileText,
  RefreshCw,
  Edit2,
  Eye,
  X,
  Sparkles,
  Layers,
  Settings,
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
import { useTheme } from '@/contexts/ThemeContext';

interface PrintJobToolProps {
  uiConfig?: UIConfig;
}

// Types
type JobStatus = 'pending' | 'in_progress' | 'proofing' | 'approved' | 'printing' | 'finishing' | 'completed' | 'shipped' | 'cancelled';
type JobPriority = 'low' | 'normal' | 'high' | 'rush';
type ProductType = 'banner' | 'poster' | 'flyer' | 'brochure' | 'business_card' | 'sign' | 'vehicle_wrap' | 'window_graphic' | 'trade_show' | 'custom';

interface PrintJob {
  id: string;
  jobNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productType: ProductType;
  productName: string;
  quantity: number;
  width: number;
  height: number;
  unit: 'inches' | 'feet' | 'cm';
  material: string;
  finishing: string[];
  dueDate: string;
  priority: JobPriority;
  status: JobStatus;
  estimatedCost: number;
  actualCost: number;
  notes: string;
  artworkReceived: boolean;
  proofApproved: boolean;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const PRODUCT_TYPES: { type: ProductType; label: string }[] = [
  { type: 'banner', label: 'Banner' },
  { type: 'poster', label: 'Poster' },
  { type: 'flyer', label: 'Flyer' },
  { type: 'brochure', label: 'Brochure' },
  { type: 'business_card', label: 'Business Card' },
  { type: 'sign', label: 'Sign' },
  { type: 'vehicle_wrap', label: 'Vehicle Wrap' },
  { type: 'window_graphic', label: 'Window Graphic' },
  { type: 'trade_show', label: 'Trade Show Display' },
  { type: 'custom', label: 'Custom' },
];

const JOB_STATUSES: { status: JobStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-gray-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { status: 'proofing', label: 'Proofing', color: 'bg-purple-500' },
  { status: 'approved', label: 'Approved', color: 'bg-indigo-500' },
  { status: 'printing', label: 'Printing', color: 'bg-cyan-500' },
  { status: 'finishing', label: 'Finishing', color: 'bg-orange-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-500' },
  { status: 'shipped', label: 'Shipped', color: 'bg-teal-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const PRIORITIES: { priority: JobPriority; label: string; color: string }[] = [
  { priority: 'low', label: 'Low', color: 'bg-gray-400' },
  { priority: 'normal', label: 'Normal', color: 'bg-blue-400' },
  { priority: 'high', label: 'High', color: 'bg-orange-400' },
  { priority: 'rush', label: 'Rush', color: 'bg-red-500' },
];

const MATERIALS = [
  'Vinyl Banner (13oz)',
  'Vinyl Banner (18oz)',
  'Mesh Banner',
  'Foam Board',
  'Coroplast',
  'Acrylic',
  'Aluminum',
  'Magnetic',
  'Window Cling',
  'Adhesive Vinyl',
  'Canvas',
  'Paper (Gloss)',
  'Paper (Matte)',
  'Fabric',
  'PVC',
];

const FINISHING_OPTIONS = [
  'Grommets',
  'Pole Pockets',
  'Hemmed Edges',
  'Lamination (Gloss)',
  'Lamination (Matte)',
  'Mounting',
  'Folding',
  'Cutting',
  'Contour Cut',
  'UV Coating',
  'Scoring',
  'Perforation',
];

// Column configuration for exports
const JOB_COLUMNS: ColumnConfig[] = [
  { key: 'jobNumber', header: 'Job #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'productName', header: 'Product', type: 'string' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated', type: 'currency' },
  { key: 'actualCost', header: 'Actual', type: 'currency' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateJobNumber = () => `PJ-${Date.now().toString().slice(-6)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const PrintJobTool: React.FC<PrintJobToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

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
  } = useToolData<PrintJob>('print-jobs', [], JOB_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'jobs' | 'calendar' | 'analytics'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<PrintJob | null>(null);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // New job form state
  const [newJob, setNewJob] = useState<Partial<PrintJob>>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    productType: 'banner',
    productName: '',
    quantity: 1,
    width: 0,
    height: 0,
    unit: 'inches',
    material: MATERIALS[0],
    finishing: [],
    dueDate: '',
    priority: 'normal',
    status: 'pending',
    estimatedCost: 0,
    actualCost: 0,
    notes: '',
    artworkReceived: false,
    proofApproved: false,
    assignedTo: '',
  });

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.customerName || params.productType || params.quantity) {
        setNewJob({
          ...newJob,
          customerName: params.customerName || '',
          customerEmail: params.customerEmail || '',
          customerPhone: params.customerPhone || '',
          productType: params.productType || 'banner',
          productName: params.productName || '',
          quantity: params.quantity || 1,
        });
        setShowJobForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new job
  const addJob = () => {
    if (!newJob.customerName || !newJob.productName) {
      setValidationMessage('Please fill in required fields (Customer Name, Product Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const job: PrintJob = {
      id: generateId(),
      jobNumber: generateJobNumber(),
      customerName: newJob.customerName || '',
      customerEmail: newJob.customerEmail || '',
      customerPhone: newJob.customerPhone || '',
      productType: newJob.productType || 'banner',
      productName: newJob.productName || '',
      quantity: newJob.quantity || 1,
      width: newJob.width || 0,
      height: newJob.height || 0,
      unit: newJob.unit || 'inches',
      material: newJob.material || MATERIALS[0],
      finishing: newJob.finishing || [],
      dueDate: newJob.dueDate || '',
      priority: newJob.priority || 'normal',
      status: 'pending',
      estimatedCost: newJob.estimatedCost || 0,
      actualCost: 0,
      notes: newJob.notes || '',
      artworkReceived: false,
      proofApproved: false,
      assignedTo: newJob.assignedTo || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addJobToBackend(job);
    resetForm();
  };

  // Update job
  const updateJob = () => {
    if (!editingJob) return;

    const updatedJob: PrintJob = {
      ...editingJob,
      ...newJob,
      updatedAt: new Date().toISOString(),
    } as PrintJob;

    updateJobBackend(editingJob.id, updatedJob);
    resetForm();
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteJobBackend(jobId);
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
    }
  };

  // Update job status
  const updateJobStatus = (jobId: string, status: JobStatus) => {
    updateJobBackend(jobId, { status, updatedAt: new Date().toISOString() });
  };

  // Reset form
  const resetForm = () => {
    setNewJob({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      productType: 'banner',
      productName: '',
      quantity: 1,
      width: 0,
      height: 0,
      unit: 'inches',
      material: MATERIALS[0],
      finishing: [],
      dueDate: '',
      priority: 'normal',
      status: 'pending',
      estimatedCost: 0,
      actualCost: 0,
      notes: '',
      artworkReceived: false,
      proofApproved: false,
      assignedTo: '',
    });
    setShowJobForm(false);
    setEditingJob(null);
  };

  // Edit job
  const startEditJob = (job: PrintJob) => {
    setEditingJob(job);
    setNewJob({ ...job });
    setShowJobForm(true);
  };

  // Toggle finishing option
  const toggleFinishing = (option: string) => {
    const current = newJob.finishing || [];
    if (current.includes(option)) {
      setNewJob({ ...newJob, finishing: current.filter((f) => f !== option) });
    } else {
      setNewJob({ ...newJob, finishing: [...current, option] });
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchTerm === '' ||
        job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [jobs, searchTerm, filterStatus, filterPriority]);

  // Analytics
  const analytics = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => !['completed', 'shipped', 'cancelled'].includes(j.status)).length;
    const completedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'shipped').length;
    const rushJobs = jobs.filter((j) => j.priority === 'rush' && !['completed', 'shipped', 'cancelled'].includes(j.status)).length;
    const totalRevenue = jobs.filter((j) => j.status === 'completed' || j.status === 'shipped').reduce((sum, j) => sum + j.actualCost, 0);
    const pendingRevenue = jobs.filter((j) => !['completed', 'shipped', 'cancelled'].includes(j.status)).reduce((sum, j) => sum + j.estimatedCost, 0);

    return { totalJobs, activeJobs, completedJobs, rushJobs, totalRevenue, pendingRevenue };
  }, [jobs]);

  const getStatusBadge = (status: JobStatus) => {
    const statusInfo = JOB_STATUSES.find((s) => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.label || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: JobPriority) => {
    const priorityInfo = PRIORITIES.find((p) => p.priority === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${priorityInfo?.color || 'bg-gray-400'}`}>
        {priorityInfo?.label || priority}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.printJob.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.printJob.printJobManager', 'Print Job Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.printJob.managePrintOrdersTrackProduction', 'Manage print orders, track production, and monitor deadlines')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="print-job" toolName="Print Job" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(jobs, JOB_COLUMNS, { filename: 'print-jobs' })}
                onExportExcel={() => exportToExcel(jobs, JOB_COLUMNS, { filename: 'print-jobs' })}
                onExportJSON={() => exportToJSON(jobs, { filename: 'print-jobs' })}
                onExportPDF={async () => {
                  await exportToPDF(jobs, JOB_COLUMNS, {
                    filename: 'print-jobs',
                    title: 'Print Jobs Report',
                    subtitle: `${jobs.length} jobs | ${analytics.activeJobs} active`,
                  });
                }}
                onPrint={() => printData(jobs, JOB_COLUMNS, { title: 'Print Jobs' })}
                onCopyToClipboard={async () => await copyUtil(jobs, JOB_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.totalJobs', 'Total Jobs')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analytics.totalJobs}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.active', 'Active')}</p>
              <p className={`text-xl font-bold text-blue-500`}>{analytics.activeJobs}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.completed', 'Completed')}</p>
              <p className={`text-xl font-bold text-green-500`}>{analytics.completedJobs}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.rushJobs', 'Rush Jobs')}</p>
              <p className={`text-xl font-bold text-red-500`}>{analytics.rushJobs}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.revenue', 'Revenue')}</p>
              <p className={`text-xl font-bold text-green-500`}>{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.pending', 'Pending')}</p>
              <p className={`text-xl font-bold text-orange-500`}>{formatCurrency(analytics.pendingRevenue)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'jobs', label: 'All Jobs', icon: <Printer className="w-4 h-4" /> },
              { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <Layers className="w-4 h-4" /> },
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

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.printJob.searchJobs', 'Search jobs...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
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
                }`}
              >
                <option value="all">{t('tools.printJob.allStatuses', 'All Statuses')}</option>
                {JOB_STATUSES.map((s) => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.printJob.allPriorities', 'All Priorities')}</option>
                {PRIORITIES.map((p) => (
                  <option key={p.priority} value={p.priority}>{p.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowJobForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.printJob.newJob', 'New Job')}
              </button>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.job', 'Job #')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.customer', 'Customer')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.product', 'Product')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.qty', 'Qty')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.dueDate', 'Due Date')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.priority', 'Priority')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.status', 'Status')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.cost', 'Cost')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.printJob.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`py-3 px-4 font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {job.jobNumber}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {job.customerName}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {job.productName}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {job.quantity}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {job.dueDate ? formatDate(job.dueDate) : '-'}
                      </td>
                      <td className="py-3 px-4">{getPriorityBadge(job.priority)}</td>
                      <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatCurrency(job.estimatedCost)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title={t('tools.printJob.viewDetails', 'View Details')}
                          >
                            <Eye className="w-4 h-4 text-[#0D9488]" />
                          </button>
                          <button
                            onClick={() => startEditJob(job)}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title={t('tools.printJob.edit', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredJobs.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Printer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.printJob.noPrintJobsFound', 'No print jobs found')}</p>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="mt-4 text-[#0D9488] hover:underline"
                  >
                    {t('tools.printJob.createYourFirstJob', 'Create your first job')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingJob ? t('tools.printJob.editPrintJob', 'Edit Print Job') : t('tools.printJob.newPrintJob', 'New Print Job')}
                  </h2>
                  <button onClick={resetForm} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printJob.customerInformation', 'Customer Information')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.printJob.customerName', 'Customer Name *')}
                      value={newJob.customerName}
                      onChange={(e) => setNewJob({ ...newJob, customerName: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="email"
                      placeholder={t('tools.printJob.email', 'Email')}
                      value={newJob.customerEmail}
                      onChange={(e) => setNewJob({ ...newJob, customerEmail: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="tel"
                      placeholder={t('tools.printJob.phone', 'Phone')}
                      value={newJob.customerPhone}
                      onChange={(e) => setNewJob({ ...newJob, customerPhone: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printJob.productDetails', 'Product Details')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={newJob.productType}
                      onChange={(e) => setNewJob({ ...newJob, productType: e.target.value as ProductType })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {PRODUCT_TYPES.map((p) => (
                        <option key={p.type} value={p.type}>{p.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={t('tools.printJob.productName', 'Product Name *')}
                      value={newJob.productName}
                      onChange={(e) => setNewJob({ ...newJob, productName: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.printJob.quantity2', 'Quantity')}
                      value={newJob.quantity}
                      onChange={(e) => setNewJob({ ...newJob, quantity: parseInt(e.target.value) || 1 })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <select
                      value={newJob.material}
                      onChange={(e) => setNewJob({ ...newJob, material: e.target.value })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {MATERIALS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <input
                      type="number"
                      placeholder={t('tools.printJob.width', 'Width')}
                      value={newJob.width || ''}
                      onChange={(e) => setNewJob({ ...newJob, width: parseFloat(e.target.value) || 0 })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.printJob.height', 'Height')}
                      value={newJob.height || ''}
                      onChange={(e) => setNewJob({ ...newJob, height: parseFloat(e.target.value) || 0 })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <select
                      value={newJob.unit}
                      onChange={(e) => setNewJob({ ...newJob, unit: e.target.value as 'inches' | 'feet' | 'cm' })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="inches">{t('tools.printJob.inches', 'Inches')}</option>
                      <option value="feet">{t('tools.printJob.feet', 'Feet')}</option>
                      <option value="cm">CM</option>
                    </select>
                  </div>
                </div>

                {/* Finishing Options */}
                <div>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printJob.finishingOptions', 'Finishing Options')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {FINISHING_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleFinishing(option)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          (newJob.finishing || []).includes(option)
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Details */}
                <div>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printJob.jobDetails', 'Job Details')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.dueDate2', 'Due Date')}</label>
                      <input
                        type="date"
                        value={newJob.dueDate}
                        onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.priority2', 'Priority')}</label>
                      <select
                        value={newJob.priority}
                        onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as JobPriority })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.priority} value={p.priority}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.estimatedCost', 'Estimated Cost')}</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newJob.estimatedCost || ''}
                        onChange={(e) => setNewJob({ ...newJob, estimatedCost: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.assignedTo', 'Assigned To')}</label>
                      <input
                        type="text"
                        placeholder={t('tools.printJob.staffName', 'Staff name')}
                        value={newJob.assignedTo}
                        onChange={(e) => setNewJob({ ...newJob, assignedTo: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.notes', 'Notes')}</label>
                  <textarea
                    placeholder={t('tools.printJob.specialInstructionsNotesEtc', 'Special instructions, notes, etc.')}
                    value={newJob.notes}
                    onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div className={`sticky bottom-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.printJob.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={editingJob ? updateJob : addJob}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingJob ? t('tools.printJob.updateJob', 'Update Job') : t('tools.printJob.createJob', 'Create Job')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Job {selectedJob.jobNumber}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Created {formatDate(selectedJob.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedJob.status)}
                  {getPriorityBadge(selectedJob.priority)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.customer2', 'Customer')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedJob.customerName}</p>
                    {selectedJob.customerEmail && <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedJob.customerEmail}</p>}
                    {selectedJob.customerPhone && <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedJob.customerPhone}</p>}
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.product2', 'Product')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedJob.productName}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {PRODUCT_TYPES.find((p) => p.type === selectedJob.productType)?.label}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.quantity', 'Quantity')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedJob.quantity}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.dimensions', 'Dimensions')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.width} x {selectedJob.height} {selectedJob.unit}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.material', 'Material')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedJob.material}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.dueDate3', 'Due Date')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.dueDate ? formatDate(selectedJob.dueDate) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.estimatedCost2', 'Estimated Cost')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedJob.estimatedCost)}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.assignedTo2', 'Assigned To')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedJob.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                {selectedJob.finishing.length > 0 && (
                  <div>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.finishing', 'Finishing')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.finishing.map((f) => (
                        <span key={f} className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.notes && (
                  <div>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.notes2', 'Notes')}</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{selectedJob.notes}</p>
                  </div>
                )}

                {/* Status Update Buttons */}
                <div>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printJob.updateStatus', 'Update Status')}</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_STATUSES.filter((s) => s.status !== selectedJob.status).map((s) => (
                      <button
                        key={s.status}
                        onClick={() => {
                          updateJobStatus(selectedJob.id, s.status);
                          setSelectedJob({ ...selectedJob, status: s.status });
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-medium text-white ${s.color} hover:opacity-90`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 z-50">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PrintJobTool;
