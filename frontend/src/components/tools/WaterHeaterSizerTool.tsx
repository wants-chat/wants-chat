import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Home, Bath, Thermometer, Info, Zap, Flame } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type HeaterType = 'tank' | 'tankless';

interface FixtureConfig {
  name: string;
  gpm: number; // gallons per minute flow rate
  avgDuration: number; // average minutes of use
}

interface HouseholdProfile {
  label: string;
  peakMultiplier: number;
  description: string;
}

interface WaterHeaterSizerToolProps {
  uiConfig?: UIConfig;
}

export const WaterHeaterSizerTool: React.FC<WaterHeaterSizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [householdSize, setHouseholdSize] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [showers, setShowers] = useState('1');
  const [dishwashers, setDishwashers] = useState('1');
  const [washingMachines, setWashingMachines] = useState('1');
  const [sinks, setSinks] = useState('3');
  const [usagePattern, setUsagePattern] = useState<'low' | 'medium' | 'high'>('medium');
  const [inletTemp, setInletTemp] = useState('50');
  const [desiredTemp, setDesiredTemp] = useState('120');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 1) {
        setHouseholdSize(params.numbers[0].toString());
        if (params.numbers[1]) {
          setBathrooms(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      } else if (params.amount) {
        setHouseholdSize(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const fixtures: Record<string, FixtureConfig> = {
    shower: { name: 'Shower', gpm: 2.0, avgDuration: 8 },
    bath: { name: 'Bathtub', gpm: 4.0, avgDuration: 10 },
    dishwasher: { name: 'Dishwasher', gpm: 1.5, avgDuration: 30 },
    washingMachine: { name: 'Washing Machine', gpm: 2.0, avgDuration: 15 },
    sink: { name: 'Kitchen/Bath Sink', gpm: 1.5, avgDuration: 2 },
  };

  const usageProfiles: Record<string, HouseholdProfile> = {
    low: {
      label: 'Low',
      peakMultiplier: 0.7,
      description: 'Staggered usage, water-conscious household',
    },
    medium: {
      label: 'Medium',
      peakMultiplier: 1.0,
      description: 'Typical family usage patterns',
    },
    high: {
      label: 'High',
      peakMultiplier: 1.3,
      description: 'Multiple simultaneous users, heavy usage',
    },
  };

  const calculations = useMemo(() => {
    const people = parseInt(householdSize) || 1;
    const numBathrooms = parseInt(bathrooms) || 1;
    const numShowers = parseInt(showers) || 0;
    const numDishwashers = parseInt(dishwashers) || 0;
    const numWashingMachines = parseInt(washingMachines) || 0;
    const numSinks = parseInt(sinks) || 0;
    const profile = usageProfiles[usagePattern];
    const inlet = parseInt(inletTemp) || 50;
    const desired = parseInt(desiredTemp) || 120;

    // Calculate peak hour demand (gallons)
    // Assume during peak hour: showers, dishwasher, and some sink usage
    const showerDemand = numShowers * fixtures.shower.gpm * fixtures.shower.avgDuration;
    const dishwasherDemand = numDishwashers * fixtures.dishwasher.gpm * (fixtures.dishwasher.avgDuration / 60) * 10; // partial cycle
    const sinkDemand = numSinks * fixtures.sink.gpm * fixtures.sink.avgDuration * 2; // 2 uses per sink

    const basePeakHourDemand = (showerDemand + dishwasherDemand + sinkDemand) * profile.peakMultiplier;

    // Add per-person factor (12-18 gallons per person during peak hour)
    const perPersonDemand = people * 14;
    const peakHourDemand = Math.max(basePeakHourDemand, perPersonDemand);

    // First Hour Rating (FHR) should be >= peak hour demand
    const recommendedFHR = Math.ceil(peakHourDemand * 1.1); // 10% buffer

    // Tank size recommendation
    // Rule of thumb: 10-15 gallons per person for conventional tank
    let tankSize: number;
    if (people <= 2) {
      tankSize = 30;
    } else if (people <= 3) {
      tankSize = 40;
    } else if (people <= 4) {
      tankSize = 50;
    } else if (people <= 5) {
      tankSize = 65;
    } else {
      tankSize = 80;
    }

    // Adjust for bathroom count
    if (numBathrooms >= 3) {
      tankSize = Math.min(tankSize + 10, 80);
    }
    if (numBathrooms >= 4) {
      tankSize = 80;
    }

    // Apply usage pattern modifier
    if (usagePattern === 'high') {
      tankSize = Math.min(tankSize + 10, 80);
    } else if (usagePattern === 'low') {
      tankSize = Math.max(tankSize - 10, 30);
    }

    // Tankless calculations
    // Flow rate needed for simultaneous use
    const simultaneousFixtures = Math.ceil(numBathrooms * 0.7); // Assume 70% might be used at once
    const flowRateNeeded = simultaneousFixtures * 2.0; // 2 GPM average per fixture

    // Temperature rise needed
    const tempRise = desired - inlet;

    // BTU requirements for tankless (approximate: 500 BTU per GPM per degree rise)
    const btuRequired = flowRateNeeded * tempRise * 500;

    // Tankless size recommendation
    let tanklessSize: string;
    let tanklessGPM: number;
    if (flowRateNeeded <= 5) {
      tanklessSize = 'Small (up to 5 GPM)';
      tanklessGPM = 5;
    } else if (flowRateNeeded <= 7) {
      tanklessSize = 'Medium (5-7 GPM)';
      tanklessGPM = 7;
    } else if (flowRateNeeded <= 9) {
      tanklessSize = 'Large (7-9 GPM)';
      tanklessGPM = 9;
    } else {
      tanklessSize = 'Extra Large (9+ GPM) or Multiple Units';
      tanklessGPM = 11;
    }

    // Energy efficiency estimates (annual)
    const tankAnnualCost = tankSize * 3; // ~$3 per gallon capacity annually
    const tanklessAnnualCost = tankAnnualCost * 0.65; // ~35% more efficient
    const annualSavings = tankAnnualCost - tanklessAnnualCost;

    return {
      peakHourDemand: Math.round(peakHourDemand),
      recommendedFHR,
      tankSize,
      tanklessSize,
      tanklessGPM: flowRateNeeded.toFixed(1),
      tempRise,
      btuRequired: Math.round(btuRequired),
      tankAnnualCost: Math.round(tankAnnualCost),
      tanklessAnnualCost: Math.round(tanklessAnnualCost),
      annualSavings: Math.round(annualSavings),
      simultaneousFixtures,
    };
  }, [householdSize, bathrooms, showers, dishwashers, washingMachines, sinks, usagePattern, inletTemp, desiredTemp]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Droplets className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterHeaterSizer.waterHeaterSizeCalculator', 'Water Heater Size Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterHeaterSizer.findTheRightSizeFor', 'Find the right size for your household needs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Household Size */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.waterHeaterSizer.householdSizePeople', 'Household Size (people)')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setHouseholdSize(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(householdSize) === n ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Bath className="w-4 h-4 inline mr-1" />
            {t('tools.waterHeaterSizer.numberOfBathrooms', 'Number of Bathrooms')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setBathrooms(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(bathrooms) === n ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Fixtures Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterHeaterSizer.showersTubs', 'Showers/Tubs')}
            </label>
            <input
              type="number"
              min="0"
              value={showers}
              onChange={(e) => setShowers(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterHeaterSizer.dishwashers', 'Dishwashers')}
            </label>
            <input
              type="number"
              min="0"
              value={dishwashers}
              onChange={(e) => setDishwashers(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterHeaterSizer.washingMachines', 'Washing Machines')}
            </label>
            <input
              type="number"
              min="0"
              value={washingMachines}
              onChange={(e) => setWashingMachines(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterHeaterSizer.sinksKitchenBath', 'Sinks (Kitchen/Bath)')}
            </label>
            <input
              type="number"
              min="0"
              value={sinks}
              onChange={(e) => setSinks(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Usage Pattern */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.waterHeaterSizer.usagePattern', 'Usage Pattern')}
          </label>
          <div className="flex gap-2">
            {(Object.keys(usageProfiles) as Array<'low' | 'medium' | 'high'>).map((pattern) => (
              <button
                key={pattern}
                onClick={() => setUsagePattern(pattern)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm ${usagePattern === pattern ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {usageProfiles[pattern].label}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {usageProfiles[usagePattern].description}
          </p>
        </div>

        {/* Temperature Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Thermometer className="w-4 h-4 inline mr-1" />
              {t('tools.waterHeaterSizer.inletWaterTempF', 'Inlet Water Temp (°F)')}
            </label>
            <input
              type="number"
              value={inletTemp}
              onChange={(e) => setInletTemp(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Thermometer className="w-4 h-4 inline mr-1" />
              {t('tools.waterHeaterSizer.desiredTempF', 'Desired Temp (°F)')}
            </label>
            <input
              type="number"
              value={desiredTemp}
              onChange={(e) => setDesiredTemp(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Peak Hour Demand */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterHeaterSizer.peakHourDemand', 'Peak Hour Demand')}</h4>
            <span className="text-blue-500 font-bold">{calculations.peakHourDemand} gallons</span>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">{t('tools.waterHeaterSizer.firstHourRatingNeeded', 'First Hour Rating needed:')}</span> {calculations.recommendedFHR}+ gallons/hour
          </div>
          <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">{t('tools.waterHeaterSizer.temperatureRise', 'Temperature Rise:')}</span> {calculations.tempRise}°F
          </div>
        </div>

        {/* Tank vs Tankless Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tank Recommendation */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterHeaterSizer.tankWaterHeater', 'Tank Water Heater')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.tankSize} gallon</div>
            <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div>{t('tools.waterHeaterSizer.recommendedTankCapacity', 'Recommended tank capacity')}</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>{t('tools.waterHeaterSizer.estAnnualCost', 'Est. Annual Cost:')}</span>
                  <span className="font-medium">${calculations.tankAnnualCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.waterHeaterSizer.upfrontCost', 'Upfront Cost:')}</span>
                  <span className="font-medium">$400-$1,200</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.waterHeaterSizer.lifespan', 'Lifespan:')}</span>
                  <span className="font-medium">10-15 years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tankless Recommendation */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterHeaterSizer.tanklessWaterHeater', 'Tankless Water Heater')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.tanklessGPM} GPM</div>
            <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div>{calculations.btuRequired.toLocaleString()} BTU required</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>{t('tools.waterHeaterSizer.estAnnualCost2', 'Est. Annual Cost:')}</span>
                  <span className="font-medium">${calculations.tanklessAnnualCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.waterHeaterSizer.upfrontCost2', 'Upfront Cost:')}</span>
                  <span className="font-medium">$800-$2,500</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.waterHeaterSizer.lifespan2', 'Lifespan:')}</span>
                  <span className="font-medium">20+ years</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.waterHeaterSizer.estimatedAnnualSavingsWithTankless', 'Estimated Annual Savings with Tankless')}</div>
          <div className="text-2xl font-bold text-green-500">
            ${calculations.annualSavings}/year
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.waterHeaterSizer.35MoreEnergyEfficientThan', '~35% more energy efficient than traditional tank heaters')}
          </div>
        </div>

        {/* Sizing Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterHeaterSizer.quickSizingGuide', 'Quick Sizing Guide')}</h4>
          <div className={`grid grid-cols-2 gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>1-2 people:</div><div>30-40 gallons</div>
            <div>2-3 people:</div><div>40-50 gallons</div>
            <div>3-4 people:</div><div>50-60 gallons</div>
            <div>5+ people:</div><div>60-80 gallons</div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.waterHeaterSizer.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Look for the First Hour Rating (FHR) on tank heaters</li>
                <li>- Tankless heaters need adequate gas line or electrical capacity</li>
                <li>- Consider hybrid heat pump water heaters for best efficiency</li>
                <li>- Inlet water temp varies by region (40-70°F typical)</li>
                <li>- Multiple tankless units may be needed for large homes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterHeaterSizerTool;
