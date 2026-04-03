'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Thermometer,
  Fan,
  Calendar,
  Clock,
  User,
  Wrench,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Home,
  FileText,
  Bell,
  Settings,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Gauge,
  Zap,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface HVACMaintenanceToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type EquipmentType = 'ac' | 'furnace' | 'heat_pump' | 'boiler' | 'split_system' | 'package_unit';
type MaintenanceType = 'preventive' | 'repair' | 'installation' | 'inspection' | 'emergency';
type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type EquipmentStatus = 'operational' | 'needs_service' | 'under_repair' | 'offline';

interface Equipment {
  id: string;
  customerId: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  installDate: string;
  warrantyExpiry: string;
  location: string;
  status: EquipmentStatus;
  lastServiceDate: string;
  nextServiceDue: string;
  notes: string;
  efficiency: number; // SEER rating or efficiency %
  createdAt: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  customerId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  scheduledTime: string;
  completedDate: string;
  technicianId: string;
  description: string;
  findings: string;
  partsUsed: string;
  laborHours: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  customerApproval: boolean;
  notes: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceContract: boolean;
  contractExpiry: string;
  notes: string;
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  certifications: string[];
  available: boolean;
}

// Constants
const EQUIPMENT_TYPES: { type: EquipmentType; label: string; icon: React.ReactNode }[] = [
  { type: 'ac', label: 'Air Conditioner', icon: <Fan className="w-4 h-4" /> },
  { type: 'furnace', label: 'Furnace', icon: <Thermometer className="w-4 h-4" /> },
  { type: 'heat_pump', label: 'Heat Pump', icon: <Zap className="w-4 h-4" /> },
  { type: 'boiler', label: 'Boiler', icon: <Gauge className="w-4 h-4" /> },
  { type: 'split_system', label: 'Split System', icon: <Fan className="w-4 h-4" /> },
  { type: 'package_unit', label: 'Package Unit', icon: <Home className="w-4 h-4" /> },
];

const MAINTENANCE_TYPES: { type: MaintenanceType; label: string }[] = [
  { type: 'preventive', label: 'Preventive Maintenance' },
  { type: 'repair', label: 'Repair' },
  { type: 'installation', label: 'Installation' },
  { type: 'inspection', label: 'Inspection' },
  { type: 'emergency', label: 'Emergency Service' },
];

const STATUSES: { status: MaintenanceStatus; label: string }[] = [
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
  { status: 'overdue', label: 'Overdue' },
];

const DEFAULT_TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'Mike Johnson', phone: '555-0101', certifications: ['EPA 608', 'NATE'], available: true },
  { id: 'tech-2', name: 'Sarah Davis', phone: '555-0102', certifications: ['EPA 608', 'HVAC Excellence'], available: true },
  { id: 'tech-3', name: 'Tom Wilson', phone: '555-0103', certifications: ['EPA 608'], available: false },
];

// Column configurations for exports
const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'installDate', header: 'Install Date', type: 'date' },
  { key: 'warrantyExpiry', header: 'Warranty Expiry', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'lastServiceDate', header: 'Last Service', type: 'date' },
  { key: 'nextServiceDue', header: 'Next Service', type: 'date' },
  { key: 'efficiency', header: 'Efficiency', type: 'number' },
];

const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'equipmentInfo', header: 'Equipment', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'laborHours', header: 'Labor Hours', type: 'number' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'completedDate', header: 'Completed', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const HVACMaintenanceTool: React.FC<HVACMaintenanceToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    forceSync: forceCustomersSync,
  } = useToolData<Customer>('hvac-customers', [], []);

  const {
    data: equipment,
    addItem: addEquipmentToBackend,
    updateItem: updateEquipmentBackend,
    deleteItem: deleteEquipmentBackend,
    isSynced: equipmentSynced,
    isSaving: equipmentSaving,
    lastSaved: equipmentLastSaved,
    forceSync: forceEquipmentSync,
  } = useToolData<Equipment>('hvac-equipment', [], EQUIPMENT_COLUMNS);

  const {
    data: maintenanceRecords,
    addItem: addMaintenanceToBackend,
    updateItem: updateMaintenanceBackend,
    deleteItem: deleteMaintenanceBackend,
    isSynced: maintenanceSynced,
    isSaving: maintenanceSaving,
    lastSaved: maintenanceLastSaved,
    forceSync: forceMaintenanceSync,
  } = useToolData<MaintenanceRecord>('hvac-maintenance', [], MAINTENANCE_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'equipment' | 'customers' | 'reports'>('schedule');
  const [showNewMaintenanceForm, setShowNewMaintenanceForm] = useState(false);
  const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [technicians] = useState<Technician[]>(DEFAULT_TECHNICIANS);

  // Form states
  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceRecord>>({
    type: 'preventive',
    status: 'scheduled',
    scheduledDate: '',
    scheduledTime: '',
    description: '',
    laborHours: 0,
    laborCost: 0,
    partsCost: 0,
    notes: '',
  });

  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    type: 'ac',
    brand: '',
    model: '',
    serialNumber: '',
    installDate: '',
    warrantyExpiry: '',
    location: '',
    efficiency: 0,
    notes: '',
  });

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceContract: false,
    contractExpiry: '',
    notes: '',
  });

  // Filtered maintenance records
  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter((record) => {
      const customer = customers.find((c) => c.id === record.customerId);
      const equip = equipment.find((e) => e.id === record.equipmentId);
      const matchesSearch =
        searchTerm === '' ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equip?.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      const matchesType = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [maintenanceRecords, customers, equipment, searchTerm, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const scheduledToday = maintenanceRecords.filter((r) => r.scheduledDate === today && r.status === 'scheduled');
    const overdue = maintenanceRecords.filter((r) => r.scheduledDate < today && r.status === 'scheduled');
    const needsService = equipment.filter((e) => e.status === 'needs_service');
    const warrantyExpiring = equipment.filter((e) => {
      const expiry = new Date(e.warrantyExpiry);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      return expiry <= thirtyDays && expiry > new Date();
    });

    return {
      scheduledToday: scheduledToday.length,
      overdue: overdue.length,
      needsService: needsService.length,
      warrantyExpiring: warrantyExpiring.length,
    };
  }, [maintenanceRecords, equipment]);

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      name: newCustomer.name || '',
      phone: newCustomer.phone || '',
      email: newCustomer.email || '',
      address: newCustomer.address || '',
      city: newCustomer.city || '',
      state: newCustomer.state || '',
      zipCode: newCustomer.zipCode || '',
      serviceContract: newCustomer.serviceContract || false,
      contractExpiry: newCustomer.contractExpiry || '',
      notes: newCustomer.notes || '',
      createdAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setShowNewCustomerForm(false);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      serviceContract: false,
      contractExpiry: '',
      notes: '',
    });
  };

  // Add new equipment
  const addEquipment = () => {
    if (!selectedCustomerId || !newEquipment.brand || !newEquipment.model) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const nextService = new Date();
    nextService.setMonth(nextService.getMonth() + 6);

    const equip: Equipment = {
      id: generateId(),
      customerId: selectedCustomerId,
      type: newEquipment.type || 'ac',
      brand: newEquipment.brand || '',
      model: newEquipment.model || '',
      serialNumber: newEquipment.serialNumber || '',
      installDate: newEquipment.installDate || '',
      warrantyExpiry: newEquipment.warrantyExpiry || '',
      location: newEquipment.location || '',
      status: 'operational',
      lastServiceDate: '',
      nextServiceDue: nextService.toISOString().split('T')[0],
      notes: newEquipment.notes || '',
      efficiency: newEquipment.efficiency || 0,
      createdAt: new Date().toISOString(),
    };

    addEquipmentToBackend(equip);
    setShowNewEquipmentForm(false);
    setNewEquipment({
      type: 'ac',
      brand: '',
      model: '',
      serialNumber: '',
      installDate: '',
      warrantyExpiry: '',
      location: '',
      efficiency: 0,
      notes: '',
    });
  };

  // Add new maintenance record
  const addMaintenance = () => {
    if (!selectedCustomerId || !selectedEquipmentId || !newMaintenance.description) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalCost = (newMaintenance.laborCost || 0) + (newMaintenance.partsCost || 0);

    const record: MaintenanceRecord = {
      id: generateId(),
      equipmentId: selectedEquipmentId,
      customerId: selectedCustomerId,
      type: newMaintenance.type || 'preventive',
      status: newMaintenance.status || 'scheduled',
      scheduledDate: newMaintenance.scheduledDate || '',
      scheduledTime: newMaintenance.scheduledTime || '',
      completedDate: '',
      technicianId: newMaintenance.technicianId || '',
      description: newMaintenance.description || '',
      findings: '',
      partsUsed: '',
      laborHours: newMaintenance.laborHours || 0,
      laborCost: newMaintenance.laborCost || 0,
      partsCost: newMaintenance.partsCost || 0,
      totalCost,
      customerApproval: false,
      notes: newMaintenance.notes || '',
      createdAt: new Date().toISOString(),
    };

    addMaintenanceToBackend(record);
    setShowNewMaintenanceForm(false);
    setNewMaintenance({
      type: 'preventive',
      status: 'scheduled',
      scheduledDate: '',
      scheduledTime: '',
      description: '',
      laborHours: 0,
      laborCost: 0,
      partsCost: 0,
      notes: '',
    });
    setSelectedEquipmentId('');
  };

  // Update maintenance status
  const updateMaintenanceStatus = (recordId: string, newStatus: MaintenanceStatus) => {
    const updates: Partial<MaintenanceRecord> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completedDate = new Date().toISOString();
    }
    updateMaintenanceBackend(recordId, updates);
  };

  // Complete maintenance and update equipment
  const completeMaintenance = (recordId: string) => {
    const record = maintenanceRecords.find((r) => r.id === recordId);
    if (!record) return;

    const today = new Date().toISOString().split('T')[0];
    const nextService = new Date();
    nextService.setMonth(nextService.getMonth() + 6);

    updateMaintenanceBackend(recordId, {
      status: 'completed',
      completedDate: today,
    });

    updateEquipmentBackend(record.equipmentId, {
      lastServiceDate: today,
      nextServiceDue: nextService.toISOString().split('T')[0],
      status: 'operational',
    });
  };

  // Delete maintenance record
  const deleteRecord = useCallback(
    async (recordId: string) => {
      const confirmed = await confirm({
        title: 'Delete Maintenance Record',
        message: 'Are you sure you want to delete this maintenance record? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (confirmed) {
        deleteMaintenanceBackend(recordId);
      }
    },
    [confirm, deleteMaintenanceBackend]
  );

  // Get status color
  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'scheduled':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'cancelled':
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
      case 'overdue':
        return theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default:
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  // Get equipment status color
  const getEquipmentStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'operational':
        return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'needs_service':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'under_repair':
        return theme === 'dark' ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700';
      case 'offline':
        return theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default:
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  // Export handlers
  const handleExport = async (format: string) => {
    const exportData = filteredRecords.map((record) => {
      const customer = customers.find((c) => c.id === record.customerId);
      const equip = equipment.find((e) => e.id === record.equipmentId);
      const technician = technicians.find((t) => t.id === record.technicianId);
      return {
        ...record,
        customerName: customer?.name || 'Unknown',
        equipmentInfo: `${equip?.brand} ${equip?.model}` || 'Unknown',
        technicianName: technician?.name || 'Unassigned',
      };
    });

    switch (format) {
      case 'csv':
        exportToCSV(exportData, MAINTENANCE_COLUMNS, 'hvac-maintenance');
        break;
      case 'excel':
        await exportToExcel(exportData, MAINTENANCE_COLUMNS, 'hvac-maintenance');
        break;
      case 'json':
        exportToJSON(exportData, 'hvac-maintenance');
        break;
      case 'pdf':
        await exportToPDF(exportData, MAINTENANCE_COLUMNS, 'HVAC Maintenance Report');
        break;
      case 'copy':
        await copyUtil(exportData, MAINTENANCE_COLUMNS);
        break;
      case 'print':
        printData(exportData, MAINTENANCE_COLUMNS, 'HVAC Maintenance Report');
        break;
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.hVACMaintenance.hvacMaintenanceScheduling', 'HVAC Maintenance Scheduling')}
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.hVACMaintenance.scheduleAndTrackHvacSystem', 'Schedule and track HVAC system maintenance')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="h-v-a-c-maintenance" toolName="H V A C Maintenance" />

          <SyncStatus
            isSynced={maintenanceSynced && equipmentSynced && customersSynced}
            isSaving={maintenanceSaving || equipmentSaving || customersSaving}
            lastSaved={maintenanceLastSaved}
            onForceSync={() => {
              forceMaintenanceSync();
              forceEquipmentSync();
              forceCustomersSync();
            }}
          />
          <ExportDropdown onExport={handleExport} />
          <button
            onClick={() => setShowNewMaintenanceForm(true)}
            className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.hVACMaintenance.scheduleMaintenance2', 'Schedule Maintenance')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.scheduledToday}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.scheduledToday', 'Scheduled Today')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.overdue}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.overdue', 'Overdue')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Wrench className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.needsService}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.needsService', 'Needs Service')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Bell className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.warrantyExpiring}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.warrantyExpiring', 'Warranty Expiring')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'schedule', label: 'Maintenance Schedule', icon: <Calendar className="w-4 h-4" /> },
          { id: 'equipment', label: 'Equipment', icon: <Thermometer className="w-4 h-4" /> },
          { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
          { id: 'reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Maintenance Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.hVACMaintenance.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.hVACMaintenance.allStatuses', 'All Statuses')}</option>
                  {STATUSES.map((s) => (
                    <option key={s.status} value={s.status}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.hVACMaintenance.allTypes', 'All Types')}</option>
                  {MAINTENANCE_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance List */}
          <div className="space-y-3">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const customer = customers.find((c) => c.id === record.customerId);
                const equip = equipment.find((e) => e.id === record.equipmentId);
                const technician = technicians.find((t) => t.id === record.technicianId);
                const equipType = EQUIPMENT_TYPES.find((t) => t.type === equip?.type);

                return (
                  <Card
                    key={record.id}
                    className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            {equipType?.icon || <Thermometer className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {customer?.name || 'Unknown Customer'}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(record.status)}`}>
                                {STATUSES.find((s) => s.status === record.status)?.label}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {equip?.brand} {equip?.model} - {record.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Calendar className="w-3 h-3" />
                                {formatDate(record.scheduledDate)} {record.scheduledTime}
                              </span>
                              {technician && (
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <User className="w-3 h-3" />
                                  {technician.name}
                                </span>
                              )}
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Wrench className="w-3 h-3" />
                                {MAINTENANCE_TYPES.find((t) => t.type === record.type)?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.status !== 'completed' && record.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => completeMaintenance(record.id)}
                                className={`px-3 py-1.5 text-sm rounded-lg ${
                                  theme === 'dark'
                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {t('tools.hVACMaintenance.complete', 'Complete')}
                              </button>
                              <select
                                value={record.status}
                                onChange={(e) => updateMaintenanceStatus(record.id, e.target.value as MaintenanceStatus)}
                                className={`px-3 py-1.5 text-sm rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s.status} value={s.status}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.hVACMaintenance.noMaintenanceRecordsFoundSchedule', 'No maintenance records found. Schedule your first maintenance!')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewEquipmentForm(true)}
              className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.hVACMaintenance.addEquipment2', 'Add Equipment')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((equip) => {
              const customer = customers.find((c) => c.id === equip.customerId);
              const equipType = EQUIPMENT_TYPES.find((t) => t.type === equip.type);
              return (
                <Card
                  key={equip.id}
                  className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {equipType?.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {equip.brand} {equip.model}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {customer?.name}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded ${getEquipmentStatusColor(equip.status)}`}>
                        {equip.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.hVACMaintenance.serial', 'Serial:')}</span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{equip.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.hVACMaintenance.installed', 'Installed:')}</span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(equip.installDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.hVACMaintenance.lastService', 'Last Service:')}</span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(equip.lastServiceDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.hVACMaintenance.nextDue', 'Next Due:')}</span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(equip.nextServiceDue)}</span>
                      </div>
                      {equip.efficiency > 0 && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.hVACMaintenance.efficiency', 'Efficiency:')}</span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{equip.efficiency} SEER</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {equipment.length === 0 && (
              <Card className={`col-span-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="py-12 text-center">
                  <Thermometer className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.hVACMaintenance.noEquipmentRegisteredAddYour', 'No equipment registered. Add your first unit!')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>Customers ({customers.length})</span>
                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCustomerId === customer.id
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${selectedCustomerId === customer.id ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.name}
                          </p>
                          <p className={`text-sm ${selectedCustomerId === customer.id ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {customer.phone}
                          </p>
                        </div>
                        {customer.serviceContract && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            selectedCustomerId === customer.id
                              ? 'bg-white/20 text-white'
                              : theme === 'dark'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {t('tools.hVACMaintenance.contract', 'Contract')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.hVACMaintenance.noCustomersYet', 'No customers yet.')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {selectedCustomerId ? (
              (() => {
                const customer = customers.find((c) => c.id === selectedCustomerId);
                if (!customer) return null;
                const customerEquipment = equipment.filter((e) => e.customerId === selectedCustomerId);
                return (
                  <div className="space-y-4">
                    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                      <CardHeader>
                        <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {t('tools.hVACMaintenance.customerDetails', 'Customer Details')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.name', 'Name')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.name}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.phone', 'Phone')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.phone}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.email', 'Email')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.address', 'Address')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACMaintenance.serviceContract', 'Service Contract')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.serviceContract ? `Yes (Expires: ${formatDate(customer.contractExpiry)})` : 'No'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                      <CardHeader>
                        <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          Equipment ({customerEquipment.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {customerEquipment.map((equip) => {
                            const equipType = EQUIPMENT_TYPES.find((t) => t.type === equip.type);
                            return (
                              <div
                                key={equip.id}
                                className={`p-3 rounded-lg flex items-center justify-between ${
                                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {equipType?.icon}
                                  <div>
                                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {equip.brand} {equip.model}
                                    </p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {equip.location}
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded ${getEquipmentStatusColor(equip.status)}`}>
                                  {equip.status.replace('_', ' ')}
                                </span>
                              </div>
                            );
                          })}
                          {customerEquipment.length === 0 && (
                            <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {t('tools.hVACMaintenance.noEquipmentRegistered', 'No equipment registered')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.hVACMaintenance.selectACustomerToView', 'Select a customer to view details')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.hVACMaintenance.maintenanceSummary', 'Maintenance Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MAINTENANCE_TYPES.map((type) => {
                  const count = maintenanceRecords.filter((r) => r.type === type.type).length;
                  const completed = maintenanceRecords.filter((r) => r.type === type.type && r.status === 'completed').length;
                  return (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{type.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {completed}/{count}
                        </span>
                        <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-2 rounded-full bg-[#0D9488]"
                            style={{ width: `${count > 0 ? (completed / count) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.hVACMaintenance.equipmentByType', 'Equipment by Type')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EQUIPMENT_TYPES.map((type) => {
                  const count = equipment.filter((e) => e.type === type.type).length;
                  const total = equipment.length || 1;
                  return (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{type.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {count}
                        </span>
                        <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-2 rounded-full bg-[#0D9488]"
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Maintenance Modal */}
      {showNewMaintenanceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.hVACMaintenance.scheduleMaintenance', 'Schedule Maintenance')}</span>
                <button onClick={() => setShowNewMaintenanceForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.customer', 'Customer *')}
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setSelectedEquipmentId('');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.hVACMaintenance.selectCustomer', 'Select Customer')}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.equipment', 'Equipment *')}
                  </label>
                  <select
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                    disabled={!selectedCustomerId}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488] disabled:opacity-50`}
                  >
                    <option value="">{t('tools.hVACMaintenance.selectEquipment', 'Select Equipment')}</option>
                    {equipment
                      .filter((e) => e.customerId === selectedCustomerId)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.brand} {e.model} - {e.location}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.maintenanceType', 'Maintenance Type')}
                    </label>
                    <select
                      value={newMaintenance.type}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as MaintenanceType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {MAINTENANCE_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.technician', 'Technician')}
                    </label>
                    <select
                      value={newMaintenance.technicianId}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, technicianId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="">{t('tools.hVACMaintenance.unassigned', 'Unassigned')}</option>
                      {technicians.filter((t) => t.available).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.scheduledDate', 'Scheduled Date')}
                    </label>
                    <input
                      type="date"
                      value={newMaintenance.scheduledDate}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.scheduledTime', 'Scheduled Time')}
                    </label>
                    <input
                      type="time"
                      value={newMaintenance.scheduledTime}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.description', 'Description *')}
                  </label>
                  <textarea
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.hVACMaintenance.describeTheMaintenanceWork', 'Describe the maintenance work...')}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewMaintenanceForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.hVACMaintenance.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addMaintenance}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.hVACMaintenance.scheduleMaintenance3', 'Schedule Maintenance')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Equipment Modal */}
      {showNewEquipmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.hVACMaintenance.addEquipment', 'Add Equipment')}</span>
                <button onClick={() => setShowNewEquipmentForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.customer2', 'Customer *')}
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.hVACMaintenance.selectCustomer2', 'Select Customer')}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.type', 'Type')}
                    </label>
                    <select
                      value={newEquipment.type}
                      onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value as EquipmentType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {EQUIPMENT_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.brand', 'Brand *')}
                    </label>
                    <input
                      type="text"
                      value={newEquipment.brand}
                      onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.model', 'Model *')}
                    </label>
                    <input
                      type="text"
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.serialNumber', 'Serial Number')}
                    </label>
                    <input
                      type="text"
                      value={newEquipment.serialNumber}
                      onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                    placeholder={t('tools.hVACMaintenance.eGBasementAtticGarage', 'e.g., Basement, Attic, Garage')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.installDate', 'Install Date')}
                    </label>
                    <input
                      type="date"
                      value={newEquipment.installDate}
                      onChange={(e) => setNewEquipment({ ...newEquipment, installDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.warrantyExpiry', 'Warranty Expiry')}
                    </label>
                    <input
                      type="date"
                      value={newEquipment.warrantyExpiry}
                      onChange={(e) => setNewEquipment({ ...newEquipment, warrantyExpiry: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewEquipmentForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.hVACMaintenance.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addEquipment}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.hVACMaintenance.addEquipment3', 'Add Equipment')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.hVACMaintenance.newCustomer', 'New Customer')}</span>
                <button onClick={() => setShowNewCustomerForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.name2', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.phone2', 'Phone *')}
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.email2', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hVACMaintenance.address2', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hVACMaintenance.zipCode', 'Zip Code')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.zipCode}
                      onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCustomer.serviceContract}
                      onChange={(e) => setNewCustomer({ ...newCustomer, serviceContract: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.hVACMaintenance.serviceContract2', 'Service Contract')}</span>
                  </label>
                  {newCustomer.serviceContract && (
                    <div className="flex-1">
                      <input
                        type="date"
                        value={newCustomer.contractExpiry}
                        onChange={(e) => setNewCustomer({ ...newCustomer, contractExpiry: e.target.value })}
                        placeholder={t('tools.hVACMaintenance.contractExpiry', 'Contract Expiry')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewCustomerForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.hVACMaintenance.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={addCustomer}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.hVACMaintenance.addCustomer', 'Add Customer')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Toast Message */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg bg-red-500/90 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{validationMessage}</p>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default HVACMaintenanceTool;
