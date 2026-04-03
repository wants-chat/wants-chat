import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, Scale, Clock, TrendingUp, Ruler, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface HikingCaloriesToolProps {
  uiConfig?: UIConfig;
}

type TerrainType = 'flat' | 'hilly' | 'steep' | 'mountainous';
type PackWeight = 'none' | 'light' | 'moderate' | 'heavy';

export const HikingCaloriesTool: React.FC<HikingCaloriesToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('70');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [distance, setDistance] = useState('5');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [duration, setDuration] = useState('120');
  const [elevationGain, setElevationGain] = useState('300');
  const [terrain, setTerrain] = useState<TerrainType>('hilly');
  const [packWeight, setPackWeight] = useState<PackWeight>('light');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      if (params.weight !== undefined) {
        setWeight(String(params.weight));
      }
      if (params.distance !== undefined) {
        setDistance(String(params.distance));
      }
      if (params.duration !== undefined) {
        setDuration(String(params.duration));
      }
      if (params.elevationGain !== undefined) {
        setElevationGain(String(params.elevationGain));
      }
    }
  }, [uiConfig?.params]);

  const terrainTypes = {
    flat: { name: 'Flat Trail', multiplier: 1.0, description: 'Paved or smooth dirt paths' },
    hilly: { name: 'Hilly', multiplier: 1.3, description: 'Rolling hills and moderate inclines' },
    steep: { name: 'Steep', multiplier: 1.6, description: 'Significant elevation changes' },
    mountainous: { name: 'Mountainous', multiplier: 2.0, description: 'Technical alpine terrain' },
  };

  const packWeights = {
    none: { name: 'No Pack', weight: 0, description: 'Day hike, no bag' },
    light: { name: 'Light (5-10 lbs)', weight: 7.5, description: 'Daypack with snacks & water' },
    moderate: { name: 'Moderate (15-25 lbs)', weight: 20, description: 'Full day or overnight pack' },
    heavy: { name: 'Heavy (30+ lbs)', weight: 35, description: 'Multi-day backpacking' },
  };

  const calculation = useMemo(() => {
    const weightKg = weightUnit === 'lb' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const distanceKm = distanceUnit === 'mi' ? parseFloat(distance) * 1.60934 : parseFloat(distance);
    const durationHours = parseFloat(duration) / 60;
    const elevation = parseFloat(elevationGain) || 0;
    const packWeightKg = packWeights[packWeight].weight * 0.453592;

    if (isNaN(weightKg) || isNaN(distanceKm) || isNaN(durationHours)) {
      return { totalCalories: 0, caloriesPerHour: 0, caloriesPerKm: 0, pace: 0 };
    }

    // Base MET for hiking: 6.0 (moderate pace)
    const baseMET = 6.0;

    // Adjust for terrain
    const terrainMultiplier = terrainTypes[terrain].multiplier;

    // Adjust for pack weight (adds ~0.1 MET per kg of pack)
    const packMultiplier = 1 + (packWeightKg * 0.015);

    // Adjust for elevation gain (adds calories for climbing)
    const elevationCalories = elevation * 0.5 * (weightKg + packWeightKg) / 1000;

    // Calculate base calories
    const adjustedMET = baseMET * terrainMultiplier * packMultiplier;
    const baseCalories = adjustedMET * weightKg * durationHours;

    // Total calories including elevation bonus
    const totalCalories = baseCalories + elevationCalories;

    const pace = distanceKm / durationHours;
    const caloriesPerHour = totalCalories / durationHours;
    const caloriesPerKm = totalCalories / distanceKm;

    return {
      totalCalories,
      caloriesPerHour,
      caloriesPerKm,
      pace,
      adjustedMET,
    };
  }, [weight, weightUnit, distance, distanceUnit, duration, elevationGain, terrain, packWeight]);

  const equivalents = useMemo(() => {
    const cal = calculation.totalCalories;
    return [
      { item: 'Trail Mix (1/4 cup)', amount: Math.round(cal / 170), emoji: '🥜' },
      { item: 'Energy Bars', amount: (cal / 250).toFixed(1), emoji: '🍫' },
      { item: 'Apples', amount: (cal / 95).toFixed(1), emoji: '🍎' },
      { item: 'PB&J Sandwiches', amount: (cal / 350).toFixed(1), emoji: '🥪' },
    ];
  }, [calculation.totalCalories]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Mountain className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingCalories.hikingCaloriesCalculator', 'Hiking Calories Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hikingCalories.estimateCaloriesBurnedOnYour', 'Estimate calories burned on your hike')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Weight & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Scale className="w-4 h-4 inline mr-1" /> Body Weight
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
                className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" /> Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Quick Duration Buttons */}
        <div className="flex gap-2">
          {[60, 90, 120, 180, 240].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d.toString())}
              className={`flex-1 py-2 rounded-lg text-sm ${parseInt(duration) === d ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {d >= 60 ? `${d / 60}h` : `${d}min`}
            </button>
          ))}
        </div>

        {/* Distance & Elevation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" /> Distance
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
                className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="km">km</option>
                <option value="mi">mi</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TrendingUp className="w-4 h-4 inline mr-1" /> Elevation Gain (m)
            </label>
            <input
              type="number"
              value={elevationGain}
              onChange={(e) => setElevationGain(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Terrain Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hikingCalories.terrainType', 'Terrain Type')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(terrainTypes) as TerrainType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTerrain(t)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  terrain === t
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{terrainTypes[t].name}</span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {terrainTypes[terrain].description}
          </p>
        </div>

        {/* Pack Weight */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hikingCalories.packWeight', 'Pack Weight')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(packWeights) as PackWeight[]).map((p) => (
              <button
                key={p}
                onClick={() => setPackWeight(p)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  packWeight === p
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{packWeights[p].name}</span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {packWeights[packWeight].description}
          </p>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {distance} {distanceUnit} hike over {parseFloat(duration) / 60} hours
          </div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {Math.round(calculation.totalCalories)}
          </div>
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.hikingCalories.caloriesBurned', 'calories burned')}</div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            ({Math.round(calculation.caloriesPerHour)} cal/hour | {Math.round(calculation.caloriesPerKm)} cal/km | {calculation.pace.toFixed(1)} km/h pace)
          </div>
        </div>

        {/* Food Equivalents */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hikingCalories.trailSnackEquivalents', 'Trail Snack Equivalents:')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {equivalents.map((eq) => (
              <div key={eq.item} className="text-center">
                <div className="text-2xl">{eq.emoji}</div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{eq.amount}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{eq.item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.hikingCalories.note', 'Note:')}</strong> This is an estimate based on MET values, terrain difficulty, and pack weight.
              Actual calories vary based on fitness level, weather conditions, and individual metabolism.
              Plan to bring 10-20% more calories than estimated for safety.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HikingCaloriesTool;
