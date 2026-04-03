'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Key,
  MapPin,
  Phone,
  User,
  Car,
  Home,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  Wrench,
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Timer,
  Navigation,
  Package,
  ClipboardList,
  Printer,
  Archive,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Types
type JobType = 'lockout' | 'rekey' | 'install' | 'repair' | 'safe' | 'duplicate';
type PropertyType = 'residential' | 'commercial' | 'automotive' | 'safe';
type UrgencyLevel = 'normal' | 'urgent' | 'emergency';
type JobStatus = 'pending' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';

interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface KeyCode {
  id: string;
  code: string;
  type: string;
  notes: string;
  isSecure: boolean;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  specialties: JobType[];
}

interface Job {
  id: string;
  jobNumber: string;
  createdAt: string;
  updatedAt: string;

  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;

  // Location
  serviceAddress: string;
  latitude?: number;
  longitude?: number;

  // Job Details
  jobType: JobType;
  propertyType: PropertyType;
  urgency: UrgencyLevel;
  isEmergency: boolean;
  description: string;

  // Vehicle Details (for automotive)
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleVin?: string;
  vehicleLicensePlate?: string;

  // Property Details
  propertyDescription?: string;
  lockBrand?: string;
  lockModel?: string;

  // Assignment
  technicianId?: string;
  technicianName?: string;

  // Status & Tracking
  status: JobStatus;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;

  // Travel
  travelTimeMinutes?: number;
  mileage?: number;

  // Parts & Hardware
  parts: Part[];

  // Key Codes
  keyCodes: KeyCode[];

  // Pricing
  laborCost: number;
  partsCost: number;
  travelCost: number;
  emergencyFee: number;
  discount: number;
  totalCost: number;

  // Invoice
  invoiceNumber?: string;
  invoiceGenerated: boolean;
  paid: boolean;

  // Notes
  technicianNotes?: string;
  securityNotes?: string;
}

interface DuplicateKeyOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  keyType: string;
  quantity: number;
  keyCode?: string;
  status: 'pending' | 'ordered' | 'ready' | 'picked_up';
  createdAt: string;
  estimatedReady?: string;
  notes?: string;
}

// Service pricing
const SERVICE_PRICING: Record<JobType, { base: number; description: string }> = {
  lockout: { base: 75, description: 'Emergency lockout service' },
  rekey: { base: 85, description: 'Lock rekeying service' },
  install: { base: 150, description: 'New lock installation' },
  repair: { base: 95, description: 'Lock repair service' },
  safe: { base: 200, description: 'Safe opening/service' },
  duplicate: { base: 15, description: 'Key duplication' }
};

const EMERGENCY_FEE = 50;
const MILEAGE_RATE = 1.25;

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateJobNumber = () => `JOB-${Date.now().toString(36).toUpperCase()}`;
const generateOrderId = () => `ORD-${Date.now().toString(36).toUpperCase()}`;
const generateInvoiceNumber = () => `INV-${Date.now().toString(36).toUpperCase()}`;

// Default technicians
const DEFAULT_TECHNICIANS: Technician[] = [
  { id: '1', name: 'John Smith', phone: '555-0101', available: true, specialties: ['lockout', 'rekey', 'install', 'repair'] },
  { id: '2', name: 'Mike Johnson', phone: '555-0102', available: true, specialties: ['safe', 'install', 'repair'] },
  { id: '3', name: 'Sarah Davis', phone: '555-0103', available: false, specialties: ['lockout', 'rekey', 'duplicate'] },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'jobNumber', header: 'Job #', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'serviceAddress', header: 'Service Address', type: 'string' },
  { key: 'jobType', header: 'Job Type', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'urgency', header: 'Urgency', type: 'string' },
  { key: 'isEmergency', header: 'Emergency', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'laborCost', header: 'Labor Cost', type: 'currency' },
  { key: 'partsCost', header: 'Parts Cost', type: 'currency' },
  { key: 'travelCost', header: 'Travel Cost', type: 'currency' },
  { key: 'emergencyFee', header: 'Emergency Fee', type: 'currency' },
  { key: 'discount', header: 'Discount', type: 'currency' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'invoiceNumber', header: 'Invoice #', type: 'string' },
  { key: 'paid', header: 'Paid', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'completedAt', header: 'Completed', type: 'date' },
];

interface LocksmithToolProps {
  uiConfig?: UIConfig;
}

export function LocksmithTool({ uiConfig }: LocksmithToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence of jobs
  const {
    data: jobs,
    setData: setJobs,
    addItem: addJob,
    updateItem: updateJobItem,
    deleteItem: deleteJobItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Job>('locksmith-tool', [], COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'dispatch' | 'jobs' | 'duplicates' | 'technicians' | 'reports'>('dispatch');
  const [duplicateOrders, setDuplicateOrders] = useState<DuplicateKeyOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>(DEFAULT_TECHNICIANS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [showKeyCode, setShowKeyCode] = useState<Record<string, boolean>>({});

  // Form state for new job
  const [newJob, setNewJob] = useState<Partial<Job>>({
    jobType: 'lockout',
    propertyType: 'residential',
    urgency: 'normal',
    isEmergency: false,
    status: 'pending',
    parts: [],
    keyCodes: [],
    laborCost: 0,
    partsCost: 0,
    travelCost: 0,
    emergencyFee: 0,
    discount: 0,
    totalCost: 0,
    invoiceGenerated: false,
    paid: false
  });

  // Load duplicate orders and technicians from localStorage (jobs are handled by useToolData)
  useEffect(() => {
    const savedDuplicateOrders = localStorage.getItem('locksmith_duplicate_orders');
    const savedTechnicians = localStorage.getItem('locksmith_technicians');
    if (savedDuplicateOrders) {
      try {
        setDuplicateOrders(JSON.parse(savedDuplicateOrders));
      } catch (e) {
        console.error('Failed to load duplicate orders:', e);
      }
    }
    if (savedTechnicians) {
      try {
        setTechnicians(JSON.parse(savedTechnicians));
      } catch (e) {
        console.error('Failed to load technicians:', e);
      }
    }
  }, []);

  // Save duplicate orders to localStorage
  useEffect(() => {
    localStorage.setItem('locksmith_duplicate_orders', JSON.stringify(duplicateOrders));
  }, [duplicateOrders]);

  // Save technicians to localStorage
  useEffect(() => {
    localStorage.setItem('locksmith_technicians', JSON.stringify(technicians));
  }, [technicians]);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.customerName) {
        setNewJob(prev => ({ ...prev, customerName: params.customerName as string }));
        hasChanges = true;
      }
      if (params.phone) {
        setNewJob(prev => ({ ...prev, customerPhone: params.phone as string }));
        hasChanges = true;
      }
      if (params.address) {
        setNewJob(prev => ({ ...prev, serviceAddress: params.address as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate pricing
  const calculatePricing = (job: Partial<Job>) => {
    const basePrice = SERVICE_PRICING[job.jobType || 'lockout'].base;
    const partsCost = job.parts?.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0) || 0;
    const emergencyFee = job.isEmergency ? EMERGENCY_FEE : 0;
    const travelCost = (job.mileage || 0) * MILEAGE_RATE;
    const subtotal = basePrice + partsCost + emergencyFee + travelCost;
    const discount = job.discount || 0;
    const total = subtotal - discount;

    return {
      laborCost: basePrice,
      partsCost,
      emergencyFee,
      travelCost,
      totalCost: Math.max(0, total)
    };
  };

  // Create new job
  const createJob = () => {
    if (!newJob.customerName || !newJob.serviceAddress) {
      setValidationMessage('Please fill in customer name and service address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pricing = calculatePricing(newJob);
    const job: Job = {
      ...newJob as Job,
      id: generateId(),
      jobNumber: generateJobNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...pricing
    };

    addJob(job);
    setNewJob({
      jobType: 'lockout',
      propertyType: 'residential',
      urgency: 'normal',
      isEmergency: false,
      status: 'pending',
      parts: [],
      keyCodes: [],
      laborCost: 0,
      partsCost: 0,
      travelCost: 0,
      emergencyFee: 0,
      discount: 0,
      totalCost: 0,
      invoiceGenerated: false,
      paid: false
    });
    setActiveTab('jobs');
  };

  // Update job
  const updateJob = (updatedJob: Job) => {
    const pricing = calculatePricing(updatedJob);
    const job = {
      ...updatedJob,
      ...pricing,
      updatedAt: new Date().toISOString()
    };

    updateJobItem(job.id, job);
    setSelectedJob(job);
    setIsEditing(false);
  };

  // Delete job
  const deleteJob = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this job?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteJobItem(id);
    if (selectedJob?.id === id) {
      setSelectedJob(null);
    }
  };

  // Dispatch job
  const dispatchJob = (jobId: string, technicianId: string) => {
    const tech = technicians.find(t => t.id === technicianId);
    if (!tech) return;

    updateJobItem(jobId, {
      technicianId,
      technicianName: tech.name,
      status: 'dispatched' as JobStatus,
      dispatchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Update job status
  const updateJobStatus = (jobId: string, status: JobStatus) => {
    const updates: Partial<Job> = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'in_progress') {
      updates.arrivedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    updateJobItem(jobId, updates);
  };

  // Generate invoice
  const generateInvoice = (jobId: string) => {
    updateJobItem(jobId, {
      invoiceNumber: generateInvoiceNumber(),
      invoiceGenerated: true,
      updatedAt: new Date().toISOString()
    });
  };

  // Add part to job
  const addPart = (job: Partial<Job>, part: Omit<Part, 'id'>) => {
    const newPart = { ...part, id: generateId() };
    const updatedParts = [...(job.parts || []), newPart];
    return { ...job, parts: updatedParts };
  };

  // Add key code to job
  const addKeyCode = (job: Partial<Job>, keyCode: Omit<KeyCode, 'id'>) => {
    const newCode = { ...keyCode, id: generateId() };
    const updatedCodes = [...(job.keyCodes || []), newCode];
    return { ...job, keyCodes: updatedCodes };
  };

  // Create duplicate key order
  const createDuplicateOrder = (order: Omit<DuplicateKeyOrder, 'id' | 'orderId' | 'createdAt' | 'status'>) => {
    const newOrder: DuplicateKeyOrder = {
      ...order,
      id: generateId(),
      orderId: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setDuplicateOrders(prev => [newOrder, ...prev]);
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchQuery ||
        job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.serviceAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayJobs = jobs.filter(j => new Date(j.createdAt).toDateString() === today);
    const completedToday = todayJobs.filter(j => j.status === 'completed');
    const emergencyJobs = jobs.filter(j => j.isEmergency);
    const totalRevenue = jobs.filter(j => j.paid).reduce((sum, j) => sum + j.totalCost, 0);
    const pendingRevenue = jobs.filter(j => !j.paid && j.invoiceGenerated).reduce((sum, j) => sum + j.totalCost, 0);

    return {
      todayJobs: todayJobs.length,
      completedToday: completedToday.length,
      emergencyJobs: emergencyJobs.length,
      totalRevenue,
      pendingRevenue,
      activeJobs: jobs.filter(j => ['pending', 'dispatched', 'in_progress'].includes(j.status)).length
    };
  }, [jobs]);

  // Render job type badge
  const renderJobTypeBadge = (type: JobType) => {
    const colors: Record<JobType, string> = {
      lockout: 'bg-red-500',
      rekey: 'bg-blue-500',
      install: 'bg-green-500',
      repair: 'bg-yellow-500',
      safe: 'bg-purple-500',
      duplicate: 'bg-gray-500'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded ${colors[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { color: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-gray-500', icon: <Clock className="w-3 h-3" /> },
      dispatched: { color: 'bg-blue-500', icon: <Navigation className="w-3 h-3" /> },
      in_progress: { color: 'bg-yellow-500', icon: <Wrench className="w-3 h-3" /> },
      completed: { color: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { color: 'bg-red-500', icon: <X className="w-3 h-3" /> }
    };

    const { color, icon } = config[status];

    return (
      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded ${color}`}>
        {icon}
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  // Base styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={textSecondary}>{t('tools.locksmith.loadingJobs', 'Loading jobs...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.locksmith.locksmithServiceManager', 'Locksmith Service Manager')}</h1>
                <p className={textSecondary}>{t('tools.locksmith.dispatchTrackAndManageLocksmith', 'Dispatch, track, and manage locksmith jobs')}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 flex-wrap items-center">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${textSecondary}`}>{t('tools.locksmith.todaySJobs', 'Today\'s Jobs')}</div>
                <div className={`text-xl font-bold ${textPrimary}`}>{stats.todayJobs}</div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${textSecondary}`}>{t('tools.locksmith.active', 'Active')}</div>
                <div className={`text-xl font-bold text-blue-500`}>{stats.activeJobs}</div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${textSecondary}`}>{t('tools.locksmith.emergency', 'Emergency')}</div>
                <div className={`text-xl font-bold text-red-500`}>{stats.emergencyJobs}</div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${textSecondary}`}>{t('tools.locksmith.revenue', 'Revenue')}</div>
                <div className={`text-xl font-bold text-green-500`}>${stats.totalRevenue.toFixed(2)}</div>
              </div>
              <WidgetEmbedButton toolSlug="locksmith" toolName="Locksmith" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'locksmith_jobs' })}
                onExportExcel={() => exportExcel({ filename: 'locksmith_jobs' })}
                onExportJSON={() => exportJSON({ filename: 'locksmith_jobs' })}
                onExportPDF={() => exportPDF({ filename: 'locksmith_jobs', title: 'Locksmith Service Jobs', orientation: 'landscape' })}
                onPrint={() => print('Locksmith Service Jobs')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                disabled={jobs.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { id: 'dispatch', label: 'New Dispatch', icon: <Plus className="w-4 h-4" /> },
              { id: 'jobs', label: 'Jobs', icon: <ClipboardList className="w-4 h-4" /> },
              { id: 'duplicates', label: 'Key Orders', icon: <Copy className="w-4 h-4" /> },
              { id: 'technicians', label: 'Technicians', icon: <User className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* New Dispatch Tab */}
            {activeTab === 'dispatch' && (
              <Card className={cardBg}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${textPrimary}`}>
                    <Plus className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.locksmith.createNewServiceDispatch', 'Create New Service Dispatch')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                        <User className="w-4 h-4" />
                        {t('tools.locksmith.customerInformation', 'Customer Information')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={t('tools.locksmith.customerName', 'Customer Name *')}
                          value={newJob.customerName || ''}
                          onChange={e => setNewJob(prev => ({ ...prev, customerName: e.target.value }))}
                          className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                        />
                        <input
                          type="tel"
                          placeholder={t('tools.locksmith.phoneNumber', 'Phone Number')}
                          value={newJob.customerPhone || ''}
                          onChange={e => setNewJob(prev => ({ ...prev, customerPhone: e.target.value }))}
                          className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                        />
                        <input
                          type="email"
                          placeholder={t('tools.locksmith.emailAddress', 'Email Address')}
                          value={newJob.customerEmail || ''}
                          onChange={e => setNewJob(prev => ({ ...prev, customerEmail: e.target.value }))}
                          className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                        />
                        <input
                          type="text"
                          placeholder={t('tools.locksmith.billingAddress', 'Billing Address')}
                          value={newJob.customerAddress || ''}
                          onChange={e => setNewJob(prev => ({ ...prev, customerAddress: e.target.value }))}
                          className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                    </div>

                    {/* Service Location */}
                    <div>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                        <MapPin className="w-4 h-4" />
                        {t('tools.locksmith.serviceLocation', 'Service Location')}
                      </h3>
                      <input
                        type="text"
                        placeholder={t('tools.locksmith.serviceAddress', 'Service Address *')}
                        value={newJob.serviceAddress || ''}
                        onChange={e => setNewJob(prev => ({ ...prev, serviceAddress: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>

                    {/* Job Details */}
                    <div>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                        <Wrench className="w-4 h-4" />
                        {t('tools.locksmith.jobDetails', 'Job Details')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.jobType', 'Job Type *')}</label>
                          <select
                            value={newJob.jobType}
                            onChange={e => setNewJob(prev => ({ ...prev, jobType: e.target.value as JobType }))}
                            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          >
                            {Object.entries(SERVICE_PRICING).map(([type, info]) => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)} - ${info.base}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.propertyType', 'Property Type')}</label>
                          <select
                            value={newJob.propertyType}
                            onChange={e => setNewJob(prev => ({ ...prev, propertyType: e.target.value as PropertyType }))}
                            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          >
                            <option value="residential">{t('tools.locksmith.residential', 'Residential')}</option>
                            <option value="commercial">{t('tools.locksmith.commercial', 'Commercial')}</option>
                            <option value="automotive">{t('tools.locksmith.automotive', 'Automotive')}</option>
                            <option value="safe">{t('tools.locksmith.safeVault', 'Safe/Vault')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.urgency', 'Urgency')}</label>
                          <select
                            value={newJob.urgency}
                            onChange={e => setNewJob(prev => ({ ...prev, urgency: e.target.value as UrgencyLevel }))}
                            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          >
                            <option value="normal">{t('tools.locksmith.normal', 'Normal')}</option>
                            <option value="urgent">{t('tools.locksmith.urgent', 'Urgent')}</option>
                            <option value="emergency">Emergency (+${EMERGENCY_FEE})</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <label className={`flex items-center gap-2 cursor-pointer ${textPrimary}`}>
                          <input
                            type="checkbox"
                            checked={newJob.isEmergency}
                            onChange={e => setNewJob(prev => ({ ...prev, isEmergency: e.target.checked, urgency: e.target.checked ? 'emergency' : prev.urgency }))}
                            className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          />
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Emergency Call (+${EMERGENCY_FEE} fee)
                        </label>
                      </div>

                      <textarea
                        placeholder={t('tools.locksmith.jobDescription', 'Job Description')}
                        value={newJob.description || ''}
                        onChange={e => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className={`w-full mt-4 px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>

                    {/* Vehicle Details (show if automotive) */}
                    {newJob.propertyType === 'automotive' && (
                      <div>
                        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                          <Car className="w-4 h-4" />
                          {t('tools.locksmith.vehicleDetails', 'Vehicle Details')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.make', 'Make')}
                            value={newJob.vehicleMake || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, vehicleMake: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.model', 'Model')}
                            value={newJob.vehicleModel || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, vehicleModel: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.year', 'Year')}
                            value={newJob.vehicleYear || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, vehicleYear: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.vin', 'VIN')}
                            value={newJob.vehicleVin || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, vehicleVin: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.licensePlate', 'License Plate')}
                            value={newJob.vehicleLicensePlate || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, vehicleLicensePlate: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Property Details (show if not automotive) */}
                    {newJob.propertyType !== 'automotive' && (
                      <div>
                        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                          <Home className="w-4 h-4" />
                          {t('tools.locksmith.propertyDetails', 'Property Details')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.propertyDescription', 'Property Description')}
                            value={newJob.propertyDescription || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, propertyDescription: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.lockBrand', 'Lock Brand')}
                            value={newJob.lockBrand || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, lockBrand: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                          <input
                            type="text"
                            placeholder={t('tools.locksmith.lockModel', 'Lock Model')}
                            value={newJob.lockModel || ''}
                            onChange={e => setNewJob(prev => ({ ...prev, lockModel: e.target.value }))}
                            className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Technician Assignment */}
                    <div>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                        <User className="w-4 h-4" />
                        {t('tools.locksmith.assignTechnician2', 'Assign Technician')}
                      </h3>
                      <select
                        value={newJob.technicianId || ''}
                        onChange={e => {
                          const tech = technicians.find(t => t.id === e.target.value);
                          setNewJob(prev => ({
                            ...prev,
                            technicianId: e.target.value,
                            technicianName: tech?.name
                          }));
                        }}
                        className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.locksmith.selectTechnicianOptional', 'Select Technician (Optional)')}</option>
                        {technicians.filter(t => t.available).map(tech => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name} - {tech.specialties.join(', ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estimated Pricing */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary}`}>
                        <DollarSign className="w-4 h-4" />
                        {t('tools.locksmith.estimatedPricing', 'Estimated Pricing')}
                      </h3>
                      <div className="space-y-2">
                        <div className={`flex justify-between ${textSecondary}`}>
                          <span>Base Service ({newJob.jobType}):</span>
                          <span>${SERVICE_PRICING[newJob.jobType || 'lockout'].base.toFixed(2)}</span>
                        </div>
                        {newJob.isEmergency && (
                          <div className="flex justify-between text-red-500">
                            <span>{t('tools.locksmith.emergencyFee', 'Emergency Fee:')}</span>
                            <span>${EMERGENCY_FEE.toFixed(2)}</span>
                          </div>
                        )}
                        <div className={`border-t pt-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                          <div className={`flex justify-between font-bold ${textPrimary}`}>
                            <span>{t('tools.locksmith.estimatedTotal', 'Estimated Total:')}</span>
                            <span className="text-[#0D9488]">
                              ${(SERVICE_PRICING[newJob.jobType || 'lockout'].base + (newJob.isEmergency ? EMERGENCY_FEE : 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={createJob}
                      className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      {t('tools.locksmith.createServiceDispatch', 'Create Service Dispatch')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <Card className={cardBg}>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between ${textPrimary}`}>
                    <span className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.locksmith.serviceJobs', 'Service Jobs')}
                    </span>
                    <span className={`text-sm font-normal ${textSecondary}`}>
                      {filteredJobs.length} jobs
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-4 flex-wrap">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                      <input
                        type="text"
                        placeholder={t('tools.locksmith.searchJobs', 'Search jobs...')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as JobStatus | 'all')}
                      className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="all">{t('tools.locksmith.allStatus', 'All Status')}</option>
                      <option value="pending">{t('tools.locksmith.pending', 'Pending')}</option>
                      <option value="dispatched">{t('tools.locksmith.dispatched', 'Dispatched')}</option>
                      <option value="in_progress">{t('tools.locksmith.inProgress', 'In Progress')}</option>
                      <option value="completed">{t('tools.locksmith.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.locksmith.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>

                  {/* Jobs List */}
                  <div className="space-y-3">
                    {filteredJobs.length === 0 ? (
                      <div className={`text-center py-8 ${textSecondary}`}>
                        <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t('tools.locksmith.noJobsFound', 'No jobs found')}</p>
                      </div>
                    ) : (
                      filteredJobs.map(job => (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedJob?.id === job.id
                              ? 'border-[#0D9488] bg-[#0D9488]/10'
                              : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-mono text-sm ${textSecondary}`}>{job.jobNumber}</span>
                                {renderJobTypeBadge(job.jobType)}
                                {renderStatusBadge(job.status)}
                                {job.isEmergency && (
                                  <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded">
                                    <AlertTriangle className="w-3 h-3" />
                                    {t('tools.locksmith.emergency2', 'Emergency')}
                                  </span>
                                )}
                              </div>
                              <h4 className={`font-semibold ${textPrimary}`}>{job.customerName}</h4>
                              <p className={`text-sm ${textSecondary} flex items-center gap-1`}>
                                <MapPin className="w-3 h-3" />
                                {job.serviceAddress}
                              </p>
                              {job.technicianName && (
                                <p className={`text-sm ${textSecondary} flex items-center gap-1 mt-1`}>
                                  <User className="w-3 h-3" />
                                  {job.technicianName}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-lg text-[#0D9488]`}>
                                ${job.totalCost.toFixed(2)}
                              </div>
                              <div className={`text-xs ${textSecondary}`}>
                                {new Date(job.createdAt).toLocaleDateString()}
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

            {/* Duplicate Key Orders Tab */}
            {activeTab === 'duplicates' && (
              <Card className={cardBg}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${textPrimary}`}>
                    <Copy className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.locksmith.duplicateKeyOrders', 'Duplicate Key Orders')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* New Order Form */}
                  <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-semibold mb-3 ${textPrimary}`}>{t('tools.locksmith.newKeyOrder', 'New Key Order')}</h4>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        createDuplicateOrder({
                          customerName: formData.get('customerName') as string,
                          customerPhone: formData.get('customerPhone') as string,
                          keyType: formData.get('keyType') as string,
                          quantity: parseInt(formData.get('quantity') as string) || 1,
                          keyCode: formData.get('keyCode') as string,
                          notes: formData.get('notes') as string
                        });
                        form.reset();
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <input
                        name="customerName"
                        type="text"
                        placeholder={t('tools.locksmith.customerName2', 'Customer Name *')}
                        required
                        className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                      <input
                        name="customerPhone"
                        type="tel"
                        placeholder={t('tools.locksmith.phoneNumber2', 'Phone Number')}
                        className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                      <input
                        name="keyType"
                        type="text"
                        placeholder={t('tools.locksmith.keyType', 'Key Type *')}
                        required
                        className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                      <input
                        name="quantity"
                        type="number"
                        min="1"
                        defaultValue="1"
                        placeholder={t('tools.locksmith.quantity', 'Quantity')}
                        className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                      <input
                        name="keyCode"
                        type="text"
                        placeholder={t('tools.locksmith.keyCodeOptional', 'Key Code (optional)')}
                        className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                      <input
                        name="notes"
                        type="text"
                        placeholder={t('tools.locksmith.notes', 'Notes')}
                        className={`px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-[#0D9488]`}
                      />
                      <button
                        type="submit"
                        className="md:col-span-2 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
                      >
                        {t('tools.locksmith.createOrder', 'Create Order')}
                      </button>
                    </form>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-3">
                    {duplicateOrders.length === 0 ? (
                      <div className={`text-center py-8 ${textSecondary}`}>
                        <Copy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t('tools.locksmith.noKeyOrdersYet', 'No key orders yet')}</p>
                      </div>
                    ) : (
                      duplicateOrders.map(order => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-mono text-sm ${textSecondary}`}>{order.orderId}</span>
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  order.status === 'ready' ? 'bg-green-500 text-white' :
                                  order.status === 'picked_up' ? 'bg-gray-500 text-white' :
                                  order.status === 'ordered' ? 'bg-blue-500 text-white' :
                                  'bg-yellow-500 text-white'
                                }`}>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </div>
                              <h4 className={`font-semibold ${textPrimary}`}>{order.customerName}</h4>
                              <p className={`text-sm ${textSecondary}`}>
                                {order.keyType} x{order.quantity}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={order.status}
                                onChange={e => {
                                  setDuplicateOrders(prev => prev.map(o =>
                                    o.id === order.id ? { ...o, status: e.target.value as DuplicateKeyOrder['status'] } : o
                                  ));
                                }}
                                className={`px-2 py-1 text-sm rounded border ${inputBg}`}
                              >
                                <option value="pending">{t('tools.locksmith.pending2', 'Pending')}</option>
                                <option value="ordered">{t('tools.locksmith.ordered', 'Ordered')}</option>
                                <option value="ready">{t('tools.locksmith.ready', 'Ready')}</option>
                                <option value="picked_up">{t('tools.locksmith.pickedUp', 'Picked Up')}</option>
                              </select>
                              <button
                                onClick={() => setDuplicateOrders(prev => prev.filter(o => o.id !== order.id))}
                                className="p-1 text-red-500 hover:bg-red-500/10 rounded"
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

            {/* Technicians Tab */}
            {activeTab === 'technicians' && (
              <Card className={cardBg}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${textPrimary}`}>
                    <User className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.locksmith.technicians', 'Technicians')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {technicians.map(tech => (
                      <div
                        key={tech.id}
                        className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tech.available ? 'bg-green-500' : 'bg-gray-500'
                            }`}>
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${textPrimary}`}>{tech.name}</h4>
                              <p className={`text-sm ${textSecondary} flex items-center gap-1`}>
                                <Phone className="w-3 h-3" />
                                {tech.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1 flex-wrap">
                              {tech.specialties.map(s => (
                                <span
                                  key={s}
                                  className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${textSecondary}`}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tech.available}
                                onChange={() => {
                                  setTechnicians(prev => prev.map(t =>
                                    t.id === tech.id ? { ...t, available: !t.available } : t
                                  ));
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                              />
                              <span className={`text-sm ${tech.available ? 'text-green-500' : textSecondary}`}>
                                {tech.available ? t('tools.locksmith.available', 'Available') : t('tools.locksmith.unavailable', 'Unavailable')}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <Card className={cardBg}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${textPrimary}`}>
                    <FileText className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.locksmith.reportsAnalytics', 'Reports & Analytics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`text-sm ${textSecondary}`}>{t('tools.locksmith.totalJobs', 'Total Jobs')}</div>
                      <div className={`text-3xl font-bold ${textPrimary}`}>{jobs.length}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`text-sm ${textSecondary}`}>{t('tools.locksmith.completedJobs', 'Completed Jobs')}</div>
                      <div className={`text-3xl font-bold text-green-500`}>
                        {jobs.filter(j => j.status === 'completed').length}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`text-sm ${textSecondary}`}>{t('tools.locksmith.totalRevenue', 'Total Revenue')}</div>
                      <div className={`text-3xl font-bold text-[#0D9488]`}>
                        ${stats.totalRevenue.toFixed(2)}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`text-sm ${textSecondary}`}>{t('tools.locksmith.pendingRevenue', 'Pending Revenue')}</div>
                      <div className={`text-3xl font-bold text-yellow-500`}>
                        ${stats.pendingRevenue.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Job Types Breakdown */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-semibold mb-3 ${textPrimary}`}>{t('tools.locksmith.jobsByType', 'Jobs by Type')}</h4>
                    <div className="space-y-2">
                      {Object.keys(SERVICE_PRICING).map(type => {
                        const count = jobs.filter(j => j.jobType === type).length;
                        const percentage = jobs.length > 0 ? (count / jobs.length) * 100 : 0;
                        return (
                          <div key={type}>
                            <div className="flex justify-between mb-1">
                              <span className={`capitalize ${textSecondary}`}>{type}</span>
                              <span className={textPrimary}>{count}</span>
                            </div>
                            <div className={`h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                              <div
                                className="h-full rounded-full bg-[#0D9488]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel - Job Details */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <Card className={`${cardBg} sticky top-4`}>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between ${textPrimary}`}>
                    <span className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.locksmith.jobDetails2', 'Job Details')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2 rounded-lg ${hoverBg}`}
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteJob(selectedJob.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Job Number and Status */}
                  <div>
                    <div className={`font-mono text-sm ${textSecondary}`}>{selectedJob.jobNumber}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderJobTypeBadge(selectedJob.jobType)}
                      {renderStatusBadge(selectedJob.status)}
                      {selectedJob.isEmergency && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.updateStatus', 'Update Status')}</label>
                    <select
                      value={selectedJob.status}
                      onChange={e => updateJobStatus(selectedJob.id, e.target.value as JobStatus)}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="pending">{t('tools.locksmith.pending3', 'Pending')}</option>
                      <option value="dispatched">{t('tools.locksmith.dispatched2', 'Dispatched')}</option>
                      <option value="in_progress">{t('tools.locksmith.inProgress2', 'In Progress')}</option>
                      <option value="completed">{t('tools.locksmith.completed2', 'Completed')}</option>
                      <option value="cancelled">{t('tools.locksmith.cancelled2', 'Cancelled')}</option>
                    </select>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 ${textPrimary}`}>{t('tools.locksmith.customer', 'Customer')}</h4>
                    <div className={`text-sm space-y-1 ${textSecondary}`}>
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedJob.customerName}
                      </p>
                      {selectedJob.customerPhone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedJob.customerPhone}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.serviceAddress}
                      </p>
                    </div>
                  </div>

                  {/* Technician Assignment */}
                  {!selectedJob.technicianId && selectedJob.status === 'pending' && (
                    <div>
                      <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.assignTechnician', 'Assign Technician')}</label>
                      <div className="flex gap-2">
                        <select
                          id="tech-select"
                          className={`flex-1 px-3 py-2 rounded-lg border ${inputBg}`}
                        >
                          <option value="">{t('tools.locksmith.select', 'Select...')}</option>
                          {technicians.filter(t => t.available).map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const select = document.getElementById('tech-select') as HTMLSelectElement;
                            if (select.value) {
                              dispatchJob(selectedJob.id, select.value);
                            }
                          }}
                          className="px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                        >
                          {t('tools.locksmith.dispatch', 'Dispatch')}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedJob.technicianName && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-1 ${textPrimary}`}>{t('tools.locksmith.assignedTo', 'Assigned To')}</h4>
                      <p className={`text-sm ${textSecondary} flex items-center gap-2`}>
                        <User className="w-4 h-4" />
                        {selectedJob.technicianName}
                      </p>
                    </div>
                  )}

                  {/* Travel Time & Mileage */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.travelTimeMin', 'Travel Time (min)')}</label>
                      <input
                        type="number"
                        value={selectedJob.travelTimeMinutes || ''}
                        onChange={e => {
                          const updated = { ...selectedJob, travelTimeMinutes: parseInt(e.target.value) || 0 };
                          updateJob(updated);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.mileage', 'Mileage')}</label>
                      <input
                        type="number"
                        value={selectedJob.mileage || ''}
                        onChange={e => {
                          const updated = { ...selectedJob, mileage: parseFloat(e.target.value) || 0 };
                          updateJob(updated);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Parts & Hardware */}
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 flex items-center justify-between ${textPrimary}`}>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {t('tools.locksmith.partsHardware', 'Parts & Hardware')}
                      </span>
                      <button
                        onClick={() => {
                          const name = prompt('Part name:');
                          const qty = parseInt(prompt('Quantity:') || '1');
                          const price = parseFloat(prompt('Unit price:') || '0');
                          if (name) {
                            const updated = addPart(selectedJob, { name, quantity: qty, unitPrice: price });
                            updateJob(updated as Job);
                          }
                        }}
                        className="text-[#0D9488] hover:underline text-sm"
                      >
                        {t('tools.locksmith.add', '+ Add')}
                      </button>
                    </h4>
                    {selectedJob.parts.length === 0 ? (
                      <p className={`text-sm ${textSecondary}`}>{t('tools.locksmith.noPartsAdded', 'No parts added')}</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedJob.parts.map(part => (
                          <div key={part.id} className={`flex justify-between text-sm ${textSecondary}`}>
                            <span>{part.name} x{part.quantity}</span>
                            <span>${(part.quantity * part.unitPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key Codes */}
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 flex items-center justify-between ${textPrimary}`}>
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {t('tools.locksmith.keyCodes', 'Key Codes')}
                      </span>
                      <button
                        onClick={() => {
                          const code = prompt('Key code:');
                          const type = prompt('Key type:') || 'Standard';
                          const notes = prompt('Security notes:') || '';
                          if (code) {
                            const updated = addKeyCode(selectedJob, { code, type, notes, isSecure: true });
                            updateJob(updated as Job);
                          }
                        }}
                        className="text-[#0D9488] hover:underline text-sm"
                      >
                        {t('tools.locksmith.add2', '+ Add')}
                      </button>
                    </h4>
                    {selectedJob.keyCodes.length === 0 ? (
                      <p className={`text-sm ${textSecondary}`}>{t('tools.locksmith.noKeyCodesRecorded', 'No key codes recorded')}</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedJob.keyCodes.map(kc => (
                          <div key={kc.id} className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${textSecondary}`}>{kc.type}</span>
                              <button
                                onClick={() => setShowKeyCode(prev => ({ ...prev, [kc.id]: !prev[kc.id] }))}
                                className="text-[#0D9488] text-sm"
                              >
                                {showKeyCode[kc.id] ? t('tools.locksmith.hide', 'Hide') : t('tools.locksmith.show', 'Show')}
                              </button>
                            </div>
                            <div className={`font-mono text-sm ${textPrimary}`}>
                              {showKeyCode[kc.id] ? kc.code : '********'}
                            </div>
                            {kc.notes && (
                              <p className={`text-xs ${textSecondary} mt-1`}>
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                {kc.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Summary */}
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`text-sm font-semibold mb-2 ${textPrimary}`}>{t('tools.locksmith.pricing', 'Pricing')}</h4>
                    <div className={`space-y-1 text-sm ${textSecondary}`}>
                      <div className="flex justify-between">
                        <span>{t('tools.locksmith.labor', 'Labor:')}</span>
                        <span>${selectedJob.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('tools.locksmith.parts', 'Parts:')}</span>
                        <span>${selectedJob.partsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travel ({selectedJob.mileage || 0} mi):</span>
                        <span>${selectedJob.travelCost.toFixed(2)}</span>
                      </div>
                      {selectedJob.emergencyFee > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>{t('tools.locksmith.emergencyFee2', 'Emergency Fee:')}</span>
                          <span>${selectedJob.emergencyFee.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedJob.discount > 0 && (
                        <div className="flex justify-between text-green-500">
                          <span>{t('tools.locksmith.discount', 'Discount:')}</span>
                          <span>-${selectedJob.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={`flex justify-between pt-2 border-t font-bold ${isDark ? 'border-gray-600' : 'border-gray-300'} ${textPrimary}`}>
                        <span>{t('tools.locksmith.total', 'Total:')}</span>
                        <span className="text-[#0D9488]">${selectedJob.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {!selectedJob.invoiceGenerated && selectedJob.status === 'completed' && (
                      <button
                        onClick={() => generateInvoice(selectedJob.id)}
                        className="w-full py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {t('tools.locksmith.generateInvoice', 'Generate Invoice')}
                      </button>
                    )}

                    {selectedJob.invoiceGenerated && (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'} text-green-600`}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Invoice: {selectedJob.invoiceNumber}
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedJob.paid}
                              onChange={() => {
                                const updated = { ...selectedJob, paid: !selectedJob.paid };
                                updateJob(updated);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-green-500"
                            />
                            {t('tools.locksmith.paid', 'Paid')}
                          </label>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const jobData = JSON.stringify(selectedJob, null, 2);
                        const blob = new Blob([jobData], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedJob.jobNumber}.json`;
                        a.click();
                      }}
                      className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      {t('tools.locksmith.exportJobData', 'Export Job Data')}
                    </button>
                  </div>

                  {/* Technician Notes */}
                  <div>
                    <label className={`block text-sm mb-1 ${textSecondary}`}>{t('tools.locksmith.technicianNotes', 'Technician Notes')}</label>
                    <textarea
                      value={selectedJob.technicianNotes || ''}
                      onChange={e => {
                        const updated = { ...selectedJob, technicianNotes: e.target.value };
                        setSelectedJob(updated);
                      }}
                      onBlur={() => selectedJob && updateJob(selectedJob)}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.locksmith.addNotes', 'Add notes...')}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={cardBg}>
                <CardContent className="py-12">
                  <div className={`text-center ${textSecondary}`}>
                    <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.locksmith.selectAJobToView', 'Select a job to view details')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocksmithTool;
