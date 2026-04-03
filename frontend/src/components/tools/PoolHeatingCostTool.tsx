import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Thermometer, DollarSign, Clock, Sun, Info, TrendingDown, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface PoolHeatingCostToolProps {
  uiConfig?: UIConfig;
}

type HeaterType = 'gas' | 'electric' | 'heat-pump' | 'solar';
type PoolShape = 'rectangular' | 'oval' | 'kidney' | 'freeform';

interface HeaterConfig {
  name: string;
  efficiency: number;
  btuPerHour: number;
  energyUnit: string;
  costPerUnit: number;
  maintenanceCost: number;
  installCost: number;
}

const heaterTypes: Record<HeaterType, HeaterConfig> = {
  gas: {
    name: 'Gas Heater',
    efficiency: 80,
    btuPerHour: 400000,
    energyUnit: 'therms',
    costPerUnit: 1.20,
    maintenanceCost: 150,
    installCost: 3500,
  },
  electric: {
    name: 'Electric Resistance',
    efficiency: 100,
    btuPerHour: 54000,
    energyUnit: 'kWh',
    costPerUnit: 0.12,
    maintenanceCost: 50,
    installCost: 2500,
  },
  'heat-pump': {
    name: 'Heat Pump',
    efficiency: 500, // COP of 5.0
    btuPerHour: 100000,
    energyUnit: 'kWh',
    costPerUnit: 0.12,
    maintenanceCost: 100,
    installCost: 5500,
  },
  solar: {
    name: 'Solar Panels',
    efficiency: 80,
    btuPerHour: 50000,
    energyUnit: 'free',
    costPerUnit: 0,
    maintenanceCost: 50,
    installCost: 4500,
  },
};

export const PoolHeatingCostTool: React.FC<PoolHeatingCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [heaterType, setHeaterType] = useState<HeaterType>('gas');
  const [poolShape, setPoolShape] = useState<PoolShape>('rectangular');
  const [poolLength, setPoolLength] = useState('30');
  const [poolWidth, setPoolWidth] = useState('15');
  const [poolDepthShallow, setPoolDepthShallow] = useState('3');
  const [poolDepthDeep, setPoolDepthDeep] = useState('8');
  const [currentTemp, setCurrentTemp] = useState('65');
  const [desiredTemp, setDesiredTemp] = useState('82');
  const [ambientTemp, setAmbientTemp] = useState('70');
  const [windExposure, setWindExposure] = useState<'low' | 'medium' | 'high'>('medium');
  const [hasPoolCover, setHasPoolCover] = useState(false);
  const [monthsOfUse, setMonthsOfUse] = useState('6');
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [gasRate, setGasRate] = useState('1.20');

  const heater = heaterTypes[heaterType];

  const calculations = useMemo(() => {
    const length = parseFloat(poolLength) || 0;
    const width = parseFloat(poolWidth) || 0;
    const depthShallow = parseFloat(poolDepthShallow) || 0;
    const depthDeep = parseFloat(poolDepthDeep) || 0;
    const current = parseFloat(currentTemp) || 65;
    const desired = parseFloat(desiredTemp) || 82;
    const ambient = parseFloat(ambientTemp) || 70;
    const months = parseFloat(monthsOfUse) || 6;
    const eRate = parseFloat(electricityRate) || 0.12;
    const gRate = parseFloat(gasRate) || 1.20;

    // Calculate pool surface area based on shape
    let surfaceArea = 0;
    switch (poolShape) {
      case 'rectangular':
        surfaceArea = length * width;
        break;
      case 'oval':
        surfaceArea = Math.PI * (length / 2) * (width / 2);
        break;
      case 'kidney':
        surfaceArea = length * width * 0.85;
        break;
      case 'freeform':
        surfaceArea = length * width * 0.80;
        break;
    }

    // Calculate pool volume (gallons)
    const avgDepth = (depthShallow + depthDeep) / 2;
    const volumeCubicFeet = surfaceArea * avgDepth;
    const volumeGallons = volumeCubicFeet * 7.48;

    // Calculate BTU needed to heat pool initially
    // 1 BTU raises 1 lb of water 1F
    // 1 gallon of water = 8.34 lbs
    const tempRise = desired - current;
    const btuToHeat = volumeGallons * 8.34 * tempRise;

    // Calculate time to heat pool initially (hours)
    const hoursToHeat = btuToHeat / heater.btuPerHour;

    // Calculate heat loss per hour
    // Factors: surface area, temp differential, wind, cover
    const tempDiff = desired - ambient;
    let heatLossMultiplier = 1.0;

    switch (windExposure) {
      case 'low': heatLossMultiplier = 0.8; break;
      case 'medium': heatLossMultiplier = 1.0; break;
      case 'high': heatLossMultiplier = 1.4; break;
    }

    if (hasPoolCover) {
      heatLossMultiplier *= 0.25; // Cover reduces heat loss by ~75%
    }

    // BTU loss per hour (simplified calculation)
    // ~10 BTU per sq ft per degree F per hour (uncovered pool)
    const btuLossPerHour = surfaceArea * tempDiff * 10 * heatLossMultiplier;

    // Daily maintenance heating (assuming heater runs to maintain temp)
    const hoursPerDay = btuLossPerHour > 0 ? Math.min(24, (btuLossPerHour * 24) / heater.btuPerHour) : 0;
    const dailyBtuNeeded = btuLossPerHour * 24;

    // Energy calculations based on heater type
    let dailyEnergyCost = 0;
    let monthlyEnergyCost = 0;
    let initialHeatCost = 0;

    if (heaterType === 'gas') {
      // Convert BTU to therms (1 therm = 100,000 BTU)
      const dailyTherms = dailyBtuNeeded / 100000 / (heater.efficiency / 100);
      const initialTherms = btuToHeat / 100000 / (heater.efficiency / 100);
      dailyEnergyCost = dailyTherms * gRate;
      initialHeatCost = initialTherms * gRate;
    } else if (heaterType === 'electric') {
      // Convert BTU to kWh (1 kWh = 3412 BTU)
      const dailyKwh = dailyBtuNeeded / 3412 / (heater.efficiency / 100);
      const initialKwh = btuToHeat / 3412 / (heater.efficiency / 100);
      dailyEnergyCost = dailyKwh * eRate;
      initialHeatCost = initialKwh * eRate;
    } else if (heaterType === 'heat-pump') {
      // Heat pump COP of 5 means 5x more efficient than electric resistance
      const dailyKwh = dailyBtuNeeded / 3412 / (heater.efficiency / 100);
      const initialKwh = btuToHeat / 3412 / (heater.efficiency / 100);
      dailyEnergyCost = dailyKwh * eRate;
      initialHeatCost = initialKwh * eRate;
    } else {
      // Solar - free energy
      dailyEnergyCost = 0;
      initialHeatCost = 0;
    }

    monthlyEnergyCost = dailyEnergyCost * 30;
    const seasonalCost = monthlyEnergyCost * months + initialHeatCost;

    // Calculate savings with pool cover
    const savingsWithCover = hasPoolCover ? 0 : monthlyEnergyCost * 0.75;

    // Compare heater types
    const heaterComparison = (Object.keys(heaterTypes) as HeaterType[]).map((type) => {
      const h = heaterTypes[type];
      let monthlyCost = 0;

      if (type === 'gas') {
        const dailyTherms = dailyBtuNeeded / 100000 / (h.efficiency / 100);
        monthlyCost = dailyTherms * gRate * 30;
      } else if (type === 'solar') {
        monthlyCost = 0;
      } else {
        const dailyKwh = dailyBtuNeeded / 3412 / (h.efficiency / 100);
        monthlyCost = dailyKwh * eRate * 30;
      }

      return {
        type,
        name: h.name,
        monthlyCost,
        seasonalCost: monthlyCost * months,
        installCost: h.installCost,
        paybackYears: h.installCost > 0 && monthlyCost > 0 ? h.installCost / (monthlyCost * months) : 0,
      };
    });

    return {
      surfaceArea,
      volumeGallons,
      btuToHeat,
      hoursToHeat,
      btuLossPerHour,
      hoursPerDay,
      dailyBtuNeeded,
      dailyEnergyCost,
      monthlyEnergyCost,
      initialHeatCost,
      seasonalCost,
      savingsWithCover,
      heaterComparison,
      tempDiff,
    };
  }, [
    heaterType, poolShape, poolLength, poolWidth, poolDepthShallow, poolDepthDeep,
    currentTemp, desiredTemp, ambientTemp, windExposure, hasPoolCover,
    monthsOfUse, electricityRate, gasRate
  ]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Waves className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolHeatingCost.poolHeatingCostCalculator', 'Pool Heating Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolHeatingCost.estimateCostsForHeatingYour', 'Estimate costs for heating your swimming pool')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Heater Type Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.poolHeatingCost.heaterType', 'Heater Type')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(heaterTypes) as HeaterType[]).map((type) => {
              const h = heaterTypes[type];
              return (
                <button
                  key={type}
                  onClick={() => setHeaterType(type)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    heaterType === type
                      ? `border-[#0D9488] ${isDark ? t('tools.poolHeatingCost.bg0d948820', 'bg-[#0D9488]/20') : 'bg-teal-50'}`
                      : isDark
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{h.name}</div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {h.efficiency}% eff. | ${h.installCost}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pool Dimensions */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolHeatingCost.poolDimensions', 'Pool Dimensions')}</h4>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.poolShape', 'Pool Shape')}</label>
            <div className="flex gap-2">
              {(['rectangular', 'oval', 'kidney', 'freeform'] as PoolShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setPoolShape(shape)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize ${
                    poolShape === shape
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.lengthFt', 'Length (ft)')}</label>
              <input
                type="number"
                value={poolLength}
                onChange={(e) => setPoolLength(e.target.value)}
                placeholder="30"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.widthFt', 'Width (ft)')}</label>
              <input
                type="number"
                value={poolWidth}
                onChange={(e) => setPoolWidth(e.target.value)}
                placeholder="15"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.shallowEndFt', 'Shallow End (ft)')}</label>
              <input
                type="number"
                value={poolDepthShallow}
                onChange={(e) => setPoolDepthShallow(e.target.value)}
                placeholder="3"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.deepEndFt', 'Deep End (ft)')}</label>
              <input
                type="number"
                value={poolDepthDeep}
                onChange={(e) => setPoolDepthDeep(e.target.value)}
                placeholder="8"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
          </div>

          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.poolHeatingCost.surfaceArea', 'Surface Area:')}</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.surfaceArea.toFixed(0)} sq ft</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.poolHeatingCost.volume', 'Volume:')}</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.volumeGallons.toLocaleString()} gallons</span>
            </div>
          </div>
        </div>

        {/* Temperature Settings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Thermometer className="w-4 h-4 inline mr-1" />
              {t('tools.poolHeatingCost.currentTempF', 'Current Temp (F)')}
            </label>
            <input
              type="number"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(e.target.value)}
              placeholder="65"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.poolHeatingCost.desiredTempF', 'Desired Temp (F)')}
            </label>
            <input
              type="number"
              value={desiredTemp}
              onChange={(e) => setDesiredTemp(e.target.value)}
              placeholder="82"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Sun className="w-4 h-4 inline mr-1" />
              {t('tools.poolHeatingCost.ambientTempF', 'Ambient Temp (F)')}
            </label>
            <input
              type="number"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(e.target.value)}
              placeholder="70"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.poolHeatingCost.monthsYear', 'Months/Year')}
            </label>
            <input
              type="number"
              value={monthsOfUse}
              onChange={(e) => setMonthsOfUse(e.target.value)}
              placeholder="6"
              min="1"
              max="12"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
        </div>

        {/* Environmental Factors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.windExposure', 'Wind Exposure')}</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setWindExposure(level)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize ${
                    windExposure === level
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.poolHeatingCost.poolCover', 'Pool Cover')}</label>
            <button
              onClick={() => setHasPoolCover(!hasPoolCover)}
              className={`w-full py-2 px-3 rounded-lg text-sm ${
                hasPoolCover
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {hasPoolCover ? t('tools.poolHeatingCost.yesPoolCoverUsed', 'Yes - Pool Cover Used') : t('tools.poolHeatingCost.noPoolCover', 'No Pool Cover')}
            </button>
          </div>
        </div>

        {/* Energy Rates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.poolHeatingCost.electricityRateKwh', 'Electricity Rate ($/kWh)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
              placeholder="0.12"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.poolHeatingCost.gasRateTherm', 'Gas Rate ($/therm)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={gasRate}
              onChange={(e) => setGasRate(e.target.value)}
              placeholder="1.20"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.poolHeatingCost.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Zap className="w-4 h-4 text-[#0D9488]" />
            Cost Summary ({heater.name})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolHeatingCost.initialHeatUp', 'Initial Heat-Up')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.initialHeatCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.hoursToHeat.toFixed(1)} hours</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolHeatingCost.dailyCost', 'Daily Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.dailyEnergyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>maintenance</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolHeatingCost.monthlyCost', 'Monthly Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.monthlyEnergyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>30 days</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolHeatingCost.seasonalCost', 'Seasonal Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.seasonalCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{monthsOfUse} months</div>
            </div>
          </div>
        </div>

        {/* Pool Cover Savings */}
        {!hasPoolCover && calculations.savingsWithCover > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h4 className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>{t('tools.poolHeatingCost.poolCoverSavings', 'Pool Cover Savings')}</h4>
            </div>
            <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              Adding a pool cover could save you <span className="font-bold">${calculations.savingsWithCover.toFixed(2)}/month</span> (up to 75% heat loss reduction).
            </p>
          </div>
        )}

        {/* Heater Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolHeatingCost.heaterTypeComparison', 'Heater Type Comparison')}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.poolHeatingCost.type', 'Type')}</th>
                  <th className="text-right py-2">{t('tools.poolHeatingCost.monthly', 'Monthly')}</th>
                  <th className="text-right py-2">{t('tools.poolHeatingCost.seasonal', 'Seasonal')}</th>
                  <th className="text-right py-2">{t('tools.poolHeatingCost.install', 'Install')}</th>
                </tr>
              </thead>
              <tbody>
                {calculations.heaterComparison.map((h) => (
                  <tr
                    key={h.type}
                    className={`${isDark ? 'border-gray-700' : 'border-gray-200'} border-t ${
                      h.type === heaterType ? (isDark ? t('tools.poolHeatingCost.bg0d948810', 'bg-[#0D9488]/10') : 'bg-teal-50') : ''
                    }`}
                  >
                    <td className={`py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{h.name}</td>
                    <td className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${h.monthlyCost.toFixed(2)}</td>
                    <td className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${h.seasonalCost.toFixed(2)}</td>
                    <td className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${h.installCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.poolHeatingCost.poolHeatingTips', 'Pool Heating Tips:')}</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>{t('tools.poolHeatingCost.poolCoversCanReduceHeating', 'Pool covers can reduce heating costs by up to 75%')}</li>
                <li>{t('tools.poolHeatingCost.heatPumpsAreMostEfficient', 'Heat pumps are most efficient in mild climates (40-90F)')}</li>
                <li>{t('tools.poolHeatingCost.solarHeatersHaveNoOperating', 'Solar heaters have no operating costs but need adequate sun')}</li>
                <li>{t('tools.poolHeatingCost.lowerPoolTempBy1f', 'Lower pool temp by 1F saves 10-30% on heating costs')}</li>
                <li>{t('tools.poolHeatingCost.runHeaterDuringOffPeak', 'Run heater during off-peak hours for lower electric rates')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolHeatingCostTool;
