import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fuel, Car, DollarSign, MapPin, Calculator, TrendingDown, Sparkles } from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToJSON,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FillUp {
  id: string;
  date: string;
  odometer: number;
  gallons: number;
  pricePerGallon: number;
}

interface GasMileageCalculatorToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const fillUpColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'odometer', header: 'Odometer (miles)', type: 'number' },
  { key: 'gallons', header: 'Gallons', type: 'number' },
  { key: 'pricePerGallon', header: 'Price/Gallon', type: 'currency' },
];

export const GasMileageCalculatorTool: React.FC<GasMileageCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'quick' | 'tracker'>('quick');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

  // Quick calc
  const [distance, setDistance] = useState('300');
  const [fuel, setFuel] = useState('12');
  const [gasPrice, setGasPrice] = useState('3.50');

  // Trip planner
  const [tripDistance, setTripDistance] = useState('500');
  const [carMpg, setCarMpg] = useState('30');
  const [tripGasPrice, setTripGasPrice] = useState('3.50');

  // Fill-up tracker
  const [fillUps, setFillUps] = useState<FillUp[]>([]);
  const [newOdometer, setNewOdometer] = useState('');
  const [newGallons, setNewGallons] = useState('');
  const [newPrice, setNewPrice] = useState('3.50');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [errors, setErrors] = useState<{ odometer?: string; gallons?: string }>({});

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        setIsPrefilled(true);
      }
      if (params.fuel !== undefined || params.gallons !== undefined) {
        setFuel(String(params.fuel || params.gallons));
        setIsPrefilled(true);
      }
      if (params.gasPrice !== undefined || params.fuelPrice !== undefined) {
        setGasPrice(String(params.gasPrice || params.fuelPrice));
        setIsPrefilled(true);
      }
      if (params.mpg !== undefined) {
        setCarMpg(String(params.mpg));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const quickCalc = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const fuelUsed = parseFloat(fuel) || 0;
    const price = parseFloat(gasPrice) || 0;

    if (unit === 'imperial') {
      // MPG
      const mpg = fuelUsed > 0 ? dist / fuelUsed : 0;
      const costPerMile = dist > 0 ? (fuelUsed * price) / dist : 0;
      const totalCost = fuelUsed * price;
      return { efficiency: mpg.toFixed(1), efficiencyLabel: 'MPG', costPerMile: costPerMile.toFixed(3), totalCost: totalCost.toFixed(2) };
    } else {
      // L/100km
      const lPer100km = dist > 0 ? (fuelUsed / dist) * 100 : 0;
      const costPerKm = dist > 0 ? (fuelUsed * price) / dist : 0;
      const totalCost = fuelUsed * price;
      return { efficiency: lPer100km.toFixed(1), efficiencyLabel: 'L/100km', costPerMile: costPerKm.toFixed(3), totalCost: totalCost.toFixed(2) };
    }
  }, [distance, fuel, gasPrice, unit]);

  const tripCalc = useMemo(() => {
    const dist = parseFloat(tripDistance) || 0;
    const mpg = parseFloat(carMpg) || 0;
    const price = parseFloat(tripGasPrice) || 0;

    if (unit === 'imperial') {
      const gallonsNeeded = mpg > 0 ? dist / mpg : 0;
      const totalCost = gallonsNeeded * price;
      return { fuelNeeded: gallonsNeeded.toFixed(1), fuelUnit: 'gallons', totalCost: totalCost.toFixed(2) };
    } else {
      // L/100km input
      const litersNeeded = (mpg / 100) * dist;
      const totalCost = litersNeeded * price;
      return { fuelNeeded: litersNeeded.toFixed(1), fuelUnit: 'liters', totalCost: totalCost.toFixed(2) };
    }
  }, [tripDistance, carMpg, tripGasPrice, unit]);

  const addFillUp = () => {
    const newErrors: { odometer?: string; gallons?: string } = {};

    if (!newOdometer || !newOdometer.trim()) {
      newErrors.odometer = 'Odometer reading is required';
    }
    if (!newGallons || !newGallons.trim()) {
      newErrors.gallons = 'Gallons amount is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setFillUps([
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        odometer: parseFloat(newOdometer),
        gallons: parseFloat(newGallons),
        pricePerGallon: parseFloat(newPrice) || 0,
      },
      ...fillUps,
    ]);
    setNewOdometer('');
    setNewGallons('');
  };

  const trackerStats = useMemo(() => {
    if (fillUps.length < 2) return null;

    const sorted = [...fillUps].sort((a, b) => a.odometer - b.odometer);
    let totalMiles = 0;
    let totalGallons = 0;
    let totalCost = 0;
    const mpgHistory: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      const miles = sorted[i].odometer - sorted[i - 1].odometer;
      const gallons = sorted[i].gallons;
      totalMiles += miles;
      totalGallons += gallons;
      totalCost += gallons * sorted[i].pricePerGallon;
      if (gallons > 0) mpgHistory.push(miles / gallons);
    }

    const avgMpg = totalGallons > 0 ? totalMiles / totalGallons : 0;
    const costPerMile = totalMiles > 0 ? totalCost / totalMiles : 0;

    return {
      totalMiles: totalMiles.toFixed(0),
      totalGallons: totalGallons.toFixed(1),
      totalCost: totalCost.toFixed(2),
      avgMpg: avgMpg.toFixed(1),
      costPerMile: costPerMile.toFixed(3),
      lastMpg: mpgHistory.length > 0 ? mpgHistory[mpgHistory.length - 1].toFixed(1) : '0',
    };
  }, [fillUps]);

  const commonMpg = [
    { type: 'Compact Car', mpg: '30-35' },
    { type: 'Sedan', mpg: '25-30' },
    { type: 'SUV', mpg: '20-25' },
    { type: 'Truck', mpg: '15-20' },
    { type: 'Hybrid', mpg: '40-55' },
    { type: 'Electric (MPGe)', mpg: '100-130' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Fuel className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileageCalculator.gasMileageCalculator', 'Gas Mileage Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gasMileageCalculator.trackFuelEfficiencyAndTrip', 'Track fuel efficiency and trip costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.gasMileageCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg ${unit === 'imperial' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gasMileageCalculator.mpgUs', 'MPG (US)')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg ${unit === 'metric' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gasMileageCalculator.l100km', 'L/100km')}
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${mode === 'quick' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Calculator className="w-4 h-4" /> Quick Calc
          </button>
          <button
            onClick={() => setMode('tracker')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${mode === 'tracker' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <TrendingDown className="w-4 h-4" /> Fill-Up Tracker
          </button>
        </div>

        {mode === 'quick' ? (
          <>
            {/* Quick Calculator */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Car className="w-4 h-4 inline mr-2" />
                Calculate {unit === 'imperial' ? t('tools.gasMileageCalculator.mpg', 'MPG') : t('tools.gasMileageCalculator.l100km2', 'L/100km')}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Distance ({unit === 'imperial' ? 'miles' : 'km'})
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fuel ({unit === 'imperial' ? 'gallons' : 'liters'})
                  </label>
                  <input
                    type="number"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Price/{unit === 'imperial' ? 'gal' : 'L'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gasPrice}
                    onChange={(e) => setGasPrice(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            {/* Quick Calc Results */}
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileageCalculator.fuelEfficiency', 'Fuel Efficiency')}</div>
              <div className="text-5xl font-bold text-green-500 my-2">
                {quickCalc.efficiency}
              </div>
              <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{quickCalc.efficiencyLabel}</div>
              <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                ${quickCalc.costPerMile}/{unit === 'imperial' ? 'mile' : 'km'} • ${quickCalc.totalCost} total
              </div>
            </div>

            {/* Trip Planner */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <MapPin className="w-4 h-4 inline mr-2" />
                {t('tools.gasMileageCalculator.tripCostEstimator', 'Trip Cost Estimator')}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.gasMileageCalculator.tripDistance', 'Trip Distance')}
                  </label>
                  <input
                    type="number"
                    value={tripDistance}
                    onChange={(e) => setTripDistance(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your {unit === 'imperial' ? t('tools.gasMileageCalculator.mpg2', 'MPG') : t('tools.gasMileageCalculator.l100km3', 'L/100km')}
                  </label>
                  <input
                    type="number"
                    value={carMpg}
                    onChange={(e) => setCarMpg(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.gasMileageCalculator.gasPrice', 'Gas Price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tripGasPrice}
                    onChange={(e) => setTripGasPrice(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  You'll need: {tripCalc.fuelNeeded} {tripCalc.fuelUnit}
                </span>
                <span className="text-green-500 font-bold text-lg">
                  ${tripCalc.totalCost}
                </span>
              </div>
            </div>

            {/* Common MPG */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileageCalculator.typicalFuelEconomy', 'Typical Fuel Economy')}</h4>
              <div className="grid grid-cols-3 gap-2">
                {commonMpg.map((item, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.type}:</span> {item.mpg}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Fill-Up Tracker */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileageCalculator.logFillUp', 'Log Fill-Up')}</h4>
                {fillUps.length > 0 && (
                  <ExportDropdown
                    onExportCSV={() => exportToCSV(fillUps, fillUpColumns, { filename: 'fill-up-history' })}
                    onExportJSON={() => exportToJSON(fillUps, { filename: 'fill-up-history' })}
                    theme={isDark ? 'dark' : 'light'}
                    showImport={false}
                  />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <input
                    type="number"
                    value={newOdometer}
                    onChange={(e) => {
                      setNewOdometer(e.target.value);
                      if (errors.odometer) setErrors(prev => ({ ...prev, odometer: undefined }));
                    }}
                    placeholder={t('tools.gasMileageCalculator.odometer', 'Odometer')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.odometer
                        ? 'border-red-500 focus:ring-red-500'
                        : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  {errors.odometer && (
                    <p className="text-xs text-red-500">{errors.odometer}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="number"
                    step="0.01"
                    value={newGallons}
                    onChange={(e) => {
                      setNewGallons(e.target.value);
                      if (errors.gallons) setErrors(prev => ({ ...prev, gallons: undefined }));
                    }}
                    placeholder={t('tools.gasMileageCalculator.gallons', 'Gallons')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.gallons
                        ? 'border-red-500 focus:ring-red-500'
                        : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  {errors.gallons && (
                    <p className="text-xs text-red-500">{errors.gallons}</p>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder={t('tools.gasMileageCalculator.gal', '$/gal')}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={addFillUp}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  {t('tools.gasMileageCalculator.add', 'Add')}
                </button>
              </div>
            </div>

            {/* Stats */}
            {trackerStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileageCalculator.averageMpg', 'Average MPG')}</div>
                  <div className="text-3xl font-bold text-green-500">{trackerStats.avgMpg}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileageCalculator.lastFillMpg', 'Last Fill MPG')}</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{trackerStats.lastMpg}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileageCalculator.costMile', 'Cost/Mile')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${trackerStats.costPerMile}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileageCalculator.totalSpent', 'Total Spent')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${trackerStats.totalCost}</div>
                </div>
              </div>
            ) : (
              <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.gasMileageCalculator.addAtLeast2Fill', 'Add at least 2 fill-ups to see statistics')}
              </div>
            )}

            {/* Fill-up History */}
            {fillUps.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fillUps.map((fillUp, idx) => (
                  <div key={fillUp.id} className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {fillUp.odometer.toLocaleString()} miles
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {fillUp.gallons} gal @ ${fillUp.pricePerGallon}/gal
                      </div>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {fillUp.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GasMileageCalculatorTool;
