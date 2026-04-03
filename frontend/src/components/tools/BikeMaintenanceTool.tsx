import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bike, Gauge, Link2, CircleDot, Disc, Wrench, Calendar, Plus, Trash2, Info, AlertTriangle, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type BikeType = 'road' | 'mountain' | 'hybrid' | 'gravel' | 'commuter' | 'ebike';

interface BikeProfile {
  id: string;
  name: string;
  type: BikeType;
  totalMileage: number;
  lastChainChange: number; // mileage when chain was last changed
  lastTireChange: number;
  lastBrakeService: number;
  tirePressureFront: number;
  tirePressureRear: number;
  recommendedPressure: number;
  lastPressureCheck: string; // ISO date
  serviceHistory: ServiceRecord[];
}

interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  mileage: number;
  notes: string;
  cost?: number;
}

interface BikeTypeConfig {
  name: string;
  chainLifeMiles: number;
  tireLifeMiles: number;
  brakeCheckMiles: number;
  pressureCheckDays: number;
  recommendedPressure: number;
}

const bikeTypeConfigs: Record<BikeType, BikeTypeConfig> = {
  road: {
    name: 'Road Bike',
    chainLifeMiles: 2000,
    tireLifeMiles: 3000,
    brakeCheckMiles: 500,
    pressureCheckDays: 7,
    recommendedPressure: 100,
  },
  mountain: {
    name: 'Mountain Bike',
    chainLifeMiles: 1500,
    tireLifeMiles: 2000,
    brakeCheckMiles: 300,
    pressureCheckDays: 7,
    recommendedPressure: 30,
  },
  hybrid: {
    name: 'Hybrid Bike',
    chainLifeMiles: 2000,
    tireLifeMiles: 2500,
    brakeCheckMiles: 500,
    pressureCheckDays: 14,
    recommendedPressure: 60,
  },
  gravel: {
    name: 'Gravel Bike',
    chainLifeMiles: 1800,
    tireLifeMiles: 2500,
    brakeCheckMiles: 400,
    pressureCheckDays: 7,
    recommendedPressure: 45,
  },
  commuter: {
    name: 'Commuter Bike',
    chainLifeMiles: 2500,
    tireLifeMiles: 3500,
    brakeCheckMiles: 600,
    pressureCheckDays: 14,
    recommendedPressure: 65,
  },
  ebike: {
    name: 'E-Bike',
    chainLifeMiles: 1500,
    tireLifeMiles: 2000,
    brakeCheckMiles: 400,
    pressureCheckDays: 14,
    recommendedPressure: 55,
  },
};

const serviceTypes = [
  'Chain Replacement',
  'Tire Replacement',
  'Brake Pad Replacement',
  'Brake Adjustment',
  'Gear Tune-up',
  'Full Service',
  'Wheel Truing',
  'Headset Service',
  'Bottom Bracket Service',
  'Cable Replacement',
  'Other',
];

// Column configuration for bikes export/sync
const BIKE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Bike Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'totalMileage', header: 'Total Mileage (mi)', type: 'number' },
  { key: 'lastChainChange', header: 'Last Chain Change (mi)', type: 'number' },
  { key: 'lastTireChange', header: 'Last Tire Change (mi)', type: 'number' },
  { key: 'lastBrakeService', header: 'Last Brake Service (mi)', type: 'number' },
  { key: 'recommendedPressure', header: 'Recommended Pressure (PSI)', type: 'number' },
  { key: 'lastPressureCheck', header: 'Last Pressure Check', type: 'date' },
];

interface BikeMaintenanceToolProps {
  uiConfig?: UIConfig;
}

// Default bike data for new users
const DEFAULT_BIKES: BikeProfile[] = [];

export const BikeMaintenanceTool: React.FC<BikeMaintenanceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: bikes,
    setData: setBikes,
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
  } = useToolData<BikeProfile>('bike-maintenance', DEFAULT_BIKES, BIKE_COLUMNS);

  const [activeTab, setActiveTab] = useState<'profile' | 'mileage' | 'maintenance' | 'history'>('profile');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [showAddBike, setShowAddBike] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newBikeName, setNewBikeName] = useState('');
  const [newBikeType, setNewBikeType] = useState<BikeType>('road');
  const [mileageToAdd, setMileageToAdd] = useState('');
  const [newService, setNewService] = useState({
    type: 'Full Service',
    notes: '',
    cost: '',
  });

  // Set first bike as selected when bikes load
  useEffect(() => {
    if (bikes.length > 0 && !selectedBikeId) {
      setSelectedBikeId(bikes[0].id);
    }
  }, [bikes, selectedBikeId]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.bikeType) {
        setNewBikeType(params.bikeType as BikeType);
        setIsPrefilled(true);
      }
      if (params.mileage !== undefined) {
        setMileageToAdd(String(params.mileage));
        setIsPrefilled(true);
      }
      if (params.activeTab) {
        setActiveTab(params.activeTab as 'profile' | 'mileage' | 'maintenance' | 'history');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const selectedBike = bikes.find((b) => b.id === selectedBikeId);
  const config = selectedBike ? bikeTypeConfigs[selectedBike.type] : bikeTypeConfigs.road;

  const maintenanceStatus = useMemo(() => {
    if (!selectedBike) return null;

    const chainMilesSinceChange = selectedBike.totalMileage - selectedBike.lastChainChange;
    const chainWearPercent = Math.min(100, (chainMilesSinceChange / config.chainLifeMiles) * 100);

    const tireMilesSinceChange = selectedBike.totalMileage - selectedBike.lastTireChange;
    const tireWearPercent = Math.min(100, (tireMilesSinceChange / config.tireLifeMiles) * 100);

    const brakeMilesSinceService = selectedBike.totalMileage - selectedBike.lastBrakeService;
    const brakeCheckPercent = Math.min(100, (brakeMilesSinceService / config.brakeCheckMiles) * 100);

    const lastPressureDate = new Date(selectedBike.lastPressureCheck);
    const daysSincePressureCheck = Math.floor((Date.now() - lastPressureDate.getTime()) / (1000 * 60 * 60 * 24));
    const pressureCheckPercent = Math.min(100, (daysSincePressureCheck / config.pressureCheckDays) * 100);

    // Calculate next service due
    const nextServices = [
      { type: 'Chain', milesRemaining: config.chainLifeMiles - chainMilesSinceChange },
      { type: 'Tires', milesRemaining: config.tireLifeMiles - tireMilesSinceChange },
      { type: 'Brakes', milesRemaining: config.brakeCheckMiles - brakeMilesSinceService },
    ].filter((s) => s.milesRemaining > 0).sort((a, b) => a.milesRemaining - b.milesRemaining);

    return {
      chainWearPercent,
      chainMilesSinceChange,
      chainMilesRemaining: Math.max(0, config.chainLifeMiles - chainMilesSinceChange),
      tireWearPercent,
      tireMilesSinceChange,
      tireMilesRemaining: Math.max(0, config.tireLifeMiles - tireMilesSinceChange),
      brakeCheckPercent,
      brakeMilesSinceService,
      brakeMilesRemaining: Math.max(0, config.brakeCheckMiles - brakeMilesSinceService),
      pressureCheckPercent,
      daysSincePressureCheck,
      daysUntilPressureCheck: Math.max(0, config.pressureCheckDays - daysSincePressureCheck),
      nextService: nextServices[0] || null,
    };
  }, [selectedBike, config]);

  const handleAddBike = () => {
    if (!newBikeName.trim()) return;
    const newBike: BikeProfile = {
      id: Date.now().toString(),
      name: newBikeName,
      type: newBikeType,
      totalMileage: 0,
      lastChainChange: 0,
      lastTireChange: 0,
      lastBrakeService: 0,
      tirePressureFront: bikeTypeConfigs[newBikeType].recommendedPressure,
      tirePressureRear: bikeTypeConfigs[newBikeType].recommendedPressure,
      recommendedPressure: bikeTypeConfigs[newBikeType].recommendedPressure,
      lastPressureCheck: new Date().toISOString().split('T')[0],
      serviceHistory: [],
    };
    addItem(newBike);
    setSelectedBikeId(newBike.id);
    setNewBikeName('');
    setShowAddBike(false);
  };

  const handleDeleteBike = (id: string) => {
    deleteItem(id);
    if (selectedBikeId === id) {
      const remainingBikes = bikes.filter((b) => b.id !== id);
      if (remainingBikes.length > 0) {
        setSelectedBikeId(remainingBikes[0].id);
      } else {
        setSelectedBikeId('');
      }
    }
  };

  const handleAddMileage = () => {
    const miles = parseFloat(mileageToAdd);
    if (isNaN(miles) || miles <= 0 || !selectedBike) return;
    updateItem(selectedBikeId, { totalMileage: selectedBike.totalMileage + miles });
    setMileageToAdd('');
  };

  const handleAddServiceRecord = () => {
    if (!selectedBike || !newService.type) return;
    const record: ServiceRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newService.type,
      mileage: selectedBike.totalMileage,
      notes: newService.notes,
      cost: newService.cost ? parseFloat(newService.cost) : undefined,
    };

    // Update last service mileage based on type
    const updates: Partial<BikeProfile> = {
      serviceHistory: [...selectedBike.serviceHistory, record],
    };

    if (newService.type === 'Chain Replacement') {
      updates.lastChainChange = selectedBike.totalMileage;
    } else if (newService.type === 'Tire Replacement') {
      updates.lastTireChange = selectedBike.totalMileage;
    } else if (newService.type.includes('Brake')) {
      updates.lastBrakeService = selectedBike.totalMileage;
    }

    updateItem(selectedBikeId, updates);
    setNewService({ type: 'Full Service', notes: '', cost: '' });
    setShowAddService(false);
  };

  const handlePressureCheck = () => {
    if (!selectedBike) return;
    updateItem(selectedBikeId, { lastPressureCheck: new Date().toISOString().split('T')[0] });
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500';
    if (percent >= 70) return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusBgColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg"><Bike className="w-5 h-5 text-cyan-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.bikeMaintenanceTracker', 'Bike Maintenance Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bikeMaintenance.keepYourRideInTop', 'Keep your ride in top condition')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="bike-maintenance" toolName="Bike Maintenance" />

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
              onExportCSV={() => exportCSV({ filename: 'bike-maintenance' })}
              onExportExcel={() => exportExcel({ filename: 'bike-maintenance' })}
              onExportJSON={() => exportJSON({ filename: 'bike-maintenance' })}
              onExportPDF={() => exportPDF({
                filename: 'bike-maintenance',
                title: 'Bike Maintenance Report',
                subtitle: `${bikes.length} bike(s) tracked`
              })}
              onPrint={() => print('Bike Maintenance')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bike Selector */}
        <div className="flex gap-2 flex-wrap">
          {bikes.map((bike) => (
            <button
              key={bike.id}
              onClick={() => setSelectedBikeId(bike.id)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${selectedBikeId === bike.id ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Bike className="w-4 h-4" />
              {bike.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddBike(true)}
            className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.bikeMaintenance.addBike', 'Add Bike')}
          </button>
        </div>

        {/* Add Bike Form */}
        {showAddBike && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.addNewBike', 'Add New Bike')}</h4>
            <input
              type="text"
              value={newBikeName}
              onChange={(e) => setNewBikeName(e.target.value)}
              placeholder={t('tools.bikeMaintenance.bikeName', 'Bike name')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(bikeTypeConfigs) as BikeType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewBikeType(type)}
                  className={`py-2 px-3 rounded-lg text-sm ${newBikeType === type ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {bikeTypeConfigs[type].name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddBike}
                className="flex-1 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                {t('tools.bikeMaintenance.addBike2', 'Add Bike')}
              </button>
              <button
                onClick={() => setShowAddBike(false)}
                className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {t('tools.bikeMaintenance.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { id: 'profile', label: 'Profile', icon: Bike },
            { id: 'mileage', label: 'Mileage', icon: Gauge },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'history', label: 'History', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-cyan-500 text-white' : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {selectedBike && maintenanceStatus && (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBike.name}</h4>
                    <span className="text-cyan-500 font-bold">{bikeTypeConfigs[selectedBike.type].name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      <span className="font-medium">{t('tools.bikeMaintenance.totalMileage', 'Total Mileage:')}</span> {selectedBike.totalMileage.toLocaleString()} mi
                    </div>
                    <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      <span className="font-medium">{t('tools.bikeMaintenance.tirePressure', 'Tire Pressure:')}</span> {selectedBike.recommendedPressure} PSI
                    </div>
                  </div>
                </div>

                {/* Next Service Due */}
                {maintenanceStatus.nextService && (
                  <div className={`p-4 rounded-lg ${maintenanceStatus.nextService.milesRemaining < 100 ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200') : (isDark ? 'bg-gray-800' : 'bg-gray-50')} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className={`w-5 h-5 ${maintenanceStatus.nextService.milesRemaining < 100 ? 'text-red-500' : 'text-cyan-500'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.nextServiceDue', 'Next Service Due')}</span>
                    </div>
                    <div className={`text-lg font-bold ${maintenanceStatus.nextService.milesRemaining < 100 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      {maintenanceStatus.nextService.type} in {maintenanceStatus.nextService.milesRemaining.toLocaleString()} miles
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="w-4 h-4 text-cyan-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.chain', 'Chain')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(maintenanceStatus.chainWearPercent)}`}>
                      {maintenanceStatus.chainWearPercent.toFixed(0)}%
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {maintenanceStatus.chainMilesRemaining.toLocaleString()} mi remaining
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CircleDot className="w-4 h-4 text-cyan-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.tires', 'Tires')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(maintenanceStatus.tireWearPercent)}`}>
                      {maintenanceStatus.tireWearPercent.toFixed(0)}%
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {maintenanceStatus.tireMilesRemaining.toLocaleString()} mi remaining
                    </div>
                  </div>
                </div>

                {/* Delete Bike */}
                {bikes.length > 1 && (
                  <button
                    onClick={() => handleDeleteBike(selectedBike.id)}
                    className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('tools.bikeMaintenance.deleteBike', 'Delete Bike')}
                  </button>
                )}
              </div>
            )}

            {/* Mileage Tab */}
            {activeTab === 'mileage' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bikeMaintenance.totalMileage2', 'Total Mileage')}</div>
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedBike.totalMileage.toLocaleString()}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>miles</div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Gauge className="w-4 h-4 inline mr-1" />
                    {t('tools.bikeMaintenance.addRideMileage', 'Add Ride Mileage')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={mileageToAdd}
                      onChange={(e) => setMileageToAdd(e.target.value)}
                      placeholder={t('tools.bikeMaintenance.milesRidden', 'Miles ridden')}
                      className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={handleAddMileage}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                    >
                      {t('tools.bikeMaintenance.add', 'Add')}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 20, 25, 50, 100].map((miles) => (
                    <button
                      key={miles}
                      onClick={() => setMileageToAdd(miles.toString())}
                      className={`py-2 px-4 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      +{miles} mi
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {/* Chain Wear Indicator */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-cyan-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.chainWear', 'Chain Wear')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(maintenanceStatus.chainWearPercent)}`}>
                      {maintenanceStatus.chainWearPercent >= 90 ? 'Replace Soon' : maintenanceStatus.chainWearPercent >= 70 ? t('tools.bikeMaintenance.monitor', 'Monitor') : t('tools.bikeMaintenance.good', 'Good')}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBgColor(maintenanceStatus.chainWearPercent)}`}
                      style={{ width: `${maintenanceStatus.chainWearPercent}%` }}
                    />
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceStatus.chainMilesSinceChange.toLocaleString()} / {config.chainLifeMiles.toLocaleString()} miles
                  </div>
                </div>

                {/* Tire Wear */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CircleDot className="w-5 h-5 text-cyan-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.tireWear', 'Tire Wear')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(maintenanceStatus.tireWearPercent)}`}>
                      {maintenanceStatus.tireWearPercent >= 90 ? 'Replace Soon' : maintenanceStatus.tireWearPercent >= 70 ? t('tools.bikeMaintenance.monitor2', 'Monitor') : t('tools.bikeMaintenance.good2', 'Good')}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBgColor(maintenanceStatus.tireWearPercent)}`}
                      style={{ width: `${maintenanceStatus.tireWearPercent}%` }}
                    />
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceStatus.tireMilesSinceChange.toLocaleString()} / {config.tireLifeMiles.toLocaleString()} miles
                  </div>
                </div>

                {/* Brake Check */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Disc className="w-5 h-5 text-cyan-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.brakeCheck', 'Brake Check')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(maintenanceStatus.brakeCheckPercent)}`}>
                      {maintenanceStatus.brakeCheckPercent >= 90 ? 'Check Now' : maintenanceStatus.brakeCheckPercent >= 70 ? t('tools.bikeMaintenance.checkSoon', 'Check Soon') : t('tools.bikeMaintenance.good3', 'Good')}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBgColor(maintenanceStatus.brakeCheckPercent)}`}
                      style={{ width: `${maintenanceStatus.brakeCheckPercent}%` }}
                    />
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceStatus.brakeMilesSinceService.toLocaleString()} / {config.brakeCheckMiles.toLocaleString()} miles since last check
                  </div>
                </div>

                {/* Tire Pressure Reminder */}
                <div className={`p-4 rounded-lg ${maintenanceStatus.pressureCheckPercent >= 100 ? (isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200') : (isDark ? 'bg-gray-800' : 'bg-gray-50')} border ${maintenanceStatus.pressureCheckPercent >= 100 ? '' : isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-cyan-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.tirePressureCheck', 'Tire Pressure Check')}</span>
                    </div>
                    {maintenanceStatus.pressureCheckPercent >= 100 ? (
                      <span className="text-amber-500 text-sm font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {t('tools.bikeMaintenance.overdue', 'Overdue')}
                      </span>
                    ) : (
                      <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.bikeMaintenance.ok', 'OK')}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last checked: {maintenanceStatus.daysSincePressureCheck} days ago
                    {maintenanceStatus.daysUntilPressureCheck > 0 && ` (${maintenanceStatus.daysUntilPressureCheck} days until next check)`}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Recommended: {selectedBike.recommendedPressure} PSI
                  </div>
                  <button
                    onClick={handlePressureCheck}
                    className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600"
                  >
                    {t('tools.bikeMaintenance.markAsChecked', 'Mark as Checked')}
                  </button>
                </div>

                {/* Add Service Record */}
                <button
                  onClick={() => setShowAddService(true)}
                  className="w-full py-3 bg-cyan-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.bikeMaintenance.logService', 'Log Service')}
                </button>

                {showAddService && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bikeMaintenance.logServiceRecord', 'Log Service Record')}</h4>
                    <select
                      value={newService.type}
                      onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {serviceTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newService.notes}
                      onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                      placeholder={t('tools.bikeMaintenance.notesOptional', 'Notes (optional)')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="number"
                      value={newService.cost}
                      onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                      placeholder={t('tools.bikeMaintenance.costOptional', 'Cost (optional)')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddServiceRecord}
                        className="flex-1 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                      >
                        {t('tools.bikeMaintenance.saveRecord', 'Save Record')}
                      </button>
                      <button
                        onClick={() => setShowAddService(false)}
                        className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.bikeMaintenance.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* History Header */}
                {selectedBike.serviceHistory.length > 0 && (
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Service Records ({selectedBike.serviceHistory.length})
                  </h4>
                )}

                {selectedBike.serviceHistory.length === 0 ? (
                  <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.bikeMaintenance.noServiceHistoryYet', 'No service history yet')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.bikeMaintenance.logYourFirstServiceTo', 'Log your first service to start tracking')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...selectedBike.serviceHistory].reverse().map((record) => (
                      <div
                        key={record.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.type}</span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{record.date}</span>
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          At {record.mileage.toLocaleString()} miles
                          {record.cost && ` - $${record.cost.toFixed(2)}`}
                        </div>
                        {record.notes && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Service Cost */}
                {selectedBike.serviceHistory.length > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bikeMaintenance.totalServiceCost', 'Total Service Cost')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedBike.serviceHistory.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.bikeMaintenance.maintenanceTips', 'Maintenance Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.bikeMaintenance.checkTirePressureBeforeEvery', 'Check tire pressure before every ride')}</li>
                <li>{t('tools.bikeMaintenance.cleanAndLubeChainEvery', 'Clean and lube chain every 100-200 miles')}</li>
                <li>{t('tools.bikeMaintenance.inspectBrakePadsMonthlyFor', 'Inspect brake pads monthly for wear')}</li>
                <li>{t('tools.bikeMaintenance.getAProfessionalTuneUp', 'Get a professional tune-up annually')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeMaintenanceTool;
