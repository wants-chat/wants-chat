import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Fuel, Clock, MapPin, Wrench, AlertTriangle, Navigation, Coffee, Info, Plus, Trash2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface RoadTripPlannerToolProps {
  uiConfig?: UIConfig;
}

interface Stop {
  id: string;
  name: string;
  type: 'rest' | 'food' | 'gas' | 'attraction' | 'other';
  distance: number; // miles from start
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

type FuelType = 'regular' | 'midgrade' | 'premium' | 'diesel';

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Stop Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'distance', header: 'Distance (miles)', type: 'number' },
];

export const RoadTripPlannerTool: React.FC<RoadTripPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Trip details
  const [distance, setDistance] = useState('500');
  const [avgSpeed, setAvgSpeed] = useState('65');
  const [fuelEfficiency, setFuelEfficiency] = useState('28');
  const [fuelType, setFuelType] = useState<FuelType>('regular');
  const [fuelPrice, setFuelPrice] = useState('3.50');

  // Break settings
  const [breakInterval, setBreakInterval] = useState('2');
  const [breakDuration, setBreakDuration] = useState('15');

  // Use the useToolData hook for backend persistence of stops
  const {
    data: stops,
    setData: setStops,
    addItem: addStopItem,
    deleteItem: deleteStopItem,
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
  } = useToolData<Stop>('road-trip-planner', [], COLUMNS);

  const [newStopName, setNewStopName] = useState('');
  const [newStopType, setNewStopType] = useState<Stop['type']>('rest');
  const [newStopDistance, setNewStopDistance] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'stops' | 'checklist' | 'emergency'>('calculator');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        hasChanges = true;
      }
      if (params.avgSpeed !== undefined) {
        setAvgSpeed(String(params.avgSpeed));
        hasChanges = true;
      }
      if (params.fuelEfficiency !== undefined) {
        setFuelEfficiency(String(params.fuelEfficiency));
        hasChanges = true;
      }
      if (params.fuelType && ['regular', 'midgrade', 'premium', 'diesel'].includes(params.fuelType)) {
        setFuelType(params.fuelType as FuelType);
        hasChanges = true;
      }
      if (params.fuelPrice !== undefined) {
        setFuelPrice(String(params.fuelPrice));
        hasChanges = true;
      }
      if (params.tab && ['calculator', 'stops', 'checklist', 'emergency'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Car checklist
  const [carChecklist, setCarChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Check tire pressure and tread', checked: false },
    { id: '2', label: 'Check oil level', checked: false },
    { id: '3', label: 'Check coolant level', checked: false },
    { id: '4', label: 'Check brake fluid', checked: false },
    { id: '5', label: 'Check windshield wiper fluid', checked: false },
    { id: '6', label: 'Test all lights (headlights, brake, turn signals)', checked: false },
    { id: '7', label: 'Check windshield wipers', checked: false },
    { id: '8', label: 'Check battery condition', checked: false },
    { id: '9', label: 'Inspect belts and hoses', checked: false },
    { id: '10', label: 'Check spare tire and jack', checked: false },
    { id: '11', label: 'Clean windows and mirrors', checked: false },
    { id: '12', label: 'Check air filter', checked: false },
  ]);

  // Emergency kit list
  const emergencyKit = [
    { category: 'Safety', items: ['First aid kit', 'Fire extinguisher', 'Reflective triangles', 'Flashlight with batteries', 'Safety vest'] },
    { category: 'Tools', items: ['Jumper cables', 'Basic tool kit', 'Tire pressure gauge', 'Duct tape', 'Multi-tool'] },
    { category: 'Survival', items: ['Blanket', 'Water bottles', 'Non-perishable snacks', 'Phone charger/power bank', 'Paper maps'] },
    { category: 'Documents', items: ['Registration', 'Insurance card', 'License', 'Emergency contacts', 'Roadside assistance info'] },
    { category: 'Weather', items: ['Rain poncho', 'Sunscreen', 'Sunglasses', 'Umbrella', 'Ice scraper (winter)'] },
  ];

  // Fuel prices by type (default estimates)
  const fuelPriceDefaults: Record<FuelType, number> = {
    regular: 3.50,
    midgrade: 3.80,
    premium: 4.20,
    diesel: 4.00,
  };

  // Calculations
  const calculations = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const speed = parseFloat(avgSpeed) || 65;
    const mpg = parseFloat(fuelEfficiency) || 28;
    const price = parseFloat(fuelPrice) || fuelPriceDefaults[fuelType];
    const breakInt = parseFloat(breakInterval) || 2;
    const breakDur = parseFloat(breakDuration) || 15;

    // Basic calculations
    const driveTimeHours = dist / speed;
    const gallonsNeeded = dist / mpg;
    const fuelCost = gallonsNeeded * price;

    // Break calculations
    const numberOfBreaks = Math.floor(driveTimeHours / breakInt);
    const totalBreakTimeMinutes = numberOfBreaks * breakDur;
    const totalBreakTimeHours = totalBreakTimeMinutes / 60;

    // Total trip time
    const totalTimeHours = driveTimeHours + totalBreakTimeHours;

    // Format time helper
    const formatTime = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (h === 0) return `${m} min`;
      if (m === 0) return `${h} hr`;
      return `${h} hr ${m} min`;
    };

    return {
      driveTime: formatTime(driveTimeHours),
      driveTimeHours,
      gallonsNeeded: gallonsNeeded.toFixed(1),
      fuelCost: fuelCost.toFixed(2),
      numberOfBreaks,
      totalBreakTime: formatTime(totalBreakTimeHours),
      totalTime: formatTime(totalTimeHours),
      totalTimeHours,
      costPerMile: (fuelCost / dist).toFixed(3),
      milesPerGallon: mpg.toFixed(1),
    };
  }, [distance, avgSpeed, fuelEfficiency, fuelPrice, fuelType, breakInterval, breakDuration, fuelPriceDefaults]);

  // Add stop
  const addStop = useCallback(() => {
    if (newStopName && newStopDistance) {
      const newStop: Stop = {
        id: Date.now().toString(),
        name: newStopName,
        type: newStopType,
        distance: parseFloat(newStopDistance),
      };
      addStopItem(newStop);
      // Sort stops after adding
      setStops(prev => [...prev].sort((a, b) => a.distance - b.distance));
      setNewStopName('');
      setNewStopDistance('');
    }
  }, [newStopName, newStopDistance, newStopType, addStopItem, setStops]);

  // Remove stop
  const removeStop = useCallback((id: string) => {
    deleteStopItem(id);
  }, [deleteStopItem]);

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setCarChecklist(carChecklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Stop type icons
  const getStopIcon = (type: Stop['type']) => {
    switch (type) {
      case 'rest': return <Coffee className="w-4 h-4" />;
      case 'food': return <Coffee className="w-4 h-4" />;
      case 'gas': return <Fuel className="w-4 h-4" />;
      case 'attraction': return <MapPin className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  const checkedCount = carChecklist.filter((item) => item.checked).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Car className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roadTripPlanner.roadTripPlanner', 'Road Trip Planner')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.roadTripPlanner.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roadTripPlanner.planYourPerfectRoadTrip', 'Plan your perfect road trip')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="road-trip-planner" toolName="Road Trip Planner" />

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
              onExportCSV={() => exportCSV({ filename: 'road-trip-stops' })}
              onExportExcel={() => exportExcel({ filename: 'road-trip-stops' })}
              onExportJSON={() => exportJSON({ filename: 'road-trip-stops' })}
              onExportPDF={() => exportPDF({
                filename: 'road-trip-stops',
                title: 'Road Trip Stops',
                subtitle: `${stops.length} stops | ${distance} miles total`
              })}
              onPrint={() => print('Road Trip Stops')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'calculator', label: 'Calculator', icon: Navigation },
            { id: 'stops', label: 'Stops', icon: MapPin },
            { id: 'checklist', label: 'Car Checklist', icon: Wrench },
            { id: 'emergency', label: 'Emergency Kit', icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Trip Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Navigation className="w-4 h-4 inline mr-1" />
                  {t('tools.roadTripPlanner.totalDistanceMiles', 'Total Distance (miles)')}
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="500"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Car className="w-4 h-4 inline mr-1" />
                  {t('tools.roadTripPlanner.averageSpeedMph', 'Average Speed (mph)')}
                </label>
                <input
                  type="number"
                  value={avgSpeed}
                  onChange={(e) => setAvgSpeed(e.target.value)}
                  placeholder="65"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Fuel Settings */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Fuel className="w-4 h-4 inline mr-2" />
                {t('tools.roadTripPlanner.fuelSettings', 'Fuel Settings')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.roadTripPlanner.fuelEfficiencyMpg', 'Fuel Efficiency (MPG)')}
                  </label>
                  <input
                    type="number"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(e.target.value)}
                    placeholder="28"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.roadTripPlanner.fuelType', 'Fuel Type')}
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => {
                      setFuelType(e.target.value as FuelType);
                      setFuelPrice(fuelPriceDefaults[e.target.value as FuelType].toString());
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="regular">{t('tools.roadTripPlanner.regular', 'Regular')}</option>
                    <option value="midgrade">{t('tools.roadTripPlanner.midGrade', 'Mid-Grade')}</option>
                    <option value="premium">{t('tools.roadTripPlanner.premium', 'Premium')}</option>
                    <option value="diesel">{t('tools.roadTripPlanner.diesel', 'Diesel')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.roadTripPlanner.pricePerGallon', 'Price per Gallon ($)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    placeholder="3.50"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            {/* Break Settings */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Coffee className="w-4 h-4 inline mr-2" />
                {t('tools.roadTripPlanner.breakSettings', 'Break Settings')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.roadTripPlanner.breakEveryHours', 'Break Every (hours)')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 1.5, 2, 2.5, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setBreakInterval(n.toString())}
                        className={`flex-1 py-2 rounded-lg text-sm ${
                          parseFloat(breakInterval) === n
                            ? 'bg-green-500 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {n}h
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.roadTripPlanner.breakDurationMinutes', 'Break Duration (minutes)')}
                  </label>
                  <div className="flex gap-2">
                    {[10, 15, 20, 30].map((n) => (
                      <button
                        key={n}
                        onClick={() => setBreakDuration(n.toString())}
                        className={`flex-1 py-2 rounded-lg text-sm ${
                          parseInt(breakDuration) === n
                            ? 'bg-green-500 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {n}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripPlanner.driveTime', 'Drive Time')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">{calculations.driveTime}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Fuel className="w-4 h-4 text-amber-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripPlanner.fuelNeeded', 'Fuel Needed')}</span>
                </div>
                <div className="text-2xl font-bold text-amber-500">{calculations.gallonsNeeded} gal</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripPlanner.breaks', 'Breaks')}</span>
                </div>
                <div className="text-2xl font-bold text-green-500">{calculations.numberOfBreaks}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totalBreakTime} total</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripPlanner.totalTime', 'Total Time')}</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">{calculations.totalTime}</div>
              </div>
            </div>

            {/* Fuel Cost Summary */}
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripPlanner.estimatedFuelCost', 'Estimated Fuel Cost')}</div>
              <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.fuelCost}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ${calculations.costPerMile}/mile at {calculations.milesPerGallon} MPG
              </div>
            </div>
          </div>
        )}

        {/* Stops Tab */}
        {activeTab === 'stops' && (
          <div className="space-y-6">
            {/* Add Stop Form */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Plus className="w-4 h-4 inline mr-2" />
                {t('tools.roadTripPlanner.addAStop', 'Add a Stop')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  placeholder={t('tools.roadTripPlanner.stopName', 'Stop name')}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={newStopType}
                  onChange={(e) => setNewStopType(e.target.value as Stop['type'])}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="rest">{t('tools.roadTripPlanner.restStop', 'Rest Stop')}</option>
                  <option value="food">{t('tools.roadTripPlanner.food', 'Food')}</option>
                  <option value="gas">{t('tools.roadTripPlanner.gasStation', 'Gas Station')}</option>
                  <option value="attraction">{t('tools.roadTripPlanner.attraction', 'Attraction')}</option>
                  <option value="other">{t('tools.roadTripPlanner.other', 'Other')}</option>
                </select>
                <input
                  type="number"
                  value={newStopDistance}
                  onChange={(e) => setNewStopDistance(e.target.value)}
                  placeholder={t('tools.roadTripPlanner.milesFromStart', 'Miles from start')}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={addStop}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.roadTripPlanner.add', 'Add')}
                </button>
              </div>
            </div>

            {/* Stops List */}
            {stops.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.roadTripPlanner.noStopsPlannedYet', 'No stops planned yet')}</p>
                <p className="text-sm">{t('tools.roadTripPlanner.addStopsToCreateYour', 'Add stops to create your itinerary')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Start */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Navigation className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roadTripPlanner.start', 'Start')}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roadTripPlanner.mile0', 'Mile 0')}</div>
                  </div>
                </div>

                {/* Stops */}
                {stops.map((stop) => (
                  <div
                    key={stop.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        stop.type === 'gas' ? 'bg-amber-500/20 text-amber-500' :
                        stop.type === 'food' ? 'bg-orange-500/20 text-orange-500' :
                        stop.type === 'attraction' ? 'bg-purple-500/20 text-purple-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {getStopIcon(stop.type)}
                      </div>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stop.name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Mile {stop.distance} - {stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* End */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roadTripPlanner.destination', 'Destination')}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mile {distance}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Wrench className="w-4 h-4 inline mr-2" />
                  {t('tools.roadTripPlanner.preTripCarChecklist', 'Pre-Trip Car Checklist')}
                </h4>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  checkedCount === carChecklist.length
                    ? 'bg-green-500/20 text-green-500'
                    : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {checkedCount}/{carChecklist.length}
                </span>
              </div>
              <div className="space-y-2">
                {carChecklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      item.checked
                        ? isDark
                          ? 'bg-green-900/20'
                          : 'bg-green-50'
                        : isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.checked
                        ? 'bg-green-500 border-green-500'
                        : isDark
                        ? 'border-gray-600'
                        : 'border-gray-300'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`${
                      item.checked
                        ? isDark
                          ? 'text-gray-400 line-through'
                          : 'text-gray-500 line-through'
                        : isDark
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Kit Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('tools.roadTripPlanner.alwaysKeepAnEmergencyKit', 'Always keep an emergency kit in your vehicle')}
                </span>
              </div>
            </div>

            {emergencyKit.map((category) => (
              <div key={category.category} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {category.category}
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.roadTripPlanner.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Take breaks every 2 hours to stay alert</li>
                <li>- Check weather conditions before departure</li>
                <li>- Share your route with family or friends</li>
                <li>- Keep your gas tank at least 1/4 full</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadTripPlannerTool;
