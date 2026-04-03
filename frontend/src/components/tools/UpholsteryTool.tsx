'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Armchair,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  Ruler,
  Package,
  Truck,
  Calculator,
  Camera,
  Clock,
  Save,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Users,
  Scissors,
  Box,
  CreditCard,
  MapPin,
  Edit3,
  Eye,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface FurnitureMeasurements {
  width: string;
  height: string;
  depth: string;
  seatHeight: string;
  armHeight: string;
  notes: string;
}

interface FurnitureIntake {
  id: string;
  customerId: string;
  type: string;
  brand: string;
  condition: string;
  measurements: FurnitureMeasurements;
  beforePhotos: string[];
  afterPhotos: string[];
  specialInstructions: string;
  dateReceived: string;
}

interface FabricSelection {
  id: string;
  projectId: string;
  fabricName: string;
  fabricCode: string;
  supplier: string;
  pricePerYard: number;
  yardsNeeded: number;
  isCOM: boolean;
  comCustomerProvided: boolean;
  notes: string;
}

interface EstimateLineItem {
  id: string;
  category: 'labor' | 'materials' | 'fabric' | 'other';
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Estimate {
  id: string;
  projectId: string;
  lineItems: EstimateLineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'approved' | 'declined';
}

interface Project {
  id: string;
  customerId: string;
  furnitureId: string;
  estimateId: string;
  status: 'intake' | 'estimated' | 'approved' | 'in_progress' | 'quality_check' | 'ready' | 'delivered' | 'completed';
  priorityLevel: 'low' | 'normal' | 'high' | 'rush';
  depositPaid: number;
  totalPaid: number;
  estimatedCompletion: string;
  actualCompletion: string;
  notes: string;
  createdDate: string;
}

interface FabricInventory {
  id: string;
  name: string;
  code: string;
  supplier: string;
  pricePerYard: number;
  yardsInStock: number;
  reorderLevel: number;
  color: string;
  material: string;
  pattern: string;
}

interface FoamInventory {
  id: string;
  name: string;
  type: string;
  density: string;
  thickness: string;
  dimensions: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
}

interface ScheduleEntry {
  id: string;
  projectId: string;
  type: 'pickup' | 'delivery';
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  contactName: string;
  contactPhone: string;
  status: 'scheduled' | 'confirmed' | 'in_transit' | 'completed' | 'cancelled';
  notes: string;
}

interface WorkProgress {
  id: string;
  projectId: string;
  stage: string;
  description: string;
  completedDate: string;
  completedBy: string;
  notes: string;
}

interface Subcontractor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  rate: number;
  rateType: 'hourly' | 'per_project' | 'per_piece';
  notes: string;
}

interface SubcontractorAssignment {
  id: string;
  projectId: string;
  subcontractorId: string;
  task: string;
  estimatedCost: number;
  actualCost: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'invoiced' | 'paid';
  dueDate: string;
  notes: string;
}

interface Payment {
  id: string;
  projectId: string;
  amount: number;
  type: 'deposit' | 'progress' | 'final' | 'refund';
  method: 'cash' | 'check' | 'card' | 'transfer';
  date: string;
  reference: string;
  notes: string;
}

// Combined data structure for backend sync
interface UpholsteryShopData {
  id: string;
  customers: Customer[];
  furnitureIntakes: FurnitureIntake[];
  fabricSelections: FabricSelection[];
  estimates: Estimate[];
  projects: Project[];
  fabricInventory: FabricInventory[];
  foamInventory: FoamInventory[];
  scheduleEntries: ScheduleEntry[];
  workProgress: WorkProgress[];
  subcontractors: Subcontractor[];
  subcontractorAssignments: SubcontractorAssignment[];
  payments: Payment[];
  updatedAt: string;
}

// Column configuration for the shop data sync (used by useToolData)
const SHOP_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'updatedAt', header: 'Last Updated', type: 'date' },
];

const FURNITURE_TYPES = [
  'Sofa',
  'Loveseat',
  'Armchair',
  'Dining Chair',
  'Ottoman',
  'Bench',
  'Headboard',
  'Chaise Lounge',
  'Recliner',
  'Bar Stool',
  'Office Chair',
  'Sectional',
  'Daybed',
  'Window Seat',
  'Boat Cushions',
  'RV Cushions',
  'Patio Furniture',
  'Antique Furniture',
  'Custom Piece',
  'Other',
];

const FURNITURE_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Needs Major Repair',
];

const PROJECT_STATUSES = [
  { value: 'intake', label: 'Intake', color: 'gray' },
  { value: 'estimated', label: 'Estimated', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'quality_check', label: 'Quality Check', color: 'purple' },
  { value: 'ready', label: 'Ready for Pickup', color: 'teal' },
  { value: 'delivered', label: 'Delivered', color: 'indigo' },
  { value: 'completed', label: 'Completed', color: 'emerald' },
];

const WORK_STAGES = [
  'Intake & Inspection',
  'Tear Down',
  'Frame Repair',
  'Spring/Webbing Work',
  'Foam Replacement',
  'Padding Applied',
  'Fabric Cut',
  'Fabric Sewn',
  'Upholstery Applied',
  'Finishing Details',
  'Quality Inspection',
  'Photography',
  'Ready for Delivery',
];

const FOAM_TYPES = [
  'High Density',
  'Medium Density',
  'Soft Density',
  'Memory Foam',
  'Outdoor Foam',
  'Dacron Wrap',
  'Cotton Batting',
  'Down Blend',
];

const STORAGE_KEY = 'upholstery_shop_data';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Export column configurations
const PROJECT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'furnitureType', header: 'Furniture Type', type: 'string' },
  { key: 'furnitureBrand', header: 'Brand', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priorityLevel', header: 'Priority', type: 'string' },
  { key: 'estimateTotal', header: 'Estimate Total', type: 'currency' },
  { key: 'totalPaid', header: 'Total Paid', type: 'currency' },
  { key: 'balanceDue', header: 'Balance Due', type: 'currency' },
  { key: 'estimatedCompletion', header: 'Est. Completion', type: 'date' },
  { key: 'createdDate', header: 'Created Date', type: 'date' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const FABRIC_INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'code', header: 'Code', type: 'string' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'material', header: 'Material', type: 'string' },
  { key: 'pattern', header: 'Pattern', type: 'string' },
  { key: 'pricePerYard', header: 'Price/Yard', type: 'currency' },
  { key: 'yardsInStock', header: 'Yards In Stock', type: 'number' },
  { key: 'reorderLevel', header: 'Reorder Level', type: 'number' },
];

const FOAM_INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'density', header: 'Density', type: 'string' },
  { key: 'thickness', header: 'Thickness', type: 'string' },
  { key: 'dimensions', header: 'Dimensions', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency' },
  { key: 'reorderLevel', header: 'Reorder Level', type: 'number' },
];

const SCHEDULE_COLUMNS: ColumnConfig[] = [
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'contactPhone', header: 'Phone', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const SUBCONTRACTOR_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'specialty', header: 'Specialty', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'rate', header: 'Rate', type: 'currency' },
  { key: 'rateType', header: 'Rate Type', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface UpholsteryToolProps {
  uiConfig?: UIConfig;
}

// Default empty shop data
const DEFAULT_SHOP_DATA: UpholsteryShopData = {
  id: 'upholstery-shop-main',
  customers: [],
  furnitureIntakes: [],
  fabricSelections: [],
  estimates: [],
  projects: [],
  fabricInventory: [],
  foamInventory: [],
  scheduleEntries: [],
  workProgress: [],
  subcontractors: [],
  subcontractorAssignments: [],
  payments: [],
  updatedAt: new Date().toISOString(),
};

export const UpholsteryTool: React.FC<UpholsteryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: shopDataArray,
    setData: setShopDataArray,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importCSV: hookImportCSV,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
  } = useToolData<UpholsteryShopData>('upholstery-shop', [DEFAULT_SHOP_DATA], SHOP_DATA_COLUMNS);

  // Extract the shop data from the array (we only use one record)
  const shopData = shopDataArray[0] || DEFAULT_SHOP_DATA;

  // Derived states from shopData
  const customers = shopData.customers || [];
  const furnitureIntakes = shopData.furnitureIntakes || [];
  const fabricSelections = shopData.fabricSelections || [];
  const estimates = shopData.estimates || [];
  const projects = shopData.projects || [];
  const fabricInventory = shopData.fabricInventory || [];
  const foamInventory = shopData.foamInventory || [];
  const scheduleEntries = shopData.scheduleEntries || [];
  const workProgress = shopData.workProgress || [];
  const subcontractors = shopData.subcontractors || [];
  const subcontractorAssignments = shopData.subcontractorAssignments || [];
  const payments = shopData.payments || [];

  // Helper function to update shop data
  const updateShopData = useCallback((updates: Partial<UpholsteryShopData>) => {
    setShopDataArray([{
      ...shopData,
      ...updates,
      updatedAt: new Date().toISOString(),
    }]);
  }, [shopData, setShopDataArray]);

  // Setter functions for each data type
  const setCustomers = useCallback((newCustomers: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const updated = typeof newCustomers === 'function' ? newCustomers(customers) : newCustomers;
    updateShopData({ customers: updated });
  }, [customers, updateShopData]);

  const setFurnitureIntakes = useCallback((newIntakes: FurnitureIntake[] | ((prev: FurnitureIntake[]) => FurnitureIntake[])) => {
    const updated = typeof newIntakes === 'function' ? newIntakes(furnitureIntakes) : newIntakes;
    updateShopData({ furnitureIntakes: updated });
  }, [furnitureIntakes, updateShopData]);

  const setFabricSelections = useCallback((newSelections: FabricSelection[] | ((prev: FabricSelection[]) => FabricSelection[])) => {
    const updated = typeof newSelections === 'function' ? newSelections(fabricSelections) : newSelections;
    updateShopData({ fabricSelections: updated });
  }, [fabricSelections, updateShopData]);

  const setEstimates = useCallback((newEstimates: Estimate[] | ((prev: Estimate[]) => Estimate[])) => {
    const updated = typeof newEstimates === 'function' ? newEstimates(estimates) : newEstimates;
    updateShopData({ estimates: updated });
  }, [estimates, updateShopData]);

  const setProjects = useCallback((newProjects: Project[] | ((prev: Project[]) => Project[])) => {
    const updated = typeof newProjects === 'function' ? newProjects(projects) : newProjects;
    updateShopData({ projects: updated });
  }, [projects, updateShopData]);

  const setFabricInventory = useCallback((newInventory: FabricInventory[] | ((prev: FabricInventory[]) => FabricInventory[])) => {
    const updated = typeof newInventory === 'function' ? newInventory(fabricInventory) : newInventory;
    updateShopData({ fabricInventory: updated });
  }, [fabricInventory, updateShopData]);

  const setFoamInventory = useCallback((newInventory: FoamInventory[] | ((prev: FoamInventory[]) => FoamInventory[])) => {
    const updated = typeof newInventory === 'function' ? newInventory(foamInventory) : newInventory;
    updateShopData({ foamInventory: updated });
  }, [foamInventory, updateShopData]);

  const setScheduleEntries = useCallback((newEntries: ScheduleEntry[] | ((prev: ScheduleEntry[]) => ScheduleEntry[])) => {
    const updated = typeof newEntries === 'function' ? newEntries(scheduleEntries) : newEntries;
    updateShopData({ scheduleEntries: updated });
  }, [scheduleEntries, updateShopData]);

  const setWorkProgress = useCallback((newProgress: WorkProgress[] | ((prev: WorkProgress[]) => WorkProgress[])) => {
    const updated = typeof newProgress === 'function' ? newProgress(workProgress) : newProgress;
    updateShopData({ workProgress: updated });
  }, [workProgress, updateShopData]);

  const setSubcontractors = useCallback((newSubs: Subcontractor[] | ((prev: Subcontractor[]) => Subcontractor[])) => {
    const updated = typeof newSubs === 'function' ? newSubs(subcontractors) : newSubs;
    updateShopData({ subcontractors: updated });
  }, [subcontractors, updateShopData]);

  const setSubcontractorAssignments = useCallback((newAssignments: SubcontractorAssignment[] | ((prev: SubcontractorAssignment[]) => SubcontractorAssignment[])) => {
    const updated = typeof newAssignments === 'function' ? newAssignments(subcontractorAssignments) : newAssignments;
    updateShopData({ subcontractorAssignments: updated });
  }, [subcontractorAssignments, updateShopData]);

  const setPayments = useCallback((newPayments: Payment[] | ((prev: Payment[]) => Payment[])) => {
    const updated = typeof newPayments === 'function' ? newPayments(payments) : newPayments;
    updateShopData({ payments: updated });
  }, [payments, updateShopData]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // UI States
  const [activeTab, setActiveTab] = useState<string>('projects');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customers: true,
    intake: true,
    fabric: true,
    estimate: true,
    status: true,
    inventory: true,
    schedule: true,
    progress: true,
    subcontractors: true,
    payments: true,
  });

  // Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Calculations
  const dashboardStats = useMemo(() => {
    const activeProjects = projects.filter(p => !['completed', 'delivered'].includes(p.status)).length;
    const pendingPickups = scheduleEntries.filter(s => s.type === 'pickup' && s.status === 'scheduled').length;
    const pendingDeliveries = scheduleEntries.filter(s => s.type === 'delivery' && s.status === 'scheduled').length;
    const totalRevenue = payments.reduce((sum, p) => p.type !== 'refund' ? sum + p.amount : sum - p.amount, 0);
    const pendingPayments = projects.reduce((sum, p) => {
      const estimate = estimates.find(e => e.id === p.estimateId);
      if (!estimate) return sum;
      const estimateTotal = estimate.lineItems.reduce((t, li) => t + li.quantity * li.unitPrice, 0);
      const paid = payments.filter(pay => pay.projectId === p.id && pay.type !== 'refund').reduce((t, pay) => t + pay.amount, 0);
      return sum + Math.max(0, estimateTotal - paid);
    }, 0);
    const lowFabricStock = fabricInventory.filter(f => f.yardsInStock <= f.reorderLevel).length;
    const lowFoamStock = foamInventory.filter(f => f.quantity <= f.reorderLevel).length;

    return {
      activeProjects,
      pendingPickups,
      pendingDeliveries,
      totalRevenue,
      pendingPayments,
      lowFabricStock,
      lowFoamStock,
      totalCustomers: customers.length,
    };
  }, [projects, scheduleEntries, payments, estimates, fabricInventory, foamInventory, customers]);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Customer handlers
  const addCustomer = () => {
    const newCustomer: Customer = {
      id: generateId(),
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, field: keyof Customer, value: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCustomer = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Customer',
      message: 'Remove this customer? This will not delete their projects.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  }, [confirm, customers, setCustomers]);

  // Furniture Intake handlers
  const addFurnitureIntake = (customerId: string) => {
    const newIntake: FurnitureIntake = {
      id: generateId(),
      customerId,
      type: '',
      brand: '',
      condition: 'Good',
      measurements: {
        width: '',
        height: '',
        depth: '',
        seatHeight: '',
        armHeight: '',
        notes: '',
      },
      beforePhotos: [],
      afterPhotos: [],
      specialInstructions: '',
      dateReceived: new Date().toISOString().split('T')[0],
    };
    setFurnitureIntakes([...furnitureIntakes, newIntake]);

    // Create associated project
    const newProject: Project = {
      id: generateId(),
      customerId,
      furnitureId: newIntake.id,
      estimateId: '',
      status: 'intake',
      priorityLevel: 'normal',
      depositPaid: 0,
      totalPaid: 0,
      estimatedCompletion: '',
      actualCompletion: '',
      notes: '',
      createdDate: new Date().toISOString().split('T')[0],
    };
    setProjects([...projects, newProject]);
  };

  const updateFurnitureIntake = (id: string, field: string, value: string | FurnitureMeasurements) => {
    setFurnitureIntakes(furnitureIntakes.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const updateMeasurement = (intakeId: string, field: keyof FurnitureMeasurements, value: string) => {
    setFurnitureIntakes(furnitureIntakes.map(f =>
      f.id === intakeId
        ? { ...f, measurements: { ...f.measurements, [field]: value } }
        : f
    ));
  };

  // Fabric Selection handlers
  const addFabricSelection = (projectId: string) => {
    const newFabric: FabricSelection = {
      id: generateId(),
      projectId,
      fabricName: '',
      fabricCode: '',
      supplier: '',
      pricePerYard: 0,
      yardsNeeded: 0,
      isCOM: false,
      comCustomerProvided: false,
      notes: '',
    };
    setFabricSelections([...fabricSelections, newFabric]);
  };

  const updateFabricSelection = (id: string, field: keyof FabricSelection, value: string | number | boolean) => {
    setFabricSelections(fabricSelections.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFabricSelection = (id: string) => {
    setFabricSelections(fabricSelections.filter(f => f.id !== id));
  };

  // Estimate handlers
  const createEstimate = (projectId: string) => {
    const newEstimate: Estimate = {
      id: generateId(),
      projectId,
      lineItems: [],
      taxRate: 0,
      discount: 0,
      notes: '',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'draft',
    };
    setEstimates([...estimates, newEstimate]);
    setProjects(projects.map(p => p.id === projectId ? { ...p, estimateId: newEstimate.id, status: 'estimated' } : p));
  };

  const addEstimateLineItem = (estimateId: string, category: EstimateLineItem['category']) => {
    const newItem: EstimateLineItem = {
      id: generateId(),
      category,
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setEstimates(estimates.map(e =>
      e.id === estimateId
        ? { ...e, lineItems: [...e.lineItems, newItem] }
        : e
    ));
  };

  const updateEstimateLineItem = (estimateId: string, itemId: string, field: keyof EstimateLineItem, value: string | number) => {
    setEstimates(estimates.map(e =>
      e.id === estimateId
        ? {
            ...e,
            lineItems: e.lineItems.map(li =>
              li.id === itemId ? { ...li, [field]: value } : li
            )
          }
        : e
    ));
  };

  const removeEstimateLineItem = (estimateId: string, itemId: string) => {
    setEstimates(estimates.map(e =>
      e.id === estimateId
        ? { ...e, lineItems: e.lineItems.filter(li => li.id !== itemId) }
        : e
    ));
  };

  const updateEstimate = (id: string, field: keyof Estimate, value: string | number) => {
    setEstimates(estimates.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Project status update
  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, status } : p));
  };

  const updateProject = (id: string, field: keyof Project, value: string | number) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Fabric Inventory handlers
  const addFabricInventoryItem = () => {
    const newItem: FabricInventory = {
      id: generateId(),
      name: '',
      code: '',
      supplier: '',
      pricePerYard: 0,
      yardsInStock: 0,
      reorderLevel: 5,
      color: '',
      material: '',
      pattern: '',
    };
    setFabricInventory([...fabricInventory, newItem]);
  };

  const updateFabricInventoryItem = (id: string, field: keyof FabricInventory, value: string | number) => {
    setFabricInventory(fabricInventory.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFabricInventoryItem = (id: string) => {
    setFabricInventory(fabricInventory.filter(f => f.id !== id));
  };

  // Foam Inventory handlers
  const addFoamInventoryItem = () => {
    const newItem: FoamInventory = {
      id: generateId(),
      name: '',
      type: 'High Density',
      density: '',
      thickness: '',
      dimensions: '',
      quantity: 0,
      unitPrice: 0,
      reorderLevel: 2,
    };
    setFoamInventory([...foamInventory, newItem]);
  };

  const updateFoamInventoryItem = (id: string, field: keyof FoamInventory, value: string | number) => {
    setFoamInventory(foamInventory.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFoamInventoryItem = (id: string) => {
    setFoamInventory(foamInventory.filter(f => f.id !== id));
  };

  // Schedule handlers
  const addScheduleEntry = (projectId: string, type: ScheduleEntry['type']) => {
    const project = projects.find(p => p.id === projectId);
    const customer = customers.find(c => c.id === project?.customerId);

    const newEntry: ScheduleEntry = {
      id: generateId(),
      projectId,
      type,
      scheduledDate: '',
      scheduledTime: '',
      address: customer?.address || '',
      contactName: customer?.name || '',
      contactPhone: customer?.phone || '',
      status: 'scheduled',
      notes: '',
    };
    setScheduleEntries([...scheduleEntries, newEntry]);
  };

  const updateScheduleEntry = (id: string, field: keyof ScheduleEntry, value: string) => {
    setScheduleEntries(scheduleEntries.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeScheduleEntry = (id: string) => {
    setScheduleEntries(scheduleEntries.filter(s => s.id !== id));
  };

  // Work Progress handlers
  const addWorkProgress = (projectId: string) => {
    const newProgress: WorkProgress = {
      id: generateId(),
      projectId,
      stage: '',
      description: '',
      completedDate: new Date().toISOString().split('T')[0],
      completedBy: '',
      notes: '',
    };
    setWorkProgress([...workProgress, newProgress]);
  };

  const updateWorkProgress = (id: string, field: keyof WorkProgress, value: string) => {
    setWorkProgress(workProgress.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const removeWorkProgress = (id: string) => {
    setWorkProgress(workProgress.filter(w => w.id !== id));
  };

  // Subcontractor handlers
  const addSubcontractor = () => {
    const newSub: Subcontractor = {
      id: generateId(),
      name: '',
      specialty: '',
      phone: '',
      email: '',
      rate: 0,
      rateType: 'per_project',
      notes: '',
    };
    setSubcontractors([...subcontractors, newSub]);
  };

  const updateSubcontractor = (id: string, field: keyof Subcontractor, value: string | number) => {
    setSubcontractors(subcontractors.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSubcontractor = (id: string) => {
    setSubcontractors(subcontractors.filter(s => s.id !== id));
  };

  // Subcontractor Assignment handlers
  const addSubcontractorAssignment = (projectId: string) => {
    const newAssignment: SubcontractorAssignment = {
      id: generateId(),
      projectId,
      subcontractorId: '',
      task: '',
      estimatedCost: 0,
      actualCost: 0,
      status: 'assigned',
      dueDate: '',
      notes: '',
    };
    setSubcontractorAssignments([...subcontractorAssignments, newAssignment]);
  };

  const updateSubcontractorAssignment = (id: string, field: keyof SubcontractorAssignment, value: string | number) => {
    setSubcontractorAssignments(subcontractorAssignments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeSubcontractorAssignment = (id: string) => {
    setSubcontractorAssignments(subcontractorAssignments.filter(a => a.id !== id));
  };

  // Payment handlers
  const addPayment = (projectId: string) => {
    const newPayment: Payment = {
      id: generateId(),
      projectId,
      amount: 0,
      type: 'deposit',
      method: 'card',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (id: string, field: keyof Payment, value: string | number) => {
    setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePayment = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Payment',
      message: 'Remove this payment record?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setPayments(payments.filter(p => p.id !== id));
    }
  }, [confirm, payments, setPayments]);

  // Calculate estimate total
  const calculateEstimateTotal = (estimate: Estimate) => {
    const subtotal = estimate.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
    const discountAmount = subtotal * (estimate.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (estimate.taxRate / 100);
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: afterDiscount + taxAmount,
    };
  };

  // Export project data
  const exportProjectData = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const customer = customers.find(c => c.id === project?.customerId);
    const furniture = furnitureIntakes.find(f => f.id === project?.furnitureId);
    const estimate = estimates.find(e => e.id === project?.estimateId);
    const fabrics = fabricSelections.filter(f => f.projectId === projectId);
    const progress = workProgress.filter(w => w.projectId === projectId);
    const projectPayments = payments.filter(p => p.projectId === projectId);

    if (!project || !customer || !furniture) {
      setValidationMessage('Project data incomplete');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const estimateTotals = estimate ? calculateEstimateTotal(estimate) : null;
    const totalPaid = projectPayments.filter(p => p.type !== 'refund').reduce((sum, p) => sum + p.amount, 0);

    const report = `
UPHOLSTERY PROJECT REPORT
=========================
Generated: ${new Date().toLocaleString()}

CUSTOMER INFORMATION
--------------------
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email}
Address: ${customer.address}

FURNITURE DETAILS
-----------------
Type: ${furniture.type}
Brand: ${furniture.brand}
Condition: ${furniture.condition}
Date Received: ${furniture.dateReceived}

Measurements:
  Width: ${furniture.measurements.width}
  Height: ${furniture.measurements.height}
  Depth: ${furniture.measurements.depth}
  Seat Height: ${furniture.measurements.seatHeight}
  Arm Height: ${furniture.measurements.armHeight}

Special Instructions: ${furniture.specialInstructions}

FABRIC SELECTIONS
-----------------
${fabrics.map(f => `
  ${f.fabricName} (${f.fabricCode})
  Supplier: ${f.supplier}
  Price/Yard: $${f.pricePerYard.toFixed(2)}
  Yards Needed: ${f.yardsNeeded}
  ${f.isCOM ? '*** CUSTOMER OWN MATERIAL (COM) ***' : ''}
`).join('\n')}

${estimate ? `
ESTIMATE
--------
${estimate.lineItems.map(li => `
  ${li.description}
  ${li.quantity} x $${li.unitPrice.toFixed(2)} = $${(li.quantity * li.unitPrice).toFixed(2)}
`).join('')}

Subtotal: $${estimateTotals?.subtotal.toFixed(2)}
${estimate.discount > 0 ? `Discount (${estimate.discount}%): -$${estimateTotals?.discountAmount.toFixed(2)}` : ''}
${estimate.taxRate > 0 ? `Tax (${estimate.taxRate}%): $${estimateTotals?.taxAmount.toFixed(2)}` : ''}
--------------------------
TOTAL: $${estimateTotals?.total.toFixed(2)}
` : 'No estimate created yet.'}

PAYMENT HISTORY
---------------
${projectPayments.map(p => `
  ${p.date} - ${p.type.toUpperCase()} - $${p.amount.toFixed(2)} (${p.method})
`).join('')}
Total Paid: $${totalPaid.toFixed(2)}
${estimateTotals ? `Balance Due: $${(estimateTotals.total - totalPaid).toFixed(2)}` : ''}

PROJECT STATUS
--------------
Status: ${PROJECT_STATUSES.find(s => s.value === project.status)?.label}
Priority: ${project.priorityLevel.toUpperCase()}
Estimated Completion: ${project.estimatedCompletion || 'TBD'}

WORK PROGRESS
-------------
${progress.map(w => `
  [${w.completedDate}] ${w.stage}
  ${w.description}
  Completed by: ${w.completedBy}
`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${customer.name.replace(/\s+/g, '-')}-${project.createdDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Get customer name by ID
  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };

  // Get furniture type by ID
  const getFurnitureType = (furnitureId: string) => {
    return furnitureIntakes.find(f => f.id === furnitureId)?.type || 'Unknown';
  };

  // Prepare export data with computed fields
  const exportProjects = useMemo(() => {
    return projects.map((project) => {
      const customer = customers.find(c => c.id === project.customerId);
      const furniture = furnitureIntakes.find(f => f.id === project.furnitureId);
      const estimate = estimates.find(e => e.id === project.estimateId);
      const projectPayments = payments.filter(p => p.projectId === project.id);
      const totalPaid = projectPayments.filter(p => p.type !== 'refund').reduce((sum, p) => sum + p.amount, 0);
      const estimateTotal = estimate ? estimate.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0) : 0;
      return {
        ...project,
        customerName: customer?.name || 'Unknown',
        furnitureType: furniture?.type || 'Unknown',
        furnitureBrand: furniture?.brand || 'Unknown',
        estimateTotal,
        totalPaid,
        balanceDue: estimateTotal - totalPaid,
      };
    });
  }, [projects, customers, furnitureIntakes, estimates, payments]);

  const exportSchedule = useMemo(() => {
    return scheduleEntries.map((entry) => {
      const project = projects.find(p => p.id === entry.projectId);
      const customer = project ? customers.find(c => c.id === project.customerId) : null;
      return {
        ...entry,
        customerName: customer?.name || 'Unknown',
      };
    });
  }, [scheduleEntries, projects, customers]);

  // Get current export data based on active tab
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCurrentExportData = (): { data: any[]; columns: ColumnConfig[]; filename: string } => {
    switch (activeTab) {
      case 'projects':
        return { data: exportProjects, columns: PROJECT_COLUMNS, filename: 'upholstery-projects' };
      case 'customers':
        return { data: customers, columns: CUSTOMER_COLUMNS, filename: 'upholstery-customers' };
      case 'inventory':
        return { data: fabricInventory, columns: FABRIC_INVENTORY_COLUMNS, filename: 'upholstery-fabric-inventory' };
      case 'schedule':
        return { data: exportSchedule, columns: SCHEDULE_COLUMNS, filename: 'upholstery-schedule' };
      case 'subcontractors':
        return { data: subcontractors, columns: SUBCONTRACTOR_COLUMNS, filename: 'upholstery-subcontractors' };
      default:
        return { data: exportProjects, columns: PROJECT_COLUMNS, filename: 'upholstery-data' };
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const { data, columns, filename } = getCurrentExportData();
    exportToCSV(data, columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getCurrentExportData();
    exportToExcel(data, columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getCurrentExportData();
    exportToJSON(data, { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getCurrentExportData();
    await exportToPDF(data, columns, {
      filename,
      title: `Upholstery Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
      subtitle: `Total Records: ${data.length}`,
    });
  };

  const handlePrint = () => {
    const { data, columns } = getCurrentExportData();
    printData(data, columns, {
      title: `Upholstery Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const { data, columns } = getCurrentExportData();
    return await copyUtil(data, columns);
  };

  // Section Header Component
  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    count,
  }: {
    title: string;
    icon: React.ElementType;
    section: string;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#0D9488]" />
        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</span>
        {count !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}>
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
      ) : (
        <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
      )}
    </button>
  );

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const selectClass = `px-3 py-2 rounded-lg border ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-[#0D9488] text-white'
      : theme === 'dark'
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.upholstery.loadingShopData', 'Loading shop data...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Armchair className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('tools.upholstery.upholsteryShopManager', 'Upholstery Shop Manager')}
                  </CardTitle>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.upholstery.completeManagementForYourUpholstery', 'Complete management for your upholstery business')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WidgetEmbedButton toolSlug="upholstery" toolName="Upholstery" />

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
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  onImportCSV={async (file) => { await hookImportCSV(file); }}
                  onImportJSON={async (file) => { await hookImportJSON(file); }}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.upholstery.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-[#0D9488]">{dashboardStats.activeProjects}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.activeProjects', 'Active Projects')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-blue-500">{dashboardStats.pendingPickups}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.pendingPickups', 'Pending Pickups')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-green-500">{dashboardStats.pendingDeliveries}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.pendingDeliveries', 'Pending Deliveries')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(dashboardStats.totalRevenue)}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.totalRevenue', 'Total Revenue')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(dashboardStats.pendingPayments)}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.pendingPayments', 'Pending Payments')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-purple-500">{dashboardStats.totalCustomers}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.customers', 'Customers')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-2xl font-bold ${dashboardStats.lowFabricStock > 0 ? 'text-red-500' : 'text-gray-500'}`}>{dashboardStats.lowFabricStock}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.lowFabricStock', 'Low Fabric Stock')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-2xl font-bold ${dashboardStats.lowFoamStock > 0 ? 'text-red-500' : 'text-gray-500'}`}>{dashboardStats.lowFoamStock}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.lowFoamStock', 'Low Foam Stock')}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('projects')} className={tabClass(activeTab === 'projects')}>
            <FileText className="w-4 h-4 inline mr-2" />Projects
          </button>
          <button onClick={() => setActiveTab('customers')} className={tabClass(activeTab === 'customers')}>
            <Users className="w-4 h-4 inline mr-2" />Customers
          </button>
          <button onClick={() => setActiveTab('inventory')} className={tabClass(activeTab === 'inventory')}>
            <Package className="w-4 h-4 inline mr-2" />Inventory
          </button>
          <button onClick={() => setActiveTab('schedule')} className={tabClass(activeTab === 'schedule')}>
            <Truck className="w-4 h-4 inline mr-2" />Schedule
          </button>
          <button onClick={() => setActiveTab('subcontractors')} className={tabClass(activeTab === 'subcontractors')}>
            <Users className="w-4 h-4 inline mr-2" />Subcontractors
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Project List */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.upholstery.activeProjects2', 'Active Projects')}
                  </h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className={`${selectClass} text-sm`}
                    >
                      <option value="">{t('tools.upholstery.selectCustomer', 'Select Customer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => selectedCustomerId && addFurnitureIntake(selectedCustomerId)}
                      disabled={!selectedCustomerId}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.upholstery.newProject', 'New Project')}
                    </button>
                  </div>
                </div>

                {projects.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Armchair className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.upholstery.noProjectsYetAddA', 'No projects yet. Add a customer and create a new project to get started.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => {
                      const customer = customers.find(c => c.id === project.customerId);
                      const furniture = furnitureIntakes.find(f => f.id === project.furnitureId);
                      const estimate = estimates.find(e => e.id === project.estimateId);
                      const estimateTotals = estimate ? calculateEstimateTotal(estimate) : null;
                      const projectPayments = payments.filter(p => p.projectId === project.id);
                      const totalPaid = projectPayments.filter(p => p.type !== 'refund').reduce((sum, p) => sum + p.amount, 0);
                      const statusInfo = PROJECT_STATUSES.find(s => s.value === project.status);

                      return (
                        <div
                          key={project.id}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          } ${selectedProjectId === project.id ? 'ring-2 ring-[#0D9488]' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {customer?.name || 'Unknown Customer'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  project.priorityLevel === 'rush' ? 'bg-red-500 text-white' :
                                  project.priorityLevel === 'high' ? 'bg-orange-500 text-white' :
                                  project.priorityLevel === 'normal' ? 'bg-blue-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {project.priorityLevel.toUpperCase()}
                                </span>
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {furniture?.type || 'Furniture Type TBD'} - {furniture?.brand || 'Brand TBD'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={project.status}
                                onChange={(e) => updateProjectStatus(project.id, e.target.value as Project['status'])}
                                className={`${selectClass} text-sm`}
                              >
                                {PROJECT_STATUSES.map(s => (
                                  <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => setSelectedProjectId(selectedProjectId === project.id ? '' : project.id)}
                                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                {selectedProjectId === project.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Received: {furniture?.dateReceived || 'N/A'}
                            </div>
                            {estimateTotals && (
                              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Estimate: {formatCurrency(estimateTotals.total)}
                              </div>
                            )}
                            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              <CreditCard className="w-4 h-4 inline mr-1" />
                              Paid: {formatCurrency(totalPaid)}
                            </div>
                          </div>

                          {/* Expanded Project Details */}
                          {selectedProjectId === project.id && (
                            <div className="mt-4 space-y-4 border-t pt-4 border-gray-600">
                              {/* Furniture Measurements */}
                              {furniture && (
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <Ruler className="w-4 h-4 inline mr-2" />Furniture Details & Measurements
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.type', 'Type')}</label>
                                      <select
                                        value={furniture.type}
                                        onChange={(e) => updateFurnitureIntake(furniture.id, 'type', e.target.value)}
                                        className={`${selectClass} w-full text-sm`}
                                      >
                                        <option value="">{t('tools.upholstery.selectType', 'Select Type')}</option>
                                        {FURNITURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.brand', 'Brand')}</label>
                                      <input
                                        type="text"
                                        value={furniture.brand}
                                        onChange={(e) => updateFurnitureIntake(furniture.id, 'brand', e.target.value)}
                                        placeholder={t('tools.upholstery.brandName', 'Brand name')}
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.condition', 'Condition')}</label>
                                      <select
                                        value={furniture.condition}
                                        onChange={(e) => updateFurnitureIntake(furniture.id, 'condition', e.target.value)}
                                        className={`${selectClass} w-full text-sm`}
                                      >
                                        {FURNITURE_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.dateReceived', 'Date Received')}</label>
                                      <input
                                        type="date"
                                        value={furniture.dateReceived}
                                        onChange={(e) => updateFurnitureIntake(furniture.id, 'dateReceived', e.target.value)}
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.width', 'Width')}</label>
                                      <input
                                        type="text"
                                        value={furniture.measurements.width}
                                        onChange={(e) => updateMeasurement(furniture.id, 'width', e.target.value)}
                                        placeholder='e.g., 72"'
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.height', 'Height')}</label>
                                      <input
                                        type="text"
                                        value={furniture.measurements.height}
                                        onChange={(e) => updateMeasurement(furniture.id, 'height', e.target.value)}
                                        placeholder='e.g., 32"'
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.depth', 'Depth')}</label>
                                      <input
                                        type="text"
                                        value={furniture.measurements.depth}
                                        onChange={(e) => updateMeasurement(furniture.id, 'depth', e.target.value)}
                                        placeholder='e.g., 36"'
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.seatHeight', 'Seat Height')}</label>
                                      <input
                                        type="text"
                                        value={furniture.measurements.seatHeight}
                                        onChange={(e) => updateMeasurement(furniture.id, 'seatHeight', e.target.value)}
                                        placeholder='e.g., 18"'
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                    <div>
                                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.armHeight', 'Arm Height')}</label>
                                      <input
                                        type="text"
                                        value={furniture.measurements.armHeight}
                                        onChange={(e) => updateMeasurement(furniture.id, 'armHeight', e.target.value)}
                                        placeholder='e.g., 24"'
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.specialInstructions', 'Special Instructions')}</label>
                                    <textarea
                                      value={furniture.specialInstructions}
                                      onChange={(e) => updateFurnitureIntake(furniture.id, 'specialInstructions', e.target.value)}
                                      placeholder={t('tools.upholstery.anySpecialNotesOrRequirements', 'Any special notes or requirements...')}
                                      rows={2}
                                      className={`${inputClass} text-sm resize-none`}
                                    />
                                  </div>

                                  {/* Before/After Photos Placeholder */}
                                  <div className="mt-3 grid grid-cols-2 gap-4">
                                    <div className={`p-4 border-2 border-dashed rounded-lg text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                                      <Camera className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.beforePhotos', 'Before Photos')}</p>
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {furniture.beforePhotos.length} photos
                                      </p>
                                    </div>
                                    <div className={`p-4 border-2 border-dashed rounded-lg text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                                      <Camera className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.afterPhotos', 'After Photos')}</p>
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {furniture.afterPhotos.length} photos
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Fabric Selection */}
                              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <Scissors className="w-4 h-4 inline mr-2" />Fabric Selection
                                  </h4>
                                  <button
                                    onClick={() => addFabricSelection(project.id)}
                                    className="flex items-center gap-1 text-sm text-[#0D9488] hover:underline"
                                  >
                                    <Plus className="w-4 h-4" />Add Fabric
                                  </button>
                                </div>
                                {fabricSelections.filter(f => f.projectId === project.id).map(fabric => (
                                  <div key={fabric.id} className={`p-3 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={fabric.isCOM}
                                          onChange={(e) => updateFabricSelection(fabric.id, 'isCOM', e.target.checked)}
                                          className="rounded text-[#0D9488]"
                                        />
                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                          {t('tools.upholstery.comCustomerOwnMaterial', 'COM (Customer Own Material)')}
                                        </span>
                                        {fabric.isCOM && (
                                          <label className="flex items-center gap-1 text-sm">
                                            <input
                                              type="checkbox"
                                              checked={fabric.comCustomerProvided}
                                              onChange={(e) => updateFabricSelection(fabric.id, 'comCustomerProvided', e.target.checked)}
                                              className="rounded text-[#0D9488]"
                                            />
                                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.upholstery.received', 'Received')}</span>
                                          </label>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => removeFabricSelection(fabric.id)}
                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                      <input
                                        type="text"
                                        value={fabric.fabricName}
                                        onChange={(e) => updateFabricSelection(fabric.id, 'fabricName', e.target.value)}
                                        placeholder={t('tools.upholstery.fabricName', 'Fabric Name')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <input
                                        type="text"
                                        value={fabric.fabricCode}
                                        onChange={(e) => updateFabricSelection(fabric.id, 'fabricCode', e.target.value)}
                                        placeholder={t('tools.upholstery.codeSku', 'Code/SKU')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <input
                                        type="text"
                                        value={fabric.supplier}
                                        onChange={(e) => updateFabricSelection(fabric.id, 'supplier', e.target.value)}
                                        placeholder={t('tools.upholstery.supplier', 'Supplier')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <input
                                        type="number"
                                        value={fabric.pricePerYard || ''}
                                        onChange={(e) => updateFabricSelection(fabric.id, 'pricePerYard', parseFloat(e.target.value) || 0)}
                                        placeholder={t('tools.upholstery.yard', '$/yard')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <input
                                        type="number"
                                        value={fabric.yardsNeeded || ''}
                                        onChange={(e) => updateFabricSelection(fabric.id, 'yardsNeeded', parseFloat(e.target.value) || 0)}
                                        placeholder={t('tools.upholstery.yards', 'Yards')}
                                        className={`${inputClass} text-sm`}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Estimate Builder */}
                              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <Calculator className="w-4 h-4 inline mr-2" />Estimate
                                  </h4>
                                  {!estimate && (
                                    <button
                                      onClick={() => createEstimate(project.id)}
                                      className="flex items-center gap-1 text-sm bg-[#0D9488] text-white px-3 py-1 rounded-lg hover:bg-[#0F766E]"
                                    >
                                      <Plus className="w-4 h-4" />Create Estimate
                                    </button>
                                  )}
                                </div>

                                {estimate && (
                                  <div className="space-y-3">
                                    <div className="flex gap-2 flex-wrap">
                                      <button
                                        onClick={() => addEstimateLineItem(estimate.id, 'labor')}
                                        className="text-xs px-2 py-1 border border-[#0D9488] text-[#0D9488] rounded hover:bg-[#0D9488]/10"
                                      >
                                        {t('tools.upholstery.labor', '+ Labor')}
                                      </button>
                                      <button
                                        onClick={() => addEstimateLineItem(estimate.id, 'materials')}
                                        className="text-xs px-2 py-1 border border-[#0D9488] text-[#0D9488] rounded hover:bg-[#0D9488]/10"
                                      >
                                        {t('tools.upholstery.materials', '+ Materials')}
                                      </button>
                                      <button
                                        onClick={() => addEstimateLineItem(estimate.id, 'fabric')}
                                        className="text-xs px-2 py-1 border border-[#0D9488] text-[#0D9488] rounded hover:bg-[#0D9488]/10"
                                      >
                                        {t('tools.upholstery.fabric', '+ Fabric')}
                                      </button>
                                      <button
                                        onClick={() => addEstimateLineItem(estimate.id, 'other')}
                                        className="text-xs px-2 py-1 border border-[#0D9488] text-[#0D9488] rounded hover:bg-[#0D9488]/10"
                                      >
                                        {t('tools.upholstery.other', '+ Other')}
                                      </button>
                                    </div>

                                    {estimate.lineItems.map(item => (
                                      <div key={item.id} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-xs px-2 py-0.5 rounded ${
                                            item.category === 'labor' ? 'bg-blue-500 text-white' :
                                            item.category === 'materials' ? 'bg-green-500 text-white' :
                                            item.category === 'fabric' ? 'bg-purple-500 text-white' :
                                            'bg-gray-500 text-white'
                                          }`}>
                                            {item.category}
                                          </span>
                                          <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateEstimateLineItem(estimate.id, item.id, 'description', e.target.value)}
                                            placeholder={t('tools.upholstery.description', 'Description')}
                                            className={`${inputClass} text-sm flex-1`}
                                          />
                                          <input
                                            type="number"
                                            value={item.quantity || ''}
                                            onChange={(e) => updateEstimateLineItem(estimate.id, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            placeholder={t('tools.upholstery.qty', 'Qty')}
                                            className={`${inputClass} text-sm w-20`}
                                          />
                                          <input
                                            type="number"
                                            value={item.unitPrice || ''}
                                            onChange={(e) => updateEstimateLineItem(estimate.id, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            placeholder={t('tools.upholstery.price', 'Price')}
                                            className={`${inputClass} text-sm w-24`}
                                          />
                                          <span className={`text-sm font-medium w-24 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                          </span>
                                          <button
                                            onClick={() => removeEstimateLineItem(estimate.id, item.id)}
                                            className="p-1 text-red-500"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.discount', 'Discount %')}</label>
                                        <input
                                          type="number"
                                          value={estimate.discount || ''}
                                          onChange={(e) => updateEstimate(estimate.id, 'discount', parseFloat(e.target.value) || 0)}
                                          placeholder="0"
                                          className={`${inputClass} text-sm`}
                                        />
                                      </div>
                                      <div>
                                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.taxRate', 'Tax Rate %')}</label>
                                        <input
                                          type="number"
                                          value={estimate.taxRate || ''}
                                          onChange={(e) => updateEstimate(estimate.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                          placeholder="0"
                                          className={`${inputClass} text-sm`}
                                        />
                                      </div>
                                    </div>

                                    {estimateTotals && (
                                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex justify-between">
                                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.upholstery.subtotal', 'Subtotal:')}</span>
                                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(estimateTotals.subtotal)}</span>
                                          </div>
                                          {estimate.discount > 0 && (
                                            <div className="flex justify-between text-green-500">
                                              <span>Discount ({estimate.discount}%):</span>
                                              <span>-{formatCurrency(estimateTotals.discountAmount)}</span>
                                            </div>
                                          )}
                                          {estimate.taxRate > 0 && (
                                            <div className="flex justify-between">
                                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tax ({estimate.taxRate}%):</span>
                                              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(estimateTotals.taxAmount)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-600">
                                            <span className="text-[#0D9488]">{t('tools.upholstery.total', 'Total:')}</span>
                                            <span className="text-[#0D9488]">{formatCurrency(estimateTotals.total)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <select
                                        value={estimate.status}
                                        onChange={(e) => updateEstimate(estimate.id, 'status', e.target.value)}
                                        className={`${selectClass} text-sm`}
                                      >
                                        <option value="draft">{t('tools.upholstery.draft', 'Draft')}</option>
                                        <option value="sent">{t('tools.upholstery.sent', 'Sent')}</option>
                                        <option value="approved">{t('tools.upholstery.approved', 'Approved')}</option>
                                        <option value="declined">{t('tools.upholstery.declined', 'Declined')}</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Work Progress Tracking */}
                              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <Layers className="w-4 h-4 inline mr-2" />Work Progress
                                  </h4>
                                  <button
                                    onClick={() => addWorkProgress(project.id)}
                                    className="flex items-center gap-1 text-sm text-[#0D9488] hover:underline"
                                  >
                                    <Plus className="w-4 h-4" />Add Progress
                                  </button>
                                </div>
                                {workProgress.filter(w => w.projectId === project.id).map(progress => (
                                  <div key={progress.id} className={`p-2 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                                      <select
                                        value={progress.stage}
                                        onChange={(e) => updateWorkProgress(progress.id, 'stage', e.target.value)}
                                        className={`${selectClass} text-sm`}
                                      >
                                        <option value="">{t('tools.upholstery.selectStage', 'Select Stage')}</option>
                                        {WORK_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                      <input
                                        type="date"
                                        value={progress.completedDate}
                                        onChange={(e) => updateWorkProgress(progress.id, 'completedDate', e.target.value)}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <input
                                        type="text"
                                        value={progress.completedBy}
                                        onChange={(e) => updateWorkProgress(progress.id, 'completedBy', e.target.value)}
                                        placeholder={t('tools.upholstery.completedBy', 'Completed by')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <button
                                        onClick={() => removeWorkProgress(progress.id)}
                                        className="p-1 text-red-500 justify-self-end"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Subcontractor Assignments */}
                              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <Users className="w-4 h-4 inline mr-2" />Subcontractor Assignments
                                  </h4>
                                  <button
                                    onClick={() => addSubcontractorAssignment(project.id)}
                                    className="flex items-center gap-1 text-sm text-[#0D9488] hover:underline"
                                  >
                                    <Plus className="w-4 h-4" />Assign
                                  </button>
                                </div>
                                {subcontractorAssignments.filter(a => a.projectId === project.id).map(assignment => (
                                  <div key={assignment.id} className={`p-2 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                                      <select
                                        value={assignment.subcontractorId}
                                        onChange={(e) => updateSubcontractorAssignment(assignment.id, 'subcontractorId', e.target.value)}
                                        className={`${selectClass} text-sm`}
                                      >
                                        <option value="">{t('tools.upholstery.selectSubcontractor', 'Select Subcontractor')}</option>
                                        {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                      </select>
                                      <input
                                        type="text"
                                        value={assignment.task}
                                        onChange={(e) => updateSubcontractorAssignment(assignment.id, 'task', e.target.value)}
                                        placeholder={t('tools.upholstery.task', 'Task')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <input
                                        type="number"
                                        value={assignment.estimatedCost || ''}
                                        onChange={(e) => updateSubcontractorAssignment(assignment.id, 'estimatedCost', parseFloat(e.target.value) || 0)}
                                        placeholder={t('tools.upholstery.estCost', 'Est. Cost')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <select
                                        value={assignment.status}
                                        onChange={(e) => updateSubcontractorAssignment(assignment.id, 'status', e.target.value)}
                                        className={`${selectClass} text-sm`}
                                      >
                                        <option value="assigned">{t('tools.upholstery.assigned', 'Assigned')}</option>
                                        <option value="in_progress">{t('tools.upholstery.inProgress', 'In Progress')}</option>
                                        <option value="completed">{t('tools.upholstery.completed', 'Completed')}</option>
                                        <option value="invoiced">{t('tools.upholstery.invoiced', 'Invoiced')}</option>
                                        <option value="paid">{t('tools.upholstery.paid', 'Paid')}</option>
                                      </select>
                                      <button
                                        onClick={() => removeSubcontractorAssignment(assignment.id)}
                                        className="p-1 text-red-500"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Payments */}
                              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <CreditCard className="w-4 h-4 inline mr-2" />Payments
                                  </h4>
                                  <button
                                    onClick={() => addPayment(project.id)}
                                    className="flex items-center gap-1 text-sm text-[#0D9488] hover:underline"
                                  >
                                    <Plus className="w-4 h-4" />Add Payment
                                  </button>
                                </div>
                                {payments.filter(p => p.projectId === project.id).map(payment => (
                                  <div key={payment.id} className={`p-2 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                                      <input
                                        type="date"
                                        value={payment.date}
                                        onChange={(e) => updatePayment(payment.id, 'date', e.target.value)}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <select
                                        value={payment.type}
                                        onChange={(e) => updatePayment(payment.id, 'type', e.target.value)}
                                        className={`${selectClass} text-sm`}
                                      >
                                        <option value="deposit">{t('tools.upholstery.deposit', 'Deposit')}</option>
                                        <option value="progress">{t('tools.upholstery.progress', 'Progress')}</option>
                                        <option value="final">{t('tools.upholstery.final', 'Final')}</option>
                                        <option value="refund">{t('tools.upholstery.refund', 'Refund')}</option>
                                      </select>
                                      <input
                                        type="number"
                                        value={payment.amount || ''}
                                        onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder={t('tools.upholstery.amount', 'Amount')}
                                        className={`${inputClass} text-sm`}
                                      />
                                      <select
                                        value={payment.method}
                                        onChange={(e) => updatePayment(payment.id, 'method', e.target.value)}
                                        className={`${selectClass} text-sm`}
                                      >
                                        <option value="cash">{t('tools.upholstery.cash', 'Cash')}</option>
                                        <option value="check">{t('tools.upholstery.check', 'Check')}</option>
                                        <option value="card">{t('tools.upholstery.card', 'Card')}</option>
                                        <option value="transfer">{t('tools.upholstery.transfer', 'Transfer')}</option>
                                      </select>
                                      <button
                                        onClick={() => removePayment(payment.id)}
                                        className="p-1 text-red-500"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className={`mt-2 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Total Paid: <span className="font-semibold text-[#0D9488]">{formatCurrency(totalPaid)}</span>
                                  {estimateTotals && (
                                    <span className="ml-4">
                                      Balance: <span className={`font-semibold ${estimateTotals.total - totalPaid > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                        {formatCurrency(estimateTotals.total - totalPaid)}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Project Actions */}
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => exportProjectData(project.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  {t('tools.upholstery.exportReport', 'Export Report')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Users className="w-5 h-5 inline mr-2" />Customer Directory
                </h3>
                <button
                  onClick={addCustomer}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.upholstery.addCustomer', 'Add Customer')}
                </button>
              </div>

              {customers.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.upholstery.noCustomersYetAddYour', 'No customers yet. Add your first customer to get started.')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customers.map(customer => (
                    <div key={customer.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {customer.name || 'New Customer'}
                        </span>
                        <button
                          onClick={() => removeCustomer(customer.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <User className="w-3 h-3 inline mr-1" />Name
                          </label>
                          <input
                            type="text"
                            value={customer.name}
                            onChange={(e) => updateCustomer(customer.id, 'name', e.target.value)}
                            placeholder={t('tools.upholstery.fullName', 'Full name')}
                            className={`${inputClass} text-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Phone className="w-3 h-3 inline mr-1" />Phone
                          </label>
                          <input
                            type="tel"
                            value={customer.phone}
                            onChange={(e) => updateCustomer(customer.id, 'phone', e.target.value)}
                            placeholder={t('tools.upholstery.phoneNumber', 'Phone number')}
                            className={`${inputClass} text-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Mail className="w-3 h-3 inline mr-1" />Email
                          </label>
                          <input
                            type="email"
                            value={customer.email}
                            onChange={(e) => updateCustomer(customer.id, 'email', e.target.value)}
                            placeholder={t('tools.upholstery.emailAddress', 'Email address')}
                            className={`${inputClass} text-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <MapPin className="w-3 h-3 inline mr-1" />Address
                          </label>
                          <input
                            type="text"
                            value={customer.address}
                            onChange={(e) => updateCustomer(customer.id, 'address', e.target.value)}
                            placeholder={t('tools.upholstery.address2', 'Address')}
                            className={`${inputClass} text-sm`}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.notes', 'Notes')}</label>
                        <textarea
                          value={customer.notes}
                          onChange={(e) => updateCustomer(customer.id, 'notes', e.target.value)}
                          placeholder={t('tools.upholstery.additionalNotes', 'Additional notes...')}
                          rows={2}
                          className={`${inputClass} text-sm resize-none`}
                        />
                      </div>
                      <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {projects.filter(p => p.customerId === customer.id).length} projects
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Fabric Inventory */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-0">
                <SectionHeader title={t('tools.upholstery.fabricInventory', 'Fabric Inventory')} icon={Scissors} section="fabric" count={fabricInventory.length} />
                {expandedSections.fabric && (
                  <div className="p-4 space-y-4">
                    {fabricInventory.map(item => (
                      <div key={item.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name || 'New Fabric'}
                            {item.yardsInStock <= item.reorderLevel && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">{t('tools.upholstery.lowStock', 'Low Stock')}</span>
                            )}
                          </span>
                          <button
                            onClick={() => removeFabricInventoryItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <input type="text" value={item.name} onChange={(e) => updateFabricInventoryItem(item.id, 'name', e.target.value)} placeholder={t('tools.upholstery.fabricName2', 'Fabric Name')} className={`${inputClass} text-sm`} />
                          <input type="text" value={item.code} onChange={(e) => updateFabricInventoryItem(item.id, 'code', e.target.value)} placeholder={t('tools.upholstery.code', 'Code')} className={`${inputClass} text-sm`} />
                          <input type="text" value={item.supplier} onChange={(e) => updateFabricInventoryItem(item.id, 'supplier', e.target.value)} placeholder={t('tools.upholstery.supplier2', 'Supplier')} className={`${inputClass} text-sm`} />
                          <input type="number" value={item.pricePerYard || ''} onChange={(e) => updateFabricInventoryItem(item.id, 'pricePerYard', parseFloat(e.target.value) || 0)} placeholder={t('tools.upholstery.yard2', '$/yard')} className={`${inputClass} text-sm`} />
                          <input type="number" value={item.yardsInStock || ''} onChange={(e) => updateFabricInventoryItem(item.id, 'yardsInStock', parseFloat(e.target.value) || 0)} placeholder={t('tools.upholstery.yardsInStock', 'Yards in Stock')} className={`${inputClass} text-sm`} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                          <input type="text" value={item.color} onChange={(e) => updateFabricInventoryItem(item.id, 'color', e.target.value)} placeholder={t('tools.upholstery.color', 'Color')} className={`${inputClass} text-sm`} />
                          <input type="text" value={item.material} onChange={(e) => updateFabricInventoryItem(item.id, 'material', e.target.value)} placeholder={t('tools.upholstery.material', 'Material')} className={`${inputClass} text-sm`} />
                          <input type="text" value={item.pattern} onChange={(e) => updateFabricInventoryItem(item.id, 'pattern', e.target.value)} placeholder={t('tools.upholstery.pattern', 'Pattern')} className={`${inputClass} text-sm`} />
                          <input type="number" value={item.reorderLevel || ''} onChange={(e) => updateFabricInventoryItem(item.id, 'reorderLevel', parseFloat(e.target.value) || 0)} placeholder={t('tools.upholstery.reorderLevel', 'Reorder Level')} className={`${inputClass} text-sm`} />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFabricInventoryItem}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                    >
                      <Plus className="w-4 h-4" />Add Fabric to Inventory
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Foam/Padding Inventory */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-0">
                <SectionHeader title={t('tools.upholstery.foamPaddingInventory', 'Foam & Padding Inventory')} icon={Box} section="foam" count={foamInventory.length} />
                {expandedSections.foam && (
                  <div className="p-4 space-y-4">
                    {foamInventory.map(item => (
                      <div key={item.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name || 'New Item'}
                            {item.quantity <= item.reorderLevel && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">{t('tools.upholstery.lowStock2', 'Low Stock')}</span>
                            )}
                          </span>
                          <button
                            onClick={() => removeFoamInventoryItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <input type="text" value={item.name} onChange={(e) => updateFoamInventoryItem(item.id, 'name', e.target.value)} placeholder={t('tools.upholstery.name', 'Name')} className={`${inputClass} text-sm`} />
                          <select value={item.type} onChange={(e) => updateFoamInventoryItem(item.id, 'type', e.target.value)} className={`${selectClass} w-full text-sm`}>
                            {FOAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input type="text" value={item.thickness} onChange={(e) => updateFoamInventoryItem(item.id, 'thickness', e.target.value)} placeholder='Thickness (e.g., 4")' className={`${inputClass} text-sm`} />
                          <input type="number" value={item.quantity || ''} onChange={(e) => updateFoamInventoryItem(item.id, 'quantity', parseInt(e.target.value) || 0)} placeholder={t('tools.upholstery.qty2', 'Qty')} className={`${inputClass} text-sm`} />
                          <input type="number" value={item.unitPrice || ''} onChange={(e) => updateFoamInventoryItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder={t('tools.upholstery.unitPrice', 'Unit Price')} className={`${inputClass} text-sm`} />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFoamInventoryItem}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                    >
                      <Plus className="w-4 h-4" />Add Foam/Padding
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Truck className="w-5 h-5 inline mr-2" />Pickup & Delivery Schedule
                </h3>
              </div>

              {scheduleEntries.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.upholstery.noPickupsOrDeliveriesScheduled', 'No pickups or deliveries scheduled. Add from project details.')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduleEntries.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map(entry => {
                    const project = projects.find(p => p.id === entry.projectId);
                    return (
                      <div key={entry.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${entry.type === 'pickup' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                              {entry.type.toUpperCase()}
                            </span>
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {getCustomerName(project?.customerId || '')} - {getFurnitureType(project?.furnitureId || '')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={entry.status}
                              onChange={(e) => updateScheduleEntry(entry.id, 'status', e.target.value)}
                              className={`${selectClass} text-sm`}
                            >
                              <option value="scheduled">{t('tools.upholstery.scheduled', 'Scheduled')}</option>
                              <option value="confirmed">{t('tools.upholstery.confirmed', 'Confirmed')}</option>
                              <option value="in_transit">{t('tools.upholstery.inTransit', 'In Transit')}</option>
                              <option value="completed">{t('tools.upholstery.completed2', 'Completed')}</option>
                              <option value="cancelled">{t('tools.upholstery.cancelled', 'Cancelled')}</option>
                            </select>
                            <button
                              onClick={() => removeScheduleEntry(entry.id)}
                              className="p-1 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.date', 'Date')}</label>
                            <input
                              type="date"
                              value={entry.scheduledDate}
                              onChange={(e) => updateScheduleEntry(entry.id, 'scheduledDate', e.target.value)}
                              className={`${inputClass} text-sm`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.time', 'Time')}</label>
                            <input
                              type="time"
                              value={entry.scheduledTime}
                              onChange={(e) => updateScheduleEntry(entry.id, 'scheduledTime', e.target.value)}
                              className={`${inputClass} text-sm`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.contact', 'Contact')}</label>
                            <input
                              type="text"
                              value={entry.contactName}
                              onChange={(e) => updateScheduleEntry(entry.id, 'contactName', e.target.value)}
                              placeholder={t('tools.upholstery.contactName', 'Contact name')}
                              className={`${inputClass} text-sm`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.phone', 'Phone')}</label>
                            <input
                              type="tel"
                              value={entry.contactPhone}
                              onChange={(e) => updateScheduleEntry(entry.id, 'contactPhone', e.target.value)}
                              placeholder={t('tools.upholstery.phone2', 'Phone')}
                              className={`${inputClass} text-sm`}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.upholstery.address', 'Address')}</label>
                          <input
                            type="text"
                            value={entry.address}
                            onChange={(e) => updateScheduleEntry(entry.id, 'address', e.target.value)}
                            placeholder={t('tools.upholstery.fullAddress', 'Full address')}
                            className={`${inputClass} text-sm`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subcontractors Tab */}
        {activeTab === 'subcontractors' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Users className="w-5 h-5 inline mr-2" />Subcontractors
                </h3>
                <button
                  onClick={addSubcontractor}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />Add Subcontractor
                </button>
              </div>

              {subcontractors.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.upholstery.noSubcontractorsAddedYet', 'No subcontractors added yet.')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subcontractors.map(sub => (
                    <div key={sub.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {sub.name || 'New Subcontractor'}
                        </span>
                        <button
                          onClick={() => removeSubcontractor(sub.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input type="text" value={sub.name} onChange={(e) => updateSubcontractor(sub.id, 'name', e.target.value)} placeholder={t('tools.upholstery.name2', 'Name')} className={`${inputClass} text-sm`} />
                        <input type="text" value={sub.specialty} onChange={(e) => updateSubcontractor(sub.id, 'specialty', e.target.value)} placeholder={t('tools.upholstery.specialty', 'Specialty')} className={`${inputClass} text-sm`} />
                        <input type="tel" value={sub.phone} onChange={(e) => updateSubcontractor(sub.id, 'phone', e.target.value)} placeholder={t('tools.upholstery.phone3', 'Phone')} className={`${inputClass} text-sm`} />
                        <input type="email" value={sub.email} onChange={(e) => updateSubcontractor(sub.id, 'email', e.target.value)} placeholder={t('tools.upholstery.email', 'Email')} className={`${inputClass} text-sm`} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        <input type="number" value={sub.rate || ''} onChange={(e) => updateSubcontractor(sub.id, 'rate', parseFloat(e.target.value) || 0)} placeholder={t('tools.upholstery.rate', 'Rate')} className={`${inputClass} text-sm`} />
                        <select value={sub.rateType} onChange={(e) => updateSubcontractor(sub.id, 'rateType', e.target.value)} className={`${selectClass} w-full text-sm`}>
                          <option value="hourly">{t('tools.upholstery.hourly', 'Hourly')}</option>
                          <option value="per_project">{t('tools.upholstery.perProject', 'Per Project')}</option>
                          <option value="per_piece">{t('tools.upholstery.perPiece', 'Per Piece')}</option>
                        </select>
                        <input type="text" value={sub.notes} onChange={(e) => updateSubcontractor(sub.id, 'notes', e.target.value)} placeholder={t('tools.upholstery.notes2', 'Notes')} className={`${inputClass} text-sm`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.upholstery.aboutUpholsteryShopManager', 'About Upholstery Shop Manager')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                A comprehensive tool for managing your upholstery business. Track customers, projects, estimates,
                inventory, scheduling, and payments all in one place.
              </p>
              <p>
                <strong>{t('tools.upholstery.features', 'Features:')}</strong> Customer management, furniture intake with measurements, fabric selection
                (including COM tracking), estimate builder, project status tracking, fabric and foam inventory,
                pickup/delivery scheduling, work progress tracking, subcontractor coordination, and complete
                payment tracking with deposits.
              </p>
              <p className="text-xs italic">
                {t('tools.upholstery.noteAllDataIsAutomatically', 'Note: All data is automatically saved to your browser\'s local storage.')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-red-500 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default UpholsteryTool;
