import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fuel, Truck, Plus, Trash2, Calculator, Sparkles, DollarSign, TrendingUp, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FleetFuelCostToolProps {
  uiConfig?: UIConfig;
}

interface Vehicle {
  id: string;
  name: string;
  mpg: string;
  dailyMiles: string;
  daysPerWeek: string;
}

export const FleetFuelCostTool: React.FC<FleetFuelCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [fuelPrice, setFuelPrice] = useState('3.50');
  const [unit, setUnit] = useState<'us' | 'metric'>('us');
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', name: 'Delivery Van 1', mpg: '18', dailyMiles: '150', daysPerWeek: '5' },
    { id: '2', name: 'Box Truck', mpg: '12', dailyMiles: '200', daysPerWeek: '5' },
  ]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.fuelPrice !== undefined || params.gasPrice !== undefined) {
        setFuelPrice(String(params.fuelPrice || params.gasPrice));
        setIsPrefilled(true);
      }
      if (params.vehicles !== undefined && Array.isArray(params.vehicles)) {
        setVehicles(params.vehicles.map((v: any, idx: number) => ({
          id: String(idx + 1),
          name: v.name || `Vehicle ${idx + 1}`,
          mpg: String(v.mpg || 15),
          dailyMiles: String(v.dailyMiles || 100),
          daysPerWeek: String(v.daysPerWeek || 5),
        })));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addVehicle = () => {
    setVehicles([...vehicles, {
      id: Date.now().toString(),
      name: `Vehicle ${vehicles.length + 1}`,
      mpg: '15',
      dailyMiles: '100',
      daysPerWeek: '5',
    }]);
  };

  const removeVehicle = (id: string) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const updateVehicle = (id: string, field: keyof Vehicle, value: string) => {
    setVehicles(vehicles.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const vehiclePresets = [
    { name: 'Compact Van', mpg: 22 },
    { name: 'Cargo Van', mpg: 18 },
    { name: 'Box Truck', mpg: 12 },
    { name: 'Semi Truck', mpg: 6 },
    { name: 'Pickup Truck', mpg: 16 },
    { name: 'Sprinter Van', mpg: 15 },
  ];

  const calculations = useMemo(() => {
    const price = parseFloat(fuelPrice) || 0;

    const vehicleCalcs = vehicles.map(vehicle => {
      let mpg = parseFloat(vehicle.mpg) || 1;
      let dailyMiles = parseFloat(vehicle.dailyMiles) || 0;
      const daysPerWeek = parseInt(vehicle.daysPerWeek) || 0;

      // Convert if metric
      if (unit === 'metric') {
        // L/100km to MPG: MPG = 235.215 / (L/100km)
        mpg = 235.215 / mpg;
        // km to miles
        dailyMiles = dailyMiles * 0.621371;
      }

      const dailyGallons = dailyMiles / mpg;
      const dailyCost = dailyGallons * price;
      const weeklyCost = dailyCost * daysPerWeek;
      const monthlyCost = weeklyCost * 4.33;
      const yearlyCost = weeklyCost * 52;

      return {
        id: vehicle.id,
        name: vehicle.name,
        dailyGallons,
        dailyCost,
        weeklyCost,
        monthlyCost,
        yearlyCost,
        weeklyMiles: dailyMiles * daysPerWeek,
        yearlyMiles: dailyMiles * daysPerWeek * 52,
      };
    });

    const totals = vehicleCalcs.reduce((acc, v) => ({
      dailyCost: acc.dailyCost + v.dailyCost,
      weeklyCost: acc.weeklyCost + v.weeklyCost,
      monthlyCost: acc.monthlyCost + v.monthlyCost,
      yearlyCost: acc.yearlyCost + v.yearlyCost,
      dailyGallons: acc.dailyGallons + v.dailyGallons,
      weeklyMiles: acc.weeklyMiles + v.weeklyMiles,
      yearlyMiles: acc.yearlyMiles + v.yearlyMiles,
    }), { dailyCost: 0, weeklyCost: 0, monthlyCost: 0, yearlyCost: 0, dailyGallons: 0, weeklyMiles: 0, yearlyMiles: 0 });

    const costPerMile = totals.yearlyMiles > 0 ? totals.yearlyCost / totals.yearlyMiles : 0;

    return {
      vehicles: vehicleCalcs,
      totals,
      costPerMile,
      vehicleCount: vehicles.length,
    };
  }, [vehicles, fuelPrice, unit]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Fuel className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fleetFuelCost.fleetFuelCostCalculator', 'Fleet Fuel Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fleetFuelCost.calculateFuelCostsForYour', 'Calculate fuel costs for your entire fleet')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.fleetFuelCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('us')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'us' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.fleetFuelCost.usMpgGallons', 'US (MPG / Gallons)')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.fleetFuelCost.metricL100km', 'Metric (L/100km)')}
          </button>
        </div>

        {/* Fuel Price */}
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
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* Vehicle Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.fleetFuelCost.quickAddVehicleType', 'Quick Add Vehicle Type')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {vehiclePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setVehicles([...vehicles, {
                    id: Date.now().toString(),
                    name: preset.name,
                    mpg: unit === 'us' ? preset.mpg.toString() : (235.215 / preset.mpg).toFixed(1),
                    dailyMiles: '100',
                    daysPerWeek: '5',
                  }]);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Truck className="w-4 h-4 inline mr-1" />
              Fleet Vehicles ({vehicles.length})
            </label>
            <button
              onClick={addVehicle}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.fleetFuelCost.addVehicle', 'Add Vehicle')}
            </button>
          </div>

          {vehicles.map((vehicle) => {
            const calc = calculations.vehicles.find(v => v.id === vehicle.id);
            return (
              <div key={vehicle.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={vehicle.name}
                    onChange={(e) => updateVehicle(vehicle.id, 'name', e.target.value)}
                    className={`font-medium bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                  />
                  {vehicles.length > 1 && (
                    <button
                      onClick={() => removeVehicle(vehicle.id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <input
                      type="number"
                      value={vehicle.mpg}
                      onChange={(e) => updateVehicle(vehicle.id, 'mpg', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {unit === 'us' ? t('tools.fleetFuelCost.mpg', 'MPG') : t('tools.fleetFuelCost.l100km', 'L/100km')}
                    </span>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={vehicle.dailyMiles}
                      onChange={(e) => updateVehicle(vehicle.id, 'dailyMiles', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Daily {unit === 'us' ? 'Miles' : 'KM'}
                    </span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={vehicle.daysPerWeek}
                      onChange={(e) => updateVehicle(vehicle.id, 'daysPerWeek', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.fleetFuelCost.daysWeek', 'Days/Week')}</span>
                  </div>
                </div>
                {calc && (
                  <div className={`flex gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Daily: <span className="text-teal-500 font-medium">${calc.dailyCost.toFixed(2)}</span></span>
                    <span>Weekly: <span className="text-teal-500 font-medium">${calc.weeklyCost.toFixed(2)}</span></span>
                    <span>Monthly: <span className="text-teal-500 font-medium">${calc.monthlyCost.toFixed(2)}</span></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fleet Totals */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fleetFuelCost.annualFleetFuelCost', 'Annual Fleet Fuel Cost')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            ${calculations.totals.yearlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.vehicleCount} vehicles | {calculations.totals.yearlyMiles.toLocaleString()} miles/year
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fleetFuelCost.daily', 'Daily')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totals.dailyCost.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fleetFuelCost.weekly', 'Weekly')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totals.weeklyCost.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fleetFuelCost.monthly', 'Monthly')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totals.monthlyCost.toFixed(0)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fleetFuelCost.perMile', 'Per Mile')}</div>
            <div className="text-xl font-bold text-teal-500">
              ${calculations.costPerMile.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Vehicle Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-1" />
            {t('tools.fleetFuelCost.vehicleBreakdownAnnual', 'Vehicle Breakdown (Annual)')}
          </h4>
          <div className="space-y-2">
            {calculations.vehicles.map(v => {
              const pct = calculations.totals.yearlyCost > 0
                ? (v.yearlyCost / calculations.totals.yearlyCost) * 100
                : 0;
              return (
                <div key={v.id} className="flex items-center gap-3">
                  <span className={`flex-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{v.name}</span>
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-sm font-medium w-24 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${v.yearlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.fleetFuelCost.fleetFuelSavingsTips', 'Fleet Fuel Savings Tips')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('tools.fleetFuelCost.regularMaintenanceImprovesFuelEfficiency', 'Regular maintenance improves fuel efficiency by 4-10%')}</li>
              <li>{t('tools.fleetFuelCost.routeOptimizationCanReduceFuel', 'Route optimization can reduce fuel costs by 10-30%')}</li>
              <li>{t('tools.fleetFuelCost.driverTrainingOnEcoDriving', 'Driver training on eco-driving techniques saves 5-15%')}</li>
              <li>{t('tools.fleetFuelCost.considerFuelCardsForBulk', 'Consider fuel cards for bulk purchasing discounts')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetFuelCostTool;
