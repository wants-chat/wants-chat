import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Thermometer, Weight, AlertTriangle, Info, Gauge, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type VehicleType = 'sedan' | 'suv' | 'truck' | 'sports' | 'motorcycle' | 'rv';

interface VehicleConfig {
  name: string;
  frontPsi: number;
  rearPsi: number;
  maxPsi: number;
  description: string;
}

interface TireSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
}

interface TirePressureGuideToolProps {
  uiConfig?: UIConfig;
}

export const TirePressureGuideTool: React.FC<TirePressureGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [tireSize, setTireSize] = useState<TireSize>({ width: 225, aspectRatio: 45, rimDiameter: 17 });
  const [currentTemp, setCurrentTemp] = useState('70');
  const [targetTemp, setTargetTemp] = useState('70');
  const [loadLevel, setLoadLevel] = useState<'normal' | 'heavy' | 'max'>('normal');
  const [showWarnings, setShowWarnings] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.vehicleType && ['sedan', 'suv', 'truck', 'sports', 'motorcycle', 'rv'].includes(params.vehicleType)) {
        setVehicleType(params.vehicleType as VehicleType);
        setIsPrefilled(true);
      }
      if (params.temperature !== undefined) {
        setCurrentTemp(String(params.temperature));
        setIsPrefilled(true);
      }
      if (params.tireSize) {
        const match = params.tireSize.match(/(\d+)\/(\d+)R(\d+)/);
        if (match) {
          setTireSize({
            width: parseInt(match[1]),
            aspectRatio: parseInt(match[2]),
            rimDiameter: parseInt(match[3])
          });
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const vehicles: Record<VehicleType, VehicleConfig> = {
    sedan: {
      name: 'Sedan/Compact',
      frontPsi: 32,
      rearPsi: 32,
      maxPsi: 44,
      description: 'Standard passenger cars',
    },
    suv: {
      name: 'SUV/Crossover',
      frontPsi: 35,
      rearPsi: 35,
      maxPsi: 44,
      description: 'Sport utility vehicles',
    },
    truck: {
      name: 'Pickup Truck',
      frontPsi: 35,
      rearPsi: 38,
      maxPsi: 50,
      description: 'Light duty trucks',
    },
    sports: {
      name: 'Sports Car',
      frontPsi: 34,
      rearPsi: 36,
      maxPsi: 51,
      description: 'Performance vehicles',
    },
    motorcycle: {
      name: 'Motorcycle',
      frontPsi: 33,
      rearPsi: 36,
      maxPsi: 42,
      description: 'Two-wheel vehicles',
    },
    rv: {
      name: 'RV/Motorhome',
      frontPsi: 80,
      rearPsi: 80,
      maxPsi: 110,
      description: 'Recreational vehicles',
    },
  };

  const loadAdjustments: Record<'normal' | 'heavy' | 'max', { label: string; adjustment: number }> = {
    normal: { label: 'Normal Load', adjustment: 0 },
    heavy: { label: 'Heavy Load', adjustment: 3 },
    max: { label: 'Maximum Load', adjustment: 5 },
  };

  const commonTireSizes = [
    { width: 205, aspectRatio: 55, rimDiameter: 16, label: '205/55R16' },
    { width: 215, aspectRatio: 55, rimDiameter: 17, label: '215/55R17' },
    { width: 225, aspectRatio: 45, rimDiameter: 17, label: '225/45R17' },
    { width: 235, aspectRatio: 45, rimDiameter: 18, label: '235/45R18' },
    { width: 245, aspectRatio: 40, rimDiameter: 18, label: '245/40R18' },
    { width: 265, aspectRatio: 70, rimDiameter: 17, label: '265/70R17' },
  ];

  const config = vehicles[vehicleType];

  const calculations = useMemo(() => {
    const currentTempF = parseFloat(currentTemp) || 70;
    const targetTempF = parseFloat(targetTemp) || 70;
    const tempDiff = targetTempF - currentTempF;

    // Tire pressure changes approximately 1 PSI for every 10 degrees F
    const tempAdjustment = Math.round((tempDiff / 10) * 10) / 10;

    const loadAdj = loadAdjustments[loadLevel].adjustment;

    const recommendedFront = config.frontPsi + loadAdj;
    const recommendedRear = config.rearPsi + loadAdj;

    // Adjusted pressure considering temperature
    const adjustedFront = Math.round((recommendedFront - tempAdjustment) * 10) / 10;
    const adjustedRear = Math.round((recommendedRear - tempAdjustment) * 10) / 10;

    // Ensure we don't exceed max or go below minimum safe pressure
    const safeFront = Math.min(Math.max(adjustedFront, 26), config.maxPsi);
    const safeRear = Math.min(Math.max(adjustedRear, 26), config.maxPsi);

    return {
      recommendedFront,
      recommendedRear,
      adjustedFront: safeFront,
      adjustedRear: safeRear,
      tempAdjustment,
      loadAdjustment: loadAdj,
    };
  }, [currentTemp, targetTemp, loadLevel, config]);

  const warningSignsUnderInflated = [
    'Poor fuel economy',
    'Sluggish handling',
    'Excessive tire wear on edges',
    'Tire runs hot, risk of blowout',
    'Longer stopping distance',
  ];

  const warningSignsOverInflated = [
    'Harsh, bumpy ride',
    'Reduced traction',
    'Excessive wear in center of tire',
    'More susceptible to damage from potholes',
    'Increased risk of tire blowout',
  ];

  const formatTireSize = () => {
    return `${tireSize.width}/${tireSize.aspectRatio}R${tireSize.rimDiameter}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Gauge className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tirePressureGuide.tirePressureGuide', 'Tire Pressure Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tirePressureGuide.recommendedPsiWithTemperatureLoad', 'Recommended PSI with temperature & load adjustments')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tirePressureGuide.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Vehicle Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Car className="w-4 h-4 inline mr-1" />
            {t('tools.tirePressureGuide.vehicleType', 'Vehicle Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(vehicles) as VehicleType[]).map((v) => (
              <button
                key={v}
                onClick={() => setVehicleType(v)}
                className={`py-2 px-3 rounded-lg text-sm ${vehicleType === v ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {vehicles[v].name}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-blue-500 font-bold">{config.frontPsi}/{config.rearPsi} PSI</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.tirePressureGuide.front', 'Front:')}</span> {config.frontPsi} PSI
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.tirePressureGuide.rear', 'Rear:')}</span> {config.rearPsi} PSI
            </div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.tirePressureGuide.max', 'Max:')}</span> {config.maxPsi} PSI (on tire sidewall)
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Tire Size */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.tirePressureGuide.commonTireSizes', 'Common Tire Sizes')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {commonTireSizes.map((size) => (
              <button
                key={size.label}
                onClick={() => setTireSize({ width: size.width, aspectRatio: size.aspectRatio, rimDiameter: size.rimDiameter })}
                className={`py-2 px-2 rounded-lg text-xs ${formatTireSize() === size.label ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {size.label}
              </button>
            ))}
          </div>
          <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Selected: <span className="font-medium">{formatTireSize()}</span>
          </div>
        </div>

        {/* Temperature Adjustment */}
        <div className="space-y-4">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.tirePressureGuide.temperatureAdjustment', 'Temperature Adjustment')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {t('tools.tirePressureGuide.currentTempF', 'Current Temp (F)')}
              </label>
              <input
                type="number"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {t('tools.tirePressureGuide.drivingTempF', 'Driving Temp (F)')}
              </label>
              <input
                type="number"
                value={targetTemp}
                onChange={(e) => setTargetTemp(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          {calculations.tempAdjustment !== 0 && (
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Temperature change: {calculations.tempAdjustment > 0 ? '+' : ''}{calculations.tempAdjustment} PSI adjustment
            </div>
          )}
        </div>

        {/* Load Adjustment */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Weight className="w-4 h-4 inline mr-1" />
            {t('tools.tirePressureGuide.loadLevel', 'Load Level')}
          </label>
          <div className="flex gap-2">
            {(Object.keys(loadAdjustments) as Array<'normal' | 'heavy' | 'max'>).map((level) => (
              <button
                key={level}
                onClick={() => setLoadLevel(level)}
                className={`flex-1 py-2 rounded-lg ${loadLevel === level ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {loadAdjustments[level].label}
              </button>
            ))}
          </div>
          {loadLevel !== 'normal' && (
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Adding +{calculations.loadAdjustment} PSI for {loadAdjustments[loadLevel].label.toLowerCase()}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tirePressureGuide.frontTires', 'Front Tires')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.adjustedFront} PSI</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Base: {config.frontPsi} PSI
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tirePressureGuide.rearTires', 'Rear Tires')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.adjustedRear} PSI</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Base: {config.rearPsi} PSI
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Recommended for {config.name}</div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Front: {calculations.adjustedFront} PSI | Rear: {calculations.adjustedRear} PSI
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Tire size: {formatTireSize()} | Max: {config.maxPsi} PSI
          </div>
        </div>

        {/* Warning Signs Toggle */}
        <button
          onClick={() => setShowWarnings(!showWarnings)}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
        >
          <AlertTriangle className="w-4 h-4" />
          {showWarnings ? t('tools.tirePressureGuide.hide', 'Hide') : t('tools.tirePressureGuide.show', 'Show')} Warning Signs of Incorrect Pressure
        </button>

        {/* Warning Signs */}
        {showWarnings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                {t('tools.tirePressureGuide.underInflatedTires', 'Under-Inflated Tires')}
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {warningSignsUnderInflated.map((sign, index) => (
                  <li key={index}>- {sign}</li>
                ))}
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                {t('tools.tirePressureGuide.overInflatedTires', 'Over-Inflated Tires')}
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {warningSignsOverInflated.map((sign, index) => (
                  <li key={index}>- {sign}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.tirePressureGuide.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Check tire pressure when tires are cold (before driving)</li>
                <li>- Check pressure at least monthly and before long trips</li>
                <li>- Always refer to your vehicle door placard for exact specs</li>
                <li>- Tire pressure changes ~1 PSI for every 10F temperature change</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TirePressureGuideTool;
