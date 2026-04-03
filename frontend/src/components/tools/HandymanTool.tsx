'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Wrench,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Camera,
  FileText,
  Package,
  Star,
  Car,
  ClipboardList,
  Send,
  Download,
  ChevronDown,
  ChevronUp,
  Zap,
  Droplets,
  Hammer,
  Settings,
  MessageSquare,
  Save,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
  estimatedMinutes: number;
  actualMinutes: number;
}

interface Documentation {
  id: string;
  type: 'before' | 'after';
  description: string;
  timestamp: string;
}

interface Job {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'carpentry' | 'general';
  status: 'scheduled' | 'in-progress' | 'complete';
  pricingType: 'hourly' | 'flat-rate';
  hourlyRate: number;
  flatRate: number;
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number;
  actualHours: number;
  travelTimeMinutes: number;
  materials: Material[];
  tasks: Task[];
  documentation: Documentation[];
  feedback: {
    rating: number;
    comment: string;
  } | null;
  createdAt: string;
  completedAt: string | null;
}

interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  laborTotal: number;
  materialsTotal: number;
  travelCharge: number;
  subtotal: number;
  tax: number;
  total: number;
  generatedAt: string;
}

// Combined data structure for backend sync
interface HandymanData {
  id: string;
  customers: Customer[];
  jobs: Job[];
  invoices: Invoice[];
  updatedAt: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const categoryIcons = {
  plumbing: Droplets,
  electrical: Zap,
  carpentry: Hammer,
  general: Settings,
};

const categoryColors = {
  plumbing: 'bg-blue-500',
  electrical: 'bg-yellow-500',
  carpentry: 'bg-amber-700',
  general: 'bg-gray-500',
};

const statusColors = {
  scheduled: 'bg-blue-500',
  'in-progress': 'bg-orange-500',
  complete: 'bg-green-500',
};

// Column configurations for export
const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const JOB_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Job Title', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'pricingType', header: 'Pricing Type', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'flatRate', header: 'Flat Rate', type: 'currency' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'estimatedHours', header: 'Estimated Hours', type: 'number' },
  { key: 'actualHours', header: 'Actual Hours', type: 'number' },
  { key: 'travelTimeMinutes', header: 'Travel Time (min)', type: 'number' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'completedAt', header: 'Completed At', type: 'date' },
];

const INVOICE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Invoice ID', type: 'string' },
  { key: 'laborTotal', header: 'Labor Total', type: 'currency' },
  { key: 'materialsTotal', header: 'Materials Total', type: 'currency' },
  { key: 'travelCharge', header: 'Travel Charge', type: 'currency' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'generatedAt', header: 'Generated At', type: 'date' },
];

// Combined columns for handyman data sync
const HANDYMAN_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Data ID', type: 'string' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

interface HandymanToolProps {
  uiConfig?: UIConfig;
}

export const HandymanTool: React.FC<HandymanToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Default data structure for useToolData
  const defaultHandymanData: HandymanData[] = [{
    id: 'handyman-data',
    customers: [],
    jobs: [],
    invoices: [],
    updatedAt: new Date().toISOString(),
  }];

  // Use the useToolData hook for backend persistence
  const {
    data: handymanDataArray,
    setData: setHandymanDataArray,
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
  } = useToolData<HandymanData>('handyman-tool', defaultHandymanData, HANDYMAN_DATA_COLUMNS);

  // Extract data from the hook's array structure
  const handymanData = handymanDataArray[0] || defaultHandymanData[0];
  const customers = handymanData.customers || [];
  const jobs = handymanData.jobs || [];
  const invoices = handymanData.invoices || [];

  // Helper to update the combined data
  const updateHandymanData = (updates: Partial<Omit<HandymanData, 'id'>>) => {
    setHandymanDataArray([{
      ...handymanData,
      ...updates,
      updatedAt: new Date().toISOString(),
    }]);
  };

  // Setters that work with the combined data structure
  const setCustomers = (customersOrUpdater: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const newCustomers = typeof customersOrUpdater === 'function'
      ? customersOrUpdater(customers)
      : customersOrUpdater;
    updateHandymanData({ customers: newCustomers });
  };

  const setJobs = (jobsOrUpdater: Job[] | ((prev: Job[]) => Job[])) => {
    const newJobs = typeof jobsOrUpdater === 'function'
      ? jobsOrUpdater(jobs)
      : jobsOrUpdater;
    updateHandymanData({ jobs: newJobs });
  };

  const setInvoices = (invoicesOrUpdater: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    const newInvoices = typeof invoicesOrUpdater === 'function'
      ? invoicesOrUpdater(invoices)
      : invoicesOrUpdater;
    updateHandymanData({ invoices: newInvoices });
  };

  const [activeTab, setActiveTab] = useState<'customers' | 'jobs' | 'invoices'>('jobs');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true,
    materials: true,
    documentation: true,
    time: true,
  });

  // Customer form state
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Job form state
  const [jobForm, setJobForm] = useState<Omit<Job, 'id' | 'createdAt' | 'completedAt'>>({
    customerId: '',
    title: '',
    description: '',
    category: 'general',
    status: 'scheduled',
    pricingType: 'hourly',
    hourlyRate: 75,
    flatRate: 0,
    scheduledDate: '',
    scheduledTime: '',
    estimatedHours: 1,
    actualHours: 0,
    travelTimeMinutes: 0,
    materials: [],
    tasks: [],
    documentation: [],
    feedback: null,
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.customerName) {
        setCustomerForm(prev => ({ ...prev, name: params.customerName as string }));
        hasChanges = true;
      }
      if (params.phone) {
        setCustomerForm(prev => ({ ...prev, phone: params.phone as string }));
        hasChanges = true;
      }
      if (params.address) {
        setCustomerForm(prev => ({ ...prev, address: params.address as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filterCategory !== 'all' && job.category !== filterCategory) return false;
      if (filterStatus !== 'all' && job.status !== filterStatus) return false;
      return true;
    });
  }, [jobs, filterCategory, filterStatus]);

  // Customer CRUD
  const handleSaveCustomer = () => {
    if (!customerForm.name.trim()) return;

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id ? { ...customerForm, id: editingCustomer.id } : c
        )
      );
    } else {
      const newCustomer: Customer = {
        ...customerForm,
        id: generateId(),
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }

    resetCustomerForm();
  };

  const resetCustomerForm = () => {
    setCustomerForm({ name: '', email: '', phone: '', address: '', notes: '' });
    setEditingCustomer(null);
    setShowCustomerForm(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerForm(customer);
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This will also delete all associated jobs.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setJobs((prev) => prev.filter((j) => j.customerId !== id));
    }
  };

  // Job CRUD
  const handleSaveJob = () => {
    if (!jobForm.title.trim() || !jobForm.customerId) return;

    if (editingJob) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === editingJob.id
            ? {
                ...jobForm,
                id: editingJob.id,
                createdAt: editingJob.createdAt,
                completedAt: jobForm.status === 'complete' ? new Date().toISOString() : null,
              }
            : j
        )
      );
    } else {
      const newJob: Job = {
        ...jobForm,
        id: generateId(),
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      setJobs((prev) => [...prev, newJob]);
    }

    resetJobForm();
  };

  const resetJobForm = () => {
    setJobForm({
      customerId: '',
      title: '',
      description: '',
      category: 'general',
      status: 'scheduled',
      pricingType: 'hourly',
      hourlyRate: 75,
      flatRate: 0,
      scheduledDate: '',
      scheduledTime: '',
      estimatedHours: 1,
      actualHours: 0,
      travelTimeMinutes: 0,
      materials: [],
      tasks: [],
      documentation: [],
      feedback: null,
    });
    setEditingJob(null);
    setShowJobForm(false);
  };

  const handleEditJob = (job: Job) => {
    setJobForm(job);
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This will also delete any associated invoices.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setInvoices((prev) => prev.filter((i) => i.jobId !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
    }
  };

  // Task management
  const addTask = () => {
    const newTask: Task = {
      id: generateId(),
      description: '',
      completed: false,
      estimatedMinutes: 30,
      actualMinutes: 0,
    };
    setJobForm((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setJobForm((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  };

  const removeTask = (taskId: string) => {
    setJobForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Material management
  const addMaterial = () => {
    const newMaterial: Material = {
      id: generateId(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setJobForm((prev) => ({ ...prev, materials: [...prev.materials, newMaterial] }));
  };

  const updateMaterial = (materialId: string, updates: Partial<Material>) => {
    setJobForm((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => {
        if (m.id === materialId) {
          const updated = { ...m, ...updates };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        }
        return m;
      }),
    }));
  };

  const removeMaterial = (materialId: string) => {
    setJobForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== materialId),
    }));
  };

  // Documentation
  const addDocumentation = (type: 'before' | 'after') => {
    const newDoc: Documentation = {
      id: generateId(),
      type,
      description: '',
      timestamp: new Date().toISOString(),
    };
    setJobForm((prev) => ({ ...prev, documentation: [...prev.documentation, newDoc] }));
  };

  const updateDocumentation = (docId: string, description: string) => {
    setJobForm((prev) => ({
      ...prev,
      documentation: prev.documentation.map((d) =>
        d.id === docId ? { ...d, description } : d
      ),
    }));
  };

  const removeDocumentation = (docId: string) => {
    setJobForm((prev) => ({
      ...prev,
      documentation: prev.documentation.filter((d) => d.id !== docId),
    }));
  };

  // Invoice generation
  const generateInvoice = (job: Job) => {
    const customer = customers.find((c) => c.id === job.customerId);
    if (!customer) return;

    const laborTotal =
      job.pricingType === 'hourly' ? job.actualHours * job.hourlyRate : job.flatRate;
    const materialsTotal = job.materials.reduce((sum, m) => sum + m.total, 0);
    const travelCharge = (job.travelTimeMinutes / 60) * (job.hourlyRate * 0.5);
    const subtotal = laborTotal + materialsTotal + travelCharge;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const invoice: Invoice = {
      id: generateId(),
      jobId: job.id,
      customerId: job.customerId,
      laborTotal,
      materialsTotal,
      travelCharge,
      subtotal,
      tax,
      total,
      generatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [...prev, invoice]);
    return invoice;
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get customer by ID
  const getCustomer = (customerId: string) => customers.find((c) => c.id === customerId);

  // Calculate job totals
  const calculateJobTotal = (job: Job) => {
    const laborTotal =
      job.pricingType === 'hourly' ? job.actualHours * job.hourlyRate : job.flatRate;
    const materialsTotal = job.materials.reduce((sum, m) => sum + m.total, 0);
    const travelCharge = (job.travelTimeMinutes / 60) * (job.hourlyRate * 0.5);
    return laborTotal + materialsTotal + travelCharge;
  };

  // Get export data and columns based on active tab
  const getExportConfig = () => {
    switch (activeTab) {
      case 'customers':
        return { data: customers, columns: CUSTOMER_COLUMNS, filename: 'handyman_customers' };
      case 'jobs':
        // Enrich jobs data with customer name for export
        const enrichedJobs = filteredJobs.map(job => ({
          ...job,
          customerName: getCustomer(job.customerId)?.name || 'Unknown',
        }));
        return { data: enrichedJobs, columns: JOB_COLUMNS, filename: 'handyman_jobs' };
      case 'invoices':
        // Enrich invoices with customer and job info for export
        const enrichedInvoices = invoices.map(inv => ({
          ...inv,
          customerName: customers.find(c => c.id === inv.customerId)?.name || 'Unknown',
          jobTitle: jobs.find(j => j.id === inv.jobId)?.title || 'Unknown',
        }));
        return { data: enrichedInvoices, columns: INVOICE_COLUMNS, filename: 'handyman_invoices' };
      default:
        return { data: [], columns: [], filename: 'handyman_export' };
    }
  };

  // Export handlers - using hook functions with tab-specific data
  const handleExportCSV = () => {
    const { filename } = getExportConfig();
    exportCSV({ filename });
  };

  const handleExportExcel = () => {
    const { filename } = getExportConfig();
    exportExcel({ filename });
  };

  const handleExportJSON = () => {
    const { filename } = getExportConfig();
    exportJSON({ filename });
  };

  const handleExportPDF = async () => {
    const tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const { filename, data } = getExportConfig();
    await exportPDF({
      filename,
      title: `Handyman Service - ${tabTitle}`,
      subtitle: `Total Records: ${data.length}`,
    });
  };

  const handlePrint = () => {
    const tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    print(`Handyman Service - ${tabTitle}`);
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Render helpers
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const buttonPrimary = `px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2`;

  const buttonSecondary = `px-4 py-2 ${
    theme === 'dark'
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  } font-medium rounded-lg transition-colors flex items-center gap-2`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.handyman.handymanServiceManager', 'Handyman Service Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.handyman.manageCustomersJobsAndInvoices', 'Manage customers, jobs, and invoices')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="handyman" toolName="Handyman" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={theme}
              />
              <button
                onClick={() => {
                  setShowCustomerForm(true);
                  setEditingCustomer(null);
                  setCustomerForm({ name: '', email: '', phone: '', address: '', notes: '' });
                }}
                className={buttonSecondary}
              >
                <User className="w-4 h-4" />
                {t('tools.handyman.addCustomer', 'Add Customer')}
              </button>
              <button
                onClick={() => {
                  setShowJobForm(true);
                  setEditingJob(null);
                  resetJobForm();
                }}
                className={buttonPrimary}
              >
                <Plus className="w-4 h-4" />
                {t('tools.handyman.newJob', 'New Job')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {(['jobs', 'customers', 'invoices'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-xl w-full max-w-md p-6`}
            >
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingCustomer ? t('tools.handyman.editCustomer', 'Edit Customer') : t('tools.handyman.addCustomer2', 'Add Customer')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.handyman.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.handyman.customerName', 'Customer name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.handyman.email', 'Email')}</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.handyman.emailExampleCom', 'email@example.com')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.handyman.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className={inputClass}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.handyman.address', 'Address')}</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.handyman.123MainStCityState', '123 Main St, City, State')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.handyman.notes', 'Notes')}</label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.handyman.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveCustomer} className={buttonPrimary}>
                  <Save className="w-4 h-4" />
                  {t('tools.handyman.saveCustomer', 'Save Customer')}
                </button>
                <button onClick={resetCustomerForm} className={buttonSecondary}>
                  {t('tools.handyman.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-xl w-full max-w-3xl p-6 my-8`}
            >
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingJob ? t('tools.handyman.editJob', 'Edit Job') : t('tools.handyman.createNewJob', 'Create New Job')}
              </h2>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.handyman.customer', 'Customer *')}</label>
                    <select
                      value={jobForm.customerId}
                      onChange={(e) => setJobForm((prev) => ({ ...prev, customerId: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">{t('tools.handyman.selectCustomer', 'Select customer...')}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.handyman.category', 'Category')}</label>
                    <select
                      value={jobForm.category}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          category: e.target.value as Job['category'],
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="plumbing">{t('tools.handyman.plumbing', 'Plumbing')}</option>
                      <option value="electrical">{t('tools.handyman.electrical', 'Electrical')}</option>
                      <option value="carpentry">{t('tools.handyman.carpentry', 'Carpentry')}</option>
                      <option value="general">{t('tools.handyman.general', 'General')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.handyman.jobTitle', 'Job Title *')}</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.handyman.eGFixLeakyFaucet', 'e.g., Fix leaky faucet')}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.handyman.description', 'Description')}</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.handyman.detailedDescriptionOfTheWork', 'Detailed description of the work...')}
                  />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.handyman.status', 'Status')}</label>
                    <select
                      value={jobForm.status}
                      onChange={(e) =>
                        setJobForm((prev) => ({ ...prev, status: e.target.value as Job['status'] }))
                      }
                      className={inputClass}
                    >
                      <option value="scheduled">{t('tools.handyman.scheduled', 'Scheduled')}</option>
                      <option value="in-progress">{t('tools.handyman.inProgress', 'In Progress')}</option>
                      <option value="complete">{t('tools.handyman.complete', 'Complete')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.handyman.scheduledDate', 'Scheduled Date')}</label>
                    <input
                      type="date"
                      value={jobForm.scheduledDate}
                      onChange={(e) => setJobForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.handyman.scheduledTime', 'Scheduled Time')}</label>
                    <input
                      type="time"
                      value={jobForm.scheduledTime}
                      onChange={(e) => setJobForm((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.handyman.pricing', 'Pricing')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.handyman.pricingType', 'Pricing Type')}</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setJobForm((prev) => ({ ...prev, pricingType: 'hourly' }))}
                          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                            jobForm.pricingType === 'hourly'
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {t('tools.handyman.hourly', 'Hourly')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setJobForm((prev) => ({ ...prev, pricingType: 'flat-rate' }))}
                          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                            jobForm.pricingType === 'flat-rate'
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {t('tools.handyman.flatRate2', 'Flat Rate')}
                        </button>
                      </div>
                    </div>
                    {jobForm.pricingType === 'hourly' ? (
                      <>
                        <div>
                          <label className={labelClass}>{t('tools.handyman.hourlyRate', 'Hourly Rate ($)')}</label>
                          <input
                            type="number"
                            value={jobForm.hourlyRate}
                            onChange={(e) =>
                              setJobForm((prev) => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))
                            }
                            className={inputClass}
                            min="0"
                            step="5"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.handyman.estimatedHours', 'Estimated Hours')}</label>
                          <input
                            type="number"
                            value={jobForm.estimatedHours}
                            onChange={(e) =>
                              setJobForm((prev) => ({
                                ...prev,
                                estimatedHours: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className={inputClass}
                            min="0"
                            step="0.5"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.handyman.actualHours', 'Actual Hours')}</label>
                          <input
                            type="number"
                            value={jobForm.actualHours}
                            onChange={(e) =>
                              setJobForm((prev) => ({
                                ...prev,
                                actualHours: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className={inputClass}
                            min="0"
                            step="0.25"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className={labelClass}>{t('tools.handyman.flatRate', 'Flat Rate ($)')}</label>
                        <input
                          type="number"
                          value={jobForm.flatRate}
                          onChange={(e) =>
                            setJobForm((prev) => ({ ...prev, flatRate: parseFloat(e.target.value) || 0 }))
                          }
                          className={inputClass}
                          min="0"
                          step="10"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel Time */}
                <div>
                  <label className={labelClass}>
                    <Car className="w-4 h-4 inline mr-1" />
                    {t('tools.handyman.travelTimeMinutes', 'Travel Time (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={jobForm.travelTimeMinutes}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        travelTimeMinutes: parseInt(e.target.value) || 0,
                      }))
                    }
                    className={inputClass}
                    min="0"
                    step="5"
                  />
                </div>

                {/* Tasks */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <ClipboardList className="w-4 h-4 inline mr-1" />
                      {t('tools.handyman.tasks', 'Tasks')}
                    </h3>
                    <button onClick={addTask} className={buttonSecondary} type="button">
                      <Plus className="w-4 h-4" />
                      {t('tools.handyman.addTask', 'Add Task')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {jobForm.tasks.map((task) => (
                      <div key={task.id} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
                          className="w-5 h-5 rounded text-[#0D9488]"
                        />
                        <input
                          type="text"
                          value={task.description}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                          className={`flex-1 ${inputClass}`}
                          placeholder={t('tools.handyman.taskDescription', 'Task description...')}
                        />
                        <input
                          type="number"
                          value={task.estimatedMinutes}
                          onChange={(e) =>
                            updateTask(task.id, { estimatedMinutes: parseInt(e.target.value) || 0 })
                          }
                          className={`w-20 ${inputClass}`}
                          placeholder={t('tools.handyman.estMin', 'Est. min')}
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {jobForm.tasks.length === 0 && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.handyman.noTasksAddedYet', 'No tasks added yet')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Materials */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Package className="w-4 h-4 inline mr-1" />
                      {t('tools.handyman.materials2', 'Materials')}
                    </h3>
                    <button onClick={addMaterial} className={buttonSecondary} type="button">
                      <Plus className="w-4 h-4" />
                      {t('tools.handyman.addMaterial', 'Add Material')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {jobForm.materials.map((material) => (
                      <div key={material.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={material.name}
                          onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                          className={`flex-1 ${inputClass}`}
                          placeholder={t('tools.handyman.materialName', 'Material name...')}
                        />
                        <input
                          type="number"
                          value={material.quantity}
                          onChange={(e) =>
                            updateMaterial(material.id, { quantity: parseInt(e.target.value) || 0 })
                          }
                          className={`w-20 ${inputClass}`}
                          placeholder={t('tools.handyman.qty', 'Qty')}
                          min="0"
                        />
                        <input
                          type="number"
                          value={material.unitPrice}
                          onChange={(e) =>
                            updateMaterial(material.id, { unitPrice: parseFloat(e.target.value) || 0 })
                          }
                          className={`w-24 ${inputClass}`}
                          placeholder={t('tools.handyman.price', 'Price')}
                          min="0"
                          step="0.01"
                        />
                        <span
                          className={`w-24 text-right font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          ${material.total.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMaterial(material.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {jobForm.materials.length === 0 && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.handyman.noMaterialsAddedYet', 'No materials added yet')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Documentation */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Camera className="w-4 h-4 inline mr-1" />
                      {t('tools.handyman.beforeAfterDocumentation', 'Before/After Documentation')}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addDocumentation('before')}
                        className={buttonSecondary}
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.handyman.before', 'Before')}
                      </button>
                      <button
                        onClick={() => addDocumentation('after')}
                        className={buttonSecondary}
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.handyman.after', 'After')}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {jobForm.documentation.map((doc) => (
                      <div key={doc.id} className="flex gap-2 items-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.type === 'before'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {doc.type.toUpperCase()}
                        </span>
                        <input
                          type="text"
                          value={doc.description}
                          onChange={(e) => updateDocumentation(doc.id, e.target.value)}
                          className={`flex-1 ${inputClass}`}
                          placeholder={t('tools.handyman.descriptionEGPhotoOf', 'Description (e.g., photo of damaged pipe)...')}
                        />
                        <button
                          type="button"
                          onClick={() => removeDocumentation(doc.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {jobForm.documentation.length === 0 && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.handyman.noDocumentationAddedYet', 'No documentation added yet')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Feedback (only for completed jobs) */}
                {jobForm.status === 'complete' && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {t('tools.handyman.customerFeedback', 'Customer Feedback')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>{t('tools.handyman.rating', 'Rating')}</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setJobForm((prev) => ({
                                  ...prev,
                                  feedback: { ...prev.feedback, rating: star, comment: prev.feedback?.comment || '' },
                                }))
                              }
                              className={`p-1 ${
                                (jobForm.feedback?.rating || 0) >= star
                                  ? 'text-yellow-400'
                                  : theme === 'dark'
                                  ? 'text-gray-600'
                                  : 'text-gray-300'
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.handyman.comment', 'Comment')}</label>
                        <textarea
                          value={jobForm.feedback?.comment || ''}
                          onChange={(e) =>
                            setJobForm((prev) => ({
                              ...prev,
                              feedback: { rating: prev.feedback?.rating || 0, comment: e.target.value },
                            }))
                          }
                          className={inputClass}
                          rows={2}
                          placeholder={t('tools.handyman.customerFeedback2', 'Customer feedback...')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-600">
                <button onClick={handleSaveJob} className={buttonPrimary}>
                  <Save className="w-4 h-4" />
                  {editingJob ? t('tools.handyman.updateJob', 'Update Job') : t('tools.handyman.createJob', 'Create Job')}
                </button>
                <button onClick={resetJobForm} className={buttonSecondary}>
                  {t('tools.handyman.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className={labelClass}>{t('tools.handyman.category2', 'Category')}</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={inputClass}
                  >
                    <option value="all">{t('tools.handyman.allCategories', 'All Categories')}</option>
                    <option value="plumbing">{t('tools.handyman.plumbing2', 'Plumbing')}</option>
                    <option value="electrical">{t('tools.handyman.electrical2', 'Electrical')}</option>
                    <option value="carpentry">{t('tools.handyman.carpentry2', 'Carpentry')}</option>
                    <option value="general">{t('tools.handyman.general2', 'General')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.handyman.status2', 'Status')}</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="all">{t('tools.handyman.allStatus', 'All Status')}</option>
                    <option value="scheduled">{t('tools.handyman.scheduled2', 'Scheduled')}</option>
                    <option value="in-progress">{t('tools.handyman.inProgress2', 'In Progress')}</option>
                    <option value="complete">{t('tools.handyman.complete2', 'Complete')}</option>
                  </select>
                </div>
              </div>

              {/* Jobs List */}
              {filteredJobs.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.handyman.noJobsFoundCreateYour', 'No jobs found. Create your first job to get started!')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredJobs.map((job) => {
                    const customer = getCustomer(job.customerId);
                    const CategoryIcon = categoryIcons[job.category];
                    const totalEstimate = calculateJobTotal(job);

                    return (
                      <div
                        key={job.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${categoryColors[job.category]}`}>
                              <CategoryIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3
                                className={`font-semibold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {job.title}
                              </h3>
                              <p
                                className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                {customer?.name || 'Unknown Customer'}
                              </p>
                              {job.scheduledDate && (
                                <p
                                  className={`text-sm flex items-center gap-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  <Calendar className="w-4 h-4" />
                                  {job.scheduledDate} {job.scheduledTime && `at ${job.scheduledTime}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                                statusColors[job.status]
                              }`}
                            >
                              {job.status.replace('-', ' ')}
                            </span>
                            <span
                              className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              ${totalEstimate.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Tasks Progress */}
                        {job.tasks.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-xs ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Tasks: {job.tasks.filter((t) => t.completed).length}/{job.tasks.length}
                              </span>
                            </div>
                            <div
                              className={`h-2 rounded-full ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                              }`}
                            >
                              <div
                                className="h-2 rounded-full bg-[#0D9488] transition-all"
                                style={{
                                  width: `${
                                    (job.tasks.filter((t) => t.completed).length / job.tasks.length) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditJob(job)}
                            className={`${buttonSecondary} text-sm py-1.5`}
                          >
                            <Edit2 className="w-4 h-4" />
                            {t('tools.handyman.edit', 'Edit')}
                          </button>
                          {job.status === 'complete' && (
                            <button
                              onClick={() => {
                                const invoice = generateInvoice(job);
                                if (invoice) {
                                  setValidationMessage(`Invoice generated: $${invoice.total.toFixed(2)}`);
                                  setTimeout(() => setValidationMessage(null), 3000);
                                }
                              }}
                              className={`${buttonPrimary} text-sm py-1.5`}
                            >
                              <FileText className="w-4 h-4" />
                              {t('tools.handyman.invoice', 'Invoice')}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div>
              {customers.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.handyman.noCustomersYetAddYour', 'No customers yet. Add your first customer to get started!')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {customers.map((customer) => {
                    const customerJobs = jobs.filter((j) => j.customerId === customer.id);
                    const completedJobs = customerJobs.filter((j) => j.status === 'complete');
                    const totalRevenue = completedJobs.reduce(
                      (sum, job) => sum + calculateJobTotal(job),
                      0
                    );

                    return (
                      <div
                        key={customer.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {customer.name}
                            </h3>
                            {customer.email && (
                              <p
                                className={`text-sm flex items-center gap-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                <Mail className="w-4 h-4" />
                                {customer.email}
                              </p>
                            )}
                            {customer.phone && (
                              <p
                                className={`text-sm flex items-center gap-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                              </p>
                            )}
                            {customer.address && (
                              <p
                                className={`text-sm flex items-center gap-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                <MapPin className="w-4 h-4" />
                                {customer.address}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {customerJobs.length} job{customerJobs.length !== 1 ? 's' : ''}
                            </p>
                            <p className={`font-semibold text-[#0D9488]`}>${totalRevenue.toFixed(2)}</p>
                          </div>
                        </div>
                        {customer.notes && (
                          <p
                            className={`mt-2 text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {customer.notes}
                          </p>
                        )}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className={`${buttonSecondary} text-sm py-1.5`}
                          >
                            <Edit2 className="w-4 h-4" />
                            {t('tools.handyman.edit2', 'Edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              {invoices.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.handyman.noInvoicesGeneratedYetComplete', 'No invoices generated yet. Complete a job to generate an invoice!')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => {
                    const job = jobs.find((j) => j.id === invoice.jobId);
                    const customer = customers.find((c) => c.id === invoice.customerId);

                    return (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3
                              className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              Invoice #{invoice.id.toUpperCase()}
                            </h3>
                            <p
                              className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {customer?.name} - {job?.title}
                            </p>
                            <p
                              className={`text-xs ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                              }`}
                            >
                              Generated: {new Date(invoice.generatedAt).toLocaleString()}
                            </p>
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            ${invoice.total.toFixed(2)}
                          </div>
                        </div>

                        <div
                          className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{t('tools.handyman.labor', 'Labor')}</p>
                            <p>${invoice.laborTotal.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-medium">{t('tools.handyman.materials', 'Materials')}</p>
                            <p>${invoice.materialsTotal.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-medium">{t('tools.handyman.travel', 'Travel')}</p>
                            <p>${invoice.travelCharge.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-medium">{t('tools.handyman.tax8', 'Tax (8%)')}</p>
                            <p>${invoice.tax.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              const invoiceText = `
INVOICE #${invoice.id.toUpperCase()}
Date: ${new Date(invoice.generatedAt).toLocaleString()}

Customer: ${customer?.name || 'N/A'}
Address: ${customer?.address || 'N/A'}

Job: ${job?.title || 'N/A'}

BREAKDOWN
---------
Labor: $${invoice.laborTotal.toFixed(2)}
Materials: $${invoice.materialsTotal.toFixed(2)}
Travel: $${invoice.travelCharge.toFixed(2)}
---------
Subtotal: $${invoice.subtotal.toFixed(2)}
Tax (8%): $${invoice.tax.toFixed(2)}
---------
TOTAL: $${invoice.total.toFixed(2)}
                              `;
                              const blob = new Blob([invoiceText], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `invoice-${invoice.id}.txt`;
                              a.click();
                            }}
                            className={`${buttonPrimary} text-sm py-1.5`}
                          >
                            <Download className="w-4 h-4" />
                            {t('tools.handyman.download', 'Download')}
                          </button>
                          <button
                            onClick={() => {
                              if (customer?.email) {
                                window.location.href = `mailto:${customer.email}?subject=Invoice ${invoice.id}&body=Please find your invoice attached. Total: $${invoice.total.toFixed(2)}`;
                              } else {
                                setValidationMessage('Customer email not available');
                                setTimeout(() => setValidationMessage(null), 3000);
                              }
                            }}
                            className={`${buttonSecondary} text-sm py-1.5`}
                          >
                            <Send className="w-4 h-4" />
                            {t('tools.handyman.email2', 'Email')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div
            className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.handyman.totalCustomers', 'Total Customers')}
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {customers.length}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.handyman.activeJobs', 'Active Jobs')}
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {jobs.filter((j) => j.status !== 'complete').length}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.handyman.completedJobs', 'Completed Jobs')}
            </p>
            <p className={`text-2xl font-bold text-green-500`}>
              {jobs.filter((j) => j.status === 'complete').length}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.handyman.totalRevenue', 'Total Revenue')}
            </p>
            <p className={`text-2xl font-bold text-[#0D9488]`}>
              $
              {invoices
                .reduce((sum, inv) => sum + inv.total, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div
          className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.handyman.aboutHandymanServiceManager', 'About Handyman Service Manager')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Manage your handyman business efficiently with customer tracking, job scheduling,
              materials tracking, and invoice generation.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('tools.handyman.trackCustomersAndTheirContact', 'Track customers and their contact information')}</li>
              <li>{t('tools.handyman.createJobsWithDetailedTask', 'Create jobs with detailed task lists and materials')}</li>
              <li>{t('tools.handyman.chooseBetweenHourlyOrFlat', 'Choose between hourly or flat-rate pricing')}</li>
              <li>{t('tools.handyman.documentBeforeAfterWorkWith', 'Document before/after work with notes')}</li>
              <li>{t('tools.handyman.trackTravelTimeAndGenerate', 'Track travel time and generate invoices')}</li>
              <li>{t('tools.handyman.collectCustomerFeedbackAfterJob', 'Collect customer feedback after job completion')}</li>
            </ul>
            <p className="text-xs mt-2 italic">
              {t('tools.handyman.dataIsSyncedToThe', 'Data is synced to the cloud when logged in, or stored locally in your browser.')}
            </p>
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog />

        {/* Validation Toast */}
        {validationMessage && (
          <div
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200'
            } flex items-center gap-2 animate-in fade-in-0 slide-in-from-bottom-4`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandymanTool;
