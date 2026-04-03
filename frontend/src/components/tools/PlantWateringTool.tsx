import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Sun, Thermometer, Plus, Trash2, Bell, Flower2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface PlantWateringToolProps {
  uiConfig?: UIConfig;
}

interface Plant {
  id: string;
  name: string;
  type: PlantType;
  lastWatered: string;
  location: 'indoor' | 'outdoor';
}

type PlantType = 'succulent' | 'tropical' | 'flowering' | 'herb' | 'fern' | 'cactus' | 'vegetable' | 'tree';

interface PlantInfo {
  name: string;
  waterDays: number;
  sunlight: string;
  tips: string;
}

const plantTypes: Record<PlantType, PlantInfo> = {
  succulent: { name: 'Succulent', waterDays: 14, sunlight: 'Bright, indirect', tips: 'Let soil dry completely between waterings' },
  tropical: { name: 'Tropical', waterDays: 7, sunlight: 'Bright, indirect', tips: 'Keep soil moist but not soggy' },
  flowering: { name: 'Flowering', waterDays: 3, sunlight: 'Varies by species', tips: 'Water when top inch of soil is dry' },
  herb: { name: 'Herb', waterDays: 2, sunlight: 'Full sun', tips: 'Keep soil consistently moist' },
  fern: { name: 'Fern', waterDays: 4, sunlight: 'Low to moderate', tips: 'Loves humidity, mist regularly' },
  cactus: { name: 'Cactus', waterDays: 21, sunlight: 'Full sun', tips: 'Water sparingly, especially in winter' },
  vegetable: { name: 'Vegetable', waterDays: 2, sunlight: 'Full sun', tips: 'Consistent watering for best harvest' },
  tree: { name: 'Indoor Tree', waterDays: 10, sunlight: 'Bright light', tips: 'Water deeply but infrequently' },
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Plant Name', type: 'string' },
  { key: 'typeName', header: 'Type', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'lastWatered', header: 'Last Watered', type: 'date' },
  { key: 'daysSinceWatered', header: 'Days Since Watered', type: 'number' },
  { key: 'daysUntilWatering', header: 'Days Until Watering', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'sunlight', header: 'Sunlight', type: 'string' },
  { key: 'tips', header: 'Care Tips', type: 'string' },
];

export const PlantWateringTool: React.FC<PlantWateringToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: plants,
    setData: setPlants,
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
  } = useToolData<Plant>('plant-watering', [], COLUMNS);

  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantType, setNewPlantType] = useState<PlantType>('tropical');
  const [newPlantLocation, setNewPlantLocation] = useState<'indoor' | 'outdoor'>('indoor');

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setNewPlantName(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    return plants.map(plant => {
      const info = plantTypes[plant.type];
      const lastWatered = new Date(plant.lastWatered);
      const today = new Date();
      const daysSinceWatered = Math.floor((today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
      const nextWateringDate = new Date(lastWatered);
      nextWateringDate.setDate(nextWateringDate.getDate() + info.waterDays);
      const daysUntilWatering = Math.floor((nextWateringDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status: 'ok' | 'soon' | 'overdue';
      if (daysUntilWatering < 0) {
        status = 'overdue';
      } else if (daysUntilWatering <= 1) {
        status = 'soon';
      } else {
        status = 'ok';
      }

      return {
        ...plant,
        info,
        daysSinceWatered,
        daysUntilWatering,
        nextWateringDate,
        status,
      };
    }).sort((a, b) => a.daysUntilWatering - b.daysUntilWatering);
  }, [plants]);

  // Prepare export data
  const exportData = useMemo(() => {
    return calculations.map(plant => ({
      id: plant.id,
      name: plant.name,
      typeName: plant.info.name,
      location: plant.location,
      lastWatered: plant.lastWatered,
      daysSinceWatered: plant.daysSinceWatered,
      daysUntilWatering: plant.daysUntilWatering,
      status: plant.status === 'overdue' ? 'Overdue' : plant.status === 'soon' ? 'Water Soon' : 'OK',
      sunlight: plant.info.sunlight,
      tips: plant.info.tips,
    }));
  }, [calculations]);

  const addPlant = () => {
    if (!newPlantName.trim()) return;
    const newPlant: Plant = {
      id: Date.now().toString(),
      name: newPlantName.trim(),
      type: newPlantType,
      lastWatered: new Date().toISOString().split('T')[0],
      location: newPlantLocation,
    };
    addItem(newPlant);
    setNewPlantName('');
  };

  const waterPlant = (id: string) => {
    updateItem(id, { lastWatered: new Date().toISOString().split('T')[0] });
  };

  const removePlant = (id: string) => {
    deleteItem(id);
  };

  const statusColors = {
    ok: 'bg-green-500',
    soon: 'bg-yellow-500',
    overdue: 'bg-red-500',
  };

  const overdueCount = calculations.filter(p => p.status === 'overdue').length;
  const soonCount = calculations.filter(p => p.status === 'soon').length;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><Flower2 className="w-5 h-5 text-green-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantWatering.plantWateringSchedule', 'Plant Watering Schedule')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plantWatering.trackYourPlantCareRoutine', 'Track your plant care routine')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="plant-watering" toolName="Plant Watering" />

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
              onExportCSV={() => exportCSV({ filename: 'plant-watering-schedule' })}
              onExportExcel={() => exportExcel({ filename: 'plant-watering-schedule' })}
              onExportJSON={() => exportJSON({ filename: 'plant-watering-schedule' })}
              onExportPDF={() => exportPDF({
                filename: 'plant-watering-schedule',
                title: 'Plant Watering Schedule',
                subtitle: `${plants.length} plants tracked`
              })}
              onPrint={() => print('Plant Watering Schedule')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.plantWatering.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Flower2 className={`w-6 h-6 mx-auto mb-1 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plants.length}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plantWatering.plants', 'Plants')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Bell className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{soonCount}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plantWatering.needWaterSoon', 'Need Water Soon')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Droplets className="w-6 h-6 mx-auto mb-1 text-red-500" />
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plantWatering.overdue', 'Overdue')}</div>
          </div>
        </div>

        {/* Add Plant */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantWatering.addNewPlant', 'Add New Plant')}</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newPlantName}
              onChange={(e) => setNewPlantName(e.target.value)}
              placeholder={t('tools.plantWatering.plantName', 'Plant name')}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={newPlantType}
              onChange={(e) => setNewPlantType(e.target.value as PlantType)}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {Object.entries(plantTypes).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
            <select
              value={newPlantLocation}
              onChange={(e) => setNewPlantLocation(e.target.value as 'indoor' | 'outdoor')}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="indoor">{t('tools.plantWatering.indoor', 'Indoor')}</option>
              <option value="outdoor">{t('tools.plantWatering.outdoor', 'Outdoor')}</option>
            </select>
            <button
              onClick={addPlant}
              disabled={!newPlantName.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Plant List */}
        <div className="space-y-3">
          {calculations.map((plant) => (
            <div key={plant.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[plant.status]}`} />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{plant.name}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plant.info.name} • {plant.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => waterPlant(plant.id)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    title={t('tools.plantWatering.markAsWatered', 'Mark as watered')}
                  >
                    <Droplets className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removePlant(plant.id)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    title={t('tools.plantWatering.removePlant', 'Remove plant')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Droplets className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {plant.daysSinceWatered}d ago
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Sun className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {plant.info.sunlight}
                  </span>
                </div>
                <div className={`text-right font-medium ${
                  plant.status === 'overdue' ? 'text-red-500' :
                  plant.status === 'soon' ? 'text-yellow-500' :
                  isDark ? 'text-green-400' : 'text-green-500'
                }`}>
                  {plant.status === 'overdue' ? `${Math.abs(plant.daysUntilWatering)}d overdue` :
                   plant.status === 'soon' ? 'Water today!' :
                   `${plant.daysUntilWatering}d left`}
                </div>
              </div>

              <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Tip: {plant.info.tips}
              </div>
            </div>
          ))}

          {plants.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Flower2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('tools.plantWatering.noPlantsAddedYetAdd', 'No plants added yet. Add your first plant above!')}</p>
            </div>
          )}
        </div>

        {/* Quick Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantWatering.wateringIntervals', 'Watering Intervals')}</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {Object.entries(plantTypes).map(([key, info]) => (
              <div key={key} className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{info.name}</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{info.waterDays}d</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantWateringTool;
