import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Zap, Home, DollarSign, Calculator, Info, Ruler } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SolarConfig {
  name: string;
  wattage: number;
  efficiency: number; // percentage
  panelSize: number; // sq ft per panel
  description: string;
}

type PanelType = 'monocrystalline' | 'polycrystalline' | 'thinfilm' | 'bifacial';

interface SolarPanelCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SolarPanelCalculatorTool: React.FC<SolarPanelCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [panelType, setPanelType] = useState<PanelType>('monocrystalline');
  const [monthlyUsage, setMonthlyUsage] = useState('900');
  const [sunHours, setSunHours] = useState('5');
  const [customWattage, setCustomWattage] = useState('');
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [systemLoss, setSystemLoss] = useState('15');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 1) {
        setMonthlyUsage(params.numbers[0].toString());
        if (params.numbers[1]) {
          setSunHours(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      } else if (params.amount) {
        setMonthlyUsage(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const panelTypes: Record<PanelType, SolarConfig> = {
    monocrystalline: {
      name: 'Monocrystalline',
      wattage: 400,
      efficiency: 22,
      panelSize: 17.5,
      description: 'Highest efficiency, premium price, sleek black appearance',
    },
    polycrystalline: {
      name: 'Polycrystalline',
      wattage: 350,
      efficiency: 17,
      panelSize: 17.5,
      description: 'Good efficiency, budget-friendly, blue speckled look',
    },
    thinfilm: {
      name: 'Thin Film',
      wattage: 250,
      efficiency: 12,
      panelSize: 20,
      description: 'Flexible, lightweight, best for large flat roofs',
    },
    bifacial: {
      name: 'Bifacial',
      wattage: 450,
      efficiency: 25,
      panelSize: 18,
      description: 'Captures light on both sides, highest output potential',
    },
  };

  const config = panelTypes[panelType];
  const panelWattage = customWattage ? parseFloat(customWattage) : config.wattage;

  const calculations = useMemo(() => {
    const monthlyKwh = parseFloat(monthlyUsage) || 0;
    const peakSunHours = parseFloat(sunHours) || 0;
    const rate = parseFloat(electricityRate) || 0;
    const lossPercent = parseFloat(systemLoss) || 0;

    // Daily and annual energy needs
    const dailyKwh = monthlyKwh / 30;
    const annualKwh = monthlyKwh * 12;

    // Account for system losses (inverter, wiring, temperature, etc.)
    const lossMultiplier = 1 + (lossPercent / 100);
    const adjustedDailyKwh = dailyKwh * lossMultiplier;

    // System size needed in kW
    // Formula: Daily kWh / Peak Sun Hours = System Size in kW
    const systemSizeKw = adjustedDailyKwh / peakSunHours;
    const systemSizeWatts = systemSizeKw * 1000;

    // Number of panels needed
    const panelsNeeded = Math.ceil(systemSizeWatts / panelWattage);

    // Roof space required (sq ft)
    const roofSpaceNeeded = panelsNeeded * config.panelSize;

    // Estimated annual production (kWh)
    // Formula: System Size (kW) x Peak Sun Hours x 365 x (1 - loss%)
    const annualProduction = systemSizeKw * peakSunHours * 365 * (1 - lossPercent / 100);

    // Savings calculations
    const annualSavings = annualProduction * rate;
    const monthlySavings = annualSavings / 12;

    // Coverage percentage
    const coveragePercent = Math.min((annualProduction / annualKwh) * 100, 100);

    // CO2 offset (average: 0.92 lbs CO2 per kWh)
    const co2OffsetLbs = annualProduction * 0.92;
    const co2OffsetTons = co2OffsetLbs / 2000;

    return {
      dailyKwh: dailyKwh.toFixed(1),
      annualKwh: annualKwh.toFixed(0),
      systemSizeKw: systemSizeKw.toFixed(2),
      panelsNeeded: panelsNeeded,
      roofSpaceNeeded: roofSpaceNeeded.toFixed(0),
      annualProduction: annualProduction.toFixed(0),
      annualSavings: annualSavings.toFixed(2),
      monthlySavings: monthlySavings.toFixed(2),
      coveragePercent: coveragePercent.toFixed(0),
      co2OffsetTons: co2OffsetTons.toFixed(1),
    };
  }, [monthlyUsage, sunHours, panelWattage, config.panelSize, electricityRate, systemLoss]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg"><Sun className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.solarPanelCalculator.solarPanelCalculator', 'Solar Panel Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.solarPanelCalculator.calculateYourSolarEnergyNeeds', 'Calculate your solar energy needs and savings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Panel Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(panelTypes) as PanelType[]).map((type) => (
            <button
              key={type}
              onClick={() => setPanelType(type)}
              className={`py-2 px-3 rounded-lg text-sm ${panelType === type ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {panelTypes[type].name}
            </button>
          ))}
        </div>

        {/* Panel Type Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-yellow-500 font-bold">{panelWattage}W</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.solarPanelCalculator.efficiency', 'Efficiency:')}</span> {config.efficiency}%
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.solarPanelCalculator.panelSize', 'Panel Size:')}</span> {config.panelSize} sq ft
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Custom Wattage */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.solarPanelCalculator.customPanelWattageOptional', 'Custom Panel Wattage (optional)')}
          </label>
          <input
            type="number"
            value={customWattage}
            onChange={(e) => setCustomWattage(e.target.value)}
            placeholder={config.wattage.toString()}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Monthly Usage Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Zap className="w-4 h-4 inline mr-1" />
            {t('tools.solarPanelCalculator.monthlyElectricityUsageKwh', 'Monthly Electricity Usage (kWh)')}
          </label>
          <div className="flex gap-2">
            {[500, 750, 900, 1200, 1500].map((n) => (
              <button
                key={n}
                onClick={() => setMonthlyUsage(n.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseInt(monthlyUsage) === n ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={monthlyUsage}
            onChange={(e) => setMonthlyUsage(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Sun Hours Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Sun className="w-4 h-4 inline mr-1" />
            {t('tools.solarPanelCalculator.peakSunHoursPerDay', 'Peak Sun Hours Per Day')}
          </label>
          <div className="flex gap-2">
            {[3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                onClick={() => setSunHours(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(sunHours) === n ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}h
              </button>
            ))}
          </div>
          <input
            type="number"
            step="0.5"
            value={sunHours}
            onChange={(e) => setSunHours(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Electricity Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.solarPanelCalculator.electricityRateKwh', 'Electricity Rate ($/kWh)')}
          </label>
          <input
            type="number"
            step="0.01"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* System Loss */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.solarPanelCalculator.systemLossFactor', 'System Loss Factor (%)')}
          </label>
          <input
            type="number"
            value={systemLoss}
            onChange={(e) => setSystemLoss(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.solarPanelCalculator.accountsForInverterWiringTemperature', 'Accounts for inverter, wiring, temperature losses (typical: 10-20%)')}
          </p>
        </div>

        {/* Main Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.solarPanelCalculator.systemSize', 'System Size')}</span>
            </div>
            <div className="text-3xl font-bold text-yellow-500">{calculations.systemSizeKw} kW</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.solarPanelCalculator.recommendedCapacity', 'Recommended capacity')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.solarPanelCalculator.panelsNeeded', 'Panels Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.panelsNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              at {panelWattage}W each
            </div>
          </div>
        </div>

        {/* Roof Space & Production */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.solarPanelCalculator.roofSpace', 'Roof Space')}</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{calculations.roofSpaceNeeded} sq ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.solarPanelCalculator.minimumRequired', 'Minimum required')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.solarPanelCalculator.annualProduction', 'Annual Production')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{calculations.annualProduction} kWh</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.coveragePercent}% of your usage
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.solarPanelCalculator.estimatedAnnualSavings', 'Estimated Annual Savings')}</div>
          <div className="text-3xl font-bold text-green-500">${calculations.annualSavings}</div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            ~${calculations.monthlySavings}/month
          </div>
        </div>

        {/* Environmental Impact */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-4 h-4 text-teal-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.solarPanelCalculator.environmentalImpact', 'Environmental Impact')}</span>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your system would offset approximately <span className="text-teal-500 font-bold">{calculations.co2OffsetTons} tons</span> of CO2 annually.
            That's equivalent to planting about <span className="text-teal-500 font-bold">{Math.round(parseFloat(calculations.co2OffsetTons) * 16)} trees</span>!
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.solarPanelCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.solarPanelCalculator.peakSunHoursVaryBy', 'Peak sun hours vary by location (check your area\'s solar map)')}</li>
                <li>{t('tools.solarPanelCalculator.southFacingRoofsTypicallyReceive', 'South-facing roofs typically receive the most sunlight')}</li>
                <li>{t('tools.solarPanelCalculator.considerBatteryStorageForMaximum', 'Consider battery storage for maximum energy independence')}</li>
                <li>{t('tools.solarPanelCalculator.federalAndStateIncentivesCan', 'Federal and state incentives can reduce costs by 26-30%')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarPanelCalculatorTool;
