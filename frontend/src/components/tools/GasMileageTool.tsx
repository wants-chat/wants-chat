import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fuel, Car, DollarSign, TrendingUp, Calculator, Info, Sparkles, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FillUpRecord {
  id: string;
  date: string;
  odometer: number;
  gallons: number;
  pricePerGallon: number;
  mpg?: number;
  totalCost: number;
}

interface GasMileageToolProps {
  uiConfig?: UIConfig;
}

export const GasMileageTool: React.FC<GasMileageToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'quick' | 'tracker'>('quick');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

  // Quick calculator
  const [distance, setDistance] = useState('350');
  const [fuelUsed, setFuelUsed] = useState('12');
  const [fuelPrice, setFuelPrice] = useState('3.50');

  // Fill-up tracker
  const [records, setRecords] = useState<FillUpRecord[]>([]);
  const [newOdometer, setNewOdometer] = useState('');
  const [newGallons, setNewGallons] = useState('');
  const [newPrice, setNewPrice] = useState('3.50');

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [fillUpErrors, setFillUpErrors] = useState<Record<string, string>>({});

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.distance !== undefined || params.miles !== undefined) {
        setDistance(String(params.distance || params.miles));
        setIsPrefilled(true);
      }
      if (params.fuel !== undefined || params.gallons !== undefined) {
        setFuelUsed(String(params.fuel || params.gallons));
        setIsPrefilled(true);
      }
      if (params.fuelPrice !== undefined || params.gasPrice !== undefined) {
        setFuelPrice(String(params.fuelPrice || params.gasPrice));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Quick calculation
  const quickCalc = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const fuel = parseFloat(fuelUsed) || 0;
    const price = parseFloat(fuelPrice) || 0;

    if (unit === 'imperial') {
      const mpg = fuel > 0 ? dist / fuel : 0;
      const costPerMile = dist > 0 ? (fuel * price) / dist : 0;
      const totalCost = fuel * price;

      // MPG ratings
      let rating = '';
      if (mpg >= 40) rating = 'Excellent';
      else if (mpg >= 30) rating = 'Good';
      else if (mpg >= 25) rating = 'Average';
      else if (mpg >= 20) rating = 'Below Average';
      else if (mpg > 0) rating = 'Poor';

      return {
        efficiency: mpg,
        efficiencyUnit: 'MPG',
        costPerUnit: costPerMile,
        costPerUnitLabel: 'per mile',
        totalCost,
        rating,
        distanceUnit: 'miles',
        fuelUnit: 'gallons',
      };
    } else {
      const lPer100km = dist > 0 ? (fuel / dist) * 100 : 0;
      const costPerKm = dist > 0 ? (fuel * price) / dist : 0;
      const totalCost = fuel * price;

      let rating = '';
      if (lPer100km <= 5) rating = 'Excellent';
      else if (lPer100km <= 7) rating = 'Good';
      else if (lPer100km <= 9) rating = 'Average';
      else if (lPer100km <= 12) rating = 'Below Average';
      else if (lPer100km > 0) rating = 'Poor';

      return {
        efficiency: lPer100km,
        efficiencyUnit: 'L/100km',
        costPerUnit: costPerKm,
        costPerUnitLabel: 'per km',
        totalCost,
        rating,
        distanceUnit: 'km',
        fuelUnit: 'liters',
      };
    }
  }, [distance, fuelUsed, fuelPrice, unit]);

  // Validate fill-up form
  const validateFillUp = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newOdometer.trim()) {
      errors.odometer = 'Odometer is required';
    }
    if (!newGallons.trim()) {
      errors.gallons = 'Gallons is required';
    }
    setFillUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add fill-up record
  const addRecord = () => {
    if (!validateFillUp()) return;

    const odometer = parseFloat(newOdometer);
    const gallons = parseFloat(newGallons);
    const price = parseFloat(newPrice) || 0;

    // Calculate MPG from previous record
    let mpg: number | undefined;
    if (records.length > 0) {
      const lastRecord = records[0];
      const milesDriven = odometer - lastRecord.odometer;
      if (milesDriven > 0 && gallons > 0) {
        mpg = milesDriven / gallons;
      }
    }

    const newRecord: FillUpRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      odometer,
      gallons,
      pricePerGallon: price,
      mpg,
      totalCost: gallons * price,
    };

    setRecords([newRecord, ...records]);
    setNewOdometer('');
    setNewGallons('');
    setFillUpErrors({});
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  // Tracker statistics
  const trackerStats = useMemo(() => {
    if (records.length < 2) return null;

    const recordsWithMpg = records.filter((r) => r.mpg !== undefined);
    if (recordsWithMpg.length === 0) return null;

    const totalMiles = records[0].odometer - records[records.length - 1].odometer;
    const totalGallons = records.slice(0, -1).reduce((sum, r) => sum + r.gallons, 0);
    const totalSpent = records.reduce((sum, r) => sum + r.totalCost, 0);
    const avgMpg = totalGallons > 0 ? totalMiles / totalGallons : 0;
    const avgPricePerGallon = totalGallons > 0 ? totalSpent / totalGallons : 0;
    const costPerMile = totalMiles > 0 ? totalSpent / totalMiles : 0;

    const mpgValues = recordsWithMpg.map((r) => r.mpg!);
    const bestMpg = Math.max(...mpgValues);
    const worstMpg = Math.min(...mpgValues);

    return {
      totalMiles,
      totalGallons,
      totalSpent,
      avgMpg,
      avgPricePerGallon,
      costPerMile,
      bestMpg,
      worstMpg,
      fillUpCount: records.length,
    };
  }, [records]);

  const vehiclePresets = [
    { name: 'Compact', mpg: 32 },
    { name: 'Sedan', mpg: 28 },
    { name: 'SUV', mpg: 23 },
    { name: 'Truck', mpg: 18 },
    { name: 'Hybrid', mpg: 48 },
    { name: 'Sports', mpg: 22 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Fuel className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileage.gasMileageCalculator', 'Gas Mileage Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gasMileage.calculateAndTrackYourFuel', 'Calculate and track your fuel efficiency')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.gasMileage.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode & Unit Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'quick' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Calculator className="w-4 h-4" /> Quick Calc
          </button>
          <button
            onClick={() => setMode('tracker')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'tracker' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Fill-Up Tracker
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('tools.gasMileage.mpgUs', 'MPG (US)')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('tools.gasMileage.l100km', 'L/100km')}
          </button>
        </div>

        {mode === 'quick' ? (
          <>
            {/* Quick Calculator Inputs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Car className="w-4 h-4 inline mr-1" />
                  Distance ({quickCalc.distanceUnit})
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
                  <Fuel className="w-4 h-4 inline mr-1" />
                  Fuel ({quickCalc.fuelUnit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelUsed}
                  onChange={(e) => setFuelUsed(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price/{unit === 'imperial' ? 'gal' : 'L'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Result */}
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileage.yourFuelEconomy', 'Your Fuel Economy')}</div>
              <div className="text-5xl font-bold text-teal-500 my-2">
                {quickCalc.efficiency.toFixed(1)}
              </div>
              <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{quickCalc.efficiencyUnit}</div>
              <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                quickCalc.rating === 'Excellent' ? 'bg-green-500/20 text-green-500' :
                quickCalc.rating === 'Good' ? 'bg-teal-500/20 text-teal-500' :
                quickCalc.rating === 'Average' ? 'bg-yellow-500/20 text-yellow-500' :
                quickCalc.rating === 'Below Average' ? 'bg-orange-500/20 text-orange-500' :
                quickCalc.rating === 'Poor' ? 'bg-red-500/20 text-red-500' :
                'bg-gray-500/20 text-gray-500'
              }`}>
                {quickCalc.rating}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cost {quickCalc.costPerUnitLabel}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${quickCalc.costPerUnit.toFixed(3)}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileage.totalFuelCost', 'Total Fuel Cost')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${quickCalc.totalCost.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Reference */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileage.typicalMpgByVehicle', 'Typical MPG by Vehicle')}</h4>
              <div className="flex flex-wrap gap-2">
                {vehiclePresets.map((v) => (
                  <span key={v.name} className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    {v.name}: {v.mpg} MPG
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Fill-Up Tracker */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileage.logFillUp', 'Log Fill-Up')}</h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.gasMileage.odometer', 'Odometer *')}
                  </label>
                  <input
                    type="number"
                    value={newOdometer}
                    onChange={(e) => {
                      setNewOdometer(e.target.value);
                      if (fillUpErrors.odometer) setFillUpErrors(prev => ({ ...prev, odometer: '' }));
                    }}
                    placeholder="45000"
                    className={`w-full px-3 py-2 rounded-lg border ${fillUpErrors.odometer ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  {fillUpErrors.odometer && <p className="text-red-500 text-xs">{fillUpErrors.odometer}</p>}
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.gasMileage.gallons', 'Gallons *')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newGallons}
                    onChange={(e) => {
                      setNewGallons(e.target.value);
                      if (fillUpErrors.gallons) setFillUpErrors(prev => ({ ...prev, gallons: '' }));
                    }}
                    placeholder="12.5"
                    className={`w-full px-3 py-2 rounded-lg border ${fillUpErrors.gallons ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  {fillUpErrors.gallons && <p className="text-red-500 text-xs">{fillUpErrors.gallons}</p>}
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.gasMileage.gallon', '$/Gallon')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addRecord}
                    className="w-full py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600"
                  >
                    {t('tools.gasMileage.add', 'Add')}
                  </button>
                </div>
              </div>
              <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.gasMileage.tipLogFillUpsIn', 'Tip: Log fill-ups in order. MPG calculates from distance since last fill-up.')}
              </div>
            </div>

            {/* Statistics */}
            {trackerStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileage.averageMpg', 'Average MPG')}</div>
                  <div className="text-3xl font-bold text-teal-500">{trackerStats.avgMpg.toFixed(1)}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileage.costPerMile', 'Cost per Mile')}</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${trackerStats.costPerMile.toFixed(3)}
                  </div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileage.bestWorstMpg', 'Best/Worst MPG')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-green-500">{trackerStats.bestMpg.toFixed(1)}</span>
                    {' / '}
                    <span className="text-red-500">{trackerStats.worstMpg.toFixed(1)}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gasMileage.totalSpent', 'Total Spent')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${trackerStats.totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.gasMileage.addAtLeast2Fill', 'Add at least 2 fill-ups to see statistics')}
              </div>
            )}

            {/* Fill-up History */}
            {records.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gasMileage.fillUpHistory', 'Fill-Up History')}</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {records.map((record) => (
                    <div key={record.id} className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {record.odometer.toLocaleString()} mi
                          {record.mpg && (
                            <span className="ml-2 text-teal-500">{record.mpg.toFixed(1)} MPG</span>
                          )}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.gallons} gal @ ${record.pricePerGallon.toFixed(2)} = ${record.totalCost.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{record.date}</span>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.gasMileage.improveYourMpg', 'Improve Your MPG:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.gasMileage.keepTiresProperlyInflated', 'Keep tires properly inflated')}</li>
                <li>{t('tools.gasMileage.driveAtSteadySpeedsUse', 'Drive at steady speeds, use cruise control')}</li>
                <li>{t('tools.gasMileage.avoidAggressiveAccelerationAndBraking', 'Avoid aggressive acceleration and braking')}</li>
                <li>{t('tools.gasMileage.removeExcessWeightAndRoof', 'Remove excess weight and roof cargo')}</li>
                <li>{t('tools.gasMileage.keepUpWithRegularMaintenance', 'Keep up with regular maintenance')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasMileageTool;
