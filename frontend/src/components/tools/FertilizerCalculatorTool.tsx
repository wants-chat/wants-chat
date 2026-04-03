import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Calculator, Beaker, Info, AlertTriangle, Scale, Droplets } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface FertilizerCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface FertilizerType {
  name: string;
  npk: [number, number, number]; // N-P-K percentages
  type: 'synthetic' | 'organic';
  releaseType: 'quick' | 'slow';
  description: string;
  applicationRate: number; // lbs per 1000 sq ft typical
}

interface CropNeed {
  name: string;
  category: string;
  nitrogenNeed: 'low' | 'medium' | 'high';
  nitrogenLbs: number; // lbs N per 1000 sq ft
  notes: string;
}

const fertilizerTypes: FertilizerType[] = [
  { name: '10-10-10 (Balanced)', npk: [10, 10, 10], type: 'synthetic', releaseType: 'quick', description: 'General purpose, balanced nutrition', applicationRate: 10 },
  { name: '20-20-20 (High Analysis)', npk: [20, 20, 20], type: 'synthetic', releaseType: 'quick', description: 'Concentrated balanced fertilizer', applicationRate: 5 },
  { name: '46-0-0 (Urea)', npk: [46, 0, 0], type: 'synthetic', releaseType: 'quick', description: 'High nitrogen, no P or K', applicationRate: 2 },
  { name: '21-0-0 (Ammonium Sulfate)', npk: [21, 0, 0], type: 'synthetic', releaseType: 'quick', description: 'Nitrogen with sulfur, acidifying', applicationRate: 5 },
  { name: '0-46-0 (Triple Super Phosphate)', npk: [0, 46, 0], type: 'synthetic', releaseType: 'slow', description: 'High phosphorus for roots/blooms', applicationRate: 2 },
  { name: '0-0-60 (Muriate of Potash)', npk: [0, 0, 60], type: 'synthetic', releaseType: 'quick', description: 'High potassium for fruit/stress', applicationRate: 2 },
  { name: '15-30-15 (Bloom Booster)', npk: [15, 30, 15], type: 'synthetic', releaseType: 'quick', description: 'High phosphorus for flowering', applicationRate: 4 },
  { name: '5-10-10 (Starter)', npk: [5, 10, 10], type: 'synthetic', releaseType: 'quick', description: 'Low N, high P-K for transplants', applicationRate: 10 },
  { name: '4-4-4 (Organic Blend)', npk: [4, 4, 4], type: 'organic', releaseType: 'slow', description: 'Gentle organic balanced feed', applicationRate: 20 },
  { name: '5-3-3 (Fish Emulsion)', npk: [5, 3, 3], type: 'organic', releaseType: 'quick', description: 'Liquid organic, fast acting', applicationRate: 25 },
  { name: '12-0-0 (Blood Meal)', npk: [12, 0, 0], type: 'organic', releaseType: 'slow', description: 'High nitrogen organic source', applicationRate: 8 },
  { name: '3-15-0 (Bone Meal)', npk: [3, 15, 0], type: 'organic', releaseType: 'slow', description: 'Organic phosphorus source', applicationRate: 10 },
  { name: '0-0-10 (Kelp Meal)', npk: [0, 0, 10], type: 'organic', releaseType: 'slow', description: 'Organic potassium + trace minerals', applicationRate: 10 },
  { name: '2-3-1 (Compost)', npk: [2, 3, 1], type: 'organic', releaseType: 'slow', description: 'Soil conditioner + mild nutrients', applicationRate: 100 },
];

const cropNeeds: CropNeed[] = [
  { name: 'Tomatoes', category: 'Vegetables', nitrogenNeed: 'medium', nitrogenLbs: 0.15, notes: 'Too much N = lots of leaves, few fruits' },
  { name: 'Peppers', category: 'Vegetables', nitrogenNeed: 'medium', nitrogenLbs: 0.12, notes: 'Similar to tomatoes, moderate feeding' },
  { name: 'Lettuce/Greens', category: 'Vegetables', nitrogenNeed: 'high', nitrogenLbs: 0.2, notes: 'Heavy nitrogen feeders for leaf growth' },
  { name: 'Corn', category: 'Vegetables', nitrogenNeed: 'high', nitrogenLbs: 0.25, notes: 'Very heavy feeder, side-dress mid-season' },
  { name: 'Beans/Peas', category: 'Vegetables', nitrogenNeed: 'low', nitrogenLbs: 0.05, notes: 'Fix own nitrogen, minimal fertilizer needed' },
  { name: 'Root Vegetables', category: 'Vegetables', nitrogenNeed: 'low', nitrogenLbs: 0.08, notes: 'Too much N = leafy tops, small roots' },
  { name: 'Squash/Cucumbers', category: 'Vegetables', nitrogenNeed: 'medium', nitrogenLbs: 0.15, notes: 'Moderate feeders, need good soil' },
  { name: 'Brassicas (Broccoli)', category: 'Vegetables', nitrogenNeed: 'high', nitrogenLbs: 0.2, notes: 'Heavy feeders, need consistent nutrition' },
  { name: 'Lawn (Maintenance)', category: 'Lawn', nitrogenNeed: 'medium', nitrogenLbs: 0.1, notes: '1 lb N per 1000 sq ft per application, 3-4x/year' },
  { name: 'Lawn (Establishment)', category: 'Lawn', nitrogenNeed: 'low', nitrogenLbs: 0.05, notes: 'Light feeding for new grass' },
  { name: 'Roses', category: 'Flowers', nitrogenNeed: 'medium', nitrogenLbs: 0.15, notes: 'Feed monthly during growing season' },
  { name: 'Annual Flowers', category: 'Flowers', nitrogenNeed: 'medium', nitrogenLbs: 0.12, notes: 'Regular feeding for continuous bloom' },
  { name: 'Fruit Trees', category: 'Fruit', nitrogenNeed: 'medium', nitrogenLbs: 0.1, notes: 'Apply in early spring before budbreak' },
  { name: 'Berry Bushes', category: 'Fruit', nitrogenNeed: 'low', nitrogenLbs: 0.08, notes: 'Light feeding, organic preferred' },
];

export const FertilizerCalculatorTool: React.FC<FertilizerCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedFertilizer, setSelectedFertilizer] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [areaSize, setAreaSize] = useState('1000');
  const [areaUnit, setAreaUnit] = useState<'sqft' | 'acres'>('sqft');
  const [calculationType, setCalculationType] = useState<'byArea' | 'byNeed'>('byArea');
  const [targetNitrogen, setTargetNitrogen] = useState('0.1');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.fertilizer) setSelectedFertilizer(String(prefillData.fertilizer));
      if (prefillData.crop) setSelectedCrop(String(prefillData.crop));
      if (prefillData.areaSize) setAreaSize(String(prefillData.areaSize));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const selectedFertilizerData = fertilizerTypes.find(f => f.name === selectedFertilizer);
  const selectedCropData = cropNeeds.find(c => c.name === selectedCrop);

  // Update target nitrogen when crop changes
  useEffect(() => {
    if (selectedCropData) {
      setTargetNitrogen(selectedCropData.nitrogenLbs.toString());
    }
  }, [selectedCropData]);

  const calculations = useMemo(() => {
    if (!selectedFertilizerData) return null;

    const area = parseFloat(areaSize) || 0;
    const areaSqFt = areaUnit === 'acres' ? area * 43560 : area;
    const areaMultiplier = areaSqFt / 1000;

    const [n, p, k] = selectedFertilizerData.npk;
    const targetN = parseFloat(targetNitrogen) || 0;

    // Calculate amount needed based on target nitrogen (lbs N per 1000 sq ft)
    // Amount = (Target N * Area / 1000) / (N% / 100)
    const fertilizerNeededForN = targetN > 0 && n > 0
      ? (targetN * areaMultiplier) / (n / 100)
      : 0;

    // Amount based on standard application rate
    const fertilizerByRate = selectedFertilizerData.applicationRate * areaMultiplier;

    // Choose which amount to use
    const fertilizerAmount = calculationType === 'byNeed' && targetN > 0
      ? fertilizerNeededForN
      : fertilizerByRate;

    // Calculate actual nutrients applied
    const actualN = fertilizerAmount * (n / 100);
    const actualP = fertilizerAmount * (p / 100);
    const actualK = fertilizerAmount * (k / 100);

    // Convert to different units
    const fertilizerOz = fertilizerAmount * 16;
    const fertilizerKg = fertilizerAmount * 0.453592;

    // Cost estimate (rough average)
    const costPer50lb = selectedFertilizerData.type === 'organic' ? 35 : 25;
    const estimatedCost = (fertilizerAmount / 50) * costPer50lb;

    return {
      fertilizerAmount: fertilizerAmount.toFixed(2),
      fertilizerOz: fertilizerOz.toFixed(1),
      fertilizerKg: fertilizerKg.toFixed(2),
      actualN: actualN.toFixed(3),
      actualP: actualP.toFixed(3),
      actualK: actualK.toFixed(3),
      areaSqFt: areaSqFt.toFixed(0),
      estimatedCost: estimatedCost.toFixed(2),
      bags50lb: Math.ceil(fertilizerAmount / 50),
    };
  }, [selectedFertilizerData, areaSize, areaUnit, targetNitrogen, calculationType]);

  const getNeedColor = (need: string) => {
    switch (need) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Beaker className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fertilizerCalculator.fertilizerCalculator', 'Fertilizer Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fertilizerCalculator.calculateFertilizerAmountsForYour', 'Calculate fertilizer amounts for your garden')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Calculation Type */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCalculationType('byArea')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              calculationType === 'byArea'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('tools.fertilizerCalculator.standardRate', 'Standard Rate')}
          </button>
          <button
            onClick={() => setCalculationType('byNeed')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              calculationType === 'byNeed'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('tools.fertilizerCalculator.byNitrogenNeed', 'By Nitrogen Need')}
          </button>
        </div>

        {/* Fertilizer Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Beaker className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.fertilizerCalculator.selectFertilizer', 'Select Fertilizer')}
          </label>
          <select
            value={selectedFertilizer}
            onChange={(e) => setSelectedFertilizer(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
          >
            <option value="">{t('tools.fertilizerCalculator.chooseAFertilizer', 'Choose a fertilizer...')}</option>
            <optgroup label="Synthetic">
              {fertilizerTypes.filter(f => f.type === 'synthetic').map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </optgroup>
            <optgroup label="Organic">
              {fertilizerTypes.filter(f => f.type === 'organic').map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Fertilizer Info */}
        {selectedFertilizerData && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">
                  {selectedFertilizerData.npk[0]}
                </div>
                <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white text-sm font-bold">
                  {selectedFertilizerData.npk[1]}
                </div>
                <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-sm font-bold">
                  {selectedFertilizerData.npk[2]}
                </div>
              </div>
              <div>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fertilizerCalculator.nPKRatio', 'N-P-K Ratio')}</span>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedFertilizerData.description}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className={`px-2 py-1 rounded ${selectedFertilizerData.type === 'organic' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                {selectedFertilizerData.type}
              </span>
              <span className={`px-2 py-1 rounded ${selectedFertilizerData.releaseType === 'slow' ? 'bg-purple-500/20 text-purple-500' : 'bg-amber-500/20 text-amber-500'}`}>
                {selectedFertilizerData.releaseType} release
              </span>
            </div>
          </div>
        )}

        {/* Crop Selection (for nitrogen calculation) */}
        {calculationType === 'byNeed' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Leaf className="w-4 h-4 inline mr-2 text-teal-500" />
              {t('tools.fertilizerCalculator.selectCropOptional', 'Select Crop (optional)')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
            >
              <option value="">{t('tools.fertilizerCalculator.chooseACrop', 'Choose a crop...')}</option>
              {Object.entries(
                cropNeeds.reduce((acc, crop) => {
                  if (!acc[crop.category]) acc[crop.category] = [];
                  acc[crop.category].push(crop);
                  return acc;
                }, {} as Record<string, CropNeed[]>)
              ).map(([category, crops]) => (
                <optgroup key={category} label={category}>
                  {crops.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* Crop Info */}
        {calculationType === 'byNeed' && selectedCropData && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCropData.name}</span>
              <span className={`font-bold ${getNeedColor(selectedCropData.nitrogenNeed)}`}>
                {selectedCropData.nitrogenNeed.toUpperCase()} Nitrogen Need
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedCropData.notes}</p>
            <p className={`text-sm mt-2 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
              Recommended: {selectedCropData.nitrogenLbs} lbs N per 1,000 sq ft
            </p>
          </div>
        )}

        {/* Target Nitrogen (manual override) */}
        {calculationType === 'byNeed' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.fertilizerCalculator.targetNitrogenLbsPer1', 'Target Nitrogen (lbs per 1,000 sq ft)')}
            </label>
            <input
              type="number"
              value={targetNitrogen}
              onChange={(e) => setTargetNitrogen(e.target.value)}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {/* Area Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.fertilizerCalculator.areaToFertilize', 'Area to Fertilize')}
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
              <option value="sqft">{t('tools.fertilizerCalculator.sqFt', 'sq ft')}</option>
              <option value="acres">acres</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            {[100, 500, 1000, 5000].map(size => (
              <button
                key={size}
                onClick={() => { setAreaSize(size.toString()); setAreaUnit('sqft'); }}
                className={`px-3 py-1 text-xs rounded ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {size} sq ft
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {selectedFertilizerData && calculations && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calculator className="w-4 h-4 text-teal-500" />
              {t('tools.fertilizerCalculator.fertilizerNeeded', 'Fertilizer Needed')}
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-teal-500/10">
                <div className="text-3xl font-bold text-teal-500">{calculations.fertilizerAmount}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>pounds</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-teal-500/10">
                <div className="text-3xl font-bold text-teal-500">{calculations.fertilizerOz}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ounces</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-teal-500/10">
                <div className="text-3xl font-bold text-teal-500">{calculations.fertilizerKg}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>kilograms</div>
              </div>
            </div>

            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.fertilizerCalculator.nutrientsApplied', 'Nutrients Applied:')}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.actualN}</span>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fertilizerCalculator.lbsNitrogen', 'lbs Nitrogen')}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.actualP}</span>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fertilizerCalculator.lbsPhosphorus', 'lbs Phosphorus')}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.actualK}</span>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fertilizerCalculator.lbsPotassium', 'lbs Potassium')}</div>
                </div>
              </div>
            </div>

            <div className={`mt-4 flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>50 lb bags needed: <strong className="text-teal-500">{calculations.bags50lb}</strong></span>
              <span>Est. cost: <strong className="text-teal-500">${calculations.estimatedCost}</strong></span>
            </div>
          </div>
        )}

        {/* NPK Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fertilizerCalculator.understandingNPK', 'Understanding N-P-K')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{t('tools.fertilizerCalculator.nitrogenN', 'Nitrogen (N)')}</span>
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.fertilizerCalculator.promotesLeafAndStemGrowth', 'Promotes leaf and stem growth. Essential for green, leafy vegetables.')}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{t('tools.fertilizerCalculator.phosphorusP', 'Phosphorus (P)')}</span>
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.fertilizerCalculator.supportsRootDevelopmentFloweringAnd', 'Supports root development, flowering, and fruiting.')}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{t('tools.fertilizerCalculator.potassiumK', 'Potassium (K)')}</span>
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.fertilizerCalculator.improvesDiseaseResistanceDroughtTolerance', 'Improves disease resistance, drought tolerance, and fruit quality.')}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              <strong>{t('tools.fertilizerCalculator.applicationTips', 'Application Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.fertilizerCalculator.alwaysWaterThoroughlyAfterApplying', 'Always water thoroughly after applying granular fertilizers')}</li>
                <li>{t('tools.fertilizerCalculator.avoidFertilizingDuringHotDry', 'Avoid fertilizing during hot, dry weather')}</li>
                <li>{t('tools.fertilizerCalculator.doNotApplyMoreThan', 'Do not apply more than recommended - can burn plants')}</li>
                <li>{t('tools.fertilizerCalculator.testSoilBeforeFertilizingTo', 'Test soil before fertilizing to know actual needs')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.fertilizerCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.fertilizerCalculator.organicFertilizersReleaseNutrientsSlowly', 'Organic fertilizers release nutrients slowly but improve soil health')}</li>
                <li>{t('tools.fertilizerCalculator.splitApplicationsHalfNowHalf', 'Split applications (half now, half later) work better than one heavy dose')}</li>
                <li>{t('tools.fertilizerCalculator.liquidFertilizersWorkFasterBut', 'Liquid fertilizers work faster but need more frequent application')}</li>
                <li>{t('tools.fertilizerCalculator.slowReleaseFertilizersAreMore', 'Slow-release fertilizers are more forgiving and last longer')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerCalculatorTool;
