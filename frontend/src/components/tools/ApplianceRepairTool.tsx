'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Wrench,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  AlertCircle,
  ClipboardList,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Settings,
  History,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface Part {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  ordered: boolean;
  orderDate?: string;
  arrivalDate?: string;
}

interface ServiceCall {
  id: string;
  date: string;
  time: string;
  type: 'initial' | 'follow-up' | 'warranty';
  notes: string;
  completed: boolean;
}

interface RepairJob {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  // Appliance Details
  applianceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  // Problem & Diagnosis
  problemDescription: string;
  diagnosticNotes: string;
  repairCode: string;
  // Parts
  parts: Part[];
  // Technician
  technicianId: string;
  technicianName: string;
  // Service Calls
  serviceCalls: ServiceCall[];
  // Pricing
  laborHours: number;
  laborRate: number;
  diagnosticFee: number;
  discount: number;
  taxRate: number;
  // Warranty
  warrantyStatus: 'valid' | 'expired' | 'none' | 'pending';
  warrantyExpiry: string;
  warrantyNotes: string;
  // Status
  status: 'pending' | 'diagnosed' | 'parts-ordered' | 'in-progress' | 'completed' | 'cancelled';
  // Follow-up
  followUpDate: string;
  followUpNotes: string;
}

// Common repair codes reference
const REPAIR_CODES = [
  { code: 'E01', description: 'Motor failure', category: 'Major' },
  { code: 'E02', description: 'Compressor issue', category: 'Major' },
  { code: 'E03', description: 'Control board malfunction', category: 'Major' },
  { code: 'E04', description: 'Heating element failure', category: 'Moderate' },
  { code: 'E05', description: 'Thermostat malfunction', category: 'Moderate' },
  { code: 'E06', description: 'Door seal/gasket worn', category: 'Minor' },
  { code: 'E07', description: 'Water pump failure', category: 'Moderate' },
  { code: 'E08', description: 'Drain clog/blockage', category: 'Minor' },
  { code: 'E09', description: 'Belt worn/broken', category: 'Minor' },
  { code: 'E10', description: 'Fan motor issue', category: 'Moderate' },
  { code: 'E11', description: 'Sensor malfunction', category: 'Moderate' },
  { code: 'E12', description: 'Electrical connection issue', category: 'Minor' },
  { code: 'E13', description: 'Refrigerant leak', category: 'Major' },
  { code: 'E14', description: 'Ice maker failure', category: 'Moderate' },
  { code: 'E15', description: 'Timer malfunction', category: 'Minor' },
];

const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washing Machine',
  'Dryer',
  'Dishwasher',
  'Oven/Range',
  'Microwave',
  'Air Conditioner',
  'Freezer',
  'Garbage Disposal',
  'Ice Maker',
  'Water Heater',
  'HVAC System',
  'Other',
];

const TECHNICIANS = [
  { id: 'tech-001', name: 'John Smith', specialties: ['HVAC', 'Refrigeration'] },
  { id: 'tech-002', name: 'Maria Garcia', specialties: ['Washers', 'Dryers'] },
  { id: 'tech-003', name: 'David Johnson', specialties: ['General Appliances'] },
  { id: 'tech-004', name: 'Sarah Williams', specialties: ['Electronics', 'Control Boards'] },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'diagnosed', label: 'Diagnosed', color: 'blue' },
  { value: 'parts-ordered', label: 'Parts Ordered', color: 'purple' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Job ID', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerAddress', header: 'Address', type: 'string' },
  { key: 'applianceType', header: 'Appliance Type', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'problemDescription', header: 'Problem', type: 'string' },
  { key: 'repairCode', header: 'Repair Code', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'laborHours', header: 'Labor Hours', type: 'number' },
  { key: 'laborRate', header: 'Labor Rate', type: 'currency' },
  { key: 'diagnosticFee', header: 'Diagnostic Fee', type: 'currency' },
  { key: 'warrantyStatus', header: 'Warranty Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyJob = (): RepairJob => ({
  id: generateId(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  applianceType: '',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  problemDescription: '',
  diagnosticNotes: '',
  repairCode: '',
  parts: [],
  technicianId: '',
  technicianName: '',
  serviceCalls: [],
  laborHours: 0,
  laborRate: 75,
  diagnosticFee: 50,
  discount: 0,
  taxRate: 8.25,
  warrantyStatus: 'pending',
  warrantyExpiry: '',
  warrantyNotes: '',
  status: 'pending',
  followUpDate: '',
  followUpNotes: '',
});

interface ApplianceRepairToolProps {
  uiConfig?: UIConfig;
}

export const ApplianceRepairTool = ({ uiConfig }: ApplianceRepairToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: jobs,
    setData: setJobs,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<RepairJob>('appliance-repair', [], COLUMNS);

  const [currentJob, setCurrentJob] = useState<RepairJob>(createEmptyJob());
  const [activeTab, setActiveTab] = useState<'customer' | 'appliance' | 'diagnosis' | 'parts' | 'service' | 'pricing' | 'warranty' | 'invoice'>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJobList, setShowJobList] = useState(true);
  const [showRepairCodes, setShowRepairCodes] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        const restoredJob = createEmptyJob();
        restoredJob.customerName = params.customerName || '';
        restoredJob.customerPhone = params.customerPhone || '';
        restoredJob.customerEmail = params.customerEmail || '';
        restoredJob.customerAddress = params.customerAddress || '';
        restoredJob.applianceType = params.applianceType || '';
        restoredJob.brand = params.brand || '';
        restoredJob.model = params.model || '';
        restoredJob.serialNumber = params.serialNumber || '';
        restoredJob.purchaseDate = params.purchaseDate || '';
        restoredJob.problemDescription = params.problemDescription || '';
        restoredJob.diagnosticNotes = params.diagnosticNotes || '';
        restoredJob.repairCode = params.repairCode || '';
        restoredJob.technicianId = params.technicianId || '';
        restoredJob.technicianName = params.technicianName || '';
        restoredJob.laborHours = params.laborHours || 0;
        restoredJob.laborRate = params.laborRate || 75;
        restoredJob.diagnosticFee = params.diagnosticFee || 50;
        restoredJob.discount = params.discount || 0;
        restoredJob.warrantyStatus = params.warrantyStatus || 'pending';
        restoredJob.warrantyExpiry = params.warrantyExpiry || '';
        restoredJob.warrantyNotes = params.warrantyNotes || '';
        restoredJob.status = params.status || 'pending';
        setCurrentJob(restoredJob);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else if (params.customerName || params.applianceType || params.problemDescription) {
        // Regular prefill from AI
        const newJob = createEmptyJob();
        if (params.customerName) newJob.customerName = params.customerName;
        if (params.applianceType) newJob.applianceType = params.applianceType;
        if (params.problemDescription) newJob.problemDescription = params.problemDescription;
        setCurrentJob(newJob);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Calculate totals
  const pricing = useMemo(() => {
    const partsTotal = currentJob.parts.reduce((sum, part) => sum + part.quantity * part.unitPrice, 0);
    const laborTotal = currentJob.laborHours * currentJob.laborRate;
    const subtotal = partsTotal + laborTotal + currentJob.diagnosticFee;
    const discountAmount = subtotal * (currentJob.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (currentJob.taxRate / 100);
    const total = afterDiscount + taxAmount;

    return {
      partsTotal,
      laborTotal,
      subtotal,
      discountAmount,
      afterDiscount,
      taxAmount,
      total,
    };
  }, [currentJob]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        job.customerName.toLowerCase().includes(query) ||
        job.customerPhone.includes(query) ||
        job.serialNumber.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
    );
  }, [jobs, searchQuery]);

  // Handlers
  const handleSaveJob = () => {
    const updatedJob = { ...currentJob, updatedAt: new Date().toISOString() };
    const existingJob = jobs.find((j) => j.id === currentJob.id);

    if (existingJob) {
      updateItem(currentJob.id, updatedJob);
    } else {
      addItem(updatedJob);
    }

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'appliance-repair',
        customerName: currentJob.customerName,
        customerPhone: currentJob.customerPhone,
        customerEmail: currentJob.customerEmail,
        customerAddress: currentJob.customerAddress,
        applianceType: currentJob.applianceType,
        brand: currentJob.brand,
        model: currentJob.model,
        serialNumber: currentJob.serialNumber,
        purchaseDate: currentJob.purchaseDate,
        problemDescription: currentJob.problemDescription,
        diagnosticNotes: currentJob.diagnosticNotes,
        repairCode: currentJob.repairCode,
        technicianId: currentJob.technicianId,
        technicianName: currentJob.technicianName,
        laborHours: currentJob.laborHours,
        laborRate: currentJob.laborRate,
        diagnosticFee: currentJob.diagnosticFee,
        discount: currentJob.discount,
        warrantyStatus: currentJob.warrantyStatus,
        warrantyExpiry: currentJob.warrantyExpiry,
        warrantyNotes: currentJob.warrantyNotes,
        status: currentJob.status,
      });
    }

    setCurrentJob(updatedJob);
    setSaveMessage({ type: 'success', text: 'Job saved successfully!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleNewJob = () => {
    setCurrentJob(createEmptyJob());
    setActiveTab('customer');
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(jobId);
      if (currentJob.id === jobId) {
        setCurrentJob(createEmptyJob());
      }
    }
  };

  const handleSelectJob = (job: RepairJob) => {
    setCurrentJob(job);
    setShowJobList(false);
  };

  // Part handlers
  const handleAddPart = () => {
    const newPart: Part = {
      id: generateId(),
      name: '',
      partNumber: '',
      quantity: 1,
      unitPrice: 0,
      ordered: false,
    };
    setCurrentJob({ ...currentJob, parts: [...currentJob.parts, newPart] });
  };

  const handleUpdatePart = (partId: string, updates: Partial<Part>) => {
    const updatedParts = currentJob.parts.map((p) => (p.id === partId ? { ...p, ...updates } : p));
    setCurrentJob({ ...currentJob, parts: updatedParts });
  };

  const handleRemovePart = (partId: string) => {
    setCurrentJob({ ...currentJob, parts: currentJob.parts.filter((p) => p.id !== partId) });
  };

  // Service call handlers
  const handleAddServiceCall = () => {
    const newCall: ServiceCall = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'initial',
      notes: '',
      completed: false,
    };
    setCurrentJob({ ...currentJob, serviceCalls: [...currentJob.serviceCalls, newCall] });
  };

  const handleUpdateServiceCall = (callId: string, updates: Partial<ServiceCall>) => {
    const updatedCalls = currentJob.serviceCalls.map((c) => (c.id === callId ? { ...c, ...updates } : c));
    setCurrentJob({ ...currentJob, serviceCalls: updatedCalls });
  };

  const handleRemoveServiceCall = (callId: string) => {
    setCurrentJob({ ...currentJob, serviceCalls: currentJob.serviceCalls.filter((c) => c.id !== callId) });
  };

  // Technician selection
  const handleTechnicianSelect = (techId: string) => {
    const tech = TECHNICIANS.find((t) => t.id === techId);
    setCurrentJob({
      ...currentJob,
      technicianId: techId,
      technicianName: tech?.name || '',
    });
  };

  // Generate Invoice
  const generateInvoice = () => {
    const invoiceContent = `
APPLIANCE REPAIR INVOICE
========================
Invoice #: INV-${currentJob.id.toUpperCase()}
Date: ${new Date().toLocaleDateString()}

CUSTOMER INFORMATION
--------------------
Name: ${currentJob.customerName}
Phone: ${currentJob.customerPhone}
Email: ${currentJob.customerEmail}
Address: ${currentJob.customerAddress}

APPLIANCE DETAILS
-----------------
Type: ${currentJob.applianceType}
Brand: ${currentJob.brand}
Model: ${currentJob.model}
Serial: ${currentJob.serialNumber}

REPAIR DETAILS
--------------
Repair Code: ${currentJob.repairCode}
Problem: ${currentJob.problemDescription}
Technician: ${currentJob.technicianName}

PARTS
-----
${currentJob.parts.map((p) => `${p.name} (${p.partNumber}) x${p.quantity} @ $${p.unitPrice.toFixed(2)} = $${(p.quantity * p.unitPrice).toFixed(2)}`).join('\n') || 'No parts'}

PRICING
-------
Parts Total: $${pricing.partsTotal.toFixed(2)}
Labor (${currentJob.laborHours} hrs @ $${currentJob.laborRate}/hr): $${pricing.laborTotal.toFixed(2)}
Diagnostic Fee: $${currentJob.diagnosticFee.toFixed(2)}
Subtotal: $${pricing.subtotal.toFixed(2)}
Discount (${currentJob.discount}%): -$${pricing.discountAmount.toFixed(2)}
Tax (${currentJob.taxRate}%): $${pricing.taxAmount.toFixed(2)}
========================
TOTAL: $${pricing.total.toFixed(2)}

WARRANTY STATUS: ${currentJob.warrantyStatus.toUpperCase()}
${currentJob.warrantyExpiry ? `Warranty Expires: ${currentJob.warrantyExpiry}` : ''}

Thank you for your business!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${currentJob.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    switch (statusOption?.color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const inputClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]`;

  const labelClasses = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const tabClasses = (isActive: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#0D9488] text-white'
        : theme === 'dark'
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.applianceRepair.loadingRepairJobs', 'Loading repair jobs...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.applianceRepair.applianceRepairServiceManager', 'Appliance Repair Service Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.applianceRepair.manageRepairsTrackPartsSchedule', 'Manage repairs, track parts, schedule service calls, and generate invoices')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="appliance-repair" toolName="Appliance Repair" />

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
                onExportCSV={() => exportCSV({ filename: 'appliance-repair-jobs' })}
                onExportExcel={() => exportExcel({ filename: 'appliance-repair-jobs' })}
                onExportJSON={() => exportJSON({ filename: 'appliance-repair-jobs' })}
                onExportPDF={() => exportPDF({
                  filename: 'appliance-repair-jobs',
                  title: 'Appliance Repair Jobs',
                  subtitle: 'Service Records Report',
                  orientation: 'landscape'
                })}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onPrint={() => print('Appliance Repair Jobs')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                disabled={jobs.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={() => setShowJobList(!showJobList)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <History className="w-4 h-4" />
                {showJobList ? t('tools.applianceRepair.hide', 'Hide') : t('tools.applianceRepair.show', 'Show')} Jobs
              </button>
              <button
                onClick={handleNewJob}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.applianceRepair.newJob', 'New Job')}
              </button>
            </div>
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="mt-4 p-3 bg-[#0D9488]/10 border border-[#0D9488]/20 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.applianceRepair.fieldsHaveBeenPrefilledFrom', 'Fields have been prefilled from AI suggestions')}
              </span>
            </div>
          )}
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {saveMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {saveMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Job List Sidebar */}
          {showJobList && (
            <div className={`lg:col-span-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="mb-4">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.applianceRepair.searchJobs', 'Search jobs...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredJobs.length === 0 ? (
                  <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.applianceRepair.noJobsFound', 'No jobs found')}
                  </p>
                ) : (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        currentJob.id === job.id
                          ? 'border-[#0D9488] bg-[#0D9488]/10'
                          : theme === 'dark'
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {job.customerName || 'Unnamed Customer'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(job.status)}`}>
                          {STATUS_OPTIONS.find((s) => s.value === job.status)?.label}
                        </span>
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {job.applianceType} - {job.brand}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        ID: {job.id}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`${showJobList ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Status Bar */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.applianceRepair.jobId', 'Job ID')}</span>
                    <p className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currentJob.id}
                    </p>
                  </div>
                  <div>
                    <label className={labelClasses}>{t('tools.applianceRepair.status', 'Status')}</label>
                    <select
                      value={currentJob.status}
                      onChange={(e) => setCurrentJob({ ...currentJob, status: e.target.value as RepairJob['status'] })}
                      className={`${inputClasses} py-1`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveJob}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.applianceRepair.saveJob', 'Save Job')}
                  </button>
                  <button
                    onClick={generateInvoice}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    {t('tools.applianceRepair.invoice', 'Invoice')}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setActiveTab('customer')} className={tabClasses(activeTab === 'customer')}>
                <User className="w-4 h-4 inline mr-1" /> Customer
              </button>
              <button onClick={() => setActiveTab('appliance')} className={tabClasses(activeTab === 'appliance')}>
                <Package className="w-4 h-4 inline mr-1" /> Appliance
              </button>
              <button onClick={() => setActiveTab('diagnosis')} className={tabClasses(activeTab === 'diagnosis')}>
                <ClipboardList className="w-4 h-4 inline mr-1" /> Diagnosis
              </button>
              <button onClick={() => setActiveTab('parts')} className={tabClasses(activeTab === 'parts')}>
                <Settings className="w-4 h-4 inline mr-1" /> Parts
              </button>
              <button onClick={() => setActiveTab('service')} className={tabClasses(activeTab === 'service')}>
                <Calendar className="w-4 h-4 inline mr-1" /> Service
              </button>
              <button onClick={() => setActiveTab('pricing')} className={tabClasses(activeTab === 'pricing')}>
                <DollarSign className="w-4 h-4 inline mr-1" /> Pricing
              </button>
              <button onClick={() => setActiveTab('warranty')} className={tabClasses(activeTab === 'warranty')}>
                <Shield className="w-4 h-4 inline mr-1" /> Warranty
              </button>
              <button onClick={() => setActiveTab('invoice')} className={tabClasses(activeTab === 'invoice')}>
                <FileText className="w-4 h-4 inline mr-1" /> Invoice
              </button>
            </div>

            {/* Tab Content */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              {/* Customer Information Tab */}
              {activeTab === 'customer' && (
                <div className="space-y-4">
                  <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.applianceRepair.customerInformation', 'Customer Information')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.customerName', 'Customer Name *')}</label>
                      <div className="relative">
                        <User
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                        <input
                          type="text"
                          value={currentJob.customerName}
                          onChange={(e) => setCurrentJob({ ...currentJob, customerName: e.target.value })}
                          placeholder={t('tools.applianceRepair.fullName', 'Full name')}
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.phoneNumber', 'Phone Number *')}</label>
                      <div className="relative">
                        <Phone
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                        <input
                          type="tel"
                          value={currentJob.customerPhone}
                          onChange={(e) => setCurrentJob({ ...currentJob, customerPhone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.emailAddress', 'Email Address')}</label>
                      <div className="relative">
                        <Mail
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                        <input
                          type="email"
                          value={currentJob.customerEmail}
                          onChange={(e) => setCurrentJob({ ...currentJob, customerEmail: e.target.value })}
                          placeholder={t('tools.applianceRepair.customerEmailCom', 'customer@email.com')}
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.serviceAddress', 'Service Address *')}</label>
                      <div className="relative">
                        <MapPin
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                        <input
                          type="text"
                          value={currentJob.customerAddress}
                          onChange={(e) => setCurrentJob({ ...currentJob, customerAddress: e.target.value })}
                          placeholder={t('tools.applianceRepair.123MainStCityState', '123 Main St, City, State ZIP')}
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appliance Details Tab */}
              {activeTab === 'appliance' && (
                <div className="space-y-4">
                  <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.applianceRepair.applianceDetails', 'Appliance Details')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.applianceType', 'Appliance Type *')}</label>
                      <select
                        value={currentJob.applianceType}
                        onChange={(e) => setCurrentJob({ ...currentJob, applianceType: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="">{t('tools.applianceRepair.selectType', 'Select type...')}</option>
                        {APPLIANCE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.brand', 'Brand')}</label>
                      <input
                        type="text"
                        value={currentJob.brand}
                        onChange={(e) => setCurrentJob({ ...currentJob, brand: e.target.value })}
                        placeholder={t('tools.applianceRepair.eGSamsungLgWhirlpool', 'e.g., Samsung, LG, Whirlpool')}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.modelNumber', 'Model Number')}</label>
                      <input
                        type="text"
                        value={currentJob.model}
                        onChange={(e) => setCurrentJob({ ...currentJob, model: e.target.value })}
                        placeholder={t('tools.applianceRepair.modelNumber2', 'Model number')}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.serialNumber', 'Serial Number')}</label>
                      <input
                        type="text"
                        value={currentJob.serialNumber}
                        onChange={(e) => setCurrentJob({ ...currentJob, serialNumber: e.target.value })}
                        placeholder={t('tools.applianceRepair.serialNumber2', 'Serial number')}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.purchaseDate', 'Purchase Date')}</label>
                      <input
                        type="date"
                        value={currentJob.purchaseDate}
                        onChange={(e) => setCurrentJob({ ...currentJob, purchaseDate: e.target.value })}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis Tab */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-4">
                  <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <ClipboardList className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.applianceRepair.problemDiagnosis', 'Problem & Diagnosis')}
                  </h2>

                  <div>
                    <label className={labelClasses}>{t('tools.applianceRepair.problemDescription', 'Problem Description *')}</label>
                    <textarea
                      value={currentJob.problemDescription}
                      onChange={(e) => setCurrentJob({ ...currentJob, problemDescription: e.target.value })}
                      placeholder={t('tools.applianceRepair.describeTheIssueTheCustomer', 'Describe the issue the customer reported...')}
                      rows={4}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>{t('tools.applianceRepair.diagnosticNotes', 'Diagnostic Notes')}</label>
                    <textarea
                      value={currentJob.diagnosticNotes}
                      onChange={(e) => setCurrentJob({ ...currentJob, diagnosticNotes: e.target.value })}
                      placeholder={t('tools.applianceRepair.technicianSFindingsAndDiagnosis', 'Technician\'s findings and diagnosis...')}
                      rows={4}
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.repairCode', 'Repair Code')}</label>
                      <select
                        value={currentJob.repairCode}
                        onChange={(e) => setCurrentJob({ ...currentJob, repairCode: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="">{t('tools.applianceRepair.selectCode', 'Select code...')}</option>
                        {REPAIR_CODES.map((code) => (
                          <option key={code.code} value={code.code}>
                            {code.code} - {code.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.assignTechnician', 'Assign Technician')}</label>
                      <select
                        value={currentJob.technicianId}
                        onChange={(e) => handleTechnicianSelect(e.target.value)}
                        className={inputClasses}
                      >
                        <option value="">{t('tools.applianceRepair.selectTechnician', 'Select technician...')}</option>
                        {TECHNICIANS.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name} ({tech.specialties.join(', ')})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Repair Codes Reference */}
                  <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <button
                      onClick={() => setShowRepairCodes(!showRepairCodes)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#0D9488]" />
                        {t('tools.applianceRepair.commonRepairCodesReference', 'Common Repair Codes Reference')}
                      </span>
                      {showRepairCodes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showRepairCodes && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {REPAIR_CODES.map((code) => (
                          <div
                            key={code.code}
                            className={`p-2 rounded border ${
                              theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#0D9488]">{code.code}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  code.category === 'Major'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : code.category === 'Moderate'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}
                              >
                                {code.category}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {code.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parts Tab */}
              {activeTab === 'parts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Settings className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.applianceRepair.partsNeeded', 'Parts Needed')}
                    </h2>
                    <button
                      onClick={handleAddPart}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.applianceRepair.addPart', 'Add Part')}
                    </button>
                  </div>

                  {currentJob.parts.length === 0 ? (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.applianceRepair.noPartsAddedYetClick', 'No parts added yet. Click "Add Part" to add parts needed for this repair.')}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentJob.parts.map((part, index) => (
                        <div
                          key={part.id}
                          className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Part #{index + 1}
                            </span>
                            <button
                              onClick={() => handleRemovePart(part.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2">
                              <label className={labelClasses}>{t('tools.applianceRepair.partName', 'Part Name')}</label>
                              <input
                                type="text"
                                value={part.name}
                                onChange={(e) => handleUpdatePart(part.id, { name: e.target.value })}
                                placeholder={t('tools.applianceRepair.partName2', 'Part name')}
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className={labelClasses}>{t('tools.applianceRepair.partNumber', 'Part Number')}</label>
                              <input
                                type="text"
                                value={part.partNumber}
                                onChange={(e) => handleUpdatePart(part.id, { partNumber: e.target.value })}
                                placeholder={t('tools.applianceRepair.skuPart', 'SKU/Part #')}
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className={labelClasses}>{t('tools.applianceRepair.quantity', 'Quantity')}</label>
                              <input
                                type="number"
                                value={part.quantity}
                                onChange={(e) => handleUpdatePart(part.id, { quantity: parseInt(e.target.value) || 0 })}
                                min="1"
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className={labelClasses}>{t('tools.applianceRepair.unitPrice', 'Unit Price ($)')}</label>
                              <input
                                type="number"
                                value={part.unitPrice}
                                onChange={(e) => handleUpdatePart(part.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="0.01"
                                className={inputClasses}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={part.ordered}
                                onChange={(e) => handleUpdatePart(part.id, { ordered: e.target.checked })}
                                className="w-4 h-4 text-[#0D9488] rounded"
                              />
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.applianceRepair.ordered', 'Ordered')}
                              </span>
                            </label>
                            {part.ordered && (
                              <>
                                <div>
                                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('tools.applianceRepair.orderDate', 'Order Date')}
                                  </label>
                                  <input
                                    type="date"
                                    value={part.orderDate || ''}
                                    onChange={(e) => handleUpdatePart(part.id, { orderDate: e.target.value })}
                                    className={`${inputClasses} py-1 text-sm`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('tools.applianceRepair.estArrival', 'Est. Arrival')}
                                  </label>
                                  <input
                                    type="date"
                                    value={part.arrivalDate || ''}
                                    onChange={(e) => handleUpdatePart(part.id, { arrivalDate: e.target.value })}
                                    className={`${inputClasses} py-1 text-sm`}
                                  />
                                </div>
                              </>
                            )}
                            <div className={`ml-auto text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Subtotal: ${(part.quantity * part.unitPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? t('tools.applianceRepair.bg0d948820', 'bg-[#0D9488]/20') : t('tools.applianceRepair.bg0d948810', 'bg-[#0D9488]/10')}`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.applianceRepair.totalPartsCost', 'Total Parts Cost')}
                          </span>
                          <span className="text-xl font-bold text-[#0D9488]">${pricing.partsTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Service Calls Tab */}
              {activeTab === 'service' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Calendar className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.applianceRepair.serviceCallsScheduling', 'Service Calls & Scheduling')}
                    </h2>
                    <button
                      onClick={handleAddServiceCall}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.applianceRepair.scheduleCall', 'Schedule Call')}
                    </button>
                  </div>

                  {currentJob.serviceCalls.length === 0 ? (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.applianceRepair.noServiceCallsScheduledClick', 'No service calls scheduled. Click "Schedule Call" to add a service appointment.')}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentJob.serviceCalls.map((call, index) => (
                        <div
                          key={call.id}
                          className={`p-4 rounded-lg border ${
                            call.completed
                              ? theme === 'dark'
                                ? 'border-green-700 bg-green-900/20'
                                : 'border-green-200 bg-green-50'
                              : theme === 'dark'
                              ? 'border-gray-700 bg-gray-700/50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Service Call #{index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              {call.completed && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              <button
                                onClick={() => handleRemoveServiceCall(call.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className={labelClasses}>{t('tools.applianceRepair.date', 'Date')}</label>
                              <input
                                type="date"
                                value={call.date}
                                onChange={(e) => handleUpdateServiceCall(call.id, { date: e.target.value })}
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className={labelClasses}>{t('tools.applianceRepair.time', 'Time')}</label>
                              <input
                                type="time"
                                value={call.time}
                                onChange={(e) => handleUpdateServiceCall(call.id, { time: e.target.value })}
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className={labelClasses}>{t('tools.applianceRepair.type', 'Type')}</label>
                              <select
                                value={call.type}
                                onChange={(e) =>
                                  handleUpdateServiceCall(call.id, { type: e.target.value as ServiceCall['type'] })
                                }
                                className={inputClasses}
                              >
                                <option value="initial">{t('tools.applianceRepair.initialVisit', 'Initial Visit')}</option>
                                <option value="follow-up">{t('tools.applianceRepair.followUp', 'Follow-up')}</option>
                                <option value="warranty">{t('tools.applianceRepair.warrantyService', 'Warranty Service')}</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={call.completed}
                                  onChange={(e) => handleUpdateServiceCall(call.id, { completed: e.target.checked })}
                                  className="w-4 h-4 text-[#0D9488] rounded"
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {t('tools.applianceRepair.completed', 'Completed')}
                                </span>
                              </label>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className={labelClasses}>{t('tools.applianceRepair.notes', 'Notes')}</label>
                            <input
                              type="text"
                              value={call.notes}
                              onChange={(e) => handleUpdateServiceCall(call.id, { notes: e.target.value })}
                              placeholder={t('tools.applianceRepair.serviceCallNotes', 'Service call notes...')}
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Appointment */}
                  <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <RefreshCw className="w-4 h-4 text-[#0D9488]" />
                      {t('tools.applianceRepair.followUpAppointment', 'Follow-up Appointment')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>{t('tools.applianceRepair.followUpDate', 'Follow-up Date')}</label>
                        <input
                          type="date"
                          value={currentJob.followUpDate}
                          onChange={(e) => setCurrentJob({ ...currentJob, followUpDate: e.target.value })}
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>{t('tools.applianceRepair.followUpNotes', 'Follow-up Notes')}</label>
                        <input
                          type="text"
                          value={currentJob.followUpNotes}
                          onChange={(e) => setCurrentJob({ ...currentJob, followUpNotes: e.target.value })}
                          placeholder={t('tools.applianceRepair.notesForFollowUpVisit', 'Notes for follow-up visit...')}
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <DollarSign className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.applianceRepair.laborPricing', 'Labor & Pricing')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.laborHours', 'Labor Hours')}</label>
                      <input
                        type="number"
                        value={currentJob.laborHours}
                        onChange={(e) => setCurrentJob({ ...currentJob, laborHours: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.5"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.laborRateHr', 'Labor Rate ($/hr)')}</label>
                      <input
                        type="number"
                        value={currentJob.laborRate}
                        onChange={(e) => setCurrentJob({ ...currentJob, laborRate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="5"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.diagnosticFee', 'Diagnostic Fee ($)')}</label>
                      <input
                        type="number"
                        value={currentJob.diagnosticFee}
                        onChange={(e) => setCurrentJob({ ...currentJob, diagnosticFee: parseFloat(e.target.value) || 0 })}
                        min="0"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.discount', 'Discount (%)')}</label>
                      <input
                        type="number"
                        value={currentJob.discount}
                        onChange={(e) => setCurrentJob({ ...currentJob, discount: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.taxRate', 'Tax Rate (%)')}</label>
                      <input
                        type="number"
                        value={currentJob.taxRate}
                        onChange={(e) => setCurrentJob({ ...currentJob, taxRate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.25"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className={`mt-6 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.applianceRepair.pricingSummary', 'Pricing Summary')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.applianceRepair.partsTotal', 'Parts Total:')}</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${pricing.partsTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          Labor ({currentJob.laborHours} hrs @ ${currentJob.laborRate}/hr):
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${pricing.laborTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.applianceRepair.diagnosticFee2', 'Diagnostic Fee:')}</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${currentJob.diagnosticFee.toFixed(2)}
                        </span>
                      </div>
                      <div className={`border-t pt-3 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.applianceRepair.subtotal', 'Subtotal:')}</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${pricing.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {currentJob.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({currentJob.discount}%):</span>
                          <span>-${pricing.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          Tax ({currentJob.taxRate}%):
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${pricing.taxAmount.toFixed(2)}
                        </span>
                      </div>
                      <div
                        className={`border-t-2 pt-3 flex justify-between ${
                          theme === 'dark' ? 'border-gray-500' : 'border-gray-400'
                        }`}
                      >
                        <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.applianceRepair.total2', 'Total:')}
                        </span>
                        <span className="text-2xl font-bold text-[#0D9488]">${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warranty Tab */}
              {activeTab === 'warranty' && (
                <div className="space-y-4">
                  <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.applianceRepair.warrantyVerification', 'Warranty Verification')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.warrantyStatus', 'Warranty Status')}</label>
                      <select
                        value={currentJob.warrantyStatus}
                        onChange={(e) =>
                          setCurrentJob({ ...currentJob, warrantyStatus: e.target.value as RepairJob['warrantyStatus'] })
                        }
                        className={inputClasses}
                      >
                        <option value="pending">{t('tools.applianceRepair.pendingVerification', 'Pending Verification')}</option>
                        <option value="valid">{t('tools.applianceRepair.validWarranty', 'Valid Warranty')}</option>
                        <option value="expired">{t('tools.applianceRepair.expired', 'Expired')}</option>
                        <option value="none">{t('tools.applianceRepair.noWarranty', 'No Warranty')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>{t('tools.applianceRepair.warrantyExpiryDate', 'Warranty Expiry Date')}</label>
                      <input
                        type="date"
                        value={currentJob.warrantyExpiry}
                        onChange={(e) => setCurrentJob({ ...currentJob, warrantyExpiry: e.target.value })}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>{t('tools.applianceRepair.warrantyNotes', 'Warranty Notes')}</label>
                    <textarea
                      value={currentJob.warrantyNotes}
                      onChange={(e) => setCurrentJob({ ...currentJob, warrantyNotes: e.target.value })}
                      placeholder={t('tools.applianceRepair.warrantyCoverageDetailsClaimNumbers', 'Warranty coverage details, claim numbers, etc...')}
                      rows={4}
                      className={inputClasses}
                    />
                  </div>

                  {/* Warranty Status Display */}
                  <div
                    className={`p-4 rounded-lg border-l-4 ${
                      currentJob.warrantyStatus === 'valid'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : currentJob.warrantyStatus === 'expired'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : currentJob.warrantyStatus === 'pending'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-500 bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {currentJob.warrantyStatus === 'valid' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : currentJob.warrantyStatus === 'expired' ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : currentJob.warrantyStatus === 'pending' ? (
                        <Clock className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-gray-500" />
                      )}
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {currentJob.warrantyStatus === 'valid'
                            ? 'Valid Warranty Coverage'
                            : currentJob.warrantyStatus === 'expired'
                            ? 'Warranty Has Expired'
                            : currentJob.warrantyStatus === 'pending'
                            ? t('tools.applianceRepair.warrantyVerificationPending', 'Warranty Verification Pending') : t('tools.applianceRepair.noWarrantyCoverage', 'No Warranty Coverage')}
                        </p>
                        {currentJob.warrantyExpiry && (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {currentJob.warrantyStatus === 'valid' ? t('tools.applianceRepair.expires', 'Expires') : t('tools.applianceRepair.expired2', 'Expired')}:{' '}
                            {new Date(currentJob.warrantyExpiry).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Tab */}
              {activeTab === 'invoice' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <FileText className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.applianceRepair.invoicePreview', 'Invoice Preview')}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={generateInvoice}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        {t('tools.applianceRepair.downloadInvoice', 'Download Invoice')}
                      </button>
                      <button
                        onClick={() => window.print()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <Printer className="w-4 h-4" />
                        {t('tools.applianceRepair.print', 'Print')}
                      </button>
                    </div>
                  </div>

                  {/* Invoice Preview */}
                  <div className={`p-8 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-white'}`}>
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.applianceRepair.invoice2', 'INVOICE')}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Invoice #: INV-{currentJob.id.toUpperCase()}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Date: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.applianceRepair.applianceRepairServices', 'Appliance Repair Services')}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.applianceRepair.yourTrustedRepairPartner', 'Your Trusted Repair Partner')}
                        </p>
                      </div>
                    </div>

                    {/* Customer & Appliance Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.applianceRepair.billTo', 'Bill To:')}
                        </h4>
                        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{currentJob.customerName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentJob.customerAddress}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentJob.customerPhone}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentJob.customerEmail}
                        </p>
                      </div>
                      <div>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.applianceRepair.appliance', 'Appliance:')}
                        </h4>
                        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {currentJob.applianceType} - {currentJob.brand}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Model: {currentJob.model}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Serial: {currentJob.serialNumber}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Technician: {currentJob.technicianName}
                        </p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                          <th className={`text-left py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.applianceRepair.description', 'Description')}
                          </th>
                          <th className={`text-center py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.applianceRepair.qty', 'Qty')}
                          </th>
                          <th className={`text-right py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.applianceRepair.price', 'Price')}
                          </th>
                          <th className={`text-right py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.applianceRepair.amount', 'Amount')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentJob.parts.map((part) => (
                          <tr key={part.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className={`py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {part.name} ({part.partNumber})
                            </td>
                            <td className={`text-center py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {part.quantity}
                            </td>
                            <td className={`text-right py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              ${part.unitPrice.toFixed(2)}
                            </td>
                            <td className={`text-right py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              ${(part.quantity * part.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Labor ({currentJob.laborHours} hours @ ${currentJob.laborRate}/hr)
                          </td>
                          <td className="text-center py-2">-</td>
                          <td className="text-right py-2">-</td>
                          <td className={`text-right py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${pricing.laborTotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.applianceRepair.diagnosticFee3', 'Diagnostic Fee')}</td>
                          <td className="text-center py-2">-</td>
                          <td className="text-right py-2">-</td>
                          <td className={`text-right py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${currentJob.diagnosticFee.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.applianceRepair.subtotal2', 'Subtotal:')}</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            ${pricing.subtotal.toFixed(2)}
                          </span>
                        </div>
                        {currentJob.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({currentJob.discount}%):</span>
                            <span>-${pricing.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            Tax ({currentJob.taxRate}%):
                          </span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            ${pricing.taxAmount.toFixed(2)}
                          </span>
                        </div>
                        <div
                          className={`flex justify-between pt-2 border-t-2 ${
                            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                          }`}
                        >
                          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.applianceRepair.total', 'Total:')}</span>
                          <span className="font-bold text-xl text-[#0D9488]">${pricing.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Warranty Badge */}
                    {currentJob.warrantyStatus === 'valid' && (
                      <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        <span className={theme === 'dark' ? 'text-green-400' : 'text-green-700'}>
                          This repair is covered under warranty
                          {currentJob.warrantyExpiry && ` (expires ${new Date(currentJob.warrantyExpiry).toLocaleDateString()})`}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className={`mt-8 pt-4 border-t text-center text-sm ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                      {t('tools.applianceRepair.thankYouForYourBusiness', 'Thank you for your business!')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.applianceRepair.aboutApplianceRepairServiceManager', 'About Appliance Repair Service Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            A comprehensive tool for managing appliance repair services. Track customer information, appliance details,
            diagnostic notes, parts ordering, technician assignments, service scheduling, labor and parts pricing,
            warranty verification, and generate professional invoices. All data is saved locally in your browser.
          </p>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default ApplianceRepairTool;
