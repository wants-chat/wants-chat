'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  parseCSV,
  readFileAsText,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Car,
  Wrench,
  Settings,
  DollarSign,
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  Clock,
  Package,
  FileText,
  User,
  Phone,
  Hash,
  Gauge,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ClipboardList,
  Bell,
  Loader2,
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vin: string;
  mileage: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  serviceType: string;
  description: string;
  cost: number;
  technician: string;
  partsUsed: string[];
  laborHours: number;
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
  createdAt: string;
}

interface ServiceReminder {
  id: string;
  vehicleId: string;
  type: 'oil-change' | 'tire-rotation' | 'inspection' | 'brake-service' | 'transmission' | 'coolant' | 'other';
  dueDate: string;
  dueMileage: number;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  notes: string;
}

interface Part {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  minStock: number;
  category: string;
}

interface WorkOrder {
  id: string;
  vehicleId: string;
  orderNumber: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
  services: string[];
  estimatedCost: number;
  actualCost: number;
  estimatedCompletion: string;
  assignedTechnician: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'vehicles' | 'services' | 'reminders' | 'parts' | 'work-orders' | 'analytics';

// Tool ID for data persistence
const TOOL_ID = 'vehicle-service';

const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Service',
  'Transmission Service',
  'Engine Repair',
  'Electrical',
  'AC/Heating',
  'Suspension',
  'Exhaust',
  'Inspection',
  'Tune-up',
  'Other',
];

const REMINDER_TYPES: { value: ServiceReminder['type']; label: string }[] = [
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'tire-rotation', label: 'Tire Rotation' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'brake-service', label: 'Brake Service' },
  { value: 'transmission', label: 'Transmission Service' },
  { value: 'coolant', label: 'Coolant Flush' },
  { value: 'other', label: 'Other' },
];

const PART_CATEGORIES = [
  'Filters',
  'Fluids',
  'Brakes',
  'Electrical',
  'Engine',
  'Transmission',
  'Suspension',
  'Exhaust',
  'Body',
  'Other',
];

// Column configurations for export
const vehicleColumns: ColumnConfig[] = [
  { key: 'plateNumber', header: 'Plate Number', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'make', header: 'Make', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'vin', header: 'VIN', type: 'string' },
  { key: 'mileage', header: 'Mileage', type: 'number' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Customer Phone', type: 'string' },
  { key: 'customerEmail', header: 'Customer Email', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const serviceColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'vehicleDisplay', header: 'Vehicle', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'technician', header: 'Technician', type: 'string' },
  { key: 'laborHours', header: 'Labor Hours', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'partsUsedStr', header: 'Parts Used', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const partColumns: ColumnConfig[] = [
  { key: 'name', header: 'Part Name', type: 'string' },
  { key: 'partNumber', header: 'Part Number', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'totalValue', header: 'Total Value', type: 'currency' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'stockStatus', header: 'Stock Status', type: 'string' },
];

const workOrderColumns: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order Number', type: 'string' },
  { key: 'vehicleDisplay', header: 'Vehicle', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'servicesStr', header: 'Services', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'assignedTechnician', header: 'Assigned Technician', type: 'string' },
  { key: 'estimatedCompletion', header: 'Est. Completion', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

interface VehicleServiceToolProps {
  uiConfig?: UIConfig;
}

export const VehicleServiceTool: React.FC<VehicleServiceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for each data type with backend sync
  const vehiclesData = useToolData<Vehicle>(
    `${TOOL_ID}-vehicles`,
    [],
    vehicleColumns,
    { autoSave: true }
  );

  const servicesData = useToolData<ServiceRecord>(
    `${TOOL_ID}-services`,
    [],
    serviceColumns,
    { autoSave: true }
  );

  const remindersData = useToolData<ServiceReminder>(
    `${TOOL_ID}-reminders`,
    [],
    [], // No specific columns for reminders export
    { autoSave: true }
  );

  const partsData = useToolData<Part>(
    `${TOOL_ID}-parts`,
    [],
    partColumns,
    { autoSave: true }
  );

  const workOrdersData = useToolData<WorkOrder>(
    `${TOOL_ID}-workorders`,
    [],
    workOrderColumns,
    { autoSave: true }
  );

  // Extract data from hooks
  const vehicles = vehiclesData.data;
  const serviceRecords = servicesData.data;
  const reminders = remindersData.data;
  const parts = partsData.data;
  const workOrders = workOrdersData.data;

  // Combined sync status (use vehicles as primary)
  const isLoading = vehiclesData.isLoading || servicesData.isLoading || partsData.isLoading || workOrdersData.isLoading;
  const isSaving = vehiclesData.isSaving || servicesData.isSaving || partsData.isSaving || workOrdersData.isSaving;
  const isSynced = vehiclesData.isSynced && servicesData.isSynced && partsData.isSynced && workOrdersData.isSynced;
  const lastSaved = vehiclesData.lastSaved;
  const syncError = vehiclesData.syncError || servicesData.syncError || partsData.syncError || workOrdersData.syncError;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');

  // Form states
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showPartForm, setShowPartForm] = useState(false);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [editingReminder, setEditingReminder] = useState<ServiceReminder | null>(null);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plateNumber: '',
    vin: '',
    mileage: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });

  // Service form
  const [serviceForm, setServiceForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    serviceType: 'Oil Change',
    description: '',
    cost: 0,
    technician: '',
    partsUsed: '',
    laborHours: 1,
    status: 'pending' as ServiceRecord['status'],
    notes: '',
  });

  // Reminder form
  const [reminderForm, setReminderForm] = useState({
    vehicleId: '',
    type: 'oil-change' as ServiceReminder['type'],
    dueDate: '',
    dueMileage: 0,
    notes: '',
  });

  // Part form
  const [partForm, setPartForm] = useState({
    name: '',
    partNumber: '',
    quantity: 0,
    unitCost: 0,
    supplier: '',
    minStock: 5,
    category: 'Other',
  });

  // Work Order form
  const [workOrderForm, setWorkOrderForm] = useState({
    vehicleId: '',
    services: [] as string[],
    estimatedCost: 0,
    estimatedCompletion: '',
    assignedTechnician: '',
    notes: '',
  });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.description) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Force sync all data
  const forceSync = useCallback(async () => {
    const results = await Promise.all([
      vehiclesData.forceSync(),
      servicesData.forceSync(),
      remindersData.forceSync(),
      partsData.forceSync(),
      workOrdersData.forceSync(),
    ]);
    return results.every(Boolean);
  }, [vehiclesData, servicesData, remindersData, partsData, workOrdersData]);

  // Generate work order number
  const generateOrderNumber = () => {
    const prefix = 'WO';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${date}-${random}`;
  };

  // Vehicle handlers
  const handleSaveVehicle = () => {
    if (!vehicleForm.make.trim() || !vehicleForm.plateNumber.trim()) return;

    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      id: editingVehicle?.id || Date.now().toString(),
      ...vehicleForm,
      createdAt: editingVehicle?.createdAt || now,
      updatedAt: now,
    };

    if (editingVehicle) {
      vehiclesData.updateItem(editingVehicle.id, newVehicle);
    } else {
      vehiclesData.addItem(newVehicle);
    }

    resetVehicleForm();
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      plateNumber: '',
      vin: '',
      mileage: 0,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
    });
    setEditingVehicle(null);
    setShowVehicleForm(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      plateNumber: vehicle.plateNumber,
      vin: vehicle.vin,
      mileage: vehicle.mileage,
      customerName: vehicle.customerName,
      customerPhone: vehicle.customerPhone,
      customerEmail: vehicle.customerEmail,
      notes: vehicle.notes,
    });
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Vehicle',
      message: 'Delete this vehicle and all associated records?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    vehiclesData.deleteItem(id);
    // Also delete associated records
    serviceRecords.filter((s) => s.vehicleId === id).forEach((s) => servicesData.deleteItem(s.id));
    reminders.filter((r) => r.vehicleId === id).forEach((r) => remindersData.deleteItem(r.id));
    workOrders.filter((w) => w.vehicleId === id).forEach((w) => workOrdersData.deleteItem(w.id));
  };

  // Service record handlers
  const handleSaveService = () => {
    if (!serviceForm.vehicleId || !serviceForm.serviceType) return;

    const newService: ServiceRecord = {
      id: editingService?.id || Date.now().toString(),
      ...serviceForm,
      partsUsed: serviceForm.partsUsed.split(',').map((p) => p.trim()).filter(Boolean),
      createdAt: editingService?.createdAt || new Date().toISOString(),
    };

    if (editingService) {
      servicesData.updateItem(editingService.id, newService);
    } else {
      servicesData.addItem(newService);
    }

    resetServiceForm();
  };

  const resetServiceForm = () => {
    setServiceForm({
      vehicleId: '',
      date: new Date().toISOString().split('T')[0],
      serviceType: 'Oil Change',
      description: '',
      cost: 0,
      technician: '',
      partsUsed: '',
      laborHours: 1,
      status: 'pending',
      notes: '',
    });
    setEditingService(null);
    setShowServiceForm(false);
  };

  const handleDeleteService = (id: string) => {
    servicesData.deleteItem(id);
  };

  // Reminder handlers
  const handleSaveReminder = () => {
    if (!reminderForm.vehicleId) return;

    const today = new Date();
    const dueDate = new Date(reminderForm.dueDate);
    let status: ServiceReminder['status'] = 'upcoming';
    if (dueDate < today) {
      status = 'overdue';
    } else if (dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      status = 'due';
    }

    const newReminder: ServiceReminder = {
      id: editingReminder?.id || Date.now().toString(),
      ...reminderForm,
      status,
    };

    if (editingReminder) {
      remindersData.updateItem(editingReminder.id, newReminder);
    } else {
      remindersData.addItem(newReminder);
    }

    resetReminderForm();
  };

  const resetReminderForm = () => {
    setReminderForm({
      vehicleId: '',
      type: 'oil-change',
      dueDate: '',
      dueMileage: 0,
      notes: '',
    });
    setEditingReminder(null);
    setShowReminderForm(false);
  };

  const handleCompleteReminder = (id: string) => {
    remindersData.updateItem(id, { status: 'completed' as const });
  };

  const handleDeleteReminder = (id: string) => {
    remindersData.deleteItem(id);
  };

  // Part handlers
  const handleSavePart = () => {
    if (!partForm.name.trim()) return;

    const newPart: Part = {
      id: editingPart?.id || Date.now().toString(),
      ...partForm,
    };

    if (editingPart) {
      partsData.updateItem(editingPart.id, newPart);
    } else {
      partsData.addItem(newPart);
    }

    resetPartForm();
  };

  const resetPartForm = () => {
    setPartForm({
      name: '',
      partNumber: '',
      quantity: 0,
      unitCost: 0,
      supplier: '',
      minStock: 5,
      category: 'Other',
    });
    setEditingPart(null);
    setShowPartForm(false);
  };

  const handleDeletePart = (id: string) => {
    partsData.deleteItem(id);
  };

  // Work Order handlers
  const handleSaveWorkOrder = () => {
    if (!workOrderForm.vehicleId) return;

    const now = new Date().toISOString();
    const newWorkOrder: WorkOrder = {
      id: editingWorkOrder?.id || Date.now().toString(),
      orderNumber: editingWorkOrder?.orderNumber || generateOrderNumber(),
      ...workOrderForm,
      status: editingWorkOrder?.status || 'draft',
      actualCost: editingWorkOrder?.actualCost || 0,
      createdAt: editingWorkOrder?.createdAt || now,
      updatedAt: now,
    };

    if (editingWorkOrder) {
      workOrdersData.updateItem(editingWorkOrder.id, newWorkOrder);
    } else {
      workOrdersData.addItem(newWorkOrder);
    }

    resetWorkOrderForm();
  };

  const resetWorkOrderForm = () => {
    setWorkOrderForm({
      vehicleId: '',
      services: [],
      estimatedCost: 0,
      estimatedCompletion: '',
      assignedTechnician: '',
      notes: '',
    });
    setEditingWorkOrder(null);
    setShowWorkOrderForm(false);
  };

  const handleUpdateWorkOrderStatus = (id: string, status: WorkOrder['status']) => {
    workOrdersData.updateItem(id, { status, updatedAt: new Date().toISOString() });
  };

  const handleDeleteWorkOrder = (id: string) => {
    workOrdersData.deleteItem(id);
  };

  // Filtered data
  const filteredVehicles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.plateNumber.toLowerCase().includes(term) ||
        v.vin.toLowerCase().includes(term) ||
        v.customerName.toLowerCase().includes(term)
    );
  }, [vehicles, searchTerm]);

  // Analytics
  const analytics = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthStr = thisMonth.toISOString().split('T')[0];

    const servicesThisMonth = serviceRecords.filter((s) => s.date >= thisMonthStr);
    const revenueThisMonth = servicesThisMonth.reduce((sum, s) => sum + s.cost, 0);
    const totalRevenue = serviceRecords.reduce((sum, s) => sum + s.cost, 0);
    const overdueReminders = reminders.filter((r) => r.status === 'overdue').length;
    const dueReminders = reminders.filter((r) => r.status === 'due').length;
    const lowStockParts = parts.filter((p) => p.quantity <= p.minStock).length;
    const activeWorkOrders = workOrders.filter((w) => w.status === 'in-progress').length;

    return {
      totalVehicles: vehicles.length,
      servicesThisMonth: servicesThisMonth.length,
      revenueThisMonth,
      totalRevenue,
      overdueReminders,
      dueReminders,
      lowStockParts,
      activeWorkOrders,
    };
  }, [vehicles, serviceRecords, reminders, parts, workOrders]);

  // Styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const accentColor = 'text-amber-500';
  const accentBg = 'bg-amber-500';
  const accentBgLight = 'bg-amber-500/10';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'vehicles', label: 'Vehicles', icon: <Car className="w-4 h-4" /> },
    { id: 'services', label: 'Service History', icon: <Wrench className="w-4 h-4" /> },
    { id: 'reminders', label: 'Reminders', icon: <Bell className="w-4 h-4" /> },
    { id: 'parts', label: 'Parts', icon: <Package className="w-4 h-4" /> },
    { id: 'work-orders', label: 'Work Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const getVehicleDisplay = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`;
  };

  // Prepare export data based on active tab
  const getExportData = (): Record<string, any>[] => {
    switch (activeTab) {
      case 'vehicles':
        return filteredVehicles;
      case 'services':
        return serviceRecords
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((s) => ({
            ...s,
            vehicleDisplay: getVehicleDisplay(s.vehicleId),
            partsUsedStr: s.partsUsed.join(', '),
          }));
      case 'parts':
        return parts.map((p) => ({
          ...p,
          totalValue: (p.quantity * p.unitCost).toFixed(2),
          stockStatus: p.quantity <= p.minStock ? 'Low Stock' : 'In Stock',
        }));
      case 'work-orders':
        return workOrders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((w) => ({
            ...w,
            vehicleDisplay: getVehicleDisplay(w.vehicleId),
            servicesStr: w.services.join(', '),
          }));
      default:
        return [];
    }
  };

  const getExportColumns = () => {
    switch (activeTab) {
      case 'vehicles':
        return vehicleColumns;
      case 'services':
        return serviceColumns;
      case 'parts':
        return partColumns;
      case 'work-orders':
        return workOrderColumns;
      default:
        return vehicleColumns;
    }
  };

  const getExportFilename = () => {
    switch (activeTab) {
      case 'vehicles':
        return 'vehicle-service-vehicles';
      case 'services':
        return 'vehicle-service-records';
      case 'parts':
        return 'vehicle-service-parts';
      case 'work-orders':
        return 'vehicle-service-work-orders';
      default:
        return 'vehicle-service-data';
    }
  };

  const getExportTitle = () => {
    switch (activeTab) {
      case 'vehicles':
        return 'Vehicle Inventory';
      case 'services':
        return 'Service History';
      case 'parts':
        return 'Parts Inventory';
      case 'work-orders':
        return 'Work Orders';
      default:
        return 'Vehicle Service Data';
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(getExportData(), getExportColumns(), { filename: getExportFilename() });
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), getExportColumns(), { filename: getExportFilename() });
  };

  const handleExportJSON = () => {
    exportToJSON(getExportData(), { filename: getExportFilename() });
  };

  const handleExportPDF = async () => {
    await exportToPDF(getExportData(), getExportColumns(), {
      filename: getExportFilename(),
      title: getExportTitle(),
      subtitle: `Exported on ${new Date().toLocaleDateString()}`,
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(getExportData(), getExportColumns());
  };

  const handlePrint = () => {
    printData(getExportData(), getExportColumns(), { title: getExportTitle() });
  };

  // Import handlers
  const handleImportCSV = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      const result = parseCSV(content, getExportColumns());

      if (result.success && result.data) {
        switch (activeTab) {
          case 'vehicles':
            // Add unique IDs to imported vehicles
            result.data.forEach((v: any) => {
              vehiclesData.addItem({
                ...v,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: v.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            });
            break;
          case 'services':
            result.data.forEach((s: any) => {
              servicesData.addItem({
                ...s,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: s.createdAt || new Date().toISOString(),
                partsUsed: s.partsUsedStr ? s.partsUsedStr.split(', ').filter(Boolean) : [],
              });
            });
            break;
          case 'parts':
            result.data.forEach((p: any) => {
              partsData.addItem({
                ...p,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              });
            });
            break;
          case 'work-orders':
            result.data.forEach((w: any) => {
              workOrdersData.addItem({
                ...w,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: w.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                services: w.servicesStr ? w.servicesStr.split(', ').filter(Boolean) : [],
              });
            });
            break;
        }
      }
    } catch (error) {
      console.error('Failed to import CSV:', error);
    }
  };

  const handleImportJSON = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      const parsed = JSON.parse(content);
      const importedData = Array.isArray(parsed)
        ? parsed
        : parsed.data?.items || parsed.data || parsed.items || [];

      if (!Array.isArray(importedData)) {
        console.error('Invalid JSON format: expected array');
        return;
      }

      switch (activeTab) {
        case 'vehicles':
          importedData.forEach((v: any) => {
            vehiclesData.addItem({
              ...v,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              createdAt: v.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
          break;
        case 'services':
          importedData.forEach((s: any) => {
            servicesData.addItem({
              ...s,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              createdAt: s.createdAt || new Date().toISOString(),
            });
          });
          break;
        case 'parts':
          importedData.forEach((p: any) => {
            partsData.addItem({
              ...p,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            });
          });
          break;
        case 'work-orders':
          importedData.forEach((w: any) => {
            workOrdersData.addItem({
              ...w,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              createdAt: w.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
          break;
      }
    } catch (error) {
      console.error('Failed to import JSON:', error);
    }
  };

  // Check if current tab has data to export
  const hasExportableData = () => {
    switch (activeTab) {
      case 'vehicles':
        return filteredVehicles.length > 0;
      case 'services':
        return serviceRecords.length > 0;
      case 'parts':
        return parts.length > 0;
      case 'work-orders':
        return workOrders.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${cardBg} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${accentBgLight} rounded-lg`}>
            <Car className={`w-6 h-6 ${accentColor}`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.vehicleService.vehicleServiceManager', 'Vehicle Service Manager')}</h2>
            <p className={`text-sm ${textSecondary}`}>
              {t('tools.vehicleService.completeAutomotiveServiceAndRepair', 'Complete automotive service and repair shop management')}
            </p>
          </div>
        </div>
        {hasExportableData() && activeTab !== 'analytics' && activeTab !== 'reminders' && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onCopyToClipboard={handleCopyToClipboard}
            onPrint={handlePrint}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        )}
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-500 font-medium">{t('tools.vehicleService.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Car className={`w-5 h-5 ${accentColor}`} />
            <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.vehicles', 'Vehicles')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.totalVehicles}</p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.servicesMonth', 'Services (Month)')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.servicesThisMonth}</p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.revenueMonth', 'Revenue (Month)')}</span>
          </div>
          <p className={`text-2xl font-bold text-green-500`}>${analytics.revenueThisMonth.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.dueReminders', 'Due Reminders')}</span>
          </div>
          <p className={`text-2xl font-bold text-red-500`}>{analytics.overdueReminders + analytics.dueReminders}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex flex-wrap gap-2 mb-6 border-b ${borderColor} pb-4`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? `${accentBg} text-white`
                : `${textSecondary} ${hoverBg}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className={`w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder={t('tools.vehicleService.searchByPlateVinCustomer', 'Search by plate, VIN, customer...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
              />
            </div>
            <button
              onClick={() => setShowVehicleForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600 transition-colors`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.vehicleService.addVehicle', 'Add Vehicle')}
            </button>
          </div>

          {/* Vehicle Form */}
          {showVehicleForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingVehicle ? t('tools.vehicleService.editVehicle', 'Edit Vehicle') : t('tools.vehicleService.addNewVehicle', 'Add New Vehicle')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.make', 'Make *')}</label>
                  <input
                    type="text"
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.toyota', 'Toyota')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.model', 'Model')}</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.camry', 'Camry')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.year', 'Year')}</label>
                  <input
                    type="number"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) || 2024 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={1900}
                    max={2030}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.color', 'Color')}</label>
                  <input
                    type="text"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.silver', 'Silver')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.plateNumber', 'Plate Number *')}</label>
                  <input
                    type="text"
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.abc1234', 'ABC-1234')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.vin', 'VIN')}</label>
                  <input
                    type="text"
                    value={vehicleForm.vin}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.1hgbh41jxmn109186', '1HGBH41JXMN109186')}
                    maxLength={17}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.mileage', 'Mileage')}</label>
                  <input
                    type="number"
                    value={vehicleForm.mileage}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, mileage: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.customerName', 'Customer Name')}</label>
                  <input
                    type="text"
                    value={vehicleForm.customerName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, customerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.johnDoe', 'John Doe')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.customerPhone', 'Customer Phone')}</label>
                  <input
                    type="tel"
                    value={vehicleForm.customerPhone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, customerPhone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.notes', 'Notes')}</label>
                  <textarea
                    value={vehicleForm.notes}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                    rows={2}
                    placeholder={t('tools.vehicleService.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveVehicle}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.vehicleService.save', 'Save')}
                </button>
                <button onClick={resetVehicleForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.vehicleService.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Vehicles List */}
          <div className="space-y-3">
            {filteredVehicles.map((vehicle) => {
              const vehicleServices = serviceRecords.filter((s) => s.vehicleId === vehicle.id);
              const vehicleReminders = reminders.filter((r) => r.vehicleId === vehicle.id && r.status !== 'completed');
              const isExpanded = expandedVehicle === vehicle.id;

              return (
                <div key={vehicle.id} className={`rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${textPrimary}`}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${accentBgLight} ${accentColor}`}>
                            {vehicle.plateNumber}
                          </span>
                          {vehicleReminders.some((r) => r.status === 'overdue') && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                              {t('tools.vehicleService.serviceOverdue', 'Service Overdue')}
                            </span>
                          )}
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          {vehicle.color && (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: vehicle.color.toLowerCase() }} />
                              {vehicle.color}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> {vehicle.mileage.toLocaleString()} mi
                          </span>
                          {vehicle.customerName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {vehicle.customerName}
                            </span>
                          )}
                          {vehicle.customerPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {vehicle.customerPhone}
                            </span>
                          )}
                        </div>
                        {vehicle.vin && (
                          <p className={`mt-1 text-xs ${textSecondary}`}>
                            VIN: {vehicle.vin}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setExpandedVehicle(isExpanded ? null : vehicle.id)}
                          className={`p-2 rounded-lg ${hoverBg}`}
                          title={isExpanded ? t('tools.vehicleService.collapse', 'Collapse') : t('tools.vehicleService.expand', 'Expand')}
                        >
                          {isExpanded ? (
                            <ChevronUp className={`w-4 h-4 ${textSecondary}`} />
                          ) : (
                            <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
                          )}
                        </button>
                        <button onClick={() => handleEditVehicle(vehicle)} className={`p-2 rounded-lg ${hoverBg}`}>
                          <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Recent Services */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${textPrimary}`}>{t('tools.vehicleService.recentServices', 'Recent Services')}</h4>
                            {vehicleServices.slice(0, 3).map((service) => (
                              <div key={service.id} className={`text-sm ${textSecondary} mb-1`}>
                                <span>{service.date}</span> - <span>{service.serviceType}</span> - <span className="text-green-500">${service.cost}</span>
                              </div>
                            ))}
                            {vehicleServices.length === 0 && (
                              <p className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.noServiceHistory', 'No service history')}</p>
                            )}
                          </div>
                          {/* Active Reminders */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${textPrimary}`}>{t('tools.vehicleService.upcomingReminders', 'Upcoming Reminders')}</h4>
                            {vehicleReminders.slice(0, 3).map((reminder) => (
                              <div key={reminder.id} className={`text-sm mb-1 ${
                                reminder.status === 'overdue' ? 'text-red-500' :
                                reminder.status === 'due' ? 'text-yellow-500' : textSecondary
                              }`}>
                                {REMINDER_TYPES.find((t) => t.value === reminder.type)?.label} - {reminder.dueDate}
                              </div>
                            ))}
                            {vehicleReminders.length === 0 && (
                              <p className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.noUpcomingReminders', 'No upcoming reminders')}</p>
                            )}
                          </div>
                        </div>
                        {vehicle.notes && (
                          <p className={`mt-4 text-sm ${textSecondary}`}>
                            <strong>{t('tools.vehicleService.notes2', 'Notes:')}</strong> {vehicle.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredVehicles.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.vehicleService.noVehiclesFoundAddYour', 'No vehicles found. Add your first vehicle to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowServiceForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.vehicleService.addServiceRecord', 'Add Service Record')}
            </button>
          </div>

          {/* Service Form */}
          {showServiceForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingService ? t('tools.vehicleService.editServiceRecord', 'Edit Service Record') : t('tools.vehicleService.addServiceRecord2', 'Add Service Record')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.vehicle', 'Vehicle *')}</label>
                  <select
                    value={serviceForm.vehicleId}
                    onChange={(e) => setServiceForm({ ...serviceForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.vehicleService.selectVehicle', 'Select vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.date', 'Date')}</label>
                  <input
                    type="date"
                    value={serviceForm.date}
                    onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.serviceType', 'Service Type')}</label>
                  <select
                    value={serviceForm.serviceType}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.cost', 'Cost ($)')}</label>
                  <input
                    type="number"
                    value={serviceForm.cost}
                    onChange={(e) => setServiceForm({ ...serviceForm, cost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.technician', 'Technician')}</label>
                  <input
                    type="text"
                    value={serviceForm.technician}
                    onChange={(e) => setServiceForm({ ...serviceForm, technician: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.johnSmith', 'John Smith')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.laborHours', 'Labor Hours')}</label>
                  <input
                    type="number"
                    value={serviceForm.laborHours}
                    onChange={(e) => setServiceForm({ ...serviceForm, laborHours: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.status', 'Status')}</label>
                  <select
                    value={serviceForm.status}
                    onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as ServiceRecord['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="pending">{t('tools.vehicleService.pending', 'Pending')}</option>
                    <option value="in-progress">{t('tools.vehicleService.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.vehicleService.completed', 'Completed')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.partsUsedCommaSeparated', 'Parts Used (comma-separated)')}</label>
                  <input
                    type="text"
                    value={serviceForm.partsUsed}
                    onChange={(e) => setServiceForm({ ...serviceForm, partsUsed: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.oilFilterOil5w30', 'Oil filter, Oil 5W-30')}
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.description', 'Description')}</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                    rows={2}
                    placeholder={t('tools.vehicleService.serviceDetails', 'Service details...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveService}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.vehicleService.save2', 'Save')}
                </button>
                <button onClick={resetServiceForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.vehicleService.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Service Records List */}
          <div className="space-y-3">
            {serviceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((service) => (
              <div key={service.id} className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${textPrimary}`}>{service.serviceType}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        service.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        service.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>{getVehicleDisplay(service.vehicleId)}</p>
                    <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {service.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.laborHours}h
                      </span>
                      <span className="flex items-center gap-1 text-green-500">
                        <DollarSign className="w-3 h-3" /> ${service.cost.toFixed(2)}
                      </span>
                      {service.technician && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {service.technician}
                        </span>
                      )}
                    </div>
                    {service.partsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.partsUsed.map((part, idx) => (
                          <span key={idx} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'} ${textSecondary}`}>
                            {part}
                          </span>
                        ))}
                      </div>
                    )}
                    {service.description && (
                      <p className={`mt-2 text-sm ${textSecondary}`}>{service.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {serviceRecords.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.vehicleService.noServiceRecordsAddYour', 'No service records. Add your first service to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowReminderForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.vehicleService.addReminder', 'Add Reminder')}
            </button>
          </div>

          {/* Reminder Form */}
          {showReminderForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingReminder ? t('tools.vehicleService.editReminder', 'Edit Reminder') : t('tools.vehicleService.addServiceReminder', 'Add Service Reminder')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.vehicle2', 'Vehicle *')}</label>
                  <select
                    value={reminderForm.vehicleId}
                    onChange={(e) => setReminderForm({ ...reminderForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.vehicleService.selectVehicle2', 'Select vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.serviceType2', 'Service Type')}</label>
                  <select
                    value={reminderForm.type}
                    onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value as ServiceReminder['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {REMINDER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.dueDate', 'Due Date')}</label>
                  <input
                    type="date"
                    value={reminderForm.dueDate}
                    onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.dueMileage', 'Due Mileage')}</label>
                  <input
                    type="number"
                    value={reminderForm.dueMileage}
                    onChange={(e) => setReminderForm({ ...reminderForm, dueMileage: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveReminder}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.vehicleService.save3', 'Save')}
                </button>
                <button onClick={resetReminderForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.vehicleService.cancel3', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Reminders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders
              .filter((r) => r.status !== 'completed')
              .sort((a, b) => {
                const order = { overdue: 0, due: 1, upcoming: 2 };
                return order[a.status] - order[b.status];
              })
              .map((reminder) => (
                <div key={reminder.id} className={`p-4 rounded-lg border ${
                  reminder.status === 'overdue' ? 'border-red-500' :
                  reminder.status === 'due' ? 'border-yellow-500' : borderColor
                } ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {reminder.status === 'overdue' ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : reminder.status === 'due' ? (
                          <Bell className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Clock className={`w-5 h-5 ${textSecondary}`} />
                        )}
                        <h3 className={`font-semibold ${textPrimary}`}>
                          {REMINDER_TYPES.find((t) => t.value === reminder.type)?.label}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          reminder.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                          reminder.status === 'due' ? 'bg-yellow-500/10 text-yellow-500' :
                          `${accentBgLight} ${accentColor}`
                        }`}>
                          {reminder.status}
                        </span>
                      </div>
                      <p className={`text-sm ${textSecondary} mt-1`}>{getVehicleDisplay(reminder.vehicleId)}</p>
                      <div className={`flex gap-4 mt-2 text-sm ${textSecondary}`}>
                        {reminder.dueDate && <span>Due: {reminder.dueDate}</span>}
                        {reminder.dueMileage > 0 && <span>At: {reminder.dueMileage.toLocaleString()} mi</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCompleteReminder(reminder.id)}
                        className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        title={t('tools.vehicleService.markComplete', 'Mark Complete')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {reminders.filter((r) => r.status !== 'completed').length === 0 && (
              <div className={`col-span-2 text-center py-8 ${textSecondary}`}>
                {t('tools.vehicleService.noActiveRemindersAddA', 'No active reminders. Add a reminder to track upcoming services.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parts Tab */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPartForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.vehicleService.addPart', 'Add Part')}
            </button>
          </div>

          {/* Part Form */}
          {showPartForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingPart ? t('tools.vehicleService.editPart', 'Edit Part') : t('tools.vehicleService.addPartToInventory', 'Add Part to Inventory')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.partName', 'Part Name *')}</label>
                  <input
                    type="text"
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.oilFilter', 'Oil Filter')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.partNumber', 'Part Number')}</label>
                  <input
                    type="text"
                    value={partForm.partNumber}
                    onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.of12345', 'OF-12345')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.category', 'Category')}</label>
                  <select
                    value={partForm.category}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {PART_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.quantity', 'Quantity')}</label>
                  <input
                    type="number"
                    value={partForm.quantity}
                    onChange={(e) => setPartForm({ ...partForm, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.unitCost', 'Unit Cost ($)')}</label>
                  <input
                    type="number"
                    value={partForm.unitCost}
                    onChange={(e) => setPartForm({ ...partForm, unitCost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.supplier', 'Supplier')}</label>
                  <input
                    type="text"
                    value={partForm.supplier}
                    onChange={(e) => setPartForm({ ...partForm, supplier: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.autopartsInc', 'AutoParts Inc')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.minStockLevel', 'Min Stock Level')}</label>
                  <input
                    type="number"
                    value={partForm.minStock}
                    onChange={(e) => setPartForm({ ...partForm, minStock: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSavePart}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.vehicleService.save4', 'Save')}
                </button>
                <button onClick={resetPartForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.vehicleService.cancel4', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Parts List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderColor}`}>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.part', 'Part')}</th>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.part2', 'Part #')}</th>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.category2', 'Category')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.qty', 'Qty')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.cost2', 'Cost')}</th>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.supplier2', 'Supplier')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.vehicleService.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className={`border-b ${borderColor}`}>
                    <td className={`py-2 px-3 ${textPrimary}`}>{part.name}</td>
                    <td className={`py-2 px-3 ${textSecondary}`}>{part.partNumber || '-'}</td>
                    <td className={`py-2 px-3 ${textSecondary}`}>{part.category}</td>
                    <td className={`py-2 px-3 text-right ${
                      part.quantity <= part.minStock ? 'text-red-500 font-semibold' : textPrimary
                    }`}>
                      {part.quantity}
                      {part.quantity <= part.minStock && (
                        <AlertTriangle className="inline w-3 h-3 ml-1" />
                      )}
                    </td>
                    <td className={`py-2 px-3 text-right ${textPrimary}`}>${part.unitCost.toFixed(2)}</td>
                    <td className={`py-2 px-3 ${textSecondary}`}>{part.supplier || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => {
                          setPartForm({
                            name: part.name,
                            partNumber: part.partNumber,
                            quantity: part.quantity,
                            unitCost: part.unitCost,
                            supplier: part.supplier,
                            minStock: part.minStock,
                            category: part.category,
                          });
                          setEditingPart(part);
                          setShowPartForm(true);
                        }}
                        className={`p-1 rounded ${hoverBg}`}
                      >
                        <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                      </button>
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className={`p-1 rounded ${hoverBg} hover:text-red-500 ml-1`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parts.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.vehicleService.noPartsInInventoryAdd', 'No parts in inventory. Add parts to track your stock.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work Orders Tab */}
      {activeTab === 'work-orders' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowWorkOrderForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.vehicleService.createWorkOrder', 'Create Work Order')}
            </button>
          </div>

          {/* Work Order Form */}
          {showWorkOrderForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingWorkOrder ? t('tools.vehicleService.editWorkOrder', 'Edit Work Order') : t('tools.vehicleService.createWorkOrder2', 'Create Work Order')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.vehicle3', 'Vehicle *')}</label>
                  <select
                    value={workOrderForm.vehicleId}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.vehicleService.selectVehicle3', 'Select vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.assignedTechnician', 'Assigned Technician')}</label>
                  <input
                    type="text"
                    value={workOrderForm.assignedTechnician}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, assignedTechnician: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.vehicleService.johnSmith2', 'John Smith')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.estimatedCost', 'Estimated Cost ($)')}</label>
                  <input
                    type="number"
                    value={workOrderForm.estimatedCost}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.estimatedCompletion', 'Estimated Completion')}</label>
                  <input
                    type="date"
                    value={workOrderForm.estimatedCompletion}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, estimatedCompletion: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.services', 'Services')}</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TYPES.map((service) => (
                      <label key={service} className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={workOrderForm.services.includes(service)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkOrderForm({ ...workOrderForm, services: [...workOrderForm.services, service] });
                            } else {
                              setWorkOrderForm({ ...workOrderForm, services: workOrderForm.services.filter((s) => s !== service) });
                            }
                          }}
                          className="w-4 h-4 text-amber-500"
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.vehicleService.notes3', 'Notes')}</label>
                  <textarea
                    value={workOrderForm.notes}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                    rows={2}
                    placeholder={t('tools.vehicleService.workOrderNotes', 'Work order notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveWorkOrder}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-amber-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.vehicleService.save5', 'Save')}
                </button>
                <button onClick={resetWorkOrderForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.vehicleService.cancel5', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Work Orders List */}
          <div className="space-y-3">
            {workOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
              <div key={order.id} className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${textPrimary}`}>{order.orderNumber}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                        order.status === 'approved' ? 'bg-purple-500/10 text-purple-500' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>{getVehicleDisplay(order.vehicleId)}</p>
                    <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Est: ${order.estimatedCost.toFixed(2)}
                      </span>
                      {order.estimatedCompletion && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due: {order.estimatedCompletion}
                        </span>
                      )}
                      {order.assignedTechnician && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {order.assignedTechnician}
                        </span>
                      )}
                    </div>
                    {order.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {order.services.map((service, idx) => (
                          <span key={idx} className={`text-xs px-2 py-0.5 rounded ${accentBgLight} ${accentColor}`}>
                            {service}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {order.status === 'draft' && (
                      <button
                        onClick={() => handleUpdateWorkOrderStatus(order.id, 'approved')}
                        className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        {t('tools.vehicleService.approve', 'Approve')}
                      </button>
                    )}
                    {order.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateWorkOrderStatus(order.id, 'in-progress')}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {t('tools.vehicleService.start', 'Start')}
                      </button>
                    )}
                    {order.status === 'in-progress' && (
                      <button
                        onClick={() => handleUpdateWorkOrderStatus(order.id, 'completed')}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        {t('tools.vehicleService.complete', 'Complete')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteWorkOrder(order.id)}
                      className={`p-1 rounded ${hoverBg} hover:text-red-500`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {workOrders.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.vehicleService.noWorkOrdersCreateA', 'No work orders. Create a work order to track jobs.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Car className={`w-8 h-8 mx-auto ${accentColor} mb-2`} />
              <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.totalVehicles}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.totalVehicles', 'Total Vehicles')}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Wrench className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.servicesThisMonth}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.servicesThisMonth', 'Services This Month')}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <DollarSign className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-500">${analytics.revenueThisMonth.toLocaleString()}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.revenueThisMonth', 'Revenue This Month')}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-purple-500">${analytics.totalRevenue.toLocaleString()}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.totalRevenue', 'Total Revenue')}</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.activeWorkOrders', 'Active Work Orders')}</span>
              </div>
              <p className={`text-2xl font-bold ${textPrimary} mt-2`}>{analytics.activeWorkOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.overdueReminders', 'Overdue Reminders')}</span>
              </div>
              <p className="text-2xl font-bold text-red-500 mt-2">{analytics.overdueReminders}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.dueSoon', 'Due Soon')}</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500 mt-2">{analytics.dueReminders}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                <span className={`text-sm ${textSecondary}`}>{t('tools.vehicleService.lowStockParts', 'Low Stock Parts')}</span>
              </div>
              <p className="text-2xl font-bold text-orange-500 mt-2">{analytics.lowStockParts}</p>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>{t('tools.vehicleService.servicesByType', 'Services by Type')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SERVICE_TYPES.slice(0, 8).map((type) => {
                const count = serviceRecords.filter((s) => s.serviceType === type).length;
                const revenue = serviceRecords.filter((s) => s.serviceType === type).reduce((sum, s) => sum + s.cost, 0);
                return (
                  <div key={type} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${textPrimary}`}>{type}</p>
                    <p className={`text-xs ${textSecondary}`}>{count} services</p>
                    <p className="text-sm font-semibold text-green-500">${revenue.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>{t('tools.vehicleService.aboutVehicleServiceManager', 'About Vehicle Service Manager')}</h3>
        <p className={`text-sm ${textSecondary}`}>
          A comprehensive automotive service and repair shop management tool. Track vehicles, manage service
          history, set maintenance reminders, monitor parts inventory, and create work orders. All data is
          automatically saved to your browser's local storage.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default VehicleServiceTool;
