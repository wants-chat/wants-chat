'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Droplets,
  User,
  Building2,
  Calendar,
  MapPin,
  Users,
  Wrench,
  DollarSign,
  FileText,
  Cloud,
  Home,
  Shield,
  Receipt,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Save,
  Search,
  Filter,
  SortAsc,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  createdAt: string;
}

interface Property {
  id: string;
  customerId: string;
  name: string;
  address: string;
  type: 'residential' | 'commercial';
  windowCount: number;
  floors: number;
  totalSqft: number;
  accessRequirements: string[];
  specialNotes: string;
}

interface CrewMember {
  id: string;
  name: string;
  phone: string;
  specializations: string[];
  available: boolean;
}

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'good' | 'fair' | 'needs-replacement';
  lastChecked: string;
}

interface ServiceJob {
  id: string;
  customerId: string;
  propertyId: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'weather-delayed';
  assignedCrew: string[];
  equipment: string[];
  pricingType: 'per-window' | 'per-sqft' | 'flat-rate';
  pricePerUnit: number;
  totalPrice: number;
  beforeNotes: string;
  afterNotes: string;
  safetyChecklist: SafetyChecklistItem[];
  weatherConditions: WeatherConditions;
}

interface SafetyChecklistItem {
  id: string;
  item: string;
  checked: boolean;
}

interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  precipitation: string;
  isSafeToWork: boolean;
}

interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
}

type TabType = 'customers' | 'properties' | 'scheduling' | 'routes' | 'crew' | 'equipment' | 'pricing' | 'safety' | 'invoices';

const defaultSafetyChecklist: SafetyChecklistItem[] = [
  { id: '1', item: 'Personal protective equipment (PPE) worn', checked: false },
  { id: '2', item: 'Ladder inspected and secured', checked: false },
  { id: '3', item: 'Lift equipment certified and operational', checked: false },
  { id: '4', item: 'Weather conditions checked', checked: false },
  { id: '5', item: 'Work area secured from public', checked: false },
  { id: '6', item: 'Emergency contacts available', checked: false },
  { id: '7', item: 'First aid kit accessible', checked: false },
  { id: '8', item: 'Communication devices charged', checked: false },
];

const accessRequirementOptions = [
  'Ground level only',
  'Extension ladder',
  'Scaffolding',
  'Boom lift',
  'Scissor lift',
  'Rope descent system',
  'Interior access required',
  'Key/code needed',
  'Escort required',
];

// Column configurations for export
const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zip', header: 'ZIP', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const PROPERTY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'windowCount', header: 'Window Count', type: 'number' },
  { key: 'floors', header: 'Floors', type: 'number' },
  { key: 'totalSqft', header: 'Total Sqft', type: 'number' },
  { key: 'accessRequirements', header: 'Access Requirements', type: 'string', format: (val) => Array.isArray(val) ? val.join(', ') : val },
  { key: 'specialNotes', header: 'Special Notes', type: 'string' },
];

const CREW_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'specializations', header: 'Specializations', type: 'string', format: (val) => Array.isArray(val) ? val.join(', ') : val },
  { key: 'available', header: 'Available', type: 'boolean' },
];

const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'lastChecked', header: 'Last Checked', type: 'date' },
];

const JOB_COLUMNS: ColumnConfig[] = [
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'pricingType', header: 'Pricing Type', type: 'string' },
  { key: 'pricePerUnit', header: 'Price Per Unit', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'beforeNotes', header: 'Before Notes', type: 'string' },
  { key: 'afterNotes', header: 'After Notes', type: 'string' },
];

const INVOICE_COLUMNS: ColumnConfig[] = [
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'paidDate', header: 'Paid Date', type: 'date' },
  { key: 'paymentMethod', header: 'Payment Method', type: 'string' },
];

// Combined data structure for backend sync
interface WindowCleaningData {
  id: string;
  customers: Customer[];
  properties: Property[];
  crewMembers: CrewMember[];
  equipment: EquipmentItem[];
  jobs: ServiceJob[];
  invoices: Invoice[];
}

// Column configuration for sync (minimal - actual exports use entity-specific columns)
const SYNC_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customers', header: 'Customers', type: 'string' },
  { key: 'properties', header: 'Properties', type: 'string' },
  { key: 'crewMembers', header: 'Crew Members', type: 'string' },
  { key: 'equipment', header: 'Equipment', type: 'string' },
  { key: 'jobs', header: 'Jobs', type: 'string' },
  { key: 'invoices', header: 'Invoices', type: 'string' },
];

const DEFAULT_DATA: WindowCleaningData = {
  id: 'main',
  customers: [],
  properties: [],
  crewMembers: [],
  equipment: [],
  jobs: [],
  invoices: [],
};

interface WindowCleaningToolProps {
  uiConfig?: UIConfig;
}

export const WindowCleaningTool: React.FC<WindowCleaningToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: toolData,
    setData: setToolData,
    updateItem,
    exportCSV: toolExportCSV,
    exportExcel: toolExportExcel,
    exportJSON: toolExportJSON,
    exportPDF: toolExportPDF,
    importCSV: toolImportCSV,
    importJSON: toolImportJSON,
    copyToClipboard: toolCopyToClipboard,
    print: toolPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<WindowCleaningData>('window-cleaning', [DEFAULT_DATA], SYNC_COLUMNS);

  // Extract individual data arrays from the synced data
  const mainData = toolData[0] || DEFAULT_DATA;
  const customers = mainData.customers;
  const properties = mainData.properties;
  const crewMembers = mainData.crewMembers;
  const equipment = mainData.equipment;
  const jobs = mainData.jobs;
  const invoices = mainData.invoices;

  // Helper function to update nested data
  const updateData = (updates: Partial<WindowCleaningData>) => {
    const newData: WindowCleaningData = {
      ...mainData,
      ...updates,
    };
    setToolData([newData]);
  };

  // Wrapper setters for each data type
  const setCustomers = (updater: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const newCustomers = typeof updater === 'function' ? updater(customers) : updater;
    updateData({ customers: newCustomers });
  };

  const setProperties = (updater: Property[] | ((prev: Property[]) => Property[])) => {
    const newProperties = typeof updater === 'function' ? updater(properties) : updater;
    updateData({ properties: newProperties });
  };

  const setCrewMembers = (updater: CrewMember[] | ((prev: CrewMember[]) => CrewMember[])) => {
    const newCrewMembers = typeof updater === 'function' ? updater(crewMembers) : updater;
    updateData({ crewMembers: newCrewMembers });
  };

  const setEquipment = (updater: EquipmentItem[] | ((prev: EquipmentItem[]) => EquipmentItem[])) => {
    const newEquipment = typeof updater === 'function' ? updater(equipment) : updater;
    updateData({ equipment: newEquipment });
  };

  const setJobs = (updater: ServiceJob[] | ((prev: ServiceJob[]) => ServiceJob[])) => {
    const newJobs = typeof updater === 'function' ? updater(jobs) : updater;
    updateData({ jobs: newJobs });
  };

  const setInvoices = (updater: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    const newInvoices = typeof updater === 'function' ? updater(invoices) : updater;
    updateData({ invoices: newInvoices });
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('customers');

  // Form states
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Customer form
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});

  // Property form
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({
    type: 'residential',
    accessRequirements: [],
  });

  // Job form
  const [jobForm, setJobForm] = useState<Partial<ServiceJob>>({
    serviceType: 'one-time',
    status: 'scheduled',
    pricingType: 'per-window',
    assignedCrew: [],
    equipment: [],
    safetyChecklist: [...defaultSafetyChecklist],
    weatherConditions: {
      temperature: 70,
      windSpeed: 5,
      precipitation: 'none',
      isSafeToWork: true,
    },
  });

  // Crew form
  const [crewForm, setCrewForm] = useState<Partial<CrewMember>>({
    specializations: [],
    available: true,
  });

  // Equipment form
  const [equipmentForm, setEquipmentForm] = useState<Partial<EquipmentItem>>({
    condition: 'good',
  });

  // Pricing calculator
  const [pricingCalc, setPricingCalc] = useState({
    windowCount: 0,
    sqft: 0,
    floors: 1,
    type: 'residential' as 'residential' | 'commercial',
    pricePerWindow: 5,
    pricePerSqft: 0.15,
    baseRate: 50,
    floorMultiplier: 1.25,
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
      if (params.email) {
        setCustomerForm(prev => ({ ...prev, email: params.email as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Utility functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Computed values
  const calculatedPrice = useMemo(() => {
    const { windowCount, sqft, floors, type, pricePerWindow, pricePerSqft, baseRate, floorMultiplier } = pricingCalc;
    const floorAdjustment = Math.pow(floorMultiplier, floors - 1);
    const typeMultiplier = type === 'commercial' ? 1.3 : 1;

    const byWindow = windowCount * pricePerWindow * floorAdjustment * typeMultiplier;
    const bySqft = sqft * pricePerSqft * floorAdjustment * typeMultiplier;
    const flatRate = baseRate * floors * typeMultiplier;

    return { byWindow, bySqft, flatRate };
  }, [pricingCalc]);

  const routeOptimization = useMemo(() => {
    const scheduledJobs = jobs.filter(j => j.status === 'scheduled');
    const groupedByDate: Record<string, ServiceJob[]> = {};

    scheduledJobs.forEach(job => {
      if (!groupedByDate[job.scheduledDate]) {
        groupedByDate[job.scheduledDate] = [];
      }
      groupedByDate[job.scheduledDate].push(job);
    });

    return groupedByDate;
  }, [jobs]);

  // CRUD Operations
  const saveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;

    if (editingId) {
      setCustomers(prev => prev.map(c => c.id === editingId ? { ...c, ...customerForm } as Customer : c));
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        name: customerForm.name || '',
        email: customerForm.email || '',
        phone: customerForm.phone || '',
        address: customerForm.address || '',
        city: customerForm.city || '',
        state: customerForm.state || '',
        zip: customerForm.zip || '',
        notes: customerForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    resetCustomerForm();
  };

  const resetCustomerForm = () => {
    setCustomerForm({});
    setShowCustomerForm(false);
    setEditingId(null);
  };

  const editCustomer = (customer: Customer) => {
    setCustomerForm(customer);
    setEditingId(customer.id);
    setShowCustomerForm(true);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setProperties(prev => prev.filter(p => p.customerId !== id));
    setJobs(prev => prev.filter(j => j.customerId !== id));
  };

  const saveProperty = () => {
    if (!propertyForm.name || !propertyForm.customerId) return;

    if (editingId) {
      setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...propertyForm } as Property : p));
    } else {
      const newProperty: Property = {
        id: generateId(),
        customerId: propertyForm.customerId || '',
        name: propertyForm.name || '',
        address: propertyForm.address || '',
        type: propertyForm.type || 'residential',
        windowCount: propertyForm.windowCount || 0,
        floors: propertyForm.floors || 1,
        totalSqft: propertyForm.totalSqft || 0,
        accessRequirements: propertyForm.accessRequirements || [],
        specialNotes: propertyForm.specialNotes || '',
      };
      setProperties(prev => [...prev, newProperty]);
    }
    resetPropertyForm();
  };

  const resetPropertyForm = () => {
    setPropertyForm({ type: 'residential', accessRequirements: [] });
    setShowPropertyForm(false);
    setEditingId(null);
  };

  const editProperty = (property: Property) => {
    setPropertyForm(property);
    setEditingId(property.id);
    setShowPropertyForm(true);
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    setJobs(prev => prev.filter(j => j.propertyId !== id));
  };

  const saveJob = () => {
    if (!jobForm.customerId || !jobForm.propertyId || !jobForm.scheduledDate) return;

    const property = properties.find(p => p.id === jobForm.propertyId);
    let totalPrice = 0;

    if (property && jobForm.pricingType && jobForm.pricePerUnit) {
      if (jobForm.pricingType === 'per-window') {
        totalPrice = property.windowCount * jobForm.pricePerUnit;
      } else if (jobForm.pricingType === 'per-sqft') {
        totalPrice = property.totalSqft * jobForm.pricePerUnit;
      } else {
        totalPrice = jobForm.pricePerUnit;
      }
    }

    if (editingId) {
      setJobs(prev => prev.map(j => j.id === editingId ? { ...j, ...jobForm, totalPrice } as ServiceJob : j));
    } else {
      const newJob: ServiceJob = {
        id: generateId(),
        customerId: jobForm.customerId || '',
        propertyId: jobForm.propertyId || '',
        scheduledDate: jobForm.scheduledDate || '',
        scheduledTime: jobForm.scheduledTime || '09:00',
        serviceType: jobForm.serviceType || 'one-time',
        status: jobForm.status || 'scheduled',
        assignedCrew: jobForm.assignedCrew || [],
        equipment: jobForm.equipment || [],
        pricingType: jobForm.pricingType || 'per-window',
        pricePerUnit: jobForm.pricePerUnit || 0,
        totalPrice,
        beforeNotes: jobForm.beforeNotes || '',
        afterNotes: jobForm.afterNotes || '',
        safetyChecklist: jobForm.safetyChecklist || [...defaultSafetyChecklist],
        weatherConditions: jobForm.weatherConditions || {
          temperature: 70,
          windSpeed: 5,
          precipitation: 'none',
          isSafeToWork: true,
        },
      };
      setJobs(prev => [...prev, newJob]);
    }
    resetJobForm();
  };

  const resetJobForm = () => {
    setJobForm({
      serviceType: 'one-time',
      status: 'scheduled',
      pricingType: 'per-window',
      assignedCrew: [],
      equipment: [],
      safetyChecklist: [...defaultSafetyChecklist],
      weatherConditions: {
        temperature: 70,
        windSpeed: 5,
        precipitation: 'none',
        isSafeToWork: true,
      },
    });
    setShowJobForm(false);
    setEditingId(null);
  };

  const editJob = (job: ServiceJob) => {
    setJobForm(job);
    setEditingId(job.id);
    setShowJobForm(true);
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setInvoices(prev => prev.filter(i => i.jobId !== id));
  };

  const saveCrew = () => {
    if (!crewForm.name || !crewForm.phone) return;

    if (editingId) {
      setCrewMembers(prev => prev.map(c => c.id === editingId ? { ...c, ...crewForm } as CrewMember : c));
    } else {
      const newCrew: CrewMember = {
        id: generateId(),
        name: crewForm.name || '',
        phone: crewForm.phone || '',
        specializations: crewForm.specializations || [],
        available: crewForm.available ?? true,
      };
      setCrewMembers(prev => [...prev, newCrew]);
    }
    resetCrewForm();
  };

  const resetCrewForm = () => {
    setCrewForm({ specializations: [], available: true });
    setShowCrewForm(false);
    setEditingId(null);
  };

  const saveEquipment = () => {
    if (!equipmentForm.name) return;

    if (editingId) {
      setEquipment(prev => prev.map(e => e.id === editingId ? { ...e, ...equipmentForm } as EquipmentItem : e));
    } else {
      const newEquipment: EquipmentItem = {
        id: generateId(),
        name: equipmentForm.name || '',
        quantity: equipmentForm.quantity || 1,
        condition: equipmentForm.condition || 'good',
        lastChecked: new Date().toISOString().split('T')[0],
      };
      setEquipment(prev => [...prev, newEquipment]);
    }
    resetEquipmentForm();
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({ condition: 'good' });
    setShowEquipmentForm(false);
    setEditingId(null);
  };

  const generateInvoice = (job: ServiceJob) => {
    const taxRate = 0.08;
    const tax = job.totalPrice * taxRate;
    const total = job.totalPrice + tax;

    const newInvoice: Invoice = {
      id: generateId(),
      jobId: job.id,
      customerId: job.customerId,
      amount: job.totalPrice,
      tax,
      total,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paidDate: null,
      paymentMethod: null,
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const markInvoicePaid = (invoiceId: string, method: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invoiceId
        ? { ...inv, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0], paymentMethod: method }
        : inv
    ));
  };

  const updateJobStatus = (jobId: string, status: ServiceJob['status']) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const updateSafetyChecklist = (jobId: string, itemId: string, checked: boolean) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        safetyChecklist: j.safetyChecklist.map(item =>
          item.id === itemId ? { ...item, checked } : item
        ),
      };
    }));
  };

  const checkWeatherSafety = (conditions: WeatherConditions): boolean => {
    return conditions.windSpeed < 25 &&
           conditions.temperature > 32 &&
           conditions.temperature < 100 &&
           conditions.precipitation === 'none';
  };

  // Filtered data
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === '' ||
        customers.find(c => c.id === job.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        properties.find(p => p.id === job.propertyId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, filterStatus, customers, properties]);

  // Style classes
  const cardClass = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg`;
  const inputClass = `w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2';
  const buttonSecondary = `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2`;

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
    { id: 'properties', label: 'Properties', icon: <Building2 className="w-4 h-4" /> },
    { id: 'scheduling', label: 'Scheduling', icon: <Calendar className="w-4 h-4" /> },
    { id: 'routes', label: 'Routes', icon: <MapPin className="w-4 h-4" /> },
    { id: 'crew', label: 'Crew', icon: <Users className="w-4 h-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Wrench className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'safety', label: 'Safety', icon: <Shield className="w-4 h-4" /> },
    { id: 'invoices', label: 'Invoices', icon: <Receipt className="w-4 h-4" /> },
  ];

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name || 'Unknown';

  // Export helpers
  const getExportData = () => {
    switch (activeTab) {
      case 'customers':
        return { data: customers, columns: CUSTOMER_COLUMNS, filename: 'window-cleaning-customers' };
      case 'properties':
        return { data: properties, columns: PROPERTY_COLUMNS, filename: 'window-cleaning-properties' };
      case 'crew':
        return { data: crewMembers, columns: CREW_COLUMNS, filename: 'window-cleaning-crew' };
      case 'equipment':
        return { data: equipment, columns: EQUIPMENT_COLUMNS, filename: 'window-cleaning-equipment' };
      case 'scheduling':
      case 'routes':
        return { data: jobs, columns: JOB_COLUMNS, filename: 'window-cleaning-jobs' };
      case 'invoices':
        return { data: invoices, columns: INVOICE_COLUMNS, filename: 'window-cleaning-invoices' };
      default:
        return { data: customers, columns: CUSTOMER_COLUMNS, filename: 'window-cleaning-data' };
    }
  };

  const handleExportCSV = () => {
    const { data, columns, filename } = getExportData();
    exportToCSV(data, columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getExportData();
    exportToExcel(data, columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getExportData();
    exportToJSON(data, { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getExportData();
    await exportToPDF(data, columns, { filename, title: 'Window Cleaning Service Data' });
  };

  const handlePrint = () => {
    const { data, columns } = getExportData();
    printData(data, columns, { title: 'Window Cleaning Service Data' });
  };

  const handleCopyToClipboard = async () => {
    const { data, columns } = getExportData();
    return copyUtil(data, columns);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.windowCleaning.loadingData', 'Loading data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} p-6 mb-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.windowCleaning.windowCleaningServiceManager', 'Window Cleaning Service Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.windowCleaning.manageCustomersPropertiesSchedulingAnd', 'Manage customers, properties, scheduling, and invoicing')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="window-cleaning" toolName="Window Cleaning" />

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
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Customers', value: customers.length, color: 'text-blue-500' },
            { label: 'Properties', value: properties.length, color: 'text-green-500' },
            { label: 'Scheduled', value: jobs.filter(j => j.status === 'scheduled').length, color: 'text-yellow-500' },
            { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, color: 'text-emerald-500' },
            { label: 'Crew', value: crewMembers.filter(c => c.available).length, color: 'text-purple-500' },
            { label: 'Pending $', value: `$${invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0).toFixed(0)}`, color: 'text-orange-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`${cardClass} p-4`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex flex-wrap gap-1 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${cardClass} p-6`}>
          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.windowCleaning.customerProfiles', 'Customer Profiles')}
                </h2>
                <button onClick={() => setShowCustomerForm(true)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" /> Add Customer
                </button>
              </div>

              {showCustomerForm && (
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.name', 'Name *')}</label>
                      <input
                        type="text"
                        value={customerForm.name || ''}
                        onChange={e => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.customerName', 'Customer name')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.phone', 'Phone *')}</label>
                      <input
                        type="tel"
                        value={customerForm.phone || ''}
                        onChange={e => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.email', 'Email')}</label>
                      <input
                        type="email"
                        value={customerForm.email || ''}
                        onChange={e => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.emailExampleCom', 'email@example.com')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.address', 'Address')}</label>
                      <input
                        type="text"
                        value={customerForm.address || ''}
                        onChange={e => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.streetAddress', 'Street address')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.city', 'City')}</label>
                      <input
                        type="text"
                        value={customerForm.city || ''}
                        onChange={e => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.city2', 'City')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>{t('tools.windowCleaning.state', 'State')}</label>
                        <input
                          type="text"
                          value={customerForm.state || ''}
                          onChange={e => setCustomerForm(prev => ({ ...prev, state: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.windowCleaning.state2', 'State')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.windowCleaning.zip', 'ZIP')}</label>
                        <input
                          type="text"
                          value={customerForm.zip || ''}
                          onChange={e => setCustomerForm(prev => ({ ...prev, zip: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.windowCleaning.zip2', 'ZIP')}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.notes', 'Notes')}</label>
                    <textarea
                      value={customerForm.notes || ''}
                      onChange={e => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder={t('tools.windowCleaning.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveCustomer} className={buttonPrimary}>
                      <Save className="w-4 h-4" /> {editingId ? t('tools.windowCleaning.update', 'Update') : t('tools.windowCleaning.save', 'Save')}
                    </button>
                    <button onClick={resetCustomerForm} className={buttonSecondary}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {customers.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.windowCleaning.noCustomersYetAddYour', 'No customers yet. Add your first customer to get started.')}
                  </div>
                ) : (
                  customers.map(customer => (
                    <div key={customer.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.name}</h3>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" /> {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" /> {customer.email}
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> {customer.address}, {customer.city}, {customer.state} {customer.zip}
                              </div>
                            )}
                          </div>
                          <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Properties: {properties.filter(p => p.customerId === customer.id).length} |
                            Jobs: {jobs.filter(j => j.customerId === customer.id).length}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editCustomer(customer)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => deleteCustomer(customer.id)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.windowCleaning.propertyDetails2', 'Property Details')}
                </h2>
                <button onClick={() => setShowPropertyForm(true)} className={buttonPrimary} disabled={customers.length === 0}>
                  <Plus className="w-4 h-4" /> Add Property
                </button>
              </div>

              {customers.length === 0 && (
                <div className={`text-center py-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  {t('tools.windowCleaning.addACustomerFirstBefore', 'Add a customer first before adding properties.')}
                </div>
              )}

              {showPropertyForm && (
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.customer', 'Customer *')}</label>
                      <select
                        value={propertyForm.customerId || ''}
                        onChange={e => setPropertyForm(prev => ({ ...prev, customerId: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="">{t('tools.windowCleaning.selectCustomer', 'Select customer...')}</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.propertyName', 'Property Name *')}</label>
                      <input
                        type="text"
                        value={propertyForm.name || ''}
                        onChange={e => setPropertyForm(prev => ({ ...prev, name: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.eGMainOfficeHome', 'e.g., Main Office, Home')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.address2', 'Address')}</label>
                      <input
                        type="text"
                        value={propertyForm.address || ''}
                        onChange={e => setPropertyForm(prev => ({ ...prev, address: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.propertyAddress', 'Property address')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.type', 'Type')}</label>
                      <select
                        value={propertyForm.type || 'residential'}
                        onChange={e => setPropertyForm(prev => ({ ...prev, type: e.target.value as 'residential' | 'commercial' }))}
                        className={inputClass}
                      >
                        <option value="residential">{t('tools.windowCleaning.residential', 'Residential')}</option>
                        <option value="commercial">{t('tools.windowCleaning.commercial', 'Commercial')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.windowCount', 'Window Count')}</label>
                      <input
                        type="number"
                        value={propertyForm.windowCount || ''}
                        onChange={e => setPropertyForm(prev => ({ ...prev, windowCount: parseInt(e.target.value) || 0 }))}
                        className={inputClass}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.numberOfFloors', 'Number of Floors')}</label>
                      <input
                        type="number"
                        value={propertyForm.floors || ''}
                        onChange={e => setPropertyForm(prev => ({ ...prev, floors: parseInt(e.target.value) || 1 }))}
                        className={inputClass}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.totalSqFt', 'Total Sq.Ft.')}</label>
                      <input
                        type="number"
                        value={propertyForm.totalSqft || ''}
                        onChange={e => setPropertyForm(prev => ({ ...prev, totalSqft: parseInt(e.target.value) || 0 }))}
                        className={inputClass}
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.accessRequirements', 'Access Requirements')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {accessRequirementOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            const current = propertyForm.accessRequirements || [];
                            if (current.includes(option)) {
                              setPropertyForm(prev => ({
                                ...prev,
                                accessRequirements: current.filter(r => r !== option),
                              }));
                            } else {
                              setPropertyForm(prev => ({
                                ...prev,
                                accessRequirements: [...current, option],
                              }));
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            propertyForm.accessRequirements?.includes(option)
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.specialNotes', 'Special Notes')}</label>
                    <textarea
                      value={propertyForm.specialNotes || ''}
                      onChange={e => setPropertyForm(prev => ({ ...prev, specialNotes: e.target.value }))}
                      className={`${inputClass} resize-none`}
                      rows={2}
                      placeholder={t('tools.windowCleaning.specialAccessCodesParkingInfo', 'Special access codes, parking info, etc.')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveProperty} className={buttonPrimary}>
                      <Save className="w-4 h-4" /> {editingId ? t('tools.windowCleaning.update2', 'Update') : t('tools.windowCleaning.save2', 'Save')}
                    </button>
                    <button onClick={resetPropertyForm} className={buttonSecondary}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {properties.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.windowCleaning.noPropertiesYetAddProperties', 'No properties yet. Add properties for your customers.')}
                  </div>
                ) : (
                  properties.map(property => (
                    <div key={property.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{property.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              property.type === 'commercial'
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-green-500/20 text-green-500'
                            }`}>
                              {property.type}
                            </span>
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Customer: {getCustomerName(property.customerId)}
                          </div>
                          {property.address && (
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                              <MapPin className="w-3 h-3" /> {property.address}
                            </div>
                          )}
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2 flex gap-4`}>
                            <span>{property.windowCount} windows</span>
                            <span>{property.floors} floors</span>
                            <span>{property.totalSqft.toLocaleString()} sq.ft.</span>
                          </div>
                          {property.accessRequirements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {property.accessRequirements.map(req => (
                                <span key={req} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                                  {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editProperty(property)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => deleteProperty(property.id)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Scheduling Tab */}
          {activeTab === 'scheduling' && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.windowCleaning.serviceScheduling', 'Service Scheduling')}
                </h2>
                <button onClick={() => setShowJobForm(true)} className={buttonPrimary} disabled={properties.length === 0}>
                  <Plus className="w-4 h-4" /> Schedule Job
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder={t('tools.windowCleaning.searchJobs', 'Search jobs...')}
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.windowCleaning.allStatus', 'All Status')}</option>
                  <option value="scheduled">{t('tools.windowCleaning.scheduled', 'Scheduled')}</option>
                  <option value="in-progress">{t('tools.windowCleaning.inProgress', 'In Progress')}</option>
                  <option value="completed">{t('tools.windowCleaning.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.windowCleaning.cancelled', 'Cancelled')}</option>
                  <option value="weather-delayed">{t('tools.windowCleaning.weatherDelayed', 'Weather Delayed')}</option>
                </select>
              </div>

              {properties.length === 0 && (
                <div className={`text-center py-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  {t('tools.windowCleaning.addCustomersAndPropertiesFirst', 'Add customers and properties first before scheduling jobs.')}
                </div>
              )}

              {showJobForm && (
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.customer2', 'Customer *')}</label>
                      <select
                        value={jobForm.customerId || ''}
                        onChange={e => {
                          setJobForm(prev => ({ ...prev, customerId: e.target.value, propertyId: '' }));
                        }}
                        className={inputClass}
                      >
                        <option value="">{t('tools.windowCleaning.selectCustomer2', 'Select customer...')}</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.property', 'Property *')}</label>
                      <select
                        value={jobForm.propertyId || ''}
                        onChange={e => setJobForm(prev => ({ ...prev, propertyId: e.target.value }))}
                        className={inputClass}
                        disabled={!jobForm.customerId}
                      >
                        <option value="">{t('tools.windowCleaning.selectProperty', 'Select property...')}</option>
                        {properties.filter(p => p.customerId === jobForm.customerId).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.date', 'Date *')}</label>
                      <input
                        type="date"
                        value={jobForm.scheduledDate || ''}
                        onChange={e => setJobForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.time', 'Time')}</label>
                      <input
                        type="time"
                        value={jobForm.scheduledTime || '09:00'}
                        onChange={e => setJobForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.serviceType', 'Service Type')}</label>
                      <select
                        value={jobForm.serviceType || 'one-time'}
                        onChange={e => setJobForm(prev => ({ ...prev, serviceType: e.target.value as ServiceJob['serviceType'] }))}
                        className={inputClass}
                      >
                        <option value="one-time">{t('tools.windowCleaning.oneTime', 'One-Time')}</option>
                        <option value="weekly">{t('tools.windowCleaning.weekly', 'Weekly')}</option>
                        <option value="bi-weekly">{t('tools.windowCleaning.biWeekly', 'Bi-Weekly')}</option>
                        <option value="monthly">{t('tools.windowCleaning.monthly', 'Monthly')}</option>
                        <option value="quarterly">{t('tools.windowCleaning.quarterly', 'Quarterly')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.pricingType', 'Pricing Type')}</label>
                      <select
                        value={jobForm.pricingType || 'per-window'}
                        onChange={e => setJobForm(prev => ({ ...prev, pricingType: e.target.value as ServiceJob['pricingType'] }))}
                        className={inputClass}
                      >
                        <option value="per-window">{t('tools.windowCleaning.perWindow', 'Per Window')}</option>
                        <option value="per-sqft">{t('tools.windowCleaning.perSqFt', 'Per Sq.Ft.')}</option>
                        <option value="flat-rate">{t('tools.windowCleaning.flatRate', 'Flat Rate')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.pricePerUnit', 'Price Per Unit ($)')}</label>
                      <input
                        type="number"
                        value={jobForm.pricePerUnit || ''}
                        onChange={e => setJobForm(prev => ({ ...prev, pricePerUnit: parseFloat(e.target.value) || 0 }))}
                        className={inputClass}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.assignCrew', 'Assign Crew')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {crewMembers.filter(c => c.available).map(crew => (
                        <button
                          key={crew.id}
                          onClick={() => {
                            const current = jobForm.assignedCrew || [];
                            if (current.includes(crew.id)) {
                              setJobForm(prev => ({
                                ...prev,
                                assignedCrew: current.filter(id => id !== crew.id),
                              }));
                            } else {
                              setJobForm(prev => ({
                                ...prev,
                                assignedCrew: [...current, crew.id],
                              }));
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            jobForm.assignedCrew?.includes(crew.id)
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {crew.name}
                        </button>
                      ))}
                      {crewMembers.filter(c => c.available).length === 0 && (
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.windowCleaning.noAvailableCrewMembersAdd', 'No available crew members. Add crew in the Crew tab.')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.equipmentNeeded', 'Equipment Needed')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {equipment.map(eq => (
                        <button
                          key={eq.id}
                          onClick={() => {
                            const current = jobForm.equipment || [];
                            if (current.includes(eq.id)) {
                              setJobForm(prev => ({
                                ...prev,
                                equipment: current.filter(id => id !== eq.id),
                              }));
                            } else {
                              setJobForm(prev => ({
                                ...prev,
                                equipment: [...current, eq.id],
                              }));
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            jobForm.equipment?.includes(eq.id)
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {eq.name} ({eq.quantity})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.beforeNotes', 'Before Notes')}</label>
                      <textarea
                        value={jobForm.beforeNotes || ''}
                        onChange={e => setJobForm(prev => ({ ...prev, beforeNotes: e.target.value }))}
                        className={`${inputClass} resize-none`}
                        rows={2}
                        placeholder={t('tools.windowCleaning.conditionNotesBeforeService', 'Condition notes before service...')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.afterNotes', 'After Notes')}</label>
                      <textarea
                        value={jobForm.afterNotes || ''}
                        onChange={e => setJobForm(prev => ({ ...prev, afterNotes: e.target.value }))}
                        className={`${inputClass} resize-none`}
                        rows={2}
                        placeholder={t('tools.windowCleaning.conditionNotesAfterService', 'Condition notes after service...')}
                      />
                    </div>
                  </div>

                  {/* Weather Conditions */}
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Cloud className="w-4 h-4" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.windowCleaning.weatherConditions', 'Weather Conditions')}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.windowCleaning.temperatureF', 'Temperature (F)')}</label>
                        <input
                          type="number"
                          value={jobForm.weatherConditions?.temperature || 70}
                          onChange={e => setJobForm(prev => ({
                            ...prev,
                            weatherConditions: {
                              ...prev.weatherConditions!,
                              temperature: parseInt(e.target.value) || 70,
                            },
                          }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.windowCleaning.windSpeedMph', 'Wind Speed (mph)')}</label>
                        <input
                          type="number"
                          value={jobForm.weatherConditions?.windSpeed || 5}
                          onChange={e => setJobForm(prev => ({
                            ...prev,
                            weatherConditions: {
                              ...prev.weatherConditions!,
                              windSpeed: parseInt(e.target.value) || 5,
                            },
                          }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.windowCleaning.precipitation', 'Precipitation')}</label>
                        <select
                          value={jobForm.weatherConditions?.precipitation || 'none'}
                          onChange={e => setJobForm(prev => ({
                            ...prev,
                            weatherConditions: {
                              ...prev.weatherConditions!,
                              precipitation: e.target.value,
                            },
                          }))}
                          className={inputClass}
                        >
                          <option value="none">None</option>
                          <option value="light-rain">{t('tools.windowCleaning.lightRain', 'Light Rain')}</option>
                          <option value="heavy-rain">{t('tools.windowCleaning.heavyRain', 'Heavy Rain')}</option>
                          <option value="snow">{t('tools.windowCleaning.snow', 'Snow')}</option>
                          <option value="ice">{t('tools.windowCleaning.ice', 'Ice')}</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        {jobForm.weatherConditions && checkWeatherSafety(jobForm.weatherConditions) ? (
                          <span className="text-green-500 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Safe to work
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Unsafe conditions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={saveJob} className={buttonPrimary}>
                      <Save className="w-4 h-4" /> {editingId ? t('tools.windowCleaning.update3', 'Update') : t('tools.windowCleaning.schedule', 'Schedule')}
                    </button>
                    <button onClick={resetJobForm} className={buttonSecondary}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.windowCleaning.noJobsFoundScheduleYour', 'No jobs found. Schedule your first job to get started.')}
                  </div>
                ) : (
                  filteredJobs.map(job => {
                    const customer = customers.find(c => c.id === job.customerId);
                    const property = properties.find(p => p.id === job.propertyId);
                    return (
                      <div key={job.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {customer?.name} - {property?.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                job.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                job.status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' :
                                job.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-500' :
                                job.status === 'weather-delayed' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {job.status}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                                {job.serviceType}
                              </span>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <DollarSign className="w-3 h-3" />
                                ${job.totalPrice.toFixed(2)} ({job.pricingType})
                              </div>
                              {job.assignedCrew.length > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Users className="w-3 h-3" />
                                  {job.assignedCrew.map(id => crewMembers.find(c => c.id === id)?.name).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <select
                              value={job.status}
                              onChange={e => updateJobStatus(job.id, e.target.value as ServiceJob['status'])}
                              className={`${inputClass} text-sm py-1`}
                              style={{ width: 'auto' }}
                            >
                              <option value="scheduled">{t('tools.windowCleaning.scheduled2', 'Scheduled')}</option>
                              <option value="in-progress">{t('tools.windowCleaning.inProgress2', 'In Progress')}</option>
                              <option value="completed">{t('tools.windowCleaning.completed2', 'Completed')}</option>
                              <option value="cancelled">{t('tools.windowCleaning.cancelled2', 'Cancelled')}</option>
                              <option value="weather-delayed">{t('tools.windowCleaning.weatherDelayed2', 'Weather Delayed')}</option>
                            </select>
                            <div className="flex gap-1">
                              {job.status === 'completed' && !invoices.find(i => i.jobId === job.id) && (
                                <button
                                  onClick={() => generateInvoice(job)}
                                  className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                  title={t('tools.windowCleaning.generateInvoice', 'Generate Invoice')}
                                >
                                  <Receipt className="w-4 h-4 text-green-500" />
                                </button>
                              )}
                              <button onClick={() => editJob(job)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                <Edit className="w-4 h-4 text-blue-500" />
                              </button>
                              <button onClick={() => deleteJob(job.id)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.windowCleaning.routePlanning', 'Route Planning')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.windowCleaning.jobsGroupedByDateFor', 'Jobs grouped by date for efficient route planning')}
              </p>

              {Object.keys(routeOptimization).length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.windowCleaning.noScheduledJobsForRoute', 'No scheduled jobs for route planning. Schedule jobs first.')}
                </div>
              ) : (
                Object.entries(routeOptimization).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateJobs]) => (
                  <div key={date} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      <span className={`ml-2 text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({dateJobs.length} jobs)
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {dateJobs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)).map((job, idx) => {
                        const property = properties.find(p => p.id === job.propertyId);
                        const customer = customers.find(c => c.id === job.customerId);
                        return (
                          <div key={job.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-500' : 'bg-gray-200'}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {job.scheduledTime} - {customer?.name}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {property?.address || property?.name}
                              </div>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {property?.windowCount} windows | {property?.floors} floors
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Crew Tab */}
          {activeTab === 'crew' && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.windowCleaning.crewAssignment', 'Crew Assignment')}
                </h2>
                <button onClick={() => setShowCrewForm(true)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" /> Add Crew Member
                </button>
              </div>

              {showCrewForm && (
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.name2', 'Name *')}</label>
                      <input
                        type="text"
                        value={crewForm.name || ''}
                        onChange={e => setCrewForm(prev => ({ ...prev, name: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.crewMemberName', 'Crew member name')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.phone2', 'Phone *')}</label>
                      <input
                        type="tel"
                        value={crewForm.phone || ''}
                        onChange={e => setCrewForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.specializations', 'Specializations')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Residential', 'Commercial', 'High-rise', 'Rope access', 'Lift operation', 'Pressure washing'].map(spec => (
                        <button
                          key={spec}
                          onClick={() => {
                            const current = crewForm.specializations || [];
                            if (current.includes(spec)) {
                              setCrewForm(prev => ({
                                ...prev,
                                specializations: current.filter(s => s !== spec),
                              }));
                            } else {
                              setCrewForm(prev => ({
                                ...prev,
                                specializations: [...current, spec],
                              }));
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            crewForm.specializations?.includes(spec)
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={crewForm.available ?? true}
                      onChange={e => setCrewForm(prev => ({ ...prev, available: e.target.checked }))}
                      className="rounded"
                    />
                    <label className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.windowCleaning.availableForAssignments', 'Available for assignments')}</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveCrew} className={buttonPrimary}>
                      <Save className="w-4 h-4" /> {editingId ? t('tools.windowCleaning.update4', 'Update') : t('tools.windowCleaning.save3', 'Save')}
                    </button>
                    <button onClick={resetCrewForm} className={buttonSecondary}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crewMembers.length === 0 ? (
                  <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.windowCleaning.noCrewMembersYetAdd', 'No crew members yet. Add your first crew member.')}
                  </div>
                ) : (
                  crewMembers.map(crew => (
                    <div key={crew.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{crew.name}</h3>
                            <span className={`w-2 h-2 rounded-full ${crew.available ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Phone className="w-3 h-3 inline mr-1" /> {crew.phone}
                          </div>
                          {crew.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {crew.specializations.map(spec => (
                                <span key={spec} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Assigned to {jobs.filter(j => j.assignedCrew.includes(crew.id) && j.status !== 'completed').length} active jobs
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setCrewForm(crew);
                              setEditingId(crew.id);
                              setShowCrewForm(true);
                            }}
                            className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => setCrewMembers(prev => prev.filter(c => c.id !== crew.id))}
                            className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.windowCleaning.equipmentChecklist', 'Equipment Checklist')}
                </h2>
                <button onClick={() => setShowEquipmentForm(true)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" /> Add Equipment
                </button>
              </div>

              {showEquipmentForm && (
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.equipmentName', 'Equipment Name *')}</label>
                      <input
                        type="text"
                        value={equipmentForm.name || ''}
                        onChange={e => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                        className={inputClass}
                        placeholder={t('tools.windowCleaning.eGSqueegeeLadder', 'e.g., Squeegee, Ladder')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.quantity', 'Quantity')}</label>
                      <input
                        type="number"
                        value={equipmentForm.quantity || ''}
                        onChange={e => setEquipmentForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className={inputClass}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.windowCleaning.condition', 'Condition')}</label>
                      <select
                        value={equipmentForm.condition || 'good'}
                        onChange={e => setEquipmentForm(prev => ({ ...prev, condition: e.target.value as EquipmentItem['condition'] }))}
                        className={inputClass}
                      >
                        <option value="good">{t('tools.windowCleaning.good', 'Good')}</option>
                        <option value="fair">{t('tools.windowCleaning.fair', 'Fair')}</option>
                        <option value="needs-replacement">{t('tools.windowCleaning.needsReplacement', 'Needs Replacement')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEquipment} className={buttonPrimary}>
                      <Save className="w-4 h-4" /> {editingId ? t('tools.windowCleaning.update5', 'Update') : t('tools.windowCleaning.save4', 'Save')}
                    </button>
                    <button onClick={resetEquipmentForm} className={buttonSecondary}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.length === 0 ? (
                  <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.windowCleaning.noEquipmentAddedYetAdd', 'No equipment added yet. Add your equipment inventory.')}
                  </div>
                ) : (
                  equipment.map(item => (
                    <div key={item.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Quantity: {item.quantity}
                          </div>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                            item.condition === 'good' ? 'bg-green-500/20 text-green-500' :
                            item.condition === 'fair' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {item.condition}
                          </span>
                          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Last checked: {item.lastChecked}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEquipmentForm(item);
                              setEditingId(item.id);
                              setShowEquipmentForm(true);
                            }}
                            className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => setEquipment(prev => prev.filter(e => e.id !== item.id))}
                            className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.windowCleaning.pricingCalculator', 'Pricing Calculator')}
              </h2>

              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.windowCleaning.propertyDetails', 'Property Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.propertyType', 'Property Type')}</label>
                    <select
                      value={pricingCalc.type}
                      onChange={e => setPricingCalc(prev => ({ ...prev, type: e.target.value as 'residential' | 'commercial' }))}
                      className={inputClass}
                    >
                      <option value="residential">{t('tools.windowCleaning.residential2', 'Residential')}</option>
                      <option value="commercial">{t('tools.windowCleaning.commercial2', 'Commercial')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.numberOfWindows', 'Number of Windows')}</label>
                    <input
                      type="number"
                      value={pricingCalc.windowCount || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, windowCount: parseInt(e.target.value) || 0 }))}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.totalSqFt2', 'Total Sq.Ft.')}</label>
                    <input
                      type="number"
                      value={pricingCalc.sqft || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, sqft: parseInt(e.target.value) || 0 }))}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.numberOfFloors2', 'Number of Floors')}</label>
                    <input
                      type="number"
                      value={pricingCalc.floors || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, floors: parseInt(e.target.value) || 1 }))}
                      className={inputClass}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.windowCleaning.pricingRates', 'Pricing Rates')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.pricePerWindow', 'Price Per Window ($)')}</label>
                    <input
                      type="number"
                      value={pricingCalc.pricePerWindow || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, pricePerWindow: parseFloat(e.target.value) || 0 }))}
                      className={inputClass}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.pricePerSqFt', 'Price Per Sq.Ft. ($)')}</label>
                    <input
                      type="number"
                      value={pricingCalc.pricePerSqft || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, pricePerSqft: parseFloat(e.target.value) || 0 }))}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.baseFlatRate', 'Base Flat Rate ($)')}</label>
                    <input
                      type="number"
                      value={pricingCalc.baseRate || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.windowCleaning.floorMultiplier', 'Floor Multiplier')}</label>
                    <input
                      type="number"
                      value={pricingCalc.floorMultiplier || ''}
                      onChange={e => setPricingCalc(prev => ({ ...prev, floorMultiplier: parseFloat(e.target.value) || 1 }))}
                      className={inputClass}
                      min="1"
                      step="0.05"
                    />
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-lg`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.windowCleaning.calculatedPrices', 'Calculated Prices')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-[#0D9488]/20">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('tools.windowCleaning.perWindow2', 'Per Window')}</div>
                    <div className="text-3xl font-bold text-[#0D9488]">${calculatedPrice.byWindow.toFixed(2)}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {pricingCalc.windowCount} windows x ${pricingCalc.pricePerWindow}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-500/20">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('tools.windowCleaning.perSqFt2', 'Per Sq.Ft.')}</div>
                    <div className="text-3xl font-bold text-blue-500">${calculatedPrice.bySqft.toFixed(2)}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {pricingCalc.sqft} sq.ft. x ${pricingCalc.pricePerSqft}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-500/20">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('tools.windowCleaning.flatRate2', 'Flat Rate')}</div>
                    <div className="text-3xl font-bold text-purple-500">${calculatedPrice.flatRate.toFixed(2)}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      ${pricingCalc.baseRate} x {pricingCalc.floors} floors
                    </div>
                  </div>
                </div>
                {pricingCalc.type === 'commercial' && (
                  <div className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    * Commercial rate includes 30% premium
                  </div>
                )}
                {pricingCalc.floors > 1 && (
                  <div className={`text-center mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    * Multi-floor adjustment: {((Math.pow(pricingCalc.floorMultiplier, pricingCalc.floors - 1) - 1) * 100).toFixed(0)}% increase
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety Tab */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.windowCleaning.safetyChecklists', 'Safety Checklists')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.windowCleaning.safetyChecklistsForActiveJobs', 'Safety checklists for active jobs')}
              </p>

              {jobs.filter(j => j.status === 'scheduled' || j.status === 'in-progress').length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.windowCleaning.noActiveJobsWithSafety', 'No active jobs with safety checklists. Schedule jobs to see their safety requirements.')}
                </div>
              ) : (
                jobs.filter(j => j.status === 'scheduled' || j.status === 'in-progress').map(job => {
                  const customer = customers.find(c => c.id === job.customerId);
                  const property = properties.find(p => p.id === job.propertyId);
                  const checkedCount = job.safetyChecklist.filter(item => item.checked).length;
                  const totalCount = job.safetyChecklist.length;

                  return (
                    <div key={job.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {customer?.name} - {property?.name}
                          </h3>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${
                          checkedCount === totalCount ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {checkedCount}/{totalCount}
                        </div>
                      </div>

                      {/* Weather Alert */}
                      {!checkWeatherSafety(job.weatherConditions) && (
                        <div className="mb-3 p-3 rounded bg-red-500/20 text-red-500 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{t('tools.windowCleaning.weatherConditionsMayNotBe', 'Weather conditions may not be safe for work!')}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {job.safetyChecklist.map(item => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                              item.checked
                                ? isDark ? 'bg-green-500/20' : 'bg-green-100'
                                : isDark ? 'bg-gray-600' : 'bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={e => updateSafetyChecklist(job.id, item.id, e.target.checked)}
                              className="w-5 h-5 rounded"
                            />
                            <span className={`${item.checked ? 'line-through opacity-70' : ''} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.windowCleaning.invoicePaymentTracking', 'Invoice & Payment Tracking')}
              </h2>

              {invoices.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.windowCleaning.noInvoicesYetCompleteJobs', 'No invoices yet. Complete jobs and generate invoices from the Scheduling tab.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map(invoice => {
                    const customer = customers.find(c => c.id === invoice.customerId);
                    const job = jobs.find(j => j.id === invoice.jobId);
                    const property = job ? properties.find(p => p.id === job.propertyId) : null;

                    return (
                      <div key={invoice.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Invoice #{invoice.id.slice(0, 6).toUpperCase()}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                invoice.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                invoice.status === 'overdue' ? 'bg-red-500/20 text-red-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {customer?.name} - {property?.name}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              {invoice.paidDate && ` | Paid: ${new Date(invoice.paidDate).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Subtotal: ${invoice.amount.toFixed(2)}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Tax (8%): ${invoice.tax.toFixed(2)}
                            </div>
                            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${invoice.total.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {invoice.status === 'pending' && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.windowCleaning.markAsPaid', 'Mark as paid:')}</span>
                            {['Cash', 'Check', 'Credit Card', 'Bank Transfer', 'Venmo', 'PayPal'].map(method => (
                              <button
                                key={method}
                                onClick={() => markInvoicePaid(invoice.id, method)}
                                className={`px-3 py-1 rounded text-sm ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        )}

                        {invoice.status === 'paid' && invoice.paymentMethod && (
                          <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Paid via: {invoice.paymentMethod}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Invoice Summary */}
              {invoices.length > 0 && (
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg mt-6`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.windowCleaning.summary', 'Summary')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.windowCleaning.totalInvoices', 'Total Invoices')}</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoices.length}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.windowCleaning.pending', 'Pending')}</div>
                      <div className="text-xl font-bold text-yellow-500">
                        ${invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.windowCleaning.paid', 'Paid')}</div>
                      <div className="text-xl font-bold text-green-500">
                        ${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.windowCleaning.overdue', 'Overdue')}</div>
                      <div className="text-xl font-bold text-red-500">
                        ${invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WindowCleaningTool;
