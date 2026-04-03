'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Truck,
  User,
  Calendar,
  FileText,
  Activity,
  Wifi,
  WifiOff,
  Timer,
  AlertCircle,
  Settings,
  Download,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface ELDRecord {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleVIN: string;
  eldSerialNumber: string;
  eldProvider: string;
  date: string;
  recordType: 'duty-status' | 'certification' | 'login' | 'logout' | 'malfunction' | 'data-diagnostic';
  recordStatus: 'active' | 'inactive-changed' | 'inactive-edit';
  recordOrigin: 'auto' | 'driver' | 'other-user' | 'unidentified';
  eventType: 'off-duty' | 'sleeper-berth' | 'driving' | 'on-duty' | 'pc' | 'ym' | 'wt' | 'ad';
  startTime: string;
  endTime: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  engineHours: number;
  odometer: number;
  sequence: number;
  annotation: string;
  certifiedBy: string | null;
  certifiedAt: string | null;
  malfunctionIndicator: boolean;
  dataDiagnosticIndicator: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ELDDevice {
  id: string;
  serialNumber: string;
  provider: string;
  model: string;
  firmwareVersion: string;
  vehicleId: string;
  vehicleVIN: string;
  status: 'active' | 'inactive' | 'malfunction';
  lastSync: string;
  nextCalibrationDue: string;
  notes: string;
}

interface ComplianceViolation {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  violationType: 'hos' | 'form-manner' | 'malfunction' | 'data-transfer' | 'certification';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  regulationCode: string;
  status: 'open' | 'under-review' | 'resolved' | 'contested';
  resolvedAt: string | null;
  notes: string;
}

type TabType = 'records' | 'devices' | 'violations' | 'reports';

const EVENT_TYPES: { value: ELDRecord['eventType']; label: string; color: string }[] = [
  { value: 'off-duty', label: 'Off Duty', color: 'gray' },
  { value: 'sleeper-berth', label: 'Sleeper Berth', color: 'blue' },
  { value: 'driving', label: 'Driving', color: 'green' },
  { value: 'on-duty', label: 'On Duty (Not Driving)', color: 'yellow' },
  { value: 'pc', label: 'Personal Conveyance', color: 'purple' },
  { value: 'ym', label: 'Yard Move', color: 'orange' },
  { value: 'wt', label: 'Wait Time', color: 'teal' },
  { value: 'ad', label: 'Authorized Driving', color: 'indigo' },
];

const RECORD_ORIGINS: { value: ELDRecord['recordOrigin']; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'driver', label: 'Driver Entry' },
  { value: 'other-user', label: 'Other User' },
  { value: 'unidentified', label: 'Unidentified' },
];

const DEVICE_STATUSES: { value: ELDDevice['status']; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'malfunction', label: 'Malfunction', color: 'red' },
];

const VIOLATION_TYPES: { value: ComplianceViolation['violationType']; label: string }[] = [
  { value: 'hos', label: 'Hours of Service' },
  { value: 'form-manner', label: 'Form & Manner' },
  { value: 'malfunction', label: 'ELD Malfunction' },
  { value: 'data-transfer', label: 'Data Transfer' },
  { value: 'certification', label: 'Certification' },
];

// Column configuration for exports
const RECORD_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'vehicleId', header: 'Vehicle', type: 'string' },
  { key: 'eventType', header: 'Event Type', type: 'string', format: (value) => EVENT_TYPES.find(e => e.value === value)?.label || value },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'recordOrigin', header: 'Origin', type: 'string', format: (value) => RECORD_ORIGINS.find(o => o.value === value)?.label || value },
  { key: 'engineHours', header: 'Engine Hours', type: 'number' },
  { key: 'odometer', header: 'Odometer', type: 'number' },
  { key: 'malfunctionIndicator', header: 'Malfunction', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Sample data
const generateSampleRecords = (): ELDRecord[] => [
  {
    id: '1',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    vehicleId: 'TRK-101',
    vehicleVIN: '1HGBH41JXMN109186',
    eldSerialNumber: 'ELD-2024-001',
    eldProvider: 'KeepTruckin',
    date: '2025-01-02',
    recordType: 'duty-status',
    recordStatus: 'active',
    recordOrigin: 'auto',
    eventType: 'driving',
    startTime: '06:30',
    endTime: '11:30',
    location: 'Phoenix, AZ',
    latitude: 33.4484,
    longitude: -112.0740,
    engineHours: 4523.5,
    odometer: 125450,
    sequence: 1,
    annotation: '',
    certifiedBy: null,
    certifiedAt: null,
    malfunctionIndicator: false,
    dataDiagnosticIndicator: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    vehicleId: 'TRK-101',
    vehicleVIN: '1HGBH41JXMN109186',
    eldSerialNumber: 'ELD-2024-001',
    eldProvider: 'KeepTruckin',
    date: '2025-01-02',
    recordType: 'duty-status',
    recordStatus: 'active',
    recordOrigin: 'driver',
    eventType: 'on-duty',
    startTime: '11:30',
    endTime: '12:00',
    location: 'Quartzsite, AZ',
    latitude: 33.6639,
    longitude: -114.2297,
    engineHours: 4528.5,
    odometer: 125720,
    sequence: 2,
    annotation: 'Fuel stop',
    certifiedBy: null,
    certifiedAt: null,
    malfunctionIndicator: false,
    dataDiagnosticIndicator: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateSampleDevices = (): ELDDevice[] => [
  {
    id: '1',
    serialNumber: 'ELD-2024-001',
    provider: 'KeepTruckin',
    model: 'Vehicle Gateway',
    firmwareVersion: '3.5.2',
    vehicleId: 'TRK-101',
    vehicleVIN: '1HGBH41JXMN109186',
    status: 'active',
    lastSync: new Date().toISOString(),
    nextCalibrationDue: '2025-06-01',
    notes: '',
  },
  {
    id: '2',
    serialNumber: 'ELD-2024-002',
    provider: 'Samsara',
    model: 'VG54',
    firmwareVersion: '2.1.0',
    vehicleId: 'TRK-102',
    vehicleVIN: '1HGBH41JXMN109187',
    status: 'active',
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    nextCalibrationDue: '2025-07-15',
    notes: '',
  },
];

const emptyRecord: Omit<ELDRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  driverId: '',
  driverName: '',
  vehicleId: '',
  vehicleVIN: '',
  eldSerialNumber: '',
  eldProvider: '',
  date: new Date().toISOString().split('T')[0],
  recordType: 'duty-status',
  recordStatus: 'active',
  recordOrigin: 'driver',
  eventType: 'on-duty',
  startTime: '',
  endTime: null,
  location: '',
  latitude: null,
  longitude: null,
  engineHours: 0,
  odometer: 0,
  sequence: 0,
  annotation: '',
  certifiedBy: null,
  certifiedAt: null,
  malfunctionIndicator: false,
  dataDiagnosticIndicator: false,
};

export default function ELDComplianceTool() {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: records,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<ELDRecord>('eld-compliance', [], RECORD_COLUMNS);

  const [devices] = useState<ELDDevice[]>(generateSampleDevices);
  const [violations] = useState<ComplianceViolation[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ELDRecord | null>(null);
  const [formData, setFormData] = useState<Omit<ELDRecord, 'id' | 'createdAt' | 'updatedAt'>>(emptyRecord);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !dateFilter || record.date === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [records, searchQuery, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const activeDevices = devices.filter(d => d.status === 'active').length;
    const malfunctions = records.filter(r => r.malfunctionIndicator).length;
    const openViolations = violations.filter(v => v.status === 'open').length;
    const drivingHours = records
      .filter(r => r.eventType === 'driving' && r.endTime)
      .reduce((sum, r) => {
        const start = parseTime(r.startTime);
        const end = parseTime(r.endTime!);
        return sum + (end - start) / 60;
      }, 0);
    return { totalRecords, activeDevices, malfunctions, openViolations, drivingHours };
  }, [records, devices, violations]);

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    if (editingRecord) {
      await updateItem(editingRecord.id, { ...formData, updatedAt: now });
    } else {
      await addItem({
        ...formData,
        id: `eld-${Date.now()}`,
        sequence: records.length + 1,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyRecord);
    setEditingRecord(null);
    setIsFormOpen(false);
  };

  const handleEdit = (record: ELDRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Record',
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const getEventColor = (eventType: ELDRecord['eventType']) => {
    return EVENT_TYPES.find(e => e.value === eventType)?.color || 'gray';
  };

  const getDeviceStatusColor = (status: ELDDevice['status']) => {
    return DEVICE_STATUSES.find(s => s.value === status)?.color || 'gray';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-600" />
            {t('tools.eLDCompliance.eldCompliance', 'ELD Compliance')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.eLDCompliance.electronicLoggingDeviceComplianceManagement', 'Electronic Logging Device compliance management')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="e-l-d-compliance" toolName="E L D Compliance" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredRecords}
            filename="eld-records"
            columns={RECORD_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.eLDCompliance.newRecord', 'New Record')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.totalRecords', 'Total Records')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRecords}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.activeDevices', 'Active Devices')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeDevices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Timer className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.drivingHours', 'Driving Hours')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.drivingHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.malfunctions > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertCircle className={`w-5 h-5 ${stats.malfunctions > 0 ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.malfunctions', 'Malfunctions')}</p>
              <p className={`text-xl font-bold ${stats.malfunctions > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.malfunctions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.openViolations > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${stats.openViolations > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.openViolations', 'Open Violations')}</p>
              <p className={`text-xl font-bold ${stats.openViolations > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{stats.openViolations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['records', 'devices', 'violations', 'reports'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'records' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.eLDCompliance.searchRecords', 'Search records...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            {t('tools.eLDCompliance.exportToFmcsa', 'Export to FMCSA')}
          </button>
        </div>
      )}

      {/* Records List */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.eLDCompliance.noEldRecordsFound', 'No ELD records found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.eLDCompliance.recordsWillAppearHereAs', 'Records will appear here as they are logged')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.dateTime', 'Date/Time')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.driver', 'Driver')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.event', 'Event')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.location', 'Location')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.origin', 'Origin')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.status', 'Status')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tools.eLDCompliance.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{record.date}</div>
                        <div className="text-xs text-gray-500">{record.startTime} - {record.endTime || 'Ongoing'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{record.driverName}</div>
                        <div className="text-xs text-gray-500">{record.vehicleId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getEventColor(record.eventType)}-100 text-${getEventColor(record.eventType)}-700`}>
                          {EVENT_TYPES.find(e => e.value === record.eventType)?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.location}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {RECORD_ORIGINS.find(o => o.value === record.recordOrigin)?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {record.malfunctionIndicator && (
                            <AlertCircle className="w-4 h-4 text-red-500" title={t('tools.eLDCompliance.malfunction', 'Malfunction')} />
                          )}
                          {record.dataDiagnosticIndicator && (
                            <Activity className="w-4 h-4 text-yellow-500" title={t('tools.eLDCompliance.diagnostic', 'Diagnostic')} />
                          )}
                          {!record.malfunctionIndicator && !record.dataDiagnosticIndicator && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 text-red-400 hover:text-red-600"
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
          )}
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${device.status === 'active' ? 'bg-green-100' : device.status === 'malfunction' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    {device.status === 'active' ? (
                      <Wifi className="w-6 h-6 text-green-600" />
                    ) : device.status === 'malfunction' ? (
                      <WifiOff className="w-6 h-6 text-red-600" />
                    ) : (
                      <WifiOff className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.serialNumber}</h3>
                    <p className="text-sm text-gray-500">{device.provider} - {device.model}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getDeviceStatusColor(device.status)}-100 text-${getDeviceStatusColor(device.status)}-700`}>
                    {DEVICE_STATUSES.find(s => s.value === device.status)?.label}
                  </span>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-500">Vehicle: {device.vehicleId}</p>
                  <p className="text-gray-400">Last sync: {new Date(device.lastSync).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                <span>Firmware: {device.firmwareVersion}</span>
                <span>VIN: {device.vehicleVIN}</span>
                <span>Calibration due: {new Date(device.nextCalibrationDue).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {violations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.eLDCompliance.noViolations', 'No Violations')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.eLDCompliance.allComplianceRequirementsAreMet', 'All compliance requirements are met')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((v) => (
                <div key={v.id} className="p-4 border border-gray-200 rounded-lg">
                  <p>{v.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            {t('tools.eLDCompliance.complianceReports', 'Compliance Reports')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-medium text-gray-900">{t('tools.eLDCompliance.driverVehicleInspectionReport', 'Driver Vehicle Inspection Report')}</h4>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.dvirSummaryAndHistory', 'DVIR summary and history')}</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Timer className="w-8 h-8 text-purple-500 mb-2" />
              <h4 className="font-medium text-gray-900">{t('tools.eLDCompliance.hosSummary', 'HOS Summary')}</h4>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.hoursOfServiceComplianceReport', 'Hours of Service compliance report')}</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Download className="w-8 h-8 text-green-500 mb-2" />
              <h4 className="font-medium text-gray-900">{t('tools.eLDCompliance.fmcsaExport', 'FMCSA Export')}</h4>
              <p className="text-sm text-gray-500">{t('tools.eLDCompliance.exportDataForRoadsideInspection', 'Export data for roadside inspection')}</p>
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRecord ? t('tools.eLDCompliance.editEldRecord', 'Edit ELD Record') : t('tools.eLDCompliance.newEldRecord', 'New ELD Record')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.date', 'Date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.driverName', 'Driver Name')}</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.vehicleId', 'Vehicle ID')}</label>
                  <input
                    type="text"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.eventType', 'Event Type')}</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as ELDRecord['eventType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {EVENT_TYPES.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.startTime', 'Start Time')}</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.endTime', 'End Time')}</label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.location2', 'Location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.recordOrigin', 'Record Origin')}</label>
                  <select
                    value={formData.recordOrigin}
                    onChange={(e) => setFormData({ ...formData, recordOrigin: e.target.value as ELDRecord['recordOrigin'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {RECORD_ORIGINS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.engineHours', 'Engine Hours')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.engineHours}
                    onChange={(e) => setFormData({ ...formData, engineHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.odometer', 'Odometer')}</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.eLDCompliance.annotation', 'Annotation')}</label>
                <textarea
                  rows={2}
                  value={formData.annotation}
                  onChange={(e) => setFormData({ ...formData, annotation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.malfunctionIndicator}
                    onChange={(e) => setFormData({ ...formData, malfunctionIndicator: e.target.checked })}
                    className="rounded border-gray-300 text-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{t('tools.eLDCompliance.malfunctionIndicator', 'Malfunction Indicator')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.dataDiagnosticIndicator}
                    onChange={(e) => setFormData({ ...formData, dataDiagnosticIndicator: e.target.checked })}
                    className="rounded border-gray-300 text-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{t('tools.eLDCompliance.dataDiagnosticIndicator', 'Data Diagnostic Indicator')}</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.eLDCompliance.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                {editingRecord ? t('tools.eLDCompliance.updateRecord', 'Update Record') : t('tools.eLDCompliance.createRecord', 'Create Record')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export { ELDComplianceTool };
