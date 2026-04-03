'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
  Car,
  Building,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  DollarSign,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
  Clock,
  Eye,
  FileText,
  Tag,
  Gauge,
  BarChart3,
  Settings,
  Filter,
  Camera,
  Phone,
  Mail,
  Truck,
  Key,
  Loader2,
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: number;
  transmission: 'automatic' | 'manual' | 'cvt';
  drivetrain: 'fwd' | 'rwd' | 'awd' | '4wd';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid';
  engineSize: string;
  cylinders: number;
  doors: number;
  seats: number;
  condition: 'new' | 'certified-pre-owned' | 'used';
  status: 'available' | 'sold' | 'pending' | 'on-hold' | 'in-transit' | 'service';
  purchasePrice: number;
  invoicePrice: number;
  msrp: number;
  listPrice: number;
  internetPrice: number;
  features: string[];
  options: string[];
  location: string;
  lotNumber: string;
  daysOnLot: number;
  dateReceived: string;
  dateSold: string;
  carfaxAvailable: boolean;
  hasAccident: boolean;
  ownersCount: number;
  titleStatus: 'clean' | 'salvage' | 'rebuilt' | 'lemon' | 'flood';
  notes: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Lead {
  id: string;
  vehicleId: string;
  customerName: string;
  email: string;
  phone: string;
  source: 'walk-in' | 'website' | 'phone' | 'referral' | 'social-media' | 'third-party';
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';
  assignedTo: string;
  tradeInVehicle: string;
  tradeInValue: number;
  financingNeeded: boolean;
  downPayment: number;
  monthlyBudget: number;
  notes: string;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Sale {
  id: string;
  vehicleId: string;
  leadId: string;
  customerName: string;
  salePrice: number;
  tradeInValue: number;
  downPayment: number;
  financedAmount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  documentFee: number;
  taxAmount: number;
  totalPrice: number;
  salesperson: string;
  financeManager: string;
  saleDate: string;
  deliveryDate: string;
  warrantyPackage: string;
  addOns: string[];
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

interface Appraisal {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue: number;
  finalOffer: number;
  status: 'pending' | 'offered' | 'accepted' | 'declined';
  appraiser: string;
  notes: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

type TabType = 'inventory' | 'leads' | 'sales' | 'appraisals' | 'analytics';

// Tool ID for data persistence
const TOOL_ID = 'dealer-inventory';

const BODY_STYLES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Convertible', 'Van', 'Wagon'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
const VEHICLE_CONDITIONS = ['New', 'Certified Pre-Owned', 'Used'];

// Column configurations for export
const vehicleColumns: ColumnConfig[] = [
  { key: 'stockNumber', header: 'Stock #', type: 'string' },
  { key: 'vin', header: 'VIN', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'make', header: 'Make', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'trim', header: 'Trim', type: 'string' },
  { key: 'exteriorColor', header: 'Exterior Color', type: 'string' },
  { key: 'mileage', header: 'Mileage', type: 'number' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'listPrice', header: 'List Price', type: 'currency' },
  { key: 'daysOnLot', header: 'Days on Lot', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
];

const leadColumns: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'source', header: 'Source', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'followUpDate', header: 'Follow Up', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const saleColumns: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'vehicleInfo', header: 'Vehicle', type: 'string' },
  { key: 'salePrice', header: 'Sale Price', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'salesperson', header: 'Salesperson', type: 'string' },
  { key: 'saleDate', header: 'Sale Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

interface DealerInventoryToolProps {
  uiConfig?: UIConfig;
}

export const DealerInventoryTool: React.FC<DealerInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use useToolData hook for each data type with backend sync
  const vehiclesData = useToolData<Vehicle>(
    `${TOOL_ID}-vehicles`,
    [],
    vehicleColumns,
    { autoSave: true }
  );

  const leadsData = useToolData<Lead>(
    `${TOOL_ID}-leads`,
    [],
    leadColumns,
    { autoSave: true }
  );

  const salesData = useToolData<Sale>(
    `${TOOL_ID}-sales`,
    [],
    saleColumns,
    { autoSave: true }
  );

  const appraisalsData = useToolData<Appraisal>(
    `${TOOL_ID}-appraisals`,
    [],
    [],
    { autoSave: true }
  );

  // Extract data from hooks
  const vehicles = vehiclesData.data;
  const leads = leadsData.data;
  const sales = salesData.data;
  const appraisals = appraisalsData.data;

  // Combined sync status
  const isLoading = vehiclesData.isLoading || leadsData.isLoading || salesData.isLoading;
  const isSaving = vehiclesData.isSaving || leadsData.isSaving || salesData.isSaving;
  const isSynced = vehiclesData.isSynced && leadsData.isSynced && salesData.isSynced;
  const lastSaved = vehiclesData.lastSaved;
  const syncError = vehiclesData.syncError || leadsData.syncError || salesData.syncError;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [makeFilter, setMakeFilter] = useState('all');

  // Form states
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showAppraisalForm, setShowAppraisalForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    stockNumber: '',
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    bodyStyle: 'Sedan',
    exteriorColor: '',
    interiorColor: '',
    mileage: 0,
    transmission: 'automatic' as Vehicle['transmission'],
    drivetrain: 'fwd' as Vehicle['drivetrain'],
    fuelType: 'gasoline' as Vehicle['fuelType'],
    engineSize: '',
    cylinders: 4,
    doors: 4,
    seats: 5,
    condition: 'used' as Vehicle['condition'],
    status: 'available' as Vehicle['status'],
    purchasePrice: 0,
    invoicePrice: 0,
    msrp: 0,
    listPrice: 0,
    internetPrice: 0,
    features: '',
    options: '',
    location: '',
    lotNumber: '',
    carfaxAvailable: false,
    hasAccident: false,
    ownersCount: 1,
    titleStatus: 'clean' as Vehicle['titleStatus'],
    notes: '',
  });

  // Lead form
  const [leadForm, setLeadForm] = useState({
    vehicleId: '',
    customerName: '',
    email: '',
    phone: '',
    source: 'website' as Lead['source'],
    assignedTo: '',
    tradeInVehicle: '',
    tradeInValue: 0,
    financingNeeded: true,
    downPayment: 0,
    monthlyBudget: 0,
    notes: '',
    followUpDate: '',
  });

  // Appraisal form
  const [appraisalForm, setAppraisalForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    mileage: 0,
    condition: 'good' as Appraisal['condition'],
    estimatedValue: 0,
    appraiser: '',
    notes: '',
  });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery edit mode
      if (params.isEditFromGallery) {
        if (params.vehicleForm) {
          setVehicleForm(params.vehicleForm);
        } else {
          if (params.vin) setVehicleForm((prev) => ({ ...prev, vin: String(params.vin) }));
          if (params.make) setVehicleForm((prev) => ({ ...prev, make: String(params.make) }));
          if (params.model) setVehicleForm((prev) => ({ ...prev, model: String(params.model) }));
          if (params.year) setVehicleForm((prev) => ({ ...prev, year: Number(params.year) }));
          if (params.trim) setVehicleForm((prev) => ({ ...prev, trim: String(params.trim) }));
          if (params.bodyStyle) setVehicleForm((prev) => ({ ...prev, bodyStyle: String(params.bodyStyle) }));
          if (params.exteriorColor) setVehicleForm((prev) => ({ ...prev, exteriorColor: String(params.exteriorColor) }));
          if (params.mileage) setVehicleForm((prev) => ({ ...prev, mileage: Number(params.mileage) }));
          if (params.condition) setVehicleForm((prev) => ({ ...prev, condition: params.condition }));
          if (params.listPrice) setVehicleForm((prev) => ({ ...prev, listPrice: Number(params.listPrice) }));
          if (params.location) setVehicleForm((prev) => ({ ...prev, location: String(params.location) }));
        }
        if (params.leadForm) setLeadForm(params.leadForm);
        if (params.appraisalForm) setAppraisalForm(params.appraisalForm);
        if (params.activeTab) setActiveTab(params.activeTab);
        setShowVehicleForm(true);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        if (params.vin) {
          setVehicleForm((prev) => ({ ...prev, vin: String(params.vin) }));
          setIsPrefilled(true);
        }
        if (params.make) {
          setVehicleForm((prev) => ({ ...prev, make: String(params.make) }));
          setIsPrefilled(true);
        }
        if (params.model) {
          setVehicleForm((prev) => ({ ...prev, model: String(params.model) }));
          setIsPrefilled(true);
        }
        if (params.year) {
          setVehicleForm((prev) => ({ ...prev, year: Number(params.year) }));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Force sync all data
  const forceSync = useCallback(async () => {
    const results = await Promise.all([
      vehiclesData.forceSync(),
      leadsData.forceSync(),
      salesData.forceSync(),
      appraisalsData.forceSync(),
    ]);
    return results.every(Boolean);
  }, [vehiclesData, leadsData, salesData, appraisalsData]);

  // Generate stock number
  const generateStockNumber = () => {
    const prefix = 'STK';
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${prefix}${random}`;
  };

  // Calculate days on lot
  const calculateDaysOnLot = (dateReceived: string) => {
    const received = new Date(dateReceived);
    const today = new Date();
    return Math.floor((today.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Vehicle handlers
  const handleSaveVehicle = () => {
    if (!vehicleForm.vin.trim() || !vehicleForm.make.trim()) return;

    const now = new Date().toISOString();
    const dateReceived = editingVehicle?.dateReceived || now.split('T')[0];
    const newVehicle: Vehicle = {
      id: editingVehicle?.id || Date.now().toString(),
      ...vehicleForm,
      stockNumber: vehicleForm.stockNumber || generateStockNumber(),
      features: vehicleForm.features.split(',').map((s) => s.trim()).filter(Boolean),
      options: vehicleForm.options.split(',').map((s) => s.trim()).filter(Boolean),
      daysOnLot: calculateDaysOnLot(dateReceived),
      dateReceived,
      dateSold: '',
      images: editingVehicle?.images || [],
      createdAt: editingVehicle?.createdAt || now,
      updatedAt: now,
    };

    if (editingVehicle) {
      vehiclesData.updateItem(editingVehicle.id, newVehicle);
    } else {
      vehiclesData.addItem(newVehicle);
    }

    // Call onSaveCallback if provided (for gallery edit mode)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    resetVehicleForm();
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      stockNumber: '',
      vin: '',
      year: new Date().getFullYear(),
      make: '',
      model: '',
      trim: '',
      bodyStyle: 'Sedan',
      exteriorColor: '',
      interiorColor: '',
      mileage: 0,
      transmission: 'automatic',
      drivetrain: 'fwd',
      fuelType: 'gasoline',
      engineSize: '',
      cylinders: 4,
      doors: 4,
      seats: 5,
      condition: 'used',
      status: 'available',
      purchasePrice: 0,
      invoicePrice: 0,
      msrp: 0,
      listPrice: 0,
      internetPrice: 0,
      features: '',
      options: '',
      location: '',
      lotNumber: '',
      carfaxAvailable: false,
      hasAccident: false,
      ownersCount: 1,
      titleStatus: 'clean',
      notes: '',
    });
    setEditingVehicle(null);
    setShowVehicleForm(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleForm({
      stockNumber: vehicle.stockNumber,
      vin: vehicle.vin,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      bodyStyle: vehicle.bodyStyle,
      exteriorColor: vehicle.exteriorColor,
      interiorColor: vehicle.interiorColor,
      mileage: vehicle.mileage,
      transmission: vehicle.transmission,
      drivetrain: vehicle.drivetrain,
      fuelType: vehicle.fuelType,
      engineSize: vehicle.engineSize,
      cylinders: vehicle.cylinders,
      doors: vehicle.doors,
      seats: vehicle.seats,
      condition: vehicle.condition,
      status: vehicle.status,
      purchasePrice: vehicle.purchasePrice,
      invoicePrice: vehicle.invoicePrice,
      msrp: vehicle.msrp,
      listPrice: vehicle.listPrice,
      internetPrice: vehicle.internetPrice,
      features: vehicle.features.join(', '),
      options: vehicle.options.join(', '),
      location: vehicle.location,
      lotNumber: vehicle.lotNumber,
      carfaxAvailable: vehicle.carfaxAvailable,
      hasAccident: vehicle.hasAccident,
      ownersCount: vehicle.ownersCount,
      titleStatus: vehicle.titleStatus,
      notes: vehicle.notes,
    });
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Delete this vehicle from inventory?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      vehiclesData.deleteItem(id);
    }
  };

  // Lead handlers
  const handleSaveLead = () => {
    if (!leadForm.customerName.trim()) return;

    const now = new Date().toISOString();
    const newLead: Lead = {
      id: editingLead?.id || Date.now().toString(),
      ...leadForm,
      status: editingLead?.status || 'new',
      createdAt: editingLead?.createdAt || now,
      updatedAt: now,
    };

    if (editingLead) {
      leadsData.updateItem(editingLead.id, newLead);
    } else {
      leadsData.addItem(newLead);
    }

    resetLeadForm();
  };

  const resetLeadForm = () => {
    setLeadForm({
      vehicleId: '',
      customerName: '',
      email: '',
      phone: '',
      source: 'website',
      assignedTo: '',
      tradeInVehicle: '',
      tradeInValue: 0,
      financingNeeded: true,
      downPayment: 0,
      monthlyBudget: 0,
      notes: '',
      followUpDate: '',
    });
    setEditingLead(null);
    setShowLeadForm(false);
  };

  const handleEditLead = (lead: Lead) => {
    setLeadForm({
      vehicleId: lead.vehicleId,
      customerName: lead.customerName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      assignedTo: lead.assignedTo,
      tradeInVehicle: lead.tradeInVehicle,
      tradeInValue: lead.tradeInValue,
      financingNeeded: lead.financingNeeded,
      downPayment: lead.downPayment,
      monthlyBudget: lead.monthlyBudget,
      notes: lead.notes,
      followUpDate: lead.followUpDate,
    });
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleDeleteLead = (id: string) => {
    leadsData.deleteItem(id);
  };

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      leadsData.updateItem(leadId, { ...lead, status, updatedAt: new Date().toISOString() });
    }
  };

  // Appraisal handlers
  const handleSaveAppraisal = () => {
    if (!appraisalForm.customerName.trim()) return;

    const now = new Date().toISOString();
    const newAppraisal: Appraisal = {
      id: Date.now().toString(),
      ...appraisalForm,
      finalOffer: 0,
      status: 'pending',
      images: [],
      createdAt: now,
      updatedAt: now,
    };

    appraisalsData.addItem(newAppraisal);

    setAppraisalForm({
      customerName: '',
      phone: '',
      email: '',
      year: new Date().getFullYear(),
      make: '',
      model: '',
      trim: '',
      mileage: 0,
      condition: 'good',
      estimatedValue: 0,
      appraiser: '',
      notes: '',
    });
    setShowAppraisalForm(false);
  };

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        searchTerm === '' ||
        vehicle.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesCondition = conditionFilter === 'all' || vehicle.condition === conditionFilter;
      const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;

      return matchesSearch && matchesStatus && matchesCondition && matchesMake;
    });
  }, [vehicles, searchTerm, statusFilter, conditionFilter, makeFilter]);

  // Get unique makes for filter
  const uniqueMakes = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.make))].filter(Boolean).sort();
  }, [vehicles]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalVehicles = vehicles.length;
    const availableCount = vehicles.filter((v) => v.status === 'available').length;
    const soldCount = vehicles.filter((v) => v.status === 'sold').length;
    const pendingCount = vehicles.filter((v) => v.status === 'pending').length;

    const totalInventoryValue = vehicles
      .filter((v) => v.status === 'available')
      .reduce((sum, v) => sum + v.listPrice, 0);

    const avgDaysOnLot = availableCount > 0
      ? vehicles.filter((v) => v.status === 'available').reduce((sum, v) => sum + v.daysOnLot, 0) / availableCount
      : 0;

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const avgSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

    const vehiclesByCondition = VEHICLE_CONDITIONS.map((cond) => ({
      name: cond,
      count: vehicles.filter((v) => v.condition === cond.toLowerCase().replace(' ', '-')).length,
    }));

    const agedInventory = vehicles.filter((v) => v.status === 'available' && v.daysOnLot > 60).length;

    return {
      totalVehicles,
      availableCount,
      soldCount,
      pendingCount,
      totalInventoryValue,
      avgDaysOnLot,
      totalLeads,
      newLeads,
      qualifiedLeads,
      totalSales,
      totalRevenue,
      avgSalePrice,
      vehiclesByCondition,
      agedInventory,
    };
  }, [vehicles, leads, sales]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'sold': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'on-hold': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'in-transit': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'service': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLeadStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'contacted': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'qualified': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'negotiating': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'won': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'lost': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.dealerInventory.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dealerInventory.dealerInventory', 'Dealer Inventory')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.dealerInventory.manageVehicleInventoryLeadsAnd', 'Manage vehicle inventory, leads, and sales')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="dealer-inventory" toolName="Dealer Inventory" />

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
                onExportCSV={() => exportToCSV(filteredVehicles, vehicleColumns, { filename: 'dealer-inventory' })}
                onExportExcel={() => exportToExcel(filteredVehicles, vehicleColumns, { filename: 'dealer-inventory' })}
                onExportJSON={() => exportToJSON(filteredVehicles, { filename: 'dealer-inventory' })}
                onExportPDF={async () =>
                  await exportToPDF(filteredVehicles, vehicleColumns, {
                    filename: 'dealer-inventory',
                    title: 'Dealer Vehicle Inventory',
                    subtitle: `${filteredVehicles.length} vehicles | Value: ${formatCurrency(analytics.totalInventoryValue)}`,
                  })
                }
                onPrint={() => printData(filteredVehicles, vehicleColumns, { title: 'Dealer Inventory' })}
                onCopyToClipboard={async () => await copyUtil(filteredVehicles, vehicleColumns, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'inventory', label: 'Inventory', icon: <Car className="w-4 h-4" /> },
              { id: 'leads', label: 'Leads', icon: <Users className="w-4 h-4" /> },
              { id: 'sales', label: 'Sales', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'appraisals', label: 'Trade-Ins', icon: <Truck className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'leads' && analytics.newLeads > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {analytics.newLeads}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
            <Loader2 className={`w-8 h-8 animate-spin mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.loadingInventoryData', 'Loading inventory data...')}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          placeholder={t('tools.dealerInventory.searchByStockVinMake', 'Search by stock #, VIN, make, model...')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                        />
                      </div>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.dealerInventory.allStatus', 'All Status')}</option>
                      <option value="available">{t('tools.dealerInventory.available', 'Available')}</option>
                      <option value="sold">{t('tools.dealerInventory.sold', 'Sold')}</option>
                      <option value="pending">{t('tools.dealerInventory.pending', 'Pending')}</option>
                      <option value="on-hold">{t('tools.dealerInventory.onHold', 'On Hold')}</option>
                      <option value="in-transit">{t('tools.dealerInventory.inTransit', 'In Transit')}</option>
                      <option value="service">{t('tools.dealerInventory.inService', 'In Service')}</option>
                    </select>
                    <select
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.dealerInventory.allConditions', 'All Conditions')}</option>
                      <option value="new">{t('tools.dealerInventory.new', 'New')}</option>
                      <option value="certified-pre-owned">{t('tools.dealerInventory.certifiedPreOwned', 'Certified Pre-Owned')}</option>
                      <option value="used">{t('tools.dealerInventory.used', 'Used')}</option>
                    </select>
                    {uniqueMakes.length > 0 && (
                      <select
                        value={makeFilter}
                        onChange={(e) => setMakeFilter(e.target.value)}
                        className={`px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">{t('tools.dealerInventory.allMakes', 'All Makes')}</option>
                        {uniqueMakes.map((make) => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => setShowVehicleForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      {t('tools.dealerInventory.addVehicle', 'Add Vehicle')}
                    </button>
                  </div>
                </div>

                {/* Vehicles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
                    >
                      {/* Vehicle Image Placeholder */}
                      <div className={`h-40 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                        <Car className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              #{vehicle.stockNumber}
                            </p>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            {vehicle.trim && (
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {vehicle.trim}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status.replace('-', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Gauge className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              {vehicle.mileage.toLocaleString()} mi
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`${vehicle.daysOnLot > 60 ? 'text-orange-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {vehicle.daysOnLot} days
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.listPrice', 'List Price')}</p>
                            <p className={`text-lg font-bold text-[#0D9488]`}>
                              {formatCurrency(vehicle.listPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.internet', 'Internet')}</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatCurrency(vehicle.internetPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedVehicle(vehicle)}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg ${
                              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            {t('tools.dealerInventory.view', 'View')}
                          </button>
                          <button
                            onClick={() => handleEditVehicle(vehicle)}
                            className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredVehicles.length === 0 && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                    <Car className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.dealerInventory.noVehiclesFound', 'No vehicles found')}
                    </h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.dealerInventory.addYourFirstVehicleOr', 'Add your first vehicle or adjust filters')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.dealerInventory.addLead', 'Add Lead')}
                  </button>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.customer', 'Customer')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.contact', 'Contact')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.vehicleInterest', 'Vehicle Interest')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.source', 'Source')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.status', 'Status')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.followUp', 'Follow Up')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {leads.map((lead) => {
                          const vehicle = vehicles.find((v) => v.id === lead.vehicleId);
                          return (
                            <tr key={lead.id}>
                              <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {lead.customerName}
                              </td>
                              <td className={`px-4 py-3`}>
                                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{lead.email}</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{lead.phone}</div>
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '-'}
                              </td>
                              <td className={`px-4 py-3 capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {lead.source.replace('-', ' ')}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                                  className={`px-2 py-1 rounded text-sm ${getLeadStatusColor(lead.status)}`}
                                >
                                  <option value="new">{t('tools.dealerInventory.new2', 'New')}</option>
                                  <option value="contacted">{t('tools.dealerInventory.contacted', 'Contacted')}</option>
                                  <option value="qualified">{t('tools.dealerInventory.qualified', 'Qualified')}</option>
                                  <option value="negotiating">{t('tools.dealerInventory.negotiating', 'Negotiating')}</option>
                                  <option value="won">{t('tools.dealerInventory.won', 'Won')}</option>
                                  <option value="lost">{t('tools.dealerInventory.lost', 'Lost')}</option>
                                </select>
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditLead(lead)}
                                    className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                  >
                                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {leads.length === 0 && (
                    <div className="p-8 text-center">
                      <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dealerInventory.noLeadsYet', 'No leads yet')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="w-5 h-5 text-[#0D9488]" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.totalInventory', 'Total Inventory')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.totalVehicles}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {analytics.availableCount} available
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.inventoryValue', 'Inventory Value')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(analytics.totalInventoryValue)}
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.avgDaysOnLot', 'Avg Days on Lot')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.avgDaysOnLot.toFixed(0)}
                    </p>
                    <p className={`text-sm ${analytics.agedInventory > 0 ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {analytics.agedInventory} aged (60+ days)
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.activeLeads', 'Active Leads')}</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.totalLeads}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {analytics.newLeads} new, {analytics.qualifiedLeads} qualified
                    </p>
                  </div>
                </div>

                {/* Sales Summary */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.dealerInventory.salesPerformance', 'Sales Performance')}
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.totalSales', 'Total Sales')}</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.totalSales}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.totalRevenue', 'Total Revenue')}</p>
                      <p className={`text-2xl font-bold text-green-500`}>
                        {formatCurrency(analytics.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dealerInventory.avgSalePrice', 'Avg Sale Price')}</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analytics.avgSalePrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inventory by Condition */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.dealerInventory.inventoryByCondition', 'Inventory by Condition')}
                  </h3>
                  <div className="space-y-3">
                    {analytics.vehiclesByCondition.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className={`w-32 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</span>
                        <div className="flex-1">
                          <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="h-full rounded-full bg-[#0D9488]"
                              style={{ width: `${analytics.totalVehicles > 0 ? (item.count / analytics.totalVehicles) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <span className={`w-12 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trade-Ins/Appraisals Tab */}
            {activeTab === 'appraisals' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAppraisalForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.dealerInventory.newAppraisal', 'New Appraisal')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appraisals.map((appraisal) => (
                    <div
                      key={appraisal.id}
                      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {appraisal.year} {appraisal.make} {appraisal.model}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {appraisal.customerName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          appraisal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          appraisal.status === 'offered' ? 'bg-blue-100 text-blue-700' :
                          appraisal.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {appraisal.status}
                        </span>
                      </div>

                      <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>{appraisal.mileage.toLocaleString()} miles | {appraisal.condition} condition</p>
                        <p>Estimated: {formatCurrency(appraisal.estimatedValue)}</p>
                        {appraisal.finalOffer > 0 && (
                          <p className="font-medium text-[#0D9488]">Offer: {formatCurrency(appraisal.finalOffer)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {appraisals.length === 0 && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                    <Truck className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.dealerInventory.noTradeInAppraisals', 'No trade-in appraisals')}
                    </h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.dealerInventory.startANewAppraisalFor', 'Start a new appraisal for customer trade-ins')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.date', 'Date')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.customer2', 'Customer')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.vehicle', 'Vehicle')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.salePrice', 'Sale Price')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.total', 'Total')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.salesperson', 'Salesperson')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dealerInventory.status2', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {sales.map((sale) => {
                          const vehicle = vehicles.find((v) => v.id === sale.vehicleId);
                          return (
                            <tr key={sale.id}>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {new Date(sale.saleDate).toLocaleDateString()}
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {sale.customerName}
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '-'}
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(sale.salePrice)}
                              </td>
                              <td className={`px-4 py-3 font-medium text-[#0D9488]`}>
                                {formatCurrency(sale.totalPrice)}
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {sale.salesperson}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                  sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  sale.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {sale.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {sales.length === 0 && (
                    <div className="p-8 text-center">
                      <DollarSign className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dealerInventory.noSalesRecordedYet', 'No sales recorded yet')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Vehicle Form Modal */}
        {showVehicleForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingVehicle ? t('tools.dealerInventory.editVehicle', 'Edit Vehicle') : t('tools.dealerInventory.addNewVehicle', 'Add New Vehicle')}
                </h2>
                <button onClick={resetVehicleForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.vin', 'VIN *')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.vin}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.17CharacterVin', '17-character VIN')}
                      maxLength={17}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.stockNumber', 'Stock Number')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.stockNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, stockNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.autoGeneratedIfEmpty', 'Auto-generated if empty')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.condition', 'Condition')}
                    </label>
                    <select
                      value={vehicleForm.condition}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, condition: e.target.value as Vehicle['condition'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="new">{t('tools.dealerInventory.new3', 'New')}</option>
                      <option value="certified-pre-owned">{t('tools.dealerInventory.certifiedPreOwned2', 'Certified Pre-Owned')}</option>
                      <option value="used">{t('tools.dealerInventory.used2', 'Used')}</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.year', 'Year *')}
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.make', 'Make *')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.eGToyota', 'e.g., Toyota')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.model', 'Model')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.eGCamry', 'e.g., Camry')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.trim', 'Trim')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.trim}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, trim: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.eGSeXle', 'e.g., SE, XLE')}
                    />
                  </div>
                </div>

                {/* Colors & Mileage */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.exteriorColor', 'Exterior Color')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.exteriorColor}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, exteriorColor: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.interiorColor', 'Interior Color')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.interiorColor}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, interiorColor: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.mileage', 'Mileage')}
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.mileage}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, mileage: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.purchasePrice', 'Purchase Price')}
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.purchasePrice}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.msrp', 'MSRP')}
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.msrp}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, msrp: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.listPrice2', 'List Price')}
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.listPrice}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, listPrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.internetPrice', 'Internet Price')}
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.internetPrice}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, internetPrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                </div>

                {/* Status & Location */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.status3', 'Status')}
                    </label>
                    <select
                      value={vehicleForm.status}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as Vehicle['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="available">{t('tools.dealerInventory.available2', 'Available')}</option>
                      <option value="pending">{t('tools.dealerInventory.pending2', 'Pending')}</option>
                      <option value="on-hold">{t('tools.dealerInventory.onHold2', 'On Hold')}</option>
                      <option value="in-transit">{t('tools.dealerInventory.inTransit2', 'In Transit')}</option>
                      <option value="service">{t('tools.dealerInventory.inService2', 'In Service')}</option>
                      <option value="sold">{t('tools.dealerInventory.sold2', 'Sold')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.location}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, location: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.eGMainLotShowroom', 'e.g., Main Lot, Showroom')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.lotNumber', 'Lot Number')}
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.lotNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, lotNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dealerInventory.notes', 'Notes')}
                  </label>
                  <textarea
                    value={vehicleForm.notes}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={resetVehicleForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.dealerInventory.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveVehicle}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
                >
                  {editingVehicle ? t('tools.dealerInventory.updateVehicle', 'Update Vehicle') : t('tools.dealerInventory.addVehicle2', 'Add Vehicle')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lead Form Modal */}
        {showLeadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingLead ? t('tools.dealerInventory.editLead', 'Edit Lead') : t('tools.dealerInventory.addNewLead', 'Add New Lead')}
                </h2>
                <button onClick={resetLeadForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.customerName', 'Customer Name *')}
                    </label>
                    <input
                      type="text"
                      value={leadForm.customerName}
                      onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.source2', 'Source')}
                    </label>
                    <select
                      value={leadForm.source}
                      onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value as Lead['source'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="walk-in">{t('tools.dealerInventory.walkIn', 'Walk-In')}</option>
                      <option value="website">{t('tools.dealerInventory.website', 'Website')}</option>
                      <option value="phone">{t('tools.dealerInventory.phone', 'Phone')}</option>
                      <option value="referral">{t('tools.dealerInventory.referral', 'Referral')}</option>
                      <option value="social-media">{t('tools.dealerInventory.socialMedia', 'Social Media')}</option>
                      <option value="third-party">{t('tools.dealerInventory.thirdParty', 'Third Party')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.phone2', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dealerInventory.interestedVehicle', 'Interested Vehicle')}
                  </label>
                  <select
                    value={leadForm.vehicleId}
                    onChange={(e) => setLeadForm({ ...leadForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.dealerInventory.selectAVehicle', 'Select a vehicle')}</option>
                    {vehicles.filter((v) => v.status === 'available').map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} - {formatCurrency(vehicle.listPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.assignedTo', 'Assigned To')}
                    </label>
                    <input
                      type="text"
                      value={leadForm.assignedTo}
                      onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.dealerInventory.salespersonName', 'Salesperson name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.followUpDate', 'Follow Up Date')}
                    </label>
                    <input
                      type="date"
                      value={leadForm.followUpDate}
                      onChange={(e) => setLeadForm({ ...leadForm, followUpDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dealerInventory.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={resetLeadForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.dealerInventory.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveLead}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
                >
                  {editingLead ? t('tools.dealerInventory.updateLead', 'Update Lead') : t('tools.dealerInventory.addLead2', 'Add Lead')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appraisal Form Modal */}
        {showAppraisalForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dealerInventory.newTradeInAppraisal', 'New Trade-In Appraisal')}
                </h2>
                <button onClick={() => setShowAppraisalForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.customerName2', 'Customer Name *')}
                    </label>
                    <input
                      type="text"
                      value={appraisalForm.customerName}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, customerName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.phone3', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={appraisalForm.phone}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.year2', 'Year')}
                    </label>
                    <input
                      type="number"
                      value={appraisalForm.year}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.make2', 'Make')}
                    </label>
                    <input
                      type="text"
                      value={appraisalForm.make}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, make: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.model2', 'Model')}
                    </label>
                    <input
                      type="text"
                      value={appraisalForm.model}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, model: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.mileage2', 'Mileage')}
                    </label>
                    <input
                      type="number"
                      value={appraisalForm.mileage}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, mileage: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.condition2', 'Condition')}
                    </label>
                    <select
                      value={appraisalForm.condition}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, condition: e.target.value as Appraisal['condition'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="excellent">{t('tools.dealerInventory.excellent', 'Excellent')}</option>
                      <option value="good">{t('tools.dealerInventory.good', 'Good')}</option>
                      <option value="fair">{t('tools.dealerInventory.fair', 'Fair')}</option>
                      <option value="poor">{t('tools.dealerInventory.poor', 'Poor')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dealerInventory.estimatedValue', 'Estimated Value')}
                    </label>
                    <input
                      type="number"
                      value={appraisalForm.estimatedValue}
                      onChange={(e) => setAppraisalForm({ ...appraisalForm, estimatedValue: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dealerInventory.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={appraisalForm.notes}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={() => setShowAppraisalForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.dealerInventory.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveAppraisal}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]"
                >
                  {t('tools.dealerInventory.createAppraisal', 'Create Appraisal')}
                </button>
              </div>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default DealerInventoryTool;
