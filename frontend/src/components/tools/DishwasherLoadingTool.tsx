import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Zap, AlertTriangle, Info, Layers, Sparkles, Timer } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DishwasherLoadingToolProps {
  uiConfig?: UIConfig;
}

type WaterHardness = 'soft' | 'medium' | 'hard' | 'veryHard';
type CycleType = 'quick' | 'normal' | 'heavy' | 'eco' | 'delicate' | 'sanitize';
type LoadSize = 'light' | 'medium' | 'full';

interface CycleConfig {
  name: string;
  duration: string;
  temp: string;
  waterUsage: string;
  bestFor: string;
  energyRating: number; // 1-5, lower is better
}

interface DetergentGuide {
  powder: string;
  liquid: string;
  pods: string;
}

export const DishwasherLoadingTool: React.FC<DishwasherLoadingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<'placement' | 'detergent' | 'cycles' | 'tips'>('placement');
  const [waterHardness, setWaterHardness] = useState<WaterHardness>('medium');
  const [selectedCycle, setSelectedCycle] = useState<CycleType>('normal');
  const [loadSize, setLoadSize] = useState<LoadSize>('medium');
  const [useRinseAid, setUseRinseAid] = useState(true);

  const hardnessLevels: Record<WaterHardness, { label: string; ppm: string }> = {
    soft: { label: 'Soft', ppm: '0-60 ppm' },
    medium: { label: 'Medium', ppm: '61-120 ppm' },
    hard: { label: 'Hard', ppm: '121-180 ppm' },
    veryHard: { label: 'Very Hard', ppm: '180+ ppm' },
  };

  const detergentByHardness: Record<WaterHardness, DetergentGuide> = {
    soft: { powder: '1 tbsp (15g)', liquid: '1 tbsp (15ml)', pods: '1 pod' },
    medium: { powder: '1.5 tbsp (22g)', liquid: '1.5 tbsp (22ml)', pods: '1 pod' },
    hard: { powder: '2 tbsp (30g)', liquid: '2 tbsp (30ml)', pods: '1-2 pods' },
    veryHard: { powder: '2.5 tbsp (37g)', liquid: '2.5 tbsp (37ml)', pods: '2 pods' },
  };

  const cycles: Record<CycleType, CycleConfig> = {
    quick: {
      name: 'Quick Wash',
      duration: '30-45 min',
      temp: '113-131°F (45-55°C)',
      waterUsage: '3-4 gal',
      bestFor: 'Lightly soiled, recently used dishes',
      energyRating: 2,
    },
    normal: {
      name: 'Normal',
      duration: '1.5-2 hours',
      temp: '140-145°F (60-63°C)',
      waterUsage: '4-6 gal',
      bestFor: 'Everyday dishes with typical food residue',
      energyRating: 3,
    },
    heavy: {
      name: 'Heavy/Pots & Pans',
      duration: '2-2.5 hours',
      temp: '150-160°F (65-71°C)',
      waterUsage: '6-8 gal',
      bestFor: 'Baked-on food, greasy pots, casserole dishes',
      energyRating: 5,
    },
    eco: {
      name: 'Eco/Energy Saver',
      duration: '2.5-3 hours',
      temp: '120-130°F (49-54°C)',
      waterUsage: '2-3 gal',
      bestFor: 'Lightly soiled items when not in a hurry',
      energyRating: 1,
    },
    delicate: {
      name: 'Delicate/China',
      duration: '1-1.5 hours',
      temp: '113-122°F (45-50°C)',
      waterUsage: '3-4 gal',
      bestFor: 'Fine china, crystal, delicate glassware',
      energyRating: 2,
    },
    sanitize: {
      name: 'Sanitize',
      duration: '2-2.5 hours',
      temp: '155-165°F (68-74°C)',
      waterUsage: '5-7 gal',
      bestFor: 'Baby bottles, cutting boards, germ elimination',
      energyRating: 5,
    },
  };

  const placementGuide = {
    topRack: [
      { item: 'Glasses & Cups', tip: 'Place at an angle for water drainage' },
      { item: 'Plastic containers', tip: 'Secure to prevent flipping from water pressure' },
      { item: 'Small bowls', tip: 'Face down between tines' },
      { item: 'Mugs', tip: 'Angle handles for stability' },
      { item: 'Wine glasses', tip: 'Use stemware holders if available' },
    ],
    bottomRack: [
      { item: 'Plates', tip: 'Face center, largest at back' },
      { item: 'Pots & Pans', tip: 'Face down at sides, avoid blocking spray arm' },
      { item: 'Cutting boards', tip: 'Along sides, not blocking water flow' },
      { item: 'Large bowls', tip: 'At an angle for water access' },
      { item: 'Baking sheets', tip: 'Along back or sides' },
    ],
    silverwareBasket: [
      { item: 'Forks & Spoons', tip: 'Mix handles up/down to prevent nesting' },
      { item: 'Knives', tip: 'Blade down for safety' },
      { item: 'Large utensils', tip: 'Lay flat on top rack if they fit' },
    ],
  };

  const itemsToAvoid = [
    { item: 'Cast iron', reason: 'Strips seasoning, causes rust' },
    { item: 'Wooden items', reason: 'Warps, cracks, loses finish' },
    { item: 'Non-stick pans', reason: 'High heat damages coating' },
    { item: 'Crystal/Fine china', reason: 'May crack (use delicate cycle only)' },
    { item: 'Sharp knives', reason: 'Dulls blades, damages rack coating' },
    { item: 'Copper cookware', reason: 'Discolors and loses luster' },
    { item: 'Insulated mugs', reason: 'Traps water, damages insulation' },
    { item: 'Aluminum', reason: 'May discolor and pit' },
  ];

  const energySavingTips = [
    'Run full loads only - uses same water regardless of load size',
    'Skip pre-rinsing - scrape food, let dishwasher do the work',
    'Use eco cycle for lightly soiled dishes',
    'Run during off-peak hours (evening/night)',
    'Keep the filter clean for optimal efficiency',
    'Air dry instead of heat dry to save 15% energy',
    'Use the delay start to run during cheaper energy rates',
  ];

  const capacityEstimate = useMemo(() => {
    const baseCapacity = { plates: 12, glasses: 8, bowls: 6, utensils: 24 };
    const multipliers = { light: 0.5, medium: 0.75, full: 1 };
    const mult = multipliers[loadSize];

    return {
      plates: Math.round(baseCapacity.plates * mult),
      glasses: Math.round(baseCapacity.glasses * mult),
      bowls: Math.round(baseCapacity.bowls * mult),
      utensils: Math.round(baseCapacity.utensils * mult),
    };
  }, [loadSize]);

  const rinseAidRecommendation = useMemo(() => {
    if (!useRinseAid) return 'Not using rinse aid';
    const settings: Record<WaterHardness, string> = {
      soft: 'Level 1-2 (minimal)',
      medium: 'Level 2-3',
      hard: 'Level 3-4',
      veryHard: 'Level 4-5 (maximum)',
    };
    return settings[waterHardness];
  }, [waterHardness, useRinseAid]);

  const currentCycle = cycles[selectedCycle];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['placement', 'detergent', 'cycles', 'tips'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }
      if (params.waterHardness && ['soft', 'medium', 'hard', 'veryHard'].includes(params.waterHardness)) {
        setWaterHardness(params.waterHardness as WaterHardness);
        hasChanges = true;
      }
      if (params.cycleType && ['quick', 'normal', 'heavy', 'eco', 'delicate', 'sanitize'].includes(params.cycleType)) {
        setSelectedCycle(params.cycleType as CycleType);
        hasChanges = true;
      }
      if (params.loadSize && ['light', 'medium', 'full'].includes(params.loadSize)) {
        setLoadSize(params.loadSize as LoadSize);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const tabs = [
    { id: 'placement', label: 'Placement', icon: Layers },
    { id: 'detergent', label: 'Detergent', icon: Droplets },
    { id: 'cycles', label: 'Cycles', icon: Timer },
    { id: 'tips', label: 'Tips', icon: Sparkles },
  ] as const;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Droplets className="w-5 h-5 text-blue-500" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.dishwasherLoadingOptimizer', 'Dishwasher Loading Optimizer')}</h3>
              {isPrefilled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.dishwasherLoading.autoFilled', 'Auto-filled')}
                </span>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dishwasherLoading.maximizeEfficiencyAndCleanliness', 'Maximize efficiency and cleanliness')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 ${activeTab === tab.id ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Placement Tab */}
        {activeTab === 'placement' && (
          <div className="space-y-4">
            {/* Top Rack */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.topRack', 'Top Rack')}</h4>
              <div className="space-y-2">
                {placementGuide.topRack.map((item, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">{item.item}:</span>{' '}
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Rack */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.bottomRack', 'Bottom Rack')}</h4>
              <div className="space-y-2">
                {placementGuide.bottomRack.map((item, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">{item.item}:</span>{' '}
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Silverware */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.silverwareBasket', 'Silverware Basket')}</h4>
              <div className="space-y-2">
                {placementGuide.silverwareBasket.map((item, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">{item.item}:</span>{' '}
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity Optimizer */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.dishwasherLoading.estimateLoadSize', 'Estimate Load Size')}
              </label>
              <div className="flex gap-2">
                {(['light', 'medium', 'full'] as LoadSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setLoadSize(size)}
                    className={`flex-1 py-2 rounded-lg capitalize ${loadSize === size ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{capacityEstimate.plates}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dishwasherLoading.plates', 'Plates')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{capacityEstimate.glasses}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dishwasherLoading.glasses', 'Glasses')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{capacityEstimate.bowls}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dishwasherLoading.bowls', 'Bowls')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{capacityEstimate.utensils}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dishwasherLoading.utensils', 'Utensils')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detergent Tab */}
        {activeTab === 'detergent' && (
          <div className="space-y-4">
            {/* Water Hardness Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.dishwasherLoading.waterHardnessLevel', 'Water Hardness Level')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(hardnessLevels) as WaterHardness[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setWaterHardness(level)}
                    className={`py-2 px-3 rounded-lg text-sm ${waterHardness === level ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <div>{hardnessLevels[level].label}</div>
                    <div className={`text-xs ${waterHardness === level ? 'text-blue-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {hardnessLevels[level].ppm}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detergent Amounts */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.dishwasherLoading.recommendedDetergentAmount', 'Recommended Detergent Amount')}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.dishwasherLoading.powder', 'Powder')}</span>
                  <span className="font-medium text-blue-500">{detergentByHardness[waterHardness].powder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.dishwasherLoading.liquid', 'Liquid')}</span>
                  <span className="font-medium text-blue-500">{detergentByHardness[waterHardness].liquid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.dishwasherLoading.podsTablets', 'Pods/Tablets')}</span>
                  <span className="font-medium text-blue-500">{detergentByHardness[waterHardness].pods}</span>
                </div>
              </div>
            </div>

            {/* Rinse Aid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.dishwasherLoading.useRinseAid', 'Use Rinse Aid?')}
                </label>
                <button
                  onClick={() => setUseRinseAid(!useRinseAid)}
                  className={`w-12 h-6 rounded-full transition-colors ${useRinseAid ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${useRinseAid ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.rinseAidSetting', 'Rinse Aid Setting')}</span>
                </div>
                <div className="text-xl font-bold text-blue-500">{rinseAidRecommendation}</div>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {useRinseAid
                    ? t('tools.dishwasherLoading.rinseAidHelpsPreventWater', 'Rinse aid helps prevent water spots and improves drying.') : t('tools.dishwasherLoading.considerUsingRinseAidFor', 'Consider using rinse aid for spot-free dishes, especially with hard water.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cycles Tab */}
        {activeTab === 'cycles' && (
          <div className="space-y-4">
            {/* Cycle Selection */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cycles) as CycleType[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setSelectedCycle(cycle)}
                  className={`py-2 px-3 rounded-lg text-sm ${selectedCycle === cycle ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {cycles[cycle].name}
                </button>
              ))}
            </div>

            {/* Cycle Details */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentCycle.name}</h4>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Zap
                      key={i}
                      className={`w-4 h-4 ${i < currentCycle.energyRating ? 'text-yellow-500' : isDark ? 'text-gray-700' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.dishwasherLoading.duration', 'Duration:')}</span> {currentCycle.duration}
                </div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.dishwasherLoading.temp', 'Temp:')}</span> {currentCycle.temp}
                </div>
                <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">{t('tools.dishwasherLoading.waterUsage', 'Water Usage:')}</span> {currentCycle.waterUsage}
                </div>
              </div>
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">{t('tools.dishwasherLoading.bestFor', 'Best for:')}</span> {currentCycle.bestFor}
              </p>
            </div>

            {/* Cycle Comparison */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.quickComparison', 'Quick Comparison')}</h4>
              <div className="space-y-2">
                {(Object.keys(cycles) as CycleType[]).map((cycle) => (
                  <div key={cycle} className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{cycles[cycle].name}</span>
                    <div className="flex items-center gap-3">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{cycles[cycle].duration}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mx-0.5 ${i < cycles[cycle].energyRating ? 'bg-yellow-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            {/* Items to Avoid */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.itemsToAvoid', 'Items to Avoid')}</h4>
              </div>
              <div className="space-y-2">
                {itemsToAvoid.map((item, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium text-red-500">{item.item}:</span>{' '}
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Energy Saving Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-green-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dishwasherLoading.energySavingTips', 'Energy Saving Tips')}</h4>
              </div>
              <ul className="space-y-2">
                {energySavingTips.map((tip, idx) => (
                  <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start gap-2`}>
                    <span className="text-green-500 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* General Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.dishwasherLoading.proTips', 'Pro Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Clean the filter monthly for optimal performance</li>
                    <li>• Run hot water in sink before starting for faster heating</li>
                    <li>• Leave door slightly ajar after cycle for faster drying</li>
                    <li>• Load dishes so water can reach all surfaces</li>
                    <li>• Don't block the spray arms with tall items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishwasherLoadingTool;
