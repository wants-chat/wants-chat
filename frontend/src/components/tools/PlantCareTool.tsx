'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Sprout, Droplets, Sun, Trash2, Plus, Calendar, AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type PlantType = 'succulent' | 'tropical' | 'flowering' | 'herb' | 'fern' | 'cactus' | 'vegetable' | 'tree' | 'shrub' | 'orchid';

interface CareRecord {
  id: string;
  date: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'pest-control' | 'inspection';
  notes: string;
}

interface PlantProfile {
  id: string;
  name: string;
  type: PlantType;
  location: string;
  dateAdded: string;
  lastWatered: string;
  wateringFrequencyDays: number;
  lastFertilized: string;
  fertilizingFrequencyMonths: number;
  sunlightRequirement: 'full-sun' | 'partial-shade' | 'shade';
  wateringNeeds: 'low' | 'medium' | 'high';
  careHistory: CareRecord[];
  notes: string;
}

interface PlantTypeConfig {
  name: string;
  defaultWateringDays: number;
  defaultFertilizingMonths: number;
  sunlightRequirement: 'full-sun' | 'partial-shade' | 'shade';
  wateringNeeds: 'low' | 'medium' | 'high';
  careNotes: string;
}

const plantTypeConfigs: Record<PlantType, PlantTypeConfig> = {
  succulent: {
    name: 'Succulent',
    defaultWateringDays: 14,
    defaultFertilizingMonths: 3,
    sunlightRequirement: 'full-sun',
    wateringNeeds: 'low',
    careNotes: 'Let soil dry completely between waterings. Provide bright light.',
  },
  tropical: {
    name: 'Tropical',
    defaultWateringDays: 7,
    defaultFertilizingMonths: 1,
    sunlightRequirement: 'partial-shade',
    wateringNeeds: 'high',
    careNotes: 'Keep soil moist but not soggy. Prefers humidity.',
  },
  flowering: {
    name: 'Flowering Plant',
    defaultWateringDays: 5,
    defaultFertilizingMonths: 1,
    sunlightRequirement: 'full-sun',
    wateringNeeds: 'medium',
    careNotes: 'Water when top inch of soil is dry. Deadhead spent flowers.',
  },
  herb: {
    name: 'Herb',
    defaultWateringDays: 3,
    defaultFertilizingMonths: 2,
    sunlightRequirement: 'full-sun',
    wateringNeeds: 'medium',
    careNotes: 'Keep soil consistently moist. Pinch tips regularly for bushiness.',
  },
  fern: {
    name: 'Fern',
    defaultWateringDays: 4,
    defaultFertilizingMonths: 2,
    sunlightRequirement: 'shade',
    wateringNeeds: 'high',
    careNotes: 'Loves humidity. Mist regularly. Keep soil evenly moist.',
  },
  cactus: {
    name: 'Cactus',
    defaultWateringDays: 21,
    defaultFertilizingMonths: 6,
    sunlightRequirement: 'full-sun',
    wateringNeeds: 'low',
    careNotes: 'Water sparingly. Minimal care needed. Excellent for beginners.',
  },
  vegetable: {
    name: 'Vegetable',
    defaultWateringDays: 2,
    defaultFertilizingMonths: 1,
    sunlightRequirement: 'full-sun',
    wateringNeeds: 'high',
    careNotes: 'Consistent watering for best harvest. Feed regularly during growing season.',
  },
  tree: {
    name: 'Indoor Tree',
    defaultWateringDays: 10,
    defaultFertilizingMonths: 2,
    sunlightRequirement: 'partial-shade',
    wateringNeeds: 'medium',
    careNotes: 'Water deeply but infrequently. Rotate regularly for even growth.',
  },
  shrub: {
    name: 'Shrub',
    defaultWateringDays: 7,
    defaultFertilizingMonths: 2,
    sunlightRequirement: 'partial-shade',
    wateringNeeds: 'medium',
    careNotes: 'Prune to shape. Water at soil level, not on foliage.',
  },
  orchid: {
    name: 'Orchid',
    defaultWateringDays: 7,
    defaultFertilizingMonths: 2,
    sunlightRequirement: 'partial-shade',
    wateringNeeds: 'medium',
    careNotes: 'Requires high humidity and good air circulation. Use orchid bark.',
  },
};

const careTypes = [
  'Watering',
  'Fertilizing',
  'Pruning',
  'Repotting',
  'Pest Control',
  'Inspection',
];

const CARE_HISTORY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'type', header: 'Care Type', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface PlantCareToolProps {
  uiConfig?: UIConfig;
}

export const PlantCareTool: React.FC<PlantCareToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize with useToolData hook
  const {
    data: plants,
    addItem: addPlant,
    updateItem: updatePlant,
    deleteItem: deletePlant,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PlantProfile>('plant-care', [
    {
      id: '1',
      name: 'My Monstera',
      type: 'tropical',
      location: 'Living Room',
      dateAdded: '2024-01-15',
      lastWatered: new Date().toISOString().split('T')[0],
      wateringFrequencyDays: 7,
      lastFertilized: '2024-11-01',
      fertilizingFrequencyMonths: 1,
      sunlightRequirement: 'partial-shade',
      wateringNeeds: 'high',
      careHistory: [
        { id: '1', date: '2024-12-20', type: 'watering', notes: 'Regular watering session' },
        { id: '2', date: '2024-12-01', type: 'fertilizing', notes: 'Applied balanced fertilizer' },
      ],
      notes: 'Growing well, add moss pole for climbing',
    },
  ], CARE_HISTORY_COLUMNS);

  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'history'>('overview');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('1');
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddCare, setShowAddCare] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantType, setNewPlantType] = useState<PlantType>('tropical');
  const [newPlantLocation, setNewPlantLocation] = useState('');
  const [newCareRecord, setNewCareRecord] = useState({
    type: 'watering',
    notes: '',
  });
  const [plantErrors, setPlantErrors] = useState<Record<string, string>>({});

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.plantType) {
        setNewPlantType(params.plantType as PlantType);
        setIsPrefilled(true);
      }
      if (params.activeTab) {
        setActiveTab(params.activeTab as 'overview' | 'care' | 'history');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const selectedPlant = plants.find((p) => p.id === selectedPlantId);
  const config = selectedPlant ? plantTypeConfigs[selectedPlant.type] : plantTypeConfigs.tropical;

  const plantStatus = useMemo(() => {
    if (!selectedPlant) return null;

    const lastWatered = new Date(selectedPlant.lastWatered);
    const today = new Date();
    const daysSinceWatered = Math.floor((today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));

    const nextWateringDate = new Date(lastWatered);
    nextWateringDate.setDate(nextWateringDate.getDate() + selectedPlant.wateringFrequencyDays);
    const daysUntilWatering = Math.floor((nextWateringDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const lastFertilized = new Date(selectedPlant.lastFertilized);
    const monthsSinceFertilized = (today.getFullYear() - lastFertilized.getFullYear()) * 12 +
                                  (today.getMonth() - lastFertilized.getMonth());

    const nextFertilizingDate = new Date(lastFertilized);
    nextFertilizingDate.setMonth(nextFertilizingDate.getMonth() + selectedPlant.fertilizingFrequencyMonths);
    const monthsUntilFertilizing = (nextFertilizingDate.getFullYear() - today.getFullYear()) * 12 +
                                   (nextFertilizingDate.getMonth() - today.getMonth());

    let wateringStatus: 'ok' | 'soon' | 'overdue';
    if (daysUntilWatering < 0) {
      wateringStatus = 'overdue';
    } else if (daysUntilWatering <= 1) {
      wateringStatus = 'soon';
    } else {
      wateringStatus = 'ok';
    }

    let fertilizingStatus: 'ok' | 'soon' | 'overdue';
    if (monthsUntilFertilizing < 0) {
      fertilizingStatus = 'overdue';
    } else if (monthsUntilFertilizing <= 1) {
      fertilizingStatus = 'soon';
    } else {
      fertilizingStatus = 'ok';
    }

    return {
      daysSinceWatered,
      daysUntilWatering,
      wateringStatus,
      monthsSinceFertilized,
      monthsUntilFertilizing,
      fertilizingStatus,
      nextWateringDate,
      nextFertilizingDate,
    };
  }, [selectedPlant]);

  const handleAddPlant = () => {
    const errors: Record<string, string> = {};
    if (!newPlantName.trim()) {
      errors.name = 'Plant name is required';
    }
    if (!newPlantLocation.trim()) {
      errors.location = 'Location is required';
    }
    if (Object.keys(errors).length > 0) {
      setPlantErrors(errors);
      return;
    }
    setPlantErrors({});

    const newPlant: PlantProfile = {
      id: Date.now().toString(),
      name: newPlantName.trim(),
      type: newPlantType,
      location: newPlantLocation.trim(),
      dateAdded: new Date().toISOString().split('T')[0],
      lastWatered: new Date().toISOString().split('T')[0],
      wateringFrequencyDays: plantTypeConfigs[newPlantType].defaultWateringDays,
      lastFertilized: new Date().toISOString().split('T')[0],
      fertilizingFrequencyMonths: plantTypeConfigs[newPlantType].defaultFertilizingMonths,
      sunlightRequirement: plantTypeConfigs[newPlantType].sunlightRequirement,
      wateringNeeds: plantTypeConfigs[newPlantType].wateringNeeds,
      careHistory: [],
      notes: '',
    };

    addPlant(newPlant);
    setSelectedPlantId(newPlant.id);
    setNewPlantName('');
    setNewPlantLocation('');
    setNewPlantType('tropical');
    setShowAddPlant(false);
  };

  const handleDeletePlant = (id: string) => {
    deletePlant(id);
    if (selectedPlantId === id && plants.length > 1) {
      const remaining = plants.filter((p) => p.id !== id);
      setSelectedPlantId(remaining[0].id);
    }
  };

  const handleWaterPlant = () => {
    if (!selectedPlant) return;

    updatePlant(selectedPlantId, {
      lastWatered: new Date().toISOString().split('T')[0],
      careHistory: [
        ...selectedPlant.careHistory,
        {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: 'watering',
          notes: 'Regular watering',
        },
      ],
    });
  };

  const handleAddCareRecord = () => {
    if (!selectedPlant || !newCareRecord.type) return;

    const careTypeKey = newCareRecord.type.toLowerCase().replace(' ', '-') as
      | 'watering'
      | 'fertilizing'
      | 'pruning'
      | 'repotting'
      | 'pest-control'
      | 'inspection';

    const record: CareRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: careTypeKey,
      notes: newCareRecord.notes,
    };

    let updates: Partial<PlantProfile> = {
      careHistory: [...selectedPlant.careHistory, record],
    };

    if (careTypeKey === 'watering') {
      updates.lastWatered = record.date;
    } else if (careTypeKey === 'fertilizing') {
      updates.lastFertilized = record.date;
    }

    updatePlant(selectedPlantId, updates);
    setNewCareRecord({ type: 'watering', notes: '' });
    setShowAddCare(false);
  };

  const getStatusColor = (status: 'ok' | 'soon' | 'overdue') => {
    if (status === 'overdue') return 'text-red-500';
    if (status === 'soon') return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusBgColor = (status: 'ok' | 'soon' | 'overdue') => {
    if (status === 'overdue') return 'bg-red-500';
    if (status === 'soon') return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusLabel = (status: 'ok' | 'soon' | 'overdue') => {
    if (status === 'overdue') return 'Overdue';
    if (status === 'soon') return 'Soon';
    return 'Good';
  };

  const getExportData = () => {
    if (!selectedPlant) return [];
    return selectedPlant.careHistory.map((record) => ({
      date: record.date,
      type: record.type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      notes: record.notes || '',
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return;
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return;
  };

  const handleExportJSON = () => {
    const data = getExportData();
    if (data.length === 0) return;
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    if (data.length === 0) return;
  };

  const handlePrint = () => {
    const data = getExportData();
    if (data.length === 0) return;
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const data = getExportData();
    if (data.length === 0) return false;
    return true;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><Leaf className="w-5 h-5 text-green-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantCare.plantCareTracker', 'Plant Care Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plantCare.monitorAndCareForYour', 'Monitor and care for your plants')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="plant-care" toolName="Plant Care" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Plant Selector */}
        <div className="flex gap-2 flex-wrap">
          {plants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlantId(plant.id)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${selectedPlantId === plant.id ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Leaf className="w-4 h-4" />
              {plant.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddPlant(true)}
            className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.plantCare.addPlant', 'Add Plant')}
          </button>
        </div>

        {/* Add Plant Form */}
        {showAddPlant && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantCare.addNewPlant', 'Add New Plant')}</h4>
            <div>
              <input
                type="text"
                value={newPlantName}
                onChange={(e) => {
                  setNewPlantName(e.target.value);
                  if (plantErrors.name) setPlantErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder={t('tools.plantCare.plantName', 'Plant name')}
                className={`w-full px-4 py-2 rounded-lg border ${plantErrors.name ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {plantErrors.name && <p className="text-red-500 text-xs mt-1">{plantErrors.name}</p>}
            </div>
            <div>
              <input
                type="text"
                value={newPlantLocation}
                onChange={(e) => {
                  setNewPlantLocation(e.target.value);
                  if (plantErrors.location) setPlantErrors(prev => ({ ...prev, location: '' }));
                }}
                placeholder={t('tools.plantCare.locationEGLivingRoom', 'Location (e.g., Living Room)')}
                className={`w-full px-4 py-2 rounded-lg border ${plantErrors.location ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {plantErrors.location && <p className="text-red-500 text-xs mt-1">{plantErrors.location}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(plantTypeConfigs) as PlantType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewPlantType(type)}
                  className={`py-2 px-3 rounded-lg text-sm ${newPlantType === type ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {plantTypeConfigs[type].name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddPlant}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {t('tools.plantCare.addPlant2', 'Add Plant')}
              </button>
              <button
                onClick={() => {
                  setShowAddPlant(false);
                  setPlantErrors({});
                }}
                className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {t('tools.plantCare.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'care', label: 'Care Log', icon: Sprout },
            { id: 'history', label: 'History', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-green-500 text-white' : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {selectedPlant && plantStatus && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlant.name}</h4>
                    <span className="text-green-500 font-bold">{plantTypeConfigs[selectedPlant.type].name}</span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedPlant.location} • Added {selectedPlant.dateAdded}
                  </div>
                  {selectedPlant.notes && (
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPlant.notes}</p>
                  )}
                </div>

                {/* Watering Status */}
                <div className={`p-4 rounded-lg ${plantStatus.wateringStatus === 'overdue' ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200') : (isDark ? 'bg-gray-800' : 'bg-gray-50')} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Droplets className={`w-5 h-5 ${getStatusColor(plantStatus.wateringStatus)}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantCare.watering', 'Watering')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(plantStatus.wateringStatus)}`}>
                      {getStatusLabel(plantStatus.wateringStatus)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full ${getStatusBgColor(plantStatus.wateringStatus)}`}
                        style={{ width: `${Math.min(100, (plantStatus.daysSinceWatered / selectedPlant.wateringFrequencyDays) * 100)}%` }}
                      />
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Last watered {plantStatus.daysSinceWatered} days ago • Every {selectedPlant.wateringFrequencyDays} days
                    </div>
                    {plantStatus.daysUntilWatering >= 0 ? (
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Water in {plantStatus.daysUntilWatering} days ({plantStatus.nextWateringDate.toLocaleDateString()})
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-red-500">Overdue by {Math.abs(plantStatus.daysUntilWatering)} days!</div>
                    )}
                  </div>
                  <button
                    onClick={handleWaterPlant}
                    className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <Droplets className="w-4 h-4" />
                    {t('tools.plantCare.waterNow', 'Water Now')}
                  </button>
                </div>

                {/* Fertilizing Status */}
                <div className={`p-4 rounded-lg ${plantStatus.fertilizingStatus === 'overdue' ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200') : (isDark ? 'bg-gray-800' : 'bg-gray-50')} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sprout className={`w-5 h-5 ${getStatusColor(plantStatus.fertilizingStatus)}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantCare.fertilizing', 'Fertilizing')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(plantStatus.fertilizingStatus)}`}>
                      {getStatusLabel(plantStatus.fertilizingStatus)}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last fertilized {plantStatus.monthsSinceFertilized} months ago • Every {selectedPlant.fertilizingFrequencyMonths} month{selectedPlant.fertilizingFrequencyMonths > 1 ? 's' : ''}
                  </div>
                  {plantStatus.monthsUntilFertilizing >= 0 ? (
                    <div className={`text-sm font-medium mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fertilize in {plantStatus.monthsUntilFertilizing} month{plantStatus.monthsUntilFertilizing !== 1 ? 's' : ''} ({plantStatus.nextFertilizingDate.toLocaleDateString()})
                    </div>
                  ) : (
                    <div className="text-sm font-medium mt-2 text-red-500">Overdue by {Math.abs(plantStatus.monthsUntilFertilizing)} month{Math.abs(plantStatus.monthsUntilFertilizing) !== 1 ? 's' : ''}!</div>
                  )}
                </div>

                {/* Sunlight Requirements */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantCare.sunlight', 'Sunlight')}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedPlant.sunlightRequirement === 'full-sun' && 'Needs full sun (6+ hours direct sunlight)'}
                    {selectedPlant.sunlightRequirement === 'partial-shade' && 'Prefers partial shade (3-6 hours indirect light)'}
                    {selectedPlant.sunlightRequirement === 'shade' && 'Tolerates shade (low light conditions)'}
                  </p>
                </div>

                {/* Care Notes */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-2">
                    <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.plantCare.careTips', 'Care Tips')}</div>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{config.careNotes}</p>
                    </div>
                  </div>
                </div>

                {/* Delete Plant */}
                {plants.length > 1 && (
                  <button
                    onClick={() => handleDeletePlant(selectedPlant.id)}
                    className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('tools.plantCare.deletePlant', 'Delete Plant')}
                  </button>
                )}
              </div>
            )}

            {/* Care Log Tab */}
            {activeTab === 'care' && (
              <div className="space-y-4">
                {/* Add Care Record */}
                <button
                  onClick={() => setShowAddCare(true)}
                  className="w-full py-3 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.plantCare.logCareActivity2', 'Log Care Activity')}
                </button>

                {showAddCare && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantCare.logCareActivity', 'Log Care Activity')}</h4>
                    <select
                      value={newCareRecord.type}
                      onChange={(e) => setNewCareRecord({ ...newCareRecord, type: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {careTypes.map((type) => (
                        <option key={type} value={type.toLowerCase().replace(' ', '-')}>{type}</option>
                      ))}
                    </select>
                    <textarea
                      value={newCareRecord.notes}
                      onChange={(e) => setNewCareRecord({ ...newCareRecord, notes: e.target.value })}
                      placeholder={t('tools.plantCare.careNotesOptional', 'Care notes (optional)')}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddCareRecord}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        {t('tools.plantCare.saveActivity', 'Save Activity')}
                      </button>
                      <button
                        onClick={() => setShowAddCare(false)}
                        className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.plantCare.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Care Activities */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Recent Activities ({selectedPlant.careHistory.length})
                  </h4>
                  {selectedPlant.careHistory.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.plantCare.noCareActivitiesLoggedYet', 'No care activities logged yet')}</p>
                  ) : (
                    <div className="space-y-3">
                      {[...selectedPlant.careHistory].reverse().slice(0, 10).map((record) => (
                        <div
                          key={record.id}
                          className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium text-sm capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {record.type.replace('-', ' ')}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{record.date}</span>
                          </div>
                          {record.notes && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{record.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Export Header */}
                {selectedPlant.careHistory.length > 0 && (
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Care History ({selectedPlant.careHistory.length})
                    </h4>
                    <ExportDropdown
                      onExportCSV={handleExportCSV}
                      onExportExcel={handleExportExcel}
                      onExportJSON={handleExportJSON}
                      onExportPDF={handleExportPDF}
                      onPrint={handlePrint}
                      onCopyToClipboard={handleCopyToClipboard}
                      showImport={false}
                      theme={isDark ? 'dark' : 'light'}
                    />
                  </div>
                )}

                {selectedPlant.careHistory.length === 0 ? (
                  <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.plantCare.noCareHistoryYet', 'No care history yet')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.plantCare.startLoggingCareActivitiesTo', 'Start logging care activities to track plant health')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...selectedPlant.careHistory].reverse().map((record) => (
                      <div
                        key={record.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.type.replace('-', ' ')}</span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{record.date}</span>
                        </div>
                        {record.notes && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* General Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.plantCare.plantCareTips', 'Plant Care Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.plantCare.waterEarlyMorningOrEvening', 'Water early morning or evening to reduce evaporation')}</li>
                <li>{t('tools.plantCare.checkSoilMoistureBeforeWatering', 'Check soil moisture before watering - stick your finger 1 inch deep')}</li>
                <li>{t('tools.plantCare.rotatePlantsQuarterlyForEven', 'Rotate plants quarterly for even growth')}</li>
                <li>{t('tools.plantCare.wipeLeavesMonthlyToImprove', 'Wipe leaves monthly to improve photosynthesis')}</li>
                <li>{t('tools.plantCare.keepConsistentCareScheduleFor', 'Keep consistent care schedule for best results')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCareTool;
