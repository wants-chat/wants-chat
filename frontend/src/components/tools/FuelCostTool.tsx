import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fuel, Car, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type DistanceUnit = 'km' | 'miles';
type FuelUnit = 'liters' | 'gallons';
type EfficiencyUnit = 'km/l' | 'mpg' | 'l/100km';

interface FuelCostToolProps {
  uiConfig?: UIConfig;
}

export const FuelCostTool: React.FC<FuelCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [distance, setDistance] = useState('100');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [efficiency, setEfficiency] = useState('12');
  const [efficiencyUnit, setEfficiencyUnit] = useState<EfficiencyUnit>('km/l');
  const [fuelPrice, setFuelPrice] = useState('1.50');
  const [fuelUnit, setFuelUnit] = useState<FuelUnit>('liters');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setDistance(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setDistance(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setFuelPrice(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const eff = parseFloat(efficiency) || 0;
    const price = parseFloat(fuelPrice) || 0;

    if (eff === 0) return { fuelNeeded: 0, totalCost: 0, costPerKm: 0, costPerMile: 0 };

    // Convert distance to km
    let distKm = distanceUnit === 'miles' ? dist * 1.60934 : dist;

    // Convert efficiency to km/l
    let effKmL = eff;
    if (efficiencyUnit === 'mpg') {
      effKmL = eff * 0.425144; // mpg to km/l
    } else if (efficiencyUnit === 'l/100km') {
      effKmL = 100 / eff; // l/100km to km/l
    }

    // Calculate fuel needed in liters
    let fuelNeededL = distKm / effKmL;

    // Convert to gallons if needed for display
    let fuelNeeded = fuelUnit === 'gallons' ? fuelNeededL * 0.264172 : fuelNeededL;

    // Calculate total cost
    let totalCost = fuelNeeded * price;

    // Cost per distance
    let costPerKm = totalCost / distKm;
    let costPerMile = costPerKm * 1.60934;

    return {
      fuelNeeded,
      totalCost,
      costPerKm,
      costPerMile,
      distKm,
      distMiles: distKm * 0.621371,
    };
  }, [distance, distanceUnit, efficiency, efficiencyUnit, fuelPrice, fuelUnit]);

  const handleCopy = () => {
    const text = `Fuel Cost Estimate
Distance: ${distance} ${distanceUnit}
Fuel Efficiency: ${efficiency} ${efficiencyUnit}
Fuel Price: $${fuelPrice} per ${fuelUnit === 'liters' ? 'liter' : 'gallon'}
---
Fuel Needed: ${calculations.fuelNeeded.toFixed(2)} ${fuelUnit}
Total Cost: $${calculations.totalCost.toFixed(2)}
Cost per km: $${calculations.costPerKm.toFixed(4)}
Cost per mile: $${calculations.costPerMile.toFixed(4)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vehiclePresets = [
    { label: 'Compact Car', efficiency: 15, unit: 'km/l' as EfficiencyUnit },
    { label: 'Sedan', efficiency: 12, unit: 'km/l' as EfficiencyUnit },
    { label: 'SUV', efficiency: 9, unit: 'km/l' as EfficiencyUnit },
    { label: 'Truck', efficiency: 7, unit: 'km/l' as EfficiencyUnit },
    { label: 'Hybrid', efficiency: 20, unit: 'km/l' as EfficiencyUnit },
    { label: 'Sports Car', efficiency: 8, unit: 'km/l' as EfficiencyUnit },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Fuel className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fuelCost.fuelCostCalculator', 'Fuel Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fuelCost.estimateYourTripFuelExpenses', 'Estimate your trip fuel expenses')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.fuelCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Distance */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fuelCost.tripDistance', 'Trip Distance')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
              className={`px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="km">km</option>
              <option value="miles">miles</option>
            </select>
          </div>
        </div>

        {/* Vehicle Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fuelCost.vehicleTypeSetsAverageEfficiency', 'Vehicle Type (sets average efficiency)')}
          </label>
          <div className="flex flex-wrap gap-2">
            {vehiclePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setEfficiency(preset.efficiency.toString());
                  setEfficiencyUnit(preset.unit);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Car className="w-3 h-3" />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fuelCost.fuelEfficiency', 'Fuel Efficiency')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <select
              value={efficiencyUnit}
              onChange={(e) => setEfficiencyUnit(e.target.value as EfficiencyUnit)}
              className={`px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="km/l">km/L</option>
              <option value="mpg">{t('tools.fuelCost.mpg', 'MPG')}</option>
              <option value="l/100km">{t('tools.fuelCost.l100km', 'L/100km')}</option>
            </select>
          </div>
        </div>

        {/* Fuel Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fuelCost.fuelPrice', 'Fuel Price')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                step="0.01"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                className={`w-full pl-7 pr-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <select
              value={fuelUnit}
              onChange={(e) => setFuelUnit(e.target.value as FuelUnit)}
              className={`px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="liters">{t('tools.fuelCost.perLiter', 'per Liter')}</option>
              <option value="gallons">{t('tools.fuelCost.perGallon', 'per Gallon')}</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {t('tools.fuelCost.tripCostEstimate', 'Trip Cost Estimate')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.fuelCost.copied', 'Copied!') : t('tools.fuelCost.copy', 'Copy')}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{t('tools.fuelCost.totalFuelCost', 'Total Fuel Cost')}</div>
            <div className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totalCost.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCost.fuelNeeded', 'Fuel Needed')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.fuelNeeded.toFixed(2)} {fuelUnit === 'liters' ? 'L' : 'gal'}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCost.distance', 'Distance')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.distKm.toFixed(1)} km
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCost.costKm', 'Cost/km')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.costPerKm.toFixed(3)}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCost.costMile', 'Cost/mile')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.costPerMile.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.fuelCost.fuelSavingTips', 'Fuel-Saving Tips:')}</strong> Keep tires properly inflated, avoid aggressive acceleration,
            use cruise control on highways, and remove unnecessary weight from your vehicle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FuelCostTool;
