import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Battery, Zap, Clock, DollarSign, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ChargingResult {
  chargingTime: number;
  chargingTimeFormatted: string;
  energyNeeded: number;
  estimatedCost: number;
  chargingSpeed: string;
}

interface EVChargingCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const EVChargingCalculatorTool: React.FC<EVChargingCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [batteryCapacity, setBatteryCapacity] = useState('75');
  const [currentCharge, setCurrentCharge] = useState('20');
  const [targetCharge, setTargetCharge] = useState('80');
  const [chargerPower, setChargerPower] = useState('7.2');
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [chargingEfficiency, setChargingEfficiency] = useState('90');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Charger type presets
  const chargerPresets = [
    { name: 'Level 1 (120V)', power: 1.4, description: 'Standard outlet' },
    { name: 'Level 2 (240V)', power: 7.2, description: 'Home charger' },
    { name: 'Level 2 Fast', power: 11, description: 'Commercial' },
    { name: 'DC Fast (50kW)', power: 50, description: 'Fast charging' },
    { name: 'DC Fast (150kW)', power: 150, description: 'Supercharger' },
    { name: 'DC Fast (350kW)', power: 350, description: 'Ultra-fast' },
  ];

  // Popular EV battery presets
  const evPresets = [
    { name: 'Tesla Model 3 SR', capacity: 57.5 },
    { name: 'Tesla Model 3 LR', capacity: 82 },
    { name: 'Tesla Model Y', capacity: 75 },
    { name: 'Chevy Bolt', capacity: 65 },
    { name: 'Ford Mustang Mach-E', capacity: 88 },
    { name: 'Rivian R1T', capacity: 135 },
    { name: 'Hyundai Ioniq 6', capacity: 77.4 },
  ];

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.batteryCapacity !== undefined) {
        setBatteryCapacity(String(params.batteryCapacity));
        setIsPrefilled(true);
      }
      if (params.currentCharge !== undefined) {
        setCurrentCharge(String(params.currentCharge));
        setIsPrefilled(true);
      }
      if (params.chargerPower !== undefined) {
        setChargerPower(String(params.chargerPower));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<ChargingResult | null>(() => {
    const capacity = parseFloat(batteryCapacity) || 0;
    const current = parseFloat(currentCharge) || 0;
    const target = parseFloat(targetCharge) || 0;
    const power = parseFloat(chargerPower) || 0;
    const rate = parseFloat(electricityRate) || 0;
    const efficiency = (parseFloat(chargingEfficiency) || 90) / 100;

    if (capacity <= 0 || power <= 0 || current >= target) {
      return null;
    }

    // Calculate energy needed (accounting for charging losses)
    const chargePercentage = (target - current) / 100;
    const energyNeeded = (capacity * chargePercentage) / efficiency;

    // Calculate charging time in hours
    const chargingTime = energyNeeded / power;

    // Format time
    const hours = Math.floor(chargingTime);
    const minutes = Math.round((chargingTime - hours) * 60);
    let chargingTimeFormatted = '';
    if (hours > 0) {
      chargingTimeFormatted += `${hours}h `;
    }
    chargingTimeFormatted += `${minutes}m`;

    // Calculate cost
    const estimatedCost = energyNeeded * rate;

    // Determine charging speed category
    let chargingSpeed = 'Level 1';
    if (power >= 100) chargingSpeed = 'Ultra-Fast DC';
    else if (power >= 50) chargingSpeed = 'Fast DC';
    else if (power >= 7) chargingSpeed = 'Level 2';

    return {
      chargingTime,
      chargingTimeFormatted,
      energyNeeded,
      estimatedCost,
      chargingSpeed,
    };
  }, [batteryCapacity, currentCharge, targetCharge, chargerPower, electricityRate, chargingEfficiency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVChargingCalculator.evChargingCalculator', 'EV Charging Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eVChargingCalculator.calculateChargingTimeAndCost', 'Calculate charging time and cost')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.eVChargingCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* EV Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eVChargingCalculator.quickSelectEvModel', 'Quick Select EV Model')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {evPresets.slice(0, 4).map((ev) => (
              <button
                key={ev.name}
                onClick={() => setBatteryCapacity(ev.capacity.toString())}
                className={`py-2 px-3 text-xs rounded-lg transition-colors ${
                  parseFloat(batteryCapacity) === ev.capacity
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ev.name}
              </button>
            ))}
          </div>
        </div>

        {/* Battery Capacity */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Battery className="w-4 h-4 inline mr-1" />
            {t('tools.eVChargingCalculator.batteryCapacityKwh', 'Battery Capacity (kWh)')}
          </label>
          <input
            type="number"
            value={batteryCapacity}
            onChange={(e) => setBatteryCapacity(e.target.value)}
            placeholder="75"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>

        {/* Charge Level Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVChargingCalculator.currentCharge', 'Current Charge (%)')}
            </label>
            <input
              type="number"
              value={currentCharge}
              onChange={(e) => setCurrentCharge(e.target.value)}
              min="0"
              max="100"
              placeholder="20"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVChargingCalculator.targetCharge', 'Target Charge (%)')}
            </label>
            <input
              type="number"
              value={targetCharge}
              onChange={(e) => setTargetCharge(e.target.value)}
              min="0"
              max="100"
              placeholder="80"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        {/* Charge Level Visual */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVChargingCalculator.batteryLevel', 'Battery Level')}</span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {currentCharge}% to {targetCharge}%
            </span>
          </div>
          <div className={`h-6 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden relative`}>
            <div
              className="h-full bg-gray-400 absolute"
              style={{ width: `${currentCharge}%` }}
            />
            <div
              className="h-full bg-green-500 absolute transition-all"
              style={{ left: `${currentCharge}%`, width: `${Math.max(0, parseFloat(targetCharge) - parseFloat(currentCharge))}%` }}
            />
          </div>
        </div>

        {/* Charger Power */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Zap className="w-4 h-4 inline mr-1" />
            {t('tools.eVChargingCalculator.chargerPowerKw', 'Charger Power (kW)')}
          </label>
          <input
            type="number"
            value={chargerPower}
            onChange={(e) => setChargerPower(e.target.value)}
            step="0.1"
            placeholder="7.2"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          <div className="grid grid-cols-3 gap-2">
            {chargerPresets.slice(0, 6).map((preset) => (
              <button
                key={preset.name}
                onClick={() => setChargerPower(preset.power.toString())}
                className={`py-2 px-2 text-xs rounded-lg transition-colors ${
                  parseFloat(chargerPower) === preset.power
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{preset.power} kW</div>
                <div className="text-xs opacity-75">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Electricity Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.eVChargingCalculator.electricityRateKwh', 'Electricity Rate ($/kWh)')}
          </label>
          <input
            type="number"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            step="0.01"
            placeholder="0.12"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          <div className="flex gap-2">
            {[0.08, 0.12, 0.15, 0.20, 0.30].map((rate) => (
              <button
                key={rate}
                onClick={() => setElectricityRate(rate.toString())}
                className={`flex-1 py-1.5 text-xs rounded-lg ${
                  parseFloat(electricityRate) === rate
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ${rate}
              </button>
            ))}
          </div>
        </div>

        {/* Charging Efficiency */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eVChargingCalculator.chargingEfficiency', 'Charging Efficiency (%)')}
          </label>
          <input
            type="number"
            value={chargingEfficiency}
            onChange={(e) => setChargingEfficiency(e.target.value)}
            min="70"
            max="100"
            placeholder="90"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className="text-center mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVChargingCalculator.estimatedChargingTime', 'Estimated Charging Time')}</div>
                <div className="text-4xl font-bold text-green-500 flex items-center justify-center gap-2">
                  <Clock className="w-8 h-8" />
                  {result.chargingTimeFormatted}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {result.chargingSpeed} charging
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVChargingCalculator.energyNeeded', 'Energy Needed')}</span>
                </div>
                <div className="text-2xl font-bold text-yellow-500">{result.energyNeeded.toFixed(1)} kWh</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVChargingCalculator.estimatedCost', 'Estimated Cost')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">{formatCurrency(result.estimatedCost)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.eVChargingCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.eVChargingCalculator.chargingTo80IsFaster', 'Charging to 80% is faster and better for battery health')}</li>
                <li>{t('tools.eVChargingCalculator.dcFastChargingSlowsDown', 'DC fast charging slows down significantly above 80%')}</li>
                <li>{t('tools.eVChargingCalculator.homeChargingOvernightWithLevel', 'Home charging overnight with Level 2 is most cost-effective')}</li>
                <li>{t('tools.eVChargingCalculator.coldWeatherCanReduceCharging', 'Cold weather can reduce charging efficiency by 10-20%')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVChargingCalculatorTool;
