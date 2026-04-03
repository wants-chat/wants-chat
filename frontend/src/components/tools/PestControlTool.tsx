'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Bug,
  User,
  Home,
  Calendar,
  Clock,
  MapPin,
  FlaskConical,
  Shield,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Target,
  RefreshCw,
  Package,
  Wrench,
  Bell,
  TrendingUp,
  BarChart3,
  Loader2,
} from 'lucide-react';

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
  propertyType: 'residential' | 'commercial' | 'industrial';
  propertySize: number;
  notes: string;
  createdAt: string;
}

interface PestType {
  id: string;
  name: string;
  category: 'insects' | 'rodents' | 'wildlife' | 'birds' | 'other';
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface TreatmentPlan {
  id: string;
  name: string;
  pestTypes: string[];
  products: string[];
  estimatedDuration: number;
  price: number;
  description: string;
}

interface Product {
  id: string;
  name: string;
  type: 'pesticide' | 'bait' | 'trap' | 'repellent' | 'equipment';
  activeIngredient: string;
  epaRegistration: string;
  safetyDataSheet: string;
  applicationRate: string;
  precautions: string[];
  ppe: string[];
  reentryInterval: number;
  quantity: number;
  unit: string;
  cost: number;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  certifications: string[];
  specialties: string[];
  available: boolean;
}

interface ServiceVisit {
  id: string;
  customerId: string;
  technicianId: string;
  treatmentPlanId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
  treatmentAreas: string[];
  productsUsed: { productId: string; quantity: number }[];
  notes: string;
  completedAt?: string;
  followUpDate?: string;
}

interface BaitStation {
  id: string;
  customerId: string;
  location: string;
  stationType: 'rodent' | 'ant' | 'termite' | 'general';
  installDate: string;
  lastChecked: string;
  status: 'active' | 'inactive' | 'needs-replacement' | 'tampered';
  activityLevel: 'none' | 'low' | 'medium' | 'high';
  notes: string;
}

interface InspectionReport {
  id: string;
  customerId: string;
  technicianId: string;
  date: string;
  pestTypesFound: string[];
  severityLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  infestationAreas: string[];
  recommendations: string[];
  photos: string[];
  requiresTreatment: boolean;
  estimatedCost: number;
  notes: string;
}

interface ServiceAgreement {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  serviceFrequency: 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
  includedServices: string[];
  price: number;
  paymentTerms: 'monthly' | 'quarterly' | 'annual' | 'per-visit';
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  warrantyIncluded: boolean;
  warrantyDetails: string;
}

interface Warranty {
  id: string;
  customerId: string;
  serviceVisitId: string;
  startDate: string;
  endDate: string;
  coverageType: 'full' | 'partial' | 'retreatment-only';
  pestsCovered: string[];
  terms: string;
  status: 'active' | 'expired' | 'claimed' | 'voided';
}

interface Invoice {
  id: string;
  customerId: string;
  serviceVisitId?: string;
  agreementId?: string;
  date: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
}

// Wrapper type for all pest control data (for backend sync)
interface PestControlData {
  id: string;
  customers: Customer[];
  treatmentPlans: TreatmentPlan[];
  products: Product[];
  serviceVisits: ServiceVisit[];
  baitStations: BaitStation[];
  inspectionReports: InspectionReport[];
  agreements: ServiceAgreement[];
  warranties: Warranty[];
  invoices: Invoice[];
}

// Column configuration for backend sync (summary view)
const SYNC_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customersCount', header: 'Customers', type: 'number' },
  { key: 'serviceVisitsCount', header: 'Service Visits', type: 'number' },
  { key: 'invoicesCount', header: 'Invoices', type: 'number' },
];

// Default data
const defaultPestTypes: PestType[] = [
  { id: '1', name: 'Ants', category: 'insects', severityLevel: 'low', description: 'Common household ants including carpenter, fire, and pharaoh ants' },
  { id: '2', name: 'Termites', category: 'insects', severityLevel: 'critical', description: 'Wood-destroying insects that can cause significant structural damage' },
  { id: '3', name: 'Cockroaches', category: 'insects', severityLevel: 'high', description: 'German, American, and Oriental cockroaches' },
  { id: '4', name: 'Bed Bugs', category: 'insects', severityLevel: 'high', description: 'Blood-feeding insects that infest sleeping areas' },
  { id: '5', name: 'Mice', category: 'rodents', severityLevel: 'medium', description: 'House mice that can contaminate food and spread disease' },
  { id: '6', name: 'Rats', category: 'rodents', severityLevel: 'high', description: 'Norway and roof rats that cause damage and health risks' },
  { id: '7', name: 'Wasps/Hornets', category: 'insects', severityLevel: 'medium', description: 'Stinging insects that build nests on structures' },
  { id: '8', name: 'Spiders', category: 'insects', severityLevel: 'low', description: 'Common house spiders and venomous species' },
  { id: '9', name: 'Mosquitoes', category: 'insects', severityLevel: 'medium', description: 'Disease-carrying flying insects' },
  { id: '10', name: 'Raccoons', category: 'wildlife', severityLevel: 'medium', description: 'Wildlife that can damage property and carry rabies' },
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Termidor SC',
    type: 'pesticide',
    activeIngredient: 'Fipronil 9.1%',
    epaRegistration: '7969-210',
    safetyDataSheet: 'https://example.com/sds/termidor',
    applicationRate: '0.8 fl oz per gallon',
    precautions: ['Keep away from water sources', 'Do not apply when rain expected', 'Avoid contact with skin'],
    ppe: ['Chemical-resistant gloves', 'Long sleeves', 'Eye protection', 'Respirator'],
    reentryInterval: 24,
    quantity: 50,
    unit: 'gallons',
    cost: 85.00,
  },
  {
    id: '2',
    name: 'Contrac Blox',
    type: 'bait',
    activeIngredient: 'Bromadiolone 0.005%',
    epaRegistration: '12455-79',
    safetyDataSheet: 'https://example.com/sds/contrac',
    applicationRate: '1-16 blocks per placement',
    precautions: ['Use in tamper-resistant stations', 'Keep away from children and pets'],
    ppe: ['Gloves'],
    reentryInterval: 0,
    quantity: 200,
    unit: 'blocks',
    cost: 0.75,
  },
  {
    id: '3',
    name: 'Advion Cockroach Gel',
    type: 'bait',
    activeIngredient: 'Indoxacarb 0.6%',
    epaRegistration: '352-652',
    safetyDataSheet: 'https://example.com/sds/advion',
    applicationRate: '0.5g per spot',
    precautions: ['Apply in cracks and crevices only', 'Do not contaminate food surfaces'],
    ppe: ['Gloves'],
    reentryInterval: 0,
    quantity: 100,
    unit: 'tubes',
    cost: 25.00,
  },
];

const defaultTechnicians: Technician[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '555-0101',
    email: 'john.smith@pestcontrol.com',
    certifications: ['State Licensed', 'Termite Certified', 'Wildlife Control'],
    specialties: ['Termite Treatment', 'Rodent Control'],
    available: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '555-0102',
    email: 'sarah.johnson@pestcontrol.com',
    certifications: ['State Licensed', 'Bed Bug Specialist'],
    specialties: ['Bed Bug Treatment', 'Insect Control'],
    available: true,
  },
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
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'propertySize', header: 'Property Size (sq ft)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const SERVICE_VISIT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'treatmentAreas', header: 'Treatment Areas', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'completedAt', header: 'Completed At', type: 'date' },
];

const PRODUCT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'activeIngredient', header: 'Active Ingredient', type: 'string' },
  { key: 'epaRegistration', header: 'EPA Registration', type: 'string' },
  { key: 'applicationRate', header: 'Application Rate', type: 'string' },
  { key: 'reentryInterval', header: 'Re-entry Interval (hrs)', type: 'number' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
];

const INSPECTION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'pestTypesFound', header: 'Pests Found', type: 'string' },
  { key: 'severityLevel', header: 'Severity', type: 'string' },
  { key: 'infestationAreas', header: 'Infestation Areas', type: 'string' },
  { key: 'requiresTreatment', header: 'Requires Treatment', type: 'boolean' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const AGREEMENT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'serviceFrequency', header: 'Frequency', type: 'string' },
  { key: 'includedServices', header: 'Included Services', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'paymentTerms', header: 'Payment Terms', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'warrantyIncluded', header: 'Warranty Included', type: 'boolean' },
];

const INVOICE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Invoice ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paymentDate', header: 'Payment Date', type: 'date' },
];

const BAIT_STATION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'stationType', header: 'Station Type', type: 'string' },
  { key: 'installDate', header: 'Install Date', type: 'date' },
  { key: 'lastChecked', header: 'Last Checked', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'activityLevel', header: 'Activity Level', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface PestControlToolProps {
  uiConfig?: UIConfig;
}

// Default empty pest control data for sync
const defaultPestControlData: PestControlData[] = [];

export const PestControlTool = ({
  uiConfig }: PestControlToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use useToolData for backend sync
  const {
    data: syncData,
    setData: setSyncData,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importCSV: hookImportCSV,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PestControlData>('pest-control', defaultPestControlData, SYNC_COLUMNS);

  // Extract data from sync wrapper or use defaults
  const pestControlRecord = syncData[0] || {
    id: 'pest-control-data',
    customers: [],
    treatmentPlans: [],
    products: defaultProducts,
    serviceVisits: [],
    baitStations: [],
    inspectionReports: [],
    agreements: [],
    warranties: [],
    invoices: [],
  };

  const customers = pestControlRecord.customers;
  const treatmentPlans = pestControlRecord.treatmentPlans;
  const products = pestControlRecord.products;
  const serviceVisits = pestControlRecord.serviceVisits;
  const baitStations = pestControlRecord.baitStations;
  const inspectionReports = pestControlRecord.inspectionReports;
  const agreements = pestControlRecord.agreements;
  const warranties = pestControlRecord.warranties;
  const invoices = pestControlRecord.invoices;

  // Static data
  const [pestTypes] = useState<PestType[]>(defaultPestTypes);
  const [technicians] = useState<Technician[]>(defaultTechnicians);

  // Helper to update the sync data
  const updateSyncData = useCallback((updates: Partial<PestControlData>) => {
    const currentRecord = syncData[0] || {
      id: 'pest-control-data',
      customers: [],
      treatmentPlans: [],
      products: defaultProducts,
      serviceVisits: [],
      baitStations: [],
      inspectionReports: [],
      agreements: [],
      warranties: [],
      invoices: [],
    };
    setSyncData([{ ...currentRecord, ...updates }]);
  }, [syncData, setSyncData]);

  // Setter wrappers
  const setCustomers = useCallback((customersOrFn: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const newCustomers = typeof customersOrFn === 'function' ? customersOrFn(customers) : customersOrFn;
    updateSyncData({ customers: newCustomers });
  }, [customers, updateSyncData]);

  const setTreatmentPlans = useCallback((plansOrFn: TreatmentPlan[] | ((prev: TreatmentPlan[]) => TreatmentPlan[])) => {
    const newPlans = typeof plansOrFn === 'function' ? plansOrFn(treatmentPlans) : plansOrFn;
    updateSyncData({ treatmentPlans: newPlans });
  }, [treatmentPlans, updateSyncData]);

  const setProducts = useCallback((productsOrFn: Product[] | ((prev: Product[]) => Product[])) => {
    const newProducts = typeof productsOrFn === 'function' ? productsOrFn(products) : productsOrFn;
    updateSyncData({ products: newProducts });
  }, [products, updateSyncData]);

  const setServiceVisits = useCallback((visitsOrFn: ServiceVisit[] | ((prev: ServiceVisit[]) => ServiceVisit[])) => {
    const newVisits = typeof visitsOrFn === 'function' ? visitsOrFn(serviceVisits) : visitsOrFn;
    updateSyncData({ serviceVisits: newVisits });
  }, [serviceVisits, updateSyncData]);

  const setBaitStations = useCallback((stationsOrFn: BaitStation[] | ((prev: BaitStation[]) => BaitStation[])) => {
    const newStations = typeof stationsOrFn === 'function' ? stationsOrFn(baitStations) : stationsOrFn;
    updateSyncData({ baitStations: newStations });
  }, [baitStations, updateSyncData]);

  const setInspectionReports = useCallback((reportsOrFn: InspectionReport[] | ((prev: InspectionReport[]) => InspectionReport[])) => {
    const newReports = typeof reportsOrFn === 'function' ? reportsOrFn(inspectionReports) : reportsOrFn;
    updateSyncData({ inspectionReports: newReports });
  }, [inspectionReports, updateSyncData]);

  const setAgreements = useCallback((agreementsOrFn: ServiceAgreement[] | ((prev: ServiceAgreement[]) => ServiceAgreement[])) => {
    const newAgreements = typeof agreementsOrFn === 'function' ? agreementsOrFn(agreements) : agreementsOrFn;
    updateSyncData({ agreements: newAgreements });
  }, [agreements, updateSyncData]);

  const setWarranties = useCallback((warrantiesOrFn: Warranty[] | ((prev: Warranty[]) => Warranty[])) => {
    const newWarranties = typeof warrantiesOrFn === 'function' ? warrantiesOrFn(warranties) : warrantiesOrFn;
    updateSyncData({ warranties: newWarranties });
  }, [warranties, updateSyncData]);

  const setInvoices = useCallback((invoicesOrFn: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    const newInvoices = typeof invoicesOrFn === 'function' ? invoicesOrFn(invoices) : invoicesOrFn;
    updateSyncData({ invoices: newInvoices });
  }, [invoices, updateSyncData]);

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'scheduling' | 'products' | 'inspections' | 'agreements' | 'billing' | 'bait-stations'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showAddInspection, setShowAddInspection] = useState(false);
  const [showAddAgreement, setShowAddAgreement] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddBaitStation, setShowAddBaitStation] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Form states
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    propertyType: 'residential',
    propertySize: 0,
  });
  const [visitForm, setVisitForm] = useState<Partial<ServiceVisit>>({
    status: 'scheduled',
    frequency: 'one-time',
    treatmentAreas: [],
    productsUsed: [],
  });
  const [inspectionForm, setInspectionForm] = useState<Partial<InspectionReport>>({
    pestTypesFound: [],
    infestationAreas: [],
    recommendations: [],
    photos: [],
    requiresTreatment: false,
  });
  const [agreementForm, setAgreementForm] = useState<Partial<ServiceAgreement>>({
    serviceFrequency: 'monthly',
    includedServices: [],
    status: 'pending',
    warrantyIncluded: false,
  });
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({
    items: [],
    status: 'draft',
  });
  const [baitStationForm, setBaitStationForm] = useState<Partial<BaitStation>>({
    stationType: 'rodent',
    status: 'active',
    activityLevel: 'none',
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.customerName) {
        hasChanges = true;
      }
      if (params.phone) {
        hasChanges = true;
      }
      if (params.address) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const scheduledToday = serviceVisits.filter(v => v.scheduledDate === today && v.status === 'scheduled').length;
    const completedThisMonth = serviceVisits.filter(v => {
      const visitDate = new Date(v.scheduledDate);
      const now = new Date();
      return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear() && v.status === 'completed';
    }).length;
    const activeAgreements = agreements.filter(a => a.status === 'active').length;
    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    const baitStationsNeedingAttention = baitStations.filter(b => b.status === 'needs-replacement' || b.activityLevel === 'high').length;

    return {
      scheduledToday,
      completedThisMonth,
      activeAgreements,
      pendingAmount: pendingInvoices.reduce((sum, i) => sum + i.total, 0),
      totalRevenue,
      overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.total, 0),
      baitStationsNeedingAttention,
      totalCustomers: customers.length,
    };
  }, [serviceVisits, agreements, invoices, baitStations, customers]);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  const getTechnicianName = (technicianId: string) => {
    return technicians.find(t => t.id === technicianId)?.name || 'Unassigned';
  };

  // Export helper functions
  const getExportData = () => {
    switch (activeTab) {
      case 'customers':
        return { data: customers, columns: CUSTOMER_COLUMNS, filename: 'pest-control-customers' };
      case 'scheduling':
        const schedulingData = serviceVisits.map(v => ({
          ...v,
          customerName: getCustomerName(v.customerId),
          technicianName: getTechnicianName(v.technicianId),
          treatmentAreas: v.treatmentAreas.join(', '),
        }));
        return { data: schedulingData, columns: SERVICE_VISIT_COLUMNS, filename: 'pest-control-scheduling' };
      case 'products':
        return { data: products, columns: PRODUCT_COLUMNS, filename: 'pest-control-products' };
      case 'inspections':
        const inspectionData = inspectionReports.map(r => ({
          ...r,
          customerName: getCustomerName(r.customerId),
          technicianName: getTechnicianName(r.technicianId),
          pestTypesFound: r.pestTypesFound.join(', '),
          infestationAreas: r.infestationAreas.join(', '),
        }));
        return { data: inspectionData, columns: INSPECTION_COLUMNS, filename: 'pest-control-inspections' };
      case 'agreements':
        const agreementData = agreements.map(a => ({
          ...a,
          customerName: getCustomerName(a.customerId),
          includedServices: a.includedServices.join(', '),
        }));
        return { data: agreementData, columns: AGREEMENT_COLUMNS, filename: 'pest-control-agreements' };
      case 'billing':
        const billingData = invoices.map(i => ({
          ...i,
          customerName: getCustomerName(i.customerId),
        }));
        return { data: billingData, columns: INVOICE_COLUMNS, filename: 'pest-control-invoices' };
      case 'bait-stations':
        const baitData = baitStations.map(b => ({
          ...b,
          customerName: getCustomerName(b.customerId),
        }));
        return { data: baitData, columns: BAIT_STATION_COLUMNS, filename: 'pest-control-bait-stations' };
      default:
        // Dashboard - export summary of all data
        return { data: customers, columns: CUSTOMER_COLUMNS, filename: 'pest-control-customers' };
    }
  };

  const handleExportCSV = () => {
    const { data, columns, filename } = getExportData();
    exportToCSV(data as Record<string, unknown>[], columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getExportData();
    exportToExcel(data as Record<string, unknown>[], columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getExportData();
    exportToJSON(data as Record<string, unknown>[], { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getExportData();
    await exportToPDF(data as Record<string, unknown>[], columns, { filename, title: `Pest Control - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}` });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const { data, columns } = getExportData();
    return await copyUtil(data as Record<string, unknown>[], columns);
  };

  const handlePrint = () => {
    const { data, columns } = getExportData();
    printData(data as Record<string, unknown>[], columns, { title: `Pest Control - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}` });
  };

  // CRUD Operations
  const addCustomer = () => {
    if (!customerForm.name || !customerForm.address) return;
    const newCustomer: Customer = {
      id: generateId(),
      name: customerForm.name || '',
      email: customerForm.email || '',
      phone: customerForm.phone || '',
      address: customerForm.address || '',
      city: customerForm.city || '',
      state: customerForm.state || '',
      zip: customerForm.zip || '',
      propertyType: customerForm.propertyType || 'residential',
      propertySize: customerForm.propertySize || 0,
      notes: customerForm.notes || '',
      createdAt: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
    setCustomerForm({ propertyType: 'residential', propertySize: 0 });
    setShowAddCustomer(false);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const addServiceVisit = () => {
    if (!visitForm.customerId || !visitForm.scheduledDate) return;
    const newVisit: ServiceVisit = {
      id: generateId(),
      customerId: visitForm.customerId || '',
      technicianId: visitForm.technicianId || '',
      treatmentPlanId: visitForm.treatmentPlanId || '',
      scheduledDate: visitForm.scheduledDate || '',
      scheduledTime: visitForm.scheduledTime || '',
      status: visitForm.status || 'scheduled',
      frequency: visitForm.frequency || 'one-time',
      treatmentAreas: visitForm.treatmentAreas || [],
      productsUsed: visitForm.productsUsed || [],
      notes: visitForm.notes || '',
      followUpDate: visitForm.followUpDate,
    };
    setServiceVisits([...serviceVisits, newVisit]);
    setVisitForm({ status: 'scheduled', frequency: 'one-time', treatmentAreas: [], productsUsed: [] });
    setShowAddVisit(false);
  };

  const updateVisitStatus = (id: string, status: ServiceVisit['status']) => {
    setServiceVisits(serviceVisits.map(v =>
      v.id === id ? { ...v, status, completedAt: status === 'completed' ? new Date().toISOString() : v.completedAt } : v
    ));
  };

  const addInspectionReport = () => {
    if (!inspectionForm.customerId || !inspectionForm.date) return;
    const newReport: InspectionReport = {
      id: generateId(),
      customerId: inspectionForm.customerId || '',
      technicianId: inspectionForm.technicianId || '',
      date: inspectionForm.date || '',
      pestTypesFound: inspectionForm.pestTypesFound || [],
      severityLevel: inspectionForm.severityLevel || 'none',
      infestationAreas: inspectionForm.infestationAreas || [],
      recommendations: inspectionForm.recommendations || [],
      photos: inspectionForm.photos || [],
      requiresTreatment: inspectionForm.requiresTreatment || false,
      estimatedCost: inspectionForm.estimatedCost || 0,
      notes: inspectionForm.notes || '',
    };
    setInspectionReports([...inspectionReports, newReport]);
    setInspectionForm({ pestTypesFound: [], infestationAreas: [], recommendations: [], photos: [], requiresTreatment: false });
    setShowAddInspection(false);
  };

  const addAgreement = () => {
    if (!agreementForm.customerId || !agreementForm.startDate) return;
    const newAgreement: ServiceAgreement = {
      id: generateId(),
      customerId: agreementForm.customerId || '',
      startDate: agreementForm.startDate || '',
      endDate: agreementForm.endDate || '',
      serviceFrequency: agreementForm.serviceFrequency || 'monthly',
      includedServices: agreementForm.includedServices || [],
      price: agreementForm.price || 0,
      paymentTerms: agreementForm.paymentTerms || 'monthly',
      status: agreementForm.status || 'pending',
      warrantyIncluded: agreementForm.warrantyIncluded || false,
      warrantyDetails: agreementForm.warrantyDetails || '',
    };
    setAgreements([...agreements, newAgreement]);

    if (agreementForm.warrantyIncluded) {
      const newWarranty: Warranty = {
        id: generateId(),
        customerId: newAgreement.customerId,
        serviceVisitId: '',
        startDate: newAgreement.startDate,
        endDate: newAgreement.endDate,
        coverageType: 'full',
        pestsCovered: agreementForm.includedServices || [],
        terms: agreementForm.warrantyDetails || '',
        status: 'active',
      };
      setWarranties([...warranties, newWarranty]);
    }

    setAgreementForm({ serviceFrequency: 'monthly', includedServices: [], status: 'pending', warrantyIncluded: false });
    setShowAddAgreement(false);
  };

  const addInvoice = () => {
    if (!invoiceForm.customerId || !invoiceForm.date) return;
    const items = invoiceForm.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.08; // 8% tax
    const newInvoice: Invoice = {
      id: generateId(),
      customerId: invoiceForm.customerId || '',
      serviceVisitId: invoiceForm.serviceVisitId,
      agreementId: invoiceForm.agreementId,
      date: invoiceForm.date || '',
      dueDate: invoiceForm.dueDate || '',
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      status: invoiceForm.status || 'draft',
    };
    setInvoices([...invoices, newInvoice]);
    setInvoiceForm({ items: [], status: 'draft' });
    setShowAddInvoice(false);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(invoices.map(i =>
      i.id === id ? { ...i, status, paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : i.paymentDate } : i
    ));
  };

  const addBaitStation = () => {
    if (!baitStationForm.customerId || !baitStationForm.location) return;
    const newStation: BaitStation = {
      id: generateId(),
      customerId: baitStationForm.customerId || '',
      location: baitStationForm.location || '',
      stationType: baitStationForm.stationType || 'rodent',
      installDate: new Date().toISOString().split('T')[0],
      lastChecked: new Date().toISOString().split('T')[0],
      status: baitStationForm.status || 'active',
      activityLevel: baitStationForm.activityLevel || 'none',
      notes: baitStationForm.notes || '',
    };
    setBaitStations([...baitStations, newStation]);
    setBaitStationForm({ stationType: 'rodent', status: 'active', activityLevel: 'none' });
    setShowAddBaitStation(false);
  };

  const updateBaitStation = (id: string, updates: Partial<BaitStation>) => {
    setBaitStations(baitStations.map(b =>
      b.id === id ? { ...b, ...updates, lastChecked: new Date().toISOString().split('T')[0] } : b
    ));
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  }, [customers, searchTerm]);

  // Styling helpers
  const cardClass = `${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm`;
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;
  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2';
  const buttonSecondary = `px-4 py-2 rounded-lg font-medium transition-colors ${
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'scheduled':
      case 'sent':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
      case 'overdue':
      case 'expired':
      case 'voided':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'needs-replacement':
      case 'tampered':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Render tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList },
    { id: 'agreements', label: 'Agreements', icon: FileText },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'bait-stations', label: 'Bait Stations', icon: Target },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.pestControlServiceManager', 'Pest Control Service Manager')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.pestControl.manageCustomersTreatmentsSchedulingAnd', 'Manage customers, treatments, scheduling, and billing')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="pest-control" toolName="Pest Control" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme === 'dark' ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
              onImportCSV={async (file) => { await hookImportCSV(file); }}
              onImportJSON={async (file) => { await hookImportJSON(file); }}
              theme={theme}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={cardClass + ' p-4'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.scheduledToday', 'Scheduled Today')}</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {dashboardStats.scheduledToday}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-[#0D9488]" />
                </div>
              </div>
              <div className={cardClass + ' p-4'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.completedThisMonth', 'Completed This Month')}</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {dashboardStats.completedThisMonth}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className={cardClass + ' p-4'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.activeAgreements', 'Active Agreements')}</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {dashboardStats.activeAgreements}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className={cardClass + ' p-4'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.totalRevenue', 'Total Revenue')}</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${dashboardStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#0D9488]" />
                </div>
              </div>
            </div>

            {/* Alerts */}
            {(dashboardStats.overdueAmount > 0 || dashboardStats.baitStationsNeedingAttention > 0) && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  {t('tools.pestControl.alerts', 'Alerts')}
                </h3>
                <div className="space-y-2">
                  {dashboardStats.overdueAmount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                        ${dashboardStats.overdueAmount.toLocaleString()} in overdue invoices
                      </span>
                    </div>
                  )}
                  {dashboardStats.baitStationsNeedingAttention > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                        {dashboardStats.baitStationsNeedingAttention} bait stations need attention
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Today's Schedule */}
            <div className={cardClass + ' p-4'}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.todaySSchedule', 'Today\'s Schedule')}
              </h3>
              {serviceVisits.filter(v => v.scheduledDate === new Date().toISOString().split('T')[0]).length === 0 ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.noVisitsScheduledForToday', 'No visits scheduled for today')}</p>
              ) : (
                <div className="space-y-2">
                  {serviceVisits
                    .filter(v => v.scheduledDate === new Date().toISOString().split('T')[0])
                    .map(visit => (
                      <div key={visit.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {getCustomerName(visit.customerId)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {visit.scheduledTime} - {getTechnicianName(visit.technicianId)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                            {visit.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Inspections */}
              <div className={cardClass + ' p-4'}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.recentInspections', 'Recent Inspections')}
                </h3>
                {inspectionReports.length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.noInspectionsRecorded', 'No inspections recorded')}</p>
                ) : (
                  <div className="space-y-2">
                    {inspectionReports.slice(-5).reverse().map(report => (
                      <div key={report.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {getCustomerName(report.customerId)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(report.severityLevel)}`}>
                            {report.severityLevel}
                          </span>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {report.date}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Invoices */}
              <div className={cardClass + ' p-4'}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.pendingInvoices', 'Pending Invoices')}
                </h3>
                {invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.noPendingInvoices', 'No pending invoices')}</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(-5).map(invoice => (
                      <div key={invoice.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {getCustomerName(invoice.customerId)}
                          </span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${invoice.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Due: {invoice.dueDate}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.pestControl.searchCustomers', 'Search customers...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <button onClick={() => setShowAddCustomer(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> Add Customer
              </button>
            </div>

            {/* Add Customer Form */}
            {showAddCustomer && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.addNewCustomer', 'Add New Customer')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.name', 'Name *')}</label>
                    <input
                      type="text"
                      value={customerForm.name || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.customerName', 'Customer name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.email', 'Email')}</label>
                    <input
                      type="email"
                      value={customerForm.email || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.emailAddress', 'Email address')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={customerForm.phone || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.phoneNumber', 'Phone number')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.pestControl.address', 'Address *')}</label>
                    <input
                      type="text"
                      value={customerForm.address || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.streetAddress', 'Street address')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.city', 'City')}</label>
                    <input
                      type="text"
                      value={customerForm.city || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.city2', 'City')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.state', 'State')}</label>
                    <input
                      type="text"
                      value={customerForm.state || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.state2', 'State')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.zip', 'ZIP')}</label>
                    <input
                      type="text"
                      value={customerForm.zip || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, zip: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.zipCode', 'ZIP code')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.propertyType', 'Property Type')}</label>
                    <select
                      value={customerForm.propertyType || 'residential'}
                      onChange={(e) => setCustomerForm({ ...customerForm, propertyType: e.target.value as Customer['propertyType'] })}
                      className={inputClass}
                    >
                      <option value="residential">{t('tools.pestControl.residential', 'Residential')}</option>
                      <option value="commercial">{t('tools.pestControl.commercial', 'Commercial')}</option>
                      <option value="industrial">{t('tools.pestControl.industrial', 'Industrial')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.propertySizeSqFt', 'Property Size (sq ft)')}</label>
                    <input
                      type="number"
                      value={customerForm.propertySize || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, propertySize: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.squareFootage', 'Square footage')}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.notes', 'Notes')}</label>
                    <textarea
                      value={customerForm.notes || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder={t('tools.pestControl.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addCustomer} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Save Customer
                  </button>
                  <button onClick={() => setShowAddCustomer(false)} className={buttonSecondary}>
                    {t('tools.pestControl.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Customer List */}
            <div className="space-y-3">
              {filteredCustomers.length === 0 ? (
                <div className={`${cardClass} p-8 text-center`}>
                  <Users className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {searchTerm ? t('tools.pestControl.noCustomersMatchYourSearch', 'No customers match your search') : t('tools.pestControl.noCustomersAddedYet', 'No customers added yet')}
                  </p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className={cardClass}>
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleSection(`customer-${customer.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {customer.propertyType === 'residential' ? (
                              <Home className="w-5 h-5 text-[#0D9488]" />
                            ) : (
                              <Wrench className="w-5 h-5 text-[#0D9488]" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.name}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer.address}, {customer.city}, {customer.state} {customer.zip}
                            </p>
                            <div className="flex gap-4 mt-1">
                              {customer.phone && (
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {customer.phone}
                                </span>
                              )}
                              {customer.email && (
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {customer.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.propertyType === 'residential' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            customer.propertyType === 'commercial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                          }`}>
                            {customer.propertyType}
                          </span>
                          {expandedSections[`customer-${customer.id}`] ? (
                            <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedSections[`customer-${customer.id}`] && (
                      <div className={`px-4 pb-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.propertySize', 'Property Size')}</span>
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{customer.propertySize.toLocaleString()} sq ft</p>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.serviceVisits', 'Service Visits')}</span>
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                {serviceVisits.filter(v => v.customerId === customer.id).length}
                              </p>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.activeAgreements2', 'Active Agreements')}</span>
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                {agreements.filter(a => a.customerId === customer.id && a.status === 'active').length}
                              </p>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.baitStations', 'Bait Stations')}</span>
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                {baitStations.filter(b => b.customerId === customer.id).length}
                              </p>
                            </div>
                          </div>
                          {customer.notes && (
                            <div>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.notes2', 'Notes')}</span>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{customer.notes}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedCustomer(customer); setActiveTab('scheduling'); }}
                              className={`${buttonSecondary} text-sm py-1`}
                            >
                              <Calendar className="w-4 h-4" /> Schedule Visit
                            </button>
                            <button
                              onClick={() => deleteCustomer(customer.id)}
                              className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Scheduling Tab */}
        {activeTab === 'scheduling' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.serviceVisits2', 'Service Visits')}
              </h2>
              <button onClick={() => setShowAddVisit(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> Schedule Visit
              </button>
            </div>

            {/* Add Visit Form */}
            {showAddVisit && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.scheduleNewVisit', 'Schedule New Visit')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.customer', 'Customer *')}</label>
                    <select
                      value={visitForm.customerId || selectedCustomer?.id || ''}
                      onChange={(e) => setVisitForm({ ...visitForm, customerId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.selectCustomer', 'Select customer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.technician', 'Technician')}</label>
                    <select
                      value={visitForm.technicianId || ''}
                      onChange={(e) => setVisitForm({ ...visitForm, technicianId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.assignTechnician', 'Assign technician')}</option>
                      {technicians.filter(t => t.available).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.frequency', 'Frequency')}</label>
                    <select
                      value={visitForm.frequency || 'one-time'}
                      onChange={(e) => setVisitForm({ ...visitForm, frequency: e.target.value as ServiceVisit['frequency'] })}
                      className={inputClass}
                    >
                      <option value="one-time">{t('tools.pestControl.oneTime', 'One-time')}</option>
                      <option value="monthly">{t('tools.pestControl.monthly', 'Monthly')}</option>
                      <option value="quarterly">{t('tools.pestControl.quarterly', 'Quarterly')}</option>
                      <option value="bi-annual">{t('tools.pestControl.biAnnual', 'Bi-Annual')}</option>
                      <option value="annual">{t('tools.pestControl.annual', 'Annual')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.date', 'Date *')}</label>
                    <input
                      type="date"
                      value={visitForm.scheduledDate || ''}
                      onChange={(e) => setVisitForm({ ...visitForm, scheduledDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.time', 'Time')}</label>
                    <input
                      type="time"
                      value={visitForm.scheduledTime || ''}
                      onChange={(e) => setVisitForm({ ...visitForm, scheduledTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.followUpDate', 'Follow-up Date')}</label>
                    <input
                      type="date"
                      value={visitForm.followUpDate || ''}
                      onChange={(e) => setVisitForm({ ...visitForm, followUpDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.treatmentAreas', 'Treatment Areas')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.pestControl.eGKitchenBasementExterior', 'e.g., Kitchen, Basement, Exterior (comma-separated)')}
                      value={(visitForm.treatmentAreas || []).join(', ')}
                      onChange={(e) => setVisitForm({ ...visitForm, treatmentAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.notes3', 'Notes')}</label>
                    <textarea
                      value={visitForm.notes || ''}
                      onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder={t('tools.pestControl.serviceNotes', 'Service notes...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addServiceVisit} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Schedule Visit
                  </button>
                  <button onClick={() => { setShowAddVisit(false); setSelectedCustomer(null); }} className={buttonSecondary}>
                    {t('tools.pestControl.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Visit List */}
            <div className="space-y-3">
              {serviceVisits.length === 0 ? (
                <div className={`${cardClass} p-8 text-center`}>
                  <Calendar className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.noServiceVisitsScheduled', 'No service visits scheduled')}</p>
                </div>
              ) : (
                serviceVisits.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).map(visit => (
                  <div key={visit.id} className={cardClass + ' p-4'}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getCustomerName(visit.customerId)}
                        </h4>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {visit.scheduledDate} at {visit.scheduledTime || 'TBD'}
                          </p>
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {getTechnicianName(visit.technicianId)}
                          </p>
                          {visit.treatmentAreas.length > 0 && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {visit.treatmentAreas.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                          {visit.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {visit.frequency}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {visit.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updateVisitStatus(visit.id, 'in-progress')}
                            className={`${buttonSecondary} text-sm py-1`}
                          >
                            {t('tools.pestControl.start', 'Start')}
                          </button>
                          <button
                            onClick={() => updateVisitStatus(visit.id, 'cancelled')}
                            className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                          >
                            {t('tools.pestControl.cancel3', 'Cancel')}
                          </button>
                        </>
                      )}
                      {visit.status === 'in-progress' && (
                        <button
                          onClick={() => updateVisitStatus(visit.id, 'completed')}
                          className={buttonPrimary + ' text-sm py-1'}
                        >
                          <CheckCircle className="w-4 h-4" /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pestControl.productsChemicalsInventory', 'Products & Chemicals Inventory')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className={cardClass + ' p-4'}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-[#0D9488]" />
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </h4>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.type === 'pesticide' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      product.type === 'bait' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      product.type === 'trap' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {product.type}
                    </span>
                  </div>

                  <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p><strong>{t('tools.pestControl.activeIngredient', 'Active Ingredient:')}</strong> {product.activeIngredient}</p>
                    <p><strong>{t('tools.pestControl.epaReg', 'EPA Reg:')}</strong> {product.epaRegistration}</p>
                    <p><strong>{t('tools.pestControl.applicationRate', 'Application Rate:')}</strong> {product.applicationRate}</p>
                    <p><strong>{t('tools.pestControl.reEntryInterval', 'Re-entry Interval:')}</strong> {product.reentryInterval} hours</p>
                    <p><strong>{t('tools.pestControl.inventory', 'Inventory:')}</strong> {product.quantity} {product.unit} (${product.cost.toFixed(2)}/unit)</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.pestControl.requiredPpe', 'Required PPE')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.ppe.map((item, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {product.precautions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.pestControl.precautions', 'Precautions')}
                        </span>
                      </div>
                      <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {product.precautions.map((p, i) => (
                          <li key={i}>- {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspections Tab */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.inspectionReports', 'Inspection Reports')}
              </h2>
              <button onClick={() => setShowAddInspection(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> New Inspection
              </button>
            </div>

            {/* Add Inspection Form */}
            {showAddInspection && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.newInspectionReport', 'New Inspection Report')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.customer2', 'Customer *')}</label>
                    <select
                      value={inspectionForm.customerId || ''}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, customerId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.selectCustomer2', 'Select customer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.technician2', 'Technician')}</label>
                    <select
                      value={inspectionForm.technicianId || ''}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, technicianId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.selectTechnician', 'Select technician')}</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.date2', 'Date *')}</label>
                    <input
                      type="date"
                      value={inspectionForm.date || ''}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.severityLevel', 'Severity Level')}</label>
                    <select
                      value={inspectionForm.severityLevel || 'none'}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, severityLevel: e.target.value as InspectionReport['severityLevel'] })}
                      className={inputClass}
                    >
                      <option value="none">None</option>
                      <option value="low">{t('tools.pestControl.low', 'Low')}</option>
                      <option value="medium">{t('tools.pestControl.medium', 'Medium')}</option>
                      <option value="high">{t('tools.pestControl.high', 'High')}</option>
                      <option value="critical">{t('tools.pestControl.critical', 'Critical')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.estimatedCost', 'Estimated Cost')}</label>
                    <input
                      type="number"
                      value={inspectionForm.estimatedCost || ''}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresTreatment"
                      checked={inspectionForm.requiresTreatment || false}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, requiresTreatment: e.target.checked })}
                      className="w-4 h-4 text-[#0D9488] rounded"
                    />
                    <label htmlFor="requiresTreatment" className={labelClass + ' mb-0'}>
                      {t('tools.pestControl.requiresTreatment', 'Requires Treatment')}
                    </label>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.pestsFound', 'Pests Found')}</label>
                    <div className="flex flex-wrap gap-2">
                      {pestTypes.map(pest => (
                        <label key={pest.id} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={(inspectionForm.pestTypesFound || []).includes(pest.name)}
                            onChange={(e) => {
                              const current = inspectionForm.pestTypesFound || [];
                              setInspectionForm({
                                ...inspectionForm,
                                pestTypesFound: e.target.checked
                                  ? [...current, pest.name]
                                  : current.filter(p => p !== pest.name)
                              });
                            }}
                            className="w-3 h-3 text-[#0D9488] rounded"
                          />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{pest.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.infestationAreas', 'Infestation Areas')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.pestControl.eGKitchenBasementAttic', 'e.g., Kitchen, Basement, Attic (comma-separated)')}
                      value={(inspectionForm.infestationAreas || []).join(', ')}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, infestationAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.recommendations', 'Recommendations')}</label>
                    <textarea
                      value={(inspectionForm.recommendations || []).join('\n')}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, recommendations: e.target.value.split('\n').filter(Boolean) })}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder={t('tools.pestControl.enterEachRecommendationOnA', 'Enter each recommendation on a new line...')}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.notes4', 'Notes')}</label>
                    <textarea
                      value={inspectionForm.notes || ''}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder={t('tools.pestControl.additionalObservations', 'Additional observations...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addInspectionReport} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Save Report
                  </button>
                  <button onClick={() => setShowAddInspection(false)} className={buttonSecondary}>
                    {t('tools.pestControl.cancel4', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Inspection List */}
            <div className="space-y-3">
              {inspectionReports.length === 0 ? (
                <div className={`${cardClass} p-8 text-center`}>
                  <ClipboardList className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.noInspectionReportsYet', 'No inspection reports yet')}</p>
                </div>
              ) : (
                inspectionReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(report => (
                  <div key={report.id} className={cardClass + ' p-4'}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getCustomerName(report.customerId)}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {report.date} - Inspector: {getTechnicianName(report.technicianId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severityLevel)}`}>
                          {report.severityLevel}
                        </span>
                        {report.requiresTreatment && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            {t('tools.pestControl.treatmentRequired', 'Treatment Required')}
                          </span>
                        )}
                      </div>
                    </div>
                    {report.pestTypesFound.length > 0 && (
                      <div className="mt-3">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pestControl.pestsFound2', 'Pests Found:')}</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {report.pestTypesFound.join(', ')}
                        </span>
                      </div>
                    )}
                    {report.infestationAreas.length > 0 && (
                      <div className="mt-1">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pestControl.areas', 'Areas:')}</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {report.infestationAreas.join(', ')}
                        </span>
                      </div>
                    )}
                    {report.estimatedCost > 0 && (
                      <div className="mt-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Estimated Cost: ${report.estimatedCost.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Agreements Tab */}
        {activeTab === 'agreements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.serviceAgreementsWarranties', 'Service Agreements & Warranties')}
              </h2>
              <button onClick={() => setShowAddAgreement(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> New Agreement
              </button>
            </div>

            {/* Add Agreement Form */}
            {showAddAgreement && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.newServiceAgreement', 'New Service Agreement')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.customer3', 'Customer *')}</label>
                    <select
                      value={agreementForm.customerId || ''}
                      onChange={(e) => setAgreementForm({ ...agreementForm, customerId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.selectCustomer3', 'Select customer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.startDate', 'Start Date *')}</label>
                    <input
                      type="date"
                      value={agreementForm.startDate || ''}
                      onChange={(e) => setAgreementForm({ ...agreementForm, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.endDate', 'End Date')}</label>
                    <input
                      type="date"
                      value={agreementForm.endDate || ''}
                      onChange={(e) => setAgreementForm({ ...agreementForm, endDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.serviceFrequency', 'Service Frequency')}</label>
                    <select
                      value={agreementForm.serviceFrequency || 'monthly'}
                      onChange={(e) => setAgreementForm({ ...agreementForm, serviceFrequency: e.target.value as ServiceAgreement['serviceFrequency'] })}
                      className={inputClass}
                    >
                      <option value="monthly">{t('tools.pestControl.monthly2', 'Monthly')}</option>
                      <option value="quarterly">{t('tools.pestControl.quarterly2', 'Quarterly')}</option>
                      <option value="bi-annual">{t('tools.pestControl.biAnnual2', 'Bi-Annual')}</option>
                      <option value="annual">{t('tools.pestControl.annual2', 'Annual')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.paymentTerms', 'Payment Terms')}</label>
                    <select
                      value={agreementForm.paymentTerms || 'monthly'}
                      onChange={(e) => setAgreementForm({ ...agreementForm, paymentTerms: e.target.value as ServiceAgreement['paymentTerms'] })}
                      className={inputClass}
                    >
                      <option value="monthly">{t('tools.pestControl.monthly3', 'Monthly')}</option>
                      <option value="quarterly">{t('tools.pestControl.quarterly3', 'Quarterly')}</option>
                      <option value="annual">{t('tools.pestControl.annual3', 'Annual')}</option>
                      <option value="per-visit">{t('tools.pestControl.perVisit', 'Per Visit')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.price', 'Price')}</label>
                    <input
                      type="number"
                      value={agreementForm.price || ''}
                      onChange={(e) => setAgreementForm({ ...agreementForm, price: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.includedServices', 'Included Services')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.pestControl.eGAntControlRodent', 'e.g., Ant control, Rodent control, Termite inspection (comma-separated)')}
                      value={(agreementForm.includedServices || []).join(', ')}
                      onChange={(e) => setAgreementForm({ ...agreementForm, includedServices: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="warrantyIncluded"
                      checked={agreementForm.warrantyIncluded || false}
                      onChange={(e) => setAgreementForm({ ...agreementForm, warrantyIncluded: e.target.checked })}
                      className="w-4 h-4 text-[#0D9488] rounded"
                    />
                    <label htmlFor="warrantyIncluded" className={labelClass + ' mb-0'}>
                      {t('tools.pestControl.includeWarrantyGuarantee', 'Include Warranty/Guarantee')}
                    </label>
                  </div>
                  {agreementForm.warrantyIncluded && (
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('tools.pestControl.warrantyDetails', 'Warranty Details')}</label>
                      <textarea
                        value={agreementForm.warrantyDetails || ''}
                        onChange={(e) => setAgreementForm({ ...agreementForm, warrantyDetails: e.target.value })}
                        className={`${inputClass} h-20 resize-none`}
                        placeholder={t('tools.pestControl.warrantyTermsAndConditions', 'Warranty terms and conditions...')}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addAgreement} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Create Agreement
                  </button>
                  <button onClick={() => setShowAddAgreement(false)} className={buttonSecondary}>
                    {t('tools.pestControl.cancel5', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Agreements List */}
            <div className="space-y-3">
              {agreements.length === 0 ? (
                <div className={`${cardClass} p-8 text-center`}>
                  <FileText className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.noServiceAgreementsYet', 'No service agreements yet')}</p>
                </div>
              ) : (
                agreements.map(agreement => (
                  <div key={agreement.id} className={cardClass + ' p-4'}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getCustomerName(agreement.customerId)}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {agreement.startDate} to {agreement.endDate} | {agreement.serviceFrequency} service
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agreement.status)}`}>
                          {agreement.status}
                        </span>
                        <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${agreement.price.toFixed(2)}
                          <span className={`text-xs font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            /{agreement.paymentTerms}
                          </span>
                        </p>
                      </div>
                    </div>
                    {agreement.includedServices.length > 0 && (
                      <div className="mt-3">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pestControl.services', 'Services:')}</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {agreement.includedServices.join(', ')}
                        </span>
                      </div>
                    )}
                    {agreement.warrantyIncluded && (
                      <div className="mt-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          {t('tools.pestControl.warrantyIncluded', 'Warranty Included')}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Warranties Section */}
            {warranties.length > 0 && (
              <div className="mt-6">
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.activeWarranties', 'Active Warranties')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {warranties.filter(w => w.status === 'active').map(warranty => (
                    <div key={warranty.id} className={cardClass + ' p-4'}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-[#0D9488]" />
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getCustomerName(warranty.customerId)}
                        </h4>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Valid: {warranty.startDate} to {warranty.endDate}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Coverage: {warranty.coverageType}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(warranty.status)}`}>
                        {warranty.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.invoicesBilling', 'Invoices & Billing')}
              </h2>
              <button onClick={() => setShowAddInvoice(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> Create Invoice
              </button>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={cardClass + ' p-4'}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.totalRevenue2', 'Total Revenue')}</p>
                <p className={`text-2xl font-bold text-green-500`}>
                  ${dashboardStats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className={cardClass + ' p-4'}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.pendingAmount', 'Pending Amount')}</p>
                <p className={`text-2xl font-bold text-blue-500`}>
                  ${dashboardStats.pendingAmount.toLocaleString()}
                </p>
              </div>
              <div className={cardClass + ' p-4'}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.overdueAmount', 'Overdue Amount')}</p>
                <p className={`text-2xl font-bold text-red-500`}>
                  ${dashboardStats.overdueAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Add Invoice Form */}
            {showAddInvoice && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.createNewInvoice', 'Create New Invoice')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.customer4', 'Customer *')}</label>
                    <select
                      value={invoiceForm.customerId || ''}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.selectCustomer4', 'Select customer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.invoiceDate', 'Invoice Date *')}</label>
                    <input
                      type="date"
                      value={invoiceForm.date || ''}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.dueDate', 'Due Date')}</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate || ''}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="mt-4">
                  <label className={labelClass}>{t('tools.pestControl.invoiceItems', 'Invoice Items')}</label>
                  <div className="space-y-2">
                    {(invoiceForm.items || []).map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(invoiceForm.items || [])];
                            newItems[index].description = e.target.value;
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className={`${inputClass} flex-1`}
                          placeholder={t('tools.pestControl.description', 'Description')}
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...(invoiceForm.items || [])];
                            newItems[index].quantity = parseInt(e.target.value) || 0;
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className={`${inputClass} w-20`}
                          placeholder={t('tools.pestControl.qty', 'Qty')}
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...(invoiceForm.items || [])];
                            newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className={`${inputClass} w-24`}
                          placeholder={t('tools.pestControl.price2', 'Price')}
                        />
                        <button
                          onClick={() => {
                            const newItems = (invoiceForm.items || []).filter((_, i) => i !== index);
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [...(invoiceForm.items || []), { description: '', quantity: 1, unitPrice: 0 }];
                        setInvoiceForm({ ...invoiceForm, items: newItems });
                      }}
                      className={`${buttonSecondary} text-sm`}
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={addInvoice} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Create Invoice
                  </button>
                  <button onClick={() => setShowAddInvoice(false)} className={buttonSecondary}>
                    {t('tools.pestControl.cancel6', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Invoice List */}
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className={`${cardClass} p-8 text-center`}>
                  <DollarSign className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.noInvoicesYet', 'No invoices yet')}</p>
                </div>
              ) : (
                invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(invoice => (
                  <div key={invoice.id} className={cardClass + ' p-4'}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getCustomerName(invoice.customerId)}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Invoice Date: {invoice.date} | Due: {invoice.dueDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${invoice.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p>Subtotal: ${invoice.subtotal.toFixed(2)}</p>
                        <p>Tax: ${invoice.tax.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                            className={`${buttonSecondary} text-sm py-1`}
                          >
                            {t('tools.pestControl.sendInvoice', 'Send Invoice')}
                          </button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                            className={`${buttonPrimary} text-sm py-1`}
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bait Stations Tab */}
        {activeTab === 'bait-stations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pestControl.baitStationMonitoring', 'Bait Station Monitoring')}
              </h2>
              <button onClick={() => setShowAddBaitStation(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> Add Station
              </button>
            </div>

            {/* Add Bait Station Form */}
            {showAddBaitStation && (
              <div className={`${cardClass} p-4`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pestControl.addNewBaitStation', 'Add New Bait Station')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.customer5', 'Customer *')}</label>
                    <select
                      value={baitStationForm.customerId || ''}
                      onChange={(e) => setBaitStationForm({ ...baitStationForm, customerId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.pestControl.selectCustomer5', 'Select customer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.location', 'Location *')}</label>
                    <input
                      type="text"
                      value={baitStationForm.location || ''}
                      onChange={(e) => setBaitStationForm({ ...baitStationForm, location: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.pestControl.eGNorthWallExterior', 'e.g., North wall exterior, Garage')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pestControl.stationType', 'Station Type')}</label>
                    <select
                      value={baitStationForm.stationType || 'rodent'}
                      onChange={(e) => setBaitStationForm({ ...baitStationForm, stationType: e.target.value as BaitStation['stationType'] })}
                      className={inputClass}
                    >
                      <option value="rodent">{t('tools.pestControl.rodent', 'Rodent')}</option>
                      <option value="ant">{t('tools.pestControl.ant', 'Ant')}</option>
                      <option value="termite">{t('tools.pestControl.termite', 'Termite')}</option>
                      <option value="general">{t('tools.pestControl.general', 'General')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.pestControl.notes5', 'Notes')}</label>
                    <textarea
                      value={baitStationForm.notes || ''}
                      onChange={(e) => setBaitStationForm({ ...baitStationForm, notes: e.target.value })}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder={t('tools.pestControl.additionalNotes2', 'Additional notes...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addBaitStation} className={buttonPrimary}>
                    <Save className="w-4 h-4" /> Add Station
                  </button>
                  <button onClick={() => setShowAddBaitStation(false)} className={buttonSecondary}>
                    {t('tools.pestControl.cancel7', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Bait Station List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {baitStations.length === 0 ? (
                <div className={`${cardClass} p-8 text-center col-span-full`}>
                  <Target className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.pestControl.noBaitStationsInstalled', 'No bait stations installed')}</p>
                </div>
              ) : (
                baitStations.map(station => (
                  <div key={station.id} className={cardClass + ' p-4'}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Target className={`w-5 h-5 ${
                          station.status === 'active' ? 'text-green-500' :
                          station.status === 'needs-replacement' ? 'text-orange-500' :
                          'text-red-500'
                        }`} />
                        <div>
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {station.location}
                          </h4>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getCustomerName(station.customerId)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        station.stationType === 'rodent' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        station.stationType === 'ant' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        station.stationType === 'termite' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {station.stationType}
                      </span>
                    </div>

                    <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>Installed: {station.installDate}</p>
                      <p>Last Checked: {station.lastChecked}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pestControl.activity', 'Activity:')}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          station.activityLevel === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          station.activityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          station.activityLevel === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {station.activityLevel}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                        {station.status}
                      </span>
                    </div>

                    <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBaitStation(station.id, { lastChecked: new Date().toISOString().split('T')[0] })}
                          className={`${buttonSecondary} text-sm py-1 flex-1`}
                        >
                          <RefreshCw className="w-3 h-3" /> Check
                        </button>
                        <select
                          value={station.activityLevel}
                          onChange={(e) => updateBaitStation(station.id, { activityLevel: e.target.value as BaitStation['activityLevel'] })}
                          className={`${inputClass} text-sm py-1 flex-1`}
                        >
                          <option value="none">{t('tools.pestControl.noActivity', 'No Activity')}</option>
                          <option value="low">{t('tools.pestControl.low2', 'Low')}</option>
                          <option value="medium">{t('tools.pestControl.medium2', 'Medium')}</option>
                          <option value="high">{t('tools.pestControl.high2', 'High')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.pestControl.aboutPestControlServiceManager', 'About Pest Control Service Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive pest control service management tool for tracking customers, scheduling treatments,
            managing chemical inventory with safety data, monitoring bait stations, creating inspection reports,
            managing service agreements and warranties, and handling billing. All data is saved locally to your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PestControlTool;
