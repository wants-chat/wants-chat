'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  MapPin,
  Droplets,
  Leaf,
  BarChart3,
  FileText,
  Info
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface SoilTestingToolProps {
  uiConfig?: UIConfig;
}

type TestStatus = 'pending' | 'in_progress' | 'completed' | 'needs_retest';
type NutrientLevel = 'very_low' | 'low' | 'optimal' | 'high' | 'very_high';
type ActiveTab = 'tests' | 'results' | 'trends' | 'recommendations';

interface SoilTest {
  id: string;
  fieldName: string;
  sampleLocation: string;
  collectionDate: string;
  labName: string;
  status: TestStatus;
  pH: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  organicMatter: number | null;
  calcium: number | null;
  magnesium: number | null;
  sulfur: number | null;
  cec: number | null; // Cation Exchange Capacity
  texture: string;
  moisture: number | null;
  notes: string;
  recommendations: string;
  createdAt: string;
  updatedAt: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusColors: Record<TestStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Pending' },
  in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'In Progress' },
  completed: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Completed' },
  needs_retest: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'Needs Retest' }
};

const getNutrientLevel = (value: number | null, type: string): NutrientLevel => {
  if (value === null) return 'optimal';

  const ranges: Record<string, { veryLow: number; low: number; optimal: number; high: number }> = {
    pH: { veryLow: 5.5, low: 6.0, optimal: 7.0, high: 7.5 },
    nitrogen: { veryLow: 10, low: 25, optimal: 50, high: 75 },
    phosphorus: { veryLow: 10, low: 25, optimal: 50, high: 75 },
    potassium: { veryLow: 50, low: 100, optimal: 200, high: 300 },
    organicMatter: { veryLow: 1, low: 2, optimal: 4, high: 6 },
    calcium: { veryLow: 500, low: 1000, optimal: 2000, high: 4000 },
    magnesium: { veryLow: 25, low: 50, optimal: 100, high: 200 }
  };

  const range = ranges[type] || { veryLow: 0, low: 25, optimal: 50, high: 75 };

  if (value < range.veryLow) return 'very_low';
  if (value < range.low) return 'low';
  if (value <= range.optimal) return 'optimal';
  if (value <= range.high) return 'high';
  return 'very_high';
};

const levelColors: Record<NutrientLevel, { bg: string; text: string }> = {
  very_low: { bg: 'bg-red-500/20', text: 'text-red-500' },
  low: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  optimal: { bg: 'bg-green-500/20', text: 'text-green-500' },
  high: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
  very_high: { bg: 'bg-purple-500/20', text: 'text-purple-500' }
};

// Column configuration for exports
const testColumns: ColumnConfig[] = [
  { key: 'fieldName', header: 'Field Name', type: 'string' },
  { key: 'sampleLocation', header: 'Sample Location', type: 'string' },
  { key: 'collectionDate', header: 'Collection Date', type: 'date' },
  { key: 'labName', header: 'Lab Name', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'pH', header: 'pH', type: 'number' },
  { key: 'nitrogen', header: 'Nitrogen (ppm)', type: 'number' },
  { key: 'phosphorus', header: 'Phosphorus (ppm)', type: 'number' },
  { key: 'potassium', header: 'Potassium (ppm)', type: 'number' },
  { key: 'organicMatter', header: 'Organic Matter (%)', type: 'number' },
  { key: 'calcium', header: 'Calcium (ppm)', type: 'number' },
  { key: 'magnesium', header: 'Magnesium (ppm)', type: 'number' },
  { key: 'texture', header: 'Texture', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'recommendations', header: 'Recommendations', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' }
];

// Sample data generator
const generateSampleTests = (): SoilTest[] => [
  {
    id: generateId(),
    fieldName: 'North Field',
    sampleLocation: 'Grid A1-A3',
    collectionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    labName: 'AgriLab Testing',
    status: 'completed',
    pH: 6.5,
    nitrogen: 45,
    phosphorus: 35,
    potassium: 180,
    organicMatter: 3.2,
    calcium: 1800,
    magnesium: 90,
    sulfur: 12,
    cec: 15.5,
    texture: 'Loamy',
    moisture: 22,
    notes: 'Good overall condition',
    recommendations: 'Add lime to raise pH slightly. Consider nitrogen supplement.',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: generateId(),
    fieldName: 'South Pasture',
    sampleLocation: 'Grid B2-B4',
    collectionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    labName: 'County Extension',
    status: 'completed',
    pH: 5.8,
    nitrogen: 28,
    phosphorus: 52,
    potassium: 145,
    organicMatter: 2.8,
    calcium: 1200,
    magnesium: 65,
    sulfur: 8,
    cec: 12.0,
    texture: 'Sandy Loam',
    moisture: 18,
    notes: 'Acidic soil, needs attention',
    recommendations: 'Apply agricultural lime at 2 tons/acre. Increase organic matter.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: generateId(),
    fieldName: 'East Garden',
    sampleLocation: 'Vegetable plots',
    collectionDate: new Date().toISOString(),
    labName: 'AgriLab Testing',
    status: 'pending',
    pH: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    organicMatter: null,
    calcium: null,
    magnesium: null,
    sulfur: null,
    cec: null,
    texture: 'Unknown',
    moisture: null,
    notes: 'Samples sent to lab',
    recommendations: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function SoilTestingTool({
  uiConfig }: SoilTestingToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for data persistence
  const {
    data: tests,
    addItem: addTest,
    updateItem: updateTest,
    deleteItem: deleteTest,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync
  } = useToolData<SoilTest>('soil-testing', generateSampleTests(), testColumns);

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('tests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<SoilTest | null>(null);

  // Form state for new test
  const [newTest, setNewTest] = useState<Omit<SoilTest, 'id' | 'createdAt' | 'updatedAt'>>({
    fieldName: '',
    sampleLocation: '',
    collectionDate: new Date().toISOString().split('T')[0],
    labName: '',
    status: 'pending',
    pH: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    organicMatter: null,
    calcium: null,
    magnesium: null,
    sulfur: null,
    cec: null,
    texture: '',
    moisture: null,
    notes: '',
    recommendations: ''
  });

  // Handle prefill data from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params || (uiConfig as any)?.toolPrefillData) {
      const prefillData = (uiConfig as any)?.toolPrefillData || uiConfig?.params;
      if (prefillData?.fieldName) {
        setNewTest(prev => ({ ...prev, fieldName: prefillData.fieldName }));
        setShowAddForm(true);
      }
    }
  }, [uiConfig]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.sampleLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.labName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tests, searchTerm, statusFilter]);

  // Completed tests for analysis
  const completedTests = useMemo(() => tests.filter(t => t.status === 'completed'), [tests]);

  // Statistics
  const stats = useMemo(() => {
    const avgPH = completedTests.length > 0
      ? completedTests.filter(t => t.pH !== null).reduce((sum, t) => sum + (t.pH || 0), 0) / completedTests.filter(t => t.pH !== null).length
      : 0;
    const avgNitrogen = completedTests.length > 0
      ? completedTests.filter(t => t.nitrogen !== null).reduce((sum, t) => sum + (t.nitrogen || 0), 0) / completedTests.filter(t => t.nitrogen !== null).length
      : 0;
    const testsNeedingAttention = completedTests.filter(t =>
      (t.pH !== null && (t.pH < 5.5 || t.pH > 8.0)) ||
      (t.nitrogen !== null && t.nitrogen < 20)
    ).length;

    return {
      totalTests: tests.length,
      completedTests: completedTests.length,
      avgPH,
      avgNitrogen,
      testsNeedingAttention
    };
  }, [tests, completedTests]);

  // Handlers
  const handleAddTest = () => {
    if (!newTest.fieldName.trim()) return;

    const test: SoilTest = {
      ...newTest,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addTest(test);
    setNewTest({
      fieldName: '',
      sampleLocation: '',
      collectionDate: new Date().toISOString().split('T')[0],
      labName: '',
      status: 'pending',
      pH: null,
      nitrogen: null,
      phosphorus: null,
      potassium: null,
      organicMatter: null,
      calcium: null,
      magnesium: null,
      sulfur: null,
      cec: null,
      texture: '',
      moisture: null,
      notes: '',
      recommendations: ''
    });
    setShowAddForm(false);
  };

  const handleUpdateTest = (id: string, updates: Partial<SoilTest>) => {
    updateTest(id, { ...updates, updatedAt: new Date().toISOString() });
    setEditingId(null);
  };

  const handleDeleteTest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Soil Test',
      message: 'Are you sure you want to delete this soil test?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteTest(id);
    }
  };

  const tabs = [
    { id: 'tests' as ActiveTab, label: 'Tests', icon: FlaskConical },
    { id: 'results' as ActiveTab, label: 'Results', icon: FileText },
    { id: 'trends' as ActiveTab, label: 'Trends', icon: TrendingUp },
    { id: 'recommendations' as ActiveTab, label: 'Recommendations', icon: Leaf }
  ];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-3"></div>
        {t('tools.soilTesting.loadingSoilTestData', 'Loading soil test data...')}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
            <FlaskConical className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.soilTesting.soilTesting', 'Soil Testing')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.soilTesting.trackAndAnalyzeSoilTest', 'Track and analyze soil test results')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="soil-testing" toolName="Soil Testing" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            onExportCSV={exportCSV}
            onExportExcel={exportExcel}
            onExportJSON={exportJSON}
            onExportPDF={exportPDF}
            onPrint={print}
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.soilTesting.newTest', 'New Test')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <FlaskConical className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soilTesting.totalTests', 'Total Tests')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalTests}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soilTesting.completed', 'Completed')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.completedTests}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
              <Droplets className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soilTesting.avgPh', 'Avg pH')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgPH.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
              <Leaf className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soilTesting.avgNitrogen', 'Avg Nitrogen')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgNitrogen.toFixed(0)} ppm
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soilTesting.needAttention', 'Need Attention')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.testsNeedingAttention}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white'
                : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      {activeTab === 'tests' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={t('tools.soilTesting.searchTests', 'Search tests...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TestStatus | 'all')}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-amber-500`}
          >
            <option value="all">{t('tools.soilTesting.allStatus', 'All Status')}</option>
            <option value="pending">{t('tools.soilTesting.pending', 'Pending')}</option>
            <option value="in_progress">{t('tools.soilTesting.inProgress', 'In Progress')}</option>
            <option value="completed">{t('tools.soilTesting.completed2', 'Completed')}</option>
            <option value="needs_retest">{t('tools.soilTesting.needsRetest', 'Needs Retest')}</option>
          </select>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.soilTesting.noSoilTestsFound', 'No soil tests found')}</p>
              <p className="text-sm">{t('tools.soilTesting.addANewSoilTest', 'Add a new soil test to get started')}</p>
            </div>
          ) : (
            filteredTests.map(test => (
              <div
                key={test.id}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <FlaskConical className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {test.fieldName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="w-3 h-3" />
                          {test.sampleLocation}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[test.status].bg} ${statusColors[test.status].text}`}>
                          {statusColors[test.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTest(test)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Info className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => setEditingId(test.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {test.status === 'completed' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soilTesting.phLevel', 'pH Level')}</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {test.pH?.toFixed(1) || 'N/A'}
                        </p>
                        {test.pH && (
                          <span className={`px-1.5 py-0.5 text-xs rounded ${levelColors[getNutrientLevel(test.pH, 'pH')].bg} ${levelColors[getNutrientLevel(test.pH, 'pH')].text}`}>
                            {getNutrientLevel(test.pH, 'pH').replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soilTesting.nitrogenPpm', 'Nitrogen (ppm)')}</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {test.nitrogen || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soilTesting.phosphorusPpm', 'Phosphorus (ppm)')}</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {test.phosphorus || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soilTesting.potassiumPpm', 'Potassium (ppm)')}</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {test.potassium || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Collected: {formatDate(test.collectionDate)}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Lab: {test.labName || 'Not specified'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          {completedTests.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.soilTesting.noCompletedTests', 'No completed tests')}</p>
              <p className="text-sm">{t('tools.soilTesting.completeSomeTestsToSee', 'Complete some tests to see results')}</p>
            </div>
          ) : (
            completedTests.map(test => (
              <div key={test.id} className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {test.fieldName} - {formatDate(test.collectionDate)}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'pH', value: test.pH, unit: '', type: 'pH' },
                    { label: 'Nitrogen', value: test.nitrogen, unit: 'ppm', type: 'nitrogen' },
                    { label: 'Phosphorus', value: test.phosphorus, unit: 'ppm', type: 'phosphorus' },
                    { label: 'Potassium', value: test.potassium, unit: 'ppm', type: 'potassium' },
                    { label: 'Organic Matter', value: test.organicMatter, unit: '%', type: 'organicMatter' },
                    { label: 'Calcium', value: test.calcium, unit: 'ppm', type: 'calcium' },
                    { label: 'Magnesium', value: test.magnesium, unit: 'ppm', type: 'magnesium' },
                    { label: 'Sulfur', value: test.sulfur, unit: 'ppm', type: 'sulfur' },
                    { label: 'CEC', value: test.cec, unit: 'meq/100g', type: 'cec' },
                    { label: 'Moisture', value: test.moisture, unit: '%', type: 'moisture' }
                  ].map(item => (
                    <div key={item.label} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.value !== null ? `${item.value}${item.unit ? ' ' + item.unit : ''}` : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>

                {test.recommendations && (
                  <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      {t('tools.soilTesting.recommendations2', 'Recommendations')}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                      {test.recommendations}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.soilTesting.soilHealthTrends', 'Soil Health Trends')}
          </h3>

          {completedTests.length < 2 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.soilTesting.needAtLeast2Completed', 'Need at least 2 completed tests to show trends')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* pH Trend */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.soilTesting.phLevel2', 'pH Level')}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current: {completedTests[0]?.pH?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
                    style={{ width: `${((completedTests[0]?.pH || 7) / 14) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.soilTesting.acidic0', 'Acidic (0)')}</span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.soilTesting.neutral7', 'Neutral (7)')}</span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.soilTesting.alkaline14', 'Alkaline (14)')}</span>
                </div>
              </div>

              {/* Nutrient Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['nitrogen', 'phosphorus', 'potassium', 'organicMatter'].map(nutrient => {
                  const values = completedTests
                    .filter(t => t[nutrient as keyof SoilTest] !== null)
                    .map(t => t[nutrient as keyof SoilTest] as number);
                  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                  const latest = values[0] || 0;
                  const trend = values.length > 1 ? latest - values[1] : 0;

                  return (
                    <div key={nutrient} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {nutrient === 'organicMatter' ? 'Organic Matter' : nutrient}
                        </span>
                        <div className="flex items-center gap-1">
                          {trend > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : trend < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span className={`text-sm ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {latest.toFixed(1)} {nutrient === 'organicMatter' ? '%' : 'ppm'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Avg: {avg.toFixed(1)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {completedTests.filter(t => t.recommendations).length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.soilTesting.noRecommendationsYet', 'No recommendations yet')}</p>
              <p className="text-sm">{t('tools.soilTesting.completeTestsWithRecommendationsTo', 'Complete tests with recommendations to see them here')}</p>
            </div>
          ) : (
            completedTests.filter(t => t.recommendations).map(test => (
              <div key={test.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <Leaf className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {test.fieldName}
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Test Date: {formatDate(test.collectionDate)}
                    </p>
                    <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {test.recommendations}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Test Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.soilTesting.addSoilTest', 'Add Soil Test')}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.soilTesting.fieldName', 'Field Name *')}
                  </label>
                  <input
                    type="text"
                    value={newTest.fieldName}
                    onChange={(e) => setNewTest(prev => ({ ...prev, fieldName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder={t('tools.soilTesting.eGNorthField', 'e.g., North Field')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.soilTesting.sampleLocation2', 'Sample Location')}
                  </label>
                  <input
                    type="text"
                    value={newTest.sampleLocation}
                    onChange={(e) => setNewTest(prev => ({ ...prev, sampleLocation: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder={t('tools.soilTesting.eGGridA1A3', 'e.g., Grid A1-A3')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.soilTesting.collectionDate2', 'Collection Date')}
                  </label>
                  <input
                    type="date"
                    value={newTest.collectionDate}
                    onChange={(e) => setNewTest(prev => ({ ...prev, collectionDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.soilTesting.labName2', 'Lab Name')}
                  </label>
                  <input
                    type="text"
                    value={newTest.labName}
                    onChange={(e) => setNewTest(prev => ({ ...prev, labName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder={t('tools.soilTesting.eGAgrilabTesting', 'e.g., AgriLab Testing')}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.soilTesting.status2', 'Status')}
                </label>
                <select
                  value={newTest.status}
                  onChange={(e) => setNewTest(prev => ({ ...prev, status: e.target.value as TestStatus }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                >
                  <option value="pending">{t('tools.soilTesting.pending2', 'Pending')}</option>
                  <option value="in_progress">{t('tools.soilTesting.inProgress2', 'In Progress')}</option>
                  <option value="completed">{t('tools.soilTesting.completed3', 'Completed')}</option>
                  <option value="needs_retest">{t('tools.soilTesting.needsRetest2', 'Needs Retest')}</option>
                </select>
              </div>

              {/* Test Results Section */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.soilTesting.testResultsIfAvailable', 'Test Results (if available)')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newTest.pH ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, pH: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.nitrogenPpm2', 'Nitrogen (ppm)')}</label>
                    <input
                      type="number"
                      value={newTest.nitrogen ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, nitrogen: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.phosphorusPpm2', 'Phosphorus (ppm)')}</label>
                    <input
                      type="number"
                      value={newTest.phosphorus ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, phosphorus: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.potassiumPpm2', 'Potassium (ppm)')}</label>
                    <input
                      type="number"
                      value={newTest.potassium ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, potassium: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.organicMatter', 'Organic Matter (%)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newTest.organicMatter ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, organicMatter: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.calciumPpm', 'Calcium (ppm)')}</label>
                    <input
                      type="number"
                      value={newTest.calcium ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, calcium: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.magnesiumPpm', 'Magnesium (ppm)')}</label>
                    <input
                      type="number"
                      value={newTest.magnesium ?? ''}
                      onChange={(e) => setNewTest(prev => ({ ...prev, magnesium: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.texture', 'Texture')}</label>
                    <select
                      value={newTest.texture}
                      onChange={(e) => setNewTest(prev => ({ ...prev, texture: e.target.value }))}
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.soilTesting.select', 'Select...')}</option>
                      <option value="Sandy">{t('tools.soilTesting.sandy', 'Sandy')}</option>
                      <option value="Sandy Loam">{t('tools.soilTesting.sandyLoam', 'Sandy Loam')}</option>
                      <option value="Loamy">{t('tools.soilTesting.loamy', 'Loamy')}</option>
                      <option value="Silty">{t('tools.soilTesting.silty', 'Silty')}</option>
                      <option value="Clay">{t('tools.soilTesting.clay', 'Clay')}</option>
                      <option value="Clay Loam">{t('tools.soilTesting.clayLoam', 'Clay Loam')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.soilTesting.notes2', 'Notes')}
                </label>
                <textarea
                  value={newTest.notes}
                  onChange={(e) => setNewTest(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder={t('tools.soilTesting.anyObservationsAboutTheSample', 'Any observations about the sample...')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.soilTesting.recommendations3', 'Recommendations')}
                </label>
                <textarea
                  value={newTest.recommendations}
                  onChange={(e) => setNewTest(prev => ({ ...prev, recommendations: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder={t('tools.soilTesting.labRecommendationsOrActionItems', 'Lab recommendations or action items...')}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {t('tools.soilTesting.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddTest}
                  disabled={!newTest.fieldName.trim()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('tools.soilTesting.addTest', 'Add Test')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Test Details - {selectedTest.fieldName}
              </h2>
              <button
                onClick={() => setSelectedTest(null)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.sampleLocation', 'Sample Location')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTest.sampleLocation || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.collectionDate', 'Collection Date')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedTest.collectionDate)}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.labName', 'Lab Name')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTest.labName || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soilTesting.status', 'Status')}</p>
                  <span className={`px-2 py-1 text-sm rounded-full ${statusColors[selectedTest.status].bg} ${statusColors[selectedTest.status].text}`}>
                    {statusColors[selectedTest.status].label}
                  </span>
                </div>
              </div>

              {selectedTest.status === 'completed' && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.soilTesting.testResults', 'Test Results')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'pH', value: selectedTest.pH, unit: '' },
                      { label: 'Nitrogen', value: selectedTest.nitrogen, unit: 'ppm' },
                      { label: 'Phosphorus', value: selectedTest.phosphorus, unit: 'ppm' },
                      { label: 'Potassium', value: selectedTest.potassium, unit: 'ppm' },
                      { label: 'Organic Matter', value: selectedTest.organicMatter, unit: '%' },
                      { label: 'Calcium', value: selectedTest.calcium, unit: 'ppm' },
                      { label: 'Magnesium', value: selectedTest.magnesium, unit: 'ppm' },
                      { label: 'Sulfur', value: selectedTest.sulfur, unit: 'ppm' },
                      { label: 'CEC', value: selectedTest.cec, unit: 'meq/100g' },
                      { label: 'Moisture', value: selectedTest.moisture, unit: '%' },
                      { label: 'Texture', value: selectedTest.texture, unit: '' }
                    ].map(item => (
                      <div key={item.label}>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.value !== null && item.value !== '' ? `${item.value}${item.unit ? ' ' + item.unit : ''}` : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTest.notes && (
                <div>
                  <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.soilTesting.notes', 'Notes')}</p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedTest.notes}</p>
                </div>
              )}

              {selectedTest.recommendations && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{t('tools.soilTesting.recommendations', 'Recommendations')}</p>
                  <p className={`${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{selectedTest.recommendations}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export default SoilTestingTool;
