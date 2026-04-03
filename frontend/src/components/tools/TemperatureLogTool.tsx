'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Thermometer,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Check,
  Clock,
  ThermometerSnowflake,
  ThermometerSun,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface TemperatureLogToolProps {
  uiConfig?: UIConfig;
}

type EquipmentType = 'refrigerator' | 'freezer' | 'hot-holding' | 'cold-holding' | 'cooking' | 'receiving';

interface TemperatureReading {
  id: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  location: string;
  temperature: number;
  unit: 'F' | 'C';
  isCompliant: boolean;
  recordedAt: string;
  recordedBy: string;
  correctionAction: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const EQUIPMENT_CONFIG: Record<EquipmentType, { label: string; minTemp: number; maxTemp: number; unit: 'F'; icon: any }> = {
  refrigerator: { label: 'Refrigerator', minTemp: 33, maxTemp: 40, unit: 'F', icon: ThermometerSnowflake },
  freezer: { label: 'Freezer', minTemp: -10, maxTemp: 0, unit: 'F', icon: ThermometerSnowflake },
  'hot-holding': { label: 'Hot Holding', minTemp: 135, maxTemp: 165, unit: 'F', icon: ThermometerSun },
  'cold-holding': { label: 'Cold Holding', minTemp: 33, maxTemp: 41, unit: 'F', icon: ThermometerSnowflake },
  cooking: { label: 'Cooking', minTemp: 145, maxTemp: 212, unit: 'F', icon: ThermometerSun },
  receiving: { label: 'Receiving', minTemp: 33, maxTemp: 41, unit: 'F', icon: Thermometer },
};

const LOCATIONS = ['Main Kitchen', 'Prep Area', 'Walk-in Cooler', 'Walk-in Freezer', 'Line', 'Storage', 'Receiving Dock'];

const TEMP_COLUMNS: ColumnConfig[] = [
  { key: 'equipmentName', header: 'Equipment', type: 'string' },
  { key: 'equipmentType', header: 'Type', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'temperature', header: 'Temperature', type: 'number' },
  { key: 'isCompliant', header: 'Compliant', type: 'boolean' },
  { key: 'recordedAt', header: 'Recorded At', type: 'string' },
  { key: 'recordedBy', header: 'Recorded By', type: 'string' },
];

export const TemperatureLogTool: React.FC<TemperatureLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: readings,
    setData: setReadings,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TemperatureReading>('temperature-log', [], TEMP_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingReading, setEditingReading] = useState<TemperatureReading | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showOnlyViolations, setShowOnlyViolations] = useState(false);

  const [newReading, setNewReading] = useState({
    equipmentName: '',
    equipmentType: 'refrigerator' as EquipmentType,
    location: 'Main Kitchen',
    temperature: 0,
    unit: 'F' as const,
    recordedBy: '',
    correctionAction: '',
    notes: '',
  });

  const checkCompliance = (temp: number, type: EquipmentType): boolean => {
    const config = EQUIPMENT_CONFIG[type];
    return temp >= config.minTemp && temp <= config.maxTemp;
  };

  const filteredReadings = useMemo(() => {
    return readings.filter((reading) => {
      const matchesType = selectedType === 'all' || reading.equipmentType === selectedType;
      const matchesViolation = !showOnlyViolations || !reading.isCompliant;
      return matchesType && matchesViolation;
    });
  }, [readings, selectedType, showOnlyViolations]);

  const stats = useMemo(() => {
    const total = readings.length;
    const compliant = readings.filter((r) => r.isCompliant).length;
    const violations = total - compliant;
    const todayReadings = readings.filter((r) => {
      const today = new Date().toDateString();
      return new Date(r.recordedAt).toDateString() === today;
    }).length;

    return { total, compliant, violations, todayReadings };
  }, [readings]);

  const handleAddReading = () => {
    if (!newReading.equipmentName || !newReading.temperature) return;

    const isCompliant = checkCompliance(newReading.temperature, newReading.equipmentType);

    const reading: TemperatureReading = {
      id: `temp-${Date.now()}`,
      equipmentName: newReading.equipmentName,
      equipmentType: newReading.equipmentType,
      location: newReading.location,
      temperature: newReading.temperature,
      unit: newReading.unit,
      isCompliant,
      recordedAt: new Date().toISOString(),
      recordedBy: newReading.recordedBy,
      correctionAction: isCompliant ? '' : newReading.correctionAction,
      notes: newReading.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(reading);
    setNewReading({
      equipmentName: newReading.equipmentName, // Keep equipment name for repeat readings
      equipmentType: newReading.equipmentType,
      location: newReading.location,
      temperature: 0,
      unit: 'F',
      recordedBy: newReading.recordedBy,
      correctionAction: '',
      notes: '',
    });
  };

  const handleUpdateReading = () => {
    if (!editingReading) return;

    const isCompliant = checkCompliance(editingReading.temperature, editingReading.equipmentType);

    updateItem(editingReading.id, {
      ...editingReading,
      isCompliant,
      updatedAt: new Date().toISOString(),
    });
    setEditingReading(null);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Clear Temperature Logs',
      message: 'Are you sure you want to clear all temperature logs? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setReadings([]);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const previewCompliance = useMemo(() => {
    if (!newReading.temperature) return null;
    return checkCompliance(newReading.temperature, newReading.equipmentType);
  }, [newReading.temperature, newReading.equipmentType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <Thermometer className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.temperatureLog.foodTemperatureLog', 'Food Temperature Log')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.temperatureLog.trackAndMonitorFoodSafety', 'Track and monitor food safety temperatures')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="temperature-log" toolName="Temperature Log" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'temperature-log' })}
                  onExportExcel={() => exportExcel({ filename: 'temperature-log' })}
                  onExportJSON={() => exportJSON({ filename: 'temperature-log' })}
                  onExportPDF={() => exportPDF({
                    filename: 'temperature-log',
                    title: 'Food Temperature Log',
                    subtitle: `${readings.length} readings`,
                  })}
                  onPrint={() => print('Food Temperature Log')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={readings.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.temperatureLog.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.temperatureLog.totalReadings', 'Total Readings')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-green-500">{t('tools.temperatureLog.compliant', 'Compliant')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-red-500">{t('tools.temperatureLog.violations', 'Violations')}</div>
            <div className="text-2xl font-bold text-red-600">{stats.violations}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.temperatureLog.todaySReadings', 'Today\'s Readings')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayReadings}</div>
          </div>
        </div>

        {/* Temperature Guidelines */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.temperatureLog.temperatureGuidelinesF', 'Temperature Guidelines (°F)')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
              {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
                <div key={key} className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.label}</div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {config.minTemp}°F - {config.maxTemp}°F
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.temperatureLog.allEquipmentTypes', 'All Equipment Types')}</option>
                  {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyViolations}
                  onChange={(e) => setShowOnlyViolations(e.target.checked)}
                  className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.temperatureLog.showOnlyViolations', 'Show only violations')}
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Reading Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Plus className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.temperatureLog.logTemperature', 'Log Temperature')}
                </CardTitle>
                {showAddForm ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.temperatureLog.equipmentName', 'Equipment Name *')}
                  </label>
                  <input
                    type="text"
                    value={newReading.equipmentName}
                    onChange={(e) => setNewReading({ ...newReading, equipmentName: e.target.value })}
                    placeholder={t('tools.temperatureLog.eGWalkInCooler', 'e.g., Walk-in Cooler #1')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.temperatureLog.type', 'Type')}
                    </label>
                    <select
                      value={newReading.equipmentType}
                      onChange={(e) => setNewReading({ ...newReading, equipmentType: e.target.value as EquipmentType })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    >
                      {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.temperatureLog.location', 'Location')}
                    </label>
                    <select
                      value={newReading.location}
                      onChange={(e) => setNewReading({ ...newReading, location: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.temperatureLog.temperatureF', 'Temperature (°F) *')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newReading.temperature || ''}
                      onChange={(e) => setNewReading({ ...newReading, temperature: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      step="0.1"
                      className={`w-full px-4 py-2 pr-12 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg text-lg`}
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      °F
                    </span>
                  </div>
                  {/* Compliance Preview */}
                  {previewCompliance !== null && (
                    <div className={`mt-2 flex items-center gap-2 text-sm ${previewCompliance ? 'text-green-500' : 'text-red-500'}`}>
                      {previewCompliance ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Within safe range ({EQUIPMENT_CONFIG[newReading.equipmentType].minTemp}°F - {EQUIPMENT_CONFIG[newReading.equipmentType].maxTemp}°F)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          <span>Outside safe range! Required: {EQUIPMENT_CONFIG[newReading.equipmentType].minTemp}°F - {EQUIPMENT_CONFIG[newReading.equipmentType].maxTemp}°F</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.temperatureLog.recordedBy', 'Recorded By')}
                  </label>
                  <input
                    type="text"
                    value={newReading.recordedBy}
                    onChange={(e) => setNewReading({ ...newReading, recordedBy: e.target.value })}
                    placeholder={t('tools.temperatureLog.yourName', 'Your name')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                {previewCompliance === false && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 text-red-500`}>
                      {t('tools.temperatureLog.correctiveActionRequired', 'Corrective Action Required *')}
                    </label>
                    <textarea
                      value={newReading.correctionAction}
                      onChange={(e) => setNewReading({ ...newReading, correctionAction: e.target.value })}
                      placeholder={t('tools.temperatureLog.describeCorrectiveActionTaken', 'Describe corrective action taken...')}
                      rows={2}
                      className={`w-full px-4 py-2 border border-red-500 ${
                        isDark
                          ? 'bg-gray-700 text-white placeholder:text-gray-400'
                          : 'bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg resize-none`}
                    />
                  </div>
                )}
                <button
                  onClick={handleAddReading}
                  disabled={!newReading.equipmentName || !newReading.temperature}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Thermometer className="w-5 h-5" />
                  {t('tools.temperatureLog.logReading', 'Log Reading')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Readings List */}
          <div className="lg:col-span-2">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5 text-[#0D9488]" />
                  Temperature Log ({filteredReadings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredReadings.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.temperatureLog.noTemperatureReadings', 'No temperature readings')}</p>
                    <p className="text-sm mt-1">{t('tools.temperatureLog.logAReadingToGet', 'Log a reading to get started')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReadings
                      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                      .map((reading) => {
                        const config = EQUIPMENT_CONFIG[reading.equipmentType];
                        const Icon = config.icon;
                        return (
                          <div
                            key={reading.id}
                            className={`p-4 rounded-xl border ${
                              reading.isCompliant
                                ? isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon className={`w-5 h-5 ${reading.isCompliant ? t('tools.temperatureLog.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`} />
                                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {reading.equipmentName}
                                  </span>
                                  <span className={`text-2xl font-bold ${reading.isCompliant ? t('tools.temperatureLog.text0d94882', 'text-[#0D9488]') : 'text-red-500'}`}>
                                    {reading.temperature}°F
                                  </span>
                                  {reading.isCompliant ? (
                                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-600 dark:bg-green-900/30 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {t('tools.temperatureLog.compliant2', 'Compliant')}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600 dark:bg-red-900/30 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      {t('tools.temperatureLog.violation', 'Violation')}
                                    </span>
                                  )}
                                </div>
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <div>{config.label}</div>
                                  <div>{reading.location}</div>
                                  <div>{formatDateTime(reading.recordedAt)}</div>
                                  <div>{reading.recordedBy || 'N/A'}</div>
                                </div>
                                {!reading.isCompliant && reading.correctionAction && (
                                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-700 dark:text-red-400">
                                    <strong>{t('tools.temperatureLog.correctiveAction', 'Corrective Action:')}</strong> {reading.correctionAction}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingReading(reading)}
                                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteItem(reading.id)}
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog />

        {/* Edit Modal */}
        {editingReading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.temperatureLog.editReading', 'Edit Reading')}
                  </CardTitle>
                  <button onClick={() => setEditingReading(null)}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.temperatureLog.temperatureF2', 'Temperature (°F)')}
                  </label>
                  <input
                    type="number"
                    value={editingReading.temperature}
                    onChange={(e) => setEditingReading({ ...editingReading, temperature: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg text-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.temperatureLog.correctiveAction2', 'Corrective Action')}
                  </label>
                  <textarea
                    value={editingReading.correctionAction}
                    onChange={(e) => setEditingReading({ ...editingReading, correctionAction: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg resize-none`}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateReading}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {t('tools.temperatureLog.save', 'Save')}
                  </button>
                  <button
                    onClick={() => setEditingReading(null)}
                    className={`px-6 py-3 rounded-xl font-medium ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.temperatureLog.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemperatureLogTool;
