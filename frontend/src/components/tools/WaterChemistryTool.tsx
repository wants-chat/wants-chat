'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  TestTube,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Thermometer,
  Activity,
  BarChart3,
  Beaker,
  RefreshCw,
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
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface WaterChemistryToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ReadingStatus = 'normal' | 'low' | 'high' | 'critical';
type ChemicalType = 'chlorine' | 'ph' | 'alkalinity' | 'calcium' | 'cyanuric' | 'salt' | 'phosphates' | 'copper' | 'iron';

interface ChemicalReading {
  id: string;
  poolId: string;
  poolName: string;
  customerName: string;
  readingDate: string;
  readingTime: string;
  freeChlorine: number;
  totalChlorine: number;
  combinedChlorine: number;
  ph: number;
  totalAlkalinity: number;
  calciumHardness: number;
  cyanuricAcid: number;
  saltLevel: number;
  phosphates: number;
  waterTemp: number;
  notes: string;
  technicianId: string;
  technicianName: string;
  createdAt: string;
}

interface ChemicalAddition {
  id: string;
  readingId: string;
  poolId: string;
  chemical: string;
  amount: number;
  unit: 'oz' | 'lbs' | 'gallons' | 'quarts';
  addedDate: string;
  addedTime: string;
  technicianName: string;
  notes: string;
}

interface ChemicalRange {
  min: number;
  max: number;
  ideal: number;
  unit: string;
  name: string;
}

// Constants
const CHEMICAL_RANGES: Record<string, ChemicalRange> = {
  freeChlorine: { min: 1.0, max: 3.0, ideal: 2.0, unit: 'ppm', name: 'Free Chlorine' },
  totalChlorine: { min: 1.0, max: 3.0, ideal: 2.0, unit: 'ppm', name: 'Total Chlorine' },
  combinedChlorine: { min: 0, max: 0.5, ideal: 0, unit: 'ppm', name: 'Combined Chlorine' },
  ph: { min: 7.2, max: 7.8, ideal: 7.4, unit: '', name: 'pH' },
  totalAlkalinity: { min: 80, max: 120, ideal: 100, unit: 'ppm', name: 'Total Alkalinity' },
  calciumHardness: { min: 200, max: 400, ideal: 300, unit: 'ppm', name: 'Calcium Hardness' },
  cyanuricAcid: { min: 30, max: 50, ideal: 40, unit: 'ppm', name: 'Cyanuric Acid (Stabilizer)' },
  saltLevel: { min: 2700, max: 3400, ideal: 3200, unit: 'ppm', name: 'Salt Level' },
  phosphates: { min: 0, max: 100, ideal: 0, unit: 'ppb', name: 'Phosphates' },
  waterTemp: { min: 72, max: 84, ideal: 78, unit: 'F', name: 'Water Temperature' },
};

const CHEMICAL_PRODUCTS = [
  { name: 'Liquid Chlorine', type: 'sanitizer' },
  { name: 'Cal-Hypo (Shock)', type: 'sanitizer' },
  { name: 'Dichlor', type: 'sanitizer' },
  { name: 'Trichlor Tablets', type: 'sanitizer' },
  { name: 'Muriatic Acid', type: 'ph-down' },
  { name: 'Sodium Bisulfate', type: 'ph-down' },
  { name: 'Soda Ash', type: 'ph-up' },
  { name: 'Sodium Bicarbonate', type: 'alkalinity-up' },
  { name: 'Calcium Chloride', type: 'calcium-up' },
  { name: 'Cyanuric Acid', type: 'stabilizer' },
  { name: 'Salt', type: 'salt' },
  { name: 'Phosphate Remover', type: 'phosphate' },
  { name: 'Algaecide', type: 'algae' },
  { name: 'Clarifier', type: 'clarifier' },
  { name: 'Metal Sequestrant', type: 'metals' },
];

// Column configuration for exports
const READING_COLUMNS: ColumnConfig[] = [
  { key: 'poolName', header: 'Pool', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'readingDate', header: 'Date', type: 'date' },
  { key: 'freeChlorine', header: 'Free Cl (ppm)', type: 'number' },
  { key: 'ph', header: 'pH', type: 'number' },
  { key: 'totalAlkalinity', header: 'TA (ppm)', type: 'number' },
  { key: 'calciumHardness', header: 'CH (ppm)', type: 'number' },
  { key: 'cyanuricAcid', header: 'CYA (ppm)', type: 'number' },
  { key: 'waterTemp', header: 'Temp (F)', type: 'number' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
];

const ADDITION_COLUMNS: ColumnConfig[] = [
  { key: 'chemical', header: 'Chemical', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'addedDate', header: 'Date', type: 'date' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
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

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getReadingStatus = (value: number, chemicalKey: string): ReadingStatus => {
  const range = CHEMICAL_RANGES[chemicalKey];
  if (!range) return 'normal';

  const lowCritical = range.min - (range.max - range.min) * 0.5;
  const highCritical = range.max + (range.max - range.min) * 0.5;

  if (value < lowCritical || value > highCritical) return 'critical';
  if (value < range.min || value > range.max) return value < range.min ? 'low' : 'high';
  return 'normal';
};

const getStatusColor = (status: ReadingStatus): string => {
  switch (status) {
    case 'normal': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getValueIndicator = (value: number, chemicalKey: string) => {
  const range = CHEMICAL_RANGES[chemicalKey];
  if (!range) return null;

  if (value < range.min) return <TrendingDown className="w-4 h-4 text-yellow-500" />;
  if (value > range.max) return <TrendingUp className="w-4 h-4 text-orange-500" />;
  return <CheckCircle className="w-4 h-4 text-green-500" />;
};

// Main Component
export const WaterChemistryTool: React.FC<WaterChemistryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
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
  } = useToolData<ChemicalReading>('water-chemistry-readings', [], READING_COLUMNS);

  const {
    data: additions,
    addItem: addAdditionToBackend,
    updateItem: updateAdditionBackend,
    deleteItem: deleteAdditionBackend,
    isSynced: additionsSynced,
    isSaving: additionsSaving,
    lastSaved: additionsLastSaved,
    syncError: additionsSyncError,
    forceSync: forceAdditionsSync,
  } = useToolData<ChemicalAddition>('water-chemistry-additions', [], ADDITION_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'readings' | 'additions' | 'analysis'>('readings');
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [showAdditionForm, setShowAdditionForm] = useState(false);
  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPool, setFilterPool] = useState<string>('all');

  // Form states
  const [newReading, setNewReading] = useState<Partial<ChemicalReading>>({
    poolId: '',
    poolName: '',
    customerName: '',
    readingDate: new Date().toISOString().split('T')[0],
    readingTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    freeChlorine: 0,
    totalChlorine: 0,
    combinedChlorine: 0,
    ph: 7.4,
    totalAlkalinity: 100,
    calciumHardness: 300,
    cyanuricAcid: 40,
    saltLevel: 0,
    phosphates: 0,
    waterTemp: 78,
    notes: '',
    technicianId: '',
    technicianName: '',
  });

  const [newAddition, setNewAddition] = useState<Partial<ChemicalAddition>>({
    readingId: '',
    poolId: '',
    chemical: '',
    amount: 0,
    unit: 'oz',
    addedDate: new Date().toISOString().split('T')[0],
    addedTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    technicianName: '',
    notes: '',
  });

  // Get unique pools from readings
  const pools = useMemo(() => {
    const uniquePools = new Map<string, { id: string; name: string; customerName: string }>();
    readings.forEach(r => {
      if (!uniquePools.has(r.poolId)) {
        uniquePools.set(r.poolId, { id: r.poolId, name: r.poolName, customerName: r.customerName });
      }
    });
    return Array.from(uniquePools.values());
  }, [readings]);

  // Filtered readings
  const filteredReadings = useMemo(() => {
    return readings.filter(reading => {
      const matchesSearch = searchTerm === '' ||
        reading.poolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPool = filterPool === 'all' || reading.poolId === filterPool;
      return matchesSearch && matchesPool;
    }).sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
  }, [readings, searchTerm, filterPool]);

  // Latest reading for each pool
  const latestReadings = useMemo(() => {
    const latest = new Map<string, ChemicalReading>();
    readings.forEach(r => {
      const existing = latest.get(r.poolId);
      if (!existing || new Date(r.readingDate) > new Date(existing.readingDate)) {
        latest.set(r.poolId, r);
      }
    });
    return Array.from(latest.values());
  }, [readings]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysReadings = readings.filter(r => r.readingDate === today);
    const outOfRange = latestReadings.filter(r => {
      return getReadingStatus(r.freeChlorine, 'freeChlorine') !== 'normal' ||
             getReadingStatus(r.ph, 'ph') !== 'normal';
    });
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekReadings = readings.filter(r => new Date(r.readingDate) >= weekAgo);

    return {
      todaysReadings: todaysReadings.length,
      totalPools: pools.length,
      outOfRange: outOfRange.length,
      weeklyReadings: weekReadings.length,
      totalAdditions: additions.length,
    };
  }, [readings, pools, additions, latestReadings]);

  // Add reading
  const handleAddReading = () => {
    if (!newReading.poolName || !newReading.customerName) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const combined = (newReading.totalChlorine || 0) - (newReading.freeChlorine || 0);
    const reading: ChemicalReading = {
      id: generateId(),
      poolId: newReading.poolId || generateId(),
      poolName: newReading.poolName || '',
      customerName: newReading.customerName || '',
      readingDate: newReading.readingDate || new Date().toISOString().split('T')[0],
      readingTime: newReading.readingTime || new Date().toTimeString().split(' ')[0].slice(0, 5),
      freeChlorine: newReading.freeChlorine || 0,
      totalChlorine: newReading.totalChlorine || 0,
      combinedChlorine: combined,
      ph: newReading.ph || 7.4,
      totalAlkalinity: newReading.totalAlkalinity || 100,
      calciumHardness: newReading.calciumHardness || 300,
      cyanuricAcid: newReading.cyanuricAcid || 40,
      saltLevel: newReading.saltLevel || 0,
      phosphates: newReading.phosphates || 0,
      waterTemp: newReading.waterTemp || 78,
      notes: newReading.notes || '',
      technicianId: newReading.technicianId || generateId(),
      technicianName: newReading.technicianName || '',
      createdAt: new Date().toISOString(),
    };

    addReadingToBackend(reading);
    setShowReadingForm(false);
    resetReadingForm();
  };

  // Add chemical addition
  const handleAddAddition = () => {
    if (!newAddition.chemical || !newAddition.amount) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const addition: ChemicalAddition = {
      id: generateId(),
      readingId: newAddition.readingId || '',
      poolId: newAddition.poolId || '',
      chemical: newAddition.chemical || '',
      amount: newAddition.amount || 0,
      unit: newAddition.unit || 'oz',
      addedDate: newAddition.addedDate || new Date().toISOString().split('T')[0],
      addedTime: newAddition.addedTime || new Date().toTimeString().split(' ')[0].slice(0, 5),
      technicianName: newAddition.technicianName || '',
      notes: newAddition.notes || '',
    };

    addAdditionToBackend(addition);
    setShowAdditionForm(false);
    resetAdditionForm();
  };

  // Delete reading
  const handleDeleteReading = async (readingId: string) => {
    const confirmed = await confirm({
      title: 'Delete Reading',
      message: 'Are you sure you want to delete this reading?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteReadingBackend(readingId);
    }
  };

  // Reset forms
  const resetReadingForm = () => {
    setNewReading({
      poolId: '',
      poolName: '',
      customerName: '',
      readingDate: new Date().toISOString().split('T')[0],
      readingTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
      freeChlorine: 0,
      totalChlorine: 0,
      combinedChlorine: 0,
      ph: 7.4,
      totalAlkalinity: 100,
      calciumHardness: 300,
      cyanuricAcid: 40,
      saltLevel: 0,
      phosphates: 0,
      waterTemp: 78,
      notes: '',
      technicianId: '',
      technicianName: '',
    });
  };

  const resetAdditionForm = () => {
    setNewAddition({
      readingId: '',
      poolId: '',
      chemical: '',
      amount: 0,
      unit: 'oz',
      addedDate: new Date().toISOString().split('T')[0],
      addedTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
      technicianName: '',
      notes: '',
    });
  };

  // Calculate recommendations based on reading
  const getRecommendations = (reading: ChemicalReading): string[] => {
    const recommendations: string[] = [];

    if (reading.freeChlorine < CHEMICAL_RANGES.freeChlorine.min) {
      recommendations.push('Add chlorine to raise free chlorine level');
    }
    if (reading.freeChlorine > CHEMICAL_RANGES.freeChlorine.max) {
      recommendations.push('Chlorine level high - reduce chlorine dosage or wait');
    }
    if (reading.ph < CHEMICAL_RANGES.ph.min) {
      recommendations.push('Add soda ash to raise pH');
    }
    if (reading.ph > CHEMICAL_RANGES.ph.max) {
      recommendations.push('Add muriatic acid to lower pH');
    }
    if (reading.totalAlkalinity < CHEMICAL_RANGES.totalAlkalinity.min) {
      recommendations.push('Add sodium bicarbonate to raise alkalinity');
    }
    if (reading.totalAlkalinity > CHEMICAL_RANGES.totalAlkalinity.max) {
      recommendations.push('Use muriatic acid to lower alkalinity');
    }
    if (reading.calciumHardness < CHEMICAL_RANGES.calciumHardness.min) {
      recommendations.push('Add calcium chloride to raise calcium hardness');
    }
    if (reading.cyanuricAcid < CHEMICAL_RANGES.cyanuricAcid.min) {
      recommendations.push('Add stabilizer (cyanuric acid)');
    }
    if (reading.cyanuricAcid > CHEMICAL_RANGES.cyanuricAcid.max) {
      recommendations.push('CYA is high - consider partial drain and refill');
    }
    if (reading.phosphates > CHEMICAL_RANGES.phosphates.max) {
      recommendations.push('Add phosphate remover');
    }
    if (reading.combinedChlorine > CHEMICAL_RANGES.combinedChlorine.max) {
      recommendations.push('Combined chlorine high - shock the pool');
    }

    return recommendations;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.waterChemistry.waterChemistryTracker', 'Water Chemistry Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.waterChemistry.monitorAndLogPoolWater', 'Monitor and log pool water chemistry readings')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="water-chemistry" toolName="Water Chemistry" />

              <SyncStatus
                isSynced={readingsSynced && additionsSynced}
                isSaving={readingsSaving || additionsSaving}
                lastSaved={readingsLastSaved || additionsLastSaved}
                syncError={readingsSyncError || additionsSyncError}
                onForceSync={() => { forceReadingsSync(); forceAdditionsSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(readings, READING_COLUMNS, { filename: 'water-chemistry-readings' })}
                onExportExcel={() => exportToExcel(readings, READING_COLUMNS, { filename: 'water-chemistry-readings' })}
                onExportJSON={() => exportToJSON(readings, { filename: 'water-chemistry-readings' })}
                onExportPDF={async () => {
                  await exportToPDF(readings, READING_COLUMNS, {
                    filename: 'water-chemistry-readings',
                    title: 'Water Chemistry Readings',
                    subtitle: `${readings.length} readings | ${pools.length} pools`,
                  });
                }}
                onPrint={() => printData(readings, READING_COLUMNS, { title: 'Water Chemistry Readings' })}
                onCopyToClipboard={async () => copyUtil(readings, READING_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'readings', label: 'Readings', icon: <TestTube className="w-4 h-4" /> },
              { id: 'additions', label: 'Chemical Additions', icon: <Beaker className="w-4 h-4" /> },
              { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Today's Readings", value: stats.todaysReadings, icon: <Calendar className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Total Pools', value: stats.totalPools, icon: <Droplets className="w-5 h-5" />, color: 'bg-cyan-500' },
            { label: 'Out of Range', value: stats.outOfRange, icon: <AlertTriangle className="w-5 h-5" />, color: stats.outOfRange > 0 ? 'bg-red-500' : 'bg-green-500' },
            { label: 'This Week', value: stats.weeklyReadings, icon: <Activity className="w-5 h-5" />, color: 'bg-purple-500' },
            { label: 'Chemical Adds', value: stats.totalAdditions, icon: <Beaker className="w-5 h-5" />, color: 'bg-orange-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <span className="text-white">{stat.icon}</span>
                </div>
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </span>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Readings Tab */}
        {activeTab === 'readings' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.waterChemistry.searchPoolsOrCustomers', 'Search pools or customers...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <select
                value={filterPool}
                onChange={(e) => setFilterPool(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.waterChemistry.allPools', 'All Pools')}</option>
                {pools.map((pool) => (
                  <option key={pool.id} value={pool.id}>{pool.name} - {pool.customerName}</option>
                ))}
              </select>
              <button
                onClick={() => setShowReadingForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.waterChemistry.newReading', 'New Reading')}
              </button>
            </div>

            {/* Readings List */}
            <div className="space-y-4">
              {filteredReadings.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.waterChemistry.noReadingsFoundAddYour', 'No readings found. Add your first water chemistry reading.')}</p>
                </div>
              ) : (
                filteredReadings.map((reading) => {
                  const recommendations = getRecommendations(reading);
                  const hasIssues = recommendations.length > 0;

                  return (
                    <div
                      key={reading.id}
                      className={`border rounded-lg p-4 ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      } ${hasIssues ? 'border-l-4 border-l-yellow-500' : ''} transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {reading.poolName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {reading.customerName} | {formatDate(reading.readingDate)} at {formatTime(reading.readingTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasIssues && (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              {recommendations.length} issue{recommendations.length > 1 ? 's' : ''}
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedReadingId(selectedReadingId === reading.id ? null : reading.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReading(reading.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                                : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Chemical Values Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {[
                          { key: 'freeChlorine', value: reading.freeChlorine, label: 'Free Cl' },
                          { key: 'ph', value: reading.ph, label: 'pH' },
                          { key: 'totalAlkalinity', value: reading.totalAlkalinity, label: 'TA' },
                          { key: 'calciumHardness', value: reading.calciumHardness, label: 'CH' },
                          { key: 'cyanuricAcid', value: reading.cyanuricAcid, label: 'CYA' },
                        ].map((item) => {
                          const status = getReadingStatus(item.value, item.key);
                          const range = CHEMICAL_RANGES[item.key];
                          return (
                            <div key={item.key} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.label}
                                </span>
                                {getValueIndicator(item.value, item.key)}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {item.value}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {range?.unit || 'ppm'}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-xs mt-1 inline-block ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Thermometer className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {reading.waterTemp}°F
                          </span>
                        </div>
                        {reading.saltLevel > 0 && (
                          <div className="flex items-center gap-1">
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                              Salt: {reading.saltLevel} ppm
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            By: {reading.technicianName}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Recommendations */}
                      {selectedReadingId === reading.id && recommendations.length > 0 && (
                        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.waterChemistry.recommendations', 'Recommendations')}
                          </h4>
                          <ul className="space-y-2">
                            {recommendations.map((rec, idx) => (
                              <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chemical Additions Tab */}
        {activeTab === 'additions' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.waterChemistry.chemicalAdditionsLog', 'Chemical Additions Log')}
              </h2>
              <button
                onClick={() => setShowAdditionForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-5 h-5" />
                {t('tools.waterChemistry.logAddition', 'Log Addition')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.waterChemistry.date', 'Date')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.waterChemistry.chemical', 'Chemical')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.waterChemistry.amount', 'Amount')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.waterChemistry.technician', 'Technician')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.waterChemistry.notes', 'Notes')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.waterChemistry.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {additions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.waterChemistry.noChemicalAdditionsLoggedYet', 'No chemical additions logged yet.')}
                      </td>
                    </tr>
                  ) : (
                    additions.map((addition) => (
                      <tr key={addition.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(addition.addedDate)}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {addition.chemical}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {addition.amount} {addition.unit}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {addition.technicianName}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {addition.notes || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => deleteAdditionBackend(addition.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.waterChemistry.poolAnalysisOverview', 'Pool Analysis Overview')}
            </h2>

            <div className="space-y-6">
              {latestReadings.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.waterChemistry.noReadingsAvailableForAnalysis', 'No readings available for analysis.')}</p>
                </div>
              ) : (
                latestReadings.map((reading) => {
                  const recommendations = getRecommendations(reading);
                  return (
                    <div key={reading.poolId} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {reading.poolName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {reading.customerName} | Last reading: {formatDate(reading.readingDate)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          recommendations.length === 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {recommendations.length === 0 ? 'Balanced' : `${recommendations.length} Issue${recommendations.length > 1 ? 's' : ''}`}
                        </span>
                      </div>

                      {/* Chemical Bars */}
                      <div className="space-y-3">
                        {[
                          { key: 'freeChlorine', value: reading.freeChlorine },
                          { key: 'ph', value: reading.ph },
                          { key: 'totalAlkalinity', value: reading.totalAlkalinity },
                          { key: 'calciumHardness', value: reading.calciumHardness },
                          { key: 'cyanuricAcid', value: reading.cyanuricAcid },
                        ].map((item) => {
                          const range = CHEMICAL_RANGES[item.key];
                          const status = getReadingStatus(item.value, item.key);
                          const percent = Math.min(100, Math.max(0, ((item.value - range.min * 0.5) / (range.max * 1.5 - range.min * 0.5)) * 100));

                          return (
                            <div key={item.key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {range.name}
                                </span>
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {item.value} {range.unit}
                                </span>
                              </div>
                              <div className="relative h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                                {/* Ideal range indicator */}
                                <div
                                  className="absolute h-full bg-green-200 dark:bg-green-900/50 rounded-full"
                                  style={{
                                    left: `${((range.min - range.min * 0.5) / (range.max * 1.5 - range.min * 0.5)) * 100}%`,
                                    width: `${((range.max - range.min) / (range.max * 1.5 - range.min * 0.5)) * 100}%`,
                                  }}
                                />
                                {/* Current value indicator */}
                                <div
                                  className={`absolute h-full rounded-full transition-all ${
                                    status === 'normal' ? 'bg-green-500' :
                                    status === 'low' || status === 'high' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {recommendations.length > 0 && (
                        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.waterChemistry.actionItems', 'Action Items:')}
                          </h4>
                          <ul className="space-y-1">
                            {recommendations.map((rec, idx) => (
                              <li key={idx} className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Add Reading Modal */}
        {showReadingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.waterChemistry.newWaterChemistryReading', 'New Water Chemistry Reading')}
                </h3>
                <button onClick={() => setShowReadingForm(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Pool Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.poolName', 'Pool Name *')}
                    </label>
                    <input
                      type="text"
                      value={newReading.poolName}
                      onChange={(e) => setNewReading({ ...newReading, poolName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.waterChemistry.eGMainPool', 'e.g., Main Pool')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.customerName', 'Customer Name *')}
                    </label>
                    <input
                      type="text"
                      value={newReading.customerName}
                      onChange={(e) => setNewReading({ ...newReading, customerName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.date2', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={newReading.readingDate}
                      onChange={(e) => setNewReading({ ...newReading, readingDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={newReading.readingTime}
                      onChange={(e) => setNewReading({ ...newReading, readingTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.technician2', 'Technician')}
                    </label>
                    <input
                      type="text"
                      value={newReading.technicianName}
                      onChange={(e) => setNewReading({ ...newReading, technicianName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Chemical Readings */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.waterChemistry.chemicalReadings', 'Chemical Readings')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'freeChlorine', label: 'Free Chlorine (ppm)', step: 0.1 },
                      { key: 'totalChlorine', label: 'Total Chlorine (ppm)', step: 0.1 },
                      { key: 'ph', label: 'pH', step: 0.1 },
                      { key: 'totalAlkalinity', label: 'Total Alkalinity (ppm)', step: 10 },
                      { key: 'calciumHardness', label: 'Calcium Hardness (ppm)', step: 10 },
                      { key: 'cyanuricAcid', label: 'Cyanuric Acid (ppm)', step: 5 },
                      { key: 'saltLevel', label: 'Salt Level (ppm)', step: 100 },
                      { key: 'phosphates', label: 'Phosphates (ppb)', step: 50 },
                      { key: 'waterTemp', label: 'Water Temp (F)', step: 1 },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {field.label}
                        </label>
                        <input
                          type="number"
                          value={(newReading as Record<string, any>)[field.key]}
                          onChange={(e) => setNewReading({ ...newReading, [field.key]: parseFloat(e.target.value) || 0 })}
                          step={field.step}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waterChemistry.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={newReading.notes}
                    onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.waterChemistry.additionalObservations', 'Additional observations...')}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowReadingForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.waterChemistry.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddReading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.waterChemistry.saveReading', 'Save Reading')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Chemical Addition Modal */}
        {showAdditionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.waterChemistry.logChemicalAddition', 'Log Chemical Addition')}
                </h3>
                <button onClick={() => setShowAdditionForm(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waterChemistry.chemical2', 'Chemical *')}
                  </label>
                  <select
                    value={newAddition.chemical}
                    onChange={(e) => setNewAddition({ ...newAddition, chemical: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.waterChemistry.selectChemical', 'Select chemical...')}</option>
                    {CHEMICAL_PRODUCTS.map((chem) => (
                      <option key={chem.name} value={chem.name}>{chem.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.amount2', 'Amount *')}
                    </label>
                    <input
                      type="number"
                      value={newAddition.amount}
                      onChange={(e) => setNewAddition({ ...newAddition, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.waterChemistry.unit', 'Unit')}
                    </label>
                    <select
                      value={newAddition.unit}
                      onChange={(e) => setNewAddition({ ...newAddition, unit: e.target.value as ChemicalAddition['unit'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="oz">{t('tools.waterChemistry.ounces', 'Ounces')}</option>
                      <option value="lbs">{t('tools.waterChemistry.pounds', 'Pounds')}</option>
                      <option value="gallons">{t('tools.waterChemistry.gallons', 'Gallons')}</option>
                      <option value="quarts">{t('tools.waterChemistry.quarts', 'Quarts')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waterChemistry.technician3', 'Technician')}
                  </label>
                  <input
                    type="text"
                    value={newAddition.technicianName}
                    onChange={(e) => setNewAddition({ ...newAddition, technicianName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.waterChemistry.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={newAddition.notes}
                    onChange={(e) => setNewAddition({ ...newAddition, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowAdditionForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.waterChemistry.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddAddition}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.waterChemistry.logAddition2', 'Log Addition')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterChemistryTool;
