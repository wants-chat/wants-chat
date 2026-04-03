'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Wrench,
  Truck,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Settings,
  Fuel,
  Gauge,
  RotateCcw,
  History,
  FileText,
  Package,
  Cog,
  Scissors,
  Wind,
  Droplets,
  Shovel,
  TreeDeciduous,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface EquipmentMaintenanceLandscapeToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type EquipmentType = 'mower-zero-turn' | 'mower-push' | 'mower-riding' | 'trimmer' | 'blower' | 'edger' | 'chainsaw' | 'hedge-trimmer' | 'aerator' | 'dethatcher' | 'spreader' | 'sprayer' | 'truck' | 'trailer' | 'skid-steer' | 'excavator';
type EquipmentStatus = 'operational' | 'needs-service' | 'in-service' | 'out-of-service';
type MaintenanceType = 'oil-change' | 'filter-change' | 'blade-sharpening' | 'blade-replacement' | 'belt-replacement' | 'spark-plug' | 'fuel-system' | 'air-filter' | 'tire-service' | 'lubrication' | 'cleaning' | 'winterization' | 'de-winterization' | 'inspection' | 'repair' | 'other';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: EquipmentStatus;
  hourMeter: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'battery' | 'propane';
  location: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceType: MaintenanceType;
  description: string;
  performedDate: string;
  performedBy: string;
  hourMeterReading: number;
  cost: number;
  partsUsed: string[];
  notes: string;
  createdAt: string;
}

interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  maintenanceType: MaintenanceType;
  intervalHours: number;
  intervalDays: number;
  lastPerformed: string;
  lastHourMeter: number;
  nextDue: string;
  nextDueHours: number;
  priority: MaintenancePriority;
  estimatedCost: number;
  notes: string;
}

// Constants
const EQUIPMENT_TYPES: { value: EquipmentType; label: string; icon: React.ReactNode }[] = [
  { value: 'mower-zero-turn', label: 'Zero-Turn Mower', icon: <Scissors className="w-4 h-4" /> },
  { value: 'mower-push', label: 'Push Mower', icon: <Scissors className="w-4 h-4" /> },
  { value: 'mower-riding', label: 'Riding Mower', icon: <Scissors className="w-4 h-4" /> },
  { value: 'trimmer', label: 'String Trimmer', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'blower', label: 'Blower', icon: <Wind className="w-4 h-4" /> },
  { value: 'edger', label: 'Edger', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'chainsaw', label: 'Chainsaw', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'hedge-trimmer', label: 'Hedge Trimmer', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'aerator', label: 'Aerator', icon: <Wind className="w-4 h-4" /> },
  { value: 'dethatcher', label: 'Dethatcher', icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'spreader', label: 'Spreader', icon: <Droplets className="w-4 h-4" /> },
  { value: 'sprayer', label: 'Sprayer', icon: <Droplets className="w-4 h-4" /> },
  { value: 'truck', label: 'Truck', icon: <Truck className="w-4 h-4" /> },
  { value: 'trailer', label: 'Trailer', icon: <Truck className="w-4 h-4" /> },
  { value: 'skid-steer', label: 'Skid Steer', icon: <Shovel className="w-4 h-4" /> },
  { value: 'excavator', label: 'Excavator', icon: <Shovel className="w-4 h-4" /> },
];

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'filter-change', label: 'Filter Change' },
  { value: 'blade-sharpening', label: 'Blade Sharpening' },
  { value: 'blade-replacement', label: 'Blade Replacement' },
  { value: 'belt-replacement', label: 'Belt Replacement' },
  { value: 'spark-plug', label: 'Spark Plug' },
  { value: 'fuel-system', label: 'Fuel System Service' },
  { value: 'air-filter', label: 'Air Filter' },
  { value: 'tire-service', label: 'Tire Service' },
  { value: 'lubrication', label: 'Lubrication' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'winterization', label: 'Winterization' },
  { value: 'de-winterization', label: 'De-winterization' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  operational: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'needs-service': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'in-service': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'out-of-service': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PRIORITY_COLORS: Record<MaintenancePriority, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Column configuration for exports
const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Equipment Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'serialNumber', header: 'Serial #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'hourMeter', header: 'Hours', type: 'number' },
  { key: 'currentValue', header: 'Value', type: 'currency' },
];

const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'equipmentName', header: 'Equipment', type: 'string' },
  { key: 'maintenanceType', header: 'Service Type', type: 'string' },
  { key: 'performedDate', header: 'Date', type: 'date' },
  { key: 'performedBy', header: 'Technician', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'hourMeterReading', header: 'Hours', type: 'number' },
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
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isOverdue = (nextDue: string) => {
  if (!nextDue) return false;
  return new Date(nextDue) < new Date();
};

// Main Component
export const EquipmentMaintenanceLandscapeTool: React.FC<EquipmentMaintenanceLandscapeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: equipment,
    addItem: addEquipmentToBackend,
    updateItem: updateEquipmentBackend,
    deleteItem: deleteEquipmentBackend,
    isSynced: equipmentSynced,
    isSaving: equipmentSaving,
    lastSaved: equipmentLastSaved,
    syncError: equipmentSyncError,
    forceSync: forceEquipmentSync,
  } = useToolData<Equipment>('landscape-equipment', [], EQUIPMENT_COLUMNS);

  const {
    data: maintenanceRecords,
    addItem: addRecordToBackend,
    updateItem: updateRecordBackend,
    deleteItem: deleteRecordBackend,
    isSynced: recordsSynced,
    isSaving: recordsSaving,
    lastSaved: recordsLastSaved,
    syncError: recordsSyncError,
    forceSync: forceRecordsSync,
  } = useToolData<MaintenanceRecord>('landscape-maintenance-records', [], MAINTENANCE_COLUMNS);

  const {
    data: schedules,
    addItem: addScheduleToBackend,
    updateItem: updateScheduleBackend,
    deleteItem: deleteScheduleBackend,
  } = useToolData<MaintenanceSchedule>('landscape-maintenance-schedules', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'equipment' | 'maintenance' | 'schedule' | 'dashboard'>('equipment');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    type: 'mower-zero-turn',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    status: 'operational',
    hourMeter: 0,
    fuelType: 'gasoline',
    location: '',
    assignedTo: '',
    notes: '',
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceRecord>>({
    equipmentId: '',
    maintenanceType: 'oil-change',
    description: '',
    performedDate: new Date().toISOString().split('T')[0],
    performedBy: '',
    hourMeterReading: 0,
    cost: 0,
    partsUsed: [],
    notes: '',
  });

  const [newSchedule, setNewSchedule] = useState<Partial<MaintenanceSchedule>>({
    equipmentId: '',
    maintenanceType: 'oil-change',
    intervalHours: 50,
    intervalDays: 30,
    lastPerformed: '',
    lastHourMeter: 0,
    nextDue: '',
    nextDueHours: 0,
    priority: 'medium',
    estimatedCost: 0,
    notes: '',
  });

  const [newPart, setNewPart] = useState('');

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchesSearch = searchTerm === '' ||
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || eq.type === filterType;
      const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [equipment, searchTerm, filterType, filterStatus]);

  // Dashboard stats
  const stats = useMemo(() => {
    const operational = equipment.filter(e => e.status === 'operational').length;
    const needsService = equipment.filter(e => e.status === 'needs-service').length;
    const inService = equipment.filter(e => e.status === 'in-service').length;
    const totalValue = equipment.reduce((sum, e) => sum + e.currentValue, 0);
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, r) => sum + r.cost, 0);
    const overdueSchedules = schedules.filter(s => isOverdue(s.nextDue)).length;

    return {
      totalEquipment: equipment.length,
      operational,
      needsService,
      inService,
      totalValue,
      totalMaintenanceCost,
      overdueSchedules,
    };
  }, [equipment, maintenanceRecords, schedules]);

  // Get equipment name by ID
  const getEquipmentName = (equipmentId: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq ? eq.name : 'Unknown';
  };

  // Add equipment
  const handleAddEquipment = () => {
    if (!newEquipment.name || !newEquipment.brand) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const eq: Equipment = {
      id: generateId(),
      name: newEquipment.name || '',
      type: newEquipment.type || 'mower-zero-turn',
      brand: newEquipment.brand || '',
      model: newEquipment.model || '',
      serialNumber: newEquipment.serialNumber || '',
      purchaseDate: newEquipment.purchaseDate || '',
      purchasePrice: newEquipment.purchasePrice || 0,
      currentValue: newEquipment.currentValue || newEquipment.purchasePrice || 0,
      status: 'operational',
      hourMeter: newEquipment.hourMeter || 0,
      fuelType: newEquipment.fuelType || 'gasoline',
      location: newEquipment.location || '',
      assignedTo: newEquipment.assignedTo || '',
      notes: newEquipment.notes || '',
      createdAt: new Date().toISOString(),
    };

    addEquipmentToBackend(eq);
    setShowEquipmentForm(false);
    resetEquipmentForm();
  };

  // Add maintenance record
  const handleAddMaintenance = () => {
    if (!newMaintenance.equipmentId || !newMaintenance.maintenanceType) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const record: MaintenanceRecord = {
      id: generateId(),
      equipmentId: newMaintenance.equipmentId || '',
      maintenanceType: newMaintenance.maintenanceType || 'oil-change',
      description: newMaintenance.description || '',
      performedDate: newMaintenance.performedDate || new Date().toISOString().split('T')[0],
      performedBy: newMaintenance.performedBy || '',
      hourMeterReading: newMaintenance.hourMeterReading || 0,
      cost: newMaintenance.cost || 0,
      partsUsed: newMaintenance.partsUsed || [],
      notes: newMaintenance.notes || '',
      createdAt: new Date().toISOString(),
    };

    addRecordToBackend(record);

    // Update equipment hour meter if higher
    const eq = equipment.find(e => e.id === record.equipmentId);
    if (eq && record.hourMeterReading > eq.hourMeter) {
      updateEquipmentBackend(eq.id, { hourMeter: record.hourMeterReading });
    }

    // Update related schedules
    schedules.forEach(s => {
      if (s.equipmentId === record.equipmentId && s.maintenanceType === record.maintenanceType) {
        const nextDueDate = new Date(record.performedDate);
        nextDueDate.setDate(nextDueDate.getDate() + s.intervalDays);
        updateScheduleBackend(s.id, {
          lastPerformed: record.performedDate,
          lastHourMeter: record.hourMeterReading,
          nextDue: nextDueDate.toISOString().split('T')[0],
          nextDueHours: record.hourMeterReading + s.intervalHours,
        });
      }
    });

    setShowMaintenanceForm(false);
    resetMaintenanceForm();
  };

  // Add schedule
  const handleAddSchedule = () => {
    if (!newSchedule.equipmentId || !newSchedule.maintenanceType) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const schedule: MaintenanceSchedule = {
      id: generateId(),
      equipmentId: newSchedule.equipmentId || '',
      maintenanceType: newSchedule.maintenanceType || 'oil-change',
      intervalHours: newSchedule.intervalHours || 50,
      intervalDays: newSchedule.intervalDays || 30,
      lastPerformed: newSchedule.lastPerformed || '',
      lastHourMeter: newSchedule.lastHourMeter || 0,
      nextDue: newSchedule.nextDue || '',
      nextDueHours: newSchedule.nextDueHours || 0,
      priority: newSchedule.priority || 'medium',
      estimatedCost: newSchedule.estimatedCost || 0,
      notes: newSchedule.notes || '',
    };

    addScheduleToBackend(schedule);
    setShowScheduleForm(false);
    resetScheduleForm();
  };

  // Update equipment status
  const updateEquipmentStatus = (id: string, status: EquipmentStatus) => {
    updateEquipmentBackend(id, { status });
  };

  // Delete handlers
  const handleDeleteEquipment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Delete this equipment and all maintenance records?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteEquipmentBackend(id);
      maintenanceRecords.forEach(r => {
        if (r.equipmentId === id) deleteRecordBackend(r.id);
      });
      schedules.forEach(s => {
        if (s.equipmentId === id) deleteScheduleBackend(s.id);
      });
    }
  };

  // Add part to maintenance
  const addPart = () => {
    if (newPart.trim()) {
      setNewMaintenance(prev => ({
        ...prev,
        partsUsed: [...(prev.partsUsed || []), newPart.trim()],
      }));
      setNewPart('');
    }
  };

  // Remove part
  const removePart = (index: number) => {
    setNewMaintenance(prev => ({
      ...prev,
      partsUsed: prev.partsUsed?.filter((_, i) => i !== index) || [],
    }));
  };

  // Reset forms
  const resetEquipmentForm = () => {
    setNewEquipment({
      name: '',
      type: 'mower-zero-turn',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: 0,
      currentValue: 0,
      status: 'operational',
      hourMeter: 0,
      fuelType: 'gasoline',
      location: '',
      assignedTo: '',
      notes: '',
    });
  };

  const resetMaintenanceForm = () => {
    setNewMaintenance({
      equipmentId: selectedEquipment?.id || '',
      maintenanceType: 'oil-change',
      description: '',
      performedDate: new Date().toISOString().split('T')[0],
      performedBy: '',
      hourMeterReading: selectedEquipment?.hourMeter || 0,
      cost: 0,
      partsUsed: [],
      notes: '',
    });
  };

  const resetScheduleForm = () => {
    setNewSchedule({
      equipmentId: '',
      maintenanceType: 'oil-change',
      intervalHours: 50,
      intervalDays: 30,
      lastPerformed: '',
      lastHourMeter: 0,
      nextDue: '',
      nextDueHours: 0,
      priority: 'medium',
      estimatedCost: 0,
      notes: '',
    });
  };

  // Export data
  const maintenanceExportData = maintenanceRecords.map(r => ({
    ...r,
    equipmentName: getEquipmentName(r.equipmentId),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-green-600" />
            {t('tools.equipmentMaintenanceLandscape.landscapeEquipmentMaintenance', 'Landscape Equipment Maintenance')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('tools.equipmentMaintenanceLandscape.trackAndMaintainLandscapingEquipment', 'Track and maintain landscaping equipment')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="equipment-maintenance-landscape" toolName="Equipment Maintenance Landscape" />

          <SyncStatus
            isSynced={equipmentSynced && recordsSynced}
            isSaving={equipmentSaving || recordsSaving}
            lastSaved={equipmentLastSaved || recordsLastSaved}
            error={equipmentSyncError || recordsSyncError}
          />
          <ExportDropdown
            data={activeTab === 'equipment' ? filteredEquipment : maintenanceExportData}
            columns={activeTab === 'equipment' ? EQUIPMENT_COLUMNS : MAINTENANCE_COLUMNS}
            filename={activeTab === 'equipment' ? 'landscape-equipment' : 'maintenance-records'}
            title={activeTab === 'equipment' ? t('tools.equipmentMaintenanceLandscape.landscapeEquipment', 'Landscape Equipment') : t('tools.equipmentMaintenanceLandscape.maintenanceRecords', 'Maintenance Records')}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['equipment', 'maintenance', 'schedule', 'dashboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.operational', 'Operational')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.operational}/{stats.totalEquipment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.needsService', 'Needs Service')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.needsService}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.fleetValue', 'Fleet Value')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.overdueServices', 'Overdue Services')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdueSchedules}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Maintenance */}
          {stats.overdueSchedules > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  {t('tools.equipmentMaintenanceLandscape.overdueMaintenance', 'Overdue Maintenance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schedules.filter(s => isOverdue(s.nextDue)).map(schedule => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{getEquipmentName(schedule.equipmentId)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {MAINTENANCE_TYPES.find(t => t.value === schedule.maintenanceType)?.label} - Due: {formatDate(schedule.nextDue)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewMaintenance(prev => ({
                            ...prev,
                            equipmentId: schedule.equipmentId,
                            maintenanceType: schedule.maintenanceType,
                          }));
                          setShowMaintenanceForm(true);
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {t('tools.equipmentMaintenanceLandscape.logService', 'Log Service')}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {t('tools.equipmentMaintenanceLandscape.recentMaintenance', 'Recent Maintenance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {maintenanceRecords
                  .sort((a, b) => new Date(b.performedDate).getTime() - new Date(a.performedDate).getTime())
                  .slice(0, 5)
                  .map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{getEquipmentName(record.equipmentId)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {MAINTENANCE_TYPES.find(t => t.value === record.maintenanceType)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(record.cost)}</p>
                        <p className="text-sm text-gray-500">{formatDate(record.performedDate)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && !selectedEquipment && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.equipmentMaintenanceLandscape.searchEquipment', 'Search equipment...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.equipmentMaintenanceLandscape.allTypes', 'All Types')}</option>
                {EQUIPMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.equipmentMaintenanceLandscape.allStatus', 'All Status')}</option>
                <option value="operational">{t('tools.equipmentMaintenanceLandscape.operational2', 'Operational')}</option>
                <option value="needs-service">{t('tools.equipmentMaintenanceLandscape.needsService2', 'Needs Service')}</option>
                <option value="in-service">{t('tools.equipmentMaintenanceLandscape.inService', 'In Service')}</option>
                <option value="out-of-service">{t('tools.equipmentMaintenanceLandscape.outOfService', 'Out of Service')}</option>
              </select>
            </div>
            <button
              onClick={() => setShowEquipmentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.equipmentMaintenanceLandscape.addEquipment2', 'Add Equipment')}
            </button>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.noEquipmentFound', 'No equipment found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredEquipment.map((eq) => (
                <Card key={eq.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEquipment(eq)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {EQUIPMENT_TYPES.find(t => t.value === eq.type)?.icon}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{eq.name}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[eq.status]}`}>
                        {eq.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>{eq.brand} {eq.model}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          {eq.hourMeter} hrs
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(eq.currentValue)}
                        </span>
                      </div>
                      {eq.location && (
                        <p className="text-xs text-gray-500">{eq.location}</p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-gray-500">
                        {maintenanceRecords.filter(r => r.equipmentId === eq.id).length} service records
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEquipment(eq.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Equipment Detail View */}
      {activeTab === 'equipment' && selectedEquipment && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedEquipment(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
            {t('tools.equipmentMaintenanceLandscape.backToEquipment', 'Back to Equipment')}
          </button>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {EQUIPMENT_TYPES.find(t => t.value === selectedEquipment.type)?.icon}
                  <div>
                    <CardTitle>{selectedEquipment.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.brand} {selectedEquipment.model}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[selectedEquipment.status]}`}>
                  {selectedEquipment.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.equipmentMaintenanceLandscape.updateStatus', 'Update Status')}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(STATUS_COLORS).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateEquipmentStatus(selectedEquipment.id, status as EquipmentStatus)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedEquipment.status === status
                          ? STATUS_COLORS[status as EquipmentStatus]
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.serialNumber', 'Serial Number')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedEquipment.serialNumber || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.hourMeter', 'Hour Meter')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedEquipment.hourMeter} hrs</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.fuelType', 'Fuel Type')}</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedEquipment.fuelType}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.equipmentMaintenanceLandscape.currentValue', 'Current Value')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEquipment.currentValue)}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewMaintenance(prev => ({
                      ...prev,
                      equipmentId: selectedEquipment.id,
                      hourMeterReading: selectedEquipment.hourMeter,
                    }));
                    setShowMaintenanceForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Wrench className="w-4 h-4" />
                  {t('tools.equipmentMaintenanceLandscape.logMaintenance2', 'Log Maintenance')}
                </button>
                <button
                  onClick={() => {
                    setNewSchedule(prev => ({
                      ...prev,
                      equipmentId: selectedEquipment.id,
                    }));
                    setShowScheduleForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="w-4 h-4" />
                  {t('tools.equipmentMaintenanceLandscape.addSchedule', 'Add Schedule')}
                </button>
              </div>

              {/* Maintenance History */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t('tools.equipmentMaintenanceLandscape.maintenanceHistory', 'Maintenance History')}</h4>
                <div className="space-y-2">
                  {maintenanceRecords
                    .filter(r => r.equipmentId === selectedEquipment.id)
                    .sort((a, b) => new Date(b.performedDate).getTime() - new Date(a.performedDate).getTime())
                    .map(record => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {MAINTENANCE_TYPES.find(t => t.value === record.maintenanceType)?.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.description || 'No description'} - {record.performedBy}
                          </p>
                          {record.partsUsed.length > 0 && (
                            <p className="text-xs text-gray-500">Parts: {record.partsUsed.join(', ')}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(record.cost)}</p>
                          <p className="text-sm text-gray-500">{formatDate(record.performedDate)}</p>
                          <p className="text-xs text-gray-400">{record.hourMeterReading} hrs</p>
                        </div>
                      </div>
                    ))}
                  {maintenanceRecords.filter(r => r.equipmentId === selectedEquipment.id).length === 0 && (
                    <p className="text-center text-gray-500 py-4">{t('tools.equipmentMaintenanceLandscape.noMaintenanceRecordsYet', 'No maintenance records yet')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.equipmentMaintenanceLandscape.searchRecords', 'Search records...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowMaintenanceForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.equipmentMaintenanceLandscape.logMaintenance3', 'Log Maintenance')}
            </button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.equipment', 'Equipment')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.service', 'Service')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.date', 'Date')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.technician', 'Technician')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.hours', 'Hours')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.cost', 'Cost')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.equipmentMaintenanceLandscape.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {maintenanceRecords
                      .filter(r => searchTerm === '' || getEquipmentName(r.equipmentId).toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort((a, b) => new Date(b.performedDate).getTime() - new Date(a.performedDate).getTime())
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getEquipmentName(record.equipmentId)}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {MAINTENANCE_TYPES.find(t => t.value === record.maintenanceType)?.label}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(record.performedDate)}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{record.performedBy || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{record.hourMeterReading}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(record.cost)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deleteRecordBackend(record.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.equipmentMaintenanceLandscape.maintenanceSchedules', 'Maintenance Schedules')}</h3>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.equipmentMaintenanceLandscape.addSchedule2', 'Add Schedule')}
            </button>
          </div>

          <div className="space-y-3">
            {schedules
              .sort((a, b) => {
                const aOverdue = isOverdue(a.nextDue);
                const bOverdue = isOverdue(b.nextDue);
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
              })
              .map((schedule) => (
                <Card key={schedule.id} className={isOverdue(schedule.nextDue) ? 'border-red-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{getEquipmentName(schedule.equipmentId)}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[schedule.priority]}`}>
                            {schedule.priority}
                          </span>
                          {isOverdue(schedule.nextDue) && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              {t('tools.equipmentMaintenanceLandscape.overdue', 'OVERDUE')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {MAINTENANCE_TYPES.find(t => t.value === schedule.maintenanceType)?.label}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>Every {schedule.intervalHours} hrs / {schedule.intervalDays} days</span>
                          <span>Est. Cost: {formatCurrency(schedule.estimatedCost)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">Next Due: {formatDate(schedule.nextDue)}</p>
                          <p className="text-sm text-gray-500">or {schedule.nextDueHours} hrs</p>
                          {schedule.lastPerformed && (
                            <p className="text-xs text-gray-400">Last: {formatDate(schedule.lastPerformed)}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteScheduleBackend(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.equipmentMaintenanceLandscape.addEquipment', 'Add Equipment')}</CardTitle>
              <button onClick={() => setShowEquipmentForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.equipmentName', 'Equipment Name *')}</label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.equipmentMaintenanceLandscape.eGMower1', 'e.g., Mower #1')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.type', 'Type')}</label>
                  <select
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value as EquipmentType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {EQUIPMENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.brand', 'Brand *')}</label>
                  <input
                    type="text"
                    value={newEquipment.brand}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.equipmentMaintenanceLandscape.eGJohnDeere', 'e.g., John Deere')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.model', 'Model')}</label>
                  <input
                    type="text"
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.serialNumber2', 'Serial Number')}</label>
                  <input
                    type="text"
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.hourMeter2', 'Hour Meter')}</label>
                  <input
                    type="number"
                    value={newEquipment.hourMeter}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, hourMeter: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.purchaseDate', 'Purchase Date')}</label>
                  <input
                    type="date"
                    value={newEquipment.purchaseDate}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.purchasePrice', 'Purchase Price ($)')}</label>
                  <input
                    type="number"
                    value={newEquipment.purchasePrice}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, purchasePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.fuelType2', 'Fuel Type')}</label>
                  <select
                    value={newEquipment.fuelType}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, fuelType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="gasoline">{t('tools.equipmentMaintenanceLandscape.gasoline', 'Gasoline')}</option>
                    <option value="diesel">{t('tools.equipmentMaintenanceLandscape.diesel', 'Diesel')}</option>
                    <option value="electric">{t('tools.equipmentMaintenanceLandscape.electric', 'Electric')}</option>
                    <option value="battery">{t('tools.equipmentMaintenanceLandscape.battery', 'Battery')}</option>
                    <option value="propane">{t('tools.equipmentMaintenanceLandscape.propane', 'Propane')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.location', 'Location')}</label>
                  <input
                    type="text"
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.equipmentMaintenanceLandscape.eGShopTrailer1', 'e.g., Shop, Trailer 1')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.assignedTo', 'Assigned To')}</label>
                  <input
                    type="text"
                    value={newEquipment.assignedTo}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.notes', 'Notes')}</label>
                <textarea
                  value={newEquipment.notes}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEquipmentForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.equipmentMaintenanceLandscape.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddEquipment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.equipmentMaintenanceLandscape.addEquipment3', 'Add Equipment')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.equipmentMaintenanceLandscape.logMaintenance', 'Log Maintenance')}</CardTitle>
              <button onClick={() => setShowMaintenanceForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.equipment2', 'Equipment *')}</label>
                <select
                  value={newMaintenance.equipmentId}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, equipmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.equipmentMaintenanceLandscape.selectEquipment', 'Select equipment')}</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.brand} {eq.model})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.serviceType', 'Service Type *')}</label>
                  <select
                    value={newMaintenance.maintenanceType}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, maintenanceType: e.target.value as MaintenanceType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {MAINTENANCE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.date2', 'Date')}</label>
                  <input
                    type="date"
                    value={newMaintenance.performedDate}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, performedDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.technician2', 'Technician')}</label>
                  <input
                    type="text"
                    value={newMaintenance.performedBy}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, performedBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.hourMeterReading', 'Hour Meter Reading')}</label>
                  <input
                    type="number"
                    value={newMaintenance.hourMeterReading}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, hourMeterReading: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.cost2', 'Cost ($)')}</label>
                <input
                  type="number"
                  value={newMaintenance.cost}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.partsUsed', 'Parts Used')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPart}
                    onChange={(e) => setNewPart(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPart())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.equipmentMaintenanceLandscape.addPart', 'Add part...')}
                  />
                  <button
                    onClick={addPart}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newMaintenance.partsUsed?.map((part, index) => (
                    <span key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {part}
                      <button onClick={() => removePart(index)} className="text-red-500 hover:text-red-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.descriptionNotes', 'Description/Notes')}</label>
                <textarea
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.equipmentMaintenanceLandscape.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddMaintenance}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.equipmentMaintenanceLandscape.logMaintenance4', 'Log Maintenance')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.equipmentMaintenanceLandscape.addMaintenanceSchedule', 'Add Maintenance Schedule')}</CardTitle>
              <button onClick={() => setShowScheduleForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.equipment3', 'Equipment *')}</label>
                <select
                  value={newSchedule.equipmentId}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, equipmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.equipmentMaintenanceLandscape.selectEquipment2', 'Select equipment')}</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.serviceType2', 'Service Type *')}</label>
                  <select
                    value={newSchedule.maintenanceType}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, maintenanceType: e.target.value as MaintenanceType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {MAINTENANCE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.priority', 'Priority')}</label>
                  <select
                    value={newSchedule.priority}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, priority: e.target.value as MaintenancePriority }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">{t('tools.equipmentMaintenanceLandscape.low', 'Low')}</option>
                    <option value="medium">{t('tools.equipmentMaintenanceLandscape.medium', 'Medium')}</option>
                    <option value="high">{t('tools.equipmentMaintenanceLandscape.high', 'High')}</option>
                    <option value="critical">{t('tools.equipmentMaintenanceLandscape.critical', 'Critical')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.intervalHours', 'Interval (Hours)')}</label>
                  <input
                    type="number"
                    value={newSchedule.intervalHours}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, intervalHours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.intervalDays', 'Interval (Days)')}</label>
                  <input
                    type="number"
                    value={newSchedule.intervalDays}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, intervalDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.nextDueDate', 'Next Due Date')}</label>
                  <input
                    type="date"
                    value={newSchedule.nextDue}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, nextDue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.estimatedCost', 'Estimated Cost ($)')}</label>
                  <input
                    type="number"
                    value={newSchedule.estimatedCost}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.equipmentMaintenanceLandscape.notes2', 'Notes')}</label>
                <textarea
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.equipmentMaintenanceLandscape.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleAddSchedule}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.equipmentMaintenanceLandscape.addSchedule3', 'Add Schedule')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {validationMessage}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default EquipmentMaintenanceLandscapeTool;
