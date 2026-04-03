import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Package, Scale, Maximize, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ContainerLoadCalculatorToolProps {
  uiConfig?: UIConfig;
}

type ContainerType = '20ft' | '40ft' | '40hc' | '45hc';

interface ContainerSpec {
  name: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  cbm: number;
  maxKg: number;
  maxLbs: number;
}

export const ContainerLoadCalculatorTool: React.FC<ContainerLoadCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [containerType, setContainerType] = useState<ContainerType>('40ft');
  const [cartonLength, setCartonLength] = useState('60');
  const [cartonWidth, setCartonWidth] = useState('40');
  const [cartonHeight, setCartonHeight] = useState('40');
  const [cartonWeight, setCartonWeight] = useState('25');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [stackable, setStackable] = useState(true);
  const [maxStackHeight, setMaxStackHeight] = useState('3');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.length !== undefined) {
        setCartonLength(String(params.length));
        setIsPrefilled(true);
      }
      if (params.width !== undefined) {
        setCartonWidth(String(params.width));
        setIsPrefilled(true);
      }
      if (params.height !== undefined) {
        setCartonHeight(String(params.height));
        setIsPrefilled(true);
      }
      if (params.weight !== undefined) {
        setCartonWeight(String(params.weight));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const containers: Record<ContainerType, ContainerSpec> = {
    '20ft': { name: '20ft Standard', lengthM: 5.9, widthM: 2.35, heightM: 2.39, cbm: 33.2, maxKg: 21770, maxLbs: 47990 },
    '40ft': { name: '40ft Standard', lengthM: 12.03, widthM: 2.35, heightM: 2.39, cbm: 67.7, maxKg: 26780, maxLbs: 59040 },
    '40hc': { name: '40ft High Cube', lengthM: 12.03, widthM: 2.35, heightM: 2.69, cbm: 76.3, maxKg: 26460, maxLbs: 58330 },
    '45hc': { name: '45ft High Cube', lengthM: 13.56, widthM: 2.35, heightM: 2.69, cbm: 85.9, maxKg: 27600, maxLbs: 60850 },
  };

  const calculations = useMemo(() => {
    const container = containers[containerType];

    // Convert inputs to meters
    let l = parseFloat(cartonLength) || 0;
    let w = parseFloat(cartonWidth) || 0;
    let h = parseFloat(cartonHeight) || 0;
    let wt = parseFloat(cartonWeight) || 0;

    if (unit === 'metric') {
      l = l / 100; // cm to m
      w = w / 100;
      h = h / 100;
      // weight already in kg
    } else {
      l = l * 0.0254; // inch to m
      w = w * 0.0254;
      h = h * 0.0254;
      wt = wt * 0.453592; // lbs to kg
    }

    const cartonCBM = l * w * h;
    const maxWeight = container.maxKg;

    // Calculate how many cartons fit in each direction
    const fitLength = Math.floor(container.lengthM / l) || 0;
    const fitWidth = Math.floor(container.widthM / w) || 0;

    let fitHeight: number;
    if (stackable) {
      const maxStack = parseInt(maxStackHeight) || 1;
      const possibleStack = Math.floor(container.heightM / h) || 0;
      fitHeight = Math.min(possibleStack, maxStack);
    } else {
      fitHeight = 1;
    }

    // Total cartons by volume
    const cartonsByVolume = fitLength * fitWidth * fitHeight;

    // Total cartons by weight
    const cartonsByWeight = wt > 0 ? Math.floor(maxWeight / wt) : 0;

    // Actual max cartons (limited by either volume or weight)
    const maxCartons = Math.min(cartonsByVolume, cartonsByWeight);
    const limitingFactor = cartonsByWeight < cartonsByVolume ? 'weight' : 'volume';

    // Calculate utilization
    const volumeUsed = maxCartons * cartonCBM;
    const volumeUtilization = (volumeUsed / container.cbm) * 100;

    const weightUsed = maxCartons * wt;
    const weightUtilization = (weightUsed / maxWeight) * 100;

    // Floor space utilization
    const floorArea = container.lengthM * container.widthM;
    const cartonFloorArea = l * w;
    const floorCartons = fitLength * fitWidth;
    const floorUtilization = (floorCartons * cartonFloorArea / floorArea) * 100;

    return {
      container,
      cartonCBM,
      fitLength,
      fitWidth,
      fitHeight,
      cartonsByVolume,
      cartonsByWeight,
      maxCartons,
      limitingFactor,
      volumeUsed,
      volumeUtilization,
      weightUsed,
      weightUtilization,
      floorUtilization,
      wastedSpace: container.cbm - volumeUsed,
      totalWeight: weightUsed,
    };
  }, [containerType, cartonLength, cartonWidth, cartonHeight, cartonWeight, unit, stackable, maxStackHeight]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Container className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.containerLoadCalculator.containerLoadCalculator', 'Container Load Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.containerLoadCalculator.optimizeContainerLoadingEfficiency', 'Optimize container loading efficiency')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.containerLoadCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.containerLoadCalculator.metricCmKg', 'Metric (cm/kg)')}
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.containerLoadCalculator.imperialInLbs', 'Imperial (in/lbs)')}
          </button>
        </div>

        {/* Container Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.containerLoadCalculator.containerType', 'Container Type')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(containers).map(([key, spec]) => (
              <button
                key={key}
                onClick={() => setContainerType(key as ContainerType)}
                className={`py-3 px-2 rounded-lg text-sm transition-colors ${containerType === key ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium">{key}</div>
                <div className={`text-xs ${containerType === key ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {spec.cbm} CBM
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carton Dimensions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            Carton Dimensions ({unit === 'metric' ? 'cm' : 'inches'})
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                value={cartonLength}
                onChange={(e) => setCartonLength(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.containerLoadCalculator.length', 'Length')}</span>
            </div>
            <div>
              <input
                type="number"
                value={cartonWidth}
                onChange={(e) => setCartonWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.containerLoadCalculator.width', 'Width')}</span>
            </div>
            <div>
              <input
                type="number"
                value={cartonHeight}
                onChange={(e) => setCartonHeight(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.containerLoadCalculator.height', 'Height')}</span>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-1" />
            Carton Weight ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input
            type="number"
            value={cartonWeight}
            onChange={(e) => setCartonWeight(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* Stacking Options */}
        <div className="flex items-center gap-4">
          <label className={`flex items-center gap-2 cursor-pointer`}>
            <input
              type="checkbox"
              checked={stackable}
              onChange={(e) => setStackable(e.target.checked)}
              className="w-4 h-4 rounded text-teal-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.containerLoadCalculator.stackable', 'Stackable')}</span>
          </label>
          {stackable && (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.maxStack', 'Max Stack:')}</span>
              <input
                type="number"
                min="1"
                max="10"
                value={maxStackHeight}
                onChange={(e) => setMaxStackHeight(e.target.value)}
                className={`w-16 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.maximumCartons', 'Maximum Cartons')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.maxCartons.toLocaleString()}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            in {calculations.container.name}
          </div>
          <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${calculations.limitingFactor === 'weight' ? 'text-amber-500' : 'text-teal-500'}`}>
            <AlertTriangle className="w-3 h-3" />
            Limited by {calculations.limitingFactor}
          </div>
        </div>

        {/* Loading Pattern */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Maximize className="w-4 h-4 inline mr-1" />
            {t('tools.containerLoadCalculator.loadingPattern', 'Loading Pattern')}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.fitLength}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.alongLength', 'Along Length')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.fitWidth}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.alongWidth', 'Along Width')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.fitHeight}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.stackedHigh', 'Stacked High')}</div>
            </div>
          </div>
        </div>

        {/* Utilization Metrics */}
        <div className="space-y-3">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.volumeUtilization', 'Volume Utilization')}</span>
              <span className={`text-sm font-medium ${calculations.volumeUtilization > 85 ? 'text-green-500' : calculations.volumeUtilization > 70 ? 'text-amber-500' : 'text-red-500'}`}>
                {calculations.volumeUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${calculations.volumeUtilization > 85 ? 'bg-green-500' : calculations.volumeUtilization > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(calculations.volumeUtilization, 100)}%` }}
              />
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.volumeUsed.toFixed(2)} / {calculations.container.cbm} CBM
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.weightUtilization', 'Weight Utilization')}</span>
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
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.totalWeight.toFixed(0)} / {calculations.container.maxKg} kg
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.containerLoadCalculator.floorUtilization', 'Floor Utilization')}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.floorUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{ width: `${Math.min(calculations.floorUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Efficiency Tips */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.containerLoadCalculator.optimizationTips', 'Optimization Tips')}</p>
            <ul className="space-y-1">
              {calculations.volumeUtilization < 85 && (
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-amber-500" />
                  {t('tools.containerLoadCalculator.considerRotatingCartonsOrUsing', 'Consider rotating cartons or using different dimensions')}
                </li>
              )}
              {calculations.weightUtilization > 90 && (
                <li className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  {t('tools.containerLoadCalculator.closeToWeightLimitVerify', 'Close to weight limit - verify total weight before shipping')}
                </li>
              )}
              <li>Wasted space: {calculations.wastedSpace.toFixed(2)} CBM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerLoadCalculatorTool;
