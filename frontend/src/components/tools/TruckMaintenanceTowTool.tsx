'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Truck,
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  DollarSign,
  FileText,
  Settings,
  Fuel,
  Gauge,
  RotateCcw,
  AlertCircle,
  ClipboardList,
  X,
  Edit,
  Trash2,
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

interface TruckMaintenanceTowToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type MaintenanceType = 'oil_change' | 'tire_rotation' | 'brake_service' | 'transmission' | 'hydraulic' | 'electrical' | 'winch_service' | 'body_repair' | 'inspection' | 'other';
type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface TowTruck {
  id: string;
  unitNumber: string;
  type: 'flatbed' | 'wheel_lift' | 'integrated' | 'rotator' | 'heavy_duty';
  make: string;
  model: string;
  year: string;
  vin: string;
  licensePlate: string;
  currentMileage: number;
  lastOilChange: number;
  lastInspection: string;
  status: 'active' | 'maintenance' | 'out_of_service';
  nextServiceDue: number;
  notes: string;
}

interface MaintenanceRecord {
  id: string;
  truckId: string;
  truckUnitNumber: string;
  type: MaintenanceType;
  description: string;
  priority: Priority;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  mileageAtService: number;
  technician: string;
  vendor?: string;
  laborHours: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  partsUsed: string[];
  notes: string;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  invoiceNumber?: string;
  warranty: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceSchedule {
  id: string;
  type: MaintenanceType;
  description: string;
  intervalMiles: number;
  intervalDays: number;
  estimatedCost: number;
  estimatedHours: number;
}

// Constants
const MAINTENANCE_TYPES: { type: MaintenanceType; label: string; icon: React.ReactNode }[] = [
  { type: 'oil_change', label: 'Oil Change', icon: <Fuel className="w-4 h-4" /> },
  { type: 'tire_rotation', label: 'Tire Rotation/Replace', icon: <RotateCcw className="w-4 h-4" /> },
  { type: 'brake_service', label: 'Brake Service', icon: <AlertCircle className="w-4 h-4" /> },
  { type: 'transmission', label: 'Transmission Service', icon: <Settings className="w-4 h-4" /> },
  { type: 'hydraulic', label: 'Hydraulic System', icon: <Gauge className="w-4 h-4" /> },
  { type: 'electrical', label: 'Electrical System', icon: <Wrench className="w-4 h-4" /> },
  { type: 'winch_service', label: 'Winch/Boom Service', icon: <Truck className="w-4 h-4" /> },
  { type: 'body_repair', label: 'Body/Frame Repair', icon: <Wrench className="w-4 h-4" /> },
  { type: 'inspection', label: 'DOT Inspection', icon: <ClipboardList className="w-4 h-4" /> },
  { type: 'other', label: 'Other', icon: <Wrench className="w-4 h-4" /> },
];

const MAINTENANCE_STATUSES: { status: MaintenanceStatus; label: string; color: string }[] = [
  { status: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
  { status: 'overdue', label: 'Overdue', color: 'bg-red-500' },
];

const PRIORITIES: { priority: Priority; label: string; color: string }[] = [
  { priority: 'low', label: 'Low', color: 'bg-gray-500' },
  { priority: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { priority: 'high', label: 'High', color: 'bg-orange-500' },
  { priority: 'critical', label: 'Critical', color: 'bg-red-500' },
];

const DEFAULT_SCHEDULES: MaintenanceSchedule[] = [
  { id: 's1', type: 'oil_change', description: 'Engine oil and filter change', intervalMiles: 5000, intervalDays: 90, estimatedCost: 150, estimatedHours: 1 },
  { id: 's2', type: 'tire_rotation', description: 'Tire rotation and inspection', intervalMiles: 10000, intervalDays: 180, estimatedCost: 100, estimatedHours: 1 },
  { id: 's3', type: 'brake_service', description: 'Brake pad inspection and replacement', intervalMiles: 25000, intervalDays: 365, estimatedCost: 400, estimatedHours: 3 },
  { id: 's4', type: 'transmission', description: 'Transmission fluid change', intervalMiles: 30000, intervalDays: 365, estimatedCost: 300, estimatedHours: 2 },
  { id: 's5', type: 'hydraulic', description: 'Hydraulic fluid and hose inspection', intervalMiles: 15000, intervalDays: 180, estimatedCost: 250, estimatedHours: 2 },
  { id: 's6', type: 'inspection', description: 'DOT annual inspection', intervalMiles: 0, intervalDays: 365, estimatedCost: 150, estimatedHours: 2 },
];

// Column configuration for exports
const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'truckUnitNumber', header: 'Unit #', type: 'string' },
  { key: 'type', header: 'Service Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled', type: 'date' },
  { key: 'completedDate', header: 'Completed', type: 'date' },
  { key: 'mileageAtService', header: 'Mileage', type: 'number' },
  { key: 'technician', header: 'Technician', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
];

const TRUCK_COLUMNS: ColumnConfig[] = [
  { key: 'unitNumber', header: 'Unit #', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'make', header: 'Make', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'year', header: 'Year', type: 'string' },
  { key: 'licensePlate', header: 'License Plate', type: 'string' },
  { key: 'currentMileage', header: 'Mileage', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Default trucks
const DEFAULT_TRUCKS: TowTruck[] = [
  { id: 't1', unitNumber: 'TT-001', type: 'flatbed', make: 'Ford', model: 'F-550', year: '2021', vin: '1FDUF5HT3MED12345', licensePlate: 'TOW-1234', currentMileage: 45230, lastOilChange: 42500, lastInspection: '2024-01-15', status: 'active', nextServiceDue: 47500, notes: '' },
  { id: 't2', unitNumber: 'TT-002', type: 'wheel_lift', make: 'Chevrolet', model: 'Silverado 5500', year: '2020', vin: '1GB5KYCG8LF234567', licensePlate: 'TOW-2345', currentMileage: 62100, lastOilChange: 60000, lastInspection: '2024-02-20', status: 'active', nextServiceDue: 65000, notes: '' },
  { id: 't3', unitNumber: 'TT-003', type: 'integrated', make: 'Peterbilt', model: '337', year: '2019', vin: '2NPWL40X5KM789012', licensePlate: 'TOW-3456', currentMileage: 98500, lastOilChange: 95000, lastInspection: '2023-12-10', status: 'maintenance', nextServiceDue: 100000, notes: 'Transmission issue' },
];

// Main Component
export const TruckMaintenanceTowTool: React.FC<TruckMaintenanceTowToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: maintenanceRecords,
    addItem: addMaintenanceToBackend,
    updateItem: updateMaintenanceBackend,
    deleteItem: deleteMaintenanceBackend,
    isSynced: maintenanceSynced,
    isSaving: maintenanceSaving,
    lastSaved: maintenanceLastSaved,
    syncError: maintenanceSyncError,
    forceSync: forceMaintenanceSync,
  } = useToolData<MaintenanceRecord>('tow-truck-maintenance', [], MAINTENANCE_COLUMNS);

  const {
    data: trucks,
    addItem: addTruckToBackend,
    updateItem: updateTruckBackend,
    deleteItem: deleteTruckBackend,
  } = useToolData<TowTruck>('tow-trucks-fleet', DEFAULT_TRUCKS, TRUCK_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'history' | 'trucks' | 'add'>('dashboard');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<TowTruck | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New maintenance form state
  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceRecord>>({
    truckId: '',
    type: 'oil_change',
    description: '',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    mileageAtService: 0,
    technician: '',
    vendor: '',
    laborHours: 0,
    laborCost: 0,
    partsCost: 0,
    partsUsed: [],
    notes: '',
    warranty: false,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const scheduled = maintenanceRecords.filter(m => m.status === 'scheduled');
    const overdue = maintenanceRecords.filter(m => {
      if (m.status !== 'scheduled') return false;
      return new Date(m.scheduledDate) < new Date();
    });
    const completedThisMonth = maintenanceRecords.filter(m => {
      if (m.status !== 'completed' || !m.completedDate) return false;
      const completedMonth = new Date(m.completedDate).getMonth();
      const currentMonth = new Date().getMonth();
      return completedMonth === currentMonth;
    });
    const monthlySpend = completedThisMonth.reduce((sum, m) => sum + m.totalCost, 0);
    const ytdSpend = maintenanceRecords
      .filter(m => {
        if (m.status !== 'completed' || !m.completedDate) return false;
        return new Date(m.completedDate).getFullYear() === new Date().getFullYear();
      })
      .reduce((sum, m) => sum + m.totalCost, 0);
    const trucksDueService = trucks.filter(t => t.currentMileage >= t.nextServiceDue).length;

    return {
      scheduled: scheduled.length,
      overdue: overdue.length,
      completedThisMonth: completedThisMonth.length,
      monthlySpend,
      ytdSpend,
      trucksDueService,
      activeTrucks: trucks.filter(t => t.status === 'active').length,
      inMaintenance: trucks.filter(t => t.status === 'maintenance').length,
    };
  }, [maintenanceRecords, trucks]);

  // Filter maintenance records
  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter(m => {
      const matchesSearch =
        m.truckUnitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.technician.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || m.type === filterType;
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [maintenanceRecords, searchTerm, filterType, filterStatus]);

  // Upcoming maintenance (scheduled)
  const upcomingMaintenance = useMemo(() => {
    return maintenanceRecords
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [maintenanceRecords]);

  // Create maintenance record
  const createMaintenance = () => {
    if (!newMaintenance.truckId || !newMaintenance.scheduledDate) {
      setValidationMessage('Please select a truck and schedule date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const truck = trucks.find(t => t.id === newMaintenance.truckId);
    if (!truck) return;

    const totalCost = (newMaintenance.laborCost || 0) + (newMaintenance.partsCost || 0);

    const record: MaintenanceRecord = {
      id: generateId(),
      truckId: newMaintenance.truckId,
      truckUnitNumber: truck.unitNumber,
      type: newMaintenance.type || 'oil_change',
      description: newMaintenance.description || MAINTENANCE_TYPES.find(t => t.type === newMaintenance.type)?.label || '',
      priority: newMaintenance.priority || 'medium',
      status: 'scheduled',
      scheduledDate: newMaintenance.scheduledDate,
      mileageAtService: newMaintenance.mileageAtService || truck.currentMileage,
      technician: newMaintenance.technician || '',
      vendor: newMaintenance.vendor,
      laborHours: newMaintenance.laborHours || 0,
      laborCost: newMaintenance.laborCost || 0,
      partsCost: newMaintenance.partsCost || 0,
      totalCost,
      partsUsed: newMaintenance.partsUsed || [],
      notes: newMaintenance.notes || '',
      warranty: newMaintenance.warranty || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addMaintenanceToBackend(record);
    resetForm();
    setShowMaintenanceForm(false);
  };

  const resetForm = () => {
    setNewMaintenance({
      truckId: '',
      type: 'oil_change',
      description: '',
      priority: 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      mileageAtService: 0,
      technician: '',
      vendor: '',
      laborHours: 0,
      laborCost: 0,
      partsCost: 0,
      partsUsed: [],
      notes: '',
      warranty: false,
    });
  };

  // Complete maintenance
  const completeMaintenance = (recordId: string) => {
    const record = maintenanceRecords.find(m => m.id === recordId);
    if (!record) return;

    updateMaintenanceBackend(recordId, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update truck's last service info
    const truck = trucks.find(t => t.id === record.truckId);
    if (truck) {
      const updates: Partial<TowTruck> = { status: 'active' };
      if (record.type === 'oil_change') {
        updates.lastOilChange = record.mileageAtService;
        updates.nextServiceDue = record.mileageAtService + 5000;
      }
      if (record.type === 'inspection') {
        updates.lastInspection = new Date().toISOString();
      }
      updateTruckBackend(truck.id, updates);
    }
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    switch (format) {
      case 'csv':
        exportToCSV(filteredRecords, MAINTENANCE_COLUMNS, { filename: 'tow-truck-maintenance' });
        break;
      case 'excel':
        exportToExcel(filteredRecords, MAINTENANCE_COLUMNS, { filename: 'tow-truck-maintenance' });
        break;
      case 'json':
        exportToJSON(filteredRecords, MAINTENANCE_COLUMNS, { filename: 'tow-truck-maintenance' });
        break;
      case 'pdf':
        exportToPDF(filteredRecords, MAINTENANCE_COLUMNS, { filename: 'tow-truck-maintenance', title: 'Tow Truck Maintenance Report' });
        break;
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const statusInfo = MAINTENANCE_STATUSES.find(s => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.label || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const priorityInfo = PRIORITIES.find(p => p.priority === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${priorityInfo?.color || 'bg-gray-500'}`}>
        {priorityInfo?.label || priority}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">{t('tools.truckMaintenanceTow.towTruckMaintenance', 'Tow Truck Maintenance')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="truck-maintenance-tow" toolName="Truck Maintenance Tow" />

            <SyncStatus
              isSynced={maintenanceSynced}
              isSaving={maintenanceSaving}
              lastSaved={maintenanceLastSaved}
              error={maintenanceSyncError}
              onRetry={forceMaintenanceSync}
            />
            <ExportDropdown
              onExport={handleExport}
              onCopy={() => copyUtil(filteredRecords, 'csv')}
              onPrint={() => printData(filteredRecords, MAINTENANCE_COLUMNS, 'Tow Truck Maintenance Report')}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.scheduled', 'Scheduled')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.overdue', 'Overdue')}</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.completedMonth', 'Completed (Month)')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.monthlySpend', 'Monthly Spend')}</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlySpend)}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.ytdSpend', 'YTD Spend')}</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.ytdSpend)}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.activeTrucks', 'Active Trucks')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeTrucks}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.inMaintenance', 'In Maintenance')}</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.inMaintenance}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.truckMaintenanceTow.dueForService', 'Due for Service')}</div>
            <div className="text-2xl font-bold text-orange-600">{stats.trucksDueService}</div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4">
        <div className="flex gap-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Gauge },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'trucks', label: 'Fleet', icon: Truck },
            { id: 'history', label: 'History', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Alerts */}
            {stats.overdue > 0 && (
              <Card className="p-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-medium text-red-600">{t('tools.truckMaintenanceTow.overdueMaintenance', 'Overdue Maintenance')}</div>
                    <div className="text-sm text-red-500">
                      {stats.overdue} maintenance task(s) are overdue and need immediate attention
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {stats.trucksDueService > 0 && (
              <Card className="p-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-medium text-orange-600">{t('tools.truckMaintenanceTow.trucksDueForService', 'Trucks Due for Service')}</div>
                    <div className="text-sm text-orange-500">
                      {stats.trucksDueService} truck(s) have reached their service mileage
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Upcoming Maintenance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{t('tools.truckMaintenanceTow.upcomingMaintenance', 'Upcoming Maintenance')}</CardTitle>
                  <button
                    onClick={() => setShowMaintenanceForm(true)}
                    className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  {upcomingMaintenance.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {t('tools.truckMaintenanceTow.noUpcomingMaintenanceScheduled', 'No upcoming maintenance scheduled')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMaintenance.slice(0, 5).map(record => {
                        const isOverdue = new Date(record.scheduledDate) < new Date();
                        return (
                          <div
                            key={record.id}
                            className={`p-3 rounded-lg border ${isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-muted/50'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{record.truckUnitNumber}</span>
                                {getPriorityBadge(record.priority)}
                              </div>
                              {isOverdue && (
                                <span className="text-xs text-red-600 font-medium">{t('tools.truckMaintenanceTow.overdue2', 'OVERDUE')}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {MAINTENANCE_TYPES.find(t => t.type === record.type)?.icon}
                              <span>{record.description || MAINTENANCE_TYPES.find(t => t.type === record.type)?.label}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                              <span>{formatDate(record.scheduledDate)}</span>
                              <button
                                onClick={() => completeMaintenance(record.id)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                {t('tools.truckMaintenanceTow.complete', 'Complete')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fleet Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('tools.truckMaintenanceTow.fleetStatus', 'Fleet Status')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trucks.map(truck => {
                      const milesUntilService = truck.nextServiceDue - truck.currentMileage;
                      const needsService = milesUntilService <= 0;
                      const soonService = milesUntilService > 0 && milesUntilService < 500;

                      return (
                        <div key={truck.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{truck.unitNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                                truck.status === 'active' ? 'bg-green-500' :
                                truck.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}>
                                {truck.status}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {truck.year} {truck.make} {truck.model}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>{formatNumber(truck.currentMileage)} mi</span>
                            <span className={`${
                              needsService ? 'text-red-600 font-bold' :
                              soonService ? 'text-orange-600' : 'text-muted-foreground'
                            }`}>
                              {needsService ? 'Service Due' :
                               soonService ? `${formatNumber(milesUntilService)} mi until service` :
                               `${formatNumber(milesUntilService)} mi until service`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('tools.truckMaintenanceTow.maintenanceSchedule', 'Maintenance Schedule')}</h3>
              <button
                onClick={() => setShowMaintenanceForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.truckMaintenanceTow.scheduleMaintenance2', 'Schedule Maintenance')}
              </button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.unit', 'Unit')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.service', 'Service')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.scheduled2', 'Scheduled')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.priority', 'Priority')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.technician', 'Technician')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.estCost', 'Est. Cost')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.status', 'Status')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingMaintenance.map(record => (
                        <tr key={record.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono font-bold">{record.truckUnitNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {MAINTENANCE_TYPES.find(t => t.type === record.type)?.icon}
                              {MAINTENANCE_TYPES.find(t => t.type === record.type)?.label}
                            </div>
                          </td>
                          <td className="p-3">{formatDate(record.scheduledDate)}</td>
                          <td className="p-3">{getPriorityBadge(record.priority)}</td>
                          <td className="p-3">{record.technician || '-'}</td>
                          <td className="p-3">{formatCurrency(record.totalCost)}</td>
                          <td className="p-3">{getStatusBadge(record.status)}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => completeMaintenance(record.id)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title={t('tools.truckMaintenanceTow.complete2', 'Complete')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteMaintenanceBackend(record.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fleet Tab */}
        {activeTab === 'trucks' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.truckMaintenanceTow.fleetInventory', 'Fleet Inventory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.unit2', 'Unit #')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.type', 'Type')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.vehicle', 'Vehicle')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.licensePlate', 'License Plate')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.mileage', 'Mileage')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.lastOilChange', 'Last Oil Change')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.lastInspection', 'Last Inspection')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.nextService', 'Next Service')}</th>
                      <th className="text-left p-3">{t('tools.truckMaintenanceTow.status2', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map(truck => (
                      <tr key={truck.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono font-bold">{truck.unitNumber}</td>
                        <td className="p-3 capitalize">{truck.type.replace('_', ' ')}</td>
                        <td className="p-3">{truck.year} {truck.make} {truck.model}</td>
                        <td className="p-3 font-mono">{truck.licensePlate}</td>
                        <td className="p-3">{formatNumber(truck.currentMileage)} mi</td>
                        <td className="p-3">{formatNumber(truck.lastOilChange)} mi</td>
                        <td className="p-3">{formatDate(truck.lastInspection)}</td>
                        <td className="p-3">
                          <span className={truck.currentMileage >= truck.nextServiceDue ? 'text-red-600 font-bold' : ''}>
                            {formatNumber(truck.nextServiceDue)} mi
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${
                            truck.status === 'active' ? 'bg-green-500' :
                            truck.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {truck.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  placeholder={t('tools.truckMaintenanceTow.searchRecords', 'Search records...')}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.truckMaintenanceTow.allTypes', 'All Types')}</option>
                {MAINTENANCE_TYPES.map(t => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.truckMaintenanceTow.allStatus', 'All Status')}</option>
                {MAINTENANCE_STATUSES.map(s => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.unit3', 'Unit')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.service2', 'Service')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.description', 'Description')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.scheduled3', 'Scheduled')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.completed', 'Completed')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.mileage2', 'Mileage')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.technician2', 'Technician')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.cost', 'Cost')}</th>
                        <th className="text-left p-3">{t('tools.truckMaintenanceTow.status3', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(record => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono font-bold">{record.truckUnitNumber}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {MAINTENANCE_TYPES.find(t => t.type === record.type)?.icon}
                                {MAINTENANCE_TYPES.find(t => t.type === record.type)?.label}
                              </div>
                            </td>
                            <td className="p-3 max-w-[200px] truncate">{record.description}</td>
                            <td className="p-3">{formatDate(record.scheduledDate)}</td>
                            <td className="p-3">{record.completedDate ? formatDate(record.completedDate) : '-'}</td>
                            <td className="p-3">{formatNumber(record.mileageAtService)} mi</td>
                            <td className="p-3">{record.technician}</td>
                            <td className="p-3 font-medium">{formatCurrency(record.totalCost)}</td>
                            <td className="p-3">{getStatusBadge(record.status)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.truckMaintenanceTow.scheduleMaintenance', 'Schedule Maintenance')}</CardTitle>
              <button onClick={() => setShowMaintenanceForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.truck', 'Truck *')}</label>
                  <select
                    value={newMaintenance.truckId}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, truckId: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">{t('tools.truckMaintenanceTow.selectTruck', 'Select Truck')}</option>
                    {trucks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.unitNumber} - {t.year} {t.make} {t.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.serviceType', 'Service Type')}</label>
                  <select
                    value={newMaintenance.type}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as MaintenanceType })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {MAINTENANCE_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.scheduledDate', 'Scheduled Date *')}</label>
                  <input
                    type="date"
                    value={newMaintenance.scheduledDate}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.priority2', 'Priority')}</label>
                  <select
                    value={newMaintenance.priority}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, priority: e.target.value as Priority })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.priority} value={p.priority}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.technician3', 'Technician')}</label>
                  <input
                    type="text"
                    value={newMaintenance.technician}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, technician: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                    placeholder={t('tools.truckMaintenanceTow.technicianName', 'Technician name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.vendor', 'Vendor')}</label>
                  <input
                    type="text"
                    value={newMaintenance.vendor}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, vendor: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                    placeholder={t('tools.truckMaintenanceTow.vendorShop', 'Vendor/Shop')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.laborCost', 'Labor Cost')}</label>
                  <input
                    type="number"
                    value={newMaintenance.laborCost}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, laborCost: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md bg-background"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.partsCost', 'Parts Cost')}</label>
                  <input
                    type="number"
                    value={newMaintenance.partsCost}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, partsCost: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md bg-background"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.description2', 'Description')}</label>
                <textarea
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                  rows={2}
                  placeholder={t('tools.truckMaintenanceTow.serviceDescription', 'Service description...')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.truckMaintenanceTow.notes', 'Notes')}</label>
                <textarea
                  value={newMaintenance.notes}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, notes: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                  rows={2}
                  placeholder={t('tools.truckMaintenanceTow.additionalNotes', 'Additional notes...')}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newMaintenance.warranty}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, warranty: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm">{t('tools.truckMaintenanceTow.warrantyCovered', 'Warranty Covered')}</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  {t('tools.truckMaintenanceTow.cancel', 'Cancel')}
                </button>
                <button
                  onClick={createMaintenance}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {t('tools.truckMaintenanceTow.schedule', 'Schedule')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default TruckMaintenanceTowTool;
