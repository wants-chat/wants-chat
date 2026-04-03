import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Sun, Cloud, ThermometerSun, Info, Calculator, Leaf, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface IrrigationCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface PlantWaterNeed {
  name: string;
  category: string;
  waterNeed: 'low' | 'medium' | 'high';
  inchesPerWeek: number;
  rootDepth: number; // inches
  notes: string;
}

interface SoilType {
  name: string;
  waterHoldingCapacity: number; // inches per foot
  infiltrationRate: number; // inches per hour
  description: string;
}

const plantWaterNeeds: PlantWaterNeed[] = [
  { name: 'Tomatoes', category: 'Vegetables', waterNeed: 'high', inchesPerWeek: 2, rootDepth: 24, notes: 'Consistent watering prevents cracking' },
  { name: 'Peppers', category: 'Vegetables', waterNeed: 'medium', inchesPerWeek: 1.5, rootDepth: 18, notes: 'Slightly drought tolerant when established' },
  { name: 'Lettuce/Greens', category: 'Vegetables', waterNeed: 'high', inchesPerWeek: 2, rootDepth: 6, notes: 'Shallow roots, needs frequent watering' },
  { name: 'Carrots', category: 'Vegetables', waterNeed: 'medium', inchesPerWeek: 1, rootDepth: 12, notes: 'Deep roots, less frequent deep watering' },
  { name: 'Beans', category: 'Vegetables', waterNeed: 'medium', inchesPerWeek: 1.5, rootDepth: 24, notes: 'More water during flowering/pod set' },
  { name: 'Cucumbers', category: 'Vegetables', waterNeed: 'high', inchesPerWeek: 2, rootDepth: 24, notes: 'High water needs, especially when fruiting' },
  { name: 'Squash', category: 'Vegetables', waterNeed: 'high', inchesPerWeek: 2, rootDepth: 24, notes: 'Large leaves lose water quickly' },
  { name: 'Corn', category: 'Vegetables', waterNeed: 'high', inchesPerWeek: 2.5, rootDepth: 36, notes: 'Critical during tasseling and silking' },
  { name: 'Potatoes', category: 'Vegetables', waterNeed: 'medium', inchesPerWeek: 1.5, rootDepth: 18, notes: 'Consistent moisture for best yields' },
  { name: 'Lawn (Cool Season)', category: 'Lawn', waterNeed: 'medium', inchesPerWeek: 1.5, rootDepth: 6, notes: 'Kentucky bluegrass, fescue, ryegrass' },
  { name: 'Lawn (Warm Season)', category: 'Lawn', waterNeed: 'low', inchesPerWeek: 1, rootDepth: 8, notes: 'Bermuda, zoysia, buffalo grass' },
  { name: 'Fruit Trees', category: 'Fruit', waterNeed: 'medium', inchesPerWeek: 1.5, rootDepth: 36, notes: 'Deep watering encourages deep roots' },
  { name: 'Berry Bushes', category: 'Fruit', waterNeed: 'high', inchesPerWeek: 2, rootDepth: 18, notes: 'Shallow roots, mulch helps retain moisture' },
  { name: 'Roses', category: 'Flowers', waterNeed: 'high', inchesPerWeek: 2, rootDepth: 24, notes: 'Deep watering 2-3 times per week' },
  { name: 'Perennials', category: 'Flowers', waterNeed: 'medium', inchesPerWeek: 1, rootDepth: 12, notes: 'Established plants are drought tolerant' },
  { name: 'Succulents', category: 'Flowers', waterNeed: 'low', inchesPerWeek: 0.5, rootDepth: 6, notes: 'Water only when soil is dry' },
];

const soilTypes: SoilType[] = [
  { name: 'Sandy', waterHoldingCapacity: 0.75, infiltrationRate: 2, description: 'Fast drainage, needs frequent watering' },
  { name: 'Sandy Loam', waterHoldingCapacity: 1.25, infiltrationRate: 1.5, description: 'Good drainage with moderate retention' },
  { name: 'Loam', waterHoldingCapacity: 1.75, infiltrationRate: 1, description: 'Ideal garden soil, balanced properties' },
  { name: 'Clay Loam', waterHoldingCapacity: 2, infiltrationRate: 0.5, description: 'Good retention, slower drainage' },
  { name: 'Clay', waterHoldingCapacity: 2.25, infiltrationRate: 0.25, description: 'High retention, slow infiltration, risk of runoff' },
];

export const IrrigationCalculatorTool: React.FC<IrrigationCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [selectedSoil, setSelectedSoil] = useState<string>('Loam');
  const [areaSize, setAreaSize] = useState('1000');
  const [areaUnit, setAreaUnit] = useState<'sqft' | 'acres'>('sqft');
  const [recentRainfall, setRecentRainfall] = useState('0');
  const [temperature, setTemperature] = useState('80');
  const [irrigationType, setIrrigationType] = useState<'sprinkler' | 'drip' | 'soaker'>('sprinkler');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.plant) setSelectedPlant(String(prefillData.plant));
      if (prefillData.soil) setSelectedSoil(String(prefillData.soil));
      if (prefillData.area) setAreaSize(String(prefillData.area));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const selectedPlantData = plantWaterNeeds.find(p => p.name === selectedPlant);
  const selectedSoilData = soilTypes.find(s => s.name === selectedSoil);

  const irrigationEfficiency: Record<string, number> = {
    sprinkler: 0.7, // 70% efficient
    drip: 0.9, // 90% efficient
    soaker: 0.8, // 80% efficient
  };

  const calculations = useMemo(() => {
    if (!selectedPlantData || !selectedSoilData) return null;

    const area = parseFloat(areaSize) || 0;
    const areaSqFt = areaUnit === 'acres' ? area * 43560 : area;
    const rainfall = parseFloat(recentRainfall) || 0;
    const temp = parseFloat(temperature) || 80;

    // Base water need per week
    let weeklyNeed = selectedPlantData.inchesPerWeek;

    // Adjust for temperature (increase 10% for every 10 degrees above 80)
    if (temp > 80) {
      weeklyNeed *= 1 + ((temp - 80) / 100);
    }
    // Reduce for temperatures below 70
    if (temp < 70) {
      weeklyNeed *= 0.9;
    }

    // Subtract rainfall
    const netWaterNeed = Math.max(0, weeklyNeed - rainfall);

    // Calculate gallons needed
    // 1 inch of water over 1 sq ft = 0.623 gallons
    const gallonsPerInchPerSqFt = 0.623;
    const totalGallonsNeeded = netWaterNeed * areaSqFt * gallonsPerInchPerSqFt;

    // Adjust for irrigation efficiency
    const efficiency = irrigationEfficiency[irrigationType];
    const totalGallonsToApply = totalGallonsNeeded / efficiency;

    // Calculate runtime for different flow rates
    const sprinklerGPM = 2; // typical sprinkler head
    const dripGPH = 0.5; // typical drip emitter
    const soakerGPH = 3; // per linear foot

    // Minutes to apply water
    const sprinklerMinutes = (totalGallonsToApply / (areaSqFt / 200)) / sprinklerGPM; // assuming 1 head per 200 sqft
    const dripMinutes = netWaterNeed * 60 / (dripGPH / (12 * 12 / 144)); // roughly

    // Watering schedule recommendation
    const sessionsPerWeek = selectedSoilData.name === 'Sandy' ? 3 : selectedSoilData.name === 'Clay' ? 1 : 2;
    const inchesPerSession = netWaterNeed / sessionsPerWeek;
    const gallonsPerSession = totalGallonsToApply / sessionsPerWeek;

    // Max application rate before runoff
    const maxRuntime = selectedSoilData.infiltrationRate * 60; // minutes

    return {
      weeklyNeed: weeklyNeed.toFixed(2),
      netWaterNeed: netWaterNeed.toFixed(2),
      totalGallonsNeeded: totalGallonsNeeded.toFixed(0),
      totalGallonsToApply: totalGallonsToApply.toFixed(0),
      efficiency: (efficiency * 100).toFixed(0),
      sessionsPerWeek,
      inchesPerSession: inchesPerSession.toFixed(2),
      gallonsPerSession: gallonsPerSession.toFixed(0),
      minutesPerSession: Math.min((sprinklerMinutes / sessionsPerWeek), maxRuntime).toFixed(0),
      maxRuntime: maxRuntime.toFixed(0),
      cubicFeet: (totalGallonsToApply / 7.48).toFixed(1),
      liters: (totalGallonsToApply * 3.785).toFixed(0),
    };
  }, [selectedPlantData, selectedSoilData, areaSize, areaUnit, recentRainfall, temperature, irrigationType]);

  const getWaterNeedColor = (need: string) => {
    switch (need) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Droplets className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.irrigationCalculator.irrigationCalculator', 'Irrigation Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.irrigationCalculator.calculateWaterNeedsForYour', 'Calculate water needs for your garden')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Plant Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Leaf className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.irrigationCalculator.selectPlantType', 'Select Plant Type')}
          </label>
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
          >
            <option value="">{t('tools.irrigationCalculator.chooseAPlantType', 'Choose a plant type...')}</option>
            {Object.entries(
              plantWaterNeeds.reduce((acc, plant) => {
                if (!acc[plant.category]) acc[plant.category] = [];
                acc[plant.category].push(plant);
                return acc;
              }, {} as Record<string, PlantWaterNeed[]>)
            ).map(([category, plants]) => (
              <optgroup key={category} label={category}>
                {plants.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Plant Info */}
        {selectedPlantData && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.name}</span>
              <span className={`font-bold ${getWaterNeedColor(selectedPlantData.waterNeed)}`}>
                {selectedPlantData.waterNeed.toUpperCase()} Water Need
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-2">
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.irrigationCalculator.weeklyNeed', 'Weekly Need:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.inchesPerWeek}" water</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.irrigationCalculator.rootDepth', 'Root Depth:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.rootDepth}"</span>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPlantData.notes}</p>
          </div>
        )}

        {/* Soil Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.irrigationCalculator.soilType', 'Soil Type')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {soilTypes.map(soil => (
              <button
                key={soil.name}
                onClick={() => setSelectedSoil(soil.name)}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedSoil === soil.name
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {soil.name}
              </button>
            ))}
          </div>
          {selectedSoilData && (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{selectedSoilData.description}</p>
          )}
        </div>

        {/* Irrigation Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.irrigationCalculator.irrigationMethod', 'Irrigation Method')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'sprinkler', label: 'Sprinkler', efficiency: '70%' },
              { value: 'drip', label: 'Drip', efficiency: '90%' },
              { value: 'soaker', label: 'Soaker Hose', efficiency: '80%' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setIrrigationType(type.value as any)}
                className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                  irrigationType === type.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div>{type.label}</div>
                <div className="text-xs opacity-75">{type.efficiency} efficient</div>
              </button>
            ))}
          </div>
        </div>

        {/* Area Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.irrigationCalculator.areaToWater', 'Area to Water')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
              min="1"
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value as any)}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="sqft">{t('tools.irrigationCalculator.sqFt', 'sq ft')}</option>
              <option value="acres">acres</option>
            </select>
          </div>
        </div>

        {/* Environmental Factors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Cloud className="w-4 h-4 inline mr-2 text-blue-500" />
              {t('tools.irrigationCalculator.recentRainfallInches', 'Recent Rainfall (inches)')}
            </label>
            <input
              type="number"
              value={recentRainfall}
              onChange={(e) => setRecentRainfall(e.target.value)}
              min="0"
              step="0.1"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <ThermometerSun className="w-4 h-4 inline mr-2 text-orange-500" />
              {t('tools.irrigationCalculator.temperatureF', 'Temperature (F)')}
            </label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Results */}
        {selectedPlantData && calculations && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calculator className="w-4 h-4 text-teal-500" />
              {t('tools.irrigationCalculator.weeklyWaterRequirements', 'Weekly Water Requirements')}
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <div className="text-2xl font-bold text-blue-500">{calculations.netWaterNeed}"</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationCalculator.waterNeeded', 'water needed')}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-teal-500/10">
                <div className="text-2xl font-bold text-teal-500">{calculations.totalGallonsToApply}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationCalculator.gallonsWeek', 'gallons/week')}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-500/10">
                <div className="text-2xl font-bold text-purple-500">{calculations.sessionsPerWeek}x</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationCalculator.perWeek', 'per week')}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/10">
                <div className="text-2xl font-bold text-amber-500">{calculations.minutesPerSession}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationCalculator.minSession', 'min/session')}</div>
              </div>
            </div>

            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.irrigationCalculator.perWateringSession', 'Per Watering Session:')}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Water: <strong className="text-teal-500">{calculations.inchesPerSession}"</strong>
                </div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Volume: <strong className="text-teal-500">{calculations.gallonsPerSession} gal</strong>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-teal-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.irrigationCalculator.recommendedSchedule', 'Recommended Schedule')}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Water <strong>{calculations.sessionsPerWeek} time(s) per week</strong> for approximately <strong>{calculations.minutesPerSession} minutes</strong> each session.
                Maximum continuous watering before runoff: <strong>{calculations.maxRuntime} minutes</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Water Conservation Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Sun className="w-4 h-4 text-amber-500" />
            {t('tools.irrigationCalculator.waterConservationTips', 'Water Conservation Tips')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <strong className="text-teal-500">{t('tools.irrigationCalculator.waterEarly', 'Water Early')}</strong>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.irrigationCalculator.waterInEarlyMorningTo', 'Water in early morning to reduce evaporation loss')}
              </p>
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <strong className="text-teal-500">{t('tools.irrigationCalculator.mulch', 'Mulch')}</strong>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.irrigationCalculator.24OfMulchReduces', '2-4" of mulch reduces evaporation by 25-50%')}
              </p>
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <strong className="text-teal-500">{t('tools.irrigationCalculator.deepWatering', 'Deep Watering')}</strong>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.irrigationCalculator.waterDeeplyButLessFrequently', 'Water deeply but less frequently to encourage deep roots')}
              </p>
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <strong className="text-teal-500">{t('tools.irrigationCalculator.checkSoil', 'Check Soil')}</strong>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.irrigationCalculator.insertFinger2DeepWater', 'Insert finger 2" deep - water only if dry')}
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.irrigationCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.irrigationCalculator.dripIrrigationIsMostEfficient', 'Drip irrigation is most efficient for vegetables and shrubs')}</li>
                <li>{t('tools.irrigationCalculator.claySoilsNeedSlowerLonger', 'Clay soils need slower, longer watering to avoid runoff')}</li>
                <li>{t('tools.irrigationCalculator.sandySoilsNeedMoreFrequent', 'Sandy soils need more frequent but shorter waterings')}</li>
                <li>{t('tools.irrigationCalculator.adjustWateringDuringHeatWaves', 'Adjust watering during heat waves and after rain')}</li>
                <li>{t('tools.irrigationCalculator.useARainGaugeTo', 'Use a rain gauge to track actual water applied')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationCalculatorTool;
