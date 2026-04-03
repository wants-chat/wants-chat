'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Wrench, Gauge, Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Info, DollarSign } from 'lucide-react';
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

type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'sports' | 'hybrid' | 'electric';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  mileage: number;
  cost: number;
  notes: string;
}

interface VehicleProfile {
  id: string;
  name: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  totalMileage: number;
  lastOilChange: number;
  lastTireRotation: number;
  lastBrakeService: number;
  maintenanceHistory: MaintenanceRecord[];
}

interface VehicleTypeConfig {
  name: string;
  oilChangeIntervalMiles: number;
  tireRotationIntervalMiles: number;
  brakeServiceIntervalMiles: number;
  maintenanceCheckIntervalMonths: number;
}

const vehicleTypeConfigs: Record<VehicleType, VehicleTypeConfig> = {
  sedan: {
    name: 'Sedan',
    oilChangeIntervalMiles: 5000,
    tireRotationIntervalMiles: 6000,
    brakeServiceIntervalMiles: 50000,
    maintenanceCheckIntervalMonths: 6,
  },
  suv: {
    name: 'SUV',
    oilChangeIntervalMiles: 5000,
    tireRotationIntervalMiles: 5000,
    brakeServiceIntervalMiles: 40000,
    maintenanceCheckIntervalMonths: 6,
  },
  truck: {
    name: 'Truck',
    oilChangeIntervalMiles: 5000,
    tireRotationIntervalMiles: 7000,
    brakeServiceIntervalMiles: 50000,
    maintenanceCheckIntervalMonths: 6,
  },
  van: {
    name: 'Van',
    oilChangeIntervalMiles: 5000,
    tireRotationIntervalMiles: 6000,
    brakeServiceIntervalMiles: 40000,
    maintenanceCheckIntervalMonths: 6,
  },
  sports: {
    name: 'Sports Car',
    oilChangeIntervalMiles: 3000,
    tireRotationIntervalMiles: 3000,
    brakeServiceIntervalMiles: 25000,
    maintenanceCheckIntervalMonths: 3,
  },
  hybrid: {
    name: 'Hybrid',
    oilChangeIntervalMiles: 7500,
    tireRotationIntervalMiles: 6000,
    brakeServiceIntervalMiles: 60000,
    maintenanceCheckIntervalMonths: 12,
  },
  electric: {
    name: 'Electric',
    oilChangeIntervalMiles: 0,
    tireRotationIntervalMiles: 5000,
    brakeServiceIntervalMiles: 75000,
    maintenanceCheckIntervalMonths: 12,
  },
};

const maintenanceTypes = [
  'Oil Change',
  'Tire Rotation',
  'Brake Pad Replacement',
  'Brake Service',
  'Tire Replacement',
  'Air Filter Change',
  'Coolant Flush',
  'Transmission Service',
  'Inspection',
  'Full Service',
  'Other',
];

const MAINTENANCE_HISTORY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'type', header: 'Service Type', type: 'string' },
  { key: 'mileage', header: 'Mileage (mi)', type: 'number' },
  { key: 'cost', header: 'Cost ($)', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface VehicleMaintenanceToolProps {
  uiConfig?: UIConfig;
}

export const VehicleMaintenanceTool: React.FC<VehicleMaintenanceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize with useToolData hook
  const {
    data: vehicles,
    addItem: addVehicle,
    updateItem: updateVehicle,
    deleteItem: deleteVehicle,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<VehicleProfile>('vehicle-maintenance', [
    {
      id: '1',
      name: 'My Car',
      type: 'sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      totalMileage: 45000,
      lastOilChange: 40000,
      lastTireRotation: 39000,
      lastBrakeService: 30000,
      maintenanceHistory: [
        { id: '1', date: '2024-06-15', type: 'Oil Change', mileage: 40000, cost: 45, notes: 'Regular oil change' },
        { id: '2', date: '2024-06-18', type: 'Tire Rotation', mileage: 39000, cost: 60, notes: 'All tires rotated' },
      ],
    },
  ], MAINTENANCE_HISTORY_COLUMNS);

  const [activeTab, setActiveTab] = useState<'profile' | 'maintenance' | 'history'>('profile');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('1');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleType, setNewVehicleType] = useState<VehicleType>('sedan');
  const [newVehicleMake, setNewVehicleMake] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleYear, setNewVehicleYear] = useState(new Date().getFullYear());
  const [mileageToAdd, setMileageToAdd] = useState('');
  const [newMaintenance, setNewMaintenance] = useState({
    type: 'Oil Change',
    notes: '',
    cost: '',
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.vehicleType) {
        setNewVehicleType(params.vehicleType as VehicleType);
        setIsPrefilled(true);
      }
      if (params.mileage !== undefined) {
        setMileageToAdd(String(params.mileage));
        setIsPrefilled(true);
      }
      if (params.activeTab) {
        setActiveTab(params.activeTab as 'profile' | 'maintenance' | 'history');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const config = selectedVehicle ? vehicleTypeConfigs[selectedVehicle.type] : vehicleTypeConfigs.sedan;

  const maintenanceStatus = useMemo(() => {
    if (!selectedVehicle) return null;

    const oilMilesSinceChange = selectedVehicle.totalMileage - selectedVehicle.lastOilChange;
    const oilWearPercent = Math.min(100, (oilMilesSinceChange / config.oilChangeIntervalMiles) * 100);

    const tireMilesSinceRotation = selectedVehicle.totalMileage - selectedVehicle.lastTireRotation;
    const tireWearPercent = Math.min(100, (tireMilesSinceRotation / config.tireRotationIntervalMiles) * 100);

    const brakeMilesSinceService = selectedVehicle.totalMileage - selectedVehicle.lastBrakeService;
    const brakeWearPercent = Math.min(100, (brakeMilesSinceService / config.brakeServiceIntervalMiles) * 100);

    const nextServices = [
      { type: 'Oil Change', milesRemaining: Math.max(0, config.oilChangeIntervalMiles - oilMilesSinceChange) },
      { type: 'Tire Rotation', milesRemaining: Math.max(0, config.tireRotationIntervalMiles - tireMilesSinceRotation) },
      { type: 'Brake Service', milesRemaining: Math.max(0, config.brakeServiceIntervalMiles - brakeMilesSinceService) },
    ].filter((s) => s.milesRemaining > 0).sort((a, b) => a.milesRemaining - b.milesRemaining);

    return {
      oilWearPercent,
      oilMilesSinceChange,
      oilMilesRemaining: Math.max(0, config.oilChangeIntervalMiles - oilMilesSinceChange),
      tireWearPercent,
      tireMilesSinceRotation,
      tireMilesRemaining: Math.max(0, config.tireRotationIntervalMiles - tireMilesSinceRotation),
      brakeWearPercent,
      brakeMilesSinceService,
      brakeMilesRemaining: Math.max(0, config.brakeServiceIntervalMiles - brakeMilesSinceService),
      nextService: nextServices[0] || null,
    };
  }, [selectedVehicle, config]);

  const handleAddVehicle = () => {
    if (!newVehicleName.trim() || !newVehicleMake.trim() || !newVehicleModel.trim()) return;

    const newVehicle: VehicleProfile = {
      id: Date.now().toString(),
      name: newVehicleName,
      type: newVehicleType,
      make: newVehicleMake,
      model: newVehicleModel,
      year: newVehicleYear,
      totalMileage: 0,
      lastOilChange: 0,
      lastTireRotation: 0,
      lastBrakeService: 0,
      maintenanceHistory: [],
    };

    addVehicle(newVehicle);
    setSelectedVehicleId(newVehicle.id);
    setNewVehicleName('');
    setNewVehicleMake('');
    setNewVehicleModel('');
    setNewVehicleYear(new Date().getFullYear());
    setShowAddVehicle(false);
  };

  const handleDeleteVehicle = (id: string) => {
    deleteVehicle(id);
    if (selectedVehicleId === id && vehicles.length > 1) {
      const remaining = vehicles.filter((v) => v.id !== id);
      setSelectedVehicleId(remaining[0].id);
    }
  };

  const handleAddMileage = () => {
    const miles = parseFloat(mileageToAdd);
    if (isNaN(miles) || miles <= 0 || !selectedVehicle) return;

    updateVehicle(selectedVehicleId, {
      totalMileage: selectedVehicle.totalMileage + miles,
    });
    setMileageToAdd('');
  };

  const handleAddMaintenanceRecord = () => {
    if (!selectedVehicle || !newMaintenance.type) return;

    const record: MaintenanceRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newMaintenance.type,
      mileage: selectedVehicle.totalMileage,
      cost: newMaintenance.cost ? parseFloat(newMaintenance.cost) : 0,
      notes: newMaintenance.notes,
    };

    let updates: Partial<VehicleProfile> = {
      maintenanceHistory: [...selectedVehicle.maintenanceHistory, record],
    };

    if (newMaintenance.type === 'Oil Change') {
      updates.lastOilChange = selectedVehicle.totalMileage;
    } else if (newMaintenance.type === 'Tire Rotation') {
      updates.lastTireRotation = selectedVehicle.totalMileage;
    } else if (newMaintenance.type.includes('Brake')) {
      updates.lastBrakeService = selectedVehicle.totalMileage;
    }

    updateVehicle(selectedVehicleId, updates);
    setNewMaintenance({ type: 'Oil Change', notes: '', cost: '' });
    setShowAddMaintenance(false);
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

  const getExportData = () => {
    if (!selectedVehicle) return [];
    return selectedVehicle.maintenanceHistory.map((record) => ({
      date: record.date,
      type: record.type,
      mileage: record.mileage,
      cost: record.cost || 0,
      notes: record.notes || '',
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return;
    // This will be handled by the ExportDropdown wrapper
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Car className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.vehicleMaintenanceTracker', 'Vehicle Maintenance Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vehicleMaintenance.keepYourVehicleInTop', 'Keep your vehicle in top condition')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="vehicle-maintenance" toolName="Vehicle Maintenance" />

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
        {/* Vehicle Selector */}
        <div className="flex gap-2 flex-wrap">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicleId(vehicle.id)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${selectedVehicleId === vehicle.id ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Car className="w-4 h-4" />
              {vehicle.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddVehicle(true)}
            className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.vehicleMaintenance.addVehicle', 'Add Vehicle')}
          </button>
        </div>

        {/* Add Vehicle Form */}
        {showAddVehicle && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.addNewVehicle', 'Add New Vehicle')}</h4>
            <input
              type="text"
              value={newVehicleName}
              onChange={(e) => setNewVehicleName(e.target.value)}
              placeholder={t('tools.vehicleMaintenance.vehicleNickname', 'Vehicle nickname')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newVehicleMake}
                onChange={(e) => setNewVehicleMake(e.target.value)}
                placeholder={t('tools.vehicleMaintenance.makeEGToyota', 'Make (e.g., Toyota)')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="text"
                value={newVehicleModel}
                onChange={(e) => setNewVehicleModel(e.target.value)}
                placeholder={t('tools.vehicleMaintenance.modelEGCamry', 'Model (e.g., Camry)')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <input
              type="number"
              value={newVehicleYear}
              onChange={(e) => setNewVehicleYear(parseInt(e.target.value))}
              placeholder={t('tools.vehicleMaintenance.year', 'Year')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(vehicleTypeConfigs) as VehicleType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewVehicleType(type)}
                  className={`py-2 px-3 rounded-lg text-sm ${newVehicleType === type ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {vehicleTypeConfigs[type].name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddVehicle}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {t('tools.vehicleMaintenance.addVehicle2', 'Add Vehicle')}
              </button>
              <button
                onClick={() => setShowAddVehicle(false)}
                className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {t('tools.vehicleMaintenance.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { id: 'profile', label: 'Profile', icon: Car },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'history', label: 'History', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-500 text-white' : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {selectedVehicle && maintenanceStatus && (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedVehicle.name}</h4>
                    <span className="text-blue-500 font-bold">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {vehicleTypeConfigs[selectedVehicle.type].name} • {selectedVehicle.totalMileage.toLocaleString()} miles
                  </div>
                </div>

                {/* Next Service Due */}
                {maintenanceStatus.nextService && (
                  <div className={`p-4 rounded-lg ${maintenanceStatus.nextService.milesRemaining < 500 ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200') : (isDark ? 'bg-gray-800' : 'bg-gray-50')} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className={`w-5 h-5 ${maintenanceStatus.nextService.milesRemaining < 500 ? 'text-red-500' : 'text-blue-500'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.nextServiceDue', 'Next Service Due')}</span>
                    </div>
                    <div className={`text-lg font-bold ${maintenanceStatus.nextService.milesRemaining < 500 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      {maintenanceStatus.nextService.type} in {maintenanceStatus.nextService.milesRemaining.toLocaleString()} miles
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.oilChange', 'Oil Change')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(maintenanceStatus.oilWearPercent)}`}>
                      {maintenanceStatus.oilWearPercent.toFixed(0)}%
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {maintenanceStatus.oilMilesRemaining.toLocaleString()} mi remaining
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-blue-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.tires', 'Tires')}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(maintenanceStatus.tireWearPercent)}`}>
                      {maintenanceStatus.tireWearPercent.toFixed(0)}%
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {maintenanceStatus.tireMilesRemaining.toLocaleString()} mi remaining
                    </div>
                  </div>
                </div>

                {/* Delete Vehicle */}
                {vehicles.length > 1 && (
                  <button
                    onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                    className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('tools.vehicleMaintenance.deleteVehicle', 'Delete Vehicle')}
                  </button>
                )}
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {/* Oil Change */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.oilChange2', 'Oil Change')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(maintenanceStatus.oilWearPercent)}`}>
                      {maintenanceStatus.oilWearPercent >= 90 ? 'Due Now' : maintenanceStatus.oilWearPercent >= 70 ? t('tools.vehicleMaintenance.dueSoon', 'Due Soon') : t('tools.vehicleMaintenance.good', 'Good')}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBgColor(maintenanceStatus.oilWearPercent)}`}
                      style={{ width: `${maintenanceStatus.oilWearPercent}%` }}
                    />
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceStatus.oilMilesSinceChange.toLocaleString()} / {config.oilChangeIntervalMiles.toLocaleString()} miles
                  </div>
                </div>

                {/* Tire Rotation */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-blue-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.tireRotation', 'Tire Rotation')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(maintenanceStatus.tireWearPercent)}`}>
                      {maintenanceStatus.tireWearPercent >= 90 ? 'Due Now' : maintenanceStatus.tireWearPercent >= 70 ? t('tools.vehicleMaintenance.dueSoon2', 'Due Soon') : t('tools.vehicleMaintenance.good2', 'Good')}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBgColor(maintenanceStatus.tireWearPercent)}`}
                      style={{ width: `${maintenanceStatus.tireWearPercent}%` }}
                    />
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceStatus.tireMilesSinceRotation.toLocaleString()} / {config.tireRotationIntervalMiles.toLocaleString()} miles
                  </div>
                </div>

                {/* Brake Service */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-blue-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.brakeService', 'Brake Service')}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(maintenanceStatus.brakeWearPercent)}`}>
                      {maintenanceStatus.brakeWearPercent >= 90 ? 'Due Now' : maintenanceStatus.brakeWearPercent >= 70 ? t('tools.vehicleMaintenance.dueSoon3', 'Due Soon') : t('tools.vehicleMaintenance.good3', 'Good')}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBgColor(maintenanceStatus.brakeWearPercent)}`}
                      style={{ width: `${maintenanceStatus.brakeWearPercent}%` }}
                    />
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceStatus.brakeMilesSinceService.toLocaleString()} / {config.brakeServiceIntervalMiles.toLocaleString()} miles since last service
                  </div>
                </div>

                {/* Add Mileage */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Gauge className="w-4 h-4 inline mr-1" />
                    {t('tools.vehicleMaintenance.addMileage', 'Add Mileage')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={mileageToAdd}
                      onChange={(e) => setMileageToAdd(e.target.value)}
                      placeholder={t('tools.vehicleMaintenance.milesDriven', 'Miles driven')}
                      className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={handleAddMileage}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {t('tools.vehicleMaintenance.add', 'Add')}
                    </button>
                  </div>
                </div>

                {/* Add Service Record */}
                <button
                  onClick={() => setShowAddMaintenance(true)}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.vehicleMaintenance.logMaintenance', 'Log Maintenance')}
                </button>

                {showAddMaintenance && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vehicleMaintenance.logMaintenanceRecord', 'Log Maintenance Record')}</h4>
                    <select
                      value={newMaintenance.type}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {maintenanceTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newMaintenance.notes}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, notes: e.target.value })}
                      placeholder={t('tools.vehicleMaintenance.notesOptional', 'Notes (optional)')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="number"
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: e.target.value })}
                      placeholder={t('tools.vehicleMaintenance.costOptional', 'Cost (optional)')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddMaintenanceRecord}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        {t('tools.vehicleMaintenance.saveRecord', 'Save Record')}
                      </button>
                      <button
                        onClick={() => setShowAddMaintenance(false)}
                        className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.vehicleMaintenance.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Export Header */}
                {selectedVehicle.maintenanceHistory.length > 0 && (
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Maintenance Records ({selectedVehicle.maintenanceHistory.length})
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

                {selectedVehicle.maintenanceHistory.length === 0 ? (
                  <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.vehicleMaintenance.noMaintenanceHistoryYet', 'No maintenance history yet')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.vehicleMaintenance.logYourFirstServiceTo', 'Log your first service to start tracking')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...selectedVehicle.maintenanceHistory].reverse().map((record) => (
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
                          {record.cost > 0 && ` - $${record.cost.toFixed(2)}`}
                        </div>
                        {record.notes && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Maintenance Cost */}
                {selectedVehicle.maintenanceHistory.length > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vehicleMaintenance.totalMaintenanceCost', 'Total Maintenance Cost')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedVehicle.maintenanceHistory.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(2)}
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
              <strong>{t('tools.vehicleMaintenance.maintenanceTips', 'Maintenance Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.vehicleMaintenance.checkTirePressureMonthly', 'Check tire pressure monthly')}</li>
                <li>{t('tools.vehicleMaintenance.rotateTiresEvery5000', 'Rotate tires every 5,000-7,000 miles')}</li>
                <li>{t('tools.vehicleMaintenance.changeOilEvery3000', 'Change oil every 3,000-7,500 miles')}</li>
                <li>{t('tools.vehicleMaintenance.getAnnualInspectionsForSafety', 'Get annual inspections for safety')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleMaintenanceTool;
