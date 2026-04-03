import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Package, Scale, Maximize, Sparkles, Info, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TruckLoadCalculatorToolProps {
  uiConfig?: UIConfig;
}

type TruckType = 'sprinter' | 'box16' | 'box24' | 'box26' | 'semi53';

interface TruckSpec {
  name: string;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  maxWeightLbs: number;
  palletCapacity: number;
}

interface CargoItem {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
  stackable: boolean;
}

export const TruckLoadCalculatorTool: React.FC<TruckLoadCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [truckType, setTruckType] = useState<TruckType>('box26');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [items, setItems] = useState<CargoItem[]>([
    { id: '1', name: 'Pallet 1', length: '48', width: '40', height: '48', weight: '1000', quantity: '5', stackable: true },
  ]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.items !== undefined && Array.isArray(params.items)) {
        setItems(params.items.map((item: any, idx: number) => ({
          id: String(idx + 1),
          name: item.name || `Item ${idx + 1}`,
          length: String(item.length || 48),
          width: String(item.width || 40),
          height: String(item.height || 48),
          weight: String(item.weight || 500),
          quantity: String(item.quantity || 1),
          stackable: item.stackable !== false,
        })));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const trucks: Record<TruckType, TruckSpec> = {
    sprinter: { name: 'Sprinter Van', lengthFt: 12, widthFt: 5.5, heightFt: 5.5, maxWeightLbs: 3000, palletCapacity: 4 },
    box16: { name: '16ft Box Truck', lengthFt: 16, widthFt: 7.5, heightFt: 7, maxWeightLbs: 6000, palletCapacity: 6 },
    box24: { name: '24ft Box Truck', lengthFt: 24, widthFt: 8, heightFt: 8, maxWeightLbs: 10000, palletCapacity: 12 },
    box26: { name: '26ft Box Truck', lengthFt: 26, widthFt: 8.5, heightFt: 9, maxWeightLbs: 12000, palletCapacity: 14 },
    semi53: { name: '53ft Semi Trailer', lengthFt: 53, widthFt: 8.5, heightFt: 9, maxWeightLbs: 45000, palletCapacity: 26 },
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: `Item ${items.length + 1}`,
      length: '48',
      width: '40',
      height: '48',
      weight: '500',
      quantity: '1',
      stackable: true,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CargoItem, value: string | boolean) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculations = useMemo(() => {
    const truck = trucks[truckType];
    const truckLengthIn = truck.lengthFt * 12;
    const truckWidthIn = truck.widthFt * 12;
    const truckHeightIn = truck.heightFt * 12;
    const truckVolumeCuFt = truck.lengthFt * truck.widthFt * truck.heightFt;
    const truckVolumeCuIn = truckVolumeCuFt * 1728;

    let totalWeight = 0;
    let totalVolumeCuIn = 0;
    let totalFloorAreaSqIn = 0;
    let totalItemCount = 0;

    const itemCalcs = items.map(item => {
      let l = parseFloat(item.length) || 0;
      let w = parseFloat(item.width) || 0;
      let h = parseFloat(item.height) || 0;
      let wt = parseFloat(item.weight) || 0;
      const qty = parseInt(item.quantity) || 0;

      // Convert to imperial if metric
      if (unit === 'metric') {
        l = l * 0.393701;
        w = w * 0.393701;
        h = h * 0.393701;
        wt = wt * 2.20462;
      }

      const volumePerUnit = l * w * h;
      const floorAreaPerUnit = l * w;

      return {
        id: item.id,
        name: item.name,
        length: l,
        width: w,
        height: h,
        weight: wt,
        quantity: qty,
        stackable: item.stackable,
        volumePerUnit,
        floorAreaPerUnit,
        totalVolume: volumePerUnit * qty,
        totalWeight: wt * qty,
        totalFloorArea: floorAreaPerUnit * qty,
        fitsLength: l <= truckLengthIn,
        fitsWidth: w <= truckWidthIn,
        fitsHeight: h <= truckHeightIn,
      };
    });

    itemCalcs.forEach(item => {
      totalWeight += item.totalWeight;
      totalVolumeCuIn += item.totalVolume;
      totalFloorAreaSqIn += item.totalFloorArea;
      totalItemCount += item.quantity;
    });

    const truckFloorAreaSqIn = truckLengthIn * truckWidthIn;
    const volumeUtilization = (totalVolumeCuIn / truckVolumeCuIn) * 100;
    const weightUtilization = (totalWeight / truck.maxWeightLbs) * 100;
    const floorUtilization = (totalFloorAreaSqIn / truckFloorAreaSqIn) * 100;

    const isOverWeight = totalWeight > truck.maxWeightLbs;
    const isOverVolume = totalVolumeCuIn > truckVolumeCuIn;
    const hasOversizedItems = itemCalcs.some(i => !i.fitsLength || !i.fitsWidth || !i.fitsHeight);

    const loadStatus = isOverWeight || isOverVolume || hasOversizedItems ? 'overloaded' :
                       (volumeUtilization > 85 || weightUtilization > 90) ? 'optimal' : 'underutilized';

    const remainingWeight = truck.maxWeightLbs - totalWeight;
    const remainingVolume = truckVolumeCuFt - (totalVolumeCuIn / 1728);

    return {
      truck,
      truckVolumeCuFt,
      itemCalcs,
      totalWeight,
      totalVolumeCuFt: totalVolumeCuIn / 1728,
      totalItemCount,
      volumeUtilization,
      weightUtilization,
      floorUtilization,
      isOverWeight,
      isOverVolume,
      hasOversizedItems,
      loadStatus,
      remainingWeight,
      remainingVolume,
    };
  }, [truckType, items, unit]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Truck className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.truckLoadCalculator.truckLoadCalculator', 'Truck Load Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.truckLoadCalculator.calculateTruckCapacityAndLoading', 'Calculate truck capacity and loading efficiency')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.truckLoadCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.truckLoadCalculator.imperialInLbs', 'Imperial (in/lbs)')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.truckLoadCalculator.metricCmKg', 'Metric (cm/kg)')}
          </button>
        </div>

        {/* Truck Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.truckLoadCalculator.truckType', 'Truck Type')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(trucks).map(([key, spec]) => (
              <button
                key={key}
                onClick={() => setTruckType(key as TruckType)}
                className={`py-3 px-2 rounded-lg text-xs transition-colors ${truckType === key ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium">{spec.name.split(' ')[0]}</div>
                <div className={`${truckType === key ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {spec.lengthFt}' x {spec.widthFt}' x {spec.heightFt}'
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Truck Info */}
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.truck.lengthFt}' x {calculations.truck.widthFt}' x {calculations.truck.heightFt}'</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>L x W x H</div>
            </div>
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.truckVolumeCuFt.toLocaleString()} ft³</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.truckLoadCalculator.volume', 'Volume')}</div>
            </div>
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.truck.maxWeightLbs.toLocaleString()} lbs</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.truckLoadCalculator.maxWeight', 'Max Weight')}</div>
            </div>
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.truck.palletCapacity}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.truckLoadCalculator.pallets', 'Pallets')}</div>
            </div>
          </div>
        </div>

        {/* Cargo Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Package className="w-4 h-4 inline mr-1" />
              {t('tools.truckLoadCalculator.cargoItems', 'Cargo Items')}
            </label>
            <button
              onClick={addItem}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.truckLoadCalculator.addItem', 'Add Item')}
            </button>
          </div>

          {items.map((item) => {
            const calc = calculations.itemCalcs.find(i => i.id === item.id);
            const hasIssue = calc && (!calc.fitsLength || !calc.fitsWidth || !calc.fitsHeight);
            return (
              <div key={item.id} className={`p-4 rounded-lg ${hasIssue ? 'bg-red-500/10 border border-red-500/20' : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className={`font-medium bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={item.stackable}
                        onChange={(e) => updateItem(item.id, 'stackable', e.target.checked)}
                        className="w-3 h-3 rounded text-teal-500"
                      />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.truckLoadCalculator.stackable', 'Stackable')}</span>
                    </label>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <input
                      type="number"
                      value={item.length}
                      onChange={(e) => updateItem(item.id, 'length', e.target.value)}
                      className={`w-full px-2 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>L ({unit === 'imperial' ? 'in' : 'cm'})</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.width}
                      onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                      className={`w-full px-2 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>W</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.height}
                      onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                      className={`w-full px-2 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>H</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.weight}
                      onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                      className={`w-full px-2 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{unit === 'imperial' ? 'lbs' : 'kg'}</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className={`w-full px-2 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.truckLoadCalculator.qty', 'Qty')}</span>
                  </div>
                </div>
                {hasIssue && calc && (
                  <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Item exceeds truck dimensions ({!calc.fitsLength && 'Length '}{!calc.fitsWidth && 'Width '}{!calc.fitsHeight && 'Height'})
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load Status */}
        <div className={`p-6 rounded-xl text-center ${
          calculations.loadStatus === 'overloaded'
            ? 'bg-red-500/10 border-red-500/30'
            : calculations.loadStatus === 'optimal'
              ? 'bg-green-500/10 border-green-500/30'
              : isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'
        } border`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {calculations.loadStatus === 'overloaded' ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : calculations.loadStatus === 'optimal' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Truck className="w-5 h-5 text-teal-500" />
            )}
            <span className={`font-medium ${
              calculations.loadStatus === 'overloaded' ? 'text-red-500'
              : calculations.loadStatus === 'optimal' ? 'text-green-500'
              : 'text-teal-500'
            }`}>
              {calculations.loadStatus === 'overloaded' ? 'OVERLOADED'
               : calculations.loadStatus === 'optimal' ? t('tools.truckLoadCalculator.optimalLoad', 'OPTIMAL LOAD') : t('tools.truckLoadCalculator.underutilized', 'UNDERUTILIZED')}
            </span>
          </div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.totalItemCount} items | {calculations.totalVolumeCuFt.toFixed(1)} ft³ | {calculations.totalWeight.toLocaleString()} lbs
          </div>
        </div>

        {/* Utilization Bars */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Maximize className="w-4 h-4 inline mr-1" />
                {t('tools.truckLoadCalculator.volume2', 'Volume')}
              </span>
              <span className={`text-sm font-medium ${calculations.isOverVolume ? 'text-red-500' : calculations.volumeUtilization > 85 ? 'text-green-500' : 'text-teal-500'}`}>
                {calculations.volumeUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${calculations.isOverVolume ? 'bg-red-500' : calculations.volumeUtilization > 85 ? 'bg-green-500' : 'bg-teal-500'}`}
                style={{ width: `${Math.min(calculations.volumeUtilization, 100)}%` }}
              />
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.remainingVolume.toFixed(1)} ft³ remaining
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Scale className="w-4 h-4 inline mr-1" />
                {t('tools.truckLoadCalculator.weight', 'Weight')}
              </span>
              <span className={`text-sm font-medium ${calculations.isOverWeight ? 'text-red-500' : calculations.weightUtilization > 90 ? 'text-amber-500' : 'text-green-500'}`}>
                {calculations.weightUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${calculations.isOverWeight ? 'bg-red-500' : calculations.weightUtilization > 90 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(calculations.weightUtilization, 100)}%` }}
              />
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.remainingWeight.toLocaleString()} lbs remaining
            </div>
          </div>
        </div>

        {/* Warnings */}
        {(calculations.isOverWeight || calculations.isOverVolume || calculations.hasOversizedItems) && (
          <div className={`p-4 rounded-lg bg-red-500/10 border border-red-500/20`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-500">
                <p className="font-medium mb-1">{t('tools.truckLoadCalculator.loadIssuesDetected', 'Load Issues Detected')}</p>
                <ul className="space-y-1">
                  {calculations.isOverWeight && <li>Weight exceeds truck capacity by {(calculations.totalWeight - calculations.truck.maxWeightLbs).toLocaleString()} lbs</li>}
                  {calculations.isOverVolume && <li>{t('tools.truckLoadCalculator.volumeExceedsTruckCapacity', 'Volume exceeds truck capacity')}</li>}
                  {calculations.hasOversizedItems && <li>{t('tools.truckLoadCalculator.someItemsExceedTruckDimensions', 'Some items exceed truck dimensions')}</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.truckLoadCalculator.loadingTips', 'Loading Tips')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('tools.truckLoadCalculator.placeHeavierItemsAtThe', 'Place heavier items at the bottom and towards the front')}</li>
              <li>{t('tools.truckLoadCalculator.stackSimilarSizedItemsFor', 'Stack similar-sized items for stability')}</li>
              <li>{t('tools.truckLoadCalculator.leaveSpaceForLoadSecurement', 'Leave space for load securement')}</li>
              <li>{t('tools.truckLoadCalculator.consider1015BufferFor', 'Consider 10-15% buffer for safety')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckLoadCalculatorTool;
