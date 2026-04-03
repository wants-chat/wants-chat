import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fuel, Car, MapPin, DollarSign, Route, Users, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FuelCostCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const FuelCostCalculatorTool: React.FC<FuelCostCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [unit, setUnit] = useState<'us' | 'metric'>('us');
  const [distance, setDistance] = useState('300');
  const [fuelEfficiency, setFuelEfficiency] = useState('30');
  const [fuelPrice, setFuelPrice] = useState('3.50');
  const [passengers, setPassengers] = useState('1');
  const [roundTrip, setRoundTrip] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        setIsPrefilled(true);
      }
      if (params.fuelEfficiency !== undefined || params.mpg !== undefined) {
        setFuelEfficiency(String(params.fuelEfficiency || params.mpg));
        setIsPrefilled(true);
      }
      if (params.fuelPrice !== undefined || params.gasPrice !== undefined) {
        setFuelPrice(String(params.fuelPrice || params.gasPrice));
        setIsPrefilled(true);
      }
      if (params.passengers !== undefined) {
        setPassengers(String(params.passengers));
        setIsPrefilled(true);
      }
      if (params.roundTrip !== undefined) {
        setRoundTrip(Boolean(params.roundTrip));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const efficiency = parseFloat(fuelEfficiency) || 1;
    const price = parseFloat(fuelPrice) || 0;
    const numPassengers = parseInt(passengers) || 1;
    const totalDistance = roundTrip ? dist * 2 : dist;

    let fuelNeeded: number;
    let totalCost: number;

    if (unit === 'us') {
      // MPG calculation
      fuelNeeded = totalDistance / efficiency; // gallons
    } else {
      // L/100km calculation
      fuelNeeded = (efficiency / 100) * totalDistance; // liters
    }

    totalCost = fuelNeeded * price;
    const costPerPerson = totalCost / numPassengers;
    const costPerMile = efficiency > 0 ? price / efficiency : 0;
    const costPerKm = unit === 'metric' ? (efficiency * price) / 100 : (price / efficiency) * 0.621371;

    return {
      totalDistance,
      fuelNeeded,
      totalCost,
      costPerPerson,
      costPerMile: unit === 'us' ? costPerMile : costPerKm,
      distanceUnit: unit === 'us' ? 'miles' : 'km',
      fuelUnit: unit === 'us' ? 'gallons' : 'liters',
      efficiencyUnit: unit === 'us' ? 'MPG' : 'L/100km',
    };
  }, [unit, distance, fuelEfficiency, fuelPrice, passengers, roundTrip]);

  const vehiclePresets = [
    { name: 'Compact Car', mpg: 35, lPer100: 6.7 },
    { name: 'Sedan', mpg: 30, lPer100: 7.8 },
    { name: 'SUV', mpg: 25, lPer100: 9.4 },
    { name: 'Truck', mpg: 18, lPer100: 13.1 },
    { name: 'Hybrid', mpg: 50, lPer100: 4.7 },
    { name: 'Electric (MPGe)', mpg: 110, lPer100: 2.1 },
  ];

  const applyPreset = (preset: typeof vehiclePresets[0]) => {
    setFuelEfficiency(unit === 'us' ? preset.mpg.toString() : preset.lPer100.toString());
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg"><Fuel className="w-5 h-5 text-amber-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fuelCostCalculator.fuelCostCalculator', 'Fuel Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fuelCostCalculator.estimateYourTripFuelCosts', 'Estimate your trip fuel costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.fuelCostCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('us')}
            className={`flex-1 py-2 rounded-lg ${unit === 'us' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.fuelCostCalculator.milesGallons', 'Miles / Gallons')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg ${unit === 'metric' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.fuelCostCalculator.kilometersLiters', 'Kilometers / Liters')}
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              Distance ({calculations.distanceUnit})
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Car className="w-4 h-4 inline mr-1" />
              Fuel Efficiency ({calculations.efficiencyUnit})
            </label>
            <input
              type="number"
              value={fuelEfficiency}
              onChange={(e) => setFuelEfficiency(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              Fuel Price (per {unit === 'us' ? 'gallon' : 'liter'})
            </label>
            <input
              type="number"
              step="0.01"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.fuelCostCalculator.passengers', 'Passengers')}
            </label>
            <input
              type="number"
              min="1"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Round Trip Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={roundTrip}
            onChange={(e) => setRoundTrip(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500"
          />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Route className="w-4 h-4 inline mr-1" />
            {t('tools.fuelCostCalculator.roundTrip', 'Round trip')}
          </span>
        </label>

        {/* Vehicle Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fuelCostCalculator.vehicleType', 'Vehicle Type')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {vehiclePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCostCalculator.totalTripCost', 'Total Trip Cost')}</div>
          <div className="text-5xl font-bold text-amber-500 my-2">
            ${calculations.totalCost.toFixed(2)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.totalDistance} {calculations.distanceUnit} • {calculations.fuelNeeded.toFixed(1)} {calculations.fuelUnit}
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCostCalculator.fuelNeeded', 'Fuel Needed')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.fuelNeeded.toFixed(1)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.fuelUnit}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cost per {unit === 'us' ? 'Mile' : 'KM'}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.costPerMile.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fuelCostCalculator.perPerson', 'Per Person')}</div>
            <div className="text-2xl font-bold text-amber-500">
              ${calculations.costPerPerson.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fuelCostCalculator.saveOnFuel', 'Save on Fuel')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Keep tires properly inflated</li>
            <li>• Drive at steady speeds, use cruise control</li>
            <li>• Avoid aggressive acceleration and braking</li>
            <li>• Remove unnecessary weight from vehicle</li>
            <li>• Use apps to find cheapest gas stations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FuelCostCalculatorTool;
