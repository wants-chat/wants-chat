'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  MapPin,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Square,
  Coffee,
  Moon,
  RefreshCw,
  BarChart3,
  Timer,
  Route,
  Fuel,
  FileText,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface DutyPeriod {
  id: string;
  startTime: string;
  endTime: string;
  dutyStatus: 'off-duty' | 'sleeper-berth' | 'driving' | 'on-duty';
  location: string;
  notes: string;
}

interface DriverLog {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  coDriverName: string;
  truckNumber: string;
  trailerNumber: string;
  carrier: string;
  homeTerminal: string;
  startOdometer: number;
  endOdometer: number;
  totalMiles: number;
  dutyPeriods: DutyPeriod[];
  hoursOffDuty: number;
  hoursSleeperBerth: number;
  hoursDriving: number;
  hoursOnDuty: number;
  totalHours: number;
  shippingDocs: string;
  fromLocation: string;
  toLocation: string;
  remarks: string;
  exceptions: string;
  certified: boolean;
  certifiedAt: string | null;
  violations: string[];
  createdAt: string;
  updatedAt: string;
}

type TabType = 'logs' | 'current' | 'hours' | 'reports';

const DUTY_STATUSES: { value: DutyPeriod['dutyStatus']; label: string; color: string; icon: any }[] = [
  { value: 'off-duty', label: 'Off Duty', color: 'gray', icon: Moon },
  { value: 'sleeper-berth', label: 'Sleeper Berth', color: 'blue', icon: Moon },
  { value: 'driving', label: 'Driving', color: 'green', icon: Truck },
  { value: 'on-duty', label: 'On Duty (Not Driving)', color: 'yellow', icon: Clock },
];

// Column configuration for exports
const LOG_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'truckNumber', header: 'Truck #', type: 'string' },
  { key: 'trailerNumber', header: 'Trailer #', type: 'string' },
  { key: 'carrier', header: 'Carrier', type: 'string' },
  { key: 'totalMiles', header: 'Miles', type: 'number' },
  { key: 'hoursDriving', header: 'Driving (hrs)', type: 'number' },
  { key: 'hoursOnDuty', header: 'On Duty (hrs)', type: 'number' },
  { key: 'hoursOffDuty', header: 'Off Duty (hrs)', type: 'number' },
  { key: 'hoursSleeperBerth', header: 'Sleeper (hrs)', type: 'number' },
  { key: 'fromLocation', header: 'From', type: 'string' },
  { key: 'toLocation', header: 'To', type: 'string' },
  { key: 'certified', header: 'Certified', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Sample data
const generateSampleData = (): DriverLog[] => [
  {
    id: '1',
    date: '2025-01-02',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    coDriverName: '',
    truckNumber: 'TRK-101',
    trailerNumber: 'TRL-2501',
    carrier: 'ABC Trucking LLC',
    homeTerminal: 'Phoenix, AZ',
    startOdometer: 125000,
    endOdometer: 125450,
    totalMiles: 450,
    dutyPeriods: [
      { id: '1', startTime: '00:00', endTime: '06:00', dutyStatus: 'off-duty', location: 'Phoenix, AZ', notes: 'Rest period' },
      { id: '2', startTime: '06:00', endTime: '06:30', dutyStatus: 'on-duty', location: 'Phoenix, AZ', notes: 'Pre-trip inspection' },
      { id: '3', startTime: '06:30', endTime: '11:30', dutyStatus: 'driving', location: 'I-10 West', notes: 'Driving to LA' },
      { id: '4', startTime: '11:30', endTime: '12:00', dutyStatus: 'on-duty', location: 'Quartzsite, AZ', notes: 'Fuel stop' },
      { id: '5', startTime: '12:00', endTime: '17:00', dutyStatus: 'driving', location: 'I-10 West', notes: 'Driving to LA' },
      { id: '6', startTime: '17:00', endTime: '17:30', dutyStatus: 'on-duty', location: 'Los Angeles, CA', notes: 'Delivery and post-trip' },
      { id: '7', startTime: '17:30', endTime: '24:00', dutyStatus: 'off-duty', location: 'Los Angeles, CA', notes: 'End of day' },
    ],
    hoursOffDuty: 12.5,
    hoursSleeperBerth: 0,
    hoursDriving: 10,
    hoursOnDuty: 1.5,
    totalHours: 24,
    shippingDocs: 'BOL-2025-0001',
    fromLocation: 'Phoenix, AZ',
    toLocation: 'Los Angeles, CA',
    remarks: 'Smooth trip, no delays',
    exceptions: '',
    certified: true,
    certifiedAt: '2025-01-02T23:45:00Z',
    violations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    date: '2025-01-01',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    coDriverName: '',
    truckNumber: 'TRK-101',
    trailerNumber: 'TRL-2501',
    carrier: 'ABC Trucking LLC',
    homeTerminal: 'Phoenix, AZ',
    startOdometer: 124700,
    endOdometer: 125000,
    totalMiles: 300,
    dutyPeriods: [
      { id: '1', startTime: '00:00', endTime: '08:00', dutyStatus: 'sleeper-berth', location: 'Tucson, AZ', notes: 'Overnight rest' },
      { id: '2', startTime: '08:00', endTime: '08:30', dutyStatus: 'on-duty', location: 'Tucson, AZ', notes: 'Pre-trip' },
      { id: '3', startTime: '08:30', endTime: '13:30', dutyStatus: 'driving', location: 'I-10 East', notes: '' },
      { id: '4', startTime: '13:30', endTime: '14:00', dutyStatus: 'on-duty', location: 'Phoenix, AZ', notes: 'Delivery' },
      { id: '5', startTime: '14:00', endTime: '24:00', dutyStatus: 'off-duty', location: 'Phoenix, AZ', notes: '' },
    ],
    hoursOffDuty: 10,
    hoursSleeperBerth: 8,
    hoursDriving: 5,
    hoursOnDuty: 1,
    totalHours: 24,
    shippingDocs: 'BOL-2024-9999',
    fromLocation: 'Tucson, AZ',
    toLocation: 'Phoenix, AZ',
    remarks: '',
    exceptions: '',
    certified: true,
    certifiedAt: '2025-01-01T22:00:00Z',
    violations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const emptyLog: Omit<DriverLog, 'id' | 'createdAt' | 'updatedAt'> = {
  date: new Date().toISOString().split('T')[0],
  driverId: '',
  driverName: '',
  coDriverName: '',
  truckNumber: '',
  trailerNumber: '',
  carrier: '',
  homeTerminal: '',
  startOdometer: 0,
  endOdometer: 0,
  totalMiles: 0,
  dutyPeriods: [],
  hoursOffDuty: 0,
  hoursSleeperBerth: 0,
  hoursDriving: 0,
  hoursOnDuty: 0,
  totalHours: 0,
  shippingDocs: '',
  fromLocation: '',
  toLocation: '',
  remarks: '',
  exceptions: '',
  certified: false,
  certifiedAt: null,
  violations: [],
};

const emptyPeriod: Omit<DutyPeriod, 'id'> = {
  startTime: '',
  endTime: '',
  dutyStatus: 'off-duty',
  location: '',
  notes: '',
};

export default function DriverLogTool() {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: logs,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<DriverLog>('driver-log', generateSampleData);

  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DriverLog | null>(null);
  const [formData, setFormData] = useState<Omit<DriverLog, 'id' | 'createdAt' | 'updatedAt'>>(emptyLog);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [newPeriod, setNewPeriod] = useState<Omit<DutyPeriod, 'id'>>(emptyPeriod);
  const [currentStatus, setCurrentStatus] = useState<DutyPeriod['dutyStatus']>('off-duty');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.toLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !dateFilter || log.date === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [logs, searchQuery, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const certifiedLogs = logs.filter((l) => l.certified).length;
    const totalMiles = logs.reduce((sum, l) => sum + l.totalMiles, 0);
    const totalDriving = logs.reduce((sum, l) => sum + l.hoursDriving, 0);
    const avgDriving = logs.length > 0 ? (totalDriving / logs.length).toFixed(1) : '0';
    const violationCount = logs.reduce((sum, l) => sum + l.violations.length, 0);
    return { totalLogs, certifiedLogs, totalMiles, totalDriving, avgDriving, violationCount };
  }, [logs]);

  // HOS calculations (Hours of Service - 70-hour/8-day rule)
  const hosStatus = useMemo(() => {
    const last8Days = logs
      .filter((l) => {
        const logDate = new Date(l.date);
        const today = new Date();
        const diff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        return diff < 8;
      })
      .reduce((sum, l) => sum + l.hoursDriving + l.hoursOnDuty, 0);

    const hoursRemaining = Math.max(0, 70 - last8Days);
    const drivingToday = logs.find((l) => l.date === new Date().toISOString().split('T')[0])?.hoursDriving || 0;
    const dailyDrivingRemaining = Math.max(0, 11 - drivingToday);

    return {
      weeklyUsed: last8Days.toFixed(1),
      weeklyRemaining: hoursRemaining.toFixed(1),
      dailyDrivingRemaining: dailyDrivingRemaining.toFixed(1),
      status: hoursRemaining > 10 ? 'good' : hoursRemaining > 0 ? 'warning' : 'violation',
    };
  }, [logs]);

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    // Calculate hours from duty periods
    const hours = calculateHoursFromPeriods(formData.dutyPeriods);
    const totalMiles = formData.endOdometer - formData.startOdometer;

    const logData = {
      ...formData,
      ...hours,
      totalMiles: totalMiles > 0 ? totalMiles : formData.totalMiles,
    };

    if (editingLog) {
      await updateItem(editingLog.id, { ...logData, updatedAt: now });
    } else {
      await addItem({
        ...logData,
        id: `log-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const calculateHoursFromPeriods = (periods: DutyPeriod[]) => {
    let offDuty = 0, sleeperBerth = 0, driving = 0, onDuty = 0;

    periods.forEach((p) => {
      const start = parseTime(p.startTime);
      const end = parseTime(p.endTime);
      const duration = (end - start) / 60; // Convert to hours

      if (p.dutyStatus === 'off-duty') offDuty += duration;
      else if (p.dutyStatus === 'sleeper-berth') sleeperBerth += duration;
      else if (p.dutyStatus === 'driving') driving += duration;
      else if (p.dutyStatus === 'on-duty') onDuty += duration;
    });

    return {
      hoursOffDuty: offDuty,
      hoursSleeperBerth: sleeperBerth,
      hoursDriving: driving,
      hoursOnDuty: onDuty,
      totalHours: offDuty + sleeperBerth + driving + onDuty,
    };
  };

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const resetForm = () => {
    setFormData(emptyLog);
    setEditingLog(null);
    setIsFormOpen(false);
    setNewPeriod(emptyPeriod);
  };

  const handleEdit = (log: DriverLog) => {
    setEditingLog(log);
    setFormData({ ...log });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Driver Log',
      message: 'Are you sure you want to delete this log? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const addPeriodToLog = () => {
    if (!newPeriod.startTime || !newPeriod.endTime) return;
    const period: DutyPeriod = {
      ...newPeriod,
      id: `period-${Date.now()}`,
    };
    setFormData({
      ...formData,
      dutyPeriods: [...formData.dutyPeriods, period].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime)),
    });
    setNewPeriod(emptyPeriod);
  };

  const removePeriodFromLog = (periodId: string) => {
    setFormData({
      ...formData,
      dutyPeriods: formData.dutyPeriods.filter((p) => p.id !== periodId),
    });
  };

  const certifyLog = async (log: DriverLog) => {
    await updateItem(log.id, {
      ...log,
      certified: true,
      certifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: DutyPeriod['dutyStatus']) => {
    const s = DUTY_STATUSES.find((st) => st.value === status);
    return s?.color || 'gray';
  };

  const getStatusIcon = (status: DutyPeriod['dutyStatus']) => {
    const s = DUTY_STATUSES.find((st) => st.value === status);
    return s?.icon || Clock;
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-7 h-7 text-indigo-600" />
            {t('tools.driverLog.driverLog', 'Driver Log')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.driverLog.trackDriverHoursAndActivity', 'Track driver hours and activity')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="driver-log" toolName="Driver Log" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredLogs}
            filename="driver-logs"
            columns={LOG_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.driverLog.newLog', 'New Log')}
          </button>
        </div>
      </div>

      {/* HOS Status Banner */}
      <div className={`p-4 rounded-xl border ${
        hosStatus.status === 'good' ? 'bg-green-50 border-green-200' :
        hosStatus.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              hosStatus.status === 'good' ? 'bg-green-100' :
              hosStatus.status === 'warning' ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              <Timer className={`w-5 h-5 ${
                hosStatus.status === 'good' ? 'text-green-600' :
                hosStatus.status === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('tools.driverLog.hoursOfServiceStatus', 'Hours of Service Status')}</h3>
              <p className="text-sm text-gray-600">70-Hour/8-Day Rule</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">{t('tools.driverLog.weeklyUsed', 'Weekly Used')}</p>
              <p className="text-xl font-bold text-gray-900">{hosStatus.weeklyUsed} hrs</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">{t('tools.driverLog.weeklyRemaining', 'Weekly Remaining')}</p>
              <p className={`text-xl font-bold ${
                hosStatus.status === 'good' ? 'text-green-600' :
                hosStatus.status === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{hosStatus.weeklyRemaining} hrs</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">{t('tools.driverLog.dailyDrivingLeft', 'Daily Driving Left')}</p>
              <p className="text-xl font-bold text-gray-900">{hosStatus.dailyDrivingRemaining} hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.driverLog.totalLogs', 'Total Logs')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalLogs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.driverLog.certified', 'Certified')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.certifiedLogs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Route className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.driverLog.totalMiles', 'Total Miles')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalMiles.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.driverLog.drivingHours', 'Driving Hours')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDriving.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.driverLog.avgDriving', 'Avg Driving')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgDriving} hrs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.violationCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${stats.violationCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.driverLog.violations', 'Violations')}</p>
              <p className={`text-xl font-bold ${stats.violationCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.violationCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['logs', 'current', 'hours', 'reports'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'current' ? 'Current Status' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'logs' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.driverLog.searchLogs', 'Search logs...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Logs List */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.driverLog.noLogsFound', 'No logs found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.driverLog.createANewDriverLog', 'Create a new driver log to get started')}</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-all ${
                  selectedLogId === log.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-sm text-gray-500">{log.driverName}</span>
                      </div>
                      {log.certified ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('tools.driverLog.certified2', 'Certified')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          {t('tools.driverLog.pending', 'Pending')}
                        </span>
                      )}
                      {log.violations.length > 0 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {log.violations.length} Violation(s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{log.totalMiles} mi</p>
                        <p className="text-sm text-gray-500">{formatHours(log.hoursDriving)} driving</p>
                      </div>
                      <div className="flex gap-2">
                        {!log.certified && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              certifyLog(log);
                            }}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg"
                            title={t('tools.driverLog.certifyLog', 'Certify Log')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(log);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(log.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {log.truckNumber}
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {log.fromLocation} → {log.toLocation}
                    </div>
                    <span className="text-gray-400">|</span>
                    <span>Off: {formatHours(log.hoursOffDuty)}</span>
                    <span>SB: {formatHours(log.hoursSleeperBerth)}</span>
                    <span>On: {formatHours(log.hoursOnDuty)}</span>
                  </div>
                </div>

                {/* Expanded Details - Grid Graph */}
                {selectedLogId === log.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-4">{t('tools.driverLog.dutyStatusGraph', 'Duty Status Graph')}</h4>

                    {/* 24-hour grid */}
                    <div className="mb-4">
                      <div className="flex text-xs text-gray-500 mb-1">
                        {Array.from({ length: 25 }, (_, i) => (
                          <div key={i} className="flex-1 text-center" style={{ width: '4.16%' }}>
                            {i % 2 === 0 ? i : ''}
                          </div>
                        ))}
                      </div>
                      {DUTY_STATUSES.map((status) => (
                        <div key={status.value} className="flex items-center mb-1">
                          <div className="w-24 text-xs text-gray-600 flex items-center gap-1">
                            {status.label}
                          </div>
                          <div className="flex-1 h-6 bg-gray-200 rounded relative">
                            {log.dutyPeriods
                              .filter((p) => p.dutyStatus === status.value)
                              .map((p) => {
                                const start = parseTime(p.startTime) / (24 * 60) * 100;
                                const end = parseTime(p.endTime) / (24 * 60) * 100;
                                const width = end - start;
                                return (
                                  <div
                                    key={p.id}
                                    className={`absolute h-full bg-${status.color}-500 rounded`}
                                    style={{ left: `${start}%`, width: `${width}%` }}
                                    title={`${p.startTime} - ${p.endTime}: ${p.notes || status.label}`}
                                  />
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Duty Periods List */}
                    <div className="space-y-2">
                      {log.dutyPeriods.map((period) => {
                        const StatusIcon = getStatusIcon(period.dutyStatus);
                        return (
                          <div
                            key={period.id}
                            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                          >
                            <StatusIcon className={`w-4 h-4 text-${getStatusColor(period.dutyStatus)}-500`} />
                            <span className="font-medium text-sm">{period.startTime} - {period.endTime}</span>
                            <span className={`px-2 py-0.5 text-xs rounded bg-${getStatusColor(period.dutyStatus)}-100 text-${getStatusColor(period.dutyStatus)}-700`}>
                              {DUTY_STATUSES.find((s) => s.value === period.dutyStatus)?.label}
                            </span>
                            <span className="text-sm text-gray-500">{period.location}</span>
                            {period.notes && <span className="text-sm text-gray-400">- {period.notes}</span>}
                          </div>
                        );
                      })}
                    </div>

                    {log.remarks && (
                      <p className="mt-4 text-sm text-gray-600">
                        <span className="font-medium">{t('tools.driverLog.remarks', 'Remarks:')}</span> {log.remarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Current Status Tab */}
      {activeTab === 'current' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.driverLog.currentDutyStatus', 'Current Duty Status')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {DUTY_STATUSES.map((status) => {
              const Icon = status.icon;
              return (
                <button
                  key={status.value}
                  onClick={() => setCurrentStatus(status.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentStatus === status.value
                      ? `border-${status.color}-500 bg-${status.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 text-${status.color}-500`} />
                  <p className="text-sm font-medium text-gray-900">{status.label}</p>
                </button>
              );
            })}
          </div>
          <p className="text-gray-600 text-center">
            Current status: <span className="font-semibold">{DUTY_STATUSES.find((s) => s.value === currentStatus)?.label}</span>
          </p>
        </div>
      )}

      {/* Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-600" />
            {t('tools.driverLog.hoursSummary', 'Hours Summary')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">70-Hour/8-Day Rule</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t('tools.driverLog.hoursUsed', 'Hours Used')}</span>
                  <span className="font-semibold">{hosStatus.weeklyUsed} / 70</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      parseFloat(hosStatus.weeklyUsed) / 70 > 0.9
                        ? 'bg-red-500'
                        : parseFloat(hosStatus.weeklyUsed) / 70 > 0.7
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((parseFloat(hosStatus.weeklyUsed) / 70) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {hosStatus.weeklyRemaining} hours remaining in 8-day period
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">{t('tools.driverLog.dailyLimits', 'Daily Limits')}</h4>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">11-Hour Driving Limit</span>
                    <span className="font-semibold">{hosStatus.dailyDrivingRemaining} hrs left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min((parseFloat(hosStatus.dailyDrivingRemaining) / 11) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">14-Hour On-Duty Limit</span>
                    <span className="font-semibold">14 hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            {t('tools.driverLog.driverReports', 'Driver Reports')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.driverLog.totalMilesThisMonth', 'Total Miles This Month')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMiles.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.driverLog.totalDrivingHours', 'Total Driving Hours')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDriving.toFixed(1)} hrs</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.driverLog.certifiedLogs', 'Certified Logs')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.certifiedLogs} / {stats.totalLogs}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLog ? t('tools.driverLog.editDriverLog', 'Edit Driver Log') : t('tools.driverLog.newDriverLog', 'New Driver Log')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Date and Driver Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.date', 'Date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.driverName', 'Driver Name')}</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.driverId', 'Driver ID')}</label>
                  <input
                    type="text"
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.coDriver', 'Co-Driver')}</label>
                  <input
                    type="text"
                    value={formData.coDriverName}
                    onChange={(e) => setFormData({ ...formData, coDriverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.truckNumber', 'Truck Number')}</label>
                  <input
                    type="text"
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.trailerNumber', 'Trailer Number')}</label>
                  <input
                    type="text"
                    value={formData.trailerNumber}
                    onChange={(e) => setFormData({ ...formData, trailerNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.carrier', 'Carrier')}</label>
                  <input
                    type="text"
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.homeTerminal', 'Home Terminal')}</label>
                  <input
                    type="text"
                    value={formData.homeTerminal}
                    onChange={(e) => setFormData({ ...formData, homeTerminal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Odometer and Route */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.startOdometer', 'Start Odometer')}</label>
                  <input
                    type="number"
                    value={formData.startOdometer}
                    onChange={(e) => setFormData({ ...formData, startOdometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.endOdometer', 'End Odometer')}</label>
                  <input
                    type="number"
                    value={formData.endOdometer}
                    onChange={(e) => setFormData({ ...formData, endOdometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.fromLocation', 'From Location')}</label>
                  <input
                    type="text"
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.toLocation', 'To Location')}</label>
                  <input
                    type="text"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Duty Periods */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('tools.driverLog.dutyPeriods', 'Duty Periods')}</h3>
                <div className="space-y-2 mb-4">
                  {formData.dutyPeriods.map((period) => (
                    <div key={period.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm w-28">{period.startTime} - {period.endTime}</span>
                      <span className={`px-2 py-0.5 text-xs rounded bg-${getStatusColor(period.dutyStatus)}-100 text-${getStatusColor(period.dutyStatus)}-700`}>
                        {DUTY_STATUSES.find((s) => s.value === period.dutyStatus)?.label}
                      </span>
                      <span className="flex-1 text-sm text-gray-600">{period.location}</span>
                      <span className="text-sm text-gray-400">{period.notes}</span>
                      <button
                        onClick={() => removePeriodFromLog(period.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Period */}
                <div className="p-3 border border-dashed border-gray-300 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input
                      type="time"
                      placeholder={t('tools.driverLog.start', 'Start')}
                      value={newPeriod.startTime}
                      onChange={(e) => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="time"
                      placeholder={t('tools.driverLog.end', 'End')}
                      value={newPeriod.endTime}
                      onChange={(e) => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={newPeriod.dutyStatus}
                      onChange={(e) => setNewPeriod({ ...newPeriod, dutyStatus: e.target.value as DutyPeriod['dutyStatus'] })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {DUTY_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={t('tools.driverLog.location', 'Location')}
                      value={newPeriod.location}
                      onChange={(e) => setNewPeriod({ ...newPeriod, location: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.driverLog.notes', 'Notes')}
                      value={newPeriod.notes}
                      onChange={(e) => setNewPeriod({ ...newPeriod, notes: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={addPeriodToLog}
                      disabled={!newPeriod.startTime || !newPeriod.endTime}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {t('tools.driverLog.add', 'Add')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.shippingDocuments', 'Shipping Documents')}</label>
                  <input
                    type="text"
                    value={formData.shippingDocs}
                    onChange={(e) => setFormData({ ...formData, shippingDocs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.driverLog.remarks2', 'Remarks')}</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.driverLog.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4" />
                {editingLog ? t('tools.driverLog.updateLog', 'Update Log') : t('tools.driverLog.createLog', 'Create Log')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export { DriverLogTool };
