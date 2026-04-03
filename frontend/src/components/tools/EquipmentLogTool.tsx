'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  Plus,
  Trash2,
  Save,
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Fuel,
  Gauge,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Edit2,
  X,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface EquipmentLogToolProps {
  uiConfig?: UIConfig;
}

// Types
type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'out_of_service';

interface UsageLog {
  id: string;
  date: string;
  operator: string;
  projectName: string;
  hoursUsed: number;
  mileage: number;
  fuelAdded: number;
  preInspectionDone: boolean;
  issues: string;
  notes: string;
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'preventive' | 'repair' | 'inspection';
  description: string;
  performedBy: string;
  cost: number;
  nextDue: string;
  notes: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  make: string;
  model: string;
  year: number;
  serialNumber: string;
  assetTag: string;
  status: EquipmentStatus;
  currentLocation: string;
  assignedTo: string;
  purchaseDate: string;
  purchasePrice: number;
  currentMileage: number;
  currentHours: number;
  lastServiceDate: string;
  nextServiceDue: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  usageLogs: UsageLog[];
  maintenanceRecords: MaintenanceRecord[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const EQUIPMENT_TYPES = [
  'Excavator',
  'Backhoe',
  'Bulldozer',
  'Crane',
  'Forklift',
  'Loader',
  'Skid Steer',
  'Dump Truck',
  'Concrete Mixer',
  'Compactor',
  'Generator',
  'Compressor',
  'Scissor Lift',
  'Boom Lift',
  'Telehandler',
  'Trencher',
  'Paver',
  'Other',
];

const STATUS_CONFIG: Record<EquipmentStatus, { color: string; label: string }> = {
  operational: { color: 'bg-green-100 text-green-800', label: 'Operational' },
  maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'In Maintenance' },
  repair: { color: 'bg-orange-100 text-orange-800', label: 'Under Repair' },
  out_of_service: { color: 'bg-red-100 text-red-800', label: 'Out of Service' },
};

// Column configuration
const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'assetTag', header: 'Asset Tag', type: 'string' },
  { key: 'currentHours', header: 'Hours', type: 'number' },
  { key: 'currentLocation', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const EquipmentLogTool: React.FC<EquipmentLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: equipment,
    addItem: addEquipment,
    updateItem: updateEquipment,
    deleteItem: deleteEquipment,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<Equipment>('equipment-log', [], EQUIPMENT_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'usage' | 'maintenance'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // New Equipment State
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    type: 'Excavator',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    serialNumber: '',
    assetTag: '',
    status: 'operational',
    currentLocation: '',
    assignedTo: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentMileage: 0,
    currentHours: 0,
    lastServiceDate: '',
    nextServiceDue: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    usageLogs: [],
    maintenanceRecords: [],
    notes: '',
  });

  // New Usage Log State
  const [newUsageLog, setNewUsageLog] = useState<Partial<UsageLog>>({
    date: new Date().toISOString().split('T')[0],
    operator: '',
    projectName: '',
    hoursUsed: 0,
    mileage: 0,
    fuelAdded: 0,
    preInspectionDone: true,
    issues: '',
    notes: '',
  });

  // New Maintenance Record State
  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    type: 'preventive',
    description: '',
    performedBy: '',
    cost: 0,
    nextDue: '',
    notes: '',
  });

  // Save equipment
  const handleSave = () => {
    const equip: Equipment = {
      id: generateId(),
      name: newEquipment.name || '',
      type: newEquipment.type || 'Excavator',
      make: newEquipment.make || '',
      model: newEquipment.model || '',
      year: newEquipment.year || new Date().getFullYear(),
      serialNumber: newEquipment.serialNumber || '',
      assetTag: newEquipment.assetTag || '',
      status: newEquipment.status || 'operational',
      currentLocation: newEquipment.currentLocation || '',
      assignedTo: newEquipment.assignedTo || '',
      purchaseDate: newEquipment.purchaseDate || '',
      purchasePrice: newEquipment.purchasePrice || 0,
      currentMileage: newEquipment.currentMileage || 0,
      currentHours: newEquipment.currentHours || 0,
      lastServiceDate: newEquipment.lastServiceDate || '',
      nextServiceDue: newEquipment.nextServiceDue || '',
      insuranceExpiry: newEquipment.insuranceExpiry || '',
      registrationExpiry: newEquipment.registrationExpiry || '',
      usageLogs: [],
      maintenanceRecords: [],
      notes: newEquipment.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addEquipment(equip);
    setNewEquipment({
      name: '',
      type: 'Excavator',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      status: 'operational',
    });
    setActiveTab('list');
  };

  // Update equipment
  const handleUpdate = () => {
    if (!selectedEquipment) return;
    updateEquipment(selectedEquipment.id, {
      ...selectedEquipment,
      updatedAt: new Date().toISOString(),
    });
    setSelectedEquipment(null);
    setActiveTab('list');
  };

  // Add usage log
  const handleAddUsageLog = () => {
    if (!selectedEquipment) return;
    const log: UsageLog = {
      id: generateId(),
      date: newUsageLog.date || new Date().toISOString().split('T')[0],
      operator: newUsageLog.operator || '',
      projectName: newUsageLog.projectName || '',
      hoursUsed: newUsageLog.hoursUsed || 0,
      mileage: newUsageLog.mileage || 0,
      fuelAdded: newUsageLog.fuelAdded || 0,
      preInspectionDone: newUsageLog.preInspectionDone ?? true,
      issues: newUsageLog.issues || '',
      notes: newUsageLog.notes || '',
    };
    const updatedLogs = [...selectedEquipment.usageLogs, log];
    const newHours = selectedEquipment.currentHours + (newUsageLog.hoursUsed || 0);
    const newMileage = selectedEquipment.currentMileage + (newUsageLog.mileage || 0);
    updateEquipment(selectedEquipment.id, {
      usageLogs: updatedLogs,
      currentHours: newHours,
      currentMileage: newMileage,
      updatedAt: new Date().toISOString(),
    });
    setSelectedEquipment({ ...selectedEquipment, usageLogs: updatedLogs, currentHours: newHours, currentMileage: newMileage });
    setNewUsageLog({
      date: new Date().toISOString().split('T')[0],
      operator: '',
      projectName: '',
      hoursUsed: 0,
      mileage: 0,
      fuelAdded: 0,
      preInspectionDone: true,
    });
  };

  // Add maintenance record
  const handleAddMaintenance = () => {
    if (!selectedEquipment) return;
    const record: MaintenanceRecord = {
      id: generateId(),
      date: newMaintenance.date || new Date().toISOString().split('T')[0],
      type: newMaintenance.type || 'preventive',
      description: newMaintenance.description || '',
      performedBy: newMaintenance.performedBy || '',
      cost: newMaintenance.cost || 0,
      nextDue: newMaintenance.nextDue || '',
      notes: newMaintenance.notes || '',
    };
    const updatedRecords = [...selectedEquipment.maintenanceRecords, record];
    updateEquipment(selectedEquipment.id, {
      maintenanceRecords: updatedRecords,
      lastServiceDate: newMaintenance.date,
      nextServiceDue: newMaintenance.nextDue,
      updatedAt: new Date().toISOString(),
    });
    setSelectedEquipment({ ...selectedEquipment, maintenanceRecords: updatedRecords, lastServiceDate: newMaintenance.date || '', nextServiceDue: newMaintenance.nextDue || '' });
    setNewMaintenance({
      date: new Date().toISOString().split('T')[0],
      type: 'preventive',
      description: '',
      performedBy: '',
      cost: 0,
    });
  };

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(equip => {
      const matchesSearch =
        equip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equip.assetTag.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || equip.status === filterStatus;
      const matchesType = filterType === 'all' || equip.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [equipment, searchTerm, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = equipment.reduce((sum, e) => sum + e.purchasePrice, 0);
    const totalHours = equipment.reduce((sum, e) => sum + e.currentHours, 0);
    const maintenanceCost = equipment.reduce((sum, e) =>
      sum + e.maintenanceRecords.reduce((s, m) => s + m.cost, 0), 0);
    const needsService = equipment.filter(e => {
      if (!e.nextServiceDue) return false;
      return new Date(e.nextServiceDue) <= new Date();
    }).length;
    return { totalEquipment: equipment.length, totalValue, totalHours, maintenanceCost, needsService };
  }, [equipment]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv': exportCSV({ filename: 'equipment-log' }); break;
      case 'excel': exportExcel({ filename: 'equipment-log' }); break;
      case 'json': exportJSON({ filename: 'equipment-log' }); break;
      case 'pdf': await exportPDF({ filename: 'equipment-log', title: 'Equipment Log' }); break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Truck className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.equipmentLog.equipmentLog', 'Equipment Log')}</h1>
            <p className="text-gray-500">{t('tools.equipmentLog.trackConstructionEquipmentUsageAnd', 'Track construction equipment usage and maintenance')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="equipment-log" toolName="Equipment Log" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onSync={forceSync} />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.equipmentLog.totalEquipment', 'Total Equipment')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalEquipment}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gauge className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.equipmentLog.totalHours', 'Total Hours')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalHours.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.equipmentLog.assetValue', 'Asset Value')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.equipmentLog.maintenanceCost', 'Maintenance Cost')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.maintenanceCost)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.equipmentLog.needsService', 'Needs Service')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.needsService}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'list' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('tools.equipmentLog.allEquipment', 'All Equipment')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'create' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('tools.equipmentLog.addEquipment', 'Add Equipment')}
        </button>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.equipmentLog.searchEquipment', 'Search equipment...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.equipmentLog.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.equipmentLog.allTypes', 'All Types')}</option>
              {EQUIPMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredEquipment.map(equip => (
              <div key={equip.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === equip.id ? null : equip.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Truck className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{equip.name}</h3>
                        <p className="text-sm text-gray-500">{equip.make} {equip.model} ({equip.year}) - {equip.assetTag}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{equip.currentHours.toLocaleString()} hrs</p>
                        <p className="text-sm text-gray-500">{equip.currentLocation || 'No location'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[equip.status].color}`}>
                        {STATUS_CONFIG[equip.status].label}
                      </span>
                      {expandedId === equip.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {expandedId === equip.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.equipmentLog.serialNumber', 'Serial Number')}</p>
                        <p className="font-medium">{equip.serialNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.equipmentLog.assignedTo', 'Assigned To')}</p>
                        <p className="font-medium">{equip.assignedTo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.equipmentLog.lastService', 'Last Service')}</p>
                        <p className="font-medium">{formatDate(equip.lastServiceDate) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.equipmentLog.nextServiceDue', 'Next Service Due')}</p>
                        <p className="font-medium">{formatDate(equip.nextServiceDue) || '-'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedEquipment(equip); setActiveTab('usage'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <Clock className="w-4 h-4" />
                        {t('tools.equipmentLog.logUsage', 'Log Usage')}
                      </button>
                      <button
                        onClick={() => { setSelectedEquipment(equip); setActiveTab('maintenance'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
                      >
                        <Wrench className="w-4 h-4" />
                        {t('tools.equipmentLog.maintenance', 'Maintenance')}
                      </button>
                      <button
                        onClick={() => { setSelectedEquipment(equip); setActiveTab('edit'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.equipmentLog.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => deleteEquipment(equip.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredEquipment.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.equipmentLog.noEquipmentFound', 'No equipment found')}</h3>
                <button onClick={() => setActiveTab('create')} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {t('tools.equipmentLog.addEquipment2', 'Add Equipment')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Equipment */}
      {(activeTab === 'create' || activeTab === 'edit') && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{activeTab === 'create' ? t('tools.equipmentLog.addEquipment3', 'Add Equipment') : t('tools.equipmentLog.editEquipment', 'Edit Equipment')}</h2>
            <button onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.equipmentName', 'Equipment Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? selectedEquipment?.name : newEquipment.name}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, name: e.target.value }) : setNewEquipment({ ...newEquipment, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.type', 'Type')}</label>
              <select
                value={activeTab === 'edit' ? selectedEquipment?.type : newEquipment.type}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, type: e.target.value }) : setNewEquipment({ ...newEquipment, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {EQUIPMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.status', 'Status')}</label>
              <select
                value={activeTab === 'edit' ? selectedEquipment?.status : newEquipment.status}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, status: e.target.value as EquipmentStatus }) : setNewEquipment({ ...newEquipment, status: e.target.value as EquipmentStatus })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.make', 'Make')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? selectedEquipment?.make : newEquipment.make}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, make: e.target.value }) : setNewEquipment({ ...newEquipment, make: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.model', 'Model')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? selectedEquipment?.model : newEquipment.model}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, model: e.target.value }) : setNewEquipment({ ...newEquipment, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.year', 'Year')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? selectedEquipment?.year : newEquipment.year}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, year: parseInt(e.target.value) }) : setNewEquipment({ ...newEquipment, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.assetTag', 'Asset Tag')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? selectedEquipment?.assetTag : newEquipment.assetTag}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, assetTag: e.target.value }) : setNewEquipment({ ...newEquipment, assetTag: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.currentLocation', 'Current Location')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? selectedEquipment?.currentLocation : newEquipment.currentLocation}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, currentLocation: e.target.value }) : setNewEquipment({ ...newEquipment, currentLocation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.currentHours', 'Current Hours')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? selectedEquipment?.currentHours : newEquipment.currentHours}
                onChange={e => activeTab === 'edit' ? setSelectedEquipment({ ...selectedEquipment!, currentHours: parseFloat(e.target.value) }) : setNewEquipment({ ...newEquipment, currentHours: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.equipmentLog.cancel', 'Cancel')}</button>
            <button onClick={activeTab === 'edit' ? handleUpdate : handleSave} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Save className="w-4 h-4" />
              {activeTab === 'edit' ? t('tools.equipmentLog.update', 'Update') : t('tools.equipmentLog.save', 'Save')} Equipment
            </button>
          </div>
        </div>
      )}

      {/* Usage Log */}
      {activeTab === 'usage' && selectedEquipment && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Log Usage - {selectedEquipment.name}</h2>
            <button onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.date', 'Date')}</label>
              <input type="date" value={newUsageLog.date} onChange={e => setNewUsageLog({ ...newUsageLog, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.operator', 'Operator')}</label>
              <input type="text" value={newUsageLog.operator} onChange={e => setNewUsageLog({ ...newUsageLog, operator: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.project', 'Project')}</label>
              <input type="text" value={newUsageLog.projectName} onChange={e => setNewUsageLog({ ...newUsageLog, projectName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.hoursUsed', 'Hours Used')}</label>
              <input type="number" value={newUsageLog.hoursUsed} onChange={e => setNewUsageLog({ ...newUsageLog, hoursUsed: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.fuelAddedGal', 'Fuel Added (gal)')}</label>
              <input type="number" value={newUsageLog.fuelAdded} onChange={e => setNewUsageLog({ ...newUsageLog, fuelAdded: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="preInspection" checked={newUsageLog.preInspectionDone} onChange={e => setNewUsageLog({ ...newUsageLog, preInspectionDone: e.target.checked })} className="w-4 h-4 text-teal-600 rounded" />
              <label htmlFor="preInspection" className="text-sm font-medium text-gray-700">{t('tools.equipmentLog.preInspectionCompleted', 'Pre-inspection completed')}</label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.equipmentLog.cancel2', 'Cancel')}</button>
            <button onClick={handleAddUsageLog} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Plus className="w-4 h-4" />
              {t('tools.equipmentLog.logUsage2', 'Log Usage')}
            </button>
          </div>

          {/* Recent Usage Logs */}
          {selectedEquipment.usageLogs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('tools.equipmentLog.recentUsage', 'Recent Usage')}</h3>
              <div className="space-y-2">
                {selectedEquipment.usageLogs.slice(-5).reverse().map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatDate(log.date)} - {log.operator}</p>
                      <p className="text-sm text-gray-500">{log.projectName}</p>
                    </div>
                    <p className="font-medium">{log.hoursUsed} hrs</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance */}
      {activeTab === 'maintenance' && selectedEquipment && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Maintenance - {selectedEquipment.name}</h2>
            <button onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.date2', 'Date')}</label>
              <input type="date" value={newMaintenance.date} onChange={e => setNewMaintenance({ ...newMaintenance, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.type2', 'Type')}</label>
              <select value={newMaintenance.type} onChange={e => setNewMaintenance({ ...newMaintenance, type: e.target.value as any })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="preventive">{t('tools.equipmentLog.preventive', 'Preventive')}</option>
                <option value="repair">{t('tools.equipmentLog.repair', 'Repair')}</option>
                <option value="inspection">{t('tools.equipmentLog.inspection', 'Inspection')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.performedBy', 'Performed By')}</label>
              <input type="text" value={newMaintenance.performedBy} onChange={e => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.description', 'Description')}</label>
              <input type="text" value={newMaintenance.description} onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.cost', 'Cost')}</label>
              <input type="number" value={newMaintenance.cost} onChange={e => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.equipmentLog.nextDue', 'Next Due')}</label>
              <input type="date" value={newMaintenance.nextDue} onChange={e => setNewMaintenance({ ...newMaintenance, nextDue: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => { setActiveTab('list'); setSelectedEquipment(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.equipmentLog.cancel3', 'Cancel')}</button>
            <button onClick={handleAddMaintenance} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Plus className="w-4 h-4" />
              {t('tools.equipmentLog.addRecord', 'Add Record')}
            </button>
          </div>

          {/* Maintenance History */}
          {selectedEquipment.maintenanceRecords.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('tools.equipmentLog.maintenanceHistory', 'Maintenance History')}</h3>
              <div className="space-y-2">
                {selectedEquipment.maintenanceRecords.slice(-5).reverse().map(record => (
                  <div key={record.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatDate(record.date)} - {record.type}</p>
                      <p className="text-sm text-gray-500">{record.description}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(record.cost)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentLogTool;
