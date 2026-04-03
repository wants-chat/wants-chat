import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, CircleDot, Timer, Gauge, Grid3X3, Calculator, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SprinklerCalculatorToolProps {
  uiConfig?: UIConfig;
}

type SprinklerType = 'rotary' | 'fixed' | 'popup' | 'impact' | 'drip' | 'micro';
type AreaUnit = 'sqft' | 'sqm' | 'acres';

interface SprinklerConfig {
  name: string;
  coverage: number; // sq ft per head
  flowRate: number; // gallons per minute
  minPressure: number; // PSI
  maxPressure: number; // PSI
  description: string;
}

export const SprinklerCalculatorTool: React.FC<SprinklerCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [sprinklerType, setSprinklerType] = useState<SprinklerType>('rotary');
  const [areaValue, setAreaValue] = useState('5000');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqft');
  const [waterPressure, setWaterPressure] = useState('45');
  const [maxHeadsPerZone, setMaxHeadsPerZone] = useState('8');
  const [runtimeMinutes, setRuntimeMinutes] = useState('30');
  const [customCoverage, setCustomCoverage] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.sprinklerType) setSprinklerType(prefillData.sprinklerType as SprinklerType);
      if (prefillData.areaValue) setAreaValue(String(prefillData.areaValue));
      if (prefillData.waterPressure) setWaterPressure(String(prefillData.waterPressure));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const sprinklerTypes: Record<SprinklerType, SprinklerConfig> = {
    rotary: {
      name: 'Rotary/Rotor',
      coverage: 900,
      flowRate: 3.0,
      minPressure: 40,
      maxPressure: 70,
      description: 'Best for large lawns, rotating stream, efficient coverage',
    },
    fixed: {
      name: 'Fixed Spray',
      coverage: 225,
      flowRate: 1.5,
      minPressure: 20,
      maxPressure: 45,
      description: 'Small areas, flower beds, constant spray pattern',
    },
    popup: {
      name: 'Pop-up Spray',
      coverage: 300,
      flowRate: 2.0,
      minPressure: 25,
      maxPressure: 50,
      description: 'Residential lawns, retracts when off, clean look',
    },
    impact: {
      name: 'Impact/Impulse',
      coverage: 1200,
      flowRate: 4.0,
      minPressure: 35,
      maxPressure: 60,
      description: 'Large areas, agriculture, visible pulsating head',
    },
    drip: {
      name: 'Drip Irrigation',
      coverage: 4,
      flowRate: 0.5,
      minPressure: 15,
      maxPressure: 30,
      description: 'Gardens, precise watering, water conservation',
    },
    micro: {
      name: 'Micro Spray',
      coverage: 50,
      flowRate: 0.8,
      minPressure: 20,
      maxPressure: 40,
      description: 'Shrubs, ground cover, low water usage',
    },
  };

  const config = sprinklerTypes[sprinklerType];
  const coverage = customCoverage ? parseFloat(customCoverage) : config.coverage;

  const calculations = useMemo(() => {
    const area = parseFloat(areaValue) || 0;
    const pressure = parseFloat(waterPressure) || 0;
    const maxHeads = parseInt(maxHeadsPerZone) || 8;
    const runtime = parseFloat(runtimeMinutes) || 30;

    // Convert area to square feet
    let areaSqFt = area;
    if (areaUnit === 'sqm') {
      areaSqFt = area * 10.764;
    } else if (areaUnit === 'acres') {
      areaSqFt = area * 43560;
    }

    // Calculate heads needed (with 15% overlap factor)
    const effectiveCoverage = coverage * 0.85;
    const headsNeeded = Math.ceil(areaSqFt / effectiveCoverage);

    // Calculate zones needed
    const zonesNeeded = Math.ceil(headsNeeded / maxHeads);

    // Calculate heads per zone
    const headsPerZone = Math.ceil(headsNeeded / zonesNeeded);

    // Water flow calculations
    const totalFlowRate = headsPerZone * config.flowRate;
    const waterPerMinute = totalFlowRate;
    const waterPerRun = waterPerMinute * runtime;
    const waterPerRunLiters = waterPerRun * 3.785;

    // Calculate if pressure is adequate
    const pressureStatus = pressure >= config.minPressure && pressure <= config.maxPressure
      ? 'optimal'
      : pressure < config.minPressure
        ? 'low'
        : 'high';

    // Recommended run time based on soil type (average)
    const recommendedRuntime = sprinklerType === 'drip' ? 60 : 20;

    // Weekly water usage (assuming 3 times per week)
    const weeklyWaterGallons = waterPerRun * zonesNeeded * 3;
    const monthlyWaterGallons = weeklyWaterGallons * 4;

    // Pipe size recommendation based on flow rate
    let recommendedPipeSize = '3/4"';
    if (totalFlowRate > 12) {
      recommendedPipeSize = '1"';
    } else if (totalFlowRate > 20) {
      recommendedPipeSize = '1-1/4"';
    }

    return {
      headsNeeded,
      zonesNeeded,
      headsPerZone,
      areaSqFt: areaSqFt.toFixed(0),
      totalFlowRate: totalFlowRate.toFixed(1),
      waterPerRun: waterPerRun.toFixed(0),
      waterPerRunLiters: waterPerRunLiters.toFixed(0),
      pressureStatus,
      recommendedRuntime,
      weeklyWaterGallons: weeklyWaterGallons.toFixed(0),
      monthlyWaterGallons: monthlyWaterGallons.toFixed(0),
      recommendedPipeSize,
      effectiveCoverage: effectiveCoverage.toFixed(0),
    };
  }, [areaValue, areaUnit, waterPressure, maxHeadsPerZone, runtimeMinutes, coverage, config, sprinklerType]);

  const getPressureColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'low':
        return 'text-red-500';
      case 'high':
        return 'text-yellow-500';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getPressureMessage = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'Pressure is within optimal range';
      case 'low':
        return `Low pressure - minimum ${config.minPressure} PSI required`;
      case 'high':
        return `High pressure - consider a pressure regulator`;
      default:
        return '';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Droplets className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sprinklerCalculator.sprinklerSystemCalculator', 'Sprinkler System Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sprinklerCalculator.planYourIrrigationSystemWith', 'Plan your irrigation system with precision')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sprinkler Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(sprinklerTypes) as SprinklerType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSprinklerType(type)}
              className={`py-2 px-3 rounded-lg text-sm ${sprinklerType === type ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {sprinklerTypes[type].name}
            </button>
          ))}
        </div>

        {/* Sprinkler Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-cyan-500 font-bold">{coverage} sq ft/head</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.sprinklerCalculator.flowRate', 'Flow Rate:')}</span> {config.flowRate} GPM
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.sprinklerCalculator.pressure', 'Pressure:')}</span> {config.minPressure}-{config.maxPressure} PSI
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Custom Coverage */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sprinklerCalculator.customCoverageSqFtPer', 'Custom Coverage (sq ft per head, optional)')}
          </label>
          <input
            type="number"
            value={customCoverage}
            onChange={(e) => setCustomCoverage(e.target.value)}
            placeholder={config.coverage.toString()}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Lawn Area Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Grid3X3 className="w-4 h-4 inline mr-1" />
            {t('tools.sprinklerCalculator.lawnArea', 'Lawn Area')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              placeholder={t('tools.sprinklerCalculator.enterArea', 'Enter area')}
            />
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="sqft">{t('tools.sprinklerCalculator.sqFt', 'sq ft')}</option>
              <option value="sqm">{t('tools.sprinklerCalculator.sqM', 'sq m')}</option>
              <option value="acres">acres</option>
            </select>
          </div>
        </div>

        {/* Water Pressure */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Gauge className="w-4 h-4 inline mr-1" />
            {t('tools.sprinklerCalculator.waterPressurePsi', 'Water Pressure (PSI)')}
          </label>
          <input
            type="number"
            value={waterPressure}
            onChange={(e) => setWaterPressure(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder={t('tools.sprinklerCalculator.enterWaterPressure', 'Enter water pressure')}
          />
          <p className={`text-sm ${getPressureColor(calculations.pressureStatus)}`}>
            {getPressureMessage(calculations.pressureStatus)}
          </p>
        </div>

        {/* Max Heads Per Zone */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <CircleDot className="w-4 h-4 inline mr-1" />
            {t('tools.sprinklerCalculator.maxHeadsPerZone', 'Max Heads Per Zone')}
          </label>
          <div className="flex gap-2">
            {[4, 6, 8, 10, 12].map((n) => (
              <button
                key={n}
                onClick={() => setMaxHeadsPerZone(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(maxHeadsPerZone) === n ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Runtime */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Timer className="w-4 h-4 inline mr-1" />
            {t('tools.sprinklerCalculator.runTimePerZoneMinutes', 'Run Time Per Zone (minutes)')}
          </label>
          <div className="flex gap-2">
            {[15, 20, 30, 45, 60].map((n) => (
              <button
                key={n}
                onClick={() => setRuntimeMinutes(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(runtimeMinutes) === n ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={runtimeMinutes}
            onChange={(e) => setRuntimeMinutes(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <CircleDot className="w-4 h-4 text-cyan-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sprinklerCalculator.headsNeeded', 'Heads Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-cyan-500">{calculations.headsNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.sprinklerCalculator.sprinklerHeadsTotal', 'sprinkler heads total')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sprinklerCalculator.zonesNeeded', 'Zones Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.zonesNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.headsPerZone} heads per zone
            </div>
          </div>
        </div>

        {/* Water Usage */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sprinklerCalculator.waterUsageEstimate', 'Water Usage Estimate')}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-500">{calculations.waterPerRun}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sprinklerCalculator.galZoneRun', 'gal/zone/run')}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-500">{calculations.weeklyWaterGallons}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sprinklerCalculator.galWeek', 'gal/week')}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-500">{calculations.monthlyWaterGallons}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sprinklerCalculator.galMonth', 'gal/month')}</div>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-green-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sprinklerCalculator.technicalRequirements', 'Technical Requirements')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.sprinklerCalculator.flowRateZone', 'Flow Rate/Zone:')}</span> {calculations.totalFlowRate} GPM
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.sprinklerCalculator.pipeSize', 'Pipe Size:')}</span> {calculations.recommendedPipeSize}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.sprinklerCalculator.coverageArea', 'Coverage Area:')}</span> {calculations.areaSqFt} sq ft
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.sprinklerCalculator.effectiveCoverage', 'Effective Coverage:')}</span> {calculations.effectiveCoverage} sq ft/head
            </div>
          </div>
        </div>

        {/* Zone Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sprinklerCalculator.totalWateringTimeForAll', 'Total watering time for all zones')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.zonesNeeded * parseInt(runtimeMinutes)} minutes
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            ({calculations.zonesNeeded} zones x {runtimeMinutes} min each)
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.sprinklerCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Water early morning (4-10 AM) to reduce evaporation</li>
                <li>- Head-to-head coverage ensures even watering</li>
                <li>- Check for 40-60 PSI at the sprinkler head</li>
                <li>- Use rain sensors to prevent overwatering</li>
                <li>- Adjust runtime seasonally for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprinklerCalculatorTool;
