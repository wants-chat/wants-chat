'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Gauge,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Droplet,
  Flame,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Edit2,
  Save,
  X,
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

interface MeterReadingToolProps {
  uiConfig?: UIConfig;
}

type MeterType = 'electric' | 'gas' | 'water';

interface MeterReading {
  id: string;
  meterId: string;
  meterName: string;
  meterType: MeterType;
  reading: number;
  unit: string;
  date: string;
  notes: string;
  createdAt: string;
}

interface Meter {
  id: string;
  name: string;
  type: MeterType;
  unit: string;
  location: string;
  accountNumber: string;
  isActive: boolean;
  createdAt: string;
}

const METER_TYPE_CONFIG = {
  electric: {
    label: 'Electric',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    defaultUnit: 'kWh',
  },
  gas: {
    label: 'Gas',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    defaultUnit: 'therms',
  },
  water: {
    label: 'Water',
    icon: Droplet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    defaultUnit: 'gallons',
  },
};

const STORAGE_KEY = 'meter-reading-tool-data';

// Column configurations for exports
const METER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Meter Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'accountNumber', header: 'Account Number', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const READING_COLUMNS: ColumnConfig[] = [
  { key: 'meterName', header: 'Meter', type: 'string' },
  { key: 'meterType', header: 'Type', type: 'string' },
  { key: 'reading', header: 'Reading', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
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

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const MeterReadingTool: React.FC<MeterReadingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: meters,
    addItem: addMeterToBackend,
    updateItem: updateMeterBackend,
    deleteItem: deleteMeterBackend,
    isSynced: metersSynced,
    isSaving: metersSaving,
    lastSaved: metersLastSaved,
    syncError: metersSyncError,
    forceSync: forceMetersSync,
  } = useToolData<Meter>('meter-readings-meters', [], METER_COLUMNS);

  const {
    data: readings,
    addItem: addReadingToBackend,
    updateItem: updateReadingBackend,
    deleteItem: deleteReadingBackend,
    isSynced: readingsSynced,
    isSaving: readingsSaving,
    lastSaved: readingsLastSaved,
    syncError: readingsSyncError,
    forceSync: forceReadingsSync,
  } = useToolData<MeterReading>('meter-readings-data', [], READING_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'readings' | 'meters' | 'analytics'>('readings');
  const [showMeterForm, setShowMeterForm] = useState(false);
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [selectedMeterId, setSelectedMeterId] = useState<string>('');
  const [editingMeterId, setEditingMeterId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<MeterType | 'all'>('all');

  // New meter form state
  const [newMeter, setNewMeter] = useState<Partial<Meter>>({
    name: '',
    type: 'electric',
    unit: 'kWh',
    location: '',
    accountNumber: '',
    isActive: true,
  });

  // New reading form state
  const [newReading, setNewReading] = useState<Partial<MeterReading>>({
    meterId: '',
    reading: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Add new meter
  const addMeter = () => {
    if (!newMeter.name) {
      setValidationMessage('Please enter a meter name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const meter: Meter = {
      id: generateId(),
      name: newMeter.name || '',
      type: newMeter.type || 'electric',
      unit: newMeter.unit || METER_TYPE_CONFIG[newMeter.type || 'electric'].defaultUnit,
      location: newMeter.location || '',
      accountNumber: newMeter.accountNumber || '',
      isActive: newMeter.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    addMeterToBackend(meter);
    setShowMeterForm(false);
    setNewMeter({
      name: '',
      type: 'electric',
      unit: 'kWh',
      location: '',
      accountNumber: '',
      isActive: true,
    });
  };

  // Update meter
  const updateMeter = (meterId: string, updates: Partial<Meter>) => {
    updateMeterBackend(meterId, updates);
    setEditingMeterId(null);
  };

  // Delete meter
  const deleteMeter = async (meterId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this meter? All associated readings will also be deleted.',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteMeterBackend(meterId);
    // Delete associated readings
    readings.forEach(reading => {
      if (reading.meterId === meterId) {
        deleteReadingBackend(reading.id);
      }
    });
  };

  // Add new reading
  const addReading = () => {
    if (!newReading.meterId) {
      setValidationMessage('Please select a meter');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const meter = meters.find(m => m.id === newReading.meterId);
    if (!meter) return;

    const reading: MeterReading = {
      id: generateId(),
      meterId: newReading.meterId || '',
      meterName: meter.name,
      meterType: meter.type,
      reading: newReading.reading || 0,
      unit: meter.unit,
      date: newReading.date || new Date().toISOString().split('T')[0],
      notes: newReading.notes || '',
      createdAt: new Date().toISOString(),
    };

    addReadingToBackend(reading);
    setShowReadingForm(false);
    setNewReading({
      meterId: '',
      reading: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  // Delete reading
  const deleteReading = async (readingId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this reading?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteReadingBackend(readingId);
  };

  // Calculate usage between readings
  const calculateUsage = (meterId: string): { usage: number; trend: 'up' | 'down' | 'same' } | null => {
    const meterReadings = readings
      .filter(r => r.meterId === meterId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (meterReadings.length < 2) return null;

    const latest = meterReadings[0].reading;
    const previous = meterReadings[1].reading;
    const usage = latest - previous;

    let trend: 'up' | 'down' | 'same' = 'same';
    if (meterReadings.length >= 3) {
      const prevUsage = meterReadings[1].reading - meterReadings[2].reading;
      if (usage > prevUsage) trend = 'up';
      else if (usage < prevUsage) trend = 'down';
    }

    return { usage, trend };
  };

  // Filtered readings
  const filteredReadings = useMemo(() => {
    let result = [...readings];

    if (filterType !== 'all') {
      result = result.filter(r => r.meterType === filterType);
    }

    if (selectedMeterId) {
      result = result.filter(r => r.meterId === selectedMeterId);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [readings, filterType, selectedMeterId]);

  // Analytics data
  const analytics = useMemo(() => {
    const byType: Record<MeterType, { total: number; avgUsage: number; count: number }> = {
      electric: { total: 0, avgUsage: 0, count: 0 },
      gas: { total: 0, avgUsage: 0, count: 0 },
      water: { total: 0, avgUsage: 0, count: 0 },
    };

    meters.forEach(meter => {
      const meterReadings = readings
        .filter(r => r.meterId === meter.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (meterReadings.length >= 2) {
        let totalUsage = 0;
        for (let i = 1; i < meterReadings.length; i++) {
          totalUsage += meterReadings[i].reading - meterReadings[i - 1].reading;
        }
        byType[meter.type].total += totalUsage;
        byType[meter.type].count += meterReadings.length - 1;
      }
    });

    Object.keys(byType).forEach(type => {
      const t = type as MeterType;
      if (byType[t].count > 0) {
        byType[t].avgUsage = byType[t].total / byType[t].count;
      }
    });

    return byType;
  }, [meters, readings]);

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.meterReading.meterReadingTool', 'Meter Reading Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.meterReading.trackUtilityMeterReadingsAnd', 'Track utility meter readings and monitor consumption')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="meter-reading" toolName="Meter Reading" />

              <SyncStatus
                isSynced={readingsSynced && metersSynced}
                isSaving={readingsSaving || metersSaving}
                lastSaved={readingsLastSaved || metersLastSaved}
                syncError={readingsSyncError || metersSyncError}
                onForceSync={() => { forceReadingsSync(); forceMetersSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(readings, READING_COLUMNS, 'meter-readings')}
                onExportExcel={() => exportToExcel(readings, READING_COLUMNS, 'meter-readings')}
                onExportJSON={() => exportToJSON(readings, 'meter-readings')}
                onExportPDF={() => exportToPDF(readings, READING_COLUMNS, 'Meter Readings')}
                onCopy={() => copyUtil(readings, READING_COLUMNS)}
                onPrint={() => printData(readings, READING_COLUMNS, 'Meter Readings')}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['readings', 'meters', 'analytics'].map((tab) => (
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(METER_TYPE_CONFIG).map(([type, config]) => {
            const TypeIcon = config.icon;
            const activeMeters = meters.filter(m => m.type === type && m.isActive).length;
            const totalReadings = readings.filter(r => r.meterType === type).length;

            return (
              <div
                key={type}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <TypeIcon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {config.label}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activeMeters} active meter{activeMeters !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {totalReadings} total readings
                </div>
              </div>
            );
          })}
        </div>

        {/* Readings Tab */}
        {activeTab === 'readings' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as MeterType | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.meterReading.allTypes', 'All Types')}</option>
                  <option value="electric">{t('tools.meterReading.electric', 'Electric')}</option>
                  <option value="gas">{t('tools.meterReading.gas', 'Gas')}</option>
                  <option value="water">{t('tools.meterReading.water', 'Water')}</option>
                </select>
                <select
                  value={selectedMeterId}
                  onChange={(e) => setSelectedMeterId(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.meterReading.allMeters', 'All Meters')}</option>
                  {meters.filter(m => m.isActive).map(meter => (
                    <option key={meter.id} value={meter.id}>{meter.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowReadingForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.meterReading.addReading', 'Add Reading')}
              </button>
            </div>

            {/* Add Reading Form */}
            {showReadingForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.meterReading.newReading', 'New Reading')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={newReading.meterId}
                    onChange={(e) => setNewReading({ ...newReading, meterId: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.meterReading.selectMeter', 'Select Meter')}</option>
                    {meters.filter(m => m.isActive).map(meter => (
                      <option key={meter.id} value={meter.id}>{meter.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.meterReading.readingValue', 'Reading value')}
                    value={newReading.reading || ''}
                    onChange={(e) => setNewReading({ ...newReading, reading: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    value={newReading.date}
                    onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.meterReading.notesOptional', 'Notes (optional)')}
                    value={newReading.notes}
                    onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowReadingForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.meterReading.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addReading}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.meterReading.saveReading', 'Save Reading')}
                  </button>
                </div>
              </div>
            )}

            {/* Readings List */}
            {filteredReadings.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.meterReading.noReadingsRecordedYet', 'No readings recorded yet')}</p>
                <p className="text-sm mt-2">{t('tools.meterReading.addAMeterFirstThen', 'Add a meter first, then start recording readings')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReadings.map((reading) => {
                  const config = METER_TYPE_CONFIG[reading.meterType];
                  const TypeIcon = config.icon;

                  return (
                    <div
                      key={reading.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <TypeIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {reading.meterName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {formatDate(reading.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatNumber(reading.reading)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {reading.unit}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteReading(reading.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {reading.notes && (
                        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {reading.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Meters Tab */}
        {activeTab === 'meters' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.meterReading.manageMeters', 'Manage Meters')}
              </h2>
              <button
                onClick={() => setShowMeterForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.meterReading.addMeter', 'Add Meter')}
              </button>
            </div>

            {/* Add Meter Form */}
            {showMeterForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.meterReading.newMeter', 'New Meter')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.meterReading.meterName', 'Meter Name')}
                    value={newMeter.name}
                    onChange={(e) => setNewMeter({ ...newMeter, name: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={newMeter.type}
                    onChange={(e) => {
                      const type = e.target.value as MeterType;
                      setNewMeter({
                        ...newMeter,
                        type,
                        unit: METER_TYPE_CONFIG[type].defaultUnit
                      });
                    }}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="electric">{t('tools.meterReading.electric2', 'Electric')}</option>
                    <option value="gas">{t('tools.meterReading.gas2', 'Gas')}</option>
                    <option value="water">{t('tools.meterReading.water2', 'Water')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.meterReading.unitEGKwh', 'Unit (e.g., kWh)')}
                    value={newMeter.unit}
                    onChange={(e) => setNewMeter({ ...newMeter, unit: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.meterReading.location', 'Location')}
                    value={newMeter.location}
                    onChange={(e) => setNewMeter({ ...newMeter, location: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.meterReading.accountNumber', 'Account Number')}
                    value={newMeter.accountNumber}
                    onChange={(e) => setNewMeter({ ...newMeter, accountNumber: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowMeterForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.meterReading.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addMeter}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.meterReading.addMeter2', 'Add Meter')}
                  </button>
                </div>
              </div>
            )}

            {/* Meters List */}
            {meters.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.meterReading.noMetersConfiguredYet', 'No meters configured yet')}</p>
                <p className="text-sm mt-2">{t('tools.meterReading.addYourUtilityMetersTo', 'Add your utility meters to start tracking')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meters.map((meter) => {
                  const config = METER_TYPE_CONFIG[meter.type];
                  const TypeIcon = config.icon;
                  const usageData = calculateUsage(meter.id);
                  const readingCount = readings.filter(r => r.meterId === meter.id).length;

                  return (
                    <div
                      key={meter.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <TypeIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {meter.name}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {config.label} - {meter.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            meter.isActive
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {meter.isActive ? t('tools.meterReading.active', 'Active') : t('tools.meterReading.inactive', 'Inactive')}
                          </span>
                          <button
                            onClick={() => deleteMeter(meter.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {meter.location && <p>Location: {meter.location}</p>}
                        {meter.accountNumber && <p>Account: {meter.accountNumber}</p>}
                        <p>{readingCount} reading{readingCount !== 1 ? 's' : ''} recorded</p>
                      </div>

                      {usageData && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last usage: {formatNumber(usageData.usage)} {meter.unit}
                          </span>
                          {usageData.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                          {usageData.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.meterReading.usageAnalytics', 'Usage Analytics')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(METER_TYPE_CONFIG).map(([type, config]) => {
                const TypeIcon = config.icon;
                const data = analytics[type as MeterType];

                return (
                  <div
                    key={type}
                    className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${config.bgColor}`}>
                        <TypeIcon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {config.label}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.meterReading.totalUsage', 'Total Usage')}
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(data.total)}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {config.defaultUnit}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.meterReading.averagePerPeriod', 'Average per Period')}
                        </p>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(data.avgUsage)} {config.defaultUnit}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {readings.length === 0 && (
              <div className={`text-center py-8 mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.meterReading.noDataAvailableForAnalysis', 'No data available for analysis')}</p>
                <p className="text-sm mt-2">{t('tools.meterReading.startRecordingMeterReadingsTo', 'Start recording meter readings to see usage analytics')}</p>
              </div>
            )}
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

export default MeterReadingTool;
