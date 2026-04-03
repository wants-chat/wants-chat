import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Thermometer, DollarSign, Clock, Zap, Info, TrendingDown, Wind, Snowflake, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface HVACCostToolProps {
  uiConfig?: UIConfig;
}

type SystemType = 'central-ac' | 'window-ac' | 'heat-pump' | 'furnace-gas' | 'furnace-electric' | 'mini-split';
type Season = 'summer' | 'winter' | 'spring-fall';

interface SystemConfig {
  name: string;
  watts: number;
  btuPerHour: number;
  efficiency: number;
  icon: typeof Snowflake | typeof Sun;
  mode: 'cooling' | 'heating' | 'both';
}

const systems: Record<SystemType, SystemConfig> = {
  'central-ac': { name: 'Central Air Conditioning', watts: 3500, btuPerHour: 36000, efficiency: 14, icon: Snowflake, mode: 'cooling' },
  'window-ac': { name: 'Window AC Unit', watts: 1200, btuPerHour: 12000, efficiency: 10, icon: Snowflake, mode: 'cooling' },
  'heat-pump': { name: 'Heat Pump (HVAC)', watts: 3000, btuPerHour: 36000, efficiency: 15, icon: Wind, mode: 'both' },
  'furnace-gas': { name: 'Gas Furnace', watts: 600, btuPerHour: 80000, efficiency: 80, icon: Sun, mode: 'heating' },
  'furnace-electric': { name: 'Electric Furnace', watts: 10000, btuPerHour: 34000, efficiency: 100, icon: Sun, mode: 'heating' },
  'mini-split': { name: 'Mini-Split System', watts: 1200, btuPerHour: 18000, efficiency: 20, icon: Wind, mode: 'both' },
};

export const HVACCostTool: React.FC<HVACCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [systemType, setSystemType] = useState<SystemType>('central-ac');
  const [customWatts, setCustomWatts] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('8');
  const [daysPerMonth, setDaysPerMonth] = useState('30');
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [gasRate, setGasRate] = useState('1.20');
  const [season, setSeason] = useState<Season>('summer');
  const [thermostatSetting, setThermostatSetting] = useState('72');
  const [outsideTemp, setOutsideTemp] = useState('95');

  const system = systems[systemType];
  const watts = customWatts ? parseFloat(customWatts) : system.watts;

  const calculations = useMemo(() => {
    const hours = parseFloat(hoursPerDay) || 0;
    const days = parseFloat(daysPerMonth) || 0;
    const eRate = parseFloat(electricityRate) || 0.12;
    const gRate = parseFloat(gasRate) || 1.20;
    const thermostat = parseFloat(thermostatSetting) || 72;
    const outside = parseFloat(outsideTemp) || 95;

    // Calculate temperature differential
    const tempDiff = Math.abs(outside - thermostat);

    // Adjust runtime based on temperature differential
    // Higher temp diff = longer runtime
    const runtimeFactor = tempDiff > 20 ? 1.3 : tempDiff > 10 ? 1.0 : 0.7;
    const adjustedHours = hours * runtimeFactor;

    // Energy calculations
    const dailyKwh = (watts * adjustedHours) / 1000;
    const monthlyKwh = dailyKwh * days;
    const yearlyKwh = monthlyKwh * (season === 'spring-fall' ? 4 : 6); // Seasonal months

    // Cost calculations (electric)
    const dailyCost = dailyKwh * eRate;
    const monthlyCost = monthlyKwh * eRate;
    const yearlyCost = yearlyKwh * eRate;

    // For gas furnace, calculate gas cost separately
    let gasUsage = 0;
    let gasCost = 0;
    if (systemType === 'furnace-gas') {
      // Therms per hour based on BTU output
      const thermsPerHour = system.btuPerHour / 100000 / (system.efficiency / 100);
      gasUsage = thermsPerHour * adjustedHours * days;
      gasCost = gasUsage * gRate;
    }

    // Total cost (electric + gas if applicable)
    const totalMonthlyCost = systemType === 'furnace-gas' ? gasCost + (dailyCost * days * 0.1) : monthlyCost;
    const totalYearlyCost = systemType === 'furnace-gas' ? (gasCost + (dailyCost * days * 0.1)) * (season === 'spring-fall' ? 4 : 6) : yearlyCost;

    // Efficiency metrics
    const costPerBtu = totalMonthlyCost / (system.btuPerHour * adjustedHours * days);

    // Calculate potential savings with efficiency improvements
    const savingsWithProgrammable = totalMonthlyCost * 0.10; // 10% savings
    const savingsWithMaintenance = totalMonthlyCost * 0.15; // 15% savings
    const savingsWithUpgrade = totalMonthlyCost * 0.20; // 20% savings with newer system

    return {
      dailyKwh,
      monthlyKwh,
      yearlyKwh,
      dailyCost,
      monthlyCost,
      yearlyCost,
      gasUsage,
      gasCost,
      totalMonthlyCost,
      totalYearlyCost,
      adjustedHours,
      tempDiff,
      runtimeFactor,
      costPerBtu,
      savingsWithProgrammable,
      savingsWithMaintenance,
      savingsWithUpgrade,
    };
  }, [systemType, watts, hoursPerDay, daysPerMonth, electricityRate, gasRate, season, thermostatSetting, outsideTemp]);

  const seasonalPresets: Record<Season, { thermostat: string; outside: string; label: string }> = {
    summer: { thermostat: '72', outside: '95', label: 'Summer (Cooling)' },
    winter: { thermostat: '70', outside: '35', label: 'Winter (Heating)' },
    'spring-fall': { thermostat: '70', outside: '60', label: 'Spring/Fall' },
  };

  const applySeason = (s: Season) => {
    setSeason(s);
    setThermostatSetting(seasonalPresets[s].thermostat);
    setOutsideTemp(seasonalPresets[s].outside);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Thermometer className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hVACCost.hvacRunningCostCalculator', 'HVAC Running Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.estimateHeatingAndCoolingCosts', 'Estimate heating and cooling costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Type Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.hVACCost.hvacSystemType', 'HVAC System Type')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(systems) as SystemType[]).map((type) => {
              const s = systems[type];
              const Icon = s.icon;
              return (
                <button
                  key={type}
                  onClick={() => setSystemType(type)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    systemType === type
                      ? `border-[#0D9488] ${isDark ? t('tools.hVACCost.bg0d948820', 'bg-[#0D9488]/20') : 'bg-teal-50'}`
                      : isDark
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${systemType === type ? 'text-[#0D9488]' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.name}</span>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {s.watts}W | {(s.btuPerHour / 1000).toFixed(0)}k BTU
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Season Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.hVACCost.season', 'Season')}
          </label>
          <div className="flex gap-2">
            {(Object.keys(seasonalPresets) as Season[]).map((s) => (
              <button
                key={s}
                onClick={() => applySeason(s)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                  season === s
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {seasonalPresets[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.hVACCost.thermostatSettingF', 'Thermostat Setting (F)')}
            </label>
            <input
              type="number"
              value={thermostatSetting}
              onChange={(e) => setThermostatSetting(e.target.value)}
              placeholder="72"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.hVACCost.outsideTemperatureF', 'Outside Temperature (F)')}
            </label>
            <input
              type="number"
              value={outsideTemp}
              onChange={(e) => setOutsideTemp(e.target.value)}
              placeholder="95"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
        </div>

        {/* Usage Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.hVACCost.hoursDay', 'Hours/Day')}
            </label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              placeholder="8"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.hVACCost.daysMonth', 'Days/Month')}
            </label>
            <input
              type="number"
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(e.target.value)}
              placeholder="30"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.hVACCost.electricKwh', 'Electric ($/kWh)')}
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
          {systemType === 'furnace-gas' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.hVACCost.gasTherm', 'Gas ($/therm)')}
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
          )}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.hVACCost.customWattsOpt', 'Custom Watts (opt.)')}
            </label>
            <input
              type="number"
              value={customWatts}
              onChange={(e) => setCustomWatts(e.target.value)}
              placeholder={system.watts.toString()}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
        </div>

        {/* Runtime Adjustment Info */}
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hVACCost.runtimeAdjustment', 'Runtime Adjustment')}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Temperature differential: <span className="font-medium">{calculations.tempDiff}F</span> |
            Adjusted runtime: <span className="font-medium">{calculations.adjustedHours.toFixed(1)} hours/day</span>
            ({calculations.runtimeFactor > 1 ? '+' : ''}{((calculations.runtimeFactor - 1) * 100).toFixed(0)}% adjustment)
          </p>
        </div>

        {/* Cost Summary */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.hVACCost.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Zap className="w-4 h-4 text-[#0D9488]" />
            {t('tools.hVACCost.costSummary', 'Cost Summary')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.dailyCost', 'Daily Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.dailyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.dailyKwh.toFixed(1)} kWh</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.monthlyCost', 'Monthly Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.totalMonthlyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.monthlyKwh.toFixed(0)} kWh</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.seasonalCost', 'Seasonal Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.totalYearlyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{season === 'spring-fall' ? '4' : '6'} months</div>
            </div>
            {systemType === 'furnace-gas' && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.gasUsage', 'Gas Usage')}</div>
                <div className="text-xl font-bold text-orange-500">{calculations.gasUsage.toFixed(1)} therms</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>${calculations.gasCost.toFixed(2)}/month</div>
              </div>
            )}
          </div>
        </div>

        {/* Potential Savings */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
            <TrendingDown className="w-4 h-4" />
            {t('tools.hVACCost.potentialMonthlySavings', 'Potential Monthly Savings')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.programmableThermostat', 'Programmable Thermostat')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>${calculations.savingsWithProgrammable.toFixed(2)}/mo</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>~10% savings</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.regularMaintenance', 'Regular Maintenance')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>${calculations.savingsWithMaintenance.toFixed(2)}/mo</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>~15% savings</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hVACCost.highEfficiencyUpgrade', 'High-Efficiency Upgrade')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>${calculations.savingsWithUpgrade.toFixed(2)}/mo</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>~20% savings</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.hVACCost.hvacEfficiencyTips', 'HVAC Efficiency Tips:')}</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>{t('tools.hVACCost.setThermostatTo78fIn', 'Set thermostat to 78F in summer and 68F in winter for optimal efficiency')}</li>
                <li>{t('tools.hVACCost.eachDegreeOfAdjustmentSaves', 'Each degree of adjustment saves about 3% on heating/cooling costs')}</li>
                <li>{t('tools.hVACCost.replaceAirFiltersMonthlyDuring', 'Replace air filters monthly during peak usage seasons')}</li>
                <li>{t('tools.hVACCost.scheduleAnnualProfessionalMaintenanceBefore', 'Schedule annual professional maintenance before each season')}</li>
                <li>{t('tools.hVACCost.sealDuctworkToPrevent20', 'Seal ductwork to prevent 20-30% energy loss')}</li>
                <li>{t('tools.hVACCost.useCeilingFansToHelp', 'Use ceiling fans to help distribute conditioned air')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HVACCostTool;
