import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Fuel, DollarSign, Users, Car, Route, Info, Sparkles, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TripLeg {
  id: string;
  from: string;
  to: string;
  distance: number;
  gasPrice: number;
}

interface RoadTripCostToolProps {
  uiConfig?: UIConfig;
}

export const RoadTripCostTool: React.FC<RoadTripCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'simple' | 'multi-leg'>('simple');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

  // Simple mode
  const [distance, setDistance] = useState('500');
  const [mpg, setMpg] = useState('28');
  const [gasPrice, setGasPrice] = useState('3.50');
  const [passengers, setPassengers] = useState('1');
  const [roundTrip, setRoundTrip] = useState(false);

  // Additional costs
  const [includeTolls, setIncludeTolls] = useState(false);
  const [tollsCost, setTollsCost] = useState('20');
  const [includeFood, setIncludeFood] = useState(false);
  const [foodCost, setFoodCost] = useState('50');
  const [includeLodging, setIncludeLodging] = useState(false);
  const [lodgingCost, setLodgingCost] = useState('150');
  const [includeParking, setIncludeParking] = useState(false);
  const [parkingCost, setParkingCost] = useState('25');

  // Multi-leg mode
  const [legs, setLegs] = useState<TripLeg[]>([]);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newDistance, setNewDistance] = useState('');
  const [newGasPrice, setNewGasPrice] = useState('3.50');

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.distance !== undefined || params.miles !== undefined) {
        setDistance(String(params.distance || params.miles));
        setIsPrefilled(true);
      }
      if (params.mpg !== undefined) {
        setMpg(String(params.mpg));
        setIsPrefilled(true);
      }
      if (params.gasPrice !== undefined || params.fuelPrice !== undefined) {
        setGasPrice(String(params.gasPrice || params.fuelPrice));
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

  // Simple calculation
  const simpleCalc = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const fuelEfficiency = parseFloat(mpg) || 1;
    const price = parseFloat(gasPrice) || 0;
    const numPassengers = parseInt(passengers) || 1;

    const totalDistance = roundTrip ? dist * 2 : dist;

    let fuelNeeded: number;
    let fuelCost: number;

    if (unit === 'imperial') {
      fuelNeeded = totalDistance / fuelEfficiency;
    } else {
      // L/100km mode
      fuelNeeded = (fuelEfficiency / 100) * totalDistance;
    }
    fuelCost = fuelNeeded * price;

    // Additional costs
    let additionalCosts = 0;
    if (includeTolls) additionalCosts += parseFloat(tollsCost) || 0;
    if (includeFood) additionalCosts += parseFloat(foodCost) || 0;
    if (includeLodging) additionalCosts += parseFloat(lodgingCost) || 0;
    if (includeParking) additionalCosts += parseFloat(parkingCost) || 0;

    const totalCost = fuelCost + additionalCosts;
    const costPerPerson = totalCost / numPassengers;
    const costPerMile = totalDistance > 0 ? totalCost / totalDistance : 0;

    // Time estimate (assuming avg 55 mph)
    const avgSpeed = unit === 'imperial' ? 55 : 90;
    const driveTimeHours = totalDistance / avgSpeed;

    return {
      totalDistance,
      fuelNeeded,
      fuelCost,
      additionalCosts,
      totalCost,
      costPerPerson,
      costPerMile,
      driveTimeHours,
      fuelUnit: unit === 'imperial' ? 'gallons' : 'liters',
      distanceUnit: unit === 'imperial' ? 'miles' : 'km',
    };
  }, [distance, mpg, gasPrice, passengers, roundTrip, unit, includeTolls, tollsCost, includeFood, foodCost, includeLodging, lodgingCost, includeParking, parkingCost]);

  // Multi-leg calculation
  const multiLegCalc = useMemo(() => {
    if (legs.length === 0) return null;

    const fuelEfficiency = parseFloat(mpg) || 1;
    const numPassengers = parseInt(passengers) || 1;

    let totalDistance = 0;
    let totalFuelCost = 0;

    legs.forEach((leg) => {
      totalDistance += leg.distance;
      const fuelNeeded = leg.distance / fuelEfficiency;
      totalFuelCost += fuelNeeded * leg.gasPrice;
    });

    let additionalCosts = 0;
    if (includeTolls) additionalCosts += parseFloat(tollsCost) || 0;
    if (includeFood) additionalCosts += parseFloat(foodCost) || 0;
    if (includeLodging) additionalCosts += parseFloat(lodgingCost) || 0;
    if (includeParking) additionalCosts += parseFloat(parkingCost) || 0;

    const totalCost = totalFuelCost + additionalCosts;
    const costPerPerson = totalCost / numPassengers;
    const driveTimeHours = totalDistance / 55;

    return {
      totalDistance,
      totalFuelCost,
      additionalCosts,
      totalCost,
      costPerPerson,
      driveTimeHours,
      legCount: legs.length,
    };
  }, [legs, mpg, passengers, includeTolls, tollsCost, includeFood, foodCost, includeLodging, lodgingCost, includeParking, parkingCost]);

  const addLeg = () => {
    if (!newFrom || !newTo || !newDistance) return;

    setLegs([
      ...legs,
      {
        id: Date.now().toString(),
        from: newFrom,
        to: newTo,
        distance: parseFloat(newDistance) || 0,
        gasPrice: parseFloat(newGasPrice) || 0,
      },
    ]);
    setNewFrom(newTo);
    setNewTo('');
    setNewDistance('');
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter((l) => l.id !== id));
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const vehiclePresets = [
    { name: 'Compact', mpg: 32 },
    { name: 'Sedan', mpg: 28 },
    { name: 'SUV', mpg: 23 },
    { name: 'Truck', mpg: 18 },
    { name: 'Hybrid', mpg: 48 },
    { name: 'Minivan', mpg: 24 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Route className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roadTripCost.roadTripCostCalculator', 'Road Trip Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roadTripCost.estimateTotalTripCostsIncluding', 'Estimate total trip costs including fuel and more')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.roadTripCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('simple')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'simple' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Calculator className="w-4 h-4" /> Simple Trip
          </button>
          <button
            onClick={() => setMode('multi-leg')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'multi-leg' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> Multi-Stop
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('tools.roadTripCost.milesGallons', 'Miles / Gallons')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('tools.roadTripCost.kmLiters', 'Km / Liters')}
          </button>
        </div>

        {mode === 'simple' ? (
          <>
            {/* Simple Trip Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Distance ({simpleCalc.distanceUnit})
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
                  {unit === 'imperial' ? t('tools.roadTripCost.mpg', 'MPG') : t('tools.roadTripCost.l100km', 'L/100km')}
                </label>
                <input
                  type="number"
                  value={mpg}
                  onChange={(e) => setMpg(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Fuel className="w-4 h-4 inline mr-1" />
                  Gas Price (${unit === 'imperial' ? '/gal' : '/L'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('tools.roadTripCost.passengers', 'Passengers')}
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
                className="w-4 h-4 rounded text-teal-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Route className="w-4 h-4 inline mr-1" />
                {t('tools.roadTripCost.roundTripDoubleTheDistance', 'Round trip (double the distance)')}
              </span>
            </label>

            {/* Vehicle Presets */}
            <div className="flex gap-2 flex-wrap">
              {vehiclePresets.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setMpg(v.mpg.toString())}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    parseFloat(mpg) === v.mpg
                      ? 'bg-teal-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Multi-leg Input */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roadTripCost.addTripLeg', 'Add Trip Leg')}</h4>
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  value={newFrom}
                  onChange={(e) => setNewFrom(e.target.value)}
                  placeholder={t('tools.roadTripCost.from', 'From')}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  placeholder="To"
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="number"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  placeholder={t('tools.roadTripCost.miles', 'Miles')}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="number"
                  step="0.01"
                  value={newGasPrice}
                  onChange={(e) => setNewGasPrice(e.target.value)}
                  placeholder={t('tools.roadTripCost.gal', '$/gal')}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={addLeg}
                  disabled={!newFrom || !newTo || !newDistance}
                  className="py-2 bg-teal-500 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {t('tools.roadTripCost.add', 'Add')}
                </button>
              </div>
            </div>

            {/* Legs List */}
            {legs.length > 0 && (
              <div className="space-y-2">
                {legs.map((leg, idx) => (
                  <div key={leg.id} className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {leg.from} to {leg.to}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {leg.distance} mi @ ${leg.gasPrice.toFixed(2)}/gal
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeLeg(leg.id)}
                      className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      {t('tools.roadTripCost.remove', 'Remove')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* MPG Input for multi-leg */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Car className="w-4 h-4 inline mr-1" />
                  {t('tools.roadTripCost.vehicleMpg', 'Vehicle MPG')}
                </label>
                <input
                  type="number"
                  value={mpg}
                  onChange={(e) => setMpg(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('tools.roadTripCost.passengers2', 'Passengers')}
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
          </>
        )}

        {/* Additional Costs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.roadTripCost.additionalCostsOptional', 'Additional Costs (Optional)')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTolls}
                onChange={(e) => setIncludeTolls(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500"
              />
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roadTripCost.tolls', 'Tolls')}</label>
              {includeTolls && (
                <input
                  type="number"
                  value={tollsCost}
                  onChange={(e) => setTollsCost(e.target.value)}
                  className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeFood}
                onChange={(e) => setIncludeFood(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500"
              />
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roadTripCost.food', 'Food')}</label>
              {includeFood && (
                <input
                  type="number"
                  value={foodCost}
                  onChange={(e) => setFoodCost(e.target.value)}
                  className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeLodging}
                onChange={(e) => setIncludeLodging(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500"
              />
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roadTripCost.lodging', 'Lodging')}</label>
              {includeLodging && (
                <input
                  type="number"
                  value={lodgingCost}
                  onChange={(e) => setLodgingCost(e.target.value)}
                  className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeParking}
                onChange={(e) => setIncludeParking(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500"
              />
              <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roadTripCost.parking', 'Parking')}</label>
              {includeParking && (
                <input
                  type="number"
                  value={parkingCost}
                  onChange={(e) => setParkingCost(e.target.value)}
                  className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {mode === 'simple' ? (
          <>
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.totalTripCost', 'Total Trip Cost')}</div>
              <div className="text-5xl font-bold text-teal-500 my-2">
                ${simpleCalc.totalCost.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {simpleCalc.totalDistance.toLocaleString()} {simpleCalc.distanceUnit} • ~{formatTime(simpleCalc.driveTimeHours)} drive time
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.fuelCost', 'Fuel Cost')}</div>
                <div className="text-xl font-bold text-teal-500">${simpleCalc.fuelCost.toFixed(2)}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {simpleCalc.fuelNeeded.toFixed(1)} {simpleCalc.fuelUnit}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.perPerson', 'Per Person')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${simpleCalc.costPerPerson.toFixed(2)}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.perMile', 'Per Mile')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${simpleCalc.costPerMile.toFixed(3)}
                </div>
              </div>
            </div>
          </>
        ) : multiLegCalc ? (
          <>
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.totalTripCost2', 'Total Trip Cost')}</div>
              <div className="text-5xl font-bold text-teal-500 my-2">
                ${multiLegCalc.totalCost.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {multiLegCalc.legCount} stops • {multiLegCalc.totalDistance.toLocaleString()} miles • ~{formatTime(multiLegCalc.driveTimeHours)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.fuelCost2', 'Fuel Cost')}</div>
                <div className="text-xl font-bold text-teal-500">${multiLegCalc.totalFuelCost.toFixed(2)}</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roadTripCost.perPerson2', 'Per Person')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${multiLegCalc.costPerPerson.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.roadTripCost.addTripLegsToCalculate', 'Add trip legs to calculate costs')}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.roadTripCost.roadTripTips', 'Road Trip Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.roadTripCost.checkGasPricesAlongYour', 'Check gas prices along your route with apps like GasBuddy')}</li>
                <li>{t('tools.roadTripCost.fillUpBeforeEnteringExpensive', 'Fill up before entering expensive areas (cities, highways)')}</li>
                <li>{t('tools.roadTripCost.considerTollFreeRoutesFor', 'Consider toll-free routes for longer trips')}</li>
                <li>{t('tools.roadTripCost.planRestStopsEvery2', 'Plan rest stops every 2-3 hours for safety')}</li>
                <li>{t('tools.roadTripCost.splitCostsAmongPassengersTo', 'Split costs among passengers to save money')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadTripCostTool;
