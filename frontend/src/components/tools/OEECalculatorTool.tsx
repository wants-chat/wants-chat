'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  CheckCircle2,
  Gauge,
  Target,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Interfaces
interface OEERecord {
  id: string;
  date: string;
  machine_id: string;
  machine_name: string;
  shift: 'day' | 'evening' | 'night' | 'all';
  // Availability inputs
  planned_production_time: number; // minutes
  actual_run_time: number; // minutes
  downtime: number; // minutes
  // Performance inputs
  ideal_cycle_time: number; // seconds per unit
  total_count: number; // units produced
  // Quality inputs
  good_count: number; // good units
  reject_count: number; // rejected units
  // Calculated metrics
  availability: number; // percentage
  performance: number; // percentage
  quality: number; // percentage
  oee: number; // percentage
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface OEECalculatorToolProps {
  uiConfig?: any;
}

// Column configuration for exports
const oeeColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'machine_name', header: 'Machine', type: 'string' },
  { key: 'shift', header: 'Shift', type: 'string' },
  { key: 'planned_production_time', header: 'Planned Time (min)', type: 'number' },
  { key: 'actual_run_time', header: 'Run Time (min)', type: 'number' },
  { key: 'total_count', header: 'Total Produced', type: 'number' },
  { key: 'good_count', header: 'Good Units', type: 'number' },
  { key: 'availability', header: 'Availability %', type: 'number' },
  { key: 'performance', header: 'Performance %', type: 'number' },
  { key: 'quality', header: 'Quality %', type: 'number' },
  { key: 'oee', header: 'OEE %', type: 'number' },
];

const shifts = [
  { value: 'day', label: 'Day Shift' },
  { value: 'evening', label: 'Evening Shift' },
  { value: 'night', label: 'Night Shift' },
  { value: 'all', label: 'All Shifts' },
];

// Generate sample data
const generateSampleData = (): OEERecord[] => {
  return [
    {
      id: 'oee-001',
      date: new Date().toISOString().split('T')[0],
      machine_id: 'CNC-001',
      machine_name: 'CNC Milling Machine #1',
      shift: 'day',
      planned_production_time: 480,
      actual_run_time: 420,
      downtime: 60,
      ideal_cycle_time: 30,
      total_count: 756,
      good_count: 740,
      reject_count: 16,
      availability: 87.5,
      performance: 90.0,
      quality: 97.9,
      oee: 77.1,
      notes: 'Minor setup delays',
      created_at: new Date().toISOString(),
    },
    {
      id: 'oee-002',
      date: new Date().toISOString().split('T')[0],
      machine_id: 'PRESS-002',
      machine_name: 'Hydraulic Press #2',
      shift: 'day',
      planned_production_time: 480,
      actual_run_time: 460,
      downtime: 20,
      ideal_cycle_time: 15,
      total_count: 1720,
      good_count: 1700,
      reject_count: 20,
      availability: 95.8,
      performance: 93.5,
      quality: 98.8,
      oee: 88.5,
      created_at: new Date().toISOString(),
    },
    {
      id: 'oee-003',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      machine_id: 'CNC-001',
      machine_name: 'CNC Milling Machine #1',
      shift: 'day',
      planned_production_time: 480,
      actual_run_time: 380,
      downtime: 100,
      ideal_cycle_time: 30,
      total_count: 680,
      good_count: 650,
      reject_count: 30,
      availability: 79.2,
      performance: 89.5,
      quality: 95.6,
      oee: 67.7,
      notes: 'Tool changeover issues',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate OEE metrics
const calculateOEE = (data: {
  planned_production_time: number;
  actual_run_time: number;
  ideal_cycle_time: number;
  total_count: number;
  good_count: number;
}) => {
  const availability = data.planned_production_time > 0
    ? (data.actual_run_time / data.planned_production_time) * 100
    : 0;

  const theoreticalMaxOutput = (data.actual_run_time * 60) / data.ideal_cycle_time;
  const performance = theoreticalMaxOutput > 0
    ? (data.total_count / theoreticalMaxOutput) * 100
    : 0;

  const quality = data.total_count > 0
    ? (data.good_count / data.total_count) * 100
    : 0;

  const oee = (availability * performance * quality) / 10000;

  return {
    availability: Math.round(availability * 10) / 10,
    performance: Math.round(performance * 10) / 10,
    quality: Math.round(quality * 10) / 10,
    oee: Math.round(oee * 10) / 10,
  };
};

export const OEECalculatorTool: React.FC<OEECalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use tool data hook for backend sync
  const {
    data: records,
    setData: setRecords,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<OEERecord>('oee-calculator', generateSampleData(), oeeColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'calculator'>('records');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OEERecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Calculator state
  const [calcData, setCalcData] = useState({
    planned_production_time: 480,
    actual_run_time: 0,
    ideal_cycle_time: 30,
    total_count: 0,
    good_count: 0,
  });
  const [calcResults, setCalcResults] = useState<ReturnType<typeof calculateOEE> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    machine_id: '',
    machine_name: '',
    shift: 'day' as OEERecord['shift'],
    planned_production_time: 480,
    actual_run_time: 0,
    downtime: 0,
    ideal_cycle_time: 30,
    total_count: 0,
    good_count: 0,
    reject_count: 0,
    notes: '',
  });

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchQuery ||
      record.machine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.machine_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = !filterShift || record.shift === filterShift;
    return matchesSearch && matchesShift;
  });

  // Stats
  const avgOEE = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.oee, 0) / records.length * 10) / 10
    : 0;
  const avgAvailability = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.availability, 0) / records.length * 10) / 10
    : 0;
  const avgPerformance = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.performance, 0) / records.length * 10) / 10
    : 0;
  const avgQuality = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.quality, 0) / records.length * 10) / 10
    : 0;

  // Handle calculator
  const handleCalculate = () => {
    const results = calculateOEE(calcData);
    setCalcResults(results);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const metrics = calculateOEE({
        planned_production_time: formData.planned_production_time,
        actual_run_time: formData.actual_run_time,
        ideal_cycle_time: formData.ideal_cycle_time,
        total_count: formData.total_count,
        good_count: formData.good_count,
      });

      const recordData = {
        ...formData,
        downtime: formData.planned_production_time - formData.actual_run_time,
        reject_count: formData.total_count - formData.good_count,
        ...metrics,
      };

      if (editingRecord) {
        updateItem(editingRecord.id, {
          ...recordData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newRecord: OEERecord = {
          id: generateId('oee'),
          ...recordData,
          created_at: new Date().toISOString(),
        };
        addItem(newRecord);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      machine_id: '',
      machine_name: '',
      shift: 'day',
      planned_production_time: 480,
      actual_run_time: 0,
      downtime: 0,
      ideal_cycle_time: 30,
      total_count: 0,
      good_count: 0,
      reject_count: 0,
      notes: '',
    });
    setEditingRecord(null);
  };

  const openEditModal = (record: OEERecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      machine_id: record.machine_id,
      machine_name: record.machine_name,
      shift: record.shift,
      planned_production_time: record.planned_production_time,
      actual_run_time: record.actual_run_time,
      downtime: record.downtime,
      ideal_cycle_time: record.ideal_cycle_time,
      total_count: record.total_count,
      good_count: record.good_count,
      reject_count: record.reject_count,
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete OEE Record',
      message: 'Are you sure you want to delete this OEE record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getOEEColor = (value: number): string => {
    if (value >= 85) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getOEEBgColor = (value: number): string => {
    if (value >= 85) return isDark ? 'bg-green-500/20' : 'bg-green-100';
    if (value >= 60) return isDark ? 'bg-yellow-500/20' : 'bg-yellow-100';
    return isDark ? 'bg-red-500/20' : 'bg-red-100';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-xl`}>
              <Activity className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oEECalculator.oeeCalculator', 'OEE Calculator')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oEECalculator.overallEquipmentEffectivenessTracking', 'Overall Equipment Effectiveness tracking')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="o-e-e-calculator" toolName="O E E Calculator" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            <ExportDropdown
              onExportCSV={() => exportToCSV(records, oeeColumns, { filename: 'oee-records' })}
              onExportExcel={() => exportToExcel(records, oeeColumns, { filename: 'oee-records' })}
              onExportJSON={() => exportToJSON(records, { filename: 'oee-records' })}
              onExportPDF={() => exportToPDF(records, oeeColumns, { filename: 'oee-records', title: 'OEE Report' })}
              onPrint={() => printData(records, oeeColumns, { title: 'OEE Report' })}
              onCopyToClipboard={() => copyUtil(records, oeeColumns)}
              disabled={records.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.oEECalculator.newRecord', 'New Record')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${getOEEBgColor(avgOEE)} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className={`w-5 h-5 ${getOEEColor(avgOEE)}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.oEECalculator.avgOee', 'Avg OEE')}</span>
            </div>
            <p className={`text-3xl font-bold ${getOEEColor(avgOEE)}`}>{avgOEE}%</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oEECalculator.availability', 'Availability')}</span>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgAvailability}%</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oEECalculator.performance', 'Performance')}</span>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgPerformance}%</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oEECalculator.quality', 'Quality')}</span>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgQuality}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} w-fit`}>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'records'
                ? 'bg-blue-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tools.oEECalculator.oeeRecords', 'OEE Records')}
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tools.oEECalculator.quickCalculator', 'Quick Calculator')}
          </button>
        </div>

        {activeTab === 'calculator' && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oEECalculator.quickOeeCalculator', 'Quick OEE Calculator')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.plannedProductionTimeMin', 'Planned Production Time (min)')}</label>
                <input
                  type="number"
                  min="0"
                  value={calcData.planned_production_time}
                  onChange={(e) => setCalcData({ ...calcData, planned_production_time: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.actualRunTimeMin', 'Actual Run Time (min)')}</label>
                <input
                  type="number"
                  min="0"
                  value={calcData.actual_run_time}
                  onChange={(e) => setCalcData({ ...calcData, actual_run_time: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.idealCycleTimeSecUnit', 'Ideal Cycle Time (sec/unit)')}</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={calcData.ideal_cycle_time}
                  onChange={(e) => setCalcData({ ...calcData, ideal_cycle_time: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.totalCountUnits', 'Total Count (units)')}</label>
                <input
                  type="number"
                  min="0"
                  value={calcData.total_count}
                  onChange={(e) => setCalcData({ ...calcData, total_count: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.goodCountUnits', 'Good Count (units)')}</label>
                <input
                  type="number"
                  min="0"
                  value={calcData.good_count}
                  onChange={(e) => setCalcData({ ...calcData, good_count: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCalculate}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                >
                  {t('tools.oEECalculator.calculateOee', 'Calculate OEE')}
                </button>
              </div>
            </div>

            {calcResults && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oEECalculator.availability2', 'Availability')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calcResults.availability}%</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oEECalculator.performance2', 'Performance')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calcResults.performance}%</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oEECalculator.quality2', 'Quality')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calcResults.quality}%</div>
                </div>
                <div className={`p-4 rounded-lg ${getOEEBgColor(calcResults.oee)}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.oEECalculator.oee', 'OEE')}</div>
                  <div className={`text-2xl font-bold ${getOEEColor(calcResults.oee)}`}>{calcResults.oee}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <>
            {/* Search and Filters */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.oEECalculator.searchMachines', 'Search machines...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.oEECalculator.allShifts', 'All Shifts')}</option>
                  {shifts.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Records Table */}
            <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.date', 'Date')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.machine', 'Machine')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.shift', 'Shift')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.availability3', 'Availability')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.performance3', 'Performance')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.quality3', 'Quality')}</th>
                      <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.oee2', 'OEE')}</th>
                      <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className={isDark ? 'text-white' : 'text-gray-900'}>{record.machine_name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{record.machine_id}</div>
                        </td>
                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {shifts.find(s => s.value === record.shift)?.label}
                        </td>
                        <td className={`px-4 py-3 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {record.availability}%
                        </td>
                        <td className={`px-4 py-3 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {record.performance}%
                        </td>
                        <td className={`px-4 py-3 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {record.quality}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getOEEBgColor(record.oee)} ${getOEEColor(record.oee)}`}>
                            {record.oee}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(record)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center">
                          <Activity className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.oEECalculator.noOeeRecordsFound', 'No OEE records found')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingRecord ? t('tools.oEECalculator.editOeeRecord', 'Edit OEE Record') : t('tools.oEECalculator.newOeeRecord', 'New OEE Record')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.date2', 'Date *')}</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.shift2', 'Shift')}</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value as OEERecord['shift'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {shifts.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.machineId', 'Machine ID *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.machine_id}
                      onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.machineName', 'Machine Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.machine_name}
                      onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oEECalculator.availabilityInputs', 'Availability Inputs')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.plannedTimeMin', 'Planned Time (min)')}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.planned_production_time}
                        onChange={(e) => setFormData({ ...formData, planned_production_time: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.actualRunTimeMin2', 'Actual Run Time (min)')}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.actual_run_time}
                        onChange={(e) => setFormData({ ...formData, actual_run_time: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oEECalculator.performanceInputs', 'Performance Inputs')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.idealCycleTimeSecUnit2', 'Ideal Cycle Time (sec/unit)')}</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.ideal_cycle_time}
                        onChange={(e) => setFormData({ ...formData, ideal_cycle_time: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.totalCountUnits2', 'Total Count (units)')}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.total_count}
                        onChange={(e) => setFormData({ ...formData, total_count: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oEECalculator.qualityInput', 'Quality Input')}</h4>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.goodCountUnits2', 'Good Count (units)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.good_count}
                      onChange={(e) => setFormData({ ...formData, good_count: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.oEECalculator.notes', 'Notes')}</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.oEECalculator.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingRecord ? t('tools.oEECalculator.update', 'Update') : t('tools.oEECalculator.save', 'Save')} Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default OEECalculatorTool;
