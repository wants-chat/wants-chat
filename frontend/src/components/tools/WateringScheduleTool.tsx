import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Clock, Sun, Cloud, Leaf, Info, Calendar, ThermometerSun, AlertTriangle, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface WateringScheduleToolProps {
  uiConfig?: UIConfig;
}

interface Plant {
  name: string;
  category: string;
  waterFrequency: 'daily' | 'every-other' | 'twice-weekly' | 'weekly' | 'biweekly';
  waterAmount: 'light' | 'moderate' | 'deep';
  droughtTolerant: boolean;
  signs: string;
  notes: string;
}

interface WeatherCondition {
  name: string;
  waterMultiplier: number;
  description: string;
}

const plants: Plant[] = [
  { name: 'Tomatoes', category: 'Vegetables', waterFrequency: 'every-other', waterAmount: 'deep', droughtTolerant: false, signs: 'Wilting leaves, cracked fruit', notes: 'Consistent moisture prevents blossom end rot' },
  { name: 'Peppers', category: 'Vegetables', waterFrequency: 'every-other', waterAmount: 'moderate', droughtTolerant: true, signs: 'Drooping leaves, flower drop', notes: 'Slightly drought tolerant when established' },
  { name: 'Lettuce', category: 'Vegetables', waterFrequency: 'daily', waterAmount: 'light', droughtTolerant: false, signs: 'Wilting, bitter taste', notes: 'Shallow roots need frequent light watering' },
  { name: 'Cucumbers', category: 'Vegetables', waterFrequency: 'daily', waterAmount: 'moderate', droughtTolerant: false, signs: 'Wilting, bitter fruit', notes: 'Heavy water needs, especially when fruiting' },
  { name: 'Squash/Zucchini', category: 'Vegetables', waterFrequency: 'every-other', waterAmount: 'deep', droughtTolerant: false, signs: 'Wilting large leaves', notes: 'Large leaves lose water quickly' },
  { name: 'Beans', category: 'Vegetables', waterFrequency: 'twice-weekly', waterAmount: 'moderate', droughtTolerant: true, signs: 'Flower drop, stunted pods', notes: 'More water needed during flowering' },
  { name: 'Carrots', category: 'Vegetables', waterFrequency: 'twice-weekly', waterAmount: 'moderate', droughtTolerant: true, signs: 'Cracked or hairy roots', notes: 'Consistent moisture for smooth roots' },
  { name: 'Potatoes', category: 'Vegetables', waterFrequency: 'twice-weekly', waterAmount: 'moderate', droughtTolerant: true, signs: 'Wilting, cracked tubers', notes: 'Reduce watering before harvest' },
  { name: 'Corn', category: 'Vegetables', waterFrequency: 'every-other', waterAmount: 'deep', droughtTolerant: false, signs: 'Rolled leaves, poor tassels', notes: 'Critical during tasseling/silking' },
  { name: 'Spinach', category: 'Vegetables', waterFrequency: 'every-other', waterAmount: 'light', droughtTolerant: false, signs: 'Wilting, bolting', notes: 'Keep cool and moist to prevent bolting' },
  { name: 'Herbs (Basil)', category: 'Herbs', waterFrequency: 'every-other', waterAmount: 'moderate', droughtTolerant: false, signs: 'Wilting, yellow leaves', notes: 'Likes consistent moisture' },
  { name: 'Herbs (Rosemary)', category: 'Herbs', waterFrequency: 'weekly', waterAmount: 'light', droughtTolerant: true, signs: 'Browning tips', notes: 'Mediterranean - prefers dry between waterings' },
  { name: 'Herbs (Mint)', category: 'Herbs', waterFrequency: 'every-other', waterAmount: 'moderate', droughtTolerant: false, signs: 'Wilting, brown edges', notes: 'Loves moisture, can be invasive' },
  { name: 'Herbs (Thyme)', category: 'Herbs', waterFrequency: 'weekly', waterAmount: 'light', droughtTolerant: true, signs: 'Leggy growth', notes: 'Prefers lean, dry conditions' },
  { name: 'Roses', category: 'Flowers', waterFrequency: 'twice-weekly', waterAmount: 'deep', droughtTolerant: false, signs: 'Wilting, yellow leaves', notes: 'Deep watering encourages deep roots' },
  { name: 'Marigolds', category: 'Flowers', waterFrequency: 'twice-weekly', waterAmount: 'moderate', droughtTolerant: true, signs: 'Wilting, fewer blooms', notes: 'Quite drought tolerant' },
  { name: 'Petunias', category: 'Flowers', waterFrequency: 'daily', waterAmount: 'moderate', droughtTolerant: false, signs: 'Wilting, fewer flowers', notes: 'In containers, may need daily water' },
  { name: 'Succulents', category: 'Flowers', waterFrequency: 'biweekly', waterAmount: 'light', droughtTolerant: true, signs: 'Wrinkled leaves', notes: 'Let soil dry completely between waterings' },
  { name: 'Lawn (Cool Season)', category: 'Lawn', waterFrequency: 'twice-weekly', waterAmount: 'deep', droughtTolerant: false, signs: 'Bluish tint, footprints remain', notes: '1-1.5 inches per week total' },
  { name: 'Lawn (Warm Season)', category: 'Lawn', waterFrequency: 'weekly', waterAmount: 'deep', droughtTolerant: true, signs: 'Graying color, wilting', notes: 'More drought tolerant than cool season' },
  { name: 'Fruit Trees', category: 'Fruit', waterFrequency: 'weekly', waterAmount: 'deep', droughtTolerant: true, signs: 'Wilting, leaf drop', notes: 'Deep watering encourages deep roots' },
  { name: 'Strawberries', category: 'Fruit', waterFrequency: 'every-other', waterAmount: 'moderate', droughtTolerant: false, signs: 'Wilting, small berries', notes: 'Shallow roots need consistent moisture' },
  { name: 'Blueberries', category: 'Fruit', waterFrequency: 'twice-weekly', waterAmount: 'moderate', droughtTolerant: false, signs: 'Red-tinted leaves', notes: 'Keep mulched to retain moisture' },
];

const weatherConditions: WeatherCondition[] = [
  { name: 'Hot (90F+)', waterMultiplier: 1.5, description: 'Increase watering by 50%' },
  { name: 'Warm (80-90F)', waterMultiplier: 1.25, description: 'Increase watering by 25%' },
  { name: 'Moderate (70-80F)', waterMultiplier: 1, description: 'Normal watering' },
  { name: 'Cool (60-70F)', waterMultiplier: 0.75, description: 'Reduce watering by 25%' },
  { name: 'Rainy', waterMultiplier: 0, description: 'Skip watering' },
  { name: 'Windy', waterMultiplier: 1.25, description: 'Wind increases evaporation' },
];

const frequencyToDays: Record<string, number> = {
  'daily': 1,
  'every-other': 2,
  'twice-weekly': 3.5,
  'weekly': 7,
  'biweekly': 14,
};

const amountToDescription: Record<string, { inches: string; duration: string; description: string }> = {
  'light': { inches: '0.25-0.5"', duration: '5-10 min', description: 'Shallow watering, top 2-3" of soil' },
  'moderate': { inches: '0.5-1"', duration: '15-20 min', description: 'Medium depth, top 4-6" of soil' },
  'deep': { inches: '1-2"', duration: '30-45 min', description: 'Deep soaking, 8-12" penetration' },
};

export const WateringScheduleTool: React.FC<WateringScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [weatherCondition, setWeatherCondition] = useState<string>('Moderate (70-80F)');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [containerGrowing, setContainerGrowing] = useState(false);

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.plants) setSelectedPlants(prefillData.plants as string[]);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const filteredPlants = useMemo(() => {
    if (categoryFilter === 'all') return plants;
    return plants.filter(p => p.category === categoryFilter);
  }, [categoryFilter]);

  const selectedPlantsData = useMemo(() => {
    return plants.filter(p => selectedPlants.includes(p.name));
  }, [selectedPlants]);

  const weather = weatherConditions.find(w => w.name === weatherCondition) || weatherConditions[2];

  const generateSchedule = useMemo(() => {
    if (selectedPlantsData.length === 0) return [];

    const today = new Date();
    const schedule: { date: string; plants: { name: string; amount: string }[] }[] = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const plantsToWater = selectedPlantsData.filter(plant => {
        let frequency = frequencyToDays[plant.waterFrequency];

        // Adjust for containers (need more frequent watering)
        if (containerGrowing) {
          frequency = Math.max(1, frequency * 0.5);
        }

        // Adjust for weather
        if (weather.waterMultiplier === 0) return false;
        frequency = frequency / weather.waterMultiplier;

        return i % Math.round(frequency) === 0;
      });

      if (plantsToWater.length > 0) {
        schedule.push({
          date: dateStr,
          plants: plantsToWater.map(p => ({
            name: p.name,
            amount: p.waterAmount,
          })),
        });
      }
    }

    return schedule;
  }, [selectedPlantsData, weather, containerGrowing]);

  const togglePlant = (plantName: string) => {
    setSelectedPlants(prev =>
      prev.includes(plantName)
        ? prev.filter(p => p !== plantName)
        : [...prev, plantName]
    );
  };

  const getAmountColor = (amount: string) => {
    switch (amount) {
      case 'light': return 'text-blue-400';
      case 'moderate': return 'text-blue-500';
      case 'deep': return 'text-blue-600';
      default: return 'text-blue-500';
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
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wateringSchedule.wateringSchedule', 'Watering Schedule')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wateringSchedule.createACustomWateringSchedule', 'Create a custom watering schedule for your plants')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Vegetables', 'Herbs', 'Flowers', 'Lawn', 'Fruit'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Plants' : cat}
            </button>
          ))}
        </div>

        {/* Plant Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Leaf className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.wateringSchedule.selectYourPlants', 'Select Your Plants')}
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
            {filteredPlants.map(plant => (
              <button
                key={plant.name}
                onClick={() => togglePlant(plant.name)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedPlants.includes(plant.name)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plant.name}
                {plant.droughtTolerant && <Sun className="w-3 h-3 inline ml-1 text-amber-400" />}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Sun className="w-3 h-3 inline mr-1 text-amber-400" /> = Drought tolerant
          </p>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <ThermometerSun className="w-4 h-4 inline mr-2 text-teal-500" />
              {t('tools.wateringSchedule.weatherConditions', 'Weather Conditions')}
            </label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
            >
              {weatherConditions.map(w => (
                <option key={w.name} value={w.name}>{w.name}</option>
              ))}
            </select>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{weather.description}</p>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.wateringSchedule.growingLocation', 'Growing Location')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setContainerGrowing(false)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !containerGrowing
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.wateringSchedule.inGround', 'In Ground')}
              </button>
              <button
                onClick={() => setContainerGrowing(true)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  containerGrowing
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.wateringSchedule.containers', 'Containers')}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Plants Info */}
        {selectedPlantsData.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-4 h-4 text-teal-500" />
              {t('tools.wateringSchedule.yourPlantsWateringNeeds', 'Your Plants\' Watering Needs')}
            </h4>
            <div className="space-y-3">
              {selectedPlantsData.map(plant => (
                <div key={plant.name} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{plant.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      plant.droughtTolerant
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {plant.droughtTolerant ? t('tools.wateringSchedule.droughtTolerant', 'Drought Tolerant') : t('tools.wateringSchedule.regularWater', 'Regular Water')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.wateringSchedule.frequency', 'Frequency:')}</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {plant.waterFrequency.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.wateringSchedule.amount', 'Amount:')}</span>
                      <span className={`font-medium ${getAmountColor(plant.waterAmount)}`}>
                        {plant.waterAmount}
                      </span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.wateringSchedule.duration', 'Duration:')}</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {amountToDescription[plant.waterAmount].duration}
                      </span>
                    </div>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>{t('tools.wateringSchedule.signsOfThirst', 'Signs of thirst:')}</strong> {plant.signs}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Week Schedule */}
        {generateSchedule.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-4 h-4 text-teal-500" />
              {t('tools.wateringSchedule.your2WeekWateringSchedule', 'Your 2-Week Watering Schedule')}
            </h4>
            <div className="space-y-2">
              {generateSchedule.map((day, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{day.date}</span>
                    <div className="flex flex-wrap gap-1">
                      {day.plants.map((plant, pIdx) => (
                        <span key={pIdx} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                          <Droplets className={`w-3 h-3 inline mr-1 ${getAmountColor(plant.amount)}`} />
                          {plant.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watering Amount Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wateringSchedule.wateringAmountGuide', 'Watering Amount Guide')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(amountToDescription).map(([amount, info]) => (
              <div key={amount} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`font-medium capitalize mb-1 ${getAmountColor(amount)}`}>
                  <Droplets className="w-4 h-4 inline mr-1" />
                  {amount}
                </div>
                <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div>Water: {info.inches}</div>
                  <div>Time: {info.duration}</div>
                  <div>{info.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-start gap-2">
            <Bell className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              <strong>{t('tools.wateringSchedule.bestPractices', 'Best Practices:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.wateringSchedule.waterEarlyMorning610', 'Water early morning (6-10 AM) to reduce evaporation')}</li>
                <li>{t('tools.wateringSchedule.waterAtTheBaseOf', 'Water at the base of plants, not on leaves')}</li>
                <li>{t('tools.wateringSchedule.deepInfrequentWateringIsBetter', 'Deep, infrequent watering is better than shallow, frequent')}</li>
                <li>{t('tools.wateringSchedule.adjustScheduleBasedOnRainfall', 'Adjust schedule based on rainfall and soil moisture')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.wateringSchedule.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.wateringSchedule.useTheFingerTestStick', 'Use the finger test - stick finger 2" in soil, water if dry')}</li>
                <li>{t('tools.wateringSchedule.containersDryOutFasterThan', 'Containers dry out faster than ground plantings')}</li>
                <li>{t('tools.wateringSchedule.mulchReducesWateringNeedsBy', 'Mulch reduces watering needs by 25-50%')}</li>
                <li>{t('tools.wateringSchedule.groupPlantsWithSimilarWater', 'Group plants with similar water needs together')}</li>
                <li>{t('tools.wateringSchedule.newlyPlantedItemsNeedMore', 'Newly planted items need more frequent watering until established')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WateringScheduleTool;
