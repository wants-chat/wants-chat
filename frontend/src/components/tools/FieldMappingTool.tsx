'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Map,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Ruler,
  Mountain,
  TreeDeciduous,
  Droplets,
  Sun,
  Info,
  Navigation,
  Square,
  Grid3X3,
  BarChart3,
  FileText
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface FieldMappingToolProps {
  uiConfig?: UIConfig;
}

type SoilType = 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'mixed';
type TerrainType = 'flat' | 'rolling' | 'hilly' | 'terraced' | 'sloped';
type IrrigationType = 'drip' | 'sprinkler' | 'flood' | 'center_pivot' | 'none' | 'manual';
type FieldStatus = 'active' | 'fallow' | 'planned' | 'resting';
type ActiveTab = 'fields' | 'zones' | 'boundaries' | 'analysis';

interface Field {
  id: string;
  name: string;
  acreage: number;
  soilType: SoilType;
  terrain: TerrainType;
  irrigation: IrrigationType;
  status: FieldStatus;
  coordinates: string;
  elevation: number;
  drainageRating: number; // 1-10
  sunExposure: string;
  currentCrop: string;
  previousCrop: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Zone {
  id: string;
  fieldId: string;
  name: string;
  acreage: number;
  purpose: string;
  soilPH: number;
  nutrientLevel: string;
  notes: string;
  createdAt: string;
}

interface Boundary {
  id: string;
  fieldId: string;
  type: string;
  description: string;
  length: number;
  condition: string;
  notes: string;
  createdAt: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const soilTypeLabels: Record<SoilType, string> = {
  clay: 'Clay',
  sandy: 'Sandy',
  loamy: 'Loamy',
  silty: 'Silty',
  peaty: 'Peaty',
  chalky: 'Chalky',
  mixed: 'Mixed'
};

const terrainLabels: Record<TerrainType, string> = {
  flat: 'Flat',
  rolling: 'Rolling',
  hilly: 'Hilly',
  terraced: 'Terraced',
  sloped: 'Sloped'
};

const irrigationLabels: Record<IrrigationType, string> = {
  drip: 'Drip Irrigation',
  sprinkler: 'Sprinkler',
  flood: 'Flood/Furrow',
  center_pivot: 'Center Pivot',
  none: 'None/Rainfed',
  manual: 'Manual'
};

const statusColors: Record<FieldStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-500' },
  fallow: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  planned: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
  resting: { bg: 'bg-gray-500/20', text: 'text-gray-500' }
};

// Column configuration for exports
const fieldColumns: ColumnConfig[] = [
  { key: 'name', header: 'Field Name', type: 'string' },
  { key: 'acreage', header: 'Acreage', type: 'number' },
  { key: 'soilType', header: 'Soil Type', type: 'string' },
  { key: 'terrain', header: 'Terrain', type: 'string' },
  { key: 'irrigation', header: 'Irrigation', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'elevation', header: 'Elevation (ft)', type: 'number' },
  { key: 'drainageRating', header: 'Drainage Rating', type: 'number' },
  { key: 'currentCrop', header: 'Current Crop', type: 'string' },
  { key: 'previousCrop', header: 'Previous Crop', type: 'string' },
  { key: 'coordinates', header: 'Coordinates', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' }
];

// Sample data generator
const generateSampleFields = (): Field[] => [
  {
    id: generateId(),
    name: 'North Pasture',
    acreage: 45.5,
    soilType: 'loamy',
    terrain: 'rolling',
    irrigation: 'center_pivot',
    status: 'active',
    coordinates: '40.7128, -74.0060',
    elevation: 320,
    drainageRating: 8,
    sunExposure: 'Full Sun',
    currentCrop: 'Corn',
    previousCrop: 'Soybeans',
    notes: 'Good drainage, high fertility area',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    name: 'South Field',
    acreage: 32.0,
    soilType: 'clay',
    terrain: 'flat',
    irrigation: 'drip',
    status: 'active',
    coordinates: '40.7100, -74.0100',
    elevation: 285,
    drainageRating: 6,
    sunExposure: 'Full Sun',
    currentCrop: 'Wheat',
    previousCrop: 'Corn',
    notes: 'Needs drainage improvement',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    name: 'Orchard Block A',
    acreage: 12.0,
    soilType: 'sandy',
    terrain: 'sloped',
    irrigation: 'drip',
    status: 'active',
    coordinates: '40.7150, -74.0080',
    elevation: 350,
    drainageRating: 9,
    sunExposure: 'Full Sun',
    currentCrop: 'Apple Trees',
    previousCrop: 'Peach Trees',
    notes: 'Mature orchard, 15 years old',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function FieldMappingTool({ uiConfig }: FieldMappingToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for data persistence
  const {
    data: fields,
    addItem: addField,
    updateItem: updateField,
    deleteItem: deleteField,
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
  } = useToolData<Field>('field-mapping', generateSampleFields(), fieldColumns);

  // Local state for zones and boundaries (stored in localStorage)
  const [zones, setZones] = useState<Zone[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('field-mapping-zones');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [boundaries, setBoundaries] = useState<Boundary[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('field-mapping-boundaries');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('fields');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FieldStatus | 'all'>('all');
  const [soilFilter, setSoilFilter] = useState<SoilType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showBoundaryForm, setShowBoundaryForm] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Form state for new field
  const [newField, setNewField] = useState<Omit<Field, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    acreage: 0,
    soilType: 'loamy',
    terrain: 'flat',
    irrigation: 'none',
    status: 'planned',
    coordinates: '',
    elevation: 0,
    drainageRating: 5,
    sunExposure: 'Full Sun',
    currentCrop: '',
    previousCrop: '',
    notes: ''
  });

  // Save zones and boundaries to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('field-mapping-zones', JSON.stringify(zones));
    }
  }, [zones]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('field-mapping-boundaries', JSON.stringify(boundaries));
    }
  }, [boundaries]);

  // Handle prefill data from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params || (uiConfig as any)?.toolPrefillData) {
      const prefillData = (uiConfig as any)?.toolPrefillData || uiConfig?.params;
      if (prefillData?.fieldName) {
        setNewField(prev => ({ ...prev, name: prefillData.fieldName }));
        setShowAddForm(true);
      }
      if (prefillData?.acreage) {
        setNewField(prev => ({ ...prev, acreage: Number(prefillData.acreage) }));
        setShowAddForm(true);
      }
    }
  }, [uiConfig]);

  // Filtered fields
  const filteredFields = useMemo(() => {
    return fields.filter(field => {
      const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.currentCrop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || field.status === statusFilter;
      const matchesSoil = soilFilter === 'all' || field.soilType === soilFilter;
      return matchesSearch && matchesStatus && matchesSoil;
    });
  }, [fields, searchTerm, statusFilter, soilFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalAcreage = fields.reduce((sum, f) => sum + f.acreage, 0);
    const activeFields = fields.filter(f => f.status === 'active').length;
    const avgDrainage = fields.length > 0
      ? fields.reduce((sum, f) => sum + f.drainageRating, 0) / fields.length
      : 0;
    const byStatus = fields.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalAcreage, activeFields, avgDrainage, byStatus };
  }, [fields]);

  // Handlers
  const handleAddField = () => {
    if (!newField.name.trim()) return;

    const field: Field = {
      ...newField,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addField(field);
    setNewField({
      name: '',
      acreage: 0,
      soilType: 'loamy',
      terrain: 'flat',
      irrigation: 'none',
      status: 'planned',
      coordinates: '',
      elevation: 0,
      drainageRating: 5,
      sunExposure: 'Full Sun',
      currentCrop: '',
      previousCrop: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleUpdateField = (id: string, updates: Partial<Field>) => {
    updateField(id, { ...updates, updatedAt: new Date().toISOString() });
    setEditingId(null);
  };

  const handleDeleteField = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Field',
      message: 'Are you sure you want to delete this field? This action cannot be undone and will also remove all associated zones and boundaries.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteField(id);
      // Also delete associated zones and boundaries
      setZones(prev => prev.filter(z => z.fieldId !== id));
      setBoundaries(prev => prev.filter(b => b.fieldId !== id));
    }
  };

  const handleAddZone = (zone: Omit<Zone, 'id' | 'createdAt'>) => {
    const newZone: Zone = {
      ...zone,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setZones(prev => [...prev, newZone]);
    setShowZoneForm(false);
  };

  const handleAddBoundary = (boundary: Omit<Boundary, 'id' | 'createdAt'>) => {
    const newBoundary: Boundary = {
      ...boundary,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setBoundaries(prev => [...prev, newBoundary]);
    setShowBoundaryForm(false);
  };

  const tabs = [
    { id: 'fields' as ActiveTab, label: 'Fields', icon: Map },
    { id: 'zones' as ActiveTab, label: 'Zones', icon: Grid3X3 },
    { id: 'boundaries' as ActiveTab, label: 'Boundaries', icon: Square },
    { id: 'analysis' as ActiveTab, label: 'Analysis', icon: BarChart3 }
  ];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-3"></div>
        {t('tools.fieldMapping.loadingFieldData', 'Loading field data...')}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
            <Map className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fieldMapping.fieldMapping', 'Field Mapping')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.fieldMapping.trackAndManageYourFarm', 'Track and manage your farm fields')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="field-mapping" toolName="Field Mapping" />

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
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.fieldMapping.addField', 'Add Field')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Ruler className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fieldMapping.totalAcreage', 'Total Acreage')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalAcreage.toFixed(1)} ac
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <Map className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fieldMapping.totalFields', 'Total Fields')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {fields.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fieldMapping.activeFields', 'Active Fields')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeFields}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
              <Droplets className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fieldMapping.avgDrainage', 'Avg Drainage')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgDrainage.toFixed(1)}/10
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
                ? 'bg-teal-500 text-white'
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
      {activeTab === 'fields' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={t('tools.fieldMapping.searchFields', 'Search fields...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FieldStatus | 'all')}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="all">{t('tools.fieldMapping.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.fieldMapping.active', 'Active')}</option>
            <option value="fallow">{t('tools.fieldMapping.fallow', 'Fallow')}</option>
            <option value="planned">{t('tools.fieldMapping.planned', 'Planned')}</option>
            <option value="resting">{t('tools.fieldMapping.resting', 'Resting')}</option>
          </select>

          <select
            value={soilFilter}
            onChange={(e) => setSoilFilter(e.target.value as SoilType | 'all')}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="all">{t('tools.fieldMapping.allSoilTypes', 'All Soil Types')}</option>
            {Object.entries(soilTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          {filteredFields.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.fieldMapping.noFieldsFound', 'No fields found')}</p>
              <p className="text-sm">{t('tools.fieldMapping.addYourFirstFieldTo', 'Add your first field to get started')}</p>
            </div>
          ) : (
            filteredFields.map(field => (
              <div
                key={field.id}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Map className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {field.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {field.acreage} acres
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[field.status].bg} ${statusColors[field.status].text}`}>
                          {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {soilTypeLabels[field.soilType]} Soil
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(field.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.terrain', 'Terrain')}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {terrainLabels[field.terrain]}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.irrigation', 'Irrigation')}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {irrigationLabels[field.irrigation]}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.currentCrop', 'Current Crop')}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {field.currentCrop || 'None'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.elevation', 'Elevation')}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {field.elevation} ft
                    </p>
                  </div>
                </div>

                {field.notes && (
                  <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {field.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.fieldMapping.manageZonesWithinYourFields', 'Manage zones within your fields for detailed tracking')}
            </p>
            <button
              onClick={() => setShowZoneForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('tools.fieldMapping.addZone2', 'Add Zone')}
            </button>
          </div>

          {zones.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.fieldMapping.noZonesDefined', 'No zones defined')}</p>
              <p className="text-sm">{t('tools.fieldMapping.createZonesToSubdivideYour', 'Create zones to subdivide your fields')}</p>
            </div>
          ) : (
            zones.map(zone => {
              const field = fields.find(f => f.id === zone.fieldId);
              return (
                <div key={zone.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{zone.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {field?.name || 'Unknown Field'} - {zone.acreage} acres
                      </p>
                    </div>
                    <button
                      onClick={() => setZones(prev => prev.filter(z => z.id !== zone.id))}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.purpose', 'Purpose')}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{zone.purpose}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.soilPh', 'Soil pH')}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{zone.soilPH}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fieldMapping.nutrientLevel', 'Nutrient Level')}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{zone.nutrientLevel}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'boundaries' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.fieldMapping.trackFieldBoundariesFencesAnd', 'Track field boundaries, fences, and property lines')}
            </p>
            <button
              onClick={() => setShowBoundaryForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('tools.fieldMapping.addBoundary2', 'Add Boundary')}
            </button>
          </div>

          {boundaries.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Square className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.fieldMapping.noBoundariesRecorded', 'No boundaries recorded')}</p>
              <p className="text-sm">{t('tools.fieldMapping.addBoundariesToTrackFences', 'Add boundaries to track fences and property lines')}</p>
            </div>
          ) : (
            boundaries.map(boundary => {
              const field = fields.find(f => f.id === boundary.fieldId);
              return (
                <div key={boundary.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{boundary.type}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {field?.name || 'Unknown Field'} - {boundary.length} ft
                      </p>
                    </div>
                    <button
                      onClick={() => setBoundaries(prev => prev.filter(b => b.id !== boundary.id))}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {boundary.description}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Condition: {boundary.condition}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Acreage by Status */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fieldMapping.fieldsByStatus', 'Fields by Status')}
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusColors[status as FieldStatus].bg}`}></span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {count} field{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Type Distribution */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fieldMapping.soilTypeDistribution', 'Soil Type Distribution')}
            </h3>
            <div className="space-y-3">
              {Object.entries(
                fields.reduce((acc, f) => {
                  acc[f.soilType] = (acc[f.soilType] || 0) + f.acreage;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([soilType, acreage]) => (
                <div key={soilType} className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {soilTypeLabels[soilType as SoilType]}
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {acreage.toFixed(1)} acres
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Irrigation Summary */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fieldMapping.irrigationMethods', 'Irrigation Methods')}
            </h3>
            <div className="space-y-3">
              {Object.entries(
                fields.reduce((acc, f) => {
                  acc[f.irrigation] = (acc[f.irrigation] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([irrigation, count]) => (
                <div key={irrigation} className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {irrigationLabels[irrigation as IrrigationType]}
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {count} field{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.fieldMapping.addNewField', 'Add New Field')}
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
                    {t('tools.fieldMapping.fieldName', 'Field Name *')}
                  </label>
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder={t('tools.fieldMapping.eGNorthPasture', 'e.g., North Pasture')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.acreage2', 'Acreage')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newField.acreage}
                    onChange={(e) => setNewField(prev => ({ ...prev, acreage: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.soilType', 'Soil Type')}
                  </label>
                  <select
                    value={newField.soilType}
                    onChange={(e) => setNewField(prev => ({ ...prev, soilType: e.target.value as SoilType }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    {Object.entries(soilTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.terrain2', 'Terrain')}
                  </label>
                  <select
                    value={newField.terrain}
                    onChange={(e) => setNewField(prev => ({ ...prev, terrain: e.target.value as TerrainType }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    {Object.entries(terrainLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.irrigation2', 'Irrigation')}
                  </label>
                  <select
                    value={newField.irrigation}
                    onChange={(e) => setNewField(prev => ({ ...prev, irrigation: e.target.value as IrrigationType }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    {Object.entries(irrigationLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.status', 'Status')}
                  </label>
                  <select
                    value={newField.status}
                    onChange={(e) => setNewField(prev => ({ ...prev, status: e.target.value as FieldStatus }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="planned">{t('tools.fieldMapping.planned2', 'Planned')}</option>
                    <option value="active">{t('tools.fieldMapping.active2', 'Active')}</option>
                    <option value="fallow">{t('tools.fieldMapping.fallow2', 'Fallow')}</option>
                    <option value="resting">{t('tools.fieldMapping.resting2', 'Resting')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.coordinates', 'Coordinates')}
                  </label>
                  <input
                    type="text"
                    value={newField.coordinates}
                    onChange={(e) => setNewField(prev => ({ ...prev, coordinates: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., 40.7128, -74.0060"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.elevationFt', 'Elevation (ft)')}
                  </label>
                  <input
                    type="number"
                    value={newField.elevation}
                    onChange={(e) => setNewField(prev => ({ ...prev, elevation: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.drainageRating110', 'Drainage Rating (1-10)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newField.drainageRating}
                    onChange={(e) => setNewField(prev => ({ ...prev, drainageRating: parseInt(e.target.value) || 5 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.sunExposure', 'Sun Exposure')}
                  </label>
                  <select
                    value={newField.sunExposure}
                    onChange={(e) => setNewField(prev => ({ ...prev, sunExposure: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="Full Sun">{t('tools.fieldMapping.fullSun', 'Full Sun')}</option>
                    <option value="Partial Sun">{t('tools.fieldMapping.partialSun', 'Partial Sun')}</option>
                    <option value="Partial Shade">{t('tools.fieldMapping.partialShade', 'Partial Shade')}</option>
                    <option value="Full Shade">{t('tools.fieldMapping.fullShade', 'Full Shade')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.currentCrop2', 'Current Crop')}
                  </label>
                  <input
                    type="text"
                    value={newField.currentCrop}
                    onChange={(e) => setNewField(prev => ({ ...prev, currentCrop: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder={t('tools.fieldMapping.eGCorn', 'e.g., Corn')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fieldMapping.previousCrop', 'Previous Crop')}
                  </label>
                  <input
                    type="text"
                    value={newField.previousCrop}
                    onChange={(e) => setNewField(prev => ({ ...prev, previousCrop: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder={t('tools.fieldMapping.eGSoybeans', 'e.g., Soybeans')}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.fieldMapping.notes', 'Notes')}
                </label>
                <textarea
                  value={newField.notes}
                  onChange={(e) => setNewField(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder={t('tools.fieldMapping.additionalNotesAboutThisField', 'Additional notes about this field...')}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {t('tools.fieldMapping.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddField}
                  disabled={!newField.name.trim()}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('tools.fieldMapping.addField2', 'Add Field')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {showZoneForm && (
        <ZoneForm
          isDark={isDark}
          fields={fields}
          onClose={() => setShowZoneForm(false)}
          onSave={handleAddZone}
        />
      )}

      {/* Add Boundary Modal */}
      {showBoundaryForm && (
        <BoundaryForm
          isDark={isDark}
          fields={fields}
          onClose={() => setShowBoundaryForm(false)}
          onSave={handleAddBoundary}
        />
      )}

      <ConfirmDialog />
    </div>
  );
}

// Zone Form Component
function ZoneForm({
  isDark,
  fields,
  onClose,
  onSave
}: {
  isDark: boolean;
  fields: Field[];
  onClose: () => void;
  onSave: (zone: Omit<Zone, 'id' | 'createdAt'>) => void;
}) {
  const [zone, setZone] = useState({
    fieldId: fields[0]?.id || '',
    name: '',
    acreage: 0,
    purpose: '',
    soilPH: 7.0,
    nutrientLevel: 'Medium',
    notes: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fieldMapping.addZone', 'Add Zone')}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.field', 'Field')}</label>
            <select
              value={zone.fieldId}
              onChange={(e) => setZone(prev => ({ ...prev, fieldId: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.zoneName', 'Zone Name')}</label>
            <input
              type="text"
              value={zone.name}
              onChange={(e) => setZone(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder={t('tools.fieldMapping.eGZoneA', 'e.g., Zone A')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.acreage', 'Acreage')}</label>
              <input
                type="number"
                step="0.1"
                value={zone.acreage}
                onChange={(e) => setZone(prev => ({ ...prev, acreage: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.soilPh2', 'Soil pH')}</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={zone.soilPH}
                onChange={(e) => setZone(prev => ({ ...prev, soilPH: parseFloat(e.target.value) || 7 }))}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.purpose2', 'Purpose')}</label>
            <input
              type="text"
              value={zone.purpose}
              onChange={(e) => setZone(prev => ({ ...prev, purpose: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder={t('tools.fieldMapping.eGVegetableRotation', 'e.g., Vegetable rotation')}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.nutrientLevel2', 'Nutrient Level')}</label>
            <select
              value={zone.nutrientLevel}
              onChange={(e) => setZone(prev => ({ ...prev, nutrientLevel: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="Low">{t('tools.fieldMapping.low', 'Low')}</option>
              <option value="Medium">{t('tools.fieldMapping.medium', 'Medium')}</option>
              <option value="High">{t('tools.fieldMapping.high', 'High')}</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              {t('tools.fieldMapping.cancel2', 'Cancel')}
            </button>
            <button
              onClick={() => onSave(zone)}
              disabled={!zone.name.trim() || !zone.fieldId}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
            >
              {t('tools.fieldMapping.addZone3', 'Add Zone')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Boundary Form Component
function BoundaryForm({
  isDark,
  fields,
  onClose,
  onSave
}: {
  isDark: boolean;
  fields: Field[];
  onClose: () => void;
  onSave: (boundary: Omit<Boundary, 'id' | 'createdAt'>) => void;
}) {
  const [boundary, setBoundary] = useState({
    fieldId: fields[0]?.id || '',
    type: 'Fence',
    description: '',
    length: 0,
    condition: 'Good',
    notes: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fieldMapping.addBoundary', 'Add Boundary')}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.field2', 'Field')}</label>
            <select
              value={boundary.fieldId}
              onChange={(e) => setBoundary(prev => ({ ...prev, fieldId: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.type', 'Type')}</label>
            <select
              value={boundary.type}
              onChange={(e) => setBoundary(prev => ({ ...prev, type: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="Fence">{t('tools.fieldMapping.fence', 'Fence')}</option>
              <option value="Wall">{t('tools.fieldMapping.wall', 'Wall')}</option>
              <option value="Hedge">{t('tools.fieldMapping.hedge', 'Hedge')}</option>
              <option value="Road">{t('tools.fieldMapping.road', 'Road')}</option>
              <option value="Stream">{t('tools.fieldMapping.stream', 'Stream')}</option>
              <option value="Property Line">{t('tools.fieldMapping.propertyLine', 'Property Line')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.lengthFt', 'Length (ft)')}</label>
              <input
                type="number"
                value={boundary.length}
                onChange={(e) => setBoundary(prev => ({ ...prev, length: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.condition', 'Condition')}</label>
              <select
                value={boundary.condition}
                onChange={(e) => setBoundary(prev => ({ ...prev, condition: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              >
                <option value="Excellent">{t('tools.fieldMapping.excellent', 'Excellent')}</option>
                <option value="Good">{t('tools.fieldMapping.good', 'Good')}</option>
                <option value="Fair">{t('tools.fieldMapping.fair', 'Fair')}</option>
                <option value="Poor">{t('tools.fieldMapping.poor', 'Poor')}</option>
                <option value="Needs Repair">{t('tools.fieldMapping.needsRepair', 'Needs Repair')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.fieldMapping.description', 'Description')}</label>
            <input
              type="text"
              value={boundary.description}
              onChange={(e) => setBoundary(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder={t('tools.fieldMapping.eGNorthFenceLine', 'e.g., North fence line')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              {t('tools.fieldMapping.cancel3', 'Cancel')}
            </button>
            <button
              onClick={() => onSave(boundary)}
              disabled={!boundary.fieldId}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
            >
              {t('tools.fieldMapping.addBoundary3', 'Add Boundary')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldMappingTool;
