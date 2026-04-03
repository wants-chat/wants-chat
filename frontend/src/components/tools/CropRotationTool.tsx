'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Search,
  Calendar,
  Leaf,
  Sprout,
  TreeDeciduous,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowRight,
  Info,
  BarChart3,
  Clock
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface CropRotationToolProps {
  uiConfig?: UIConfig;
}

type CropFamily = 'brassicas' | 'legumes' | 'solanaceae' | 'cucurbits' | 'alliums' | 'roots' | 'leafy_greens' | 'grains' | 'other';
type Season = 'spring' | 'summer' | 'fall' | 'winter';
type ActiveTab = 'rotations' | 'schedule' | 'recommendations' | 'history';

interface RotationPlan {
  id: string;
  fieldName: string;
  year: number;
  season: Season;
  cropName: string;
  cropFamily: CropFamily;
  previousCrop: string;
  previousFamily: CropFamily;
  duration: number; // days
  plantingDate: string;
  harvestDate: string;
  nitrogenBalance: number; // positive = adds, negative = depletes
  notes: string;
  status: 'planned' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const cropFamilyLabels: Record<CropFamily, { name: string; color: string }> = {
  brassicas: { name: 'Brassicas (Cabbage family)', color: 'bg-green-500' },
  legumes: { name: 'Legumes (Beans/Peas)', color: 'bg-emerald-500' },
  solanaceae: { name: 'Solanaceae (Nightshades)', color: 'bg-red-500' },
  cucurbits: { name: 'Cucurbits (Squash family)', color: 'bg-yellow-500' },
  alliums: { name: 'Alliums (Onion family)', color: 'bg-purple-500' },
  roots: { name: 'Root Vegetables', color: 'bg-orange-500' },
  leafy_greens: { name: 'Leafy Greens', color: 'bg-lime-500' },
  grains: { name: 'Grains/Cereals', color: 'bg-amber-500' },
  other: { name: 'Other', color: 'bg-gray-500' }
};

const seasonLabels: Record<Season, { name: string; icon: string }> = {
  spring: { name: 'Spring', icon: '🌱' },
  summer: { name: 'Summer', icon: '☀️' },
  fall: { name: 'Fall', icon: '🍂' },
  winter: { name: 'Winter', icon: '❄️' }
};

// Rotation compatibility matrix
const rotationCompatibility: Record<CropFamily, CropFamily[]> = {
  brassicas: ['legumes', 'roots', 'alliums'],
  legumes: ['brassicas', 'leafy_greens', 'cucurbits', 'grains'],
  solanaceae: ['legumes', 'brassicas', 'grains'],
  cucurbits: ['legumes', 'roots', 'alliums'],
  alliums: ['brassicas', 'cucurbits', 'leafy_greens'],
  roots: ['legumes', 'brassicas', 'leafy_greens'],
  leafy_greens: ['legumes', 'roots', 'alliums'],
  grains: ['legumes', 'roots', 'brassicas'],
  other: ['legumes', 'grains', 'roots']
};

// Column configuration for exports
const rotationColumns: ColumnConfig[] = [
  { key: 'fieldName', header: 'Field Name', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'season', header: 'Season', type: 'string' },
  { key: 'cropName', header: 'Crop', type: 'string' },
  { key: 'cropFamily', header: 'Crop Family', type: 'string' },
  { key: 'previousCrop', header: 'Previous Crop', type: 'string' },
  { key: 'plantingDate', header: 'Planting Date', type: 'date' },
  { key: 'harvestDate', header: 'Harvest Date', type: 'date' },
  { key: 'duration', header: 'Duration (days)', type: 'number' },
  { key: 'nitrogenBalance', header: 'N Balance', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' }
];

// Sample data generator
const generateSampleRotations = (): RotationPlan[] => {
  const currentYear = new Date().getFullYear();
  return [
    {
      id: generateId(),
      fieldName: 'North Field',
      year: currentYear,
      season: 'spring',
      cropName: 'Corn',
      cropFamily: 'grains',
      previousCrop: 'Soybeans',
      previousFamily: 'legumes',
      duration: 120,
      plantingDate: `${currentYear}-04-15`,
      harvestDate: `${currentYear}-08-15`,
      nitrogenBalance: -50,
      notes: 'Following legumes for nitrogen benefit',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      fieldName: 'South Field',
      year: currentYear,
      season: 'spring',
      cropName: 'Soybeans',
      cropFamily: 'legumes',
      previousCrop: 'Corn',
      previousFamily: 'grains',
      duration: 100,
      plantingDate: `${currentYear}-05-01`,
      harvestDate: `${currentYear}-09-15`,
      nitrogenBalance: 40,
      notes: 'Nitrogen-fixing crop for soil improvement',
      status: 'active',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      fieldName: 'East Garden',
      year: currentYear,
      season: 'summer',
      cropName: 'Tomatoes',
      cropFamily: 'solanaceae',
      previousCrop: 'Peas',
      previousFamily: 'legumes',
      duration: 90,
      plantingDate: `${currentYear}-05-15`,
      harvestDate: `${currentYear}-08-15`,
      nitrogenBalance: -30,
      notes: 'Good rotation after legumes',
      status: 'planned',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

export function CropRotationTool({
  uiConfig }: CropRotationToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  const {
    data: rotations,
    addItem: addRotation,
    updateItem: updateRotation,
    deleteItem: deleteRotation,
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
  } = useToolData<RotationPlan>('crop-rotation', generateSampleRotations(), rotationColumns);

  const [activeTab, setActiveTab] = useState<ActiveTab>('rotations');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [familyFilter, setFamilyFilter] = useState<CropFamily | 'all'>('all');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.cropFamily && cropFamilyLabels[params.cropFamily as CropFamily]) {
        setFamilyFilter(params.cropFamily);
        hasChanges = true;
      }
      if (params.year && typeof params.year === 'number') {
        setYearFilter(params.year);
        hasChanges = true;
      }
      if (params.tab && ['rotations', 'schedule', 'recommendations', 'history'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [showAddForm, setShowAddForm] = useState(false);

  const currentYear = new Date().getFullYear();

  const [newRotation, setNewRotation] = useState<Omit<RotationPlan, 'id' | 'createdAt' | 'updatedAt'>>({
    fieldName: '',
    year: currentYear,
    season: 'spring',
    cropName: '',
    cropFamily: 'other',
    previousCrop: '',
    previousFamily: 'other',
    duration: 90,
    plantingDate: '',
    harvestDate: '',
    nitrogenBalance: 0,
    notes: '',
    status: 'planned'
  });

  React.useEffect(() => {
    if (uiConfig?.params || (uiConfig as any)?.toolPrefillData) {
      const prefillData = (uiConfig as any)?.toolPrefillData || uiConfig?.params;
      if (prefillData?.fieldName) {
        setNewRotation(prev => ({ ...prev, fieldName: prefillData.fieldName }));
        setShowAddForm(true);
      }
    }
  }, [uiConfig]);

  const filteredRotations = useMemo(() => {
    return rotations.filter(r => {
      const matchesSearch = r.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cropName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || r.year === yearFilter;
      const matchesFamily = familyFilter === 'all' || r.cropFamily === familyFilter;
      return matchesSearch && matchesYear && matchesFamily;
    });
  }, [rotations, searchTerm, yearFilter, familyFilter]);

  const stats = useMemo(() => {
    const thisYear = rotations.filter(r => r.year === currentYear);
    const goodRotations = rotations.filter(r => {
      const compatible = rotationCompatibility[r.previousFamily];
      return compatible?.includes(r.cropFamily);
    }).length;

    return {
      totalPlans: rotations.length,
      thisYearPlans: thisYear.length,
      goodRotations,
      avgNitrogen: rotations.length > 0
        ? rotations.reduce((sum, r) => sum + r.nitrogenBalance, 0) / rotations.length
        : 0
    };
  }, [rotations, currentYear]);

  const handleAddRotation = () => {
    if (!newRotation.fieldName.trim() || !newRotation.cropName.trim()) return;

    const rotation: RotationPlan = {
      ...newRotation,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addRotation(rotation);
    setNewRotation({
      fieldName: '',
      year: currentYear,
      season: 'spring',
      cropName: '',
      cropFamily: 'other',
      previousCrop: '',
      previousFamily: 'other',
      duration: 90,
      plantingDate: '',
      harvestDate: '',
      nitrogenBalance: 0,
      notes: '',
      status: 'planned'
    });
    setShowAddForm(false);
  };

  const getRotationRecommendation = (previousFamily: CropFamily): CropFamily[] => {
    return rotationCompatibility[previousFamily] || [];
  };

  const isGoodRotation = (current: CropFamily, previous: CropFamily): boolean => {
    return rotationCompatibility[previous]?.includes(current) || false;
  };

  const tabs = [
    { id: 'rotations' as ActiveTab, label: 'Rotation Plans', icon: RotateCcw },
    { id: 'schedule' as ActiveTab, label: 'Schedule', icon: Calendar },
    { id: 'recommendations' as ActiveTab, label: 'Recommendations', icon: Leaf },
    { id: 'history' as ActiveTab, label: 'History', icon: Clock }
  ];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-3"></div>
        {t('tools.cropRotation.loadingRotationData', 'Loading rotation data...')}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
            <RotateCcw className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.cropRotation.cropRotationPlanner', 'Crop Rotation Planner')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.cropRotation.planAndTrackCropRotations', 'Plan and track crop rotations for soil health')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="crop-rotation" toolName="Crop Rotation" />

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
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.cropRotation.addRotation', 'Add Rotation')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <RotateCcw className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cropRotation.totalPlans', 'Total Plans')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalPlans}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cropRotation.thisYear', 'This Year')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.thisYearPlans}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cropRotation.goodRotations', 'Good Rotations')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.goodRotations}
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
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cropRotation.avgNBalance', 'Avg N Balance')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgNitrogen > 0 ? '+' : ''}{stats.avgNitrogen.toFixed(0)}
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
                ? 'bg-green-500 text-white'
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
      {activeTab === 'rotations' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={t('tools.cropRotation.searchRotations', 'Search rotations...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          <select
            value={yearFilter === 'all' ? 'all' : yearFilter.toString()}
            onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.cropRotation.allYears', 'All Years')}</option>
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value as CropFamily | 'all')}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.cropRotation.allFamilies', 'All Families')}</option>
            {Object.entries(cropFamilyLabels).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'rotations' && (
        <div className="space-y-4">
          {filteredRotations.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.cropRotation.noRotationPlansFound', 'No rotation plans found')}</p>
              <p className="text-sm">{t('tools.cropRotation.addYourFirstRotationPlan', 'Add your first rotation plan to get started')}</p>
            </div>
          ) : (
            filteredRotations.map(rotation => (
              <div key={rotation.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${cropFamilyLabels[rotation.cropFamily].color}`}></div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {rotation.fieldName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rotation.previousCrop}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {rotation.cropName}
                        </span>
                        {isGoodRotation(rotation.cropFamily, rotation.previousFamily) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rotation.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      rotation.status === 'active' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {rotation.status}
                    </span>
                    <button
                      onClick={() => deleteRotation(rotation.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.cropRotation.season', 'Season')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {seasonLabels[rotation.season].icon} {seasonLabels[rotation.season].name} {rotation.year}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.cropRotation.duration', 'Duration')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {rotation.duration} days
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.cropRotation.nBalance', 'N Balance')}</p>
                    <p className={`text-sm font-medium ${rotation.nitrogenBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {rotation.nitrogenBalance > 0 ? '+' : ''}{rotation.nitrogenBalance}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.cropRotation.cropFamily', 'Crop Family')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {cropFamilyLabels[rotation.cropFamily].name.split(' ')[0]}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentYear} Rotation Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['spring', 'summer', 'fall', 'winter'] as Season[]).map(season => {
              const seasonRotations = rotations.filter(r => r.year === currentYear && r.season === season);
              return (
                <div key={season} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {seasonLabels[season].icon} {seasonLabels[season].name}
                  </h4>
                  {seasonRotations.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cropRotation.noPlans', 'No plans')}</p>
                  ) : (
                    <div className="space-y-2">
                      {seasonRotations.map(r => (
                        <div key={r.id} className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.cropName}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{r.fieldName}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.cropRotation.rotationCompatibilityGuide', 'Rotation Compatibility Guide')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(rotationCompatibility).map(([family, compatibleFamilies]) => (
                <div key={family} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${cropFamilyLabels[family as CropFamily].color}`}></div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      After {cropFamilyLabels[family as CropFamily].name.split(' ')[0]}
                    </h4>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Good to plant: {compatibleFamilies.map(f => cropFamilyLabels[f].name.split(' ')[0]).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              {t('tools.cropRotation.bestPractices', 'Best Practices')}
            </h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              <li>- Rotate legumes before nitrogen-hungry crops like corn</li>
              <li>- Avoid planting same family in succession (3-4 year gap)</li>
              <li>- Include cover crops to improve soil health</li>
              <li>- Consider pest and disease cycles when planning</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {rotations.filter(r => r.status === 'completed').length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.cropRotation.noCompletedRotations', 'No completed rotations')}</p>
              <p className="text-sm">{t('tools.cropRotation.completedRotationPlansWillAppear', 'Completed rotation plans will appear here')}</p>
            </div>
          ) : (
            rotations.filter(r => r.status === 'completed').map(rotation => (
              <div key={rotation.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {rotation.fieldName} - {rotation.cropName}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {seasonLabels[rotation.season].name} {rotation.year}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Rotation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cropRotation.addRotationPlan', 'Add Rotation Plan')}
              </h2>
              <button onClick={() => setShowAddForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.fieldName', 'Field Name *')}</label>
                  <input
                    type="text"
                    value={newRotation.fieldName}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, fieldName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.cropName', 'Crop Name *')}</label>
                  <input
                    type="text"
                    value={newRotation.cropName}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, cropName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.cropFamily2', 'Crop Family')}</label>
                  <select
                    value={newRotation.cropFamily}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, cropFamily: e.target.value as CropFamily }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {Object.entries(cropFamilyLabels).map(([key, { name }]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.previousCrop', 'Previous Crop')}</label>
                  <input
                    type="text"
                    value={newRotation.previousCrop}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, previousCrop: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.year', 'Year')}</label>
                  <select
                    value={newRotation.year}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.season2', 'Season')}</label>
                  <select
                    value={newRotation.season}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, season: e.target.value as Season }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {Object.entries(seasonLabels).map(([key, { name, icon }]) => (
                      <option key={key} value={key}>{icon} {name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.durationDays', 'Duration (days)')}</label>
                  <input
                    type="number"
                    value={newRotation.duration}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.plantingDate', 'Planting Date')}</label>
                  <input
                    type="date"
                    value={newRotation.plantingDate}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, plantingDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.expectedHarvest', 'Expected Harvest')}</label>
                  <input
                    type="date"
                    value={newRotation.harvestDate}
                    onChange={(e) => setNewRotation(prev => ({ ...prev, harvestDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cropRotation.notes', 'Notes')}</label>
                <textarea
                  value={newRotation.notes}
                  onChange={(e) => setNewRotation(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {t('tools.cropRotation.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddRotation}
                  disabled={!newRotation.fieldName.trim() || !newRotation.cropName.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {t('tools.cropRotation.addPlan', 'Add Plan')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CropRotationTool;
