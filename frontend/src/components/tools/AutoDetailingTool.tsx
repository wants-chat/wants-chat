'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Car,
  Calendar,
  User,
  CheckSquare,
  Camera,
  Package,
  Clock,
  Sparkles,
  MapPin,
  DollarSign,
  Percent,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Image,
  Truck,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
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

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalVisits: number;
  totalSpent: number;
  createdAt: Date;
  notes: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  year: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  vin: string;
  size: 'compact' | 'sedan' | 'suv' | 'truck' | 'van' | 'luxury';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

interface ServicePackage {
  id: string;
  name: string;
  type: 'interior' | 'exterior' | 'full';
  description: string;
  basePrice: number;
  estimatedTime: number; // in minutes
  checklist: string[];
}

interface AddOnService {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitCost: number;
  unit: string;
}

interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  packageId: string;
  addOnIds: string[];
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  isMobile: boolean;
  location?: string;
  completedChecklist: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  timeSpent: number; // in minutes
  totalPrice: number;
  discountApplied: number;
  notes: string;
}

interface TimeEntry {
  appointmentId: string;
  startTime: Date | null;
  pausedTime: number;
  isRunning: boolean;
}

// Combined data structure for backend sync
interface AutoDetailingData {
  id: string;
  customers: Customer[];
  vehicles: Vehicle[];
  packages: ServicePackage[];
  addOns: AddOnService[];
  inventory: InventoryItem[];
  appointments: Appointment[];
}

// Columns for sync data (used for export metadata)
const SYNC_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

// Default data
const defaultPackages: ServicePackage[] = [
  {
    id: 'pkg-1',
    name: 'Interior Detail',
    type: 'interior',
    description: 'Complete interior cleaning and conditioning',
    basePrice: 150,
    estimatedTime: 120,
    checklist: [
      'Vacuum all carpets and mats',
      'Clean and condition leather/vinyl seats',
      'Wipe down dashboard and console',
      'Clean interior windows',
      'Detail door panels and jambs',
      'Clean cup holders and compartments',
      'Deodorize and sanitize',
      'Condition rubber seals',
    ],
  },
  {
    id: 'pkg-2',
    name: 'Exterior Detail',
    type: 'exterior',
    description: 'Full exterior wash and protection',
    basePrice: 125,
    estimatedTime: 90,
    checklist: [
      'Pre-rinse and foam wash',
      'Hand wash with microfiber mitts',
      'Clay bar treatment',
      'Apply wax/sealant',
      'Clean and dress tires',
      'Clean wheel wells',
      'Clean exterior windows',
      'Polish chrome/trim',
    ],
  },
  {
    id: 'pkg-3',
    name: 'Full Detail',
    type: 'full',
    description: 'Complete interior and exterior detailing',
    basePrice: 250,
    estimatedTime: 180,
    checklist: [
      'Complete interior detail package',
      'Complete exterior detail package',
      'Engine bay cleaning',
      'Trunk cleaning',
      'Headlight restoration',
      'Final inspection and touch-up',
    ],
  },
];

const defaultAddOns: AddOnService[] = [
  { id: 'addon-1', name: 'Ceramic Coating', description: '9H hardness, 2-year protection', price: 500, estimatedTime: 180 },
  { id: 'addon-2', name: 'Paint Correction - Stage 1', description: 'Light swirl removal', price: 200, estimatedTime: 120 },
  { id: 'addon-3', name: 'Paint Correction - Stage 2', description: 'Medium defect removal', price: 350, estimatedTime: 180 },
  { id: 'addon-4', name: 'Headlight Restoration', description: 'Clear and seal oxidized headlights', price: 75, estimatedTime: 45 },
  { id: 'addon-5', name: 'Pet Hair Removal', description: 'Extra thorough pet hair extraction', price: 50, estimatedTime: 30 },
  { id: 'addon-6', name: 'Odor Elimination', description: 'Ozone treatment for stubborn odors', price: 75, estimatedTime: 60 },
  { id: 'addon-7', name: 'Fabric Protection', description: 'Stain-resistant fabric coating', price: 100, estimatedTime: 30 },
  { id: 'addon-8', name: 'Leather Protection', description: 'Conditioning and UV protection', price: 85, estimatedTime: 30 },
];

const defaultInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'All-Purpose Cleaner', category: 'Cleaners', quantity: 5, minQuantity: 2, unitCost: 15, unit: 'gallon' },
  { id: 'inv-2', name: 'Microfiber Towels', category: 'Supplies', quantity: 50, minQuantity: 20, unitCost: 2, unit: 'each' },
  { id: 'inv-3', name: 'Car Wax', category: 'Protection', quantity: 8, minQuantity: 3, unitCost: 25, unit: 'bottle' },
  { id: 'inv-4', name: 'Ceramic Coating Kit', category: 'Protection', quantity: 3, minQuantity: 2, unitCost: 150, unit: 'kit' },
  { id: 'inv-5', name: 'Leather Conditioner', category: 'Cleaners', quantity: 4, minQuantity: 2, unitCost: 20, unit: 'bottle' },
  { id: 'inv-6', name: 'Clay Bar', category: 'Supplies', quantity: 10, minQuantity: 5, unitCost: 12, unit: 'bar' },
  { id: 'inv-7', name: 'Tire Shine', category: 'Dressing', quantity: 6, minQuantity: 3, unitCost: 18, unit: 'bottle' },
  { id: 'inv-8', name: 'Glass Cleaner', category: 'Cleaners', quantity: 4, minQuantity: 2, unitCost: 12, unit: 'gallon' },
];

const vehicleSizeMultipliers: Record<string, number> = {
  compact: 0.85,
  sedan: 1.0,
  suv: 1.25,
  truck: 1.3,
  van: 1.35,
  luxury: 1.5,
};

// Export columns configuration
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'vehicleInfo', header: 'Vehicle', type: 'string' },
  { key: 'packageName', header: 'Package', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'isMobile', header: 'Mobile Service', type: 'boolean' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'discountApplied', header: 'Discount', type: 'currency' },
  { key: 'timeSpent', header: 'Time Spent (min)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'totalVisits', header: 'Total Visits', type: 'number' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Product Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'minQuantity', header: 'Min. Quantity', type: 'number' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'unit', header: 'Unit', type: 'string' },
];

// Helper functions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

interface AutoDetailingToolProps {
  uiConfig?: UIConfig;
}

export const AutoDetailingTool: React.FC<AutoDetailingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Default initial data for the sync
  const defaultSyncData: AutoDetailingData[] = [{
    id: 'auto-detailing-main',
    customers: [],
    vehicles: [],
    packages: defaultPackages,
    addOns: defaultAddOns,
    inventory: defaultInventory,
    appointments: [],
  }];

  // Use the useToolData hook for backend persistence
  const {
    data: syncData,
    setData: setSyncData,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<AutoDetailingData>('auto-detailing', defaultSyncData, SYNC_COLUMNS);

  // Extract data from sync structure
  const toolData = syncData[0] || defaultSyncData[0];
  const customers = toolData.customers || [];
  const vehicles = toolData.vehicles || [];
  const packages = toolData.packages || defaultPackages;
  const addOns = toolData.addOns || defaultAddOns;
  const inventory = toolData.inventory || defaultInventory;
  const appointments = toolData.appointments || [];

  // Helper to update sync data
  const updateSyncData = (updates: Partial<AutoDetailingData>) => {
    setSyncData([{
      ...toolData,
      ...updates,
    }]);
  };

  // State setters that update the sync data
  const setCustomers = (updater: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const newCustomers = typeof updater === 'function' ? updater(customers) : updater;
    updateSyncData({ customers: newCustomers });
  };

  const setVehicles = (updater: Vehicle[] | ((prev: Vehicle[]) => Vehicle[])) => {
    const newVehicles = typeof updater === 'function' ? updater(vehicles) : updater;
    updateSyncData({ vehicles: newVehicles });
  };

  const setPackages = (updater: ServicePackage[] | ((prev: ServicePackage[]) => ServicePackage[])) => {
    const newPackages = typeof updater === 'function' ? updater(packages) : updater;
    updateSyncData({ packages: newPackages });
  };

  const setAddOns = (updater: AddOnService[] | ((prev: AddOnService[]) => AddOnService[])) => {
    const newAddOns = typeof updater === 'function' ? updater(addOns) : updater;
    updateSyncData({ addOns: newAddOns });
  };

  const setInventory = (updater: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => {
    const newInventory = typeof updater === 'function' ? updater(inventory) : updater;
    updateSyncData({ inventory: newInventory });
  };

  const setAppointments = (updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    const newAppointments = typeof updater === 'function' ? updater(appointments) : updater;
    updateSyncData({ appointments: newAppointments });
  };

  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry>>({});

  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'customers' | 'vehicles' | 'packages' | 'inventory' | 'reports'>('dashboard');

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.customerName || params.vehicleMake || params.vehicleModel) {
        setShowAppointmentForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayAppointments = appointments.filter(a => a.date === today);
    const monthAppointments = appointments.filter(a => a.date.startsWith(thisMonth) && a.status === 'completed');
    const monthRevenue = monthAppointments.reduce((sum, a) => sum + a.totalPrice - a.discountApplied, 0);
    const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity);

    return {
      todayAppointments: todayAppointments.length,
      monthRevenue,
      totalCustomers: customers.length,
      lowStockCount: lowStockItems.length,
      completedThisMonth: monthAppointments.length,
    };
  }, [appointments, customers, inventory]);

  // Customer functions
  const handleSaveCustomer = (customer: Partial<Customer>) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...customer } as Customer : c));
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        totalVisits: 0,
        totalSpent: 0,
        createdAt: new Date(),
        notes: customer.notes || '',
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This will also delete their vehicles.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setVehicles(prev => prev.filter(v => v.customerId !== id));
    }
  };

  // Vehicle functions
  const handleSaveVehicle = (vehicle: Partial<Vehicle>) => {
    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...vehicle } as Vehicle : v));
    } else {
      const newVehicle: Vehicle = {
        id: generateId(),
        customerId: selectedCustomerId,
        year: vehicle.year || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        licensePlate: vehicle.licensePlate || '',
        vin: vehicle.vin || '',
        size: vehicle.size || 'sedan',
        condition: vehicle.condition || 'good',
        notes: vehicle.notes || '',
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    setShowVehicleForm(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Vehicle',
      message: 'Are you sure you want to delete this vehicle?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  // Appointment functions
  const calculateAppointmentPrice = (packageId: string, vehicleId: string, addOnIds: string[]) => {
    const pkg = packages.find(p => p.id === packageId);
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!pkg || !vehicle) return 0;

    const multiplier = vehicleSizeMultipliers[vehicle.size] || 1;
    let total = pkg.basePrice * multiplier;

    addOnIds.forEach(id => {
      const addOn = addOns.find(a => a.id === id);
      if (addOn) total += addOn.price;
    });

    return total;
  };

  const getRepeatCustomerDiscount = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 0;

    if (customer.totalVisits >= 10) return 0.15; // 15% off
    if (customer.totalVisits >= 5) return 0.10; // 10% off
    if (customer.totalVisits >= 3) return 0.05; // 5% off
    return 0;
  };

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    const basePrice = calculateAppointmentPrice(
      appointment.packageId || '',
      appointment.vehicleId || '',
      appointment.addOnIds || []
    );
    const discountRate = getRepeatCustomerDiscount(appointment.customerId || '');
    const discount = basePrice * discountRate;

    if (editingAppointment) {
      setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? {
        ...a,
        ...appointment,
        totalPrice: basePrice,
        discountApplied: discount,
      } as Appointment : a));
    } else {
      const newAppointment: Appointment = {
        id: generateId(),
        customerId: appointment.customerId || '',
        vehicleId: appointment.vehicleId || '',
        packageId: appointment.packageId || '',
        addOnIds: appointment.addOnIds || [],
        date: appointment.date || '',
        time: appointment.time || '',
        status: 'scheduled',
        isMobile: appointment.isMobile || false,
        location: appointment.location || '',
        completedChecklist: [],
        beforePhotos: [],
        afterPhotos: [],
        timeSpent: 0,
        totalPrice: basePrice,
        discountApplied: discount,
        notes: appointment.notes || '',
      };
      setAppointments(prev => [...prev, newAppointment]);
    }
    setShowAppointmentForm(false);
    setEditingAppointment(null);
  };

  const handleCompleteAppointment = (id: string) => {
    const timeEntry = timeEntries[id];
    const timeSpent = timeEntry ? Math.floor(timeEntry.pausedTime / 60000) : 0;

    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const customer = customers.find(c => c.id === a.customerId);
        if (customer) {
          setCustomers(prevC => prevC.map(c => c.id === customer.id ? {
            ...c,
            totalVisits: c.totalVisits + 1,
            totalSpent: c.totalSpent + a.totalPrice - a.discountApplied,
          } : c));
        }
        return { ...a, status: 'completed' as const, timeSpent };
      }
      return a;
    }));

    setTimeEntries(prev => {
      const newEntries = { ...prev };
      delete newEntries[id];
      return newEntries;
    });
  };

  const handleToggleChecklist = (appointmentId: string, item: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        const completed = a.completedChecklist.includes(item)
          ? a.completedChecklist.filter(i => i !== item)
          : [...a.completedChecklist, item];
        return { ...a, completedChecklist: completed };
      }
      return a;
    }));
  };

  // Time tracking
  const handleStartTimer = (appointmentId: string) => {
    setTimeEntries(prev => ({
      ...prev,
      [appointmentId]: {
        appointmentId,
        startTime: new Date(),
        pausedTime: prev[appointmentId]?.pausedTime || 0,
        isRunning: true,
      },
    }));
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'in-progress' as const } : a));
  };

  const handlePauseTimer = (appointmentId: string) => {
    const entry = timeEntries[appointmentId];
    if (!entry || !entry.startTime) return;

    const elapsed = Date.now() - entry.startTime.getTime();
    setTimeEntries(prev => ({
      ...prev,
      [appointmentId]: {
        ...entry,
        startTime: null,
        pausedTime: entry.pausedTime + elapsed,
        isRunning: false,
      },
    }));
  };

  const handleResetTimer = (appointmentId: string) => {
    setTimeEntries(prev => ({
      ...prev,
      [appointmentId]: {
        appointmentId,
        startTime: null,
        pausedTime: 0,
        isRunning: false,
      },
    }));
  };

  const getElapsedTime = (appointmentId: string) => {
    const entry = timeEntries[appointmentId];
    if (!entry) return 0;

    let total = entry.pausedTime;
    if (entry.isRunning && entry.startTime) {
      total += Date.now() - entry.startTime.getTime();
    }
    return Math.floor(total / 60000); // Convert to minutes
  };

  // Inventory functions
  const handleUpdateInventory = (id: string, quantity: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  // Filter helpers
  const getCustomerVehicles = (customerId: string) => vehicles.filter(v => v.customerId === customerId);
  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  const getPackageById = (id: string) => packages.find(p => p.id === id);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  // Input styles
  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const selectClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const cardClass = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`;

  // Render Tab Content
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Today</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayAppointments}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This Month</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.monthRevenue)}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customers</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 ${stats.lowStockCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'} rounded-lg`}>
              <Package className={`w-5 h-5 ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock</p>
              <p className={`text-xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : isDark ? 'text-white' : 'text-gray-900'}`}>{stats.lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Schedule</h3>
        </div>
        <div className="p-4">
          {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No appointments scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter(a => a.date === new Date().toISOString().split('T')[0])
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(apt => {
                  const customer = getCustomerById(apt.customerId);
                  const vehicle = getVehicleById(apt.vehicleId);
                  const pkg = getPackageById(apt.packageId);
                  return (
                    <div key={apt.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {apt.time}
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer?.name || 'Unknown'}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'No vehicle'} - {pkg?.name || 'No package'}
                          </p>
                        </div>
                      </div>
                      {apt.isMobile && (
                        <div className="flex items-center gap-1 text-[#0D9488]">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs">{t('tools.autoDetailing.mobile', 'Mobile')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setShowAppointmentForm(true); setActiveTab('appointments'); }}
          className="p-4 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t('tools.autoDetailing.newAppointment', 'New Appointment')}
        </button>
        <button
          onClick={() => { setShowCustomerForm(true); setActiveTab('customers'); }}
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} font-medium flex items-center justify-center gap-2 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <User className="w-5 h-5" />
          {t('tools.autoDetailing.addCustomer', 'Add Customer')}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} font-medium flex items-center justify-center gap-2 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Package className="w-5 h-5" />
          {t('tools.autoDetailing.inventory', 'Inventory')}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} font-medium flex items-center justify-center gap-2 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <BarChart3 className="w-5 h-5" />
          {t('tools.autoDetailing.reports', 'Reports')}
        </button>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.autoDetailing.searchAppointments', 'Search appointments...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <button
          onClick={() => setShowAppointmentForm(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t('tools.autoDetailing.newAppointment2', 'New Appointment')}
        </button>
      </div>

      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          customers={customers}
          vehicles={vehicles}
          packages={packages}
          addOns={addOns}
          onSave={handleSaveAppointment}
          onCancel={() => { setShowAppointmentForm(false); setEditingAppointment(null); }}
          isDark={isDark}
          inputClass={inputClass}
          selectClass={selectClass}
          labelClass={labelClass}
        />
      )}

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.autoDetailing.noAppointmentsYetCreateYour', 'No appointments yet. Create your first one!')}</p>
          </div>
        ) : (
          appointments
            .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
            .map(apt => {
              const customer = getCustomerById(apt.customerId);
              const vehicle = getVehicleById(apt.vehicleId);
              const pkg = getPackageById(apt.packageId);
              const isExpanded = expandedAppointment === apt.id;
              const elapsed = getElapsedTime(apt.id);
              const timeEntry = timeEntries[apt.id];

              return (
                <div key={apt.id} className={cardClass}>
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedAppointment(isExpanded ? null : apt.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {apt.status}
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {customer?.name || 'Unknown Customer'}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'No vehicle'} - {pkg?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{apt.date}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{apt.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#0D9488]">{formatCurrency(apt.totalPrice - apt.discountApplied)}</p>
                          {apt.discountApplied > 0 && (
                            <p className="text-xs text-green-600">-{formatCurrency(apt.discountApplied)} discount</p>
                          )}
                        </div>
                        {apt.isMobile && <Truck className="w-5 h-5 text-[#0D9488]" />}
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4 space-y-4`}>
                      {/* Time Tracking */}
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-[#0D9488]" />
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Time: {formatTime(elapsed)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {timeEntry?.isRunning ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePauseTimer(apt.id); }}
                                  className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStartTimer(apt.id); }}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResetTimer(apt.id); }}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Checklist */}
                      {pkg && (
                        <div>
                          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.serviceChecklist', 'Service Checklist')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {pkg.checklist.map((item, idx) => (
                              <label
                                key={idx}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={apt.completedChecklist.includes(item)}
                                  onChange={() => handleToggleChecklist(apt.id, item)}
                                  className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                                />
                                <span className={`text-sm ${apt.completedChecklist.includes(item) ? 'line-through text-gray-400' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {item}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Photos Placeholder */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} text-center`}>
                          <Camera className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.beforePhotos', 'Before Photos')}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{apt.beforePhotos.length} photos</p>
                        </div>
                        <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} text-center`}>
                          <Image className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.afterPhotos', 'After Photos')}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{apt.afterPhotos.length} photos</p>
                        </div>
                      </div>

                      {/* Mobile Location */}
                      {apt.isMobile && apt.location && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center gap-2`}>
                          <MapPin className="w-4 h-4 text-[#0D9488]" />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{apt.location}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {apt.notes && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{apt.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartTimer(apt.id); }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            {t('tools.autoDetailing.startJob', 'Start Job')}
                          </button>
                        )}
                        {apt.status === 'in-progress' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(apt.id); }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <CheckSquare className="w-4 h-4" />
                            {t('tools.autoDetailing.complete', 'Complete')}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingAppointment(apt); setShowAppointmentForm(true); }}
                          className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.autoDetailing.searchCustomers', 'Search customers...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <button
          onClick={() => setShowCustomerForm(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t('tools.autoDetailing.addCustomer2', 'Add Customer')}
        </button>
      </div>

      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
          isDark={isDark}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}

      {showVehicleForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onSave={handleSaveVehicle}
          onCancel={() => { setShowVehicleForm(false); setEditingVehicle(null); }}
          isDark={isDark}
          inputClass={inputClass}
          selectClass={selectClass}
          labelClass={labelClass}
        />
      )}

      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <User className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.autoDetailing.noCustomersYetAddYour', 'No customers yet. Add your first customer!')}</p>
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const customerVehicles = getCustomerVehicles(customer.id);
            const discount = getRepeatCustomerDiscount(customer.id);

            return (
              <div key={customer.id} className={cardClass}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.name}</h3>
                          {discount > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              {Math.round(discount * 100)}% loyalty discount
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          {customer.phone && (
                            <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Phone className="w-3 h-3" /> {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{customer.totalVisits} visits</p>
                        <p className="font-medium text-[#0D9488]">{formatCurrency(customer.totalSpent)}</p>
                      </div>
                      <button
                        onClick={() => { setEditingCustomer(customer); setShowCustomerForm(true); }}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vehicles */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.vehicles', 'Vehicles')}</h4>
                      <button
                        onClick={() => { setSelectedCustomerId(customer.id); setShowVehicleForm(true); }}
                        className="text-[#0D9488] text-sm flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Add Vehicle
                      </button>
                    </div>
                    {customerVehicles.length === 0 ? (
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.autoDetailing.noVehiclesRegistered', 'No vehicles registered')}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {customerVehicles.map(vehicle => (
                          <div key={vehicle.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-[#0D9488]" />
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {vehicle.color} - {vehicle.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setEditingVehicle(vehicle); setSelectedCustomerId(customer.id); setShowVehicleForm(true); }}
                                className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderPackages = () => (
    <div className="space-y-6">
      {/* Service Packages */}
      <div>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.servicePackages', 'Service Packages')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className={`${cardClass} overflow-hidden`}>
              <div className={`p-4 ${
                pkg.type === 'interior' ? 'bg-blue-500' :
                pkg.type === 'exterior' ? 'bg-green-500' :
                'bg-purple-500'
              }`}>
                <h4 className="font-semibold text-white">{pkg.name}</h4>
                <p className="text-white/80 text-sm">{pkg.description}</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(pkg.basePrice)}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatTime(pkg.estimatedTime)}</span>
                </div>
                <div className="space-y-1">
                  {pkg.checklist.slice(0, 4).map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <CheckSquare className="w-3 h-3 text-[#0D9488]" />
                      {item}
                    </div>
                  ))}
                  {pkg.checklist.length > 4 && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+{pkg.checklist.length - 4} more items</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Size Pricing */}
      <div>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.pricingByVehicleSize', 'Pricing by Vehicle Size')}</h3>
        <div className={`${cardClass} p-4`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(vehicleSizeMultipliers).map(([size, multiplier]) => (
              <div key={size} className="text-center">
                <p className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{size}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {multiplier === 1 ? 'Base Price' : `${Math.round((multiplier - 1) * 100)}% extra`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add-On Services */}
      <div>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.addOnServices', 'Add-On Services')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {addOns.map(addon => (
            <div key={addon.id} className={`${cardClass} p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D9488]" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{addon.name}</h4>
                </div>
                <span className="font-bold text-[#0D9488]">{formatCurrency(addon.price)}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>{addon.description}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatTime(addon.estimatedTime)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty Discounts */}
      <div>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.repeatCustomerDiscounts', 'Repeat Customer Discounts')}</h3>
        <div className={`${cardClass} p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Percent className="w-8 h-8 mx-auto mb-2 text-[#0D9488]" />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>3+ Visits</p>
              <p className="text-2xl font-bold text-[#0D9488]">5% Off</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Percent className="w-8 h-8 mx-auto mb-2 text-[#0D9488]" />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>5+ Visits</p>
              <p className="text-2xl font-bold text-[#0D9488]">10% Off</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Percent className="w-8 h-8 mx-auto mb-2 text-[#0D9488]" />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>10+ Visits</p>
              <p className="text-2xl font-bold text-[#0D9488]">15% Off</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-4">
      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.productSupplyInventory', 'Product & Supply Inventory')}</h3>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.product', 'Product')}</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.category', 'Category')}</th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.quantity', 'Quantity')}</th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.minStock', 'Min. Stock')}</th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.unitCost', 'Unit Cost')}</th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.status', 'Status')}</th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.autoDetailing.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {inventory.map(item => (
                <tr key={item.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                  <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.category}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateInventory(item.id, parseInt(e.target.value) || 0)}
                      className={`w-20 px-2 py-1 text-center rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-200'} border`}
                      min="0"
                    />
                  </td>
                  <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.minQuantity}</td>
                  <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(item.unitCost)}/{item.unit}</td>
                  <td className="px-4 py-3 text-center">
                    {item.quantity <= item.minQuantity ? (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">{t('tools.autoDetailing.lowStock', 'Low Stock')}</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">{t('tools.autoDetailing.inStock', 'In Stock')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdateInventory(item.id, item.quantity + 1)}
                        className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Plus className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => handleUpdateInventory(item.id, Math.max(0, item.quantity - 1))}
                        className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

    const thisMonthAppointments = appointments.filter(a => a.date.startsWith(thisMonth) && a.status === 'completed');
    const lastMonthAppointments = appointments.filter(a => a.date.startsWith(lastMonth) && a.status === 'completed');

    const thisMonthRevenue = thisMonthAppointments.reduce((sum, a) => sum + a.totalPrice - a.discountApplied, 0);
    const lastMonthRevenue = lastMonthAppointments.reduce((sum, a) => sum + a.totalPrice - a.discountApplied, 0);

    const avgJobValue = thisMonthAppointments.length > 0 ? thisMonthRevenue / thisMonthAppointments.length : 0;
    const totalDiscounts = thisMonthAppointments.reduce((sum, a) => sum + a.discountApplied, 0);

    const packageBreakdown = packages.map(pkg => ({
      name: pkg.name,
      count: thisMonthAppointments.filter(a => a.packageId === pkg.id).length,
      revenue: thisMonthAppointments.filter(a => a.packageId === pkg.id).reduce((sum, a) => sum + a.totalPrice - a.discountApplied, 0),
    }));

    return (
      <div className="space-y-6">
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.revenueReports', 'Revenue Reports')}</h3>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.thisMonthRevenue', 'This Month Revenue')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(thisMonthRevenue)}</p>
            {lastMonthRevenue > 0 && (
              <p className={`text-sm ${thisMonthRevenue >= lastMonthRevenue ? 'text-green-500' : 'text-red-500'}`}>
                {thisMonthRevenue >= lastMonthRevenue ? '+' : ''}{Math.round((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)}% vs last month
              </p>
            )}
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.jobsCompleted', 'Jobs Completed')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{thisMonthAppointments.length}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.avgJobValue', 'Avg Job Value')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(avgJobValue)}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.discountsGiven', 'Discounts Given')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalDiscounts)}</p>
          </div>
        </div>

        {/* Package Breakdown */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.revenueByPackage', 'Revenue by Package')}</h4>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {packageBreakdown.map(pkg => (
                <div key={pkg.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</span>
                      <span className="text-[#0D9488] font-medium">{formatCurrency(pkg.revenue)}</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]"
                        style={{ width: `${thisMonthRevenue > 0 ? (pkg.revenue / thisMonthRevenue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-20 text-right`}>{pkg.count} jobs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.topCustomersAllTime', 'Top Customers (All Time)')}</h4>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {customers
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5)
                .map((customer, idx) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#0D9488]">{formatCurrency(customer.totalSpent)}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{customer.totalVisits} visits</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Export data preparation
  const getExportData = useMemo(() => {
    // Prepare appointments data with resolved names
    const appointmentData = appointments.map(apt => {
      const customer = customers.find(c => c.id === apt.customerId);
      const vehicle = vehicles.find(v => v.id === apt.vehicleId);
      const pkg = packages.find(p => p.id === apt.packageId);
      return {
        ...apt,
        customerName: customer?.name || 'Unknown',
        vehicleInfo: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown',
        packageName: pkg?.name || 'Unknown',
      };
    });
    return {
      appointments: appointmentData,
      customers,
      inventory,
    };
  }, [appointments, customers, vehicles, packages, inventory]);

  // Export handlers
  const handleExportCSV = () => {
    const data = getExportData;
    if (activeTab === 'customers') {
      exportToCSV(data.customers, CUSTOMER_COLUMNS, { filename: 'auto-detailing-customers' });
    } else if (activeTab === 'inventory') {
      exportToCSV(data.inventory, INVENTORY_COLUMNS, { filename: 'auto-detailing-inventory' });
    } else {
      exportToCSV(data.appointments, APPOINTMENT_COLUMNS, { filename: 'auto-detailing-appointments' });
    }
  };

  const handleExportExcel = () => {
    const data = getExportData;
    if (activeTab === 'customers') {
      exportToExcel(data.customers, CUSTOMER_COLUMNS, { filename: 'auto-detailing-customers' });
    } else if (activeTab === 'inventory') {
      exportToExcel(data.inventory, INVENTORY_COLUMNS, { filename: 'auto-detailing-inventory' });
    } else {
      exportToExcel(data.appointments, APPOINTMENT_COLUMNS, { filename: 'auto-detailing-appointments' });
    }
  };

  const handleExportJSON = () => {
    const data = getExportData;
    if (activeTab === 'customers') {
      exportToJSON(data.customers, { filename: 'auto-detailing-customers' });
    } else if (activeTab === 'inventory') {
      exportToJSON(data.inventory, { filename: 'auto-detailing-inventory' });
    } else {
      exportToJSON(data.appointments, { filename: 'auto-detailing-appointments' });
    }
  };

  const handleExportPDF = async () => {
    const data = getExportData;
    if (activeTab === 'customers') {
      await exportToPDF(data.customers, CUSTOMER_COLUMNS, { filename: 'auto-detailing-customers' });
    } else if (activeTab === 'inventory') {
      await exportToPDF(data.inventory, INVENTORY_COLUMNS, { filename: 'auto-detailing-inventory' });
    } else {
      await exportToPDF(data.appointments, APPOINTMENT_COLUMNS, { filename: 'auto-detailing-appointments' });
    }
  };

  const handlePrint = () => {
    const data = getExportData;
    if (activeTab === 'customers') {
      printData(data.customers, CUSTOMER_COLUMNS, { title: 'Auto Detailing Customers' });
    } else if (activeTab === 'inventory') {
      printData(data.inventory, INVENTORY_COLUMNS, { title: 'Auto Detailing Inventory' });
    } else {
      printData(data.appointments, APPOINTMENT_COLUMNS, { title: 'Auto Detailing Appointments' });
    }
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const data = getExportData;
    if (activeTab === 'customers') {
      return copyUtil(data.customers, CUSTOMER_COLUMNS);
    } else if (activeTab === 'inventory') {
      return copyUtil(data.inventory, INVENTORY_COLUMNS);
    } else {
      return copyUtil(data.appointments, APPOINTMENT_COLUMNS);
    }
  };

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: User },
    { id: 'packages', label: 'Packages', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'reports', label: 'Reports', icon: DollarSign },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-8`}>
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.autoDetailing.loadingAutoDetailingData', 'Loading auto detailing data...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.autoDetailing.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.autoDetailing.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Car className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.autoDetailing.autoDetailingBusinessManager', 'Auto Detailing Business Manager')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.autoDetailing.manageAppointmentsCustomersAndTrack', 'Manage appointments, customers, and track your detailing business')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="auto-detailing" toolName="Auto Detailing" />

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

      {/* Navigation Tabs */}
      <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prefilled indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mx-4 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.autoDetailing.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'packages' && renderPackages()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'reports' && renderReports()}
      </div>

      <ConfirmDialog />
    </div>
  );
};

// Sub-components
interface CustomerFormProps {
  customer: Customer | null;
  onSave: (customer: Partial<Customer>) => void;
  onCancel: () => void;
  isDark: boolean;
  inputClass: string;
  labelClass: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel, isDark, inputClass, labelClass }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });

  return (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {customer ? t('tools.autoDetailing.editCustomer', 'Edit Customer') : t('tools.autoDetailing.newCustomer', 'New Customer')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.name', 'Name *')}</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.customerName', 'Customer name')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.phone', 'Phone')}</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={inputClass}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.email', 'Email')}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.customerExampleCom', 'customer@example.com')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.address', 'Address')}</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.123MainStCityState', '123 Main St, City, State')}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>{t('tools.autoDetailing.notes', 'Notes')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={inputClass}
          rows={2}
          placeholder={t('tools.autoDetailing.anyAdditionalNotes', 'Any additional notes...')}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
        >
          {t('tools.autoDetailing.cancel', 'Cancel')}
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={!formData.name}
          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {t('tools.autoDetailing.save', 'Save')}
        </button>
      </div>
    </div>
  );
};

interface VehicleFormProps {
  vehicle: Vehicle | null;
  onSave: (vehicle: Partial<Vehicle>) => void;
  onCancel: () => void;
  isDark: boolean;
  inputClass: string;
  selectClass: string;
  labelClass: string;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSave, onCancel, isDark, inputClass, selectClass, labelClass }) => {
  const [formData, setFormData] = useState({
    year: vehicle?.year || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    color: vehicle?.color || '',
    licensePlate: vehicle?.licensePlate || '',
    vin: vehicle?.vin || '',
    size: vehicle?.size || 'sedan',
    condition: vehicle?.condition || 'good',
    notes: vehicle?.notes || '',
  });

  return (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {vehicle ? t('tools.autoDetailing.editVehicle', 'Edit Vehicle') : t('tools.autoDetailing.addVehicle', 'Add Vehicle')}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.year', 'Year *')}</label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className={inputClass}
            placeholder="2024"
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.make', 'Make *')}</label>
          <input
            type="text"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.toyota', 'Toyota')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.model', 'Model *')}</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.camry', 'Camry')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.color', 'Color')}</label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.black', 'Black')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.licensePlate', 'License Plate')}</label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.abc1234', 'ABC-1234')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.vin', 'VIN')}</label>
          <input
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.vinNumber', 'VIN number')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.size', 'Size')}</label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value as Vehicle['size'] })}
            className={selectClass}
          >
            <option value="compact">{t('tools.autoDetailing.compact', 'Compact')}</option>
            <option value="sedan">{t('tools.autoDetailing.sedan', 'Sedan')}</option>
            <option value="suv">{t('tools.autoDetailing.suv', 'SUV')}</option>
            <option value="truck">{t('tools.autoDetailing.truck', 'Truck')}</option>
            <option value="van">{t('tools.autoDetailing.van', 'Van')}</option>
            <option value="luxury">{t('tools.autoDetailing.luxury', 'Luxury')}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.condition', 'Condition')}</label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as Vehicle['condition'] })}
            className={selectClass}
          >
            <option value="excellent">{t('tools.autoDetailing.excellent', 'Excellent')}</option>
            <option value="good">{t('tools.autoDetailing.good', 'Good')}</option>
            <option value="fair">{t('tools.autoDetailing.fair', 'Fair')}</option>
            <option value="poor">{t('tools.autoDetailing.poor', 'Poor')}</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>{t('tools.autoDetailing.notes2', 'Notes')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={inputClass}
          rows={2}
          placeholder={t('tools.autoDetailing.anySpecificNotesAboutThis', 'Any specific notes about this vehicle...')}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
        >
          {t('tools.autoDetailing.cancel2', 'Cancel')}
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={!formData.year || !formData.make || !formData.model}
          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {t('tools.autoDetailing.save2', 'Save')}
        </button>
      </div>
    </div>
  );
};

interface AppointmentFormProps {
  appointment: Appointment | null;
  customers: Customer[];
  vehicles: Vehicle[];
  packages: ServicePackage[];
  addOns: AddOnService[];
  onSave: (appointment: Partial<Appointment>) => void;
  onCancel: () => void;
  isDark: boolean;
  inputClass: string;
  selectClass: string;
  labelClass: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  customers,
  vehicles,
  packages,
  addOns,
  onSave,
  onCancel,
  isDark,
  inputClass,
  selectClass,
  labelClass,
}) => {
  const [formData, setFormData] = useState({
    customerId: appointment?.customerId || '',
    vehicleId: appointment?.vehicleId || '',
    packageId: appointment?.packageId || packages[0]?.id || '',
    addOnIds: appointment?.addOnIds || [],
    date: appointment?.date || new Date().toISOString().split('T')[0],
    time: appointment?.time || '09:00',
    isMobile: appointment?.isMobile || false,
    location: appointment?.location || '',
    notes: appointment?.notes || '',
  });

  const customerVehicles = vehicles.filter(v => v.customerId === formData.customerId);

  const toggleAddOn = (id: string) => {
    setFormData(prev => ({
      ...prev,
      addOnIds: prev.addOnIds.includes(id)
        ? prev.addOnIds.filter(i => i !== id)
        : [...prev.addOnIds, id],
    }));
  };

  return (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {appointment ? t('tools.autoDetailing.editAppointment', 'Edit Appointment') : t('tools.autoDetailing.newAppointment3', 'New Appointment')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.customer', 'Customer *')}</label>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value, vehicleId: '' })}
            className={selectClass}
          >
            <option value="">{t('tools.autoDetailing.selectCustomer', 'Select customer')}</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.vehicle', 'Vehicle *')}</label>
          <select
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            className={selectClass}
            disabled={!formData.customerId}
          >
            <option value="">{t('tools.autoDetailing.selectVehicle', 'Select vehicle')}</option>
            {customerVehicles.map(v => (
              <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.servicePackage', 'Service Package *')}</label>
          <select
            value={formData.packageId}
            onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
            className={selectClass}
          >
            {packages.map(p => (
              <option key={p.id} value={p.id}>{p.name} - ${p.basePrice}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.date', 'Date *')}</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.time', 'Time *')}</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isMobile}
              onChange={(e) => setFormData({ ...formData, isMobile: e.target.checked })}
              className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.autoDetailing.mobileService', 'Mobile Service')}</span>
          </label>
        </div>
      </div>

      {formData.isMobile && (
        <div>
          <label className={labelClass}>{t('tools.autoDetailing.serviceLocation', 'Service Location')}</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className={inputClass}
            placeholder={t('tools.autoDetailing.addressForMobileService', 'Address for mobile service')}
          />
        </div>
      )}

      <div>
        <label className={labelClass}>{t('tools.autoDetailing.addOnServices2', 'Add-On Services')}</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {addOns.map(addon => (
            <label
              key={addon.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${
                formData.addOnIds.includes(addon.id)
                  ? 'border-[#0D9488] bg-[#0D9488]/10'
                  : isDark ? 'border-gray-600' : 'border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.addOnIds.includes(addon.id)}
                onChange={() => toggleAddOn(addon.id)}
                className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{addon.name}</p>
                <p className="text-xs text-[#0D9488]">${addon.price}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('tools.autoDetailing.notes3', 'Notes')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={inputClass}
          rows={2}
          placeholder={t('tools.autoDetailing.anySpecialInstructionsOrNotes', 'Any special instructions or notes...')}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
        >
          {t('tools.autoDetailing.cancel3', 'Cancel')}
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={!formData.customerId || !formData.vehicleId || !formData.packageId || !formData.date || !formData.time}
          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {appointment ? t('tools.autoDetailing.update', 'Update') : t('tools.autoDetailing.create', 'Create')} Appointment
        </button>
      </div>
    </div>
  );
};

export default AutoDetailingTool;
