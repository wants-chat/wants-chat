import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Layers, Scale, Maximize, Sparkles, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PalletCalculatorToolProps {
  uiConfig?: UIConfig;
}

type PalletType = 'standard' | 'euro' | 'half' | 'quarter' | 'custom';

interface PalletSpec {
  name: string;
  lengthIn: number;
  widthIn: number;
  maxHeightIn: number;
  maxWeightLbs: number;
}

export const PalletCalculatorTool: React.FC<PalletCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [palletType, setPalletType] = useState<PalletType>('standard');
  const [customPalletLength, setCustomPalletLength] = useState('48');
  const [customPalletWidth, setCustomPalletWidth] = useState('40');
  const [maxPalletHeight, setMaxPalletHeight] = useState('72');
  const [maxPalletWeight, setMaxPalletWeight] = useState('2500');

  const [cartonLength, setCartonLength] = useState('12');
  const [cartonWidth, setCartonWidth] = useState('10');
  const [cartonHeight, setCartonHeight] = useState('8');
  const [cartonWeight, setCartonWeight] = useState('15');

  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [overhang, setOverhang] = useState(false);
  const [maxOverhang, setMaxOverhang] = useState('2');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.cartonLength !== undefined || params.length !== undefined) {
        setCartonLength(String(params.cartonLength || params.length));
        setIsPrefilled(true);
      }
      if (params.cartonWidth !== undefined || params.width !== undefined) {
        setCartonWidth(String(params.cartonWidth || params.width));
        setIsPrefilled(true);
      }
      if (params.cartonHeight !== undefined || params.height !== undefined) {
        setCartonHeight(String(params.cartonHeight || params.height));
        setIsPrefilled(true);
      }
      if (params.weight !== undefined) {
        setCartonWeight(String(params.weight));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const palletSpecs: Record<PalletType, PalletSpec> = {
    standard: { name: 'GMA Standard (48x40)', lengthIn: 48, widthIn: 40, maxHeightIn: 72, maxWeightLbs: 2500 },
    euro: { name: 'Euro Pallet (47x32)', lengthIn: 47.24, widthIn: 31.5, maxHeightIn: 72, maxWeightLbs: 2200 },
    half: { name: 'Half Pallet (48x20)', lengthIn: 48, widthIn: 20, maxHeightIn: 72, maxWeightLbs: 1250 },
    quarter: { name: 'Quarter Pallet (24x20)', lengthIn: 24, widthIn: 20, maxHeightIn: 72, maxWeightLbs: 625 },
    custom: { name: 'Custom Size', lengthIn: 48, widthIn: 40, maxHeightIn: 72, maxWeightLbs: 2500 },
  };

  const calculations = useMemo(() => {
    let pallet = { ...palletSpecs[palletType] };

    if (palletType === 'custom') {
      pallet.lengthIn = parseFloat(customPalletLength) || 48;
      pallet.widthIn = parseFloat(customPalletWidth) || 40;
      pallet.maxHeightIn = parseFloat(maxPalletHeight) || 72;
      pallet.maxWeightLbs = parseFloat(maxPalletWeight) || 2500;
    }

    let cLength = parseFloat(cartonLength) || 0;
    let cWidth = parseFloat(cartonWidth) || 0;
    let cHeight = parseFloat(cartonHeight) || 0;
    let cWeight = parseFloat(cartonWeight) || 0;

    // Convert to imperial if metric
    if (unit === 'metric') {
      cLength = cLength * 0.393701;
      cWidth = cWidth * 0.393701;
      cHeight = cHeight * 0.393701;
      cWeight = cWeight * 2.20462;
    }

    // Effective pallet dimensions with overhang
    const overhangAmount = overhang ? (parseFloat(maxOverhang) || 0) : 0;
    const effectiveLength = pallet.lengthIn + (overhangAmount * 2);
    const effectiveWidth = pallet.widthIn + (overhangAmount * 2);

    // Calculate different orientations
    const orientations = [
      {
        name: 'Standard (L x W)',
        fitLength: Math.floor(effectiveLength / cLength),
        fitWidth: Math.floor(effectiveWidth / cWidth),
        boxL: cLength,
        boxW: cWidth,
      },
      {
        name: 'Rotated (W x L)',
        fitLength: Math.floor(effectiveLength / cWidth),
        fitWidth: Math.floor(effectiveWidth / cLength),
        boxL: cWidth,
        boxW: cLength,
      },
    ];

    // Find best orientation for each layer
    const bestOrientation = orientations.reduce((best, current) => {
      const currentPerLayer = current.fitLength * current.fitWidth;
      const bestPerLayer = best.fitLength * best.fitWidth;
      return currentPerLayer > bestPerLayer ? current : best;
    });

    const cartonsPerLayer = bestOrientation.fitLength * bestOrientation.fitWidth;

    // Calculate stacking height
    const maxLayers = Math.floor(pallet.maxHeightIn / cHeight);

    // Calculate weight limit
    const cartonsByWeight = cWeight > 0 ? Math.floor(pallet.maxWeightLbs / cWeight) : 0;
    const layersByWeight = cartonsPerLayer > 0 ? Math.floor(cartonsByWeight / cartonsPerLayer) : 0;

    // Actual layers limited by height or weight
    const actualLayers = Math.min(maxLayers, layersByWeight || maxLayers);
    const totalCartons = cartonsPerLayer * actualLayers;
    const limitingFactor = layersByWeight < maxLayers ? 'weight' : 'height';

    // Calculate utilization
    const cartonVolume = cLength * cWidth * cHeight;
    const totalCartonVolume = cartonVolume * totalCartons;
    const palletVolume = pallet.lengthIn * pallet.widthIn * pallet.maxHeightIn;
    const volumeUtilization = (totalCartonVolume / palletVolume) * 100;

    const cartonFloorArea = cLength * cWidth;
    const palletFloorArea = pallet.lengthIn * pallet.widthIn;
    const floorUtilization = ((cartonsPerLayer * cartonFloorArea) / palletFloorArea) * 100;

    const totalWeight = totalCartons * cWeight;
    const weightUtilization = (totalWeight / pallet.maxWeightLbs) * 100;

    const usedHeight = actualLayers * cHeight;
    const heightUtilization = (usedHeight / pallet.maxHeightIn) * 100;

    return {
      pallet,
      bestOrientation,
      cartonsPerLayer,
      maxLayers,
      actualLayers,
      totalCartons,
      limitingFactor,
      totalWeight,
      usedHeight,
      volumeUtilization,
      floorUtilization,
      weightUtilization,
      heightUtilization,
      wastedFloorSpace: palletFloorArea - (cartonsPerLayer * cartonFloorArea),
      cartonsByWeight,
    };
  }, [palletType, customPalletLength, customPalletWidth, maxPalletHeight, maxPalletWeight, cartonLength, cartonWidth, cartonHeight, cartonWeight, unit, overhang, maxOverhang]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Layers className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.palletCalculator.palletCalculator', 'Pallet Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.palletCalculator.calculatePalletCapacityAndStacking', 'Calculate pallet capacity and stacking patterns')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.palletCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.palletCalculator.imperialInLbs', 'Imperial (in/lbs)')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.palletCalculator.metricCmKg', 'Metric (cm/kg)')}
          </button>
        </div>

        {/* Pallet Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.palletCalculator.palletType', 'Pallet Type')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(palletSpecs).map(([key, spec]) => (
              <button
                key={key}
                onClick={() => setPalletType(key as PalletType)}
                className={`py-2 px-2 rounded-lg text-xs transition-colors ${palletType === key ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {key === 'custom' ? 'Custom' : spec.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Pallet Dimensions */}
        {palletType === 'custom' && (
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Length ({unit === 'imperial' ? 'in' : 'cm'})</label>
              <input
                type="number"
                value={customPalletLength}
                onChange={(e) => setCustomPalletLength(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Width ({unit === 'imperial' ? 'in' : 'cm'})</label>
              <input
                type="number"
                value={customPalletWidth}
                onChange={(e) => setCustomPalletWidth(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Max Height ({unit === 'imperial' ? 'in' : 'cm'})</label>
              <input
                type="number"
                value={maxPalletHeight}
                onChange={(e) => setMaxPalletHeight(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Max Weight ({unit === 'imperial' ? 'lbs' : 'kg'})</label>
              <input
                type="number"
                value={maxPalletWeight}
                onChange={(e) => setMaxPalletWeight(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>
        )}

        {/* Carton Dimensions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            Carton Dimensions ({unit === 'imperial' ? 'inches' : 'cm'})
          </label>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <input
                type="number"
                value={cartonLength}
                onChange={(e) => setCartonLength(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.palletCalculator.length', 'Length')}</span>
            </div>
            <div>
              <input
                type="number"
                value={cartonWidth}
                onChange={(e) => setCartonWidth(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.palletCalculator.width', 'Width')}</span>
            </div>
            <div>
              <input
                type="number"
                value={cartonHeight}
                onChange={(e) => setCartonHeight(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.palletCalculator.height', 'Height')}</span>
            </div>
            <div>
              <input
                type="number"
                value={cartonWeight}
                onChange={(e) => setCartonWeight(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Weight ({unit === 'imperial' ? 'lbs' : 'kg'})</span>
            </div>
          </div>
        </div>

        {/* Overhang Option */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={overhang}
              onChange={(e) => setOverhang(e.target.checked)}
              className="w-4 h-4 rounded text-teal-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.palletCalculator.allowOverhang', 'Allow Overhang')}</span>
          </label>
          {overhang && (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.palletCalculator.max', 'Max:')}</span>
              <input
                type="number"
                value={maxOverhang}
                onChange={(e) => setMaxOverhang(e.target.value)}
                className={`w-16 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{unit === 'imperial' ? 'inches' : 'cm'}</span>
            </div>
          )}
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.palletCalculator.totalCartonsPerPallet', 'Total Cartons Per Pallet')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.totalCartons}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.cartonsPerLayer} per layer x {calculations.actualLayers} layers
          </div>
          <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${calculations.limitingFactor === 'weight' ? 'text-amber-500' : 'text-teal-500'}`}>
            <AlertTriangle className="w-3 h-3" />
            Limited by {calculations.limitingFactor}
          </div>
        </div>

        {/* Stacking Pattern */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Maximize className="w-4 h-4 inline mr-1" />
            {t('tools.palletCalculator.optimalStackingPattern', 'Optimal Stacking Pattern')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.bestOrientation.fitLength} x {calculations.bestOrientation.fitWidth}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {calculations.bestOrientation.name}
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.usedHeight.toFixed(1)}"
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.palletCalculator.stackHeight', 'Stack Height')}
              </div>
            </div>
          </div>
        </div>

        {/* Utilization Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.palletCalculator.floorUtilization', 'Floor Utilization')}</span>
              <span className={`text-sm font-medium ${calculations.floorUtilization > 85 ? 'text-green-500' : 'text-amber-500'}`}>
                {calculations.floorUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${calculations.floorUtilization > 85 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(calculations.floorUtilization, 100)}%` }}
              />
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.palletCalculator.weightUtilization', 'Weight Utilization')}</span>
              <span className={`text-sm font-medium ${calculations.weightUtilization > 90 ? 'text-amber-500' : 'text-green-500'}`}>
                {calculations.weightUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${calculations.weightUtilization > 90 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(calculations.weightUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weight Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Scale className="w-5 h-5 mx-auto mb-2 text-teal-500" />
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalWeight.toFixed(0)} lbs
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.palletCalculator.totalPalletWeight', 'Total Pallet Weight')}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Maximize className="w-5 h-5 mx-auto mb-2 text-teal-500" />
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.wastedFloorSpace.toFixed(0)} in²
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.palletCalculator.unusedFloorSpace', 'Unused Floor Space')}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.palletCalculator.palletLoadingTips', 'Pallet Loading Tips')}</p>
            <ul className="space-y-1">
              {calculations.floorUtilization < 80 && (
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-amber-500" />
                  {t('tools.palletCalculator.tryRotatingCartonsOrAllowing', 'Try rotating cartons or allowing slight overhang')}
                </li>
              )}
              {calculations.limitingFactor === 'weight' && (
                <li className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  {t('tools.palletCalculator.weightLimitedCouldAddMore', 'Weight-limited: could add more layers if lighter')}
                </li>
              )}
              <li>{t('tools.palletCalculator.standardGmaPalletsFitMost', 'Standard GMA pallets fit most trucks and warehouses')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalletCalculatorTool;
