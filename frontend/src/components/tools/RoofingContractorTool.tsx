'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Home,
  User,
  ClipboardCheck,
  AlertTriangle,
  Package,
  Wrench,
  Calculator,
  FileText,
  Shield,
  Users,
  ShoppingCart,
  Cloud,
  Award,
  Camera,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Sun,
  CloudRain,
  Wind,
  Snowflake,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: 'residential' | 'commercial' | 'multi-family';
  roofType: string;
  roofAge: number;
  squareFootage: number;
  stories: number;
  notes: string;
}

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'good' | 'fair' | 'poor' | 'critical' | 'not-inspected';
  notes: string;
}

interface DamageItem {
  id: string;
  type: string;
  location: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  repairRequired: boolean;
  estimatedCost: number;
}

interface MaterialItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  ordered: boolean;
  received: boolean;
}

interface Job {
  id: string;
  customerId: string;
  type: 'repair' | 'replacement' | 'new-construction' | 'inspection' | 'maintenance';
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  estimatedCost: number;
  actualCost: number;
  permitRequired: boolean;
  permitStatus: 'not-required' | 'pending' | 'approved' | 'denied';
  permitNumber: string;
  insuranceClaim: boolean;
  claimNumber: string;
  claimStatus: 'not-filed' | 'filed' | 'approved' | 'denied' | 'paid';
  claimAmount: number;
  assignedCrew: string[];
  notes: string;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  available: boolean;
  certifications: string[];
}

interface Warranty {
  id: string;
  jobId: string;
  type: 'workmanship' | 'materials' | 'manufacturer';
  duration: number;
  startDate: string;
  endDate: string;
  coverage: string;
  terms: string;
}

interface WeatherForecast {
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snow';
  high: number;
  low: number;
  precipitation: number;
  windSpeed: number;
  workable: boolean;
}

interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Estimate {
  id: string;
  customerId: string;
  jobType: string;
  lineItems: EstimateLineItem[];
  laborCost: number;
  materialCost: number;
  overhead: number;
  profit: number;
  tax: number;
  total: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  notes: string;
}

// Column configurations for exports
const customerColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zip', header: 'ZIP', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'roofType', header: 'Roof Type', type: 'string' },
  { key: 'roofAge', header: 'Roof Age', type: 'number' },
  { key: 'squareFootage', header: 'Square Footage', type: 'number' },
  { key: 'stories', header: 'Stories', type: 'number' },
];

const jobColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerId', header: 'Customer ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
];

const materialColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
];

const crewColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'available', header: 'Available', type: 'boolean' },
];

const damageColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'severity', header: 'Severity', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
];

const inspectionColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const estimateColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerId', header: 'Customer ID', type: 'string' },
  { key: 'jobType', header: 'Job Type', type: 'string' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'validUntil', header: 'Valid Until', type: 'date' },
];

const warrantyColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'jobId', header: 'Job ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'duration', header: 'Duration (Years)', type: 'number' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
];

const defaultInspectionItems: Omit<InspectionItem, 'id'>[] = [
  { category: 'Shingles', item: 'Overall condition', status: 'not-inspected', notes: '' },
  { category: 'Shingles', item: 'Missing shingles', status: 'not-inspected', notes: '' },
  { category: 'Shingles', item: 'Curling/buckling', status: 'not-inspected', notes: '' },
  { category: 'Shingles', item: 'Granule loss', status: 'not-inspected', notes: '' },
  { category: 'Shingles', item: 'Algae/moss growth', status: 'not-inspected', notes: '' },
  { category: 'Flashing', item: 'Chimney flashing', status: 'not-inspected', notes: '' },
  { category: 'Flashing', item: 'Vent flashing', status: 'not-inspected', notes: '' },
  { category: 'Flashing', item: 'Valley flashing', status: 'not-inspected', notes: '' },
  { category: 'Flashing', item: 'Drip edge', status: 'not-inspected', notes: '' },
  { category: 'Gutters', item: 'Gutter condition', status: 'not-inspected', notes: '' },
  { category: 'Gutters', item: 'Downspouts', status: 'not-inspected', notes: '' },
  { category: 'Gutters', item: 'Proper drainage', status: 'not-inspected', notes: '' },
  { category: 'Structure', item: 'Decking condition', status: 'not-inspected', notes: '' },
  { category: 'Structure', item: 'Fascia boards', status: 'not-inspected', notes: '' },
  { category: 'Structure', item: 'Soffit condition', status: 'not-inspected', notes: '' },
  { category: 'Structure', item: 'Attic ventilation', status: 'not-inspected', notes: '' },
  { category: 'Interior', item: 'Ceiling stains', status: 'not-inspected', notes: '' },
  { category: 'Interior', item: 'Attic insulation', status: 'not-inspected', notes: '' },
  { category: 'Interior', item: 'Signs of leaks', status: 'not-inspected', notes: '' },
];

const defaultWeatherForecast: WeatherForecast[] = [
  { date: '2024-01-15', condition: 'sunny', high: 55, low: 38, precipitation: 0, windSpeed: 5, workable: true },
  { date: '2024-01-16', condition: 'cloudy', high: 52, low: 40, precipitation: 10, windSpeed: 8, workable: true },
  { date: '2024-01-17', condition: 'rainy', high: 48, low: 42, precipitation: 80, windSpeed: 15, workable: false },
  { date: '2024-01-18', condition: 'windy', high: 45, low: 35, precipitation: 5, windSpeed: 25, workable: false },
  { date: '2024-01-19', condition: 'sunny', high: 58, low: 40, precipitation: 0, windSpeed: 8, workable: true },
  { date: '2024-01-20', condition: 'cloudy', high: 50, low: 38, precipitation: 20, windSpeed: 10, workable: true },
  { date: '2024-01-21', condition: 'snow', high: 32, low: 25, precipitation: 60, windSpeed: 12, workable: false },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

interface RoofingContractorToolProps {
  uiConfig?: UIConfig;
}

export const RoofingContractorTool = ({
  uiConfig }: RoofingContractorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('customers');

  // Initialize useToolData hooks for each data type with backend sync
  const {
    data: customers,
    addItem: addCustomerItem,
    updateItem: updateCustomerItem,
    deleteItem: deleteCustomerItem,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
    forceSync: customersForceSync,
  } = useToolData<Customer>(
    'roofing-contractor-customers',
    [],
    customerColumns,
    { autoSave: true }
  );

  const {
    data: inspections,
    addItem: addInspectionData,
    updateItem: updateInspectionData,
    deleteItem: deleteInspectionData,
    isSynced: inspectionsSynced,
    isSaving: inspectionsSaving,
    lastSaved: inspectionsLastSaved,
    syncError: inspectionsSyncError,
    forceSync: inspectionsForceSync,
  } = useToolData<InspectionItem>(
    'roofing-contractor-inspections',
    defaultInspectionItems.map(item => ({ ...item, id: generateId() })),
    inspectionColumns,
    { autoSave: true }
  );

  const {
    data: damages,
    addItem: addDamageItem,
    updateItem: updateDamageItem,
    deleteItem: deleteDamageItem,
    isSynced: damagesSynced,
    isSaving: damagesSaving,
    lastSaved: damagesLastSaved,
    syncError: damagesSyncError,
    forceSync: damagesForceSync,
  } = useToolData<DamageItem>(
    'roofing-contractor-damages',
    [],
    damageColumns,
    { autoSave: true }
  );

  const {
    data: materials,
    addItem: addMaterialItem,
    updateItem: updateMaterialItem,
    deleteItem: deleteMaterialItem,
    isSynced: materialsSynced,
    isSaving: materialsSaving,
    lastSaved: materialsLastSaved,
    syncError: materialsSyncError,
    forceSync: materialsForceSync,
  } = useToolData<MaterialItem>(
    'roofing-contractor-materials',
    [],
    materialColumns,
    { autoSave: true }
  );

  const {
    data: jobs,
    addItem: addJobItem,
    updateItem: updateJobItem,
    deleteItem: deleteJobItem,
    isSynced: jobsSynced,
    isSaving: jobsSaving,
    lastSaved: jobsLastSaved,
    syncError: jobsSyncError,
    forceSync: jobsForceSync,
  } = useToolData<Job>(
    'roofing-contractor-jobs',
    [],
    jobColumns,
    { autoSave: true }
  );

  const {
    data: crew,
    addItem: addCrewItem,
    updateItem: updateCrewItem,
    deleteItem: deleteCrewItem,
    isSynced: crewSynced,
    isSaving: crewSaving,
    lastSaved: crewLastSaved,
    syncError: crewSyncError,
    forceSync: crewForceSync,
  } = useToolData<CrewMember>(
    'roofing-contractor-crew',
    [],
    crewColumns,
    { autoSave: true }
  );

  const {
    data: warranties,
    addItem: addWarrantyItem,
    updateItem: updateWarrantyItem,
    deleteItem: deleteWarrantyItem,
    isSynced: warrantiesSynced,
    isSaving: warrantiesSaving,
    lastSaved: warrantiesLastSaved,
    syncError: warrantiesSyncError,
    forceSync: warrantiesForceSync,
  } = useToolData<Warranty>(
    'roofing-contractor-warranties',
    [],
    warrantyColumns,
    { autoSave: true }
  );

  const {
    data: estimates,
    addItem: addEstimateItem,
    updateItem: updateEstimateItem,
    deleteItem: deleteEstimateItem,
    isSynced: estimatesSynced,
    isSaving: estimatesSaving,
    lastSaved: estimatesLastSaved,
    syncError: estimatesSyncError,
    forceSync: estimatesForceSync,
  } = useToolData<Estimate>(
    'roofing-contractor-estimates',
    [],
    estimateColumns,
    { autoSave: true }
  );

  // Combined sync status (all need to be synced for overall sync)
  const isSynced = customersSynced && inspectionsSynced && damagesSynced && materialsSynced &&
                   jobsSynced && crewSynced && warrantiesSynced && estimatesSynced;
  const isSaving = customersSaving || inspectionsSaving || damagesSaving || materialsSaving ||
                   jobsSaving || crewSaving || warrantiesSaving || estimatesSaving;
  const lastSavedDates = [customersLastSaved, inspectionsLastSaved, damagesLastSaved, materialsLastSaved,
                          jobsLastSaved, crewLastSaved, warrantiesLastSaved, estimatesLastSaved].filter(Boolean);
  const lastSaved = lastSavedDates.length > 0
    ? lastSavedDates.reduce((latest, current) =>
        new Date(current!) > new Date(latest!) ? current : latest
      )
    : null;
  const syncError = customersSyncError || inspectionsSyncError || damagesSyncError || materialsSyncError ||
                    jobsSyncError || crewSyncError || warrantiesSyncError || estimatesSyncError;
  const forceSync = () => {
    customersForceSync();
    inspectionsForceSync();
    damagesForceSync();
    materialsForceSync();
    jobsForceSync();
    crewForceSync();
    warrantiesForceSync();
    estimatesForceSync();
  };

  // Weather forecast stored locally (static data, no backend sync needed)
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>(defaultWeatherForecast);

  // Create a unified data object for easy access
  const data = useMemo(() => ({
    customers,
    inspections,
    damages,
    materials,
    jobs,
    crew,
    warranties,
    estimates,
    weatherForecast,
  }), [
    customers,
    inspections,
    damages,
    materials,
    jobs,
    crew,
    warranties,
    estimates,
    weatherForecast,
  ]);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Customer management
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    propertyType: 'residential',
    roofType: 'asphalt-shingles',
    roofAge: 0,
    squareFootage: 0,
    stories: 1,
  });

  const addCustomer = () => {
    if (!customerForm.name || !customerForm.address) return;
    const newCustomer: Customer = {
      id: generateId(),
      name: customerForm.name || '',
      phone: customerForm.phone || '',
      email: customerForm.email || '',
      address: customerForm.address || '',
      city: customerForm.city || '',
      state: customerForm.state || '',
      zip: customerForm.zip || '',
      propertyType: customerForm.propertyType || 'residential',
      roofType: customerForm.roofType || 'asphalt-shingles',
      roofAge: customerForm.roofAge || 0,
      squareFootage: customerForm.squareFootage || 0,
      stories: customerForm.stories || 1,
      notes: customerForm.notes || '',
    };
    addCustomerItem(newCustomer);
    setCustomerForm({ propertyType: 'residential', roofType: 'asphalt-shingles', roofAge: 0, squareFootage: 0, stories: 1 });
    setShowCustomerForm(false);
  };

  const deleteCustomer = (id: string) => {
    deleteCustomerItem(id);
    if (selectedCustomer?.id === id) setSelectedCustomer(null);
  };

  // Job management
  const [jobForm, setJobForm] = useState<Partial<Job>>({
    type: 'repair',
    status: 'pending',
    permitRequired: false,
    permitStatus: 'not-required',
    insuranceClaim: false,
    claimStatus: 'not-filed',
    assignedCrew: [],
  });

  const addJob = () => {
    if (!jobForm.customerId) return;
    const newJob: Job = {
      id: generateId(),
      customerId: jobForm.customerId || '',
      type: jobForm.type || 'repair',
      status: jobForm.status || 'pending',
      startDate: jobForm.startDate || '',
      endDate: jobForm.endDate || '',
      estimatedCost: jobForm.estimatedCost || 0,
      actualCost: jobForm.actualCost || 0,
      permitRequired: jobForm.permitRequired || false,
      permitStatus: jobForm.permitStatus || 'not-required',
      permitNumber: jobForm.permitNumber || '',
      insuranceClaim: jobForm.insuranceClaim || false,
      claimNumber: jobForm.claimNumber || '',
      claimStatus: jobForm.claimStatus || 'not-filed',
      claimAmount: jobForm.claimAmount || 0,
      assignedCrew: jobForm.assignedCrew || [],
      notes: jobForm.notes || '',
    };
    addJobItem(newJob);
    setJobForm({ type: 'repair', status: 'pending', permitRequired: false, permitStatus: 'not-required', insuranceClaim: false, claimStatus: 'not-filed', assignedCrew: [] });
    setShowJobForm(false);
  };

  const updateJobStatus = (jobId: string, status: Job['status']) => {
    updateJobItem(jobId, { status });
  };

  const deleteJob = (id: string) => {
    deleteJobItem(id);
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  // Crew management
  const [crewForm, setCrewForm] = useState<Partial<CrewMember>>({
    available: true,
    certifications: [],
  });

  const addCrewMember = () => {
    if (!crewForm.name || !crewForm.role) return;
    const newMember: CrewMember = {
      id: generateId(),
      name: crewForm.name || '',
      role: crewForm.role || '',
      phone: crewForm.phone || '',
      available: crewForm.available ?? true,
      certifications: crewForm.certifications || [],
    };
    addCrewItem(newMember);
    setCrewForm({ available: true, certifications: [] });
    setShowCrewForm(false);
  };

  const deleteCrewMember = (id: string) => {
    deleteCrewItem(id);
  };

  const toggleCrewAvailability = (id: string) => {
    const member = data.crew.find(c => c.id === id);
    if (member) {
      updateCrewItem(id, { available: !member.available });
    }
  };

  // Material management
  const [materialForm, setMaterialForm] = useState<Partial<MaterialItem>>({
    category: 'shingles',
    quantity: 0,
    unitPrice: 0,
    ordered: false,
    received: false,
  });

  const addMaterial = () => {
    if (!materialForm.name) return;
    const totalPrice = (materialForm.quantity || 0) * (materialForm.unitPrice || 0);
    const newMaterial: MaterialItem = {
      id: generateId(),
      category: materialForm.category || 'shingles',
      name: materialForm.name || '',
      quantity: materialForm.quantity || 0,
      unit: materialForm.unit || 'bundle',
      unitPrice: materialForm.unitPrice || 0,
      totalPrice,
      ordered: materialForm.ordered || false,
      received: materialForm.received || false,
    };
    addMaterialItem(newMaterial);
    setMaterialForm({ category: 'shingles', quantity: 0, unitPrice: 0, ordered: false, received: false });
    setShowMaterialForm(false);
  };

  const updateMaterialStatus = (id: string, field: 'ordered' | 'received', value: boolean) => {
    updateMaterialItem(id, { [field]: value });
  };

  const deleteMaterial = (id: string) => {
    deleteMaterialItem(id);
  };

  // Inspection management
  const updateInspectionItem = (id: string, status: InspectionItem['status'], notes?: string) => {
    const updates: Partial<InspectionItem> = { status };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    updateInspectionData(id, updates);
  };

  // Damage management
  const [damageForm, setDamageForm] = useState<Partial<DamageItem>>({
    severity: 'moderate',
    repairRequired: true,
    estimatedCost: 0,
  });

  const addDamage = () => {
    if (!damageForm.type || !damageForm.location) return;
    const newDamage: DamageItem = {
      id: generateId(),
      type: damageForm.type || '',
      location: damageForm.location || '',
      severity: damageForm.severity || 'moderate',
      description: damageForm.description || '',
      repairRequired: damageForm.repairRequired ?? true,
      estimatedCost: damageForm.estimatedCost || 0,
    };
    addDamageItem(newDamage);
    setDamageForm({ severity: 'moderate', repairRequired: true, estimatedCost: 0 });
  };

  const deleteDamage = (id: string) => {
    deleteDamageItem(id);
  };

  // Estimate builder
  const [estimateForm, setEstimateForm] = useState<Partial<Estimate>>({
    lineItems: [],
    laborCost: 0,
    materialCost: 0,
    overhead: 10,
    profit: 15,
    tax: 0,
    status: 'draft',
  });

  const [lineItemForm, setLineItemForm] = useState<Partial<EstimateLineItem>>({
    quantity: 1,
    unitPrice: 0,
  });

  const addLineItem = () => {
    if (!lineItemForm.description) return;
    const total = (lineItemForm.quantity || 1) * (lineItemForm.unitPrice || 0);
    const newItem: EstimateLineItem = {
      id: generateId(),
      description: lineItemForm.description || '',
      quantity: lineItemForm.quantity || 1,
      unit: lineItemForm.unit || 'each',
      unitPrice: lineItemForm.unitPrice || 0,
      total,
    };
    setEstimateForm(prev => ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem],
    }));
    setLineItemForm({ quantity: 1, unitPrice: 0 });
  };

  const removeLineItem = (id: string) => {
    setEstimateForm(prev => ({
      ...prev,
      lineItems: (prev.lineItems || []).filter(item => item.id !== id),
    }));
  };

  const calculateEstimateTotal = useMemo(() => {
    const lineItemsTotal = (estimateForm.lineItems || []).reduce((sum, item) => sum + item.total, 0);
    const subtotal = lineItemsTotal + (estimateForm.laborCost || 0) + (estimateForm.materialCost || 0);
    const overheadAmount = subtotal * ((estimateForm.overhead || 0) / 100);
    const profitAmount = subtotal * ((estimateForm.profit || 0) / 100);
    const beforeTax = subtotal + overheadAmount + profitAmount;
    const taxAmount = beforeTax * ((estimateForm.tax || 0) / 100);
    return beforeTax + taxAmount;
  }, [estimateForm]);

  const saveEstimate = () => {
    if (!estimateForm.customerId) return;
    const newEstimate: Estimate = {
      id: generateId(),
      customerId: estimateForm.customerId || '',
      jobType: estimateForm.jobType || '',
      lineItems: estimateForm.lineItems || [],
      laborCost: estimateForm.laborCost || 0,
      materialCost: estimateForm.materialCost || 0,
      overhead: estimateForm.overhead || 10,
      profit: estimateForm.profit || 15,
      tax: estimateForm.tax || 0,
      total: calculateEstimateTotal,
      validUntil: estimateForm.validUntil || '',
      status: estimateForm.status || 'draft',
      notes: estimateForm.notes || '',
    };
    addEstimateItem(newEstimate);
    setEstimateForm({ lineItems: [], laborCost: 0, materialCost: 0, overhead: 10, profit: 15, tax: 0, status: 'draft' });
    setShowEstimateBuilder(false);
  };

  const deleteEstimate = (id: string) => {
    deleteEstimateItem(id);
  };

  // Warranty management
  const [warrantyForm, setWarrantyForm] = useState<Partial<Warranty>>({
    type: 'workmanship',
    duration: 1,
  });

  const addWarranty = () => {
    if (!warrantyForm.jobId) return;
    const startDate = warrantyForm.startDate || new Date().toISOString().split('T')[0];
    const endDate = new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + (warrantyForm.duration || 1))).toISOString().split('T')[0];
    const newWarranty: Warranty = {
      id: generateId(),
      jobId: warrantyForm.jobId || '',
      type: warrantyForm.type || 'workmanship',
      duration: warrantyForm.duration || 1,
      startDate,
      endDate,
      coverage: warrantyForm.coverage || '',
      terms: warrantyForm.terms || '',
    };
    addWarrantyItem(newWarranty);
    setWarrantyForm({ type: 'workmanship', duration: 1 });
  };

  const deleteWarranty = (id: string) => {
    deleteWarrantyItem(id);
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalJobs = data.jobs.length;
    const completedJobs = data.jobs.filter(j => j.status === 'completed').length;
    const pendingJobs = data.jobs.filter(j => j.status === 'pending').length;
    const inProgressJobs = data.jobs.filter(j => j.status === 'in-progress').length;
    const totalRevenue = data.jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.actualCost, 0);
    const pendingRevenue = data.jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').reduce((sum, j) => sum + j.estimatedCost, 0);
    const activeClaims = data.jobs.filter(j => j.insuranceClaim && j.claimStatus !== 'paid' && j.claimStatus !== 'denied').length;
    const pendingPermits = data.jobs.filter(j => j.permitRequired && j.permitStatus === 'pending').length;
    const availableCrew = data.crew.filter(c => c.available).length;
    const workableDays = data.weatherForecast.filter(w => w.workable).length;

    return {
      totalJobs,
      completedJobs,
      pendingJobs,
      inProgressJobs,
      totalRevenue,
      pendingRevenue,
      activeClaims,
      pendingPermits,
      availableCrew,
      workableDays,
    };
  }, [data]);

  // Export functions
  const getActiveTabData = (): { data: Record<string, any>[]; columns: ColumnConfig[]; name: string } => {
    switch (activeTab) {
      case 'customers': return { data: customers as Record<string, any>[], columns: customerColumns, name: 'customers' };
      case 'inspection': return { data: inspections as Record<string, any>[], columns: inspectionColumns, name: 'inspections' };
      case 'damage': return { data: damages as Record<string, any>[], columns: damageColumns, name: 'damages' };
      case 'materials': return { data: materials as Record<string, any>[], columns: materialColumns, name: 'materials' };
      case 'jobs': return { data: jobs as Record<string, any>[], columns: jobColumns, name: 'jobs' };
      case 'crew': return { data: crew as Record<string, any>[], columns: crewColumns, name: 'crew' };
      case 'warranties': return { data: warranties as Record<string, any>[], columns: warrantyColumns, name: 'warranties' };
      case 'estimates': return { data: estimates as Record<string, any>[], columns: estimateColumns, name: 'estimates' };
      default: return { data: customers as Record<string, any>[], columns: customerColumns, name: 'customers' };
    }
  };

  const handleExportCSV = () => {
    const { data: exportData, columns, name } = getActiveTabData();
    exportToCSV(exportData, columns, { filename: `roofing-${name}` });
  };

  const handleExportExcel = () => {
    const { data: exportData, columns, name } = getActiveTabData();
    exportToExcel(exportData, columns, { filename: `roofing-${name}` });
  };

  const handleExportJSON = () => {
    const { data: exportData, name } = getActiveTabData();
    exportToJSON(exportData, { filename: `roofing-${name}` });
  };

  const handleExportPDF = async () => {
    const { data: exportData, columns, name } = getActiveTabData();
    await exportToPDF(exportData, columns, {
      filename: `roofing-${name}`,
      title: `Roofing Contractor - ${name.charAt(0).toUpperCase() + name.slice(1)}`,
    });
  };

  const handlePrint = () => {
    const { data: exportData, columns, name } = getActiveTabData();
    printData(exportData, columns, {
      title: `Roofing Contractor - ${name.charAt(0).toUpperCase() + name.slice(1)}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const { data: exportData, columns } = getActiveTabData();
    return await copyUtil(exportData, columns, 'tab');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      case 'completed': return 'text-green-500';
      case 'in-progress': return 'text-blue-500';
      case 'pending': return 'text-yellow-500';
      case 'cancelled': return 'text-gray-500';
      case 'approved': return 'text-green-500';
      case 'denied': return 'text-red-500';
      case 'paid': return 'text-green-600';
      case 'filed': return 'text-blue-500';
      default: return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-500';
      case 'moderate': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'windy': return <Wind className="w-5 h-5 text-teal-500" />;
      case 'snow': return <Snowflake className="w-5 h-5 text-blue-300" />;
      default: return <Cloud className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'customers', label: 'Customers', icon: User },
    { id: 'inspection', label: 'Inspection', icon: ClipboardCheck },
    { id: 'damage', label: 'Damage', icon: AlertTriangle },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'jobs', label: 'Jobs', icon: Wrench },
    { id: 'estimates', label: 'Estimates', icon: Calculator },
    { id: 'insurance', label: 'Insurance', icon: FileText },
    { id: 'permits', label: 'Permits', icon: Shield },
    { id: 'crew', label: 'Crew', icon: Users },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'warranties', label: 'Warranties', icon: Award },
    { id: 'photos', label: 'Photos', icon: Camera },
  ];

  const inputClass = `w-full px-4 py-3 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const buttonPrimary = 'bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2';

  const buttonSecondary = `px-4 py-2 rounded-lg font-medium transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }`;

  const cardClass = `rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 shadow-sm`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.roofingContractorManagement', 'Roofing Contractor Management')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.roofingContractor.completeJobManagementEstimatesAnd', 'Complete job management, estimates, and documentation')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="roofing-contractor" toolName="Roofing Contractor" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={cardClass}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.activeJobs', 'Active Jobs')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">{stats.inProgressJobs}</div>
            </div>
            <div className={cardClass}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.pending', 'Pending')}</div>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingJobs}</div>
            </div>
            <div className={cardClass}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.completed', 'Completed')}</div>
              <div className="text-2xl font-bold text-green-500">{stats.completedJobs}</div>
            </div>
            <div className={cardClass}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.revenue', 'Revenue')}</div>
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
            </div>
            <div className={cardClass}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.workableDays', 'Workable Days')}</div>
              <div className="text-2xl font-bold text-blue-500">{stats.workableDays}/7</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.customerPropertyInformation', 'Customer & Property Information')}
                </h2>
                <button onClick={() => setShowCustomerForm(!showCustomerForm)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.addCustomer', 'Add Customer')}
                </button>
              </div>

              {showCustomerForm && (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.newCustomer', 'New Customer')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.name', 'Name *')}</label>
                      <input
                        type="text"
                        value={customerForm.name || ''}
                        onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.customerName', 'Customer name')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.phone', 'Phone')}</label>
                      <input
                        type="tel"
                        value={customerForm.phone || ''}
                        onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.phoneNumber', 'Phone number')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.email', 'Email')}</label>
                      <input
                        type="email"
                        value={customerForm.email || ''}
                        onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.emailAddress', 'Email address')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.address', 'Address *')}</label>
                      <input
                        type="text"
                        value={customerForm.address || ''}
                        onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.streetAddress', 'Street address')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.city', 'City')}</label>
                      <input
                        type="text"
                        value={customerForm.city || ''}
                        onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.city2', 'City')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>{t('tools.roofingContractor.state', 'State')}</label>
                        <input
                          type="text"
                          value={customerForm.state || ''}
                          onChange={e => setCustomerForm({ ...customerForm, state: e.target.value })}
                          className={inputClass}
                          placeholder={t('tools.roofingContractor.state2', 'State')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.roofingContractor.zip', 'ZIP')}</label>
                        <input
                          type="text"
                          value={customerForm.zip || ''}
                          onChange={e => setCustomerForm({ ...customerForm, zip: e.target.value })}
                          className={inputClass}
                          placeholder={t('tools.roofingContractor.zip2', 'ZIP')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.propertyType', 'Property Type')}</label>
                      <select
                        value={customerForm.propertyType}
                        onChange={e => setCustomerForm({ ...customerForm, propertyType: e.target.value as Customer['propertyType'] })}
                        className={inputClass}
                      >
                        <option value="residential">{t('tools.roofingContractor.residential', 'Residential')}</option>
                        <option value="commercial">{t('tools.roofingContractor.commercial', 'Commercial')}</option>
                        <option value="multi-family">{t('tools.roofingContractor.multiFamily', 'Multi-Family')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.roofType', 'Roof Type')}</label>
                      <select
                        value={customerForm.roofType}
                        onChange={e => setCustomerForm({ ...customerForm, roofType: e.target.value })}
                        className={inputClass}
                      >
                        <option value="asphalt-shingles">{t('tools.roofingContractor.asphaltShingles', 'Asphalt Shingles')}</option>
                        <option value="metal">{t('tools.roofingContractor.metal', 'Metal')}</option>
                        <option value="tile">{t('tools.roofingContractor.tile', 'Tile')}</option>
                        <option value="slate">{t('tools.roofingContractor.slate', 'Slate')}</option>
                        <option value="wood-shake">{t('tools.roofingContractor.woodShake', 'Wood Shake')}</option>
                        <option value="flat-membrane">{t('tools.roofingContractor.flatMembrane', 'Flat/Membrane')}</option>
                        <option value="composite">{t('tools.roofingContractor.composite', 'Composite')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.roofAgeYears', 'Roof Age (years)')}</label>
                      <input
                        type="number"
                        value={customerForm.roofAge || ''}
                        onChange={e => setCustomerForm({ ...customerForm, roofAge: parseInt(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.squareFootage', 'Square Footage')}</label>
                      <input
                        type="number"
                        value={customerForm.squareFootage || ''}
                        onChange={e => setCustomerForm({ ...customerForm, squareFootage: parseInt(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.stories', 'Stories')}</label>
                      <input
                        type="number"
                        value={customerForm.stories || ''}
                        onChange={e => setCustomerForm({ ...customerForm, stories: parseInt(e.target.value) || 1 })}
                        className={inputClass}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className={labelClass}>{t('tools.roofingContractor.notes', 'Notes')}</label>
                      <textarea
                        value={customerForm.notes || ''}
                        onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.additionalNotes', 'Additional notes...')}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addCustomer} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.roofingContractor.saveCustomer', 'Save Customer')}
                    </button>
                    <button onClick={() => setShowCustomerForm(false)} className={buttonSecondary}>
                      {t('tools.roofingContractor.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Customer List */}
              <div className="space-y-4">
                {data.customers.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noCustomersAddedYetClick', 'No customers added yet. Click "Add Customer" to get started.')}
                  </div>
                ) : (
                  data.customers.map(customer => (
                    <div key={customer.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.name}
                          </h3>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {customer.address}, {customer.city}, {customer.state} {customer.zip}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            customer.propertyType === 'residential' ? 'bg-blue-100 text-blue-700' :
                            customer.propertyType === 'commercial' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {customer.propertyType}
                          </span>
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className={buttonSecondary}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingContractor.roofType2', 'Roof Type:')}</span>
                            <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.roofType}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingContractor.roofAge', 'Roof Age:')}</span>
                            <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.roofAge} years
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingContractor.size', 'Size:')}</span>
                            <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.squareFootage.toLocaleString()} sq ft
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingContractor.stories2', 'Stories:')}</span>
                            <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.stories}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Inspection Tab */}
          {activeTab === 'inspection' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.roofInspectionChecklist', 'Roof Inspection Checklist')}
              </h2>

              {['Shingles', 'Flashing', 'Gutters', 'Structure', 'Interior'].map(category => (
                <div key={category} className="mb-6">
                  <button
                    onClick={() => toggleSection(category)}
                    className={`w-full flex justify-between items-center p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {category}
                    </h3>
                    {expandedSections[category] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {(expandedSections[category] ?? true) && (
                    <div className="mt-2 space-y-2">
                      {data.inspections
                        .filter(item => item.category === category)
                        .map(item => (
                          <div key={item.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.item}</span>
                              <select
                                value={item.status}
                                onChange={e => updateInspectionItem(item.id, e.target.value as InspectionItem['status'])}
                                className={`px-3 py-1 rounded border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                } ${getStatusColor(item.status)}`}
                              >
                                <option value="not-inspected">{t('tools.roofingContractor.notInspected', 'Not Inspected')}</option>
                                <option value="good">{t('tools.roofingContractor.good', 'Good')}</option>
                                <option value="fair">{t('tools.roofingContractor.fair', 'Fair')}</option>
                                <option value="poor">{t('tools.roofingContractor.poor', 'Poor')}</option>
                                <option value="critical">{t('tools.roofingContractor.critical', 'Critical')}</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={e => updateInspectionItem(item.id, item.status, e.target.value)}
                              placeholder={t('tools.roofingContractor.notes3', 'Notes...')}
                              className={`w-full px-3 py-1 rounded border text-sm ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Damage Tab */}
          {activeTab === 'damage' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.damageAssessment', 'Damage Assessment')}
              </h2>

              {/* Add Damage Form */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.documentDamage', 'Document Damage')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.damageType', 'Damage Type *')}</label>
                    <select
                      value={damageForm.type || ''}
                      onChange={e => setDamageForm({ ...damageForm, type: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.roofingContractor.selectType', 'Select type...')}</option>
                      <option value="hail">{t('tools.roofingContractor.hailDamage', 'Hail Damage')}</option>
                      <option value="wind">{t('tools.roofingContractor.windDamage', 'Wind Damage')}</option>
                      <option value="water">{t('tools.roofingContractor.waterDamage', 'Water Damage')}</option>
                      <option value="impact">{t('tools.roofingContractor.impactDamage', 'Impact Damage')}</option>
                      <option value="wear">{t('tools.roofingContractor.normalWear', 'Normal Wear')}</option>
                      <option value="structural">{t('tools.roofingContractor.structural', 'Structural')}</option>
                      <option value="other">{t('tools.roofingContractor.other', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.location', 'Location *')}</label>
                    <input
                      type="text"
                      value={damageForm.location || ''}
                      onChange={e => setDamageForm({ ...damageForm, location: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.roofingContractor.eGNorthSlopeNear', 'e.g., North slope, near chimney')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.severity', 'Severity')}</label>
                    <select
                      value={damageForm.severity}
                      onChange={e => setDamageForm({ ...damageForm, severity: e.target.value as DamageItem['severity'] })}
                      className={inputClass}
                    >
                      <option value="minor">{t('tools.roofingContractor.minor', 'Minor')}</option>
                      <option value="moderate">{t('tools.roofingContractor.moderate', 'Moderate')}</option>
                      <option value="severe">{t('tools.roofingContractor.severe', 'Severe')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.roofingContractor.description', 'Description')}</label>
                    <textarea
                      value={damageForm.description || ''}
                      onChange={e => setDamageForm({ ...damageForm, description: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.roofingContractor.detailedDescriptionOfDamage', 'Detailed description of damage...')}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.estimatedRepairCost', 'Estimated Repair Cost')}</label>
                    <input
                      type="number"
                      value={damageForm.estimatedCost || ''}
                      onChange={e => setDamageForm({ ...damageForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={damageForm.repairRequired}
                        onChange={e => setDamageForm({ ...damageForm, repairRequired: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.roofingContractor.repairRequired', 'Repair Required')}</span>
                    </label>
                  </div>
                </div>
                <button onClick={addDamage} className={`${buttonPrimary} mt-4`}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.addDamage', 'Add Damage')}
                </button>
              </div>

              {/* Damage List */}
              <div className="space-y-4">
                {data.damages.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noDamageDocumentedYet', 'No damage documented yet.')}
                  </div>
                ) : (
                  data.damages.map(damage => (
                    <div key={damage.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${getSeverityColor(damage.severity)}`} />
                          <div>
                            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {damage.type.charAt(0).toUpperCase() + damage.type.slice(1)} Damage
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Location: {damage.location}
                            </p>
                            {damage.description && (
                              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {damage.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            damage.severity === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                            damage.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {damage.severity}
                          </span>
                          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${damage.estimatedCost.toLocaleString()}
                          </span>
                          <button
                            onClick={() => deleteDamage(damage.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {data.damages.length > 0 && (
                <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.roofingContractor.totalEstimatedRepairCost', 'Total Estimated Repair Cost:')}
                    </span>
                    <span className="text-2xl font-bold text-[#0D9488]">
                      ${data.damages.reduce((sum, d) => sum + d.estimatedCost, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.materialTakeoffOrdering', 'Material Takeoff & Ordering')}
                </h2>
                <button onClick={() => setShowMaterialForm(!showMaterialForm)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.addMaterial', 'Add Material')}
                </button>
              </div>

              {showMaterialForm && (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.addMaterial2', 'Add Material')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.category', 'Category')}</label>
                      <select
                        value={materialForm.category}
                        onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })}
                        className={inputClass}
                      >
                        <option value="shingles">{t('tools.roofingContractor.shingles', 'Shingles')}</option>
                        <option value="underlayment">{t('tools.roofingContractor.underlayment', 'Underlayment')}</option>
                        <option value="flashing">{t('tools.roofingContractor.flashing', 'Flashing')}</option>
                        <option value="ventilation">{t('tools.roofingContractor.ventilation', 'Ventilation')}</option>
                        <option value="gutters">{t('tools.roofingContractor.gutters', 'Gutters')}</option>
                        <option value="fasteners">{t('tools.roofingContractor.fasteners', 'Fasteners')}</option>
                        <option value="sealant">{t('tools.roofingContractor.sealant', 'Sealant')}</option>
                        <option value="lumber">{t('tools.roofingContractor.lumber', 'Lumber')}</option>
                        <option value="other">{t('tools.roofingContractor.other2', 'Other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.materialName', 'Material Name *')}</label>
                      <input
                        type="text"
                        value={materialForm.name || ''}
                        onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.eGGafTimberlineHdz', 'e.g., GAF Timberline HDZ')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.quantity', 'Quantity')}</label>
                      <input
                        type="number"
                        value={materialForm.quantity || ''}
                        onChange={e => setMaterialForm({ ...materialForm, quantity: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.unit', 'Unit')}</label>
                      <select
                        value={materialForm.unit || 'bundle'}
                        onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value })}
                        className={inputClass}
                      >
                        <option value="bundle">{t('tools.roofingContractor.bundle', 'Bundle')}</option>
                        <option value="square">{t('tools.roofingContractor.square', 'Square')}</option>
                        <option value="roll">{t('tools.roofingContractor.roll', 'Roll')}</option>
                        <option value="piece">{t('tools.roofingContractor.piece', 'Piece')}</option>
                        <option value="linear-ft">{t('tools.roofingContractor.linearFt', 'Linear Ft')}</option>
                        <option value="box">{t('tools.roofingContractor.box', 'Box')}</option>
                        <option value="tube">{t('tools.roofingContractor.tube', 'Tube')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.unitPrice', 'Unit Price ($)')}</label>
                      <input
                        type="number"
                        value={materialForm.unitPrice || ''}
                        onChange={e => setMaterialForm({ ...materialForm, unitPrice: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addMaterial} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.roofingContractor.addMaterial3', 'Add Material')}
                    </button>
                    <button onClick={() => setShowMaterialForm(false)} className={buttonSecondary}>
                      {t('tools.roofingContractor.cancel2', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Materials by Category */}
              {['shingles', 'underlayment', 'flashing', 'ventilation', 'gutters', 'fasteners', 'sealant', 'lumber', 'other'].map(category => {
                const categoryMaterials = data.materials.filter(m => m.category === category);
                if (categoryMaterials.length === 0) return null;
                return (
                  <div key={category} className="mb-6">
                    <h3 className={`font-semibold mb-3 capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {category}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                            <th className={`py-2 px-3 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.material', 'Material')}</th>
                            <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.qty', 'Qty')}</th>
                            <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.unit2', 'Unit')}</th>
                            <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.unitPrice2', 'Unit Price')}</th>
                            <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.total', 'Total')}</th>
                            <th className={`py-2 px-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.ordered', 'Ordered')}</th>
                            <th className={`py-2 px-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.received', 'Received')}</th>
                            <th className={`py-2 px-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roofingContractor.actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryMaterials.map(material => (
                            <tr key={material.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`py-2 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{material.name}</td>
                              <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{material.quantity}</td>
                              <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{material.unit}</td>
                              <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>${material.unitPrice.toFixed(2)}</td>
                              <td className={`py-2 px-3 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${material.totalPrice.toFixed(2)}</td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => updateMaterialStatus(material.id, 'ordered', !material.ordered)}
                                  className={material.ordered ? 'text-green-500' : 'text-gray-400'}
                                >
                                  {material.ordered ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </button>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => updateMaterialStatus(material.id, 'received', !material.received)}
                                  className={material.received ? 'text-green-500' : 'text-gray-400'}
                                >
                                  {material.received ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </button>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => deleteMaterial(material.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {data.materials.length > 0 && (
                <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.roofingContractor.totalMaterialCost', 'Total Material Cost:')}
                    </span>
                    <span className="text-2xl font-bold text-[#0D9488]">
                      ${data.materials.reduce((sum, m) => sum + m.totalPrice, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.jobManagement', 'Job Management')}
                </h2>
                <button onClick={() => setShowJobForm(!showJobForm)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.newJob', 'New Job')}
                </button>
              </div>

              {showJobForm && (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.createNewJob', 'Create New Job')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.customer', 'Customer *')}</label>
                      <select
                        value={jobForm.customerId || ''}
                        onChange={e => setJobForm({ ...jobForm, customerId: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.roofingContractor.selectCustomer', 'Select customer...')}</option>
                        {data.customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.jobType', 'Job Type')}</label>
                      <select
                        value={jobForm.type}
                        onChange={e => setJobForm({ ...jobForm, type: e.target.value as Job['type'] })}
                        className={inputClass}
                      >
                        <option value="repair">{t('tools.roofingContractor.repair', 'Repair')}</option>
                        <option value="replacement">{t('tools.roofingContractor.replacement', 'Replacement')}</option>
                        <option value="new-construction">{t('tools.roofingContractor.newConstruction', 'New Construction')}</option>
                        <option value="inspection">{t('tools.roofingContractor.inspection', 'Inspection')}</option>
                        <option value="maintenance">{t('tools.roofingContractor.maintenance', 'Maintenance')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.status', 'Status')}</label>
                      <select
                        value={jobForm.status}
                        onChange={e => setJobForm({ ...jobForm, status: e.target.value as Job['status'] })}
                        className={inputClass}
                      >
                        <option value="pending">{t('tools.roofingContractor.pending2', 'Pending')}</option>
                        <option value="scheduled">{t('tools.roofingContractor.scheduled', 'Scheduled')}</option>
                        <option value="in-progress">{t('tools.roofingContractor.inProgress', 'In Progress')}</option>
                        <option value="completed">{t('tools.roofingContractor.completed2', 'Completed')}</option>
                        <option value="cancelled">{t('tools.roofingContractor.cancelled', 'Cancelled')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.startDate', 'Start Date')}</label>
                      <input
                        type="date"
                        value={jobForm.startDate || ''}
                        onChange={e => setJobForm({ ...jobForm, startDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.endDate', 'End Date')}</label>
                      <input
                        type="date"
                        value={jobForm.endDate || ''}
                        onChange={e => setJobForm({ ...jobForm, endDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.estimatedCost', 'Estimated Cost')}</label>
                      <input
                        type="number"
                        value={jobForm.estimatedCost || ''}
                        onChange={e => setJobForm({ ...jobForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobForm.permitRequired}
                          onChange={e => setJobForm({ ...jobForm, permitRequired: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.roofingContractor.permitRequired', 'Permit Required')}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobForm.insuranceClaim}
                          onChange={e => setJobForm({ ...jobForm, insuranceClaim: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.roofingContractor.insuranceClaim', 'Insurance Claim')}</span>
                      </label>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className={labelClass}>{t('tools.roofingContractor.notes2', 'Notes')}</label>
                      <textarea
                        value={jobForm.notes || ''}
                        onChange={e => setJobForm({ ...jobForm, notes: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.jobNotes', 'Job notes...')}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addJob} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.roofingContractor.createJob', 'Create Job')}
                    </button>
                    <button onClick={() => setShowJobForm(false)} className={buttonSecondary}>
                      {t('tools.roofingContractor.cancel3', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Jobs List */}
              <div className="space-y-4">
                {data.jobs.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noJobsCreatedYetClick', 'No jobs created yet. Click "New Job" to get started.')}
                  </div>
                ) : (
                  data.jobs.map(job => {
                    const customer = data.customers.find(c => c.id === job.customerId);
                    return (
                      <div key={job.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer?.name || 'Unknown Customer'} - {job.type.replace('-', ' ').toUpperCase()}
                            </h3>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1 mt-1`}>
                              {job.startDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {job.startDate} {job.endDate && `to ${job.endDate}`}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Estimated: ${job.estimatedCost.toLocaleString()}
                                {job.actualCost > 0 && ` | Actual: $${job.actualCost.toLocaleString()}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={job.status}
                              onChange={e => updateJobStatus(job.id, e.target.value as Job['status'])}
                              className={`px-3 py-1 rounded border text-sm ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              } ${getStatusColor(job.status)}`}
                            >
                              <option value="pending">{t('tools.roofingContractor.pending3', 'Pending')}</option>
                              <option value="scheduled">{t('tools.roofingContractor.scheduled2', 'Scheduled')}</option>
                              <option value="in-progress">{t('tools.roofingContractor.inProgress2', 'In Progress')}</option>
                              <option value="completed">{t('tools.roofingContractor.completed3', 'Completed')}</option>
                              <option value="cancelled">{t('tools.roofingContractor.cancelled2', 'Cancelled')}</option>
                            </select>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} flex flex-wrap gap-2`}>
                          {job.permitRequired && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              job.permitStatus === 'approved' ? 'bg-green-100 text-green-700' :
                              job.permitStatus === 'denied' ? 'bg-red-100 text-red-700' :
                              job.permitStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              Permit: {job.permitStatus}
                            </span>
                          )}
                          {job.insuranceClaim && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              job.claimStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              job.claimStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                              job.claimStatus === 'denied' ? 'bg-red-100 text-red-700' :
                              job.claimStatus === 'filed' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              Claim: {job.claimStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Estimates Tab */}
          {activeTab === 'estimates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.estimateBuilder', 'Estimate Builder')}
                </h2>
                <button onClick={() => setShowEstimateBuilder(!showEstimateBuilder)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.newEstimate', 'New Estimate')}
                </button>
              </div>

              {showEstimateBuilder && (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.createEstimate', 'Create Estimate')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.customer2', 'Customer *')}</label>
                      <select
                        value={estimateForm.customerId || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, customerId: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.roofingContractor.selectCustomer2', 'Select customer...')}</option>
                        {data.customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.jobType2', 'Job Type')}</label>
                      <select
                        value={estimateForm.jobType || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, jobType: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.roofingContractor.selectType2', 'Select type...')}</option>
                        <option value="repair">{t('tools.roofingContractor.repair2', 'Repair')}</option>
                        <option value="replacement">{t('tools.roofingContractor.fullReplacement', 'Full Replacement')}</option>
                        <option value="new-construction">{t('tools.roofingContractor.newConstruction2', 'New Construction')}</option>
                        <option value="maintenance">{t('tools.roofingContractor.maintenance2', 'Maintenance')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.validUntil', 'Valid Until')}</label>
                      <input
                        type="date"
                        value={estimateForm.validUntil || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, validUntil: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-4">
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.roofingContractor.lineItems', 'Line Items')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={lineItemForm.description || ''}
                          onChange={e => setLineItemForm({ ...lineItemForm, description: e.target.value })}
                          className={inputClass}
                          placeholder={t('tools.roofingContractor.description2', 'Description')}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={lineItemForm.quantity || ''}
                          onChange={e => setLineItemForm({ ...lineItemForm, quantity: parseFloat(e.target.value) || 1 })}
                          className={inputClass}
                          placeholder={t('tools.roofingContractor.qty2', 'Qty')}
                          min="1"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={lineItemForm.unitPrice || ''}
                          onChange={e => setLineItemForm({ ...lineItemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                          className={inputClass}
                          placeholder={t('tools.roofingContractor.unitPrice3', 'Unit Price')}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <button onClick={addLineItem} className={buttonPrimary}>
                        <Plus className="w-4 h-4" />
                        {t('tools.roofingContractor.add', 'Add')}
                      </button>
                    </div>
                    {(estimateForm.lineItems || []).length > 0 && (
                      <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3`}>
                        {(estimateForm.lineItems || []).map(item => (
                          <div key={item.id} className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'} last:border-0`}>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.description}</span>
                            <div className="flex items-center gap-4">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {item.quantity} x ${item.unitPrice.toFixed(2)}
                              </span>
                              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${item.total.toFixed(2)}
                              </span>
                              <button onClick={() => removeLineItem(item.id)} className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cost Fields */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.laborCost', 'Labor Cost')}</label>
                      <input
                        type="number"
                        value={estimateForm.laborCost || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, laborCost: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.materialCost', 'Material Cost')}</label>
                      <input
                        type="number"
                        value={estimateForm.materialCost || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, materialCost: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.overhead', 'Overhead %')}</label>
                      <input
                        type="number"
                        value={estimateForm.overhead || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, overhead: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.profit', 'Profit %')}</label>
                      <input
                        type="number"
                        value={estimateForm.profit || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, profit: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="15"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.tax', 'Tax %')}</label>
                      <input
                        type="number"
                        value={estimateForm.tax || ''}
                        onChange={e => setEstimateForm({ ...estimateForm, tax: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'} mb-4`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.roofingContractor.estimateTotal', 'Estimate Total:')}
                      </span>
                      <span className="text-3xl font-bold text-[#0D9488]">
                        ${calculateEstimateTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={saveEstimate} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.roofingContractor.saveEstimate', 'Save Estimate')}
                    </button>
                    <button onClick={() => setShowEstimateBuilder(false)} className={buttonSecondary}>
                      {t('tools.roofingContractor.cancel4', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Estimates */}
              <div className="space-y-4">
                {data.estimates.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noEstimatesCreatedYet', 'No estimates created yet.')}
                  </div>
                ) : (
                  data.estimates.map(estimate => {
                    const customer = data.customers.find(c => c.id === estimate.customerId);
                    return (
                      <div key={estimate.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer?.name || 'Unknown'} - {estimate.jobType || 'General'}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Valid until: {estimate.validUntil || 'Not specified'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              estimate.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              estimate.status === 'declined' ? 'bg-red-100 text-red-700' :
                              estimate.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {estimate.status}
                            </span>
                            <span className="text-xl font-bold text-[#0D9488]">
                              ${estimate.total.toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteEstimate(estimate.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.insuranceClaimTracking', 'Insurance Claim Tracking')}
              </h2>

              <div className="space-y-4">
                {data.jobs.filter(j => j.insuranceClaim).length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noInsuranceClaimsMarkJobs', 'No insurance claims. Mark jobs with insurance claims in the Jobs tab.')}
                  </div>
                ) : (
                  data.jobs.filter(j => j.insuranceClaim).map(job => {
                    const customer = data.customers.find(c => c.id === job.customerId);
                    return (
                      <div key={job.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer?.name || 'Unknown Customer'}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Claim #: {job.claimNumber || 'Not filed'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={job.claimStatus}
                              onChange={e => updateJobItem(job.id, { claimStatus: e.target.value as Job['claimStatus'] })}
                              className={`px-3 py-1 rounded border text-sm ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              }`}
                            >
                              <option value="not-filed">{t('tools.roofingContractor.notFiled', 'Not Filed')}</option>
                              <option value="filed">{t('tools.roofingContractor.filed', 'Filed')}</option>
                              <option value="approved">{t('tools.roofingContractor.approved', 'Approved')}</option>
                              <option value="denied">{t('tools.roofingContractor.denied', 'Denied')}</option>
                              <option value="paid">{t('tools.roofingContractor.paid', 'Paid')}</option>
                            </select>
                          </div>
                        </div>
                        <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} grid grid-cols-2 gap-4`}>
                          <div>
                            <label className={labelClass}>{t('tools.roofingContractor.claimNumber', 'Claim Number')}</label>
                            <input
                              type="text"
                              value={job.claimNumber}
                              onChange={e => updateJobItem(job.id, { claimNumber: e.target.value })}
                              className={inputClass}
                              placeholder={t('tools.roofingContractor.enterClaimNumber', 'Enter claim number')}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.roofingContractor.claimAmount', 'Claim Amount')}</label>
                            <input
                              type="number"
                              value={job.claimAmount || ''}
                              onChange={e => updateJobItem(job.id, { claimAmount: parseFloat(e.target.value) || 0 })}
                              className={inputClass}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Permits Tab */}
          {activeTab === 'permits' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.permitStatus', 'Permit Status')}
              </h2>

              <div className="space-y-4">
                {data.jobs.filter(j => j.permitRequired).length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noPermitsRequiredMarkJobs', 'No permits required. Mark jobs requiring permits in the Jobs tab.')}
                  </div>
                ) : (
                  data.jobs.filter(j => j.permitRequired).map(job => {
                    const customer = data.customers.find(c => c.id === job.customerId);
                    return (
                      <div key={job.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer?.name || 'Unknown Customer'} - {job.type.replace('-', ' ')}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Permit #: {job.permitNumber || 'Not assigned'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={job.permitStatus}
                              onChange={e => updateJobItem(job.id, { permitStatus: e.target.value as Job['permitStatus'] })}
                              className={`px-3 py-1 rounded border text-sm ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              }`}
                            >
                              <option value="not-required">{t('tools.roofingContractor.notRequired', 'Not Required')}</option>
                              <option value="pending">{t('tools.roofingContractor.pending4', 'Pending')}</option>
                              <option value="approved">{t('tools.roofingContractor.approved2', 'Approved')}</option>
                              <option value="denied">{t('tools.roofingContractor.denied2', 'Denied')}</option>
                            </select>
                          </div>
                        </div>
                        <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                          <label className={labelClass}>{t('tools.roofingContractor.permitNumber', 'Permit Number')}</label>
                          <input
                            type="text"
                            value={job.permitNumber}
                            onChange={e => updateJobItem(job.id, { permitNumber: e.target.value })}
                            className={inputClass}
                            placeholder={t('tools.roofingContractor.enterPermitNumber', 'Enter permit number')}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Crew Tab */}
          {activeTab === 'crew' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.crewScheduling', 'Crew Scheduling')}
                </h2>
                <button onClick={() => setShowCrewForm(!showCrewForm)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.addCrewMember', 'Add Crew Member')}
                </button>
              </div>

              {showCrewForm && (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.addCrewMember2', 'Add Crew Member')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.name2', 'Name *')}</label>
                      <input
                        type="text"
                        value={crewForm.name || ''}
                        onChange={e => setCrewForm({ ...crewForm, name: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.fullName', 'Full name')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.role', 'Role *')}</label>
                      <select
                        value={crewForm.role || ''}
                        onChange={e => setCrewForm({ ...crewForm, role: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.roofingContractor.selectRole', 'Select role...')}</option>
                        <option value="foreman">{t('tools.roofingContractor.foreman', 'Foreman')}</option>
                        <option value="lead-roofer">{t('tools.roofingContractor.leadRoofer', 'Lead Roofer')}</option>
                        <option value="roofer">{t('tools.roofingContractor.roofer', 'Roofer')}</option>
                        <option value="helper">{t('tools.roofingContractor.helper', 'Helper')}</option>
                        <option value="driver">{t('tools.roofingContractor.driver', 'Driver')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.roofingContractor.phone2', 'Phone')}</label>
                      <input
                        type="tel"
                        value={crewForm.phone || ''}
                        onChange={e => setCrewForm({ ...crewForm, phone: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.roofingContractor.phoneNumber2', 'Phone number')}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={crewForm.available}
                          onChange={e => setCrewForm({ ...crewForm, available: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.roofingContractor.available', 'Available')}</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addCrewMember} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.roofingContractor.addMember', 'Add Member')}
                    </button>
                    <button onClick={() => setShowCrewForm(false)} className={buttonSecondary}>
                      {t('tools.roofingContractor.cancel5', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Crew List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.crew.length === 0 ? (
                  <div className={`col-span-full text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noCrewMembersAddedYet', 'No crew members added yet.')}
                  </div>
                ) : (
                  data.crew.map(member => (
                    <div key={member.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {member.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.role}
                          </p>
                          {member.phone && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {member.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCrewAvailability(member.id)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              member.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {member.available ? t('tools.roofingContractor.available2', 'Available') : t('tools.roofingContractor.unavailable', 'Unavailable')}
                          </button>
                          <button
                            onClick={() => deleteCrewMember(member.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.weatherDependentScheduling', 'Weather-Dependent Scheduling')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={cardClass}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.workableDays2', 'Workable Days')}</div>
                  <div className="text-2xl font-bold text-green-500">
                    {data.weatherForecast.filter(w => w.workable).length}
                  </div>
                </div>
                <div className={cardClass}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingContractor.nonWorkable', 'Non-workable')}</div>
                  <div className="text-2xl font-bold text-red-500">
                    {data.weatherForecast.filter(w => !w.workable).length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {data.weatherForecast.map((day, index) => (
                  <div key={index} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                    <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {day.high}° / {day.low}°
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      <div>Precip: {day.precipitation}%</div>
                      <div>Wind: {day.windSpeed} mph</div>
                    </div>
                    <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                      day.workable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {day.workable ? t('tools.roofingContractor.workable', 'Workable') : t('tools.roofingContractor.notWorkable', 'Not Workable')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranties Tab */}
          {activeTab === 'warranties' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.warrantyDocumentation', 'Warranty Documentation')}
              </h2>

              {/* Add Warranty Form */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roofingContractor.addWarranty', 'Add Warranty')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.job', 'Job *')}</label>
                    <select
                      value={warrantyForm.jobId || ''}
                      onChange={e => setWarrantyForm({ ...warrantyForm, jobId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.roofingContractor.selectJob', 'Select job...')}</option>
                      {data.jobs.filter(j => j.status === 'completed').map(job => {
                        const customer = data.customers.find(c => c.id === job.customerId);
                        return (
                          <option key={job.id} value={job.id}>
                            {customer?.name} - {job.type}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.type', 'Type')}</label>
                    <select
                      value={warrantyForm.type}
                      onChange={e => setWarrantyForm({ ...warrantyForm, type: e.target.value as Warranty['type'] })}
                      className={inputClass}
                    >
                      <option value="workmanship">{t('tools.roofingContractor.workmanship', 'Workmanship')}</option>
                      <option value="materials">{t('tools.roofingContractor.materials', 'Materials')}</option>
                      <option value="manufacturer">{t('tools.roofingContractor.manufacturer', 'Manufacturer')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.durationYears', 'Duration (years)')}</label>
                    <input
                      type="number"
                      value={warrantyForm.duration || ''}
                      onChange={e => setWarrantyForm({ ...warrantyForm, duration: parseInt(e.target.value) || 1 })}
                      className={inputClass}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.roofingContractor.startDate2', 'Start Date')}</label>
                    <input
                      type="date"
                      value={warrantyForm.startDate || ''}
                      onChange={e => setWarrantyForm({ ...warrantyForm, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.roofingContractor.coverage', 'Coverage')}</label>
                    <textarea
                      value={warrantyForm.coverage || ''}
                      onChange={e => setWarrantyForm({ ...warrantyForm, coverage: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.roofingContractor.whatIsCovered', 'What is covered...')}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.roofingContractor.terms', 'Terms')}</label>
                    <textarea
                      value={warrantyForm.terms || ''}
                      onChange={e => setWarrantyForm({ ...warrantyForm, terms: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.roofingContractor.warrantyTermsAndConditions', 'Warranty terms and conditions...')}
                      rows={2}
                    />
                  </div>
                </div>
                <button onClick={addWarranty} className={`${buttonPrimary} mt-4`}>
                  <Plus className="w-4 h-4" />
                  {t('tools.roofingContractor.addWarranty2', 'Add Warranty')}
                </button>
              </div>

              {/* Warranties List */}
              <div className="space-y-4">
                {data.warranties.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.roofingContractor.noWarrantiesDocumentedYet', 'No warranties documented yet.')}
                  </div>
                ) : (
                  data.warranties.map(warranty => {
                    const job = data.jobs.find(j => j.id === warranty.jobId);
                    const customer = job ? data.customers.find(c => c.id === job.customerId) : null;
                    const isExpired = new Date(warranty.endDate) < new Date();
                    return (
                      <div key={warranty.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer?.name || 'Unknown'} - {warranty.type} Warranty
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {warranty.startDate} to {warranty.endDate} ({warranty.duration} years)
                            </p>
                            {warranty.coverage && (
                              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {warranty.coverage}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isExpired ? t('tools.roofingContractor.expired', 'Expired') : t('tools.roofingContractor.active', 'Active')}
                            </span>
                            <button
                              onClick={() => deleteWarranty(warranty.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roofingContractor.beforeAfterPhotos', 'Before/After Photos')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Photos */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.beforePhotos', 'Before Photos')}
                  </h3>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.roofingContractor.dragAndDropPhotosHere', 'Drag and drop photos here')}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tools.roofingContractor.orClickToBrowse', 'or click to browse')}
                    </p>
                    <button className={`${buttonPrimary} mt-4`}>
                      <Camera className="w-4 h-4" />
                      {t('tools.roofingContractor.uploadPhotos', 'Upload Photos')}
                    </button>
                  </div>
                  <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('tools.roofingContractor.photoUploadFunctionalityPlaceholderIn', 'Photo upload functionality placeholder. In production, this would connect to a file storage service.')}
                  </p>
                </div>

                {/* After Photos */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-6`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.roofingContractor.afterPhotos', 'After Photos')}
                  </h3>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.roofingContractor.dragAndDropPhotosHere2', 'Drag and drop photos here')}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tools.roofingContractor.orClickToBrowse2', 'or click to browse')}
                    </p>
                    <button className={`${buttonPrimary} mt-4`}>
                      <Camera className="w-4 h-4" />
                      {t('tools.roofingContractor.uploadPhotos2', 'Upload Photos')}
                    </button>
                  </div>
                  <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('tools.roofingContractor.photoUploadFunctionalityPlaceholderIn2', 'Photo upload functionality placeholder. In production, this would connect to a file storage service.')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.roofingContractor.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Complete roofing contractor management system with customer tracking, inspections,
              damage assessment, material takeoff, job management, estimates, insurance claims,
              permits, crew scheduling, weather-dependent planning, and warranty documentation.
            </p>
            <p className="mt-2 text-xs italic">
              {t('tools.roofingContractor.allDataIsSavedLocally', 'All data is saved locally in your browser. Export your data regularly for backup.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofingContractorTool;
