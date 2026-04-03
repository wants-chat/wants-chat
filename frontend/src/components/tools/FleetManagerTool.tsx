'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Truck,
  Car,
  Users,
  Wrench,
  Fuel,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Hash,
  Gauge,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  MapPin,
  DollarSign,
  Bell,
  Filter,
  Activity,
  Settings,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
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
interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  type: 'truck' | 'van' | 'car' | 'bus' | 'motorcycle' | 'trailer' | 'other';
  status: 'active' | 'maintenance' | 'out-of-service' | 'retired';
  color: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';
  tankCapacity: number;
  currentMileage: number;
  assignedDriverId: string | null;
  purchaseDate: string;
  purchasePrice: number;
  insuranceExpiry: string;
  registrationExpiry: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  dateHired: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'scheduled' | 'unscheduled' | 'inspection' | 'repair' | 'recall';
  description: string;
  date: string;
  mileageAtService: number;
  cost: number;
  vendor: string;
  nextServiceDate: string;
  nextServiceMileage: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

interface FuelLog {
  id: string;
  vehicleId: string;
  driverId: string | null;
  date: string;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  mileage: number;
  station: string;
  fuelType: string;
  notes: string;
  createdAt: string;
}

interface Alert {
  id: string;
  vehicleId: string;
  type: 'insurance' | 'registration' | 'maintenance' | 'license';
  message: string;
  dueDate: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  createdAt: string;
}

type TabType = 'vehicles' | 'drivers' | 'maintenance' | 'fuel' | 'reports';

const STORAGE_KEY = 'fleet-manager-data';

const VEHICLE_TYPES: { value: FleetVehicle['type']; label: string }[] = [
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'car', label: 'Car' },
  { value: 'bus', label: 'Bus' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'other', label: 'Other' },
];

const VEHICLE_STATUSES: { value: FleetVehicle['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'out-of-service', label: 'Out of Service' },
  { value: 'retired', label: 'Retired' },
];

const FUEL_TYPES: { value: FleetVehicle['fuelType']; label: string }[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'cng', label: 'CNG' },
  { value: 'lpg', label: 'LPG' },
];

const DRIVER_STATUSES: { value: Driver['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
];

const MAINTENANCE_TYPES: { value: MaintenanceRecord['type']; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled Maintenance' },
  { value: 'unscheduled', label: 'Unscheduled Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'recall', label: 'Recall' },
];

// Column configurations for export
const vehicleColumns: ColumnConfig[] = [
  { key: 'licensePlate', header: 'License Plate', type: 'string' },
  { key: 'make', header: 'Make', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'vin', header: 'VIN', type: 'string' },
  { key: 'type', header: 'Type', type: 'string', format: (v) => VEHICLE_TYPES.find(t => t.value === v)?.label || v },
  { key: 'status', header: 'Status', type: 'string', format: (v) => VEHICLE_STATUSES.find(s => s.value === v)?.label || v },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'fuelType', header: 'Fuel Type', type: 'string', format: (v) => FUEL_TYPES.find(f => f.value === v)?.label || v },
  { key: 'currentMileage', header: 'Current Mileage', type: 'number' },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
  { key: 'purchasePrice', header: 'Purchase Price', type: 'currency' },
  { key: 'insuranceExpiry', header: 'Insurance Expiry', type: 'date' },
  { key: 'registrationExpiry', header: 'Registration Expiry', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const driverColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'licenseNumber', header: 'License Number', type: 'string' },
  { key: 'licenseType', header: 'License Type', type: 'string' },
  { key: 'licenseExpiry', header: 'License Expiry', type: 'date' },
  { key: 'status', header: 'Status', type: 'string', format: (v) => DRIVER_STATUSES.find(s => s.value === v)?.label || v },
  { key: 'dateHired', header: 'Date Hired', type: 'date' },
  { key: 'emergencyContact', header: 'Emergency Contact', type: 'string' },
  { key: 'emergencyPhone', header: 'Emergency Phone', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const maintenanceColumns: ColumnConfig[] = [
  { key: 'vehicleId', header: 'Vehicle ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string', format: (v) => MAINTENANCE_TYPES.find(t => t.value === v)?.label || v },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'mileageAtService', header: 'Mileage at Service', type: 'number' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'vendor', header: 'Vendor', type: 'string' },
  { key: 'nextServiceDate', header: 'Next Service Date', type: 'date' },
  { key: 'nextServiceMileage', header: 'Next Service Mileage', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const fuelLogColumns: ColumnConfig[] = [
  { key: 'vehicleId', header: 'Vehicle ID', type: 'string' },
  { key: 'driverId', header: 'Driver ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'gallons', header: 'Gallons', type: 'number' },
  { key: 'pricePerGallon', header: 'Price Per Gallon', type: 'currency' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'mileage', header: 'Mileage', type: 'number' },
  { key: 'station', header: 'Station', type: 'string' },
  { key: 'fuelType', header: 'Fuel Type', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Sample data generator
const generateSampleData = () => {
  const sampleVehicles: FleetVehicle[] = [
    {
      id: '1',
      make: 'Ford',
      model: 'F-150',
      year: 2022,
      vin: '1FTFW1E50NFB12345',
      licensePlate: 'FLT-001',
      type: 'truck',
      status: 'active',
      color: 'White',
      fuelType: 'gasoline',
      tankCapacity: 26,
      currentMileage: 45230,
      assignedDriverId: '1',
      purchaseDate: '2022-03-15',
      purchasePrice: 52000,
      insuranceExpiry: '2025-03-15',
      registrationExpiry: '2025-06-30',
      notes: 'Primary delivery vehicle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      make: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2021,
      vin: 'WD3PE8CD5MP123456',
      licensePlate: 'FLT-002',
      type: 'van',
      status: 'active',
      color: 'Silver',
      fuelType: 'diesel',
      tankCapacity: 24.5,
      currentMileage: 78450,
      assignedDriverId: '2',
      purchaseDate: '2021-08-20',
      purchasePrice: 48500,
      insuranceExpiry: '2025-08-20',
      registrationExpiry: '2025-09-15',
      notes: 'Cargo van for large deliveries',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      make: 'Chevrolet',
      model: 'Express 2500',
      year: 2023,
      vin: '1GCWGBFG5P1234567',
      licensePlate: 'FLT-003',
      type: 'van',
      status: 'maintenance',
      color: 'Blue',
      fuelType: 'gasoline',
      tankCapacity: 31,
      currentMileage: 23100,
      assignedDriverId: null,
      purchaseDate: '2023-01-10',
      purchasePrice: 41000,
      insuranceExpiry: '2026-01-10',
      registrationExpiry: '2026-02-28',
      notes: 'Currently in for brake service',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleDrivers: Driver[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@fleet.com',
      phone: '+1 (555) 123-4567',
      licenseNumber: 'DL12345678',
      licenseType: 'CDL Class B',
      licenseExpiry: '2026-05-15',
      status: 'active',
      dateHired: '2020-06-01',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '+1 (555) 123-4568',
      notes: 'Senior driver, 10+ years experience',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@fleet.com',
      phone: '+1 (555) 234-5678',
      licenseNumber: 'DL87654321',
      licenseType: 'CDL Class B',
      licenseExpiry: '2025-11-30',
      status: 'active',
      dateHired: '2021-03-15',
      emergencyContact: 'Carlos Garcia',
      emergencyPhone: '+1 (555) 234-5679',
      notes: 'Excellent safety record',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleMaintenance: MaintenanceRecord[] = [
    {
      id: '1',
      vehicleId: '1',
      type: 'scheduled',
      description: 'Oil change and tire rotation',
      date: '2024-12-15',
      mileageAtService: 45000,
      cost: 185,
      vendor: 'Quick Lube Express',
      nextServiceDate: '2025-03-15',
      nextServiceMileage: 50000,
      status: 'completed',
      notes: 'All fluids topped off',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      vehicleId: '3',
      type: 'repair',
      description: 'Brake pad replacement and rotor resurface',
      date: '2024-12-28',
      mileageAtService: 23100,
      cost: 650,
      vendor: 'City Auto Service',
      nextServiceDate: '2025-06-28',
      nextServiceMileage: 35000,
      status: 'in-progress',
      notes: 'Front and rear brakes',
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleFuelLogs: FuelLog[] = [
    {
      id: '1',
      vehicleId: '1',
      driverId: '1',
      date: '2024-12-27',
      gallons: 22.5,
      pricePerGallon: 3.29,
      totalCost: 74.03,
      mileage: 45230,
      station: 'Shell Station #1234',
      fuelType: 'Regular Unleaded',
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      vehicleId: '2',
      driverId: '2',
      date: '2024-12-26',
      gallons: 24.0,
      pricePerGallon: 3.89,
      totalCost: 93.36,
      mileage: 78450,
      station: 'BP Truck Stop',
      fuelType: 'Diesel',
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    vehicles: sampleVehicles,
    drivers: sampleDrivers,
    maintenance: sampleMaintenance,
    fuelLogs: sampleFuelLogs,
    alerts: [] as Alert[],
  };
};

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    vehicles: [],
    drivers: [],
    maintenance: [],
    fuelLogs: [],
    alerts: [],
  };
};

const saveData = (data: {
  vehicles: FleetVehicle[];
  drivers: Driver[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  alerts: Alert[];
}) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

interface FleetManagerToolProps {
  uiConfig?: UIConfig;
}

export const FleetManagerTool: React.FC<FleetManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');

  // Use useToolData hooks for backend persistence
  const {
    data: vehicles,
    addItem: addVehicle,
    updateItem: updateVehicle,
    deleteItem: deleteVehicle,
    exportCSV: exportVehiclesCSV,
    exportExcel: exportVehiclesExcel,
    exportJSON: exportVehiclesJSON,
    exportPDF: exportVehiclesPDF,
    print: printVehicles,
    copyToClipboard: copyVehicles,
    isLoading: vehiclesLoading,
    isSaving: vehiclesSaving,
    isSynced: vehiclesSynced,
    lastSaved: vehiclesLastSaved,
    syncError: vehiclesSyncError,
    forceSync: forceVehiclesSync,
  } = useToolData<FleetVehicle>('fleet-vehicles', [], vehicleColumns);

  const {
    data: drivers,
    addItem: addDriver,
    updateItem: updateDriver,
    deleteItem: deleteDriver,
    exportCSV: exportDriversCSV,
    exportExcel: exportDriversExcel,
    exportJSON: exportDriversJSON,
    exportPDF: exportDriversPDF,
    print: printDrivers,
    copyToClipboard: copyDrivers,
    isLoading: driversLoading,
    isSaving: driversSaving,
    isSynced: driversSynced,
    lastSaved: driversLastSaved,
    syncError: driversSyncError,
    forceSync: forceDriversSync,
  } = useToolData<Driver>('fleet-drivers', [], driverColumns);

  const {
    data: maintenance,
    addItem: addMaintenance,
    updateItem: updateMaintenance,
    deleteItem: deleteMaintenance,
    exportCSV: exportMaintenanceCSV,
    exportExcel: exportMaintenanceExcel,
    exportJSON: exportMaintenanceJSON,
    exportPDF: exportMaintenancePDF,
    print: printMaintenance,
    copyToClipboard: copyMaintenance,
    isLoading: maintenanceLoading,
    isSaving: maintenanceSaving,
    isSynced: maintenanceSynced,
    lastSaved: maintenanceLastSaved,
    syncError: maintenanceSyncError,
    forceSync: forceMaintenanceSync,
  } = useToolData<MaintenanceRecord>('fleet-maintenance', [], maintenanceColumns);

  const {
    data: fuelLogs,
    addItem: addFuelLog,
    updateItem: updateFuelLog,
    deleteItem: deleteFuelLog,
    exportCSV: exportFuelLogsCSV,
    exportExcel: exportFuelLogsExcel,
    exportJSON: exportFuelLogsJSON,
    exportPDF: exportFuelLogsPDF,
    print: printFuelLogs,
    copyToClipboard: copyFuelLogs,
    isLoading: fuelLogsLoading,
    isSaving: fuelLogsSaving,
    isSynced: fuelLogsSynced,
    lastSaved: fuelLogsLastSaved,
    syncError: fuelLogsSyncError,
    forceSync: forceFuelLogsSync,
  } = useToolData<FuelLog>('fleet-fuel-logs', [], fuelLogColumns);

  // Local alerts state (generated from vehicle/driver data)
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Form states
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [editingFuel, setEditingFuel] = useState<FuelLog | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('');
  const [filterVehicleStatus, setFilterVehicleStatus] = useState<string>('');
  const [filterDriverStatus, setFilterDriverStatus] = useState<string>('');
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    type: 'truck' as FleetVehicle['type'],
    status: 'active' as FleetVehicle['status'],
    color: '',
    fuelType: 'gasoline' as FleetVehicle['fuelType'],
    tankCapacity: 0,
    currentMileage: 0,
    assignedDriverId: '' as string | null,
    purchaseDate: '',
    purchasePrice: 0,
    insuranceExpiry: '',
    registrationExpiry: '',
    notes: '',
  });

  // Driver form
  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseType: '',
    licenseExpiry: '',
    status: 'active' as Driver['status'],
    dateHired: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  // Maintenance form
  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '',
    type: 'scheduled' as MaintenanceRecord['type'],
    description: '',
    date: new Date().toISOString().split('T')[0],
    mileageAtService: 0,
    cost: 0,
    vendor: '',
    nextServiceDate: '',
    nextServiceMileage: 0,
    status: 'scheduled' as MaintenanceRecord['status'],
    notes: '',
  });

  // Fuel form
  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    driverId: '' as string | null,
    date: new Date().toISOString().split('T')[0],
    gallons: 0,
    pricePerGallon: 0,
    totalCost: 0,
    mileage: 0,
    station: '',
    fuelType: 'Regular Unleaded',
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

  // Generate alerts on data change
  useEffect(() => {
    generateAlerts();
  }, [vehicles, drivers]);

  // Generate alerts for expiring items
  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    vehicles.forEach((vehicle) => {
      // Insurance expiry
      if (vehicle.insuranceExpiry) {
        const expiryDate = new Date(vehicle.insuranceExpiry);
        if (expiryDate <= thirtyDaysFromNow) {
          newAlerts.push({
            id: `ins-${vehicle.id}`,
            vehicleId: vehicle.id,
            type: 'insurance',
            message: `Insurance expires on ${vehicle.insuranceExpiry}`,
            dueDate: vehicle.insuranceExpiry,
            status: expiryDate < today ? 'pending' : 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Registration expiry
      if (vehicle.registrationExpiry) {
        const expiryDate = new Date(vehicle.registrationExpiry);
        if (expiryDate <= thirtyDaysFromNow) {
          newAlerts.push({
            id: `reg-${vehicle.id}`,
            vehicleId: vehicle.id,
            type: 'registration',
            message: `Registration expires on ${vehicle.registrationExpiry}`,
            dueDate: vehicle.registrationExpiry,
            status: expiryDate < today ? 'pending' : 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    drivers.forEach((driver) => {
      // License expiry
      if (driver.licenseExpiry) {
        const expiryDate = new Date(driver.licenseExpiry);
        if (expiryDate <= thirtyDaysFromNow) {
          newAlerts.push({
            id: `lic-${driver.id}`,
            vehicleId: '',
            type: 'license',
            message: `${driver.firstName} ${driver.lastName}'s license expires on ${driver.licenseExpiry}`,
            dueDate: driver.licenseExpiry,
            status: expiryDate < today ? 'pending' : 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  // Load sample data
  const loadSampleData = () => {
    const sample = generateSampleData();
    sample.vehicles.forEach(addVehicle);
    sample.drivers.forEach(addDriver);
    sample.maintenance.forEach(addMaintenance);
    sample.fuelLogs.forEach(addFuelLog);
  };

  // Vehicle handlers
  const handleSaveVehicle = () => {
    if (!vehicleForm.make.trim() || !vehicleForm.licensePlate.trim()) return;

    const now = new Date().toISOString();
    const newVehicle: FleetVehicle = {
      id: editingVehicle?.id || Date.now().toString(),
      ...vehicleForm,
      assignedDriverId: vehicleForm.assignedDriverId || null,
      createdAt: editingVehicle?.createdAt || now,
      updatedAt: now,
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, { ...newVehicle, id: editingVehicle.id, createdAt: editingVehicle.createdAt });
    } else {
      addVehicle(newVehicle);
    }

    resetVehicleForm();
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      licensePlate: '',
      type: 'truck',
      status: 'active',
      color: '',
      fuelType: 'gasoline',
      tankCapacity: 0,
      currentMileage: 0,
      assignedDriverId: null,
      purchaseDate: '',
      purchasePrice: 0,
      insuranceExpiry: '',
      registrationExpiry: '',
      notes: '',
    });
    setEditingVehicle(null);
    setShowVehicleForm(false);
  };

  const handleEditVehicle = (vehicle: FleetVehicle) => {
    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      type: vehicle.type,
      status: vehicle.status,
      color: vehicle.color,
      fuelType: vehicle.fuelType,
      tankCapacity: vehicle.tankCapacity,
      currentMileage: vehicle.currentMileage,
      assignedDriverId: vehicle.assignedDriverId,
      purchaseDate: vehicle.purchaseDate,
      purchasePrice: vehicle.purchasePrice,
      insuranceExpiry: vehicle.insuranceExpiry,
      registrationExpiry: vehicle.registrationExpiry,
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
    deleteVehicle(id);
    // Delete all maintenance records for this vehicle
    maintenance.filter((m) => m.vehicleId === id).forEach((m) => deleteMaintenance(m.id));
    // Delete all fuel logs for this vehicle
    fuelLogs.filter((f) => f.vehicleId === id).forEach((f) => deleteFuelLog(f.id));
  };

  // Driver handlers
  const handleSaveDriver = () => {
    if (!driverForm.firstName.trim() || !driverForm.lastName.trim()) return;

    const now = new Date().toISOString();
    const newDriver: Driver = {
      id: editingDriver?.id || Date.now().toString(),
      ...driverForm,
      createdAt: editingDriver?.createdAt || now,
      updatedAt: now,
    };

    if (editingDriver) {
      updateDriver(editingDriver.id, { ...newDriver, id: editingDriver.id, createdAt: editingDriver.createdAt });
    } else {
      addDriver(newDriver);
    }

    resetDriverForm();
  };

  const resetDriverForm = () => {
    setDriverForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseType: '',
      licenseExpiry: '',
      status: 'active',
      dateHired: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
    });
    setEditingDriver(null);
    setShowDriverForm(false);
  };

  const handleEditDriver = (driver: Driver) => {
    setDriverForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiry: driver.licenseExpiry,
      status: driver.status,
      dateHired: driver.dateHired,
      emergencyContact: driver.emergencyContact,
      emergencyPhone: driver.emergencyPhone,
      notes: driver.notes,
    });
    setEditingDriver(driver);
    setShowDriverForm(true);
  };

  const handleDeleteDriver = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Driver',
      message: 'Delete this driver?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    // Unassign driver from vehicles
    vehicles.filter((v) => v.assignedDriverId === id).forEach((v) => {
      updateVehicle(v.id, { assignedDriverId: null });
    });
    deleteDriver(id);
  };

  // Maintenance handlers
  const handleSaveMaintenance = () => {
    if (!maintenanceForm.vehicleId || !maintenanceForm.description.trim()) return;

    const newMaintenance: MaintenanceRecord = {
      id: editingMaintenance?.id || Date.now().toString(),
      ...maintenanceForm,
      createdAt: editingMaintenance?.createdAt || new Date().toISOString(),
    };

    if (editingMaintenance) {
      updateMaintenance(editingMaintenance.id, { ...newMaintenance, id: editingMaintenance.id, createdAt: editingMaintenance.createdAt });
    } else {
      addMaintenance(newMaintenance);
    }

    resetMaintenanceForm();
  };

  const resetMaintenanceForm = () => {
    setMaintenanceForm({
      vehicleId: '',
      type: 'scheduled',
      description: '',
      date: new Date().toISOString().split('T')[0],
      mileageAtService: 0,
      cost: 0,
      vendor: '',
      nextServiceDate: '',
      nextServiceMileage: 0,
      status: 'scheduled',
      notes: '',
    });
    setEditingMaintenance(null);
    setShowMaintenanceForm(false);
  };

  const handleDeleteMaintenance = (id: string) => {
    deleteMaintenance(id);
  };

  const handleUpdateMaintenanceStatus = (id: string, status: MaintenanceRecord['status']) => {
    updateMaintenance(id, { status });
  };

  // Fuel handlers
  const handleSaveFuel = () => {
    if (!fuelForm.vehicleId || fuelForm.gallons <= 0) return;

    const newFuelLog: FuelLog = {
      id: editingFuel?.id || Date.now().toString(),
      ...fuelForm,
      driverId: fuelForm.driverId || null,
      totalCost: fuelForm.gallons * fuelForm.pricePerGallon,
      createdAt: editingFuel?.createdAt || new Date().toISOString(),
    };

    if (editingFuel) {
      updateFuelLog(editingFuel.id, { ...newFuelLog, id: editingFuel.id, createdAt: editingFuel.createdAt });
    } else {
      addFuelLog(newFuelLog);
      // Update vehicle mileage
      if (fuelForm.mileage > 0) {
        const vehicle = vehicles.find((v) => v.id === fuelForm.vehicleId);
        if (vehicle && fuelForm.mileage > vehicle.currentMileage) {
          updateVehicle(fuelForm.vehicleId, {
            currentMileage: fuelForm.mileage,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    resetFuelForm();
  };

  const resetFuelForm = () => {
    setFuelForm({
      vehicleId: '',
      driverId: null,
      date: new Date().toISOString().split('T')[0],
      gallons: 0,
      pricePerGallon: 0,
      totalCost: 0,
      mileage: 0,
      station: '',
      fuelType: 'Regular Unleaded',
      notes: '',
    });
    setEditingFuel(null);
    setShowFuelForm(false);
  };

  const handleDeleteFuel = (id: string) => {
    deleteFuelLog(id);
  };

  // Filtered data
  const filteredVehicles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return vehicles.filter((v) => {
      const matchesSearch =
        v.make.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.licensePlate.toLowerCase().includes(term) ||
        v.vin.toLowerCase().includes(term);
      const matchesType = !filterVehicleType || v.type === filterVehicleType;
      const matchesStatus = !filterVehicleStatus || v.status === filterVehicleStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchTerm, filterVehicleType, filterVehicleStatus]);

  const filteredDrivers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return drivers.filter((d) => {
      const matchesSearch =
        d.firstName.toLowerCase().includes(term) ||
        d.lastName.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term) ||
        d.licenseNumber.toLowerCase().includes(term);
      const matchesStatus = !filterDriverStatus || d.status === filterDriverStatus;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, filterDriverStatus]);

  // Analytics
  const analytics = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
    const inMaintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;
    const activeDrivers = drivers.filter((d) => d.status === 'active').length;

    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const totalFuelGallons = fuelLogs.reduce((sum, f) => sum + f.gallons, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

    const totalMileage = vehicles.reduce((sum, v) => sum + v.currentMileage, 0);
    const avgMpg =
      totalFuelGallons > 0 ? (totalMileage / totalFuelGallons).toFixed(1) : '0';

    const upcomingMaintenance = maintenance.filter((m) => m.status === 'scheduled').length;
    const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;

    return {
      totalVehicles: vehicles.length,
      activeVehicles,
      inMaintenanceVehicles,
      totalDrivers: drivers.length,
      activeDrivers,
      totalFuelCost,
      totalFuelGallons,
      totalMaintenanceCost,
      avgMpg,
      upcomingMaintenance,
      pendingAlerts,
    };
  }, [vehicles, drivers, fuelLogs, maintenance, alerts]);

  // Helper functions
  const getVehicleDisplay = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
  };

  const getDriverDisplay = (driverId: string | null) => {
    if (!driverId) return 'Unassigned';
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return 'Unknown Driver';
    return `${driver.firstName} ${driver.lastName}`;
  };

  // Styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const accentColor = 'text-blue-500';
  const accentBg = 'bg-blue-500';
  const accentBgLight = 'bg-blue-500/10';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'vehicles', label: 'Vehicles', icon: <Truck className="w-4 h-4" /> },
    { id: 'drivers', label: 'Drivers', icon: <Users className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'fuel', label: 'Fuel', icon: <Fuel className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'maintenance':
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'out-of-service':
      case 'inactive':
        return 'bg-red-500/10 text-red-500';
      case 'on-leave':
        return 'bg-orange-500/10 text-orange-500';
      case 'retired':
      case 'terminated':
        return 'bg-gray-500/10 text-gray-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${cardBg} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${accentBgLight} rounded-lg`}>
            <Truck className={`w-6 h-6 ${accentColor}`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.fleetManager.fleetManager', 'Fleet Manager')}</h2>
            <p className={`text-sm ${textSecondary}`}>
              {t('tools.fleetManager.vehicleFleetManagementForLogistics', 'Vehicle fleet management for logistics and transportation')}
            </p>
          </div>
        </div>
        {vehicles.length === 0 && drivers.length === 0 && (
          <button
            onClick={loadSampleData}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors ${textSecondary}`}
          >
            <Sparkles className="w-4 h-4" />
            {t('tools.fleetManager.loadSampleData', 'Load Sample Data')}
          </button>
        )}
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-500 font-medium">{t('tools.fleetManager.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      {/* Alerts Banner */}
      {alerts.filter((a) => a.status === 'pending').length > 0 && (
        <div className={`mb-6 p-4 rounded-lg border border-yellow-500 ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className={`font-semibold ${textPrimary}`}>Alerts ({alerts.filter((a) => a.status === 'pending').length})</h3>
          </div>
          <div className="space-y-1">
            {alerts.filter((a) => a.status === 'pending').slice(0, 3).map((alert) => (
              <p key={alert.id} className={`text-sm ${textSecondary}`}>
                {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Truck className={`w-5 h-5 ${accentColor}`} />
            <span className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.activeVehicles', 'Active Vehicles')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>
            {analytics.activeVehicles}/{analytics.totalVehicles}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.activeDrivers', 'Active Drivers')}</span>
          </div>
          <p className={`text-2xl font-bold ${textPrimary}`}>
            {analytics.activeDrivers}/{analytics.totalDrivers}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-orange-500" />
            <span className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.fuelCostTotal', 'Fuel Cost (Total)')}</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">
            ${analytics.totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-500" />
            <span className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.maintenanceCost', 'Maintenance Cost')}</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            ${analytics.totalMaintenanceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
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
                placeholder={t('tools.fleetManager.searchByPlateVinMake', 'Search by plate, VIN, make, model...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterVehicleType}
                onChange={(e) => setFilterVehicleType(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.fleetManager.allTypes', 'All Types')}</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                value={filterVehicleStatus}
                onChange={(e) => setFilterVehicleStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.fleetManager.allStatuses', 'All Statuses')}</option>
                {VEHICLE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <WidgetEmbedButton toolSlug="fleet-manager" toolName="Fleet Manager" />

              <SyncStatus
                isSynced={vehiclesSynced}
                isSaving={vehiclesSaving}
                lastSaved={vehiclesLastSaved}
                syncError={vehiclesSyncError}
                onForceSync={forceVehiclesSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportVehiclesCSV({ filename: 'fleet-vehicles' })}
                onExportExcel={() => exportVehiclesExcel({ filename: 'fleet-vehicles' })}
                onExportJSON={() => exportVehiclesJSON({ filename: 'fleet-vehicles' })}
                onExportPDF={() => exportVehiclesPDF({ filename: 'fleet-vehicles', title: 'Fleet Vehicles' })}
                onPrint={() => printVehicles('Fleet Vehicles')}
                onCopyToClipboard={() => copyVehicles()}
                disabled={filteredVehicles.length === 0}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={() => setShowVehicleForm(true)}
                className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600 transition-colors`}
              >
                <Plus className="w-4 h-4" />
                {t('tools.fleetManager.addVehicle', 'Add Vehicle')}
              </button>
            </div>
          </div>

          {/* Vehicle Form */}
          {showVehicleForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingVehicle ? t('tools.fleetManager.editVehicle', 'Edit Vehicle') : t('tools.fleetManager.addNewVehicle', 'Add New Vehicle')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.make', 'Make *')}</label>
                  <input
                    type="text"
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.ford', 'Ford')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.model', 'Model')}</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder="F-150"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.year', 'Year')}</label>
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
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.licensePlate', 'License Plate *')}</label>
                  <input
                    type="text"
                    value={vehicleForm.licensePlate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.flt001', 'FLT-001')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.vin', 'VIN')}</label>
                  <input
                    type="text"
                    value={vehicleForm.vin}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.1ftfw1e50nfb12345', '1FTFW1E50NFB12345')}
                    maxLength={17}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.type', 'Type')}</label>
                  <select
                    value={vehicleForm.type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value as FleetVehicle['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {VEHICLE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.status', 'Status')}</label>
                  <select
                    value={vehicleForm.status}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as FleetVehicle['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {VEHICLE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.color', 'Color')}</label>
                  <input
                    type="text"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.white', 'White')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.fuelType', 'Fuel Type')}</label>
                  <select
                    value={vehicleForm.fuelType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value as FleetVehicle['fuelType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {FUEL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.tankCapacityGal', 'Tank Capacity (gal)')}</label>
                  <input
                    type="number"
                    value={vehicleForm.tankCapacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, tankCapacity: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.currentMileage', 'Current Mileage')}</label>
                  <input
                    type="number"
                    value={vehicleForm.currentMileage}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, currentMileage: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.assignedDriver', 'Assigned Driver')}</label>
                  <select
                    value={vehicleForm.assignedDriverId || ''}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, assignedDriverId: e.target.value || null })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.fleetManager.unassigned', 'Unassigned')}</option>
                    {drivers.filter((d) => d.status === 'active').map((d) => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.purchaseDate', 'Purchase Date')}</label>
                  <input
                    type="date"
                    value={vehicleForm.purchaseDate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, purchaseDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.purchasePrice', 'Purchase Price ($)')}</label>
                  <input
                    type="number"
                    value={vehicleForm.purchasePrice}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.insuranceExpiry', 'Insurance Expiry')}</label>
                  <input
                    type="date"
                    value={vehicleForm.insuranceExpiry}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.registrationExpiry', 'Registration Expiry')}</label>
                  <input
                    type="date"
                    value={vehicleForm.registrationExpiry}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, registrationExpiry: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.notes', 'Notes')}</label>
                  <textarea
                    value={vehicleForm.notes}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                    rows={2}
                    placeholder={t('tools.fleetManager.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveVehicle}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.fleetManager.save', 'Save')}
                </button>
                <button onClick={resetVehicleForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.fleetManager.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Vehicles List */}
          <div className="space-y-3">
            {filteredVehicles.map((vehicle) => {
              const vehicleMaintenance = maintenance.filter((m) => m.vehicleId === vehicle.id);
              const vehicleFuel = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
              const isExpanded = expandedVehicle === vehicle.id;
              const assignedDriver = drivers.find((d) => d.id === vehicle.assignedDriverId);

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
                            {vehicle.licensePlate}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(vehicle.status)}`}>
                            {VEHICLE_STATUSES.find((s) => s.value === vehicle.status)?.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} ${textSecondary}`}>
                            {VEHICLE_TYPES.find((t) => t.value === vehicle.type)?.label}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> {vehicle.currentMileage.toLocaleString()} mi
                          </span>
                          <span className="flex items-center gap-1">
                            <Fuel className="w-3 h-3" /> {FUEL_TYPES.find((f) => f.value === vehicle.fuelType)?.label}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {assignedDriver ? `${assignedDriver.firstName} ${assignedDriver.lastName}` : 'Unassigned'}
                          </span>
                          {vehicle.color && (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: vehicle.color.toLowerCase() }} />
                              {vehicle.color}
                            </span>
                          )}
                        </div>
                        {vehicle.vin && (
                          <p className={`mt-1 text-xs ${textSecondary}`}>VIN: {vehicle.vin}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setExpandedVehicle(isExpanded ? null : vehicle.id)}
                          className={`p-2 rounded-lg ${hoverBg}`}
                          title={isExpanded ? t('tools.fleetManager.collapse', 'Collapse') : t('tools.fleetManager.expand', 'Expand')}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Vehicle Details */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${textPrimary}`}>{t('tools.fleetManager.vehicleDetails', 'Vehicle Details')}</h4>
                            <div className={`space-y-1 text-sm ${textSecondary}`}>
                              <p><Shield className="w-3 h-3 inline mr-1" /> Insurance: {vehicle.insuranceExpiry || 'N/A'}</p>
                              <p><FileText className="w-3 h-3 inline mr-1" /> Registration: {vehicle.registrationExpiry || 'N/A'}</p>
                              <p><DollarSign className="w-3 h-3 inline mr-1" /> Purchase: ${vehicle.purchasePrice.toLocaleString()}</p>
                              <p><Fuel className="w-3 h-3 inline mr-1" /> Tank: {vehicle.tankCapacity} gal</p>
                            </div>
                          </div>
                          {/* Recent Maintenance */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${textPrimary}`}>{t('tools.fleetManager.recentMaintenance', 'Recent Maintenance')}</h4>
                            {vehicleMaintenance.slice(0, 3).map((m) => (
                              <div key={m.id} className={`text-sm ${textSecondary} mb-1`}>
                                <span>{m.date}</span> - <span>{m.description}</span>
                              </div>
                            ))}
                            {vehicleMaintenance.length === 0 && (
                              <p className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.noMaintenanceRecords', 'No maintenance records')}</p>
                            )}
                          </div>
                          {/* Recent Fuel */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${textPrimary}`}>{t('tools.fleetManager.recentFuelLogs', 'Recent Fuel Logs')}</h4>
                            {vehicleFuel.slice(0, 3).map((f) => (
                              <div key={f.id} className={`text-sm ${textSecondary} mb-1`}>
                                <span>{f.date}</span> - <span>{f.gallons} gal</span> - <span className="text-green-500">${f.totalCost.toFixed(2)}</span>
                              </div>
                            ))}
                            {vehicleFuel.length === 0 && (
                              <p className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.noFuelLogs', 'No fuel logs')}</p>
                            )}
                          </div>
                        </div>
                        {vehicle.notes && (
                          <p className={`mt-4 text-sm ${textSecondary}`}>
                            <strong>{t('tools.fleetManager.notes2', 'Notes:')}</strong> {vehicle.notes}
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
                {t('tools.fleetManager.noVehiclesFoundAddYour', 'No vehicles found. Add your first vehicle to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className={`w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder={t('tools.fleetManager.searchByNameEmailLicense', 'Search by name, email, license...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterDriverStatus}
                onChange={(e) => setFilterDriverStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.fleetManager.allStatuses2', 'All Statuses')}</option>
                {DRIVER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <SyncStatus
                isSynced={driversSynced}
                isSaving={driversSaving}
                lastSaved={driversLastSaved}
                syncError={driversSyncError}
                onForceSync={forceDriversSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportDriversCSV({ filename: 'fleet-drivers' })}
                onExportExcel={() => exportDriversExcel({ filename: 'fleet-drivers' })}
                onExportJSON={() => exportDriversJSON({ filename: 'fleet-drivers' })}
                onExportPDF={() => exportDriversPDF({ filename: 'fleet-drivers', title: 'Fleet Drivers' })}
                onPrint={() => printDrivers('Fleet Drivers')}
                onCopyToClipboard={() => copyDrivers()}
                disabled={filteredDrivers.length === 0}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={() => setShowDriverForm(true)}
                className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600 transition-colors`}
              >
                <Plus className="w-4 h-4" />
                {t('tools.fleetManager.addDriver', 'Add Driver')}
              </button>
            </div>
          </div>

          {/* Driver Form */}
          {showDriverForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingDriver ? t('tools.fleetManager.editDriver', 'Edit Driver') : t('tools.fleetManager.addNewDriver', 'Add New Driver')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={driverForm.firstName}
                    onChange={(e) => setDriverForm({ ...driverForm, firstName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.john', 'John')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={driverForm.lastName}
                    onChange={(e) => setDriverForm({ ...driverForm, lastName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.smith', 'Smith')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.email', 'Email')}</label>
                  <input
                    type="email"
                    value={driverForm.email}
                    onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.johnSmithFleetCom', 'john.smith@fleet.com')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.licenseNumber', 'License Number')}</label>
                  <input
                    type="text"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.dl12345678', 'DL12345678')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.licenseType', 'License Type')}</label>
                  <input
                    type="text"
                    value={driverForm.licenseType}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.cdlClassB', 'CDL Class B')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.licenseExpiry', 'License Expiry')}</label>
                  <input
                    type="date"
                    value={driverForm.licenseExpiry}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseExpiry: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.status2', 'Status')}</label>
                  <select
                    value={driverForm.status}
                    onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value as Driver['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {DRIVER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.dateHired', 'Date Hired')}</label>
                  <input
                    type="date"
                    value={driverForm.dateHired}
                    onChange={(e) => setDriverForm({ ...driverForm, dateHired: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.emergencyContact', 'Emergency Contact')}</label>
                  <input
                    type="text"
                    value={driverForm.emergencyContact}
                    onChange={(e) => setDriverForm({ ...driverForm, emergencyContact: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.janeSmith', 'Jane Smith')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.emergencyPhone', 'Emergency Phone')}</label>
                  <input
                    type="tel"
                    value={driverForm.emergencyPhone}
                    onChange={(e) => setDriverForm({ ...driverForm, emergencyPhone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder="+1 (555) 123-4568"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.notes3', 'Notes')}</label>
                  <textarea
                    value={driverForm.notes}
                    onChange={(e) => setDriverForm({ ...driverForm, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                    rows={2}
                    placeholder={t('tools.fleetManager.additionalNotes2', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveDriver}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.fleetManager.save2', 'Save')}
                </button>
                <button onClick={resetDriverForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.fleetManager.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Drivers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map((driver) => {
              const assignedVehicle = vehicles.find((v) => v.assignedDriverId === driver.id);
              const isExpanded = expandedDriver === driver.id;

              return (
                <div key={driver.id} className={`rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${textPrimary}`}>
                            {driver.firstName} {driver.lastName}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(driver.status)}`}>
                            {DRIVER_STATUSES.find((s) => s.value === driver.status)?.label}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          {driver.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {driver.email}
                            </span>
                          )}
                          {driver.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {driver.phone}
                            </span>
                          )}
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-1 text-sm ${textSecondary}`}>
                          {driver.licenseType && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {driver.licenseType}
                            </span>
                          )}
                          {assignedVehicle && (
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3" /> {assignedVehicle.licensePlate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setExpandedDriver(isExpanded ? null : driver.id)}
                          className={`p-2 rounded-lg ${hoverBg}`}
                        >
                          {isExpanded ? (
                            <ChevronUp className={`w-4 h-4 ${textSecondary}`} />
                          ) : (
                            <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
                          )}
                        </button>
                        <button onClick={() => handleEditDriver(driver)} className={`p-2 rounded-lg ${hoverBg}`}>
                          <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                        <div className={`space-y-2 text-sm ${textSecondary}`}>
                          <p><Hash className="w-3 h-3 inline mr-1" /> License: {driver.licenseNumber || 'N/A'}</p>
                          <p><Calendar className="w-3 h-3 inline mr-1" /> License Expiry: {driver.licenseExpiry || 'N/A'}</p>
                          <p><Calendar className="w-3 h-3 inline mr-1" /> Date Hired: {driver.dateHired || 'N/A'}</p>
                          {driver.emergencyContact && (
                            <p><User className="w-3 h-3 inline mr-1" /> Emergency: {driver.emergencyContact} ({driver.emergencyPhone})</p>
                          )}
                          {driver.notes && <p><FileText className="w-3 h-3 inline mr-1" /> Notes: {driver.notes}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredDrivers.length === 0 && (
            <div className={`text-center py-8 ${textSecondary}`}>
              {t('tools.fleetManager.noDriversFoundAddYour', 'No drivers found. Add your first driver to get started.')}
            </div>
          )}
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <SyncStatus
              isSynced={maintenanceSynced}
              isSaving={maintenanceSaving}
              lastSaved={maintenanceLastSaved}
              syncError={maintenanceSyncError}
              onForceSync={forceMaintenanceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportMaintenanceCSV({ filename: 'fleet-maintenance' })}
              onExportExcel={() => exportMaintenanceExcel({ filename: 'fleet-maintenance' })}
              onExportJSON={() => exportMaintenanceJSON({ filename: 'fleet-maintenance' })}
              onExportPDF={() => exportMaintenancePDF({ filename: 'fleet-maintenance', title: 'Fleet Maintenance Records' })}
              onPrint={() => printMaintenance('Fleet Maintenance Records')}
              onCopyToClipboard={() => copyMaintenance()}
              disabled={maintenance.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowMaintenanceForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.fleetManager.addMaintenanceRecord', 'Add Maintenance Record')}
            </button>
          </div>

          {/* Maintenance Form */}
          {showMaintenanceForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingMaintenance ? t('tools.fleetManager.editMaintenanceRecord', 'Edit Maintenance Record') : t('tools.fleetManager.addMaintenanceRecord2', 'Add Maintenance Record')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.vehicle', 'Vehicle *')}</label>
                  <select
                    value={maintenanceForm.vehicleId}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.fleetManager.selectVehicle', 'Select vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.type2', 'Type')}</label>
                  <select
                    value={maintenanceForm.type}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value as MaintenanceRecord['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    {MAINTENANCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.date', 'Date')}</label>
                  <input
                    type="date"
                    value={maintenanceForm.date}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.status3', 'Status')}</label>
                  <select
                    value={maintenanceForm.status}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, status: e.target.value as MaintenanceRecord['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="scheduled">{t('tools.fleetManager.scheduled', 'Scheduled')}</option>
                    <option value="in-progress">{t('tools.fleetManager.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.fleetManager.completed', 'Completed')}</option>
                    <option value="cancelled">{t('tools.fleetManager.cancelled', 'Cancelled')}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.description', 'Description *')}</label>
                  <input
                    type="text"
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.oilChangeAndTireRotation', 'Oil change and tire rotation')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.mileageAtService', 'Mileage at Service')}</label>
                  <input
                    type="number"
                    value={maintenanceForm.mileageAtService}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, mileageAtService: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.cost', 'Cost ($)')}</label>
                  <input
                    type="number"
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.vendor', 'Vendor')}</label>
                  <input
                    type="text"
                    value={maintenanceForm.vendor}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vendor: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.quickLubeExpress', 'Quick Lube Express')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.nextServiceDate', 'Next Service Date')}</label>
                  <input
                    type="date"
                    value={maintenanceForm.nextServiceDate}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, nextServiceDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.nextServiceMileage', 'Next Service Mileage')}</label>
                  <input
                    type="number"
                    value={maintenanceForm.nextServiceMileage}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, nextServiceMileage: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.notes4', 'Notes')}</label>
                  <textarea
                    value={maintenanceForm.notes}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                    rows={2}
                    placeholder={t('tools.fleetManager.additionalNotes3', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveMaintenance}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.fleetManager.save3', 'Save')}
                </button>
                <button onClick={resetMaintenanceForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.fleetManager.cancel3', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Maintenance Records List */}
          <div className="space-y-3">
            {maintenance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
              <div key={record.id} className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${textPrimary}`}>{record.description}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} ${textSecondary}`}>
                        {MAINTENANCE_TYPES.find((t) => t.value === record.type)?.label}
                      </span>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>{getVehicleDisplay(record.vehicleId)}</p>
                    <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {record.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" /> {record.mileageAtService.toLocaleString()} mi
                      </span>
                      <span className="flex items-center gap-1 text-green-500">
                        <DollarSign className="w-3 h-3" /> ${record.cost.toFixed(2)}
                      </span>
                      {record.vendor && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {record.vendor}
                        </span>
                      )}
                    </div>
                    {record.nextServiceDate && (
                      <p className={`mt-2 text-sm ${textSecondary}`}>
                        Next service: {record.nextServiceDate} at {record.nextServiceMileage.toLocaleString()} mi
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {record.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateMaintenanceStatus(record.id, 'in-progress')}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {t('tools.fleetManager.start', 'Start')}
                      </button>
                    )}
                    {record.status === 'in-progress' && (
                      <button
                        onClick={() => handleUpdateMaintenanceStatus(record.id, 'completed')}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        {t('tools.fleetManager.complete', 'Complete')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMaintenance(record.id)}
                      className={`p-1 rounded ${hoverBg} hover:text-red-500`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {maintenance.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.fleetManager.noMaintenanceRecordsAddA', 'No maintenance records. Add a record to track service history.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fuel Tab */}
      {activeTab === 'fuel' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <SyncStatus
              isSynced={fuelLogsSynced}
              isSaving={fuelLogsSaving}
              lastSaved={fuelLogsLastSaved}
              syncError={fuelLogsSyncError}
              onForceSync={forceFuelLogsSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportFuelLogsCSV({ filename: 'fleet-fuel-logs' })}
              onExportExcel={() => exportFuelLogsExcel({ filename: 'fleet-fuel-logs' })}
              onExportJSON={() => exportFuelLogsJSON({ filename: 'fleet-fuel-logs' })}
              onExportPDF={() => exportFuelLogsPDF({ filename: 'fleet-fuel-logs', title: 'Fleet Fuel Logs' })}
              onPrint={() => printFuelLogs('Fleet Fuel Logs')}
              onCopyToClipboard={() => copyFuelLogs()}
              disabled={fuelLogs.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowFuelForm(true)}
              className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.fleetManager.addFuelLog', 'Add Fuel Log')}
            </button>
          </div>

          {/* Fuel Form */}
          {showFuelForm && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                {editingFuel ? t('tools.fleetManager.editFuelLog', 'Edit Fuel Log') : t('tools.fleetManager.addFuelLog2', 'Add Fuel Log')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.vehicle2', 'Vehicle *')}</label>
                  <select
                    value={fuelForm.vehicleId}
                    onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.fleetManager.selectVehicle2', 'Select vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.driver', 'Driver')}</label>
                  <select
                    value={fuelForm.driverId || ''}
                    onChange={(e) => setFuelForm({ ...fuelForm, driverId: e.target.value || null })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="">{t('tools.fleetManager.selectDriver', 'Select driver')}</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.date2', 'Date')}</label>
                  <input
                    type="date"
                    value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.gallons', 'Gallons *')}</label>
                  <input
                    type="number"
                    value={fuelForm.gallons}
                    onChange={(e) => setFuelForm({ ...fuelForm, gallons: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.pricePerGallon', 'Price per Gallon ($)')}</label>
                  <input
                    type="number"
                    value={fuelForm.pricePerGallon}
                    onChange={(e) => setFuelForm({ ...fuelForm, pricePerGallon: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Total Cost: ${(fuelForm.gallons * fuelForm.pricePerGallon).toFixed(2)}
                  </label>
                  <div className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-200'} ${textSecondary}`}>
                    {t('tools.fleetManager.autoCalculated', 'Auto-calculated')}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.odometerReading', 'Odometer Reading')}</label>
                  <input
                    type="number"
                    value={fuelForm.mileage}
                    onChange={(e) => setFuelForm({ ...fuelForm, mileage: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    min={0}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.station', 'Station')}</label>
                  <input
                    type="text"
                    value={fuelForm.station}
                    onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.shellStation1234', 'Shell Station #1234')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.fuelType2', 'Fuel Type')}</label>
                  <input
                    type="text"
                    value={fuelForm.fuelType}
                    onChange={(e) => setFuelForm({ ...fuelForm, fuelType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.regularUnleaded', 'Regular Unleaded')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>{t('tools.fleetManager.notes5', 'Notes')}</label>
                  <input
                    type="text"
                    value={fuelForm.notes}
                    onChange={(e) => setFuelForm({ ...fuelForm, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    placeholder={t('tools.fleetManager.additionalNotes4', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveFuel}
                  className={`flex items-center gap-2 px-4 py-2 ${accentBg} text-white rounded-lg hover:bg-blue-600`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.fleetManager.save4', 'Save')}
                </button>
                <button onClick={resetFuelForm} className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                  {t('tools.fleetManager.cancel4', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Fuel Logs List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderColor}`}>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.date3', 'Date')}</th>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.vehicle3', 'Vehicle')}</th>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.driver2', 'Driver')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.gallons2', 'Gallons')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>$/Gal</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.total', 'Total')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.odometer', 'Odometer')}</th>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.station2', 'Station')}</th>
                  <th className={`text-right py-2 px-3 text-sm font-medium ${textSecondary}`}>{t('tools.fleetManager.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                  <tr key={log.id} className={`border-b ${borderColor}`}>
                    <td className={`py-2 px-3 ${textPrimary}`}>{log.date}</td>
                    <td className={`py-2 px-3 ${textSecondary}`}>
                      {vehicles.find((v) => v.id === log.vehicleId)?.licensePlate || '-'}
                    </td>
                    <td className={`py-2 px-3 ${textSecondary}`}>{getDriverDisplay(log.driverId)}</td>
                    <td className={`py-2 px-3 text-right ${textPrimary}`}>{log.gallons.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right ${textSecondary}`}>${log.pricePerGallon.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right text-green-500 font-medium`}>${log.totalCost.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right ${textSecondary}`}>{log.mileage.toLocaleString()}</td>
                    <td className={`py-2 px-3 ${textSecondary}`}>{log.station || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDeleteFuel(log.id)}
                        className={`p-1 rounded ${hoverBg} hover:text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fuelLogs.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.fleetManager.noFuelLogsAddA', 'No fuel logs. Add a fuel log to track consumption.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Fleet Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Truck className={`w-8 h-8 mx-auto ${accentColor} mb-2`} />
              <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.totalVehicles}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.totalVehicles', 'Total Vehicles')}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.totalDrivers}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.totalDrivers', 'Total Drivers')}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Fuel className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-orange-500">{analytics.totalFuelGallons.toFixed(1)}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.totalGallons', 'Total Gallons')}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
              <Activity className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-purple-500">{analytics.avgMpg}</p>
              <p className={`text-sm ${textSecondary}`}>{t('tools.fleetManager.avgMpgEst', 'Avg MPG (Est.)')}</p>
            </div>
          </div>

          {/* Cost Summary */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>{t('tools.fleetManager.costSummary', 'Cost Summary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Fuel className="w-5 h-5 text-orange-500" />
                  <span className={`text-sm font-medium ${textPrimary}`}>{t('tools.fleetManager.totalFuelCost', 'Total Fuel Cost')}</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">
                  ${analytics.totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-purple-500" />
                  <span className={`text-sm font-medium ${textPrimary}`}>{t('tools.fleetManager.totalMaintenanceCost', 'Total Maintenance Cost')}</span>
                </div>
                <p className="text-2xl font-bold text-purple-500">
                  ${analytics.totalMaintenanceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className={`text-sm font-medium ${textPrimary}`}>{t('tools.fleetManager.totalOperatingCost', 'Total Operating Cost')}</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  ${(analytics.totalFuelCost + analytics.totalMaintenanceCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Status Breakdown */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>{t('tools.fleetManager.vehicleStatusBreakdown', 'Vehicle Status Breakdown')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VEHICLE_STATUSES.map((status) => {
                const count = vehicles.filter((v) => v.status === status.value).length;
                return (
                  <div key={status.value} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        status.value === 'active' ? 'bg-green-500' :
                        status.value === 'maintenance' ? 'bg-yellow-500' :
                        status.value === 'out-of-service' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${textPrimary}`}>{status.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${textPrimary} mt-1`}>{count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts Summary */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>{t('tools.fleetManager.alertsReminders', 'Alerts & Reminders')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className={`text-sm font-medium ${textPrimary}`}>{t('tools.fleetManager.pendingAlerts', 'Pending Alerts')}</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">{analytics.pendingAlerts}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  <span className={`text-sm font-medium ${textPrimary}`}>{t('tools.fleetManager.scheduledMaintenance', 'Scheduled Maintenance')}</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">{analytics.upcomingMaintenance}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Type Distribution */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>{t('tools.fleetManager.fleetByVehicleType', 'Fleet by Vehicle Type')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VEHICLE_TYPES.map((type) => {
                const count = vehicles.filter((v) => v.type === type.value).length;
                if (count === 0) return null;
                return (
                  <div key={type.value} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${textPrimary}`}>{type.label}</p>
                    <p className={`text-2xl font-bold ${accentColor}`}>{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>{t('tools.fleetManager.aboutFleetManager', 'About Fleet Manager')}</h3>
        <p className={`text-sm ${textSecondary}`}>
          A comprehensive vehicle fleet management tool for logistics and transportation operations.
          Track vehicles, manage drivers, schedule maintenance, log fuel consumption, and monitor
          insurance and registration expiry dates. All data is automatically saved to your browser's
          local storage.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default FleetManagerTool;
