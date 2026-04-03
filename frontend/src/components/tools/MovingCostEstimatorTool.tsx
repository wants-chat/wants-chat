import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Home, MapPin, Package, Clock, AlertTriangle, Calculator, CheckSquare, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface MovingCostEstimatorToolProps {
  uiConfig?: UIConfig;
}

type HomeSize = 'studio' | '1br' | '2br' | '3br' | '4br' | '5br';
type MoveType = 'diy' | 'professional' | 'hybrid';
type DistanceType = 'local' | 'instate' | 'interstate' | 'crosscountry';

interface HomeSizeConfig {
  name: string;
  avgWeight: number; // lbs
  rooms: number;
  truckSize: string;
  packingHours: number;
  loadingHours: number;
}

interface HiddenCost {
  id: string;
  name: string;
  description: string;
  minCost: number;
  maxCost: number;
  checked: boolean;
}

interface MovingEstimateData {
  id: string;
  homeSize: HomeSize;
  moveType: MoveType;
  distance: number;
  distanceType: DistanceType;
  packingSuppliesNeeded: boolean;
  hiddenCosts: HiddenCost[];
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'value', header: 'Value', type: 'string' },
  { key: 'cost', header: 'Cost ($)', type: 'currency' },
];

// Default hidden costs configuration
const DEFAULT_HIDDEN_COSTS: HiddenCost[] = [
  { id: 'insurance', name: 'Moving Insurance', description: 'Full value protection', minCost: 100, maxCost: 500, checked: true },
  { id: 'storage', name: 'Storage (if needed)', description: 'Monthly storage unit', minCost: 100, maxCost: 300, checked: false },
  { id: 'packing', name: 'Professional Packing', description: 'Movers pack for you', minCost: 200, maxCost: 800, checked: false },
  { id: 'specialty', name: 'Specialty Items', description: 'Piano, pool table, etc.', minCost: 150, maxCost: 500, checked: false },
  { id: 'stairs', name: 'Stairs/Elevator Fee', description: 'Multi-floor access', minCost: 50, maxCost: 200, checked: false },
  { id: 'disassembly', name: 'Furniture Disassembly', description: 'Bed frames, tables, etc.', minCost: 50, maxCost: 200, checked: false },
  { id: 'tips', name: 'Mover Tips', description: '15-20% of total or $20-50/mover', minCost: 50, maxCost: 200, checked: true },
  { id: 'cleaning', name: 'Cleaning Services', description: 'Old/new place cleaning', minCost: 100, maxCost: 400, checked: false },
  { id: 'utilities', name: 'Utility Deposits', description: 'New service deposits', minCost: 100, maxCost: 500, checked: false },
  { id: 'petboarding', name: 'Pet Boarding/Transport', description: 'Moving day care', minCost: 50, maxCost: 300, checked: false },
];

// Create default estimate data
const createDefaultEstimate = (): MovingEstimateData => ({
  id: 'default',
  homeSize: '2br',
  moveType: 'professional',
  distance: 50,
  distanceType: 'local',
  packingSuppliesNeeded: true,
  hiddenCosts: DEFAULT_HIDDEN_COSTS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const MovingCostEstimatorTool: React.FC<MovingCostEstimatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence of user settings
  const {
    data: estimates,
    updateItem,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MovingEstimateData>('moving-cost-estimator', [createDefaultEstimate()], COLUMNS);

  // Get current estimate (we only maintain one)
  const currentEstimate = estimates[0] || createDefaultEstimate();

  // Derived state from the synced data
  const homeSize = currentEstimate.homeSize;
  const moveType = currentEstimate.moveType;
  const distance = currentEstimate.distance;
  const distanceType = currentEstimate.distanceType;
  const packingSuppliesNeeded = currentEstimate.packingSuppliesNeeded;
  const hiddenCosts = currentEstimate.hiddenCosts;

  // Update functions that sync to backend
  const setHomeSize = (value: HomeSize) => {
    updateItem(currentEstimate.id, { homeSize: value, updatedAt: new Date().toISOString() });
  };

  const setMoveType = (value: MoveType) => {
    updateItem(currentEstimate.id, { moveType: value, updatedAt: new Date().toISOString() });
  };

  const setDistance = (value: number) => {
    updateItem(currentEstimate.id, { distance: value, updatedAt: new Date().toISOString() });
  };

  const setDistanceType = (value: DistanceType) => {
    updateItem(currentEstimate.id, { distanceType: value, updatedAt: new Date().toISOString() });
  };

  const setPackingSuppliesNeeded = (value: boolean) => {
    updateItem(currentEstimate.id, { packingSuppliesNeeded: value, updatedAt: new Date().toISOString() });
  };

  const setHiddenCosts = (updater: (prev: HiddenCost[]) => HiddenCost[]) => {
    const newCosts = updater(currentEstimate.hiddenCosts);
    updateItem(currentEstimate.id, { hiddenCosts: newCosts, updatedAt: new Date().toISOString() });
  };

  const homeSizes: Record<HomeSize, HomeSizeConfig> = {
    studio: {
      name: 'Studio/Small',
      avgWeight: 1500,
      rooms: 1,
      truckSize: '10-12 ft',
      packingHours: 2,
      loadingHours: 2,
    },
    '1br': {
      name: '1 Bedroom',
      avgWeight: 2500,
      rooms: 3,
      truckSize: '12-14 ft',
      packingHours: 4,
      loadingHours: 3,
    },
    '2br': {
      name: '2 Bedroom',
      avgWeight: 5000,
      rooms: 5,
      truckSize: '14-17 ft',
      packingHours: 6,
      loadingHours: 4,
    },
    '3br': {
      name: '3 Bedroom',
      avgWeight: 7500,
      rooms: 7,
      truckSize: '17-20 ft',
      packingHours: 8,
      loadingHours: 6,
    },
    '4br': {
      name: '4 Bedroom',
      avgWeight: 10000,
      rooms: 9,
      truckSize: '20-22 ft',
      packingHours: 10,
      loadingHours: 8,
    },
    '5br': {
      name: '5+ Bedroom',
      avgWeight: 15000,
      rooms: 12,
      truckSize: '26 ft or multiple',
      packingHours: 14,
      loadingHours: 10,
    },
  };

  const distanceRates: Record<DistanceType, { name: string; range: string; perMile: number }> = {
    local: { name: 'Local', range: '< 50 miles', perMile: 0 },
    instate: { name: 'In-State', range: '50-100 miles', perMile: 0.50 },
    interstate: { name: 'Interstate', range: '100-500 miles', perMile: 0.70 },
    crosscountry: { name: 'Cross Country', range: '500+ miles', perMile: 0.90 },
  };

  const config = homeSizes[homeSize];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Use metadata for custom properties or numbers array
      const meta = params.metadata || {};
      if (meta.homeSize && ['studio', '1br', '2br', '3br', '4br', '5br'].includes(meta.homeSize)) {
        setHomeSize(meta.homeSize as HomeSize);
        hasChanges = true;
      }
      if (meta.moveType && ['diy', 'professional', 'hybrid'].includes(meta.moveType)) {
        setMoveType(meta.moveType as MoveType);
        hasChanges = true;
      }
      // Use numbers array for distance if provided
      if (params.numbers && params.numbers.length > 0) {
        const d = params.numbers[0];
        setDistance(d);
        if (d < 50) setDistanceType('local');
        else if (d < 100) setDistanceType('instate');
        else if (d < 500) setDistanceType('interstate');
        else setDistanceType('crosscountry');
        hasChanges = true;
      } else if (meta.distance !== undefined) {
        const d = meta.distance as number;
        setDistance(d);
        if (d < 50) setDistanceType('local');
        else if (d < 100) setDistanceType('instate');
        else if (d < 500) setDistanceType('interstate');
        else setDistanceType('crosscountry');
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const weight = config.avgWeight;

    // DIY Costs
    const truckRentalPerDay = homeSize === 'studio' ? 30 : homeSize === '1br' ? 40 : homeSize === '2br' ? 60 : homeSize === '3br' ? 80 : homeSize === '4br' ? 100 : 130;
    const fuelCost = (distance / 8) * 3.50; // ~8 mpg for moving truck
    const diyDays = distance > 500 ? 3 : distance > 100 ? 2 : 1;
    const diyTruckCost = truckRentalPerDay * diyDays;
    const diyEquipment = 75; // dolly, straps, blankets
    const diyInsurance = 30;
    const diyTotal = diyTruckCost + fuelCost + diyEquipment + diyInsurance;

    // Professional Costs
    const baseHourlyRate = 150; // per hour for crew
    const hoursNeeded = config.loadingHours * 2; // loading + unloading
    const localProfessional = baseHourlyRate * hoursNeeded;
    const longDistanceRate = weight * (distanceRates[distanceType].perMile || 0.50);
    const professionalBase = distanceType === 'local' ? localProfessional : Math.max(localProfessional + longDistanceRate, weight * 0.50);
    const professionalTotal = professionalBase;

    // Hybrid (rent truck, hire helpers)
    const laborHelpers = 35 * 2 * hoursNeeded; // $35/hr per helper, 2 helpers
    const hybridTotal = diyTruckCost + fuelCost + laborHelpers;

    // Packing Supplies
    const smallBoxes = Math.ceil(config.rooms * 5);
    const mediumBoxes = Math.ceil(config.rooms * 4);
    const largeBoxes = Math.ceil(config.rooms * 2);
    const wardrobeBoxes = Math.ceil(config.rooms * 0.5);
    const packingTape = Math.ceil(config.rooms * 1.5);
    const bubbleWrap = Math.ceil(config.rooms * 1);
    const packingPaper = Math.ceil(config.rooms * 2);

    const packingCost =
      (smallBoxes * 2) +
      (mediumBoxes * 3) +
      (largeBoxes * 4) +
      (wardrobeBoxes * 12) +
      (packingTape * 5) +
      (bubbleWrap * 15) +
      (packingPaper * 8);

    // Hidden costs total
    const hiddenCostsMin = hiddenCosts.filter(c => c.checked).reduce((sum, c) => sum + c.minCost, 0);
    const hiddenCostsMax = hiddenCosts.filter(c => c.checked).reduce((sum, c) => sum + c.maxCost, 0);

    // Timeline
    const packingDays = Math.ceil(config.packingHours / 4); // 4 hours/day of packing
    const loadingDays = 1;
    const travelDays = distance > 500 ? 2 : distance > 200 ? 1 : 0;
    const unloadingDays = 1;
    const totalMoveDays = packingDays + loadingDays + travelDays + unloadingDays;
    const weeksBeforeStart = Math.max(4, Math.ceil(totalMoveDays / 2));

    return {
      diy: {
        truck: diyTruckCost,
        fuel: fuelCost,
        equipment: diyEquipment,
        insurance: diyInsurance,
        total: diyTotal,
      },
      professional: {
        base: professionalBase,
        total: professionalTotal,
      },
      hybrid: {
        truck: diyTruckCost,
        fuel: fuelCost,
        labor: laborHelpers,
        total: hybridTotal,
      },
      packing: {
        smallBoxes,
        mediumBoxes,
        largeBoxes,
        wardrobeBoxes,
        packingTape,
        bubbleWrap,
        packingPaper,
        totalCost: packingCost,
      },
      timeline: {
        packingDays,
        loadingDays,
        travelDays,
        unloadingDays,
        totalMoveDays,
        weeksBeforeStart,
      },
      hiddenCosts: {
        min: hiddenCostsMin,
        max: hiddenCostsMax,
      },
      totalEstimate: {
        diy: diyTotal + (packingSuppliesNeeded ? packingCost : 0) + hiddenCostsMin,
        diyMax: diyTotal + (packingSuppliesNeeded ? packingCost : 0) + hiddenCostsMax,
        professional: professionalTotal + hiddenCostsMin,
        professionalMax: professionalTotal + hiddenCostsMax,
        hybrid: hybridTotal + (packingSuppliesNeeded ? packingCost : 0) + hiddenCostsMin,
        hybridMax: hybridTotal + (packingSuppliesNeeded ? packingCost : 0) + hiddenCostsMax,
      },
    };
  }, [homeSize, distance, distanceType, config, hiddenCosts, packingSuppliesNeeded]);

  // Generate export data from current calculations
  const exportData = useMemo(() => {
    const data: Array<{ category: string; item: string; value: string; cost: number | null }> = [];

    // Move Details
    data.push({ category: 'Move Details', item: 'Home Size', value: config.name, cost: null });
    data.push({ category: 'Move Details', item: 'Estimated Weight', value: `${config.avgWeight.toLocaleString()} lbs`, cost: null });
    data.push({ category: 'Move Details', item: 'Distance', value: `${distance} miles`, cost: null });
    data.push({ category: 'Move Details', item: 'Distance Type', value: distanceRates[distanceType].name, cost: null });
    data.push({ category: 'Move Details', item: 'Move Type', value: moveType === 'diy' ? 'DIY' : moveType === 'professional' ? 'Professional' : 'Hybrid', cost: null });
    data.push({ category: 'Move Details', item: 'Recommended Truck', value: config.truckSize, cost: null });

    // DIY Costs
    data.push({ category: 'DIY Costs', item: 'Truck Rental', value: '', cost: calculations.diy.truck });
    data.push({ category: 'DIY Costs', item: 'Fuel', value: '', cost: calculations.diy.fuel });
    data.push({ category: 'DIY Costs', item: 'Equipment Rental', value: '', cost: calculations.diy.equipment });
    data.push({ category: 'DIY Costs', item: 'Insurance', value: '', cost: calculations.diy.insurance });
    data.push({ category: 'DIY Costs', item: 'DIY Subtotal', value: '', cost: calculations.diy.total });

    // Professional Costs
    data.push({ category: 'Professional Costs', item: 'Full Service Moving', value: '', cost: calculations.professional.base });
    data.push({ category: 'Professional Costs', item: 'Professional Subtotal', value: '', cost: calculations.professional.total });

    // Hybrid Costs
    data.push({ category: 'Hybrid Costs', item: 'Truck Rental', value: '', cost: calculations.hybrid.truck });
    data.push({ category: 'Hybrid Costs', item: 'Fuel', value: '', cost: calculations.hybrid.fuel });
    data.push({ category: 'Hybrid Costs', item: 'Hired Labor', value: '', cost: calculations.hybrid.labor });
    data.push({ category: 'Hybrid Costs', item: 'Hybrid Subtotal', value: '', cost: calculations.hybrid.total });

    // Packing Supplies
    if (packingSuppliesNeeded) {
      data.push({ category: 'Packing Supplies', item: 'Small Boxes', value: `${calculations.packing.smallBoxes} boxes`, cost: calculations.packing.smallBoxes * 2 });
      data.push({ category: 'Packing Supplies', item: 'Medium Boxes', value: `${calculations.packing.mediumBoxes} boxes`, cost: calculations.packing.mediumBoxes * 3 });
      data.push({ category: 'Packing Supplies', item: 'Large Boxes', value: `${calculations.packing.largeBoxes} boxes`, cost: calculations.packing.largeBoxes * 4 });
      data.push({ category: 'Packing Supplies', item: 'Wardrobe Boxes', value: `${calculations.packing.wardrobeBoxes} boxes`, cost: calculations.packing.wardrobeBoxes * 12 });
      data.push({ category: 'Packing Supplies', item: 'Packing Tape', value: `${calculations.packing.packingTape} rolls`, cost: calculations.packing.packingTape * 5 });
      data.push({ category: 'Packing Supplies', item: 'Bubble Wrap', value: `${calculations.packing.bubbleWrap} rolls`, cost: calculations.packing.bubbleWrap * 15 });
      data.push({ category: 'Packing Supplies', item: 'Packing Paper', value: `${calculations.packing.packingPaper} lbs`, cost: calculations.packing.packingPaper * 8 });
      data.push({ category: 'Packing Supplies', item: 'Supplies Total', value: '', cost: calculations.packing.totalCost });
    }

    // Timeline
    data.push({ category: 'Timeline', item: 'Packing Days', value: `${calculations.timeline.packingDays} days`, cost: null });
    data.push({ category: 'Timeline', item: 'Loading Days', value: `${calculations.timeline.loadingDays} day`, cost: null });
    if (calculations.timeline.travelDays > 0) {
      data.push({ category: 'Timeline', item: 'Travel Days', value: `${calculations.timeline.travelDays} day(s)`, cost: null });
    }
    data.push({ category: 'Timeline', item: 'Unloading Days', value: `${calculations.timeline.unloadingDays} day`, cost: null });
    data.push({ category: 'Timeline', item: 'Total Move Duration', value: `${calculations.timeline.totalMoveDays} days`, cost: null });
    data.push({ category: 'Timeline', item: 'Start Planning', value: `${calculations.timeline.weeksBeforeStart} weeks before`, cost: null });

    // Hidden Costs (selected)
    hiddenCosts.filter(c => c.checked).forEach(cost => {
      data.push({ category: 'Hidden Costs', item: cost.name, value: cost.description, cost: (cost.minCost + cost.maxCost) / 2 });
    });
    data.push({ category: 'Hidden Costs', item: 'Hidden Costs Range', value: `$${calculations.hiddenCosts.min} - $${calculations.hiddenCosts.max}`, cost: null });

    // Total Estimates
    data.push({ category: 'Total Estimates', item: 'DIY Low Estimate', value: '', cost: calculations.totalEstimate.diy });
    data.push({ category: 'Total Estimates', item: 'DIY High Estimate', value: '', cost: calculations.totalEstimate.diyMax });
    data.push({ category: 'Total Estimates', item: 'Hybrid Low Estimate', value: '', cost: calculations.totalEstimate.hybrid });
    data.push({ category: 'Total Estimates', item: 'Hybrid High Estimate', value: '', cost: calculations.totalEstimate.hybridMax });
    data.push({ category: 'Total Estimates', item: 'Professional Low Estimate', value: '', cost: calculations.totalEstimate.professional });
    data.push({ category: 'Total Estimates', item: 'Professional High Estimate', value: '', cost: calculations.totalEstimate.professionalMax });

    return data;
  }, [calculations, config, distance, distanceType, moveType, hiddenCosts, packingSuppliesNeeded]);

  const toggleHiddenCost = (id: string) => {
    setHiddenCosts(prev => prev.map(cost =>
      cost.id === id ? { ...cost, checked: !cost.checked } : cost
    ));
  };

  const getSelectedCost = () => {
    switch (moveType) {
      case 'diy':
        return { min: calculations.totalEstimate.diy, max: calculations.totalEstimate.diyMax };
      case 'professional':
        return { min: calculations.totalEstimate.professional, max: calculations.totalEstimate.professionalMax };
      case 'hybrid':
        return { min: calculations.totalEstimate.hybrid, max: calculations.totalEstimate.hybridMax };
    }
  };

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
            <div className="p-2 bg-blue-500/10 rounded-lg"><Truck className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostEstimator.movingCostEstimator', 'Moving Cost Estimator')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.movingCostEstimator.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCostEstimator.planAndBudgetYourMove', 'Plan and budget your move')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="moving-cost-estimator" toolName="Moving Cost Estimator" />

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
              onExportCSV={() => exportToCSV(exportData, COLUMNS, { filename: 'moving-cost-estimate' })}
              onExportExcel={() => exportToExcel(exportData, COLUMNS, { filename: 'moving-cost-estimate' })}
              onExportJSON={() => exportToJSON(exportData, { filename: 'moving-cost-estimate' })}
              onExportPDF={() => exportToPDF(exportData, COLUMNS, {
                filename: 'moving-cost-estimate',
                title: 'Moving Cost Estimate',
                subtitle: `${config.name} - ${distance} miles - ${moveType === 'diy' ? 'DIY' : moveType === 'professional' ? t('tools.movingCostEstimator.professional2', 'Professional') : t('tools.movingCostEstimator.hybrid2', 'Hybrid')}`
              })}
              onPrint={() => printData(exportData, COLUMNS, { title: 'Moving Cost Estimate' })}
              onCopyToClipboard={() => copyUtil(exportData, COLUMNS)}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Home Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostEstimator.homeSize', 'Home Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(homeSizes) as HomeSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setHomeSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${homeSize === size ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {homeSizes[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Home Size Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-blue-500 font-bold">~{config.avgWeight.toLocaleString()} lbs</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.movingCostEstimator.rooms', 'Rooms:')}</span> {config.rooms}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.movingCostEstimator.truck', 'Truck:')}</span> {config.truckSize}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.movingCostEstimator.packTime', 'Pack Time:')}</span> {config.packingHours}h
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.movingCostEstimator.loadTime', 'Load Time:')}</span> {config.loadingHours}h
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostEstimator.distanceMiles', 'Distance (miles)')}
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => {
              const d = parseInt(e.target.value) || 0;
              setDistance(d);
              if (d < 50) setDistanceType('local');
              else if (d < 100) setDistanceType('instate');
              else if (d < 500) setDistanceType('interstate');
              else setDistanceType('crosscountry');
            }}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <div className="grid grid-cols-4 gap-1">
            {(Object.keys(distanceRates) as DistanceType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setDistanceType(type);
                  if (type === 'local') setDistance(25);
                  else if (type === 'instate') setDistance(75);
                  else if (type === 'interstate') setDistance(300);
                  else setDistance(1000);
                }}
                className={`py-1 px-2 rounded text-xs ${distanceType === type ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {distanceRates[type].name}
              </button>
            ))}
          </div>
        </div>

        {/* Move Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostEstimator.moveType', 'Move Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMoveType('diy')}
              className={`py-3 px-4 rounded-lg text-center ${moveType === 'diy' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.movingCostEstimator.diy', 'DIY')}</div>
              <div className="text-xs opacity-75">{t('tools.movingCostEstimator.rentTruckDoItYourself', 'Rent truck, do it yourself')}</div>
            </button>
            <button
              onClick={() => setMoveType('professional')}
              className={`py-3 px-4 rounded-lg text-center ${moveType === 'professional' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.movingCostEstimator.professional', 'Professional')}</div>
              <div className="text-xs opacity-75">{t('tools.movingCostEstimator.fullServiceMovers', 'Full service movers')}</div>
            </button>
            <button
              onClick={() => setMoveType('hybrid')}
              className={`py-3 px-4 rounded-lg text-center ${moveType === 'hybrid' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.movingCostEstimator.hybrid', 'Hybrid')}</div>
              <div className="text-xs opacity-75">{t('tools.movingCostEstimator.rentTruckHireLabor', 'Rent truck, hire labor')}</div>
            </button>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            Cost Breakdown ({moveType === 'diy' ? 'DIY' : moveType === 'professional' ? t('tools.movingCostEstimator.professional3', 'Professional') : t('tools.movingCostEstimator.hybrid3', 'Hybrid')})
          </h4>
          {moveType === 'diy' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.truckRental', 'Truck Rental')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.diy.truck.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.fuel', 'Fuel')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.diy.fuel.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.equipmentRental', 'Equipment Rental')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.diy.equipment.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.insurance', 'Insurance')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.diy.insurance.toFixed(0)}</span></div>
              <div className={`flex justify-between pt-2 border-t font-medium ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.movingCostEstimator.subtotal', 'Subtotal')}</span>
                <span className="text-green-500">${calculations.diy.total.toFixed(0)}</span>
              </div>
            </div>
          )}
          {moveType === 'professional' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.fullServiceMoving', 'Full Service Moving')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.professional.base.toFixed(0)}</span></div>
              <div className={`flex justify-between pt-2 border-t font-medium ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.movingCostEstimator.subtotal2', 'Subtotal')}</span>
                <span className="text-blue-500">${calculations.professional.total.toFixed(0)}</span>
              </div>
            </div>
          )}
          {moveType === 'hybrid' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.truckRental2', 'Truck Rental')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.hybrid.truck.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.fuel2', 'Fuel')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.hybrid.fuel.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.hiredLabor', 'Hired Labor')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.hybrid.labor.toFixed(0)}</span></div>
              <div className={`flex justify-between pt-2 border-t font-medium ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.movingCostEstimator.subtotal3', 'Subtotal')}</span>
                <span className="text-purple-500">${calculations.hybrid.total.toFixed(0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Packing Supplies */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Package className="w-4 h-4 inline mr-1" />
              {t('tools.movingCostEstimator.packingSuppliesNeeded', 'Packing Supplies Needed')}
            </label>
            <button
              onClick={() => setPackingSuppliesNeeded(!packingSuppliesNeeded)}
              className={`px-3 py-1 rounded-lg text-sm ${packingSuppliesNeeded ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
            >
              {packingSuppliesNeeded ? 'Yes' : 'No'}
            </button>
          </div>
          {packingSuppliesNeeded && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.smallBoxes', 'Small Boxes')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.smallBoxes}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.mediumBoxes', 'Medium Boxes')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.mediumBoxes}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.largeBoxes', 'Large Boxes')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.largeBoxes}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.wardrobeBoxes', 'Wardrobe Boxes')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.wardrobeBoxes}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.packingTapeRolls', 'Packing Tape (rolls)')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.packingTape}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.bubbleWrapRolls', 'Bubble Wrap (rolls)')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.bubbleWrap}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.packingPaperLbs', 'Packing Paper (lbs)')}</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.packing.packingPaper}</span></div>
              </div>
              <div className={`flex justify-between pt-2 mt-2 border-t font-medium text-sm ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.movingCostEstimator.suppliesTotal', 'Supplies Total')}</span>
                <span className="text-orange-500">${calculations.packing.totalCost.toFixed(0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Truck Size Recommendation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostEstimator.recommendedTruckSize', 'Recommended Truck Size')}</h4>
          </div>
          <div className="text-2xl font-bold text-green-500 mb-1">{config.truckSize}</div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            For {config.name.toLowerCase()} with approximately {config.avgWeight.toLocaleString()} lbs of belongings
          </p>
        </div>

        {/* Timeline Planner */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostEstimator.timelinePlanner', 'Timeline Planner')}
          </label>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>1</div>
                <div className="flex-1">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostEstimator.startPacking', 'Start Packing')}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.timeline.weeksBeforeStart} weeks before move • {calculations.timeline.packingDays} days needed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>2</div>
                <div className="flex-1">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostEstimator.loadingDay', 'Loading Day')}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.timeline.loadingDays} day • {config.loadingHours} hours estimated</div>
                </div>
              </div>
              {calculations.timeline.travelDays > 0 && (
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>3</div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostEstimator.travelTime', 'Travel Time')}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.timeline.travelDays} day(s) • {distance} miles</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'}`}>{calculations.timeline.travelDays > 0 ? '4' : '3'}</div>
                <div className="flex-1">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostEstimator.unloadingDay', 'Unloading Day')}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.timeline.unloadingDays} day • {config.loadingHours} hours estimated</div>
                </div>
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.totalMoveDuration', 'Total Move Duration')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.timeline.totalMoveDays} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Costs Checklist */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostEstimator.hiddenCostsChecklist', 'Hidden Costs Checklist')}
          </label>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-2 max-h-64 overflow-y-auto`}>
            {hiddenCosts.map((cost) => (
              <div
                key={cost.id}
                onClick={() => toggleHiddenCost(cost.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${cost.checked ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : ''} hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <CheckSquare className={`w-5 h-5 ${cost.checked ? 'text-blue-500' : isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{cost.name}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{cost.description}</div>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  ${cost.minCost}-${cost.maxCost}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.movingCostEstimator.selectedHiddenCosts', 'Selected Hidden Costs')}</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.hiddenCosts.min} - ${calculations.hiddenCosts.max}</span>
          </div>
        </div>

        {/* Total Estimate */}
        <div className={`p-5 rounded-lg text-center ${isDark ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCostEstimator.estimatedTotalCost', 'Estimated Total Cost')}</div>
          <div className={`text-4xl font-bold ${moveType === 'diy' ? 'text-green-500' : moveType === 'professional' ? 'text-blue-500' : 'text-purple-500'}`}>
            ${getSelectedCost().min.toLocaleString()} - ${getSelectedCost().max.toLocaleString()}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
            {moveType === 'diy' ? 'DIY Move' : moveType === 'professional' ? t('tools.movingCostEstimator.professionalMovers', 'Professional Movers') : t('tools.movingCostEstimator.hybridMove', 'Hybrid Move')} • {config.name} • {distance} miles
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-green-500 font-bold">${calculations.totalEstimate.diy.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.movingCostEstimator.diyLow', 'DIY Low')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-purple-500 font-bold">${calculations.totalEstimate.hybrid.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.movingCostEstimator.hybridLow', 'Hybrid Low')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-blue-500 font-bold">${calculations.totalEstimate.professional.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.movingCostEstimator.proLow', 'Pro Low')}</div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.movingCostEstimator.moneySavingTips', 'Money-Saving Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.movingCostEstimator.moveMidWeekAndMid', 'Move mid-week and mid-month for lower rates')}</li>
                <li>{t('tools.movingCostEstimator.getFreeBoxesFromGrocery', 'Get free boxes from grocery stores or Facebook')}</li>
                <li>Declutter before moving - less stuff = lower cost</li>
                <li>{t('tools.movingCostEstimator.bookMovers46Weeks', 'Book movers 4-6 weeks in advance for better rates')}</li>
                <li>{t('tools.movingCostEstimator.compareAtLeast3Moving', 'Compare at least 3 moving quotes')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingCostEstimatorTool;
