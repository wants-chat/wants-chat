'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Activity,
  Settings,
  Wrench,
  Clock,
  Building,
  User,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Package,
  Hash,
  Award,
  Clipboard,
  BarChart3,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'preventive' | 'corrective' | 'inspection';
  technician: string;
  findings: string;
  actions: string;
  partsReplaced: string[];
  cost: number;
  nextDue: string;
}

interface CalibrationRecord {
  id: string;
  date: string;
  performedBy: string;
  results: string;
  passed: boolean;
  certificate: string;
  nextDue: string;
}

interface ImplantRecord {
  id: string;
  deviceId: string;
  patientId: string;
  patientName: string;
  implantDate: string;
  surgeon: string;
  lotNumber: string;
  udiNumber: string;
  bodyLocation: string;
  status: 'active' | 'removed' | 'replaced';
  removalDate?: string;
  notes: string;
}

interface MedicalDevice {
  id: string;
  deviceName: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  category: 'diagnostic' | 'therapeutic' | 'monitoring' | 'implant' | 'surgical' | 'life-support';
  location: string;
  department: string;
  purchaseDate: string;
  warrantyExpiration: string;
  lastMaintenance: string;
  nextMaintenance: string;
  status: 'in-service' | 'maintenance' | 'repair' | 'retired' | 'recalled';
  maintenanceHistory: MaintenanceRecord[];
  calibrations: CalibrationRecord[];
  implants: ImplantRecord[];
  udiNumber: string;
  riskClass: 'I' | 'II' | 'III';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalDeviceTrackerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'medical-device-tracker';

const deviceColumns: ColumnConfig[] = [
  { key: 'deviceName', header: 'Device Name', type: 'string' },
  { key: 'manufacturer', header: 'Manufacturer', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'nextMaintenance', header: 'Next Maintenance', type: 'date' },
];

const createNewDevice = (): MedicalDevice => ({
  id: crypto.randomUUID(),
  deviceName: '',
  manufacturer: '',
  modelNumber: '',
  serialNumber: '',
  category: 'diagnostic',
  location: '',
  department: '',
  purchaseDate: '',
  warrantyExpiration: '',
  lastMaintenance: '',
  nextMaintenance: '',
  status: 'in-service',
  maintenanceHistory: [],
  calibrations: [],
  implants: [],
  udiNumber: '',
  riskClass: 'I',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const deviceCategories = [
  { value: 'diagnostic', label: 'Diagnostic', icon: Activity },
  { value: 'therapeutic', label: 'Therapeutic', icon: Shield },
  { value: 'monitoring', label: 'Monitoring', icon: BarChart3 },
  { value: 'implant', label: 'Implant', icon: Package },
  { value: 'surgical', label: 'Surgical', icon: Wrench },
  { value: 'life-support', label: 'Life Support', icon: AlertCircle },
];

const deviceStatuses = [
  { value: 'in-service', label: 'In Service', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
  { value: 'repair', label: 'Repair', color: 'orange' },
  { value: 'retired', label: 'Retired', color: 'gray' },
  { value: 'recalled', label: 'Recalled', color: 'red' },
];

const commonDepartments = [
  'Radiology', 'Surgery', 'ICU', 'Emergency', 'Cardiology',
  'Orthopedics', 'Neurology', 'Oncology', 'Pediatrics', 'General Medicine',
  'Laboratory', 'Pharmacy', 'Physical Therapy', 'Respiratory',
];

export const MedicalDeviceTrackerTool: React.FC<MedicalDeviceTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: devices,
    addItem: addDevice,
    updateItem: updateDevice,
    deleteItem: deleteDevice,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MedicalDevice>(TOOL_ID, [], deviceColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showImplantModal, setShowImplantModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice | null>(null);
  const [editingDevice, setEditingDevice] = useState<MedicalDevice | null>(null);
  const [formData, setFormData] = useState<MedicalDevice>(createNewDevice());
  const [activeTab, setActiveTab] = useState<'details' | 'maintenance' | 'calibration' | 'implants'>('details');

  const [newMaintenance, setNewMaintenance] = useState<Omit<MaintenanceRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'preventive',
    technician: '',
    findings: '',
    actions: '',
    partsReplaced: [],
    cost: 0,
    nextDue: '',
  });
  const [newPart, setNewPart] = useState('');

  const [newCalibration, setNewCalibration] = useState<Omit<CalibrationRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    performedBy: '',
    results: '',
    passed: true,
    certificate: '',
    nextDue: '',
  });

  const [newImplant, setNewImplant] = useState<Omit<ImplantRecord, 'id' | 'deviceId'>>({
    patientId: '',
    patientName: '',
    implantDate: new Date().toISOString().split('T')[0],
    surgeon: '',
    lotNumber: '',
    udiNumber: '',
    bodyLocation: '',
    status: 'active',
    notes: '',
  });

  // Statistics
  const stats = useMemo(() => {
    const inService = devices.filter(d => d.status === 'in-service');
    const maintenance = devices.filter(d => d.status === 'maintenance');
    const repair = devices.filter(d => d.status === 'repair');
    const recalled = devices.filter(d => d.status === 'recalled');

    // Maintenance due in 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const maintenanceDue = devices.filter(d => {
      if (!d.nextMaintenance) return false;
      const nextMaint = new Date(d.nextMaintenance);
      return nextMaint <= thirtyDaysFromNow && d.status === 'in-service';
    });

    // Warranty expiring in 60 days
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const warrantyExpiring = devices.filter(d => {
      if (!d.warrantyExpiration) return false;
      const warranty = new Date(d.warrantyExpiration);
      return warranty <= sixtyDaysFromNow && warranty >= now;
    });

    // Total implants
    const totalImplants = devices.reduce((sum, d) => sum + (d.implants?.length || 0), 0);
    const activeImplants = devices.reduce((sum, d) =>
      sum + (d.implants?.filter(i => i.status === 'active').length || 0), 0);

    return {
      total: devices.length,
      inService: inService.length,
      maintenance: maintenance.length,
      repair: repair.length,
      recalled: recalled.length,
      maintenanceDue: maintenanceDue.length,
      warrantyExpiring: warrantyExpiring.length,
      totalImplants,
      activeImplants,
    };
  }, [devices]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = searchQuery === '' ||
        device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.modelNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === '' || device.category === filterCategory;
      const matchesStatus = filterStatus === '' || device.status === filterStatus;
      const matchesDepartment = filterDepartment === '' || device.department === filterDepartment;
      return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
    });
  }, [devices, searchQuery, filterCategory, filterStatus, filterDepartment]);

  const handleSave = () => {
    if (editingDevice) {
      updateDevice(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addDevice({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingDevice(null);
    setFormData(createNewDevice());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Device',
      message: 'Are you sure you want to delete this device record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteDevice(id);
      if (selectedDevice?.id === id) setSelectedDevice(null);
    }
  };

  const openEditModal = (device: MedicalDevice) => {
    setEditingDevice(device);
    setFormData(device);
    setShowModal(true);
  };

  const addPart = () => {
    if (newPart.trim() && !newMaintenance.partsReplaced.includes(newPart.trim())) {
      setNewMaintenance({ ...newMaintenance, partsReplaced: [...newMaintenance.partsReplaced, newPart.trim()] });
      setNewPart('');
    }
  };

  const removePart = (part: string) => {
    setNewMaintenance({ ...newMaintenance, partsReplaced: newMaintenance.partsReplaced.filter(p => p !== part) });
  };

  const saveMaintenance = () => {
    if (selectedDevice) {
      const maintenance: MaintenanceRecord = { ...newMaintenance, id: crypto.randomUUID() };
      const updated = {
        ...selectedDevice,
        maintenanceHistory: [...(selectedDevice.maintenanceHistory || []), maintenance],
        lastMaintenance: maintenance.date,
        nextMaintenance: maintenance.nextDue,
        updatedAt: new Date().toISOString(),
      };
      updateDevice(selectedDevice.id, updated);
      setSelectedDevice(updated);
      setShowMaintenanceModal(false);
      setNewMaintenance({
        date: new Date().toISOString().split('T')[0],
        type: 'preventive',
        technician: '',
        findings: '',
        actions: '',
        partsReplaced: [],
        cost: 0,
        nextDue: '',
      });
    }
  };

  const saveCalibration = () => {
    if (selectedDevice) {
      const calibration: CalibrationRecord = { ...newCalibration, id: crypto.randomUUID() };
      const updated = {
        ...selectedDevice,
        calibrations: [...(selectedDevice.calibrations || []), calibration],
        updatedAt: new Date().toISOString(),
      };
      updateDevice(selectedDevice.id, updated);
      setSelectedDevice(updated);
      setShowCalibrationModal(false);
      setNewCalibration({
        date: new Date().toISOString().split('T')[0],
        performedBy: '',
        results: '',
        passed: true,
        certificate: '',
        nextDue: '',
      });
    }
  };

  const saveImplant = () => {
    if (selectedDevice) {
      const implant: ImplantRecord = {
        ...newImplant,
        id: crypto.randomUUID(),
        deviceId: selectedDevice.id,
      };
      const updated = {
        ...selectedDevice,
        implants: [...(selectedDevice.implants || []), implant],
        updatedAt: new Date().toISOString(),
      };
      updateDevice(selectedDevice.id, updated);
      setSelectedDevice(updated);
      setShowImplantModal(false);
      setNewImplant({
        patientId: '',
        patientName: '',
        implantDate: new Date().toISOString().split('T')[0],
        surgeon: '',
        lotNumber: '',
        udiNumber: '',
        bodyLocation: '',
        status: 'active',
        notes: '',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-service': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'repair': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'retired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'recalled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = deviceCategories.find(c => c.value === category);
    return categoryConfig?.icon || Cpu;
  };

  const isMaintenanceOverdue = (device: MedicalDevice) => {
    if (!device.nextMaintenance) return false;
    return new Date(device.nextMaintenance) < new Date();
  };

  const isWarrantyExpired = (device: MedicalDevice) => {
    if (!device.warrantyExpiration) return false;
    return new Date(device.warrantyExpiration) < new Date();
  };

  // Get unique departments from devices
  const uniqueDepartments = useMemo(() => {
    const deps = new Set(devices.map(d => d.department).filter(Boolean));
    return Array.from(deps);
  }, [devices]);

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (active: boolean) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    active
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <Cpu className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.medicalDeviceTracker.medicalDeviceTracker', 'Medical Device Tracker')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.medicalDeviceTracker.trackDevicesMaintenanceCalibrationsAnd', 'Track devices, maintenance, calibrations, and implants')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="medical-device-tracker" toolName="Medical Device Tracker" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'medical-device-tracker' })}
            onExportExcel={() => exportExcel({ filename: 'medical-device-tracker' })}
            onExportJSON={() => exportJSON({ filename: 'medical-device-tracker' })}
            onExportPDF={() => exportPDF({ filename: 'medical-device-tracker', title: 'Medical Device Records' })}
            onPrint={() => print('Medical Device Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={devices.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewDevice()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.medicalDeviceTracker.addDevice', 'Add Device')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Cpu className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.totalDevices', 'Total Devices')}</p>
              <p className="text-xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.inService', 'In Service')}</p>
              <p className="text-xl font-bold text-green-500">{stats.inService}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Wrench className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.maintenance', 'Maintenance')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.maintenance}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.maintDue', 'Maint. Due')}</p>
              <p className="text-xl font-bold text-orange-500">{stats.maintenanceDue}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.recalled', 'Recalled')}</p>
              <p className="text-xl font-bold text-red-500">{stats.recalled}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.implants', 'Implants')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.activeImplants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.maintenanceDue > 0 || stats.recalled > 0 || stats.warrantyExpiring > 0) && (
        <div className="mb-6 space-y-2">
          {stats.maintenanceDue > 0 && (
            <div className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'}`}>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className={theme === 'dark' ? 'text-orange-400' : 'text-orange-700'}>
                {stats.maintenanceDue} device(s) require maintenance within the next 30 days
              </span>
            </div>
          )}
          {stats.recalled > 0 && (
            <div className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className={theme === 'dark' ? 'text-red-400' : 'text-red-700'}>
                {stats.recalled} device(s) have been recalled - immediate action required
              </span>
            </div>
          )}
          {stats.warrantyExpiring > 0 && (
            <div className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
              <Shield className="w-5 h-5 text-yellow-500" />
              <span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}>
                {stats.warrantyExpiring} device(s) have warranty expiring within 60 days
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.medicalDeviceTracker.searchDeviceManufacturerSerialModel', 'Search device, manufacturer, serial, model...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`${inputClass} w-full lg:w-40`}>
            <option value="">{t('tools.medicalDeviceTracker.allCategories', 'All Categories')}</option>
            {deviceCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full lg:w-40`}>
            <option value="">{t('tools.medicalDeviceTracker.allStatus', 'All Status')}</option>
            {deviceStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className={`${inputClass} w-full lg:w-44`}>
            <option value="">{t('tools.medicalDeviceTracker.allDepartments', 'All Departments')}</option>
            {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">Device Inventory ({filteredDevices.length})</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.medicalDeviceTracker.noDevicesFound', 'No devices found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredDevices.map(device => {
                  const CategoryIcon = getCategoryIcon(device.category);
                  const overdue = isMaintenanceOverdue(device);
                  return (
                    <div
                      key={device.id}
                      onClick={() => { setSelectedDevice(device); setActiveTab('details'); }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedDevice?.id === device.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <CategoryIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{device.deviceName}</p>
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {device.manufacturer} - {device.modelNumber}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(device.status)}`}>
                                {device.status.replace('-', ' ')}
                              </span>
                              {overdue && (
                                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Overdue
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(device); }} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(device.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedDevice ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold">{selectedDevice.deviceName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedDevice.status)}`}>
                        {selectedDevice.status.replace('-', ' ')}
                      </span>
                      {selectedDevice.status === 'recalled' && (
                        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded">{t('tools.medicalDeviceTracker.recall', 'RECALL')}</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedDevice.manufacturer} - Model: {selectedDevice.modelNumber}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button onClick={() => setActiveTab('details')} className={tabClass(activeTab === 'details')}>
                    <FileText className="w-4 h-4 inline mr-1" /> Details
                  </button>
                  <button onClick={() => setActiveTab('maintenance')} className={tabClass(activeTab === 'maintenance')}>
                    <Wrench className="w-4 h-4 inline mr-1" /> Maintenance ({selectedDevice.maintenanceHistory?.length || 0})
                  </button>
                  <button onClick={() => setActiveTab('calibration')} className={tabClass(activeTab === 'calibration')}>
                    <Settings className="w-4 h-4 inline mr-1" /> Calibration ({selectedDevice.calibrations?.length || 0})
                  </button>
                  {selectedDevice.category === 'implant' && (
                    <button onClick={() => setActiveTab('implants')} className={tabClass(activeTab === 'implants')}>
                      <User className="w-4 h-4 inline mr-1" /> Implants ({selectedDevice.implants?.length || 0})
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Device Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Hash className="w-3 h-3" /> Serial Number
                        </div>
                        <p className="font-medium">{selectedDevice.serialNumber || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Package className="w-3 h-3" /> Category
                        </div>
                        <p className="font-medium capitalize">{selectedDevice.category.replace('-', ' ')}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Shield className="w-3 h-3" /> Risk Class
                        </div>
                        <p className="font-medium">Class {selectedDevice.riskClass}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Building className="w-3 h-3" /> Department
                        </div>
                        <p className="font-medium">{selectedDevice.department || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <MapPin className="w-3 h-3" /> Location
                        </div>
                        <p className="font-medium">{selectedDevice.location || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Clipboard className="w-3 h-3" /> UDI
                        </div>
                        <p className="font-medium text-sm truncate">{selectedDevice.udiNumber || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Calendar className="w-3 h-3" /> Purchase Date
                        </div>
                        <p className="font-medium">{selectedDevice.purchaseDate || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isWarrantyExpired(selectedDevice) ? 'bg-red-500/10 border border-red-500/30' : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Award className="w-3 h-3" /> Warranty Expires
                        </div>
                        <p className={`font-medium ${isWarrantyExpired(selectedDevice) ? 'text-red-400' : ''}`}>
                          {selectedDevice.warrantyExpiration || 'N/A'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Wrench className="w-3 h-3" /> Last Maintenance
                        </div>
                        <p className="font-medium">{selectedDevice.lastMaintenance || 'Never'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isMaintenanceOverdue(selectedDevice) ? 'bg-red-500/10 border border-red-500/30' : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <Clock className="w-3 h-3" /> Next Maintenance
                        </div>
                        <p className={`font-medium ${isMaintenanceOverdue(selectedDevice) ? 'text-red-400' : ''}`}>
                          {selectedDevice.nextMaintenance || 'Not scheduled'}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedDevice.notes && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.medicalDeviceTracker.notes', 'Notes')}</h3>
                        <p className="text-sm">{selectedDevice.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'maintenance' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{t('tools.medicalDeviceTracker.maintenanceHistory', 'Maintenance History')}</h3>
                      <button onClick={() => setShowMaintenanceModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Log Maintenance
                      </button>
                    </div>
                    {(!selectedDevice.maintenanceHistory || selectedDevice.maintenanceHistory.length === 0) ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.noMaintenanceRecords', 'No maintenance records')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...(selectedDevice.maintenanceHistory || [])].reverse().map(record => (
                          <div key={record.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{record.date}</span>
                                <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                                  record.type === 'preventive' ? 'bg-green-500/20 text-green-400' :
                                  record.type === 'corrective' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {record.type}
                                </span>
                              </div>
                              {record.cost > 0 && (
                                <span className="text-sm font-medium">${record.cost.toLocaleString()}</span>
                              )}
                            </div>
                            <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Technician: {record.technician}
                            </p>
                            {record.findings && (
                              <p className="text-sm mb-1"><span className="text-gray-400">{t('tools.medicalDeviceTracker.findings', 'Findings:')}</span> {record.findings}</p>
                            )}
                            {record.actions && (
                              <p className="text-sm mb-1"><span className="text-gray-400">{t('tools.medicalDeviceTracker.actions', 'Actions:')}</span> {record.actions}</p>
                            )}
                            {record.partsReplaced.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {record.partsReplaced.map((part, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">{part}</span>
                                ))}
                              </div>
                            )}
                            {record.nextDue && (
                              <p className="text-sm mt-2 text-gray-400">Next due: {record.nextDue}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'calibration' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{t('tools.medicalDeviceTracker.calibrationRecords', 'Calibration Records')}</h3>
                      <button onClick={() => setShowCalibrationModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Log Calibration
                      </button>
                    </div>
                    {(!selectedDevice.calibrations || selectedDevice.calibrations.length === 0) ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.noCalibrationRecords', 'No calibration records')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...(selectedDevice.calibrations || [])].reverse().map(record => (
                          <div key={record.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{record.date}</span>
                              <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${
                                record.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {record.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {record.passed ? t('tools.medicalDeviceTracker.passed2', 'Passed') : t('tools.medicalDeviceTracker.failed2', 'Failed')}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Performed by: {record.performedBy}
                            </p>
                            {record.results && <p className="text-sm mt-1">Results: {record.results}</p>}
                            {record.certificate && (
                              <p className="text-sm mt-1 text-cyan-400">Certificate: {record.certificate}</p>
                            )}
                            {record.nextDue && (
                              <p className="text-sm mt-2 text-gray-400">Next due: {record.nextDue}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'implants' && selectedDevice.category === 'implant' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{t('tools.medicalDeviceTracker.implantRegistry', 'Implant Registry')}</h3>
                      <button onClick={() => setShowImplantModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Register Implant
                      </button>
                    </div>
                    {(!selectedDevice.implants || selectedDevice.implants.length === 0) ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalDeviceTracker.noImplantRecords', 'No implant records')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...(selectedDevice.implants || [])].reverse().map(record => (
                          <div key={record.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-cyan-500" />
                                <span className="font-medium">{record.patientName}</span>
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                                record.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                record.status === 'removed' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p><span className="text-gray-400">{t('tools.medicalDeviceTracker.patientId', 'Patient ID:')}</span> {record.patientId}</p>
                              <p><span className="text-gray-400">{t('tools.medicalDeviceTracker.implantDate', 'Implant Date:')}</span> {record.implantDate}</p>
                              <p><span className="text-gray-400">{t('tools.medicalDeviceTracker.surgeon', 'Surgeon:')}</span> {record.surgeon}</p>
                              <p><span className="text-gray-400">{t('tools.medicalDeviceTracker.bodyLocation', 'Body Location:')}</span> {record.bodyLocation}</p>
                              <p><span className="text-gray-400">{t('tools.medicalDeviceTracker.lot', 'Lot #:')}</span> {record.lotNumber}</p>
                              <p><span className="text-gray-400">{t('tools.medicalDeviceTracker.udi', 'UDI:')}</span> {record.udiNumber}</p>
                            </div>
                            {record.notes && (
                              <p className="text-sm mt-2 text-gray-400">{record.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Cpu className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.medicalDeviceTracker.selectADevice', 'Select a device')}</p>
              <p className="text-sm">{t('tools.medicalDeviceTracker.chooseADeviceToView', 'Choose a device to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Device Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold">{editingDevice ? t('tools.medicalDeviceTracker.editDevice', 'Edit Device') : t('tools.medicalDeviceTracker.addDevice2', 'Add Device')}</h2>
              <button onClick={() => { setShowModal(false); setEditingDevice(null); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.deviceName', 'Device Name *')}</label>
                  <input type="text" value={formData.deviceName} onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.eGGeVitalSigns', 'e.g., GE Vital Signs Monitor')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.manufacturer', 'Manufacturer *')}</label>
                  <input type="text" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.eGGeHealthcare', 'e.g., GE Healthcare')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.modelNumber', 'Model Number')}</label>
                  <input type="text" value={formData.modelNumber} onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.eGVsm2000', 'e.g., VSM-2000')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.serialNumber', 'Serial Number *')}</label>
                  <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.eGSn12345678', 'e.g., SN12345678')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.category', 'Category')}</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} className={inputClass}>
                    {deviceCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.status', 'Status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                    {deviceStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.riskClass', 'Risk Class')}</label>
                  <select value={formData.riskClass} onChange={(e) => setFormData({ ...formData, riskClass: e.target.value as any })} className={inputClass}>
                    <option value="I">{t('tools.medicalDeviceTracker.classILowRisk', 'Class I (Low Risk)')}</option>
                    <option value="II">{t('tools.medicalDeviceTracker.classIiMediumRisk', 'Class II (Medium Risk)')}</option>
                    <option value="III">{t('tools.medicalDeviceTracker.classIiiHighRisk', 'Class III (High Risk)')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.udiNumber', 'UDI Number')}</label>
                  <input type="text" value={formData.udiNumber} onChange={(e) => setFormData({ ...formData, udiNumber: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.uniqueDeviceIdentifier', 'Unique Device Identifier')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.department', 'Department')}</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass} list="departments" placeholder={t('tools.medicalDeviceTracker.eGRadiology', 'e.g., Radiology')} />
                  <datalist id="departments">
                    {commonDepartments.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.location', 'Location')}</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.eGBuildingARoom', 'e.g., Building A, Room 101')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.purchaseDate', 'Purchase Date')}</label>
                  <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.warrantyExpiration', 'Warranty Expiration')}</label>
                  <input type="date" value={formData.warrantyExpiration} onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.lastMaintenance', 'Last Maintenance')}</label>
                  <input type="date" value={formData.lastMaintenance} onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.nextMaintenance', 'Next Maintenance')}</label>
                  <input type="date" value={formData.nextMaintenance} onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.notes2', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.medicalDeviceTracker.additionalNotesAboutThisDevice', 'Additional notes about this device...')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingDevice(null); }} className={buttonSecondary}>{t('tools.medicalDeviceTracker.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.deviceName || !formData.manufacturer || !formData.serialNumber} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.medicalDeviceTracker.logMaintenance', 'Log Maintenance')}</h2>
              <button onClick={() => setShowMaintenanceModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.date', 'Date *')}</label>
                  <input type="date" value={newMaintenance.date} onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.type', 'Type')}</label>
                  <select value={newMaintenance.type} onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as any })} className={inputClass}>
                    <option value="preventive">{t('tools.medicalDeviceTracker.preventive', 'Preventive')}</option>
                    <option value="corrective">{t('tools.medicalDeviceTracker.corrective', 'Corrective')}</option>
                    <option value="inspection">{t('tools.medicalDeviceTracker.inspection', 'Inspection')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.technician', 'Technician *')}</label>
                <input type="text" value={newMaintenance.technician} onChange={(e) => setNewMaintenance({ ...newMaintenance, technician: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.nameOfTechnician', 'Name of technician')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.findings2', 'Findings')}</label>
                <textarea value={newMaintenance.findings} onChange={(e) => setNewMaintenance({ ...newMaintenance, findings: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.medicalDeviceTracker.whatWasFoundDuringMaintenance', 'What was found during maintenance...')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.actionsTaken', 'Actions Taken')}</label>
                <textarea value={newMaintenance.actions} onChange={(e) => setNewMaintenance({ ...newMaintenance, actions: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.medicalDeviceTracker.whatActionsWerePerformed', 'What actions were performed...')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.partsReplaced', 'Parts Replaced')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newPart} onChange={(e) => setNewPart(e.target.value)} placeholder={t('tools.medicalDeviceTracker.addPart', 'Add part')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPart())} />
                  <button type="button" onClick={addPart} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newMaintenance.partsReplaced.map((p, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {p} <button onClick={() => removePart(p)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.cost', 'Cost ($)')}</label>
                  <input type="number" value={newMaintenance.cost} onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })} className={inputClass} min="0" step="0.01" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.nextDue', 'Next Due')}</label>
                  <input type="date" value={newMaintenance.nextDue} onChange={(e) => setNewMaintenance({ ...newMaintenance, nextDue: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowMaintenanceModal(false)} className={buttonSecondary}>{t('tools.medicalDeviceTracker.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveMaintenance} disabled={!newMaintenance.date || !newMaintenance.technician} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.medicalDeviceTracker.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calibration Modal */}
      {showCalibrationModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.medicalDeviceTracker.logCalibration', 'Log Calibration')}</h2>
              <button onClick={() => setShowCalibrationModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.date2', 'Date *')}</label>
                  <input type="date" value={newCalibration.date} onChange={(e) => setNewCalibration({ ...newCalibration, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.result', 'Result')}</label>
                  <select value={newCalibration.passed ? 'passed' : 'failed'} onChange={(e) => setNewCalibration({ ...newCalibration, passed: e.target.value === 'passed' })} className={inputClass}>
                    <option value="passed">{t('tools.medicalDeviceTracker.passed', 'Passed')}</option>
                    <option value="failed">{t('tools.medicalDeviceTracker.failed', 'Failed')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.performedBy', 'Performed By *')}</label>
                <input type="text" value={newCalibration.performedBy} onChange={(e) => setNewCalibration({ ...newCalibration, performedBy: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.nameOfTechnician2', 'Name of technician')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.resultsNotes', 'Results / Notes')}</label>
                <textarea value={newCalibration.results} onChange={(e) => setNewCalibration({ ...newCalibration, results: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.medicalDeviceTracker.calibrationResultsAndNotes', 'Calibration results and notes...')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.certificateNumber', 'Certificate Number')}</label>
                <input type="text" value={newCalibration.certificate} onChange={(e) => setNewCalibration({ ...newCalibration, certificate: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.calibrationCertificate', 'Calibration certificate #')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.nextDue2', 'Next Due')}</label>
                <input type="date" value={newCalibration.nextDue} onChange={(e) => setNewCalibration({ ...newCalibration, nextDue: e.target.value })} className={inputClass} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowCalibrationModal(false)} className={buttonSecondary}>{t('tools.medicalDeviceTracker.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveCalibration} disabled={!newCalibration.date || !newCalibration.performedBy} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.medicalDeviceTracker.save2', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Implant Modal */}
      {showImplantModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.medicalDeviceTracker.registerImplant', 'Register Implant')}</h2>
              <button onClick={() => setShowImplantModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.patientId2', 'Patient ID *')}</label>
                  <input type="text" value={newImplant.patientId} onChange={(e) => setNewImplant({ ...newImplant, patientId: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.patientId3', 'Patient ID')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.patientName', 'Patient Name *')}</label>
                  <input type="text" value={newImplant.patientName} onChange={(e) => setNewImplant({ ...newImplant, patientName: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.fullName', 'Full name')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.implantDate2', 'Implant Date *')}</label>
                  <input type="date" value={newImplant.implantDate} onChange={(e) => setNewImplant({ ...newImplant, implantDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.status2', 'Status')}</label>
                  <select value={newImplant.status} onChange={(e) => setNewImplant({ ...newImplant, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.medicalDeviceTracker.active', 'Active')}</option>
                    <option value="removed">{t('tools.medicalDeviceTracker.removed', 'Removed')}</option>
                    <option value="replaced">{t('tools.medicalDeviceTracker.replaced', 'Replaced')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.surgeon2', 'Surgeon')}</label>
                <input type="text" value={newImplant.surgeon} onChange={(e) => setNewImplant({ ...newImplant, surgeon: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.surgeonName', 'Surgeon name')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.bodyLocation2', 'Body Location')}</label>
                <input type="text" value={newImplant.bodyLocation} onChange={(e) => setNewImplant({ ...newImplant, bodyLocation: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.eGLeftKneeRight', 'e.g., Left knee, Right hip')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.lotNumber', 'Lot Number')}</label>
                  <input type="text" value={newImplant.lotNumber} onChange={(e) => setNewImplant({ ...newImplant, lotNumber: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.lot2', 'Lot #')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.medicalDeviceTracker.udiNumber2', 'UDI Number')}</label>
                  <input type="text" value={newImplant.udiNumber} onChange={(e) => setNewImplant({ ...newImplant, udiNumber: e.target.value })} className={inputClass} placeholder={t('tools.medicalDeviceTracker.deviceUdi', 'Device UDI')} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.medicalDeviceTracker.notes3', 'Notes')}</label>
                <textarea value={newImplant.notes} onChange={(e) => setNewImplant({ ...newImplant, notes: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.medicalDeviceTracker.additionalNotes', 'Additional notes...')} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowImplantModal(false)} className={buttonSecondary}>{t('tools.medicalDeviceTracker.cancel4', 'Cancel')}</button>
                <button type="button" onClick={saveImplant} disabled={!newImplant.patientId || !newImplant.patientName || !newImplant.implantDate} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.medicalDeviceTracker.save3', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.medicalDeviceTracker.aboutMedicalDeviceTracker', 'About Medical Device Tracker')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track and manage medical devices, implants, and equipment across your facility. Monitor maintenance schedules,
          calibration records, warranty status, and regulatory compliance. Manage implant registries with patient tracking
          for recalls and follow-ups. Supports UDI (Unique Device Identifier) tracking per FDA requirements.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default MedicalDeviceTrackerTool;
