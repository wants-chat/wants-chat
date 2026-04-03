'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  ZapOff,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  FileText,
  TrendingUp,
  BarChart3,
  Bell,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface OutageTrackerToolProps {
  uiConfig?: UIConfig;
}

type OutageStatus = 'active' | 'reported' | 'investigating' | 'resolved';
type OutageType = 'planned' | 'unplanned' | 'emergency';
type UtilityType = 'electric' | 'gas' | 'water' | 'internet';

interface PowerOutage {
  id: string;
  utilityType: UtilityType;
  outageType: OutageType;
  status: OutageStatus;
  startTime: string;
  endTime: string | null;
  estimatedRestoration: string | null;
  location: string;
  address: string;
  affectedArea: string;
  cause: string;
  utilityProvider: string;
  reportNumber: string;
  contactPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface UtilityProvider {
  id: string;
  name: string;
  type: UtilityType;
  phone: string;
  website: string;
  outageHotline: string;
  accountNumber: string;
}

const UTILITY_TYPE_CONFIG = {
  electric: {
    label: 'Electric',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  gas: {
    label: 'Gas',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  water: {
    label: 'Water',
    icon: AlertTriangle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  internet: {
    label: 'Internet',
    icon: AlertTriangle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
};

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  reported: {
    label: 'Reported',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  investigating: {
    label: 'Investigating',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
};

const OUTAGE_TYPE_CONFIG = {
  planned: {
    label: 'Planned',
    color: 'text-blue-500',
  },
  unplanned: {
    label: 'Unplanned',
    color: 'text-orange-500',
  },
  emergency: {
    label: 'Emergency',
    color: 'text-red-500',
  },
};

// Column configurations for exports
const OUTAGE_COLUMNS: ColumnConfig[] = [
  { key: 'utilityType', header: 'Utility', type: 'string' },
  { key: 'outageType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'date' },
  { key: 'endTime', header: 'End Time', type: 'date' },
  { key: 'estimatedRestoration', header: 'Est. Restoration', type: 'date' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'cause', header: 'Cause', type: 'string' },
  { key: 'utilityProvider', header: 'Provider', type: 'string' },
  { key: 'reportNumber', header: 'Report #', type: 'string' },
];

const PROVIDER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Provider Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'outageHotline', header: 'Outage Hotline', type: 'string' },
  { key: 'accountNumber', header: 'Account #', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const calculateDuration = (start: string, end: string | null): string => {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const OutageTrackerTool: React.FC<OutageTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Local validation state
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: outages,
    addItem: addOutageToBackend,
    updateItem: updateOutageBackend,
    deleteItem: deleteOutageBackend,
    isSynced: outagesSynced,
    isSaving: outagesSaving,
    lastSaved: outagesLastSaved,
    syncError: outagesSyncError,
    forceSync: forceOutagesSync,
  } = useToolData<PowerOutage>('outage-tracker-outages', [], OUTAGE_COLUMNS);

  const {
    data: providers,
    addItem: addProviderToBackend,
    updateItem: updateProviderBackend,
    deleteItem: deleteProviderBackend,
    isSynced: providersSynced,
    isSaving: providersSaving,
    lastSaved: providersLastSaved,
    syncError: providersSyncError,
    forceSync: forceProvidersSync,
  } = useToolData<UtilityProvider>('outage-tracker-providers', [], PROVIDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'outages' | 'providers' | 'history'>('outages');
  const [showOutageForm, setShowOutageForm] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OutageStatus | 'all'>('all');
  const [filterUtility, setFilterUtility] = useState<UtilityType | 'all'>('all');
  const [editingOutageId, setEditingOutageId] = useState<string | null>(null);

  // New outage form state
  const [newOutage, setNewOutage] = useState<Partial<PowerOutage>>({
    utilityType: 'electric',
    outageType: 'unplanned',
    status: 'active',
    startTime: new Date().toISOString().slice(0, 16),
    location: '',
    address: '',
    affectedArea: '',
    cause: '',
    utilityProvider: '',
    reportNumber: '',
    contactPhone: '',
    notes: '',
  });

  // New provider form state
  const [newProvider, setNewProvider] = useState<Partial<UtilityProvider>>({
    name: '',
    type: 'electric',
    phone: '',
    website: '',
    outageHotline: '',
    accountNumber: '',
  });

  // Add new outage
  const addOutage = () => {
    if (!newOutage.location) {
      setValidationMessage('Please enter a location');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const outage: PowerOutage = {
      id: generateId(),
      utilityType: newOutage.utilityType || 'electric',
      outageType: newOutage.outageType || 'unplanned',
      status: newOutage.status || 'active',
      startTime: newOutage.startTime || new Date().toISOString(),
      endTime: null,
      estimatedRestoration: newOutage.estimatedRestoration || null,
      location: newOutage.location || '',
      address: newOutage.address || '',
      affectedArea: newOutage.affectedArea || '',
      cause: newOutage.cause || '',
      utilityProvider: newOutage.utilityProvider || '',
      reportNumber: newOutage.reportNumber || '',
      contactPhone: newOutage.contactPhone || '',
      notes: newOutage.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOutageToBackend(outage);
    setShowOutageForm(false);
    setNewOutage({
      utilityType: 'electric',
      outageType: 'unplanned',
      status: 'active',
      startTime: new Date().toISOString().slice(0, 16),
      location: '',
      address: '',
      affectedArea: '',
      cause: '',
      utilityProvider: '',
      reportNumber: '',
      contactPhone: '',
      notes: '',
    });
  };

  // Update outage status
  const updateOutageStatus = (outageId: string, status: OutageStatus) => {
    const updates: Partial<PowerOutage> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'resolved') {
      updates.endTime = new Date().toISOString();
    }

    updateOutageBackend(outageId, updates);
  };

  // Delete outage
  const deleteOutage = async (outageId: string) => {
    const confirmed = await confirm({
      title: 'Delete Outage Record',
      message: 'Are you sure you want to delete this outage record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOutageBackend(outageId);
    }
  };

  // Add new provider
  const addProvider = () => {
    if (!newProvider.name) {
      setValidationMessage('Please enter a provider name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const provider: UtilityProvider = {
      id: generateId(),
      name: newProvider.name || '',
      type: newProvider.type || 'electric',
      phone: newProvider.phone || '',
      website: newProvider.website || '',
      outageHotline: newProvider.outageHotline || '',
      accountNumber: newProvider.accountNumber || '',
    };

    addProviderToBackend(provider);
    setShowProviderForm(false);
    setNewProvider({
      name: '',
      type: 'electric',
      phone: '',
      website: '',
      outageHotline: '',
      accountNumber: '',
    });
  };

  // Delete provider
  const deleteProvider = async (providerId: string) => {
    const confirmed = await confirm({
      title: 'Delete Provider',
      message: 'Are you sure you want to delete this provider?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProviderBackend(providerId);
    }
  };

  // Filtered outages
  const filteredOutages = useMemo(() => {
    let result = [...outages];

    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }

    if (filterUtility !== 'all') {
      result = result.filter(o => o.utilityType === filterUtility);
    }

    return result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [outages, filterStatus, filterUtility]);

  // Active outages
  const activeOutages = useMemo(() => {
    return outages.filter(o => o.status !== 'resolved');
  }, [outages]);

  // Statistics
  const stats = useMemo(() => {
    const resolved = outages.filter(o => o.status === 'resolved');
    const totalDowntime = resolved.reduce((acc, o) => {
      if (o.endTime) {
        const duration = new Date(o.endTime).getTime() - new Date(o.startTime).getTime();
        return acc + duration;
      }
      return acc;
    }, 0);

    const avgDowntimeMs = resolved.length > 0 ? totalDowntime / resolved.length : 0;
    const avgDowntimeHours = Math.floor(avgDowntimeMs / (1000 * 60 * 60));
    const avgDowntimeMinutes = Math.floor((avgDowntimeMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      total: outages.length,
      active: activeOutages.length,
      resolved: resolved.length,
      avgDowntime: avgDowntimeMs > 0 ? `${avgDowntimeHours}h ${avgDowntimeMinutes}m` : 'N/A',
    };
  }, [outages, activeOutages]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ZapOff className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.outageTracker.outageTracker', 'Outage Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.outageTracker.trackAndManageUtilityService', 'Track and manage utility service outages')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="outage-tracker" toolName="Outage Tracker" />

              <SyncStatus
                isSynced={outagesSynced && providersSynced}
                isSaving={outagesSaving || providersSaving}
                lastSaved={outagesLastSaved || providersLastSaved}
                syncError={outagesSyncError || providersSyncError}
                onForceSync={() => { forceOutagesSync(); forceProvidersSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(outages, OUTAGE_COLUMNS, 'outage-records')}
                onExportExcel={() => exportToExcel(outages, OUTAGE_COLUMNS, 'outage-records')}
                onExportJSON={() => exportToJSON(outages, 'outage-records')}
                onExportPDF={() => exportToPDF(outages, OUTAGE_COLUMNS, 'Outage Records')}
                onCopy={() => copyUtil(outages, OUTAGE_COLUMNS)}
                onPrint={() => printData(outages, OUTAGE_COLUMNS, 'Outage Records')}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['outages', 'providers', 'history'].map((tab) => (
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

        {/* Active Outage Alert */}
        {activeOutages.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 border-red-500 ${
            theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {activeOutages.length} Active Outage{activeOutages.length !== 1 ? 's' : ''}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activeOutages.map(o => UTILITY_TYPE_CONFIG[o.utilityType].label).join(', ')} service{activeOutages.length !== 1 ? 's' : ''} affected
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.outageTracker.totalOutages', 'Total Outages')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ZapOff className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.outageTracker.active', 'Active')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.outageTracker.resolved', 'Resolved')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.resolved}
                </p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.outageTracker.avgDuration', 'Avg. Duration')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.avgDowntime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Outages Tab */}
        {activeTab === 'outages' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as OutageStatus | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.outageTracker.allStatus', 'All Status')}</option>
                  <option value="active">{t('tools.outageTracker.active2', 'Active')}</option>
                  <option value="reported">{t('tools.outageTracker.reported', 'Reported')}</option>
                  <option value="investigating">{t('tools.outageTracker.investigating', 'Investigating')}</option>
                  <option value="resolved">{t('tools.outageTracker.resolved2', 'Resolved')}</option>
                </select>
                <select
                  value={filterUtility}
                  onChange={(e) => setFilterUtility(e.target.value as UtilityType | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.outageTracker.allUtilities', 'All Utilities')}</option>
                  <option value="electric">{t('tools.outageTracker.electric', 'Electric')}</option>
                  <option value="gas">{t('tools.outageTracker.gas', 'Gas')}</option>
                  <option value="water">{t('tools.outageTracker.water', 'Water')}</option>
                  <option value="internet">{t('tools.outageTracker.internet', 'Internet')}</option>
                </select>
              </div>
              <button
                onClick={() => setShowOutageForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.outageTracker.reportOutage', 'Report Outage')}
              </button>
            </div>

            {/* Add Outage Form */}
            {showOutageForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.outageTracker.reportNewOutage', 'Report New Outage')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newOutage.utilityType}
                    onChange={(e) => setNewOutage({ ...newOutage, utilityType: e.target.value as UtilityType })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="electric">{t('tools.outageTracker.electric2', 'Electric')}</option>
                    <option value="gas">{t('tools.outageTracker.gas2', 'Gas')}</option>
                    <option value="water">{t('tools.outageTracker.water2', 'Water')}</option>
                    <option value="internet">{t('tools.outageTracker.internet2', 'Internet')}</option>
                  </select>
                  <select
                    value={newOutage.outageType}
                    onChange={(e) => setNewOutage({ ...newOutage, outageType: e.target.value as OutageType })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="unplanned">{t('tools.outageTracker.unplanned', 'Unplanned')}</option>
                    <option value="planned">{t('tools.outageTracker.planned', 'Planned')}</option>
                    <option value="emergency">{t('tools.outageTracker.emergency', 'Emergency')}</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={newOutage.startTime}
                    onChange={(e) => setNewOutage({ ...newOutage, startTime: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.locationArea', 'Location / Area')}
                    value={newOutage.location}
                    onChange={(e) => setNewOutage({ ...newOutage, location: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.address', 'Address')}
                    value={newOutage.address}
                    onChange={(e) => setNewOutage({ ...newOutage, address: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.causeIfKnown', 'Cause (if known)')}
                    value={newOutage.cause}
                    onChange={(e) => setNewOutage({ ...newOutage, cause: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.utilityProvider', 'Utility Provider')}
                    value={newOutage.utilityProvider}
                    onChange={(e) => setNewOutage({ ...newOutage, utilityProvider: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.reportNumber', 'Report Number')}
                    value={newOutage.reportNumber}
                    onChange={(e) => setNewOutage({ ...newOutage, reportNumber: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.contactPhone', 'Contact Phone')}
                    value={newOutage.contactPhone}
                    onChange={(e) => setNewOutage({ ...newOutage, contactPhone: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="mt-4">
                  <textarea
                    placeholder={t('tools.outageTracker.additionalNotes', 'Additional notes...')}
                    value={newOutage.notes}
                    onChange={(e) => setNewOutage({ ...newOutage, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowOutageForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.outageTracker.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addOutage}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.outageTracker.reportOutage2', 'Report Outage')}
                  </button>
                </div>
              </div>
            )}

            {/* Outages List */}
            {filteredOutages.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.outageTracker.noOutagesRecorded', 'No outages recorded')}</p>
                <p className="text-sm mt-2">{t('tools.outageTracker.reportAnOutageWhenYour', 'Report an outage when your utility service is interrupted')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOutages.map((outage) => {
                  const utilityConfig = UTILITY_TYPE_CONFIG[outage.utilityType];
                  const statusConfig = STATUS_CONFIG[outage.status];
                  const typeConfig = OUTAGE_TYPE_CONFIG[outage.outageType];
                  const UtilityIcon = utilityConfig.icon;

                  return (
                    <div
                      key={outage.id}
                      className={`p-4 rounded-lg border ${
                        outage.status === 'active'
                          ? theme === 'dark'
                            ? 'bg-red-900/10 border-red-500/30'
                            : 'bg-red-50 border-red-200'
                          : theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${utilityConfig.bgColor}`}>
                            <UtilityIcon className={`w-5 h-5 ${utilityConfig.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {utilityConfig.label} Outage
                              </h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                              <span className={`text-xs ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <MapPin className="w-4 h-4" />
                                {outage.location}
                              </span>
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Clock className="w-4 h-4" />
                                {formatDateTime(outage.startTime)}
                              </span>
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Duration: {calculateDuration(outage.startTime, outage.endTime)}
                              </span>
                            </div>
                            {outage.cause && (
                              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Cause: {outage.cause}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {outage.status !== 'resolved' && (
                            <select
                              value={outage.status}
                              onChange={(e) => updateOutageStatus(outage.id, e.target.value as OutageStatus)}
                              className={`px-2 py-1 text-sm rounded border ${
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="active">{t('tools.outageTracker.active3', 'Active')}</option>
                              <option value="reported">{t('tools.outageTracker.reported2', 'Reported')}</option>
                              <option value="investigating">{t('tools.outageTracker.investigating2', 'Investigating')}</option>
                              <option value="resolved">{t('tools.outageTracker.resolved3', 'Resolved')}</option>
                            </select>
                          )}
                          <button
                            onClick={() => deleteOutage(outage.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {(outage.utilityProvider || outage.reportNumber || outage.notes) && (
                        <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {outage.utilityProvider && (
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                Provider: {outage.utilityProvider}
                              </span>
                            )}
                            {outage.reportNumber && (
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                Report #: {outage.reportNumber}
                              </span>
                            )}
                          </div>
                          {outage.notes && (
                            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {outage.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.outageTracker.utilityProviders', 'Utility Providers')}
              </h2>
              <button
                onClick={() => setShowProviderForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.outageTracker.addProvider', 'Add Provider')}
              </button>
            </div>

            {/* Add Provider Form */}
            {showProviderForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.outageTracker.addUtilityProvider', 'Add Utility Provider')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.providerName', 'Provider Name')}
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={newProvider.type}
                    onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as UtilityType })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="electric">{t('tools.outageTracker.electric3', 'Electric')}</option>
                    <option value="gas">{t('tools.outageTracker.gas3', 'Gas')}</option>
                    <option value="water">{t('tools.outageTracker.water3', 'Water')}</option>
                    <option value="internet">{t('tools.outageTracker.internet3', 'Internet')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.phoneNumber', 'Phone Number')}
                    value={newProvider.phone}
                    onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.outageHotline', 'Outage Hotline')}
                    value={newProvider.outageHotline}
                    onChange={(e) => setNewProvider({ ...newProvider, outageHotline: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.website', 'Website')}
                    value={newProvider.website}
                    onChange={(e) => setNewProvider({ ...newProvider, website: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.outageTracker.accountNumber', 'Account Number')}
                    value={newProvider.accountNumber}
                    onChange={(e) => setNewProvider({ ...newProvider, accountNumber: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowProviderForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.outageTracker.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addProvider}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.outageTracker.addProvider2', 'Add Provider')}
                  </button>
                </div>
              </div>
            )}

            {/* Providers List */}
            {providers.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.outageTracker.noProvidersConfigured', 'No providers configured')}</p>
                <p className="text-sm mt-2">{t('tools.outageTracker.addYourUtilityProvidersFor', 'Add your utility providers for quick access to contact info')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => {
                  const config = UTILITY_TYPE_CONFIG[provider.type];
                  const ProviderIcon = config.icon;

                  return (
                    <div
                      key={provider.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <ProviderIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {provider.name}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {config.label}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteProvider(provider.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {provider.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {provider.phone}
                          </p>
                        )}
                        {provider.outageHotline && (
                          <p className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Outage: {provider.outageHotline}
                          </p>
                        )}
                        {provider.accountNumber && <p>Account: {provider.accountNumber}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.outageTracker.outageHistory', 'Outage History')}
            </h2>

            {outages.filter(o => o.status === 'resolved').length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.outageTracker.noResolvedOutagesYet', 'No resolved outages yet')}</p>
                <p className="text-sm mt-2">{t('tools.outageTracker.resolvedOutagesWillAppearHere', 'Resolved outages will appear here')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outages
                  .filter(o => o.status === 'resolved')
                  .sort((a, b) => new Date(b.endTime || b.startTime).getTime() - new Date(a.endTime || a.startTime).getTime())
                  .map((outage) => {
                    const utilityConfig = UTILITY_TYPE_CONFIG[outage.utilityType];
                    const UtilityIcon = utilityConfig.icon;

                    return (
                      <div
                        key={outage.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${utilityConfig.bgColor}`}>
                              <UtilityIcon className={`w-4 h-4 ${utilityConfig.color}`} />
                            </div>
                            <div>
                              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {utilityConfig.label} - {outage.location}
                              </h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDateTime(outage.startTime)} - {outage.endTime ? formatDateTime(outage.endTime) : 'Ongoing'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {calculateDuration(outage.startTime, outage.endTime)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.outageTracker.duration', 'Duration')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default OutageTrackerTool;
