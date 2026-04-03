import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Apple, Calendar, Scale, Info, TrendingUp, Leaf, Sun, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface HarvestEstimatorToolProps {
  uiConfig?: UIConfig;
}

interface CropYield {
  name: string;
  category: string;
  yieldPerPlant: number; // in lbs
  yieldUnit: string;
  harvestWindow: number; // days of harvest
  daysToHarvest: number;
  plantsPerSqFt: number;
  successRate: number; // percentage
  marketPrice: number; // $ per lb
  notes: string;
}

const cropYields: CropYield[] = [
  { name: 'Tomatoes (Determinate)', category: 'Vegetables', yieldPerPlant: 10, yieldUnit: 'lbs', harvestWindow: 21, daysToHarvest: 70, plantsPerSqFt: 0.25, successRate: 85, marketPrice: 3.50, notes: 'Bush type, concentrated harvest' },
  { name: 'Tomatoes (Indeterminate)', category: 'Vegetables', yieldPerPlant: 20, yieldUnit: 'lbs', harvestWindow: 60, daysToHarvest: 75, plantsPerSqFt: 0.2, successRate: 80, marketPrice: 3.50, notes: 'Vining type, extended harvest' },
  { name: 'Bell Peppers', category: 'Vegetables', yieldPerPlant: 6, yieldUnit: 'lbs', harvestWindow: 45, daysToHarvest: 75, plantsPerSqFt: 0.44, successRate: 85, marketPrice: 4.00, notes: 'Pick green or wait for color' },
  { name: 'Hot Peppers', category: 'Vegetables', yieldPerPlant: 4, yieldUnit: 'lbs', harvestWindow: 60, daysToHarvest: 80, plantsPerSqFt: 0.5, successRate: 90, marketPrice: 5.00, notes: 'Prolific producers' },
  { name: 'Zucchini', category: 'Vegetables', yieldPerPlant: 8, yieldUnit: 'lbs', harvestWindow: 45, daysToHarvest: 50, plantsPerSqFt: 0.25, successRate: 90, marketPrice: 2.00, notes: 'Very productive, harvest young' },
  { name: 'Summer Squash', category: 'Vegetables', yieldPerPlant: 6, yieldUnit: 'lbs', harvestWindow: 45, daysToHarvest: 50, plantsPerSqFt: 0.25, successRate: 85, marketPrice: 2.00, notes: 'Similar to zucchini' },
  { name: 'Winter Squash', category: 'Vegetables', yieldPerPlant: 12, yieldUnit: 'lbs', harvestWindow: 14, daysToHarvest: 100, plantsPerSqFt: 0.1, successRate: 80, marketPrice: 1.50, notes: 'Stores well' },
  { name: 'Cucumbers', category: 'Vegetables', yieldPerPlant: 5, yieldUnit: 'lbs', harvestWindow: 30, daysToHarvest: 55, plantsPerSqFt: 0.5, successRate: 85, marketPrice: 2.50, notes: 'Pick frequently for more yield' },
  { name: 'Bush Beans', category: 'Vegetables', yieldPerPlant: 0.5, yieldUnit: 'lbs', harvestWindow: 14, daysToHarvest: 55, plantsPerSqFt: 9, successRate: 90, marketPrice: 4.00, notes: 'Quick crop, succession plant' },
  { name: 'Pole Beans', category: 'Vegetables', yieldPerPlant: 1, yieldUnit: 'lbs', harvestWindow: 45, daysToHarvest: 65, plantsPerSqFt: 4, successRate: 85, marketPrice: 4.00, notes: 'Extended harvest period' },
  { name: 'Lettuce (Leaf)', category: 'Vegetables', yieldPerPlant: 0.5, yieldUnit: 'lbs', harvestWindow: 30, daysToHarvest: 45, plantsPerSqFt: 4, successRate: 90, marketPrice: 5.00, notes: 'Cut and come again' },
  { name: 'Lettuce (Head)', category: 'Vegetables', yieldPerPlant: 1, yieldUnit: 'lbs', harvestWindow: 7, daysToHarvest: 70, plantsPerSqFt: 1, successRate: 85, marketPrice: 3.00, notes: 'One-time harvest' },
  { name: 'Kale', category: 'Vegetables', yieldPerPlant: 2, yieldUnit: 'lbs', harvestWindow: 90, daysToHarvest: 55, plantsPerSqFt: 1, successRate: 95, marketPrice: 4.00, notes: 'Harvest outer leaves' },
  { name: 'Spinach', category: 'Vegetables', yieldPerPlant: 0.3, yieldUnit: 'lbs', harvestWindow: 21, daysToHarvest: 40, plantsPerSqFt: 9, successRate: 85, marketPrice: 6.00, notes: 'Bolts in heat' },
  { name: 'Carrots', category: 'Vegetables', yieldPerPlant: 0.15, yieldUnit: 'lbs', harvestWindow: 30, daysToHarvest: 70, plantsPerSqFt: 16, successRate: 75, marketPrice: 2.00, notes: 'Thin seedlings properly' },
  { name: 'Beets', category: 'Vegetables', yieldPerPlant: 0.25, yieldUnit: 'lbs', harvestWindow: 21, daysToHarvest: 55, plantsPerSqFt: 9, successRate: 85, marketPrice: 3.00, notes: 'Greens also edible' },
  { name: 'Onions', category: 'Vegetables', yieldPerPlant: 0.5, yieldUnit: 'lbs', harvestWindow: 14, daysToHarvest: 100, plantsPerSqFt: 9, successRate: 90, marketPrice: 1.50, notes: 'Store well when cured' },
  { name: 'Garlic', category: 'Vegetables', yieldPerPlant: 0.1, yieldUnit: 'lbs', harvestWindow: 7, daysToHarvest: 240, plantsPerSqFt: 4, successRate: 95, marketPrice: 8.00, notes: 'Fall planted, summer harvest' },
  { name: 'Potatoes', category: 'Vegetables', yieldPerPlant: 2, yieldUnit: 'lbs', harvestWindow: 14, daysToHarvest: 90, plantsPerSqFt: 1, successRate: 90, marketPrice: 1.50, notes: '10:1 yield ratio typical' },
  { name: 'Sweet Corn', category: 'Vegetables', yieldPerPlant: 0.5, yieldUnit: 'ears', harvestWindow: 10, daysToHarvest: 75, plantsPerSqFt: 1, successRate: 80, marketPrice: 0.75, notes: 'Plant in blocks for pollination' },
  { name: 'Broccoli', category: 'Vegetables', yieldPerPlant: 1, yieldUnit: 'lbs', harvestWindow: 21, daysToHarvest: 80, plantsPerSqFt: 0.44, successRate: 85, marketPrice: 3.00, notes: 'Side shoots after main head' },
  { name: 'Cabbage', category: 'Vegetables', yieldPerPlant: 3, yieldUnit: 'lbs', harvestWindow: 14, daysToHarvest: 80, plantsPerSqFt: 0.44, successRate: 90, marketPrice: 1.50, notes: 'One head per plant' },
  { name: 'Strawberries', category: 'Fruit', yieldPerPlant: 1, yieldUnit: 'lbs', harvestWindow: 21, daysToHarvest: 90, plantsPerSqFt: 4, successRate: 85, marketPrice: 6.00, notes: 'Best yield in year 2-3' },
  { name: 'Blueberries', category: 'Fruit', yieldPerPlant: 5, yieldUnit: 'lbs', harvestWindow: 30, daysToHarvest: 730, plantsPerSqFt: 0.06, successRate: 90, marketPrice: 8.00, notes: 'Mature bushes, 3+ years old' },
  { name: 'Basil', category: 'Herbs', yieldPerPlant: 0.5, yieldUnit: 'lbs', harvestWindow: 60, daysToHarvest: 30, plantsPerSqFt: 4, successRate: 90, marketPrice: 15.00, notes: 'Pinch flowers, harvest often' },
  { name: 'Cilantro', category: 'Herbs', yieldPerPlant: 0.25, yieldUnit: 'lbs', harvestWindow: 21, daysToHarvest: 45, plantsPerSqFt: 4, successRate: 80, marketPrice: 12.00, notes: 'Bolts quickly, succession plant' },
];

export const HarvestEstimatorTool: React.FC<HarvestEstimatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [plantCount, setPlantCount] = useState('10');
  const [gardenSize, setGardenSize] = useState('32');
  const [inputMode, setInputMode] = useState<'plants' | 'area'>('plants');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.crop) setSelectedCrop(String(prefillData.crop));
      if (prefillData.plantCount) setPlantCount(String(prefillData.plantCount));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const filteredCrops = useMemo(() => {
    if (categoryFilter === 'all') return cropYields;
    return cropYields.filter(c => c.category === categoryFilter);
  }, [categoryFilter]);

  const selectedCropData = cropYields.find(c => c.name === selectedCrop);

  const calculations = useMemo(() => {
    if (!selectedCropData) return null;

    let plants: number;
    if (inputMode === 'plants') {
      plants = parseFloat(plantCount) || 0;
    } else {
      const area = parseFloat(gardenSize) || 0;
      plants = Math.floor(area * selectedCropData.plantsPerSqFt);
    }

    // Calculate yield
    const grossYield = plants * selectedCropData.yieldPerPlant;
    const expectedYield = grossYield * (selectedCropData.successRate / 100);
    const lowEstimate = expectedYield * 0.7;
    const highEstimate = expectedYield * 1.3;

    // Calculate dates
    const plantDate = new Date(plantingDate);
    const harvestStart = new Date(plantDate);
    harvestStart.setDate(harvestStart.getDate() + selectedCropData.daysToHarvest);
    const harvestEnd = new Date(harvestStart);
    harvestEnd.setDate(harvestEnd.getDate() + selectedCropData.harvestWindow);

    // Calculate value
    const marketValue = expectedYield * selectedCropData.marketPrice;

    // Space needed
    const spaceNeeded = plants / selectedCropData.plantsPerSqFt;

    return {
      plants: plants.toFixed(0),
      grossYield: grossYield.toFixed(1),
      expectedYield: expectedYield.toFixed(1),
      lowEstimate: lowEstimate.toFixed(1),
      highEstimate: highEstimate.toFixed(1),
      harvestStart: harvestStart.toLocaleDateString(),
      harvestEnd: harvestEnd.toLocaleDateString(),
      harvestDuration: selectedCropData.harvestWindow,
      marketValue: marketValue.toFixed(2),
      spaceNeeded: spaceNeeded.toFixed(0),
      yieldUnit: selectedCropData.yieldUnit,
      daysToHarvest: selectedCropData.daysToHarvest,
      successRate: selectedCropData.successRate,
    };
  }, [selectedCropData, plantCount, gardenSize, inputMode, plantingDate]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Apple className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.harvestEstimator.harvestEstimator', 'Harvest Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.harvestEstimator.estimateYourCropYieldsAnd', 'Estimate your crop yields and harvest dates')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Vegetables', 'Fruit', 'Herbs'].map(cat => (
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
              {cat === 'all' ? 'All Crops' : cat}
            </button>
          ))}
        </div>

        {/* Crop Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Leaf className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.harvestEstimator.selectCrop', 'Select Crop')}
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
          >
            <option value="">{t('tools.harvestEstimator.chooseACrop', 'Choose a crop...')}</option>
            {filteredCrops.map(crop => (
              <option key={crop.name} value={crop.name}>{crop.name}</option>
            ))}
          </select>
        </div>

        {/* Crop Info */}
        {selectedCropData && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCropData.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                {selectedCropData.category}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.yieldPlant', 'Yield/Plant:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCropData.yieldPerPlant} {selectedCropData.yieldUnit}</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.days', 'Days:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCropData.daysToHarvest}</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.success', 'Success:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCropData.successRate}%</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.price', 'Price:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${selectedCropData.marketPrice}/lb</span>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedCropData.notes}</p>
          </div>
        )}

        {/* Input Mode */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInputMode('plants')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'plants'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('tools.harvestEstimator.byPlantCount', 'By Plant Count')}
          </button>
          <button
            onClick={() => setInputMode('area')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'area'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('tools.harvestEstimator.byGardenArea', 'By Garden Area')}
          </button>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          {inputMode === 'plants' ? (
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestEstimator.numberOfPlants', 'Number of Plants')}</label>
              <input
                type="number"
                value={plantCount}
                onChange={(e) => setPlantCount(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.harvestEstimator.gardenAreaSqFt', 'Garden Area (sq ft)')}</label>
              <input
                type="number"
                value={gardenSize}
                onChange={(e) => setGardenSize(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.harvestEstimator.plantingDate', 'Planting Date')}
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Results */}
        {selectedCropData && calculations && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="w-4 h-4 text-teal-500" />
              Harvest Estimates for {selectedCropData.name}
            </h4>

            {/* Yield Estimates */}
            <div className="mb-6">
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Expected Yield from {calculations.plants} plants:
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-amber-500/10">
                  <div className="text-2xl font-bold text-amber-500">{calculations.lowEstimate}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.yieldUnit} (low)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-teal-500/10 ring-2 ring-teal-500">
                  <div className="text-3xl font-bold text-teal-500">{calculations.expectedYield}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.yieldUnit} (expected)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-500">{calculations.highEstimate}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.yieldUnit} (high)</div>
                </div>
              </div>
            </div>

            {/* Harvest Timeline */}
            <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-teal-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.harvestEstimator.harvestTimeline', 'Harvest Timeline')}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.daysToHarvest', 'Days to Harvest')}</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.daysToHarvest} days</div>
                </div>
                <div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.harvestStarts', 'Harvest Starts')}</div>
                  <div className={`font-bold text-teal-500`}>{calculations.harvestStart}</div>
                </div>
                <div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.harvestEnds', 'Harvest Ends')}</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.harvestEnd}</div>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-green-500" style={{ width: `${(calculations.harvestDuration / 90) * 100}%` }}></div>
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {calculations.harvestDuration} day harvest window
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.spaceNeeded', 'Space Needed')}</span>
                </div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.spaceNeeded} sq ft</div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.successRate', 'Success Rate')}</span>
                </div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.successRate}%</div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.harvestEstimator.marketValue', 'Market Value')}</span>
                </div>
                <div className="font-bold text-green-500">${calculations.marketValue}</div>
              </div>
            </div>
          </div>
        )}

        {/* Yield Comparison Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.harvestEstimator.yieldComparisonPerPlant', 'Yield Comparison (per plant)')}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2 px-2">{t('tools.harvestEstimator.crop', 'Crop')}</th>
                  <th className="text-center py-2 px-2">{t('tools.harvestEstimator.yield', 'Yield')}</th>
                  <th className="text-center py-2 px-2">{t('tools.harvestEstimator.days2', 'Days')}</th>
                  <th className="text-center py-2 px-2">$/lb</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.slice(0, 8).map((crop, idx) => (
                  <tr
                    key={crop.name}
                    className={`${idx % 2 === 0 ? '' : isDark ? 'bg-gray-700/50' : 'bg-white'} cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedCrop(crop.name)}
                  >
                    <td className={`py-2 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{crop.name}</td>
                    <td className="text-center py-2 px-2">{crop.yieldPerPlant} {crop.yieldUnit}</td>
                    <td className="text-center py-2 px-2">{crop.daysToHarvest}</td>
                    <td className="text-center py-2 px-2">${crop.marketPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.harvestEstimator.tipsForBetterYields', 'Tips for Better Yields:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.harvestEstimator.actualYieldsVaryBasedOn', 'Actual yields vary based on soil quality, weather, and care')}</li>
                <li>{t('tools.harvestEstimator.harvestFrequentlyToEncourageContinued', 'Harvest frequently to encourage continued production')}</li>
                <li>{t('tools.harvestEstimator.healthyWellWateredPlantsProduce', 'Healthy, well-watered plants produce more')}</li>
                <li>{t('tools.harvestEstimator.successionPlantingExtendsYourHarvest', 'Succession planting extends your harvest window')}</li>
                <li>{t('tools.harvestEstimator.marketPricesVaryBySeason', 'Market prices vary by season and location')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarvestEstimatorTool;
