import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Battery, Car, Thermometer, Wind, MapPin, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RangeResult {
  estimatedRange: number;
  efficiency: number;
  rangeReduction: number;
  adjustedEfficiency: number;
}

interface EVRangeCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const EVRangeCalculatorTool: React.FC<EVRangeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [batteryCapacity, setBatteryCapacity] = useState('75');
  const [currentCharge, setCurrentCharge] = useState('100');
  const [efficiency, setEfficiency] = useState('3.5');
  const [temperature, setTemperature] = useState('70');
  const [hvacUsage, setHvacUsage] = useState('moderate');
  const [drivingStyle, setDrivingStyle] = useState('normal');
  const [terrain, setTerrain] = useState('flat');
  const [speed, setSpeed] = useState('highway');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // EV model presets with efficiency ratings
  const evPresets = [
    { name: 'Tesla Model 3 LR', capacity: 82, efficiency: 4.0 },
    { name: 'Tesla Model Y', capacity: 75, efficiency: 3.5 },
    { name: 'Tesla Model S', capacity: 100, efficiency: 3.2 },
    { name: 'Chevy Bolt', capacity: 65, efficiency: 3.8 },
    { name: 'Ford Mach-E', capacity: 88, efficiency: 3.1 },
    { name: 'Rivian R1T', capacity: 135, efficiency: 2.3 },
    { name: 'Lucid Air', capacity: 112, efficiency: 4.6 },
    { name: 'BMW iX', capacity: 105, efficiency: 2.8 },
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
      if (params.efficiency !== undefined) {
        setEfficiency(String(params.efficiency));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<RangeResult | null>(() => {
    const capacity = parseFloat(batteryCapacity) || 0;
    const charge = parseFloat(currentCharge) || 0;
    const baseEfficiency = parseFloat(efficiency) || 0;
    const temp = parseFloat(temperature) || 70;

    if (capacity <= 0 || baseEfficiency <= 0) {
      return null;
    }

    // Calculate available energy
    const availableEnergy = capacity * (charge / 100);

    // Calculate temperature impact (efficiency drops in cold/hot weather)
    let tempFactor = 1;
    if (temp < 32) {
      tempFactor = 0.65; // Cold weather reduces range significantly
    } else if (temp < 50) {
      tempFactor = 0.80;
    } else if (temp < 60) {
      tempFactor = 0.90;
    } else if (temp > 95) {
      tempFactor = 0.92; // Hot weather also reduces range slightly
    } else if (temp > 85) {
      tempFactor = 0.96;
    }

    // HVAC usage impact
    let hvacFactor = 1;
    if (hvacUsage === 'off') hvacFactor = 1.05;
    else if (hvacUsage === 'light') hvacFactor = 0.97;
    else if (hvacUsage === 'moderate') hvacFactor = 0.93;
    else if (hvacUsage === 'heavy') hvacFactor = 0.85;

    // Driving style impact
    let styleFactor = 1;
    if (drivingStyle === 'eco') styleFactor = 1.15;
    else if (drivingStyle === 'normal') styleFactor = 1;
    else if (drivingStyle === 'spirited') styleFactor = 0.82;

    // Terrain impact
    let terrainFactor = 1;
    if (terrain === 'flat') terrainFactor = 1;
    else if (terrain === 'hilly') terrainFactor = 0.88;
    else if (terrain === 'mountainous') terrainFactor = 0.75;

    // Speed impact
    let speedFactor = 1;
    if (speed === 'city') speedFactor = 1.10;
    else if (speed === 'mixed') speedFactor = 1;
    else if (speed === 'highway') speedFactor = 0.85;
    else if (speed === 'high-speed') speedFactor = 0.70;

    // Calculate adjusted efficiency
    const totalFactor = tempFactor * hvacFactor * styleFactor * terrainFactor * speedFactor;
    const adjustedEfficiency = baseEfficiency * totalFactor;

    // Calculate estimated range
    const estimatedRange = availableEnergy * adjustedEfficiency;
    const rangeReduction = ((1 - totalFactor) * 100);

    return {
      estimatedRange,
      efficiency: baseEfficiency,
      rangeReduction,
      adjustedEfficiency,
    };
  }, [batteryCapacity, currentCharge, efficiency, temperature, hvacUsage, drivingStyle, terrain, speed]);

  const selectPreset = (preset: { name: string; capacity: number; efficiency: number }) => {
    setBatteryCapacity(preset.capacity.toString());
    setEfficiency(preset.efficiency.toString());
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Car className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVRangeCalculator.evRangeCalculator', 'EV Range Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eVRangeCalculator.estimateYourElectricVehicleRange', 'Estimate your electric vehicle range')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.eVRangeCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* EV Model Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eVRangeCalculator.quickSelectEvModel', 'Quick Select EV Model')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {evPresets.slice(0, 8).map((ev) => (
              <button
                key={ev.name}
                onClick={() => selectPreset(ev)}
                className={`py-2 px-2 text-xs rounded-lg transition-colors ${
                  parseFloat(batteryCapacity) === ev.capacity && parseFloat(efficiency) === ev.efficiency
                    ? 'bg-blue-500 text-white'
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

        {/* Battery Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Battery className="w-4 h-4 inline mr-1" />
              {t('tools.eVRangeCalculator.batteryCapacityKwh', 'Battery Capacity (kWh)')}
            </label>
            <input
              type="number"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(e.target.value)}
              placeholder="75"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVRangeCalculator.currentCharge', 'Current Charge (%)')}
            </label>
            <input
              type="number"
              value={currentCharge}
              onChange={(e) => setCurrentCharge(e.target.value)}
              min="0"
              max="100"
              placeholder="100"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Efficiency */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eVRangeCalculator.baseEfficiencyMiKwh', 'Base Efficiency (mi/kWh)')}
          </label>
          <input
            type="number"
            value={efficiency}
            onChange={(e) => setEfficiency(e.target.value)}
            step="0.1"
            placeholder="3.5"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.eVRangeCalculator.outsideTemperatureF', 'Outside Temperature (F)')}
          </label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="70"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <div className="flex gap-2">
            {[20, 40, 60, 80, 95].map((temp) => (
              <button
                key={temp}
                onClick={() => setTemperature(temp.toString())}
                className={`flex-1 py-1.5 text-xs rounded-lg ${
                  parseFloat(temperature) === temp
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {temp}F
              </button>
            ))}
          </div>
        </div>

        {/* HVAC Usage */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Wind className="w-4 h-4 inline mr-1" />
            {t('tools.eVRangeCalculator.hvacUsage', 'HVAC Usage')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['off', 'light', 'moderate', 'heavy'].map((level) => (
              <button
                key={level}
                onClick={() => setHvacUsage(level)}
                className={`py-2 px-3 text-sm rounded-lg capitalize ${
                  hvacUsage === level
                    ? 'bg-blue-500 text-white'
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

        {/* Driving Style */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eVRangeCalculator.drivingStyle', 'Driving Style')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'eco', label: 'Eco' },
              { value: 'normal', label: 'Normal' },
              { value: 'spirited', label: 'Spirited' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setDrivingStyle(style.value)}
                className={`py-2 px-3 text-sm rounded-lg ${
                  drivingStyle === style.value
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terrain */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('tools.eVRangeCalculator.terrain', 'Terrain')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'flat', label: 'Flat' },
              { value: 'hilly', label: 'Hilly' },
              { value: 'mountainous', label: 'Mountain' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTerrain(t.value)}
                className={`py-2 px-3 text-sm rounded-lg ${
                  terrain === t.value
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eVRangeCalculator.drivingSpeed', 'Driving Speed')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'city', label: 'City' },
              { value: 'mixed', label: 'Mixed' },
              { value: 'highway', label: 'Highway' },
              { value: 'high-speed', label: '80+ mph' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className={`py-2 px-3 text-sm rounded-lg ${
                  speed === s.value
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="text-center mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVRangeCalculator.estimatedRange', 'Estimated Range')}</div>
                <div className="text-5xl font-bold text-blue-500 flex items-center justify-center gap-2">
                  <MapPin className="w-10 h-10" />
                  {Math.round(result.estimatedRange)} mi
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ~{Math.round(result.estimatedRange * 1.609)} km
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVRangeCalculator.adjustedEfficiency', 'Adjusted Efficiency')}</div>
                <div className="text-2xl font-bold text-green-500">
                  {result.adjustedEfficiency.toFixed(2)} mi/kWh
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVRangeCalculator.rangeImpact', 'Range Impact')}</div>
                <div className={`text-2xl font-bold ${result.rangeReduction > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {result.rangeReduction > 0 ? '-' : '+'}{Math.abs(result.rangeReduction).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Range Bar */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVRangeCalculator.rangeEstimate', 'Range Estimate')}</span>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {Math.round(result.estimatedRange)} miles
                </span>
              </div>
              <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                  style={{ width: `${Math.min(100, (result.estimatedRange / 400) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>0</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>400 mi</span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.eVRangeCalculator.factorsAffectingRange', 'Factors affecting range:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.eVRangeCalculator.coldWeatherBelow32fCan', 'Cold weather below 32F can reduce range by up to 35%')}</li>
                <li>{t('tools.eVRangeCalculator.highSpeedDrivingSignificantlyReduces', 'High-speed driving significantly reduces efficiency')}</li>
                <li>{t('tools.eVRangeCalculator.airConditioningUsesLessEnergy', 'Air conditioning uses less energy than heating')}</li>
                <li>{t('tools.eVRangeCalculator.actualRangeMayVaryBased', 'Actual range may vary based on driving conditions')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVRangeCalculatorTool;
