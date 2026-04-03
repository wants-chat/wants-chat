import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, Droplet, Clock, Flame, CheckSquare, Sun, Sunset, Info, TrendingUp, Footprints, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'strenuous' | 'expert';

interface DifficultyConfig {
  name: string;
  paceKmPerHour: number;
  caloriesPerKg: number; // calories per kg body weight per hour
  description: string;
  color: string;
}

interface GearItem {
  id: string;
  name: string;
  category: 'essential' | 'recommended' | 'optional';
  checked: boolean;
}

interface HikingTrailPlannerToolProps {
  uiConfig?: UIConfig;
}

// Default gear list items
const DEFAULT_GEAR_LIST: GearItem[] = [
  { id: '1', name: 'Water bottles/Hydration pack', category: 'essential', checked: false },
  { id: '2', name: 'Trail map/GPS device', category: 'essential', checked: false },
  { id: '3', name: 'First aid kit', category: 'essential', checked: false },
  { id: '4', name: 'Sun protection (hat, sunscreen)', category: 'essential', checked: false },
  { id: '5', name: 'Emergency whistle', category: 'essential', checked: false },
  { id: '6', name: 'Headlamp/Flashlight', category: 'essential', checked: false },
  { id: '7', name: 'Trekking poles', category: 'recommended', checked: false },
  { id: '8', name: 'Extra food/snacks', category: 'recommended', checked: false },
  { id: '9', name: 'Rain jacket', category: 'recommended', checked: false },
  { id: '10', name: 'Extra layers', category: 'recommended', checked: false },
  { id: '11', name: 'Knife/Multi-tool', category: 'recommended', checked: false },
  { id: '12', name: 'Camera', category: 'optional', checked: false },
  { id: '13', name: 'Binoculars', category: 'optional', checked: false },
  { id: '14', name: 'Portable charger', category: 'optional', checked: false },
];

// Column configuration for exports and useToolData hook
const GEAR_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Gear Item', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'checked', header: 'Packed', type: 'boolean' },
];

export const HikingTrailPlannerTool: React.FC<HikingTrailPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Inputs
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('moderate');
  const [distanceKm, setDistanceKm] = useState('10');
  const [elevationGainM, setElevationGainM] = useState('500');
  const [weightKg, setWeightKg] = useState('70');
  const [packWeightKg, setPackWeightKg] = useState('5');
  const [sunriseTime, setSunriseTime] = useState('06:30');
  const [sunsetTime, setSunsetTime] = useState('18:30');
  const [startTime, setStartTime] = useState('08:00');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence of gear checklist
  const {
    data: gearList,
    setData: setGearList,
    updateItem,
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
  } = useToolData<GearItem>('hiking-trail-planner', DEFAULT_GEAR_LIST, GEAR_COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.difficulty) {
        setDifficulty(params.difficulty as DifficultyLevel);
        setIsPrefilled(true);
      }
      if (params.distance !== undefined) {
        setDistanceKm(String(params.distance));
        setIsPrefilled(true);
      }
      if (params.elevationGain !== undefined) {
        setElevationGainM(String(params.elevationGain));
        setIsPrefilled(true);
      }
      if (params.weight !== undefined) {
        setWeightKg(String(params.weight));
        setIsPrefilled(true);
      }
      if (params.packWeight !== undefined) {
        setPackWeightKg(String(params.packWeight));
        setIsPrefilled(true);
      }
      if (params.startTime) {
        setStartTime(String(params.startTime));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const difficulties: Record<DifficultyLevel, DifficultyConfig> = {
    easy: {
      name: 'Easy',
      paceKmPerHour: 4.0,
      caloriesPerKg: 4.5,
      description: 'Well-maintained trails, minimal elevation',
      color: 'text-green-500',
    },
    moderate: {
      name: 'Moderate',
      paceKmPerHour: 3.5,
      caloriesPerKg: 5.5,
      description: 'Some elevation changes, uneven terrain',
      color: 'text-yellow-500',
    },
    challenging: {
      name: 'Challenging',
      paceKmPerHour: 2.8,
      caloriesPerKg: 7.0,
      description: 'Steep sections, rough terrain',
      color: 'text-orange-500',
    },
    strenuous: {
      name: 'Strenuous',
      paceKmPerHour: 2.2,
      caloriesPerKg: 8.5,
      description: 'Very steep, technical sections',
      color: 'text-red-500',
    },
    expert: {
      name: 'Expert',
      paceKmPerHour: 1.8,
      caloriesPerKg: 10.0,
      description: 'Extreme terrain, route-finding required',
      color: 'text-purple-500',
    },
  };

  const config = difficulties[difficulty];

  const calculations = useMemo(() => {
    const distance = parseFloat(distanceKm) || 0;
    const elevation = parseFloat(elevationGainM) || 0;
    const bodyWeight = parseFloat(weightKg) || 70;
    const packWeight = parseFloat(packWeightKg) || 0;
    const totalWeight = bodyWeight + packWeight;

    // Naismith's rule: 1 hour per 5km + 1 hour per 600m elevation
    // Adjusted for difficulty
    const baseTimeHours = distance / config.paceKmPerHour;
    const elevationTimeHours = elevation / 600;
    const totalTimeHours = baseTimeHours + elevationTimeHours;

    // Add 10% for rest breaks
    const totalTimeWithBreaks = totalTimeHours * 1.1;

    const hours = Math.floor(totalTimeWithBreaks);
    const minutes = Math.round((totalTimeWithBreaks - hours) * 60);

    // Calorie calculation
    // Base calories + extra for elevation and pack weight
    const baseCalories = config.caloriesPerKg * totalWeight * totalTimeHours;
    const elevationBonus = elevation * 0.5; // Extra calories for elevation gain
    const packBonus = packWeight * totalTimeHours * 2; // Extra for carrying weight
    const totalCalories = Math.round(baseCalories + elevationBonus + packBonus);

    // Water needed: ~0.5L per hour of hiking, more for strenuous activity
    const waterLiters = totalTimeWithBreaks * 0.5 * (1 + (config.caloriesPerKg - 4.5) / 10);

    // Parse times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [sunriseHour, sunriseMin] = sunriseTime.split(':').map(Number);
    const [sunsetHour, sunsetMin] = sunsetTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = startMinutes + totalTimeWithBreaks * 60;
    const sunriseMinutes = sunriseHour * 60 + sunriseMin;
    const sunsetMinutes = sunsetHour * 60 + sunsetMin;

    const endHour = Math.floor(endMinutes / 60) % 24;
    const endMin = Math.round(endMinutes % 60);

    const daylightAvailable = sunsetMinutes - startMinutes;
    const daylightHours = Math.max(0, daylightAvailable / 60);
    const finishesBeforeDark = endMinutes <= sunsetMinutes;
    const startsAfterSunrise = startMinutes >= sunriseMinutes;

    return {
      totalTimeHours: totalTimeWithBreaks,
      hours,
      minutes,
      totalCalories,
      waterLiters: waterLiters.toFixed(1),
      endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
      daylightHours: daylightHours.toFixed(1),
      finishesBeforeDark,
      startsAfterSunrise,
      distanceMiles: (distance * 0.621371).toFixed(1),
      elevationFeet: Math.round(elevation * 3.28084),
    };
  }, [distanceKm, elevationGainM, weightKg, packWeightKg, sunriseTime, sunsetTime, startTime, config]);

  // Toggle gear item checked state using the hook's updateItem
  const toggleGearItem = (id: string) => {
    const item = gearList.find(g => g.id === id);
    if (item) {
      updateItem(id, { checked: !item.checked });
    }
  };

  const checkedCount = gearList.filter((item) => item.checked).length;
  const essentialChecked = gearList.filter((item) => item.category === 'essential' && item.checked).length;
  const essentialTotal = gearList.filter((item) => item.category === 'essential').length;

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
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Mountain className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingTrailPlanner.hikingTrailPlanner', 'Hiking Trail Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hikingTrailPlanner.planYourHikeWithTime', 'Plan your hike with time, calories, and gear estimates')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="hiking-trail-planner" toolName="Hiking Trail Planner" />

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
              onExportCSV={() => exportCSV({ filename: 'hiking-trail-gear' })}
              onExportExcel={() => exportExcel({ filename: 'hiking-trail-gear' })}
              onExportJSON={() => exportJSON({ filename: 'hiking-trail-gear' })}
              onExportPDF={() => exportPDF({
                filename: 'hiking-trail-gear',
                title: 'Hiking Trail Gear Checklist',
                subtitle: `${config.name} Trail - ${distanceKm}km`
              })}
              onPrint={() => print('Hiking Trail Gear Checklist')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hikingTrailPlanner.trailDifficulty', 'Trail Difficulty')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(difficulties) as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 px-3 rounded-lg text-sm ${difficulty === d ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {difficulties[d].name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name} Trail</h4>
            <span className={`font-bold ${config.color}`}>{config.paceKmPerHour} km/hr avg pace</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.description}
          </p>
        </div>

        {/* Distance and Elevation Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Footprints className="w-4 h-4 inline mr-1" />
              {t('tools.hikingTrailPlanner.distanceKm', 'Distance (km)')}
            </label>
            <input
              type="number"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="10"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.distanceMiles} miles
            </span>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {t('tools.hikingTrailPlanner.elevationGainM', 'Elevation Gain (m)')}
            </label>
            <input
              type="number"
              value={elevationGainM}
              onChange={(e) => setElevationGainM(e.target.value)}
              placeholder="500"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.elevationFeet} ft
            </span>
          </div>
        </div>

        {/* Body Weight and Pack Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.hikingTrailPlanner.bodyWeightKg', 'Body Weight (kg)')}
            </label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="70"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.hikingTrailPlanner.packWeightKg', 'Pack Weight (kg)')}
            </label>
            <input
              type="number"
              value={packWeightKg}
              onChange={(e) => setPackWeightKg(e.target.value)}
              placeholder="5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Time Planning */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Sun className="w-4 h-4 inline mr-1" />
              {t('tools.hikingTrailPlanner.sunrise', 'Sunrise')}
            </label>
            <input
              type="time"
              value={sunriseTime}
              onChange={(e) => setSunriseTime(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Sunset className="w-4 h-4 inline mr-1" />
              {t('tools.hikingTrailPlanner.sunset', 'Sunset')}
            </label>
            <input
              type="time"
              value={sunsetTime}
              onChange={(e) => setSunsetTime(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.hikingTrailPlanner.startTime', 'Start Time')}
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingTrailPlanner.estimatedTime', 'Estimated Time')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">
              {calculations.hours}h {calculations.minutes}m
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Finish by {calculations.endTime}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingTrailPlanner.caloriesBurned', 'Calories Burned')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.totalCalories}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.hikingTrailPlanner.kcalEstimated', 'kcal estimated')}
            </div>
          </div>
        </div>

        {/* Water and Daylight */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingTrailPlanner.waterNeeded', 'Water Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.waterLiters}L</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.hikingTrailPlanner.minimumRecommended', 'minimum recommended')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingTrailPlanner.daylightAvailable', 'Daylight Available')}</span>
            </div>
            <div className="text-3xl font-bold text-yellow-500">{calculations.daylightHours}h</div>
            <div className={`text-sm ${calculations.finishesBeforeDark ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {calculations.finishesBeforeDark ? t('tools.hikingTrailPlanner.finishBeforeSunset', 'Finish before sunset') : t('tools.hikingTrailPlanner.warningFinishesAfterSunset', 'Warning: Finishes after sunset!')}
            </div>
          </div>
        </div>

        {/* Daylight Warning */}
        {(!calculations.finishesBeforeDark || !calculations.startsAfterSunrise) && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-start gap-2">
              <Info className={`w-4 h-4 mt-0.5 text-red-500`} />
              <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                <strong>{t('tools.hikingTrailPlanner.daylightWarning', 'Daylight Warning:')}</strong>
                {!calculations.startsAfterSunrise && <p>{t('tools.hikingTrailPlanner.yourStartTimeIsBefore', 'Your start time is before sunrise. Consider starting later.')}</p>}
                {!calculations.finishesBeforeDark && <p>{t('tools.hikingTrailPlanner.youMayFinishAfterSunset', 'You may finish after sunset. Bring a headlamp and consider an earlier start.')}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Gear Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <CheckSquare className="w-4 h-4 inline mr-1" />
              {t('tools.hikingTrailPlanner.gearChecklist', 'Gear Checklist')}
            </label>
            <span className={`text-sm ${essentialChecked === essentialTotal ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-yellow-400' : 'text-yellow-600')}`}>
              {checkedCount}/{gearList.length} items ({essentialChecked}/{essentialTotal} essential)
            </span>
          </div>

          {['essential', 'recommended', 'optional'].map((category) => (
            <div key={category} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h5 className={`text-xs uppercase font-semibold mb-2 ${category === 'essential' ? 'text-red-500' : category === 'recommended' ? 'text-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                {category}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {gearList
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 cursor-pointer text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleGearItem(item.id)}
                        className="w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className={item.checked ? 'line-through opacity-60' : ''}>
                        {item.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.hikingTrailPlanner.hikingTips', 'Hiking Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Start early to maximize daylight hours</li>
                <li>- Check weather forecast before departure</li>
                <li>- Tell someone your hiking plan and expected return</li>
                <li>- Take breaks every 45-60 minutes on long hikes</li>
                <li>- Drink water regularly, not just when thirsty</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HikingTrailPlannerTool;
