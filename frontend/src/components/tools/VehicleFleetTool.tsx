'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import {
  Car,
  Truck,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  Filter,
  Wrench,
  Fuel,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  MapPin,
  Key,
  Shield,
  Gauge,
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  vehicleType: 'sedan' | 'suv' | 'luxury' | 'van' | 'limo' | 'minivan' | 'hybrid';
  color: string;
  status: 'active' | 'maintenance' | 'out-of-service' | 'retired';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  mileage: number;
  capacity: number; // passenger capacity
  purchaseDate: string;
  purchasePrice: number;
  insuranceExpiry: string;
  registrationExpiry: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  nextMaintenanceMileage: number;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'tire' | 'oil-change' | 'brake' | 'other';
  description: string;
  date: string;
  mileageAtService: number;
  cost: number;
  vendor: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

interface FuelLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  date: string;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  mileage: number;
  station: string;
  createdAt: string;
}

type TabType = 'fleet' | 'maintenance' | 'fuel' | 'alerts';

// Column configurations for export
const vehicleColumns: ColumnConfig[] = [
  { key: 'licensePlate', header: 'License Plate', type: 'string' },
  { key: 'make', header: 'Make', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'vehicleType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'mileage', header: 'Mileage', type: 'number' },
  { key: 'fuelType', header: 'Fuel Type', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'assignedDriverName', header: 'Assigned Driver', type: 'string' },
  { key: 'insuranceExpiry', header: 'Insurance Expiry', type: 'date' },
  { key: 'registrationExpiry', header: 'Registration Expiry', type: 'date' },
];

const maintenanceColumns: ColumnConfig[] = [
  { key: 'vehiclePlate', header: 'Vehicle', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'mileageAtService', header: 'Mileage', type: 'number' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'vendor', header: 'Vendor', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const fuelLogColumns: ColumnConfig[] = [
  { key: 'vehiclePlate', header: 'Vehicle', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'gallons', header: 'Gallons', type: 'number' },
  { key: 'pricePerGallon', header: 'Price/Gallon', type: 'currency' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'mileage', header: 'Mileage', type: 'number' },
  { key: 'station', header: 'Station', type: 'string' },
];

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'van', label: 'Van' },
  { value: 'limo', label: 'Limousine' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'hybrid', label: 'Hybrid' },
];

const VEHICLE_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'maintenance', label: 'In Maintenance', color: 'yellow' },
  { value: 'out-of-service', label: 'Out of Service', color: 'red' },
  { value: 'retired', label: 'Retired', color: 'gray' },
];

const FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

const MAINTENANCE_TYPES = [
  { value: 'scheduled', label: 'Scheduled Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'tire', label: 'Tire Service' },
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'brake', label: 'Brake Service' },
  { value: 'other', label: 'Other' },
];

const generateId = () => `veh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Sample data generator
const generateSampleData = () => {
  const sampleVehicles: Vehicle[] = [
    {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      vin: '1HGBH41JXMN109186',
      licensePlate: 'ABC-1234',
      vehicleType: 'sedan',
      color: 'Black',
      status: 'active',
      fuelType: 'hybrid',
      mileage: 25430,
      capacity: 4,
      purchaseDate: '2023-01-15',
      purchasePrice: 32000,
      insuranceExpiry: '2025-01-15',
      registrationExpiry: '2025-06-30',
      lastMaintenanceDate: '2024-11-15',
      nextMaintenanceDate: '2025-02-15',
      nextMaintenanceMileage: 30000,
      assignedDriverId: 'd1',
      assignedDriverName: 'Michael Johnson',
      notes: 'Primary sedan for airport runs',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'v2',
      make: 'Lincoln',
      model: 'Navigator',
      year: 2022,
      vin: '5LMJJ2LT8LEL12345',
      licensePlate: 'XYZ-5678',
      vehicleType: 'luxury',
      color: 'White',
      status: 'active',
      fuelType: 'gasoline',
      mileage: 42150,
      capacity: 7,
      purchaseDate: '2022-06-20',
      purchasePrice: 85000,
      insuranceExpiry: '2025-06-20',
      registrationExpiry: '2025-09-15',
      lastMaintenanceDate: '2024-12-01',
      nextMaintenanceDate: '2025-03-01',
      nextMaintenanceMileage: 47000,
      assignedDriverId: 'd2',
      assignedDriverName: 'Sarah Williams',
      notes: 'VIP and executive transport',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'v3',
      make: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2021,
      vin: 'WD3PE8CD5MP123456',
      licensePlate: 'DEF-9012',
      vehicleType: 'van',
      color: 'Silver',
      status: 'maintenance',
      fuelType: 'diesel',
      mileage: 68500,
      capacity: 12,
      purchaseDate: '2021-03-10',
      purchasePrice: 55000,
      insuranceExpiry: '2025-03-10',
      registrationExpiry: '2025-04-30',
      lastMaintenanceDate: '2024-12-20',
      nextMaintenanceDate: '2025-01-20',
      nextMaintenanceMileage: 70000,
      assignedDriverId: null,
      assignedDriverName: null,
      notes: 'Group transport van - currently in shop for brake service',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleMaintenance: MaintenanceRecord[] = [
    {
      id: 'm1',
      vehicleId: 'v1',
      vehiclePlate: 'ABC-1234',
      type: 'oil-change',
      description: 'Regular oil change and filter replacement',
      date: '2024-11-15',
      mileageAtService: 24500,
      cost: 75,
      vendor: 'Quick Lube',
      status: 'completed',
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm2',
      vehicleId: 'v3',
      vehiclePlate: 'DEF-9012',
      type: 'brake',
      description: 'Front and rear brake pad replacement',
      date: '2024-12-20',
      mileageAtService: 68500,
      cost: 850,
      vendor: 'City Auto Service',
      status: 'in-progress',
      notes: 'Also checking rotors',
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleFuelLogs: FuelLog[] = [
    {
      id: 'f1',
      vehicleId: 'v1',
      vehiclePlate: 'ABC-1234',
      date: '2024-12-28',
      gallons: 12.5,
      pricePerGallon: 3.45,
      totalCost: 43.13,
      mileage: 25430,
      station: 'Shell Station #123',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'f2',
      vehicleId: 'v2',
      vehiclePlate: 'XYZ-5678',
      date: '2024-12-27',
      gallons: 22.0,
      pricePerGallon: 3.59,
      totalCost: 78.98,
      mileage: 42150,
      station: 'BP Express',
      createdAt: new Date().toISOString(),
    },
  ];

  return { vehicles: sampleVehicles, maintenance: sampleMaintenance, fuelLogs: sampleFuelLogs };
};

interface VehicleFleetToolProps {
  uiConfig?: UIConfig;
}

export const VehicleFleetTool: React.FC<VehicleFleetToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('fleet');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // UseToolData hooks
  const {
    data: vehicles,
    addItem: addVehicle,
    updateItem: updateVehicle,
    deleteItem: deleteVehicle,
    isLoading: vehiclesLoading,
    isSaving: vehiclesSaving,
    isSynced: vehiclesSynced,
    lastSaved: vehiclesLastSaved,
    syncError: vehiclesSyncError,
    forceSync: forceVehiclesSync,
  } = useToolData<Vehicle>('vehicle-fleet-vehicles', [], vehicleColumns);

  const {
    data: maintenanceRecords,
    addItem: addMaintenanceRecord,
    updateItem: updateMaintenanceRecord,
    deleteItem: deleteMaintenanceRecord,
    isLoading: maintenanceLoading,
  } = useToolData<MaintenanceRecord>('vehicle-fleet-maintenance', [], maintenanceColumns);

  const {
    data: fuelLogs,
    addItem: addFuelLog,
    deleteItem: deleteFuelLog,
    isLoading: fuelLoading,
  } = useToolData<FuelLog>('vehicle-fleet-fuel', [], fuelLogColumns);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Load sample data if empty
  useEffect(() => {
    if (!vehiclesLoading && !maintenanceLoading && !fuelLoading && vehicles.length === 0) {
      const sample = generateSampleData();
      sample.vehicles.forEach(v => addVehicle(v));
      sample.maintenance.forEach(m => addMaintenanceRecord(m));
      sample.fuelLogs.forEach(f => addFuelLog(f));
    }
  }, [vehiclesLoading, maintenanceLoading, fuelLoading, vehicles.length, addVehicle, addMaintenanceRecord, addFuelLog]);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    vehicleType: 'sedan',
    color: '',
    fuelType: 'gasoline',
    mileage: 0,
    capacity: 4,
    purchaseDate: '',
    purchasePrice: 0,
    insuranceExpiry: '',
    registrationExpiry: '',
    notes: '',
  });

  // New maintenance form state
  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceRecord>>({
    vehicleId: '',
    type: 'scheduled',
    description: '',
    date: '',
    mileageAtService: 0,
    cost: 0,
    vendor: '',
    notes: '',
  });

  // New fuel log form state
  const [newFuelLog, setNewFuelLog] = useState<Partial<FuelLog>>({
    vehicleId: '',
    date: '',
    gallons: 0,
    pricePerGallon: 0,
    mileage: 0,
    station: '',
  });

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const active = vehicles.filter(v => v.status === 'active').length;
    const inMaintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const totalValue = vehicles.reduce((sum, v) => sum + v.purchasePrice, 0);
    const avgMileage = vehicles.length > 0
      ? Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length)
      : 0;
    return { active, inMaintenance, totalValue, avgMileage };
  }, [vehicles]);

  // Alerts
  const alerts = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return vehicles.filter(v => {
      const insuranceExpiry = new Date(v.insuranceExpiry);
      const registrationExpiry = new Date(v.registrationExpiry);
      const nextMaintenance = new Date(v.nextMaintenanceDate);
      return (
        insuranceExpiry <= thirtyDaysFromNow ||
        registrationExpiry <= thirtyDaysFromNow ||
        nextMaintenance <= thirtyDaysFromNow
      );
    });
  }, [vehicles]);

  // Handle add vehicle
  const handleAddVehicle = () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.licensePlate) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const vehicle: Vehicle = {
      id: generateId(),
      make: newVehicle.make || '',
      model: newVehicle.model || '',
      year: newVehicle.year || new Date().getFullYear(),
      vin: newVehicle.vin || '',
      licensePlate: newVehicle.licensePlate || '',
      vehicleType: newVehicle.vehicleType as Vehicle['vehicleType'] || 'sedan',
      color: newVehicle.color || '',
      status: 'active',
      fuelType: newVehicle.fuelType as Vehicle['fuelType'] || 'gasoline',
      mileage: newVehicle.mileage || 0,
      capacity: newVehicle.capacity || 4,
      purchaseDate: newVehicle.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: newVehicle.purchasePrice || 0,
      insuranceExpiry: newVehicle.insuranceExpiry || '',
      registrationExpiry: newVehicle.registrationExpiry || '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      nextMaintenanceMileage: (newVehicle.mileage || 0) + 5000,
      assignedDriverId: null,
      assignedDriverName: null,
      notes: newVehicle.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addVehicle(vehicle);
    setShowAddVehicle(false);
    setNewVehicle({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      licensePlate: '',
      vehicleType: 'sedan',
      color: '',
      fuelType: 'gasoline',
      mileage: 0,
      capacity: 4,
      purchaseDate: '',
      purchasePrice: 0,
      insuranceExpiry: '',
      registrationExpiry: '',
      notes: '',
    });
  };

  // Handle add maintenance
  const handleAddMaintenance = () => {
    if (!newMaintenance.vehicleId || !newMaintenance.description || !newMaintenance.date) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const vehicle = vehicles.find(v => v.id === newMaintenance.vehicleId);
    const record: MaintenanceRecord = {
      id: generateId(),
      vehicleId: newMaintenance.vehicleId,
      vehiclePlate: vehicle?.licensePlate || '',
      type: newMaintenance.type as MaintenanceRecord['type'] || 'scheduled',
      description: newMaintenance.description || '',
      date: newMaintenance.date,
      mileageAtService: newMaintenance.mileageAtService || 0,
      cost: newMaintenance.cost || 0,
      vendor: newMaintenance.vendor || '',
      status: 'scheduled',
      notes: newMaintenance.notes || '',
      createdAt: new Date().toISOString(),
    };

    addMaintenanceRecord(record);
    setShowAddMaintenance(false);
    setNewMaintenance({
      vehicleId: '',
      type: 'scheduled',
      description: '',
      date: '',
      mileageAtService: 0,
      cost: 0,
      vendor: '',
      notes: '',
    });
  };

  // Handle add fuel log
  const handleAddFuelLog = () => {
    if (!newFuelLog.vehicleId || !newFuelLog.date || !newFuelLog.gallons) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const vehicle = vehicles.find(v => v.id === newFuelLog.vehicleId);
    const log: FuelLog = {
      id: generateId(),
      vehicleId: newFuelLog.vehicleId,
      vehiclePlate: vehicle?.licensePlate || '',
      date: newFuelLog.date,
      gallons: newFuelLog.gallons || 0,
      pricePerGallon: newFuelLog.pricePerGallon || 0,
      totalCost: (newFuelLog.gallons || 0) * (newFuelLog.pricePerGallon || 0),
      mileage: newFuelLog.mileage || 0,
      station: newFuelLog.station || '',
      createdAt: new Date().toISOString(),
    };

    addFuelLog(log);

    // Update vehicle mileage
    if (vehicle && newFuelLog.mileage && newFuelLog.mileage > vehicle.mileage) {
      updateVehicle(vehicle.id, { mileage: newFuelLog.mileage, updatedAt: new Date().toISOString() });
    }

    setShowAddFuel(false);
    setNewFuelLog({
      vehicleId: '',
      date: '',
      gallons: 0,
      pricePerGallon: 0,
      mileage: 0,
      station: '',
    });
  };

  const getStatusColor = (status: string) => {
    const statusInfo = VEHICLE_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    };
    return colors[statusInfo?.color || 'gray'];
  };

  return (
    <>
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.vehicleFleet.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vehicleFleet.vehicleFleet', 'Vehicle Fleet')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.vehicleFleet.manageYourTaxiAndRideshare', 'Manage your taxi and rideshare fleet')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="vehicle-fleet" toolName="Vehicle Fleet" />

              <SyncStatus
                isSynced={vehiclesSynced}
                isSaving={vehiclesSaving}
                lastSaved={vehiclesLastSaved}
                syncError={vehiclesSyncError}
                onForceSync={forceVehiclesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(vehicles, vehicleColumns, { filename: 'vehicle-fleet' })}
                onExportExcel={() => exportToExcel(vehicles, vehicleColumns, { filename: 'vehicle-fleet' })}
                onExportJSON={() => exportToJSON(vehicles, { filename: 'vehicle-fleet' })}
                onExportPDF={async () => await exportToPDF(vehicles, vehicleColumns, { filename: 'vehicle-fleet', title: 'Vehicle Fleet Report' })}
                onPrint={() => printData(vehicles, vehicleColumns, { title: 'Vehicle Fleet' })}
                onCopyToClipboard={async () => await copyUtil(vehicles, vehicleColumns, 'tab')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{t('tools.vehicleFleet.active', 'Active')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.active}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{t('tools.vehicleFleet.inMaintenance', 'In Maintenance')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.inMaintenance}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t('tools.vehicleFleet.fleetValue', 'Fleet Value')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                ${(stats.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{t('tools.vehicleFleet.avgMileage', 'Avg Mileage')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {stats.avgMileage.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'fleet', label: 'Fleet', icon: <Car className="w-4 h-4" /> },
              { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
              { id: 'fuel', label: 'Fuel Logs', icon: <Fuel className="w-4 h-4" /> },
              { id: 'alerts', label: `Alerts ${alerts.length > 0 ? `(${alerts.length})` : ''}`, icon: <AlertTriangle className="w-4 h-4" /> },
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
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.vehicleFleet.searchVehicles', 'Search vehicles...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="all">{t('tools.vehicleFleet.allStatuses', 'All Statuses')}</option>
                {VEHICLE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddVehicle(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.vehicleFleet.addVehicle2', 'Add Vehicle')}
              </button>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.length === 0 ? (
                <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.vehicleFleet.noVehiclesFound', 'No vehicles found')}</p>
                </div>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {vehicle.licensePlate}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {VEHICLE_STATUSES.find(s => s.value === vehicle.status)?.label}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => deleteVehicle(vehicle.id)}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {VEHICLE_TYPES.find(t => t.value === vehicle.vehicleType)?.label}
                        </span>
                        <span>{vehicle.capacity} passengers</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          {vehicle.mileage.toLocaleString()} mi
                        </span>
                        <span>{FUEL_TYPES.find(f => f.value === vehicle.fuelType)?.label}</span>
                      </div>
                      {vehicle.assignedDriverName && (
                        <div className="flex items-center gap-1 text-[#0D9488]">
                          <Key className="w-4 h-4" />
                          {vehicle.assignedDriverName}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vehicleFleet.maintenanceRecords', 'Maintenance Records')}
              </h2>
              <button
                onClick={() => setShowAddMaintenance(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.vehicleFleet.addMaintenance', 'Add Maintenance')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.vehicle', 'Vehicle')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.type', 'Type')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.description', 'Description')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.date', 'Date')}</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.cost', 'Cost')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRecords.map((record) => (
                    <tr key={record.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-2 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.vehiclePlate}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {MAINTENANCE_TYPES.find(t => t.value === record.type)?.label}
                      </td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{record.description}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className={`py-2 px-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${record.cost.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          record.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fuel Tab */}
        {activeTab === 'fuel' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vehicleFleet.fuelLogs', 'Fuel Logs')}
              </h2>
              <button
                onClick={() => setShowAddFuel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.vehicleFleet.addFuelLog2', 'Add Fuel Log')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.vehicle2', 'Vehicle')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.date2', 'Date')}</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.gallons', 'Gallons')}</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">$/Gallon</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.total', 'Total')}</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.mileage', 'Mileage')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.vehicleFleet.station', 'Station')}</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log) => (
                    <tr key={log.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-2 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.vehiclePlate}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className={`py-2 px-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.gallons.toFixed(2)}
                      </td>
                      <td className={`py-2 px-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${log.pricePerGallon.toFixed(2)}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${log.totalCost.toFixed(2)}
                      </td>
                      <td className={`py-2 px-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.mileage.toLocaleString()}
                      </td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{log.station}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.vehicleFleet.upcomingAlertsRenewals', 'Upcoming Alerts & Renewals')}
            </h2>
            {alerts.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>{t('tools.vehicleFleet.noUpcomingAlerts', 'No upcoming alerts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((vehicle) => {
                  const now = new Date();
                  const insuranceExpiry = new Date(vehicle.insuranceExpiry);
                  const registrationExpiry = new Date(vehicle.registrationExpiry);
                  const nextMaintenance = new Date(vehicle.nextMaintenanceDate);

                  return (
                    <div
                      key={vehicle.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {vehicle.licensePlate} - {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="space-y-1 text-sm">
                        {insuranceExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                          <div className="flex items-center gap-2 text-orange-500">
                            <Shield className="w-4 h-4" />
                            Insurance expires: {insuranceExpiry.toLocaleDateString()}
                          </div>
                        )}
                        {registrationExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                          <div className="flex items-center gap-2 text-red-500">
                            <FileText className="w-4 h-4" />
                            Registration expires: {registrationExpiry.toLocaleDateString()}
                          </div>
                        )}
                        {nextMaintenance <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                          <div className="flex items-center gap-2 text-yellow-500">
                            <Wrench className="w-4 h-4" />
                            Maintenance due: {nextMaintenance.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleFleet.addVehicle', 'Add Vehicle')}</h2>
                <button onClick={() => setShowAddVehicle(false)}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.make', 'Make *')}</label>
                    <input
                      type="text"
                      value={newVehicle.make || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.model', 'Model *')}</label>
                    <input
                      type="text"
                      value={newVehicle.model || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.year', 'Year')}</label>
                    <input
                      type="number"
                      value={newVehicle.year || new Date().getFullYear()}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.licensePlate', 'License Plate *')}</label>
                    <input
                      type="text"
                      value={newVehicle.licensePlate || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.vehicleType', 'Vehicle Type')}</label>
                    <select
                      value={newVehicle.vehicleType || 'sedan'}
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value as Vehicle['vehicleType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.fuelType', 'Fuel Type')}</label>
                    <select
                      value={newVehicle.fuelType || 'gasoline'}
                      onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value as Vehicle['fuelType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {FUEL_TYPES.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.mileage2', 'Mileage')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newVehicle.mileage || 0}
                      onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.passengerCapacity', 'Passenger Capacity')}</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newVehicle.capacity || 4}
                      onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.vin', 'VIN')}</label>
                  <input
                    type="text"
                    value={newVehicle.vin || ''}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.color', 'Color')}</label>
                    <input
                      type="text"
                      value={newVehicle.color || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.purchasePrice', 'Purchase Price ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={newVehicle.purchasePrice || 0}
                      onChange={(e) => setNewVehicle({ ...newVehicle, purchasePrice: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.insuranceExpiry', 'Insurance Expiry')}</label>
                    <input
                      type="date"
                      value={newVehicle.insuranceExpiry || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, insuranceExpiry: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.registrationExpiry', 'Registration Expiry')}</label>
                    <input
                      type="date"
                      value={newVehicle.registrationExpiry || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, registrationExpiry: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddVehicle(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.vehicleFleet.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddVehicle}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  {t('tools.vehicleFleet.addVehicle3', 'Add Vehicle')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Maintenance Modal */}
        {showAddMaintenance && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleFleet.addMaintenanceRecord', 'Add Maintenance Record')}</h2>
                <button onClick={() => setShowAddMaintenance(false)}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.vehicle3', 'Vehicle *')}</label>
                  <select
                    value={newMaintenance.vehicleId || ''}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.vehicleFleet.selectVehicle', 'Select Vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.licensePlate} - {v.make} {v.model}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.type2', 'Type')}</label>
                    <select
                      value={newMaintenance.type || 'scheduled'}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as MaintenanceRecord['type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {MAINTENANCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.date3', 'Date *')}</label>
                    <input
                      type="date"
                      value={newMaintenance.date || ''}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.description2', 'Description *')}</label>
                  <input
                    type="text"
                    value={newMaintenance.description || ''}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.cost2', 'Cost ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newMaintenance.cost || 0}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.vendor', 'Vendor')}</label>
                    <input
                      type="text"
                      value={newMaintenance.vendor || ''}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, vendor: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddMaintenance(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.vehicleFleet.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddMaintenance}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  {t('tools.vehicleFleet.addRecord', 'Add Record')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Fuel Log Modal */}
        {showAddFuel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleFleet.addFuelLog', 'Add Fuel Log')}</h2>
                <button onClick={() => setShowAddFuel(false)}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.vehicle4', 'Vehicle *')}</label>
                  <select
                    value={newFuelLog.vehicleId || ''}
                    onChange={(e) => setNewFuelLog({ ...newFuelLog, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.vehicleFleet.selectVehicle2', 'Select Vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.licensePlate} - {v.make} {v.model}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.date4', 'Date *')}</label>
                    <input
                      type="date"
                      value={newFuelLog.date || ''}
                      onChange={(e) => setNewFuelLog({ ...newFuelLog, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.mileage3', 'Mileage')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newFuelLog.mileage || 0}
                      onChange={(e) => setNewFuelLog({ ...newFuelLog, mileage: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.gallons2', 'Gallons *')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newFuelLog.gallons || 0}
                      onChange={(e) => setNewFuelLog({ ...newFuelLog, gallons: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.priceGallon', 'Price/Gallon ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newFuelLog.pricePerGallon || 0}
                      onChange={(e) => setNewFuelLog({ ...newFuelLog, pricePerGallon: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vehicleFleet.station2', 'Station')}</label>
                  <input
                    type="text"
                    value={newFuelLog.station || ''}
                    onChange={(e) => setNewFuelLog({ ...newFuelLog, station: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddFuel(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.vehicleFleet.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleAddFuelLog}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  {t('tools.vehicleFleet.addLog', 'Add Log')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default VehicleFleetTool;
