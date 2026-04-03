'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Sun,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Battery,
  DollarSign,
  BarChart3,
  Clock,
  CloudSun,
  Thermometer,
  Settings,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Leaf,
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
import { useTheme } from '@/contexts/ThemeContext';

interface SolarPanelToolProps {
  uiConfig?: UIConfig;
}

type SystemStatus = 'active' | 'maintenance' | 'offline' | 'degraded';

interface SolarSystem {
  id: string;
  name: string;
  location: string;
  installedCapacity: number; // kW
  panelCount: number;
  panelType: string;
  inverterType: string;
  installationDate: string;
  warrantyExpiration: string;
  orientation: string;
  tiltAngle: number;
  status: SystemStatus;
  notes: string;
  createdAt: string;
}

interface ProductionLog {
  id: string;
  systemId: string;
  date: string;
  energyProduced: number; // kWh
  peakPower: number; // kW
  hoursOfSunlight: number;
  averageTemperature: number;
  weatherCondition: string;
  gridExport: number; // kWh
  selfConsumption: number; // kWh
  notes: string;
  createdAt: string;
}

interface MaintenanceLog {
  id: string;
  systemId: string;
  date: string;
  type: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'other';
  description: string;
  cost: number;
  performedBy: string;
  nextScheduled: string | null;
  notes: string;
  createdAt: string;
}

const SYSTEM_STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle },
  maintenance: { label: 'Maintenance', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: Settings },
  offline: { label: 'Offline', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: AlertTriangle },
  degraded: { label: 'Degraded', color: 'text-orange-500', bgColor: 'bg-orange-500/10', icon: TrendingDown },
};

const WEATHER_CONDITIONS = ['Clear', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Rain', 'Snow', 'Haze'];

const MAINTENANCE_TYPES = {
  inspection: { label: 'Inspection', color: 'text-blue-500' },
  cleaning: { label: 'Cleaning', color: 'text-cyan-500' },
  repair: { label: 'Repair', color: 'text-orange-500' },
  replacement: { label: 'Replacement', color: 'text-red-500' },
  other: { label: 'Other', color: 'text-gray-500' },
};

// Column configurations for exports
const SYSTEM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'System Name', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'installedCapacity', header: 'Capacity (kW)', type: 'number' },
  { key: 'panelCount', header: 'Panels', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'installationDate', header: 'Installed', type: 'date' },
];

const PRODUCTION_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'energyProduced', header: 'Production (kWh)', type: 'number' },
  { key: 'peakPower', header: 'Peak Power (kW)', type: 'number' },
  { key: 'hoursOfSunlight', header: 'Sunlight Hours', type: 'number' },
  { key: 'weatherCondition', header: 'Weather', type: 'string' },
  { key: 'gridExport', header: 'Grid Export (kWh)', type: 'number' },
  { key: 'selfConsumption', header: 'Self Use (kWh)', type: 'number' },
];

const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'performedBy', header: 'Performed By', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatNumber = (num: number, decimals = 1) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const SolarPanelTool: React.FC<SolarPanelToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: systems,
    addItem: addSystemToBackend,
    updateItem: updateSystemBackend,
    deleteItem: deleteSystemBackend,
    isSynced: systemsSynced,
    isSaving: systemsSaving,
    lastSaved: systemsLastSaved,
    syncError: systemsSyncError,
    forceSync: forceSystemsSync,
  } = useToolData<SolarSystem>('solar-panel-systems', [], SYSTEM_COLUMNS);

  const {
    data: productionLogs,
    addItem: addProductionToBackend,
    updateItem: updateProductionBackend,
    deleteItem: deleteProductionBackend,
    isSynced: productionSynced,
    isSaving: productionSaving,
    lastSaved: productionLastSaved,
    syncError: productionSyncError,
    forceSync: forceProductionSync,
  } = useToolData<ProductionLog>('solar-panel-production', [], PRODUCTION_COLUMNS);

  const {
    data: maintenanceLogs,
    addItem: addMaintenanceToBackend,
    updateItem: updateMaintenanceBackend,
    deleteItem: deleteMaintenanceBackend,
    isSynced: maintenanceSynced,
    isSaving: maintenanceSaving,
    lastSaved: maintenanceLastSaved,
    syncError: maintenanceSyncError,
    forceSync: forceMaintenanceSync,
  } = useToolData<MaintenanceLog>('solar-panel-maintenance', [], MAINTENANCE_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'production' | 'maintenance' | 'systems'>('dashboard');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  // Form states
  const [newSystem, setNewSystem] = useState<Partial<SolarSystem>>({
    name: '',
    location: '',
    installedCapacity: 0,
    panelCount: 0,
    panelType: '',
    inverterType: '',
    installationDate: new Date().toISOString().split('T')[0],
    warrantyExpiration: '',
    orientation: 'South',
    tiltAngle: 30,
    status: 'active',
    notes: '',
  });

  const [newProduction, setNewProduction] = useState<Partial<ProductionLog>>({
    systemId: '',
    date: new Date().toISOString().split('T')[0],
    energyProduced: 0,
    peakPower: 0,
    hoursOfSunlight: 0,
    averageTemperature: 0,
    weatherCondition: 'Clear',
    gridExport: 0,
    selfConsumption: 0,
    notes: '',
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceLog>>({
    systemId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'inspection',
    description: '',
    cost: 0,
    performedBy: '',
    nextScheduled: null,
    notes: '',
  });

  // Get selected system
  const selectedSystem = useMemo(() => {
    return systems.find(s => s.id === selectedSystemId);
  }, [systems, selectedSystemId]);

  // Filter production logs by date range and system
  const filteredProductionLogs = useMemo(() => {
    let logs = [...productionLogs];

    if (selectedSystemId) {
      logs = logs.filter(l => l.systemId === selectedSystemId);
    }

    const now = new Date();
    if (dateRange !== 'all') {
      const cutoff = new Date();
      if (dateRange === 'week') cutoff.setDate(cutoff.getDate() - 7);
      else if (dateRange === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
      else if (dateRange === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1);

      logs = logs.filter(l => new Date(l.date) >= cutoff);
    }

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [productionLogs, selectedSystemId, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const logs = filteredProductionLogs;
    const totalProduction = logs.reduce((acc, l) => acc + l.energyProduced, 0);
    const totalExport = logs.reduce((acc, l) => acc + l.gridExport, 0);
    const totalSelfUse = logs.reduce((acc, l) => acc + l.selfConsumption, 0);
    const avgDailyProduction = logs.length > 0 ? totalProduction / logs.length : 0;
    const peakProduction = logs.length > 0 ? Math.max(...logs.map(l => l.energyProduced)) : 0;

    // Calculate capacity factor
    const totalCapacity = selectedSystemId
      ? (selectedSystem?.installedCapacity || 0)
      : systems.reduce((acc, s) => acc + s.installedCapacity, 0);
    const capacityFactor = totalCapacity > 0 && logs.length > 0
      ? (avgDailyProduction / (totalCapacity * 24)) * 100
      : 0;

    // Estimate savings (assuming $0.12/kWh)
    const ratePerKwh = 0.12;
    const estimatedSavings = totalProduction * ratePerKwh;

    // CO2 offset (assuming 0.4 kg CO2/kWh)
    const co2Offset = totalProduction * 0.4;

    return {
      totalProduction,
      totalExport,
      totalSelfUse,
      avgDailyProduction,
      peakProduction,
      capacityFactor,
      estimatedSavings,
      co2Offset,
      logCount: logs.length,
    };
  }, [filteredProductionLogs, systems, selectedSystem, selectedSystemId]);

  // Add system
  const addSystem = () => {
    if (!newSystem.name || !newSystem.installedCapacity) {
      setValidationMessage('Please enter system name and capacity');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const system: SolarSystem = {
      id: generateId(),
      name: newSystem.name || '',
      location: newSystem.location || '',
      installedCapacity: newSystem.installedCapacity || 0,
      panelCount: newSystem.panelCount || 0,
      panelType: newSystem.panelType || '',
      inverterType: newSystem.inverterType || '',
      installationDate: newSystem.installationDate || new Date().toISOString().split('T')[0],
      warrantyExpiration: newSystem.warrantyExpiration || '',
      orientation: newSystem.orientation || 'South',
      tiltAngle: newSystem.tiltAngle || 30,
      status: newSystem.status || 'active',
      notes: newSystem.notes || '',
      createdAt: new Date().toISOString(),
    };

    addSystemToBackend(system);
    setSelectedSystemId(system.id);
    setShowSystemForm(false);
    setNewSystem({
      name: '',
      location: '',
      installedCapacity: 0,
      panelCount: 0,
      panelType: '',
      inverterType: '',
      installationDate: new Date().toISOString().split('T')[0],
      warrantyExpiration: '',
      orientation: 'South',
      tiltAngle: 30,
      status: 'active',
      notes: '',
    });
  };

  // Delete system
  const deleteSystem = async (systemId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this system? All associated data will also be deleted.',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteSystemBackend(systemId);
    productionLogs.forEach(l => {
      if (l.systemId === systemId) deleteProductionBackend(l.id);
    });
    maintenanceLogs.forEach(l => {
      if (l.systemId === systemId) deleteMaintenanceBackend(l.id);
    });
    if (selectedSystemId === systemId) setSelectedSystemId('');
  };

  // Add production log
  const addProductionLog = () => {
    if (!newProduction.systemId) {
      setValidationMessage('Please select a system');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const log: ProductionLog = {
      id: generateId(),
      systemId: newProduction.systemId || '',
      date: newProduction.date || new Date().toISOString().split('T')[0],
      energyProduced: newProduction.energyProduced || 0,
      peakPower: newProduction.peakPower || 0,
      hoursOfSunlight: newProduction.hoursOfSunlight || 0,
      averageTemperature: newProduction.averageTemperature || 0,
      weatherCondition: newProduction.weatherCondition || 'Clear',
      gridExport: newProduction.gridExport || 0,
      selfConsumption: newProduction.selfConsumption || 0,
      notes: newProduction.notes || '',
      createdAt: new Date().toISOString(),
    };

    addProductionToBackend(log);
    setShowProductionForm(false);
    setNewProduction({
      systemId: selectedSystemId,
      date: new Date().toISOString().split('T')[0],
      energyProduced: 0,
      peakPower: 0,
      hoursOfSunlight: 0,
      averageTemperature: 0,
      weatherCondition: 'Clear',
      gridExport: 0,
      selfConsumption: 0,
      notes: '',
    });
  };

  // Delete production log
  const deleteProductionLog = async (logId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Delete this production log?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteProductionBackend(logId);
  };

  // Add maintenance log
  const addMaintenanceLog = () => {
    if (!newMaintenance.systemId || !newMaintenance.description) {
      setValidationMessage('Please select a system and enter description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const log: MaintenanceLog = {
      id: generateId(),
      systemId: newMaintenance.systemId || '',
      date: newMaintenance.date || new Date().toISOString().split('T')[0],
      type: newMaintenance.type || 'inspection',
      description: newMaintenance.description || '',
      cost: newMaintenance.cost || 0,
      performedBy: newMaintenance.performedBy || '',
      nextScheduled: newMaintenance.nextScheduled || null,
      notes: newMaintenance.notes || '',
      createdAt: new Date().toISOString(),
    };

    addMaintenanceToBackend(log);
    setShowMaintenanceForm(false);
    setNewMaintenance({
      systemId: selectedSystemId,
      date: new Date().toISOString().split('T')[0],
      type: 'inspection',
      description: '',
      cost: 0,
      performedBy: '',
      nextScheduled: null,
      notes: '',
    });
  };

  // Delete maintenance log
  const deleteMaintenanceLog = async (logId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Delete this maintenance log?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteMaintenanceBackend(logId);
  };

  const isSynced = systemsSynced && productionSynced && maintenanceSynced;
  const isSaving = systemsSaving || productionSaving || maintenanceSaving;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.solarPanelMonitor', 'Solar Panel Monitor')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.solarPanel.trackSolarEnergyProductionAnd', 'Track solar energy production and system performance')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="solar-panel" toolName="Solar Panel" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={systemsLastSaved || productionLastSaved}
                syncError={systemsSyncError || productionSyncError}
                onForceSync={() => { forceSystemsSync(); forceProductionSync(); forceMaintenanceSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredProductionLogs, PRODUCTION_COLUMNS, 'solar-production')}
                onExportExcel={() => exportToExcel(filteredProductionLogs, PRODUCTION_COLUMNS, 'solar-production')}
                onExportJSON={() => exportToJSON({ systems, productionLogs, maintenanceLogs }, 'solar-data')}
                onExportPDF={() => exportToPDF(filteredProductionLogs, PRODUCTION_COLUMNS, 'Solar Production Report')}
                onCopy={() => copyUtil(filteredProductionLogs, PRODUCTION_COLUMNS)}
                onPrint={() => printData(filteredProductionLogs, PRODUCTION_COLUMNS, 'Solar Production Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['dashboard', 'production', 'maintenance', 'systems'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* System Selector */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={selectedSystemId}
                onChange={(e) => setSelectedSystemId(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">{t('tools.solarPanel.allSystems', 'All Systems')}</option>
                {systems.map(system => (
                  <option key={system.id} value={system.id}>{system.name}</option>
                ))}
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="week">{t('tools.solarPanel.last7Days', 'Last 7 Days')}</option>
                <option value="month">{t('tools.solarPanel.last30Days', 'Last 30 Days')}</option>
                <option value="year">{t('tools.solarPanel.lastYear', 'Last Year')}</option>
                <option value="all">{t('tools.solarPanel.allTime', 'All Time')}</option>
              </select>
            </div>
            {systems.length === 0 && (
              <button
                onClick={() => { setActiveTab('systems'); setShowSystemForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.solarPanel.addSystem', 'Add System')}
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.solarPanel.totalProduction', 'Total Production')}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(stats.totalProduction, 0)} kWh
                </p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.solarPanel.estSavings', 'Est. Savings')}
                  </span>
                </div>
                <p className={`text-2xl font-bold text-green-500`}>
                  {formatCurrency(stats.estimatedSavings)}
                </p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.solarPanel.avgDaily', 'Avg. Daily')}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(stats.avgDailyProduction)} kWh
                </p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Leaf className="w-5 h-5 text-green-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.solarPanel.co2Offset', 'CO2 Offset')}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(stats.co2Offset, 0)} kg
                </p>
              </div>
            </div>

            {/* Energy Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.energyDistribution', 'Energy Distribution')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.solarPanel.selfConsumption', 'Self Consumption')}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(stats.totalSelfUse, 0)} kWh
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.totalProduction > 0 ? (stats.totalSelfUse / stats.totalProduction) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.solarPanel.gridExport', 'Grid Export')}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(stats.totalExport, 0)} kWh
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.totalProduction > 0 ? (stats.totalExport / stats.totalProduction) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.systemPerformance', 'System Performance')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.solarPanel.capacityFactor', 'Capacity Factor')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(stats.capacityFactor)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.solarPanel.peakProduction', 'Peak Production')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(stats.peakProduction)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.solarPanel.totalSystems', 'Total Systems')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {systems.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.solarPanel.totalCapacity', 'Total Capacity')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(systems.reduce((acc, s) => acc + s.installedCapacity, 0))} kW
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Production */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.recentProduction', 'Recent Production')}
                </h3>
                <button
                  onClick={() => setActiveTab('production')}
                  className="text-[#0D9488] hover:underline text-sm"
                >
                  {t('tools.solarPanel.viewAll', 'View All')}
                </button>
              </div>

              {filteredProductionLogs.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Sun className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.solarPanel.noProductionDataRecordedYet', 'No production data recorded yet')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProductionLogs.slice(0, 5).map((log) => {
                    const system = systems.find(s => s.id === log.systemId);
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatNumber(log.energyProduced)} kWh
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(log.date)} - {system?.name || 'Unknown'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CloudSun className="w-4 h-4 text-yellow-500" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.weatherCondition}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.solarPanel.productionLogs', 'Production Logs')}
              </h2>
              <button
                onClick={() => { setNewProduction({ ...newProduction, systemId: selectedSystemId }); setShowProductionForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                disabled={systems.length === 0}
              >
                <Plus className="w-4 h-4" />
                {t('tools.solarPanel.addLog', 'Add Log')}
              </button>
            </div>

            {/* Add Production Form */}
            {showProductionForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.addProductionLog', 'Add Production Log')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={newProduction.systemId}
                    onChange={(e) => setNewProduction({ ...newProduction, systemId: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.solarPanel.selectSystem', 'Select System')}</option>
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newProduction.date}
                    onChange={(e) => setNewProduction({ ...newProduction, date: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.energyProducedKwh', 'Energy Produced (kWh)')}
                    value={newProduction.energyProduced || ''}
                    onChange={(e) => setNewProduction({ ...newProduction, energyProduced: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.peakPowerKw', 'Peak Power (kW)')}
                    value={newProduction.peakPower || ''}
                    onChange={(e) => setNewProduction({ ...newProduction, peakPower: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.gridExportKwh', 'Grid Export (kWh)')}
                    value={newProduction.gridExport || ''}
                    onChange={(e) => setNewProduction({ ...newProduction, gridExport: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.selfConsumptionKwh', 'Self Consumption (kWh)')}
                    value={newProduction.selfConsumption || ''}
                    onChange={(e) => setNewProduction({ ...newProduction, selfConsumption: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={newProduction.weatherCondition}
                    onChange={(e) => setNewProduction({ ...newProduction, weatherCondition: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {WEATHER_CONDITIONS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.sunlightHours', 'Sunlight Hours')}
                    value={newProduction.hoursOfSunlight || ''}
                    onChange={(e) => setNewProduction({ ...newProduction, hoursOfSunlight: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowProductionForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.solarPanel.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addProductionLog}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.solarPanel.addLog2', 'Add Log')}
                  </button>
                </div>
              </div>
            )}

            {/* Production Logs List */}
            {filteredProductionLogs.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Sun className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.solarPanel.noProductionLogsRecorded', 'No production logs recorded')}</p>
                <p className="text-sm mt-2">{t('tools.solarPanel.startLoggingYourSolarProduction', 'Start logging your solar production')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProductionLogs.map((log) => {
                  const system = systems.find(s => s.id === log.systemId);
                  return (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Sun className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatNumber(log.energyProduced)} kWh
                              </span>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                - {system?.name}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(log.date)} | {log.weatherCondition} | Peak: {formatNumber(log.peakPower)} kW
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Export: {formatNumber(log.gridExport)} kWh
                            </p>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Self-use: {formatNumber(log.selfConsumption)} kWh
                            </p>
                          </div>
                          <button
                            onClick={() => deleteProductionLog(log.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.solarPanel.maintenanceHistory', 'Maintenance History')}
              </h2>
              <button
                onClick={() => { setNewMaintenance({ ...newMaintenance, systemId: selectedSystemId }); setShowMaintenanceForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                disabled={systems.length === 0}
              >
                <Plus className="w-4 h-4" />
                {t('tools.solarPanel.addMaintenance', 'Add Maintenance')}
              </button>
            </div>

            {/* Add Maintenance Form */}
            {showMaintenanceForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.addMaintenanceLog', 'Add Maintenance Log')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newMaintenance.systemId}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, systemId: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.solarPanel.selectSystem2', 'Select System')}</option>
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newMaintenance.date}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={newMaintenance.type}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as MaintenanceLog['type'] })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {Object.entries(MAINTENANCE_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.solarPanel.description', 'Description')}
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    className={`px-3 py-2 rounded-lg border md:col-span-2 ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.cost', 'Cost ($)')}
                    value={newMaintenance.cost || ''}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.solarPanel.performedBy', 'Performed By')}
                    value={newMaintenance.performedBy}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    placeholder={t('tools.solarPanel.nextScheduled', 'Next Scheduled')}
                    value={newMaintenance.nextScheduled || ''}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, nextScheduled: e.target.value || null })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowMaintenanceForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.solarPanel.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addMaintenanceLog}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.solarPanel.addLog3', 'Add Log')}
                  </button>
                </div>
              </div>
            )}

            {/* Maintenance Logs List */}
            {maintenanceLogs.filter(l => !selectedSystemId || l.systemId === selectedSystemId).length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.solarPanel.noMaintenanceLogsRecorded', 'No maintenance logs recorded')}</p>
                <p className="text-sm mt-2">{t('tools.solarPanel.keepTrackOfInspectionsAnd', 'Keep track of inspections and repairs')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceLogs
                  .filter(l => !selectedSystemId || l.systemId === selectedSystemId)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log) => {
                    const system = systems.find(s => s.id === log.systemId);
                    const typeConfig = MAINTENANCE_TYPES[log.type];

                    return (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${typeConfig.color} bg-opacity-10`}>
                                {typeConfig.label}
                              </span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {log.description}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(log.date)} - {system?.name} | By: {log.performedBy || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {log.cost > 0 && (
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(log.cost)}
                              </span>
                            )}
                            <button
                              onClick={() => deleteMaintenanceLog(log.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Systems Tab */}
        {activeTab === 'systems' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.solarPanel.solarSystems', 'Solar Systems')}
              </h2>
              <button
                onClick={() => setShowSystemForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.solarPanel.addSystem2', 'Add System')}
              </button>
            </div>

            {/* Add System Form */}
            {showSystemForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.solarPanel.addSolarSystem', 'Add Solar System')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.solarPanel.systemName', 'System Name')}
                    value={newSystem.name}
                    onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.solarPanel.location', 'Location')}
                    value={newSystem.location}
                    onChange={(e) => setNewSystem({ ...newSystem, location: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.capacityKw', 'Capacity (kW)')}
                    value={newSystem.installedCapacity || ''}
                    onChange={(e) => setNewSystem({ ...newSystem, installedCapacity: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.numberOfPanels', 'Number of Panels')}
                    value={newSystem.panelCount || ''}
                    onChange={(e) => setNewSystem({ ...newSystem, panelCount: parseInt(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.solarPanel.panelTypeModel', 'Panel Type/Model')}
                    value={newSystem.panelType}
                    onChange={(e) => setNewSystem({ ...newSystem, panelType: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.solarPanel.inverterType', 'Inverter Type')}
                    value={newSystem.inverterType}
                    onChange={(e) => setNewSystem({ ...newSystem, inverterType: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    placeholder={t('tools.solarPanel.installationDate', 'Installation Date')}
                    value={newSystem.installationDate}
                    onChange={(e) => setNewSystem({ ...newSystem, installationDate: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={newSystem.orientation}
                    onChange={(e) => setNewSystem({ ...newSystem, orientation: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="South">{t('tools.solarPanel.south', 'South')}</option>
                    <option value="Southwest">{t('tools.solarPanel.southwest', 'Southwest')}</option>
                    <option value="Southeast">{t('tools.solarPanel.southeast', 'Southeast')}</option>
                    <option value="East">{t('tools.solarPanel.east', 'East')}</option>
                    <option value="West">{t('tools.solarPanel.west', 'West')}</option>
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.solarPanel.tiltAngleDegrees', 'Tilt Angle (degrees)')}
                    value={newSystem.tiltAngle || ''}
                    onChange={(e) => setNewSystem({ ...newSystem, tiltAngle: parseInt(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowSystemForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.solarPanel.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={addSystem}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.solarPanel.addSystem3', 'Add System')}
                  </button>
                </div>
              </div>
            )}

            {/* Systems List */}
            {systems.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Sun className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.solarPanel.noSolarSystemsConfigured', 'No solar systems configured')}</p>
                <p className="text-sm mt-2">{t('tools.solarPanel.addYourSolarInstallationTo', 'Add your solar installation to start tracking')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systems.map((system) => {
                  const statusConfig = SYSTEM_STATUS_CONFIG[system.status];
                  const StatusIcon = statusConfig.icon;
                  const systemProduction = productionLogs.filter(l => l.systemId === system.id);
                  const totalProduction = systemProduction.reduce((acc, l) => acc + l.energyProduced, 0);

                  return (
                    <div
                      key={system.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Sun className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {system.name}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {system.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          <button
                            onClick={() => deleteSystem(system.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className={`grid grid-cols-2 gap-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div>
                          <span className="block text-xs opacity-75">{t('tools.solarPanel.capacity', 'Capacity')}</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {system.installedCapacity} kW
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs opacity-75">{t('tools.solarPanel.panels', 'Panels')}</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {system.panelCount}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs opacity-75">{t('tools.solarPanel.installed', 'Installed')}</span>
                          <span>{formatDate(system.installationDate)}</span>
                        </div>
                        <div>
                          <span className="block text-xs opacity-75">{t('tools.solarPanel.totalOutput', 'Total Output')}</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(totalProduction, 0)} kWh
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default SolarPanelTool;
