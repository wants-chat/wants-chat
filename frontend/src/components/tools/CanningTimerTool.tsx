import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Mountain, Thermometer, CheckSquare, AlertTriangle, Info, Droplets, Gauge, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type FoodCategory = 'fruits' | 'tomatoes' | 'pickles' | 'jams' | 'vegetables' | 'meats' | 'soups';
type JarSize = 'half-pint' | 'pint' | 'quart';
type ProcessingMethod = 'water-bath' | 'pressure';

interface FoodConfig {
  name: string;
  category: FoodCategory;
  method: ProcessingMethod;
  baseTime: Record<JarSize, number>; // minutes
  pressure: number; // PSI for pressure canning (0 for water bath)
  notes: string;
}

interface AltitudeAdjustment {
  range: string;
  waterBathAdd: number; // minutes to add
  pressureAdd: number; // PSI to add
}

const altitudeAdjustments: AltitudeAdjustment[] = [
  { range: '0-1,000 ft', waterBathAdd: 0, pressureAdd: 0 },
  { range: '1,001-3,000 ft', waterBathAdd: 5, pressureAdd: 0 },
  { range: '3,001-6,000 ft', waterBathAdd: 10, pressureAdd: 5 },
  { range: '6,001-8,000 ft', waterBathAdd: 15, pressureAdd: 5 },
  { range: '8,001-10,000 ft', waterBathAdd: 20, pressureAdd: 10 },
];

const foods: FoodConfig[] = [
  // Fruits (Water Bath)
  { name: 'Apples (sliced)', category: 'fruits', method: 'water-bath', baseTime: { 'half-pint': 15, 'pint': 20, 'quart': 20 }, pressure: 0, notes: 'Hot pack recommended' },
  { name: 'Peaches', category: 'fruits', method: 'water-bath', baseTime: { 'half-pint': 20, 'pint': 25, 'quart': 30 }, pressure: 0, notes: 'Remove skins by blanching' },
  { name: 'Pears', category: 'fruits', method: 'water-bath', baseTime: { 'half-pint': 20, 'pint': 20, 'quart': 25 }, pressure: 0, notes: 'Use firm, ripe pears' },
  { name: 'Berries', category: 'fruits', method: 'water-bath', baseTime: { 'half-pint': 10, 'pint': 15, 'quart': 15 }, pressure: 0, notes: 'Handle gently to prevent crushing' },

  // Tomatoes (Water Bath - with added acid)
  { name: 'Tomatoes (crushed)', category: 'tomatoes', method: 'water-bath', baseTime: { 'half-pint': 35, 'pint': 35, 'quart': 45 }, pressure: 0, notes: 'Add 1 tbsp lemon juice per pint' },
  { name: 'Tomato Sauce', category: 'tomatoes', method: 'water-bath', baseTime: { 'half-pint': 35, 'pint': 35, 'quart': 40 }, pressure: 0, notes: 'Add citric acid or lemon juice' },
  { name: 'Salsa', category: 'tomatoes', method: 'water-bath', baseTime: { 'half-pint': 15, 'pint': 15, 'quart': 20 }, pressure: 0, notes: 'Use tested recipe only' },

  // Pickles (Water Bath)
  { name: 'Dill Pickles', category: 'pickles', method: 'water-bath', baseTime: { 'half-pint': 10, 'pint': 10, 'quart': 15 }, pressure: 0, notes: 'Use pickling cucumbers' },
  { name: 'Bread & Butter Pickles', category: 'pickles', method: 'water-bath', baseTime: { 'half-pint': 10, 'pint': 10, 'quart': 15 }, pressure: 0, notes: 'Slice uniformly' },
  { name: 'Pickled Beets', category: 'pickles', method: 'water-bath', baseTime: { 'half-pint': 30, 'pint': 30, 'quart': 30 }, pressure: 0, notes: 'Cook beets until tender first' },

  // Jams & Jellies (Water Bath)
  { name: 'Strawberry Jam', category: 'jams', method: 'water-bath', baseTime: { 'half-pint': 10, 'pint': 10, 'quart': 15 }, pressure: 0, notes: 'Use pectin for best set' },
  { name: 'Apple Butter', category: 'jams', method: 'water-bath', baseTime: { 'half-pint': 5, 'pint': 10, 'quart': 10 }, pressure: 0, notes: 'Cook until thick' },
  { name: 'Grape Jelly', category: 'jams', method: 'water-bath', baseTime: { 'half-pint': 5, 'pint': 10, 'quart': 10 }, pressure: 0, notes: 'Strain juice thoroughly' },

  // Vegetables (Pressure Canning)
  { name: 'Green Beans', category: 'vegetables', method: 'pressure', baseTime: { 'half-pint': 20, 'pint': 20, 'quart': 25 }, pressure: 10, notes: 'Raw or hot pack' },
  { name: 'Corn (whole kernel)', category: 'vegetables', method: 'pressure', baseTime: { 'half-pint': 55, 'pint': 55, 'quart': 85 }, pressure: 10, notes: 'Hot pack recommended' },
  { name: 'Carrots', category: 'vegetables', method: 'pressure', baseTime: { 'half-pint': 25, 'pint': 25, 'quart': 30 }, pressure: 10, notes: 'Peel and slice' },
  { name: 'Potatoes', category: 'vegetables', method: 'pressure', baseTime: { 'half-pint': 35, 'pint': 35, 'quart': 40 }, pressure: 10, notes: 'Cubed, 1-2 inch pieces' },

  // Meats (Pressure Canning)
  { name: 'Chicken (boneless)', category: 'meats', method: 'pressure', baseTime: { 'half-pint': 65, 'pint': 75, 'quart': 90 }, pressure: 10, notes: 'Raw or hot pack' },
  { name: 'Beef (cubed)', category: 'meats', method: 'pressure', baseTime: { 'half-pint': 65, 'pint': 75, 'quart': 90 }, pressure: 10, notes: 'Trim fat before packing' },
  { name: 'Ground Meat', category: 'meats', method: 'pressure', baseTime: { 'half-pint': 65, 'pint': 75, 'quart': 90 }, pressure: 10, notes: 'Brown before packing' },

  // Soups & Stocks (Pressure Canning)
  { name: 'Chicken Stock', category: 'soups', method: 'pressure', baseTime: { 'half-pint': 20, 'pint': 20, 'quart': 25 }, pressure: 10, notes: 'Skim fat before canning' },
  { name: 'Beef Stock', category: 'soups', method: 'pressure', baseTime: { 'half-pint': 20, 'pint': 20, 'quart': 25 }, pressure: 10, notes: 'Strain before canning' },
  { name: 'Vegetable Soup', category: 'soups', method: 'pressure', baseTime: { 'half-pint': 55, 'pint': 60, 'quart': 75 }, pressure: 10, notes: 'Do not thicken before canning' },
];

const safetyChecklist = [
  { id: 'inspect-jars', label: 'Inspect jars for cracks or chips', critical: true },
  { id: 'new-lids', label: 'Use new lids (bands can be reused)', critical: true },
  { id: 'clean-equipment', label: 'Sterilize jars and equipment', critical: true },
  { id: 'proper-headspace', label: 'Leave proper headspace (1/4" to 1")', critical: true },
  { id: 'remove-bubbles', label: 'Remove air bubbles with bubble tool', critical: false },
  { id: 'wipe-rims', label: 'Wipe jar rims clean before sealing', critical: true },
  { id: 'check-seals', label: 'Check seals after cooling (24 hrs)', critical: true },
  { id: 'label-jars', label: 'Label with contents and date', critical: false },
  { id: 'proper-storage', label: 'Store in cool, dark place', critical: false },
  { id: 'tested-recipe', label: 'Using a tested, approved recipe', critical: true },
];

interface CanningTimerToolProps {
  uiConfig?: UIConfig;
}

export const CanningTimerTool: React.FC<CanningTimerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('fruits');
  const [selectedFood, setSelectedFood] = useState<string>('Apples (sliced)');
  const [jarSize, setJarSize] = useState<JarSize>('pint');
  const [altitudeIndex, setAltitudeIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.category && ['fruits', 'tomatoes', 'pickles', 'jams', 'vegetables', 'meats', 'soups'].includes(params.category)) {
        setSelectedCategory(params.category as FoodCategory);
        hasChanges = true;
      }
      if (params.jarSize && ['half-pint', 'pint', 'quart'].includes(params.jarSize)) {
        setJarSize(params.jarSize as JarSize);
        hasChanges = true;
      }
      if (params.altitude !== undefined) {
        setAltitudeIndex(params.altitude);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const categories: { key: FoodCategory; label: string }[] = [
    { key: 'fruits', label: 'Fruits' },
    { key: 'tomatoes', label: 'Tomatoes' },
    { key: 'pickles', label: 'Pickles' },
    { key: 'jams', label: 'Jams & Jellies' },
    { key: 'vegetables', label: 'Vegetables' },
    { key: 'meats', label: 'Meats' },
    { key: 'soups', label: 'Soups & Stocks' },
  ];

  const jarSizes: { key: JarSize; label: string }[] = [
    { key: 'half-pint', label: 'Half Pint (8 oz)' },
    { key: 'pint', label: 'Pint (16 oz)' },
    { key: 'quart', label: 'Quart (32 oz)' },
  ];

  const filteredFoods = useMemo(() => {
    return foods.filter(f => f.category === selectedCategory);
  }, [selectedCategory]);

  const currentFood = useMemo(() => {
    return foods.find(f => f.name === selectedFood) || foods[0];
  }, [selectedFood]);

  const calculations = useMemo(() => {
    const baseTime = currentFood.baseTime[jarSize];
    const altitude = altitudeAdjustments[altitudeIndex];

    let adjustedTime = baseTime;
    let adjustedPressure = currentFood.pressure;

    if (currentFood.method === 'water-bath') {
      adjustedTime = baseTime + altitude.waterBathAdd;
    } else {
      adjustedPressure = currentFood.pressure + altitude.pressureAdd;
    }

    return {
      baseTime,
      adjustedTime,
      basePressure: currentFood.pressure,
      adjustedPressure,
      method: currentFood.method,
      timeAddition: currentFood.method === 'water-bath' ? altitude.waterBathAdd : 0,
      pressureAddition: altitude.pressureAdd,
    };
  }, [currentFood, jarSize, altitudeIndex]);

  const handleCategoryChange = (category: FoodCategory) => {
    setSelectedCategory(category);
    const firstFood = foods.find(f => f.category === category);
    if (firstFood) {
      setSelectedFood(firstFood.name);
    }
  };

  const toggleChecklistItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const criticalItemsComplete = safetyChecklist
    .filter(item => item.critical)
    .every(item => checkedItems.has(item.id));

  const allItemsComplete = safetyChecklist.every(item => checkedItems.has(item.id));

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Timer className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.canningTimer.canningTimerGuide', 'Canning Timer & Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.canningTimer.processingTimesMethodsAndSafety', 'Processing times, methods, and safety checklist')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">{t('tools.canningTimer.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Food Category Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.canningTimer.foodCategory', 'Food Category')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`py-2 px-3 rounded-lg text-sm ${selectedCategory === cat.key ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.canningTimer.selectFood', 'Select Food')}
          </label>
          <select
            value={selectedFood}
            onChange={(e) => setSelectedFood(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            {filteredFoods.map((food) => (
              <option key={food.name} value={food.name}>
                {food.name}
              </option>
            ))}
          </select>
        </div>

        {/* Jar Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.canningTimer.jarSize', 'Jar Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {jarSizes.map((size) => (
              <button
                key={size.key}
                onClick={() => setJarSize(size.key)}
                className={`py-2 px-3 rounded-lg text-sm ${jarSize === size.key ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Altitude Adjustment */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Mountain className="w-4 h-4 inline mr-1" />
            {t('tools.canningTimer.altitude', 'Altitude')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {altitudeAdjustments.map((alt, index) => (
              <button
                key={alt.range}
                onClick={() => setAltitudeIndex(index)}
                className={`py-2 px-3 rounded-lg text-xs ${altitudeIndex === index ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {alt.range}
              </button>
            ))}
          </div>
        </div>

        {/* Processing Method Info */}
        <div className={`p-4 rounded-lg ${calculations.method === 'water-bath' ? (isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200') : (isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200')} border`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {calculations.method === 'water-bath' ? (
                <Droplets className="w-5 h-5 text-blue-500" />
              ) : (
                <Gauge className="w-5 h-5 text-orange-500" />
              )}
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.method === 'water-bath' ? t('tools.canningTimer.waterBathCanning', 'Water Bath Canning') : t('tools.canningTimer.pressureCanning', 'Pressure Canning')}
              </h4>
            </div>
            <span className={`text-sm px-2 py-1 rounded ${calculations.method === 'water-bath' ? 'bg-blue-500/20 text-blue-500' : 'bg-orange-500/20 text-orange-500'}`}>
              {calculations.method === 'water-bath' ? t('tools.canningTimer.highAcid', 'High Acid') : t('tools.canningTimer.lowAcid', 'Low Acid')}
            </span>
          </div>

          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculations.method === 'water-bath'
              ? t('tools.canningTimer.waterBathCanningIsSuitable', 'Water bath canning is suitable for high-acid foods. Jars are submerged in boiling water (212°F/100°C).') : t('tools.canningTimer.pressureCanningIsRequiredFor', 'Pressure canning is required for low-acid foods to reach temperatures of 240°F/116°C to kill harmful bacteria.')}
          </p>
        </div>

        {/* Processing Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.canningTimer.processingTime', 'Processing Time')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.adjustedTime} min</div>
            {calculations.timeAddition > 0 && (
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Base: {calculations.baseTime} min + {calculations.timeAddition} min altitude
              </div>
            )}
          </div>

          {calculations.method === 'pressure' && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-orange-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.canningTimer.pressure', 'Pressure')}</span>
              </div>
              <div className="text-3xl font-bold text-orange-500">{calculations.adjustedPressure} PSI</div>
              {calculations.pressureAddition > 0 && (
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Base: {calculations.basePressure} PSI + {calculations.pressureAddition} PSI altitude
                </div>
              )}
            </div>
          )}

          {calculations.method === 'water-bath' && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-blue-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.canningTimer.temperature', 'Temperature')}</span>
              </div>
              <div className="text-3xl font-bold text-blue-500">212°F</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.canningTimer.fullRollingBoil100C', 'Full rolling boil (100°C)')}
              </div>
            </div>
          )}
        </div>

        {/* Food Notes */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 text-green-500`} />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentFood.name}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentFood.notes}</p>
            </div>
          </div>
        </div>

        {/* Safety Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <CheckSquare className="w-4 h-4 inline mr-2" />
              {t('tools.canningTimer.safetyChecklist', 'Safety Checklist')}
            </h4>
            <span className={`text-sm ${allItemsComplete ? 'text-green-500' : criticalItemsComplete ? 'text-yellow-500' : 'text-red-500'}`}>
              {checkedItems.size}/{safetyChecklist.length} complete
            </span>
          </div>

          <div className={`p-4 rounded-lg space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {safetyChecklist.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.id)}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                />
                <span className={`flex-1 text-sm ${checkedItems.has(item.id) ? (isDark ? 'text-gray-500 line-through' : 'text-gray-400 line-through') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>
                  {item.label}
                </span>
                {item.critical && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" title={t('tools.canningTimer.criticalStep', 'Critical step')} />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Method Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{calculations.method === 'water-bath' ? t('tools.canningTimer.waterBathSteps', 'Water Bath Steps:') : t('tools.canningTimer.pressureCanningSteps', 'Pressure Canning Steps:')}</strong>
              {calculations.method === 'water-bath' ? (
                <ol className="mt-1 space-y-1 list-decimal list-inside">
                  <li>Fill canner with water; preheat to 180°F for hot pack</li>
                  <li>{t('tools.canningTimer.fillJarsLeaveProperHeadspace', 'Fill jars, leave proper headspace, remove air bubbles')}</li>
                  <li>{t('tools.canningTimer.wipeRimsApplyLidsAnd', 'Wipe rims, apply lids and bands finger-tight')}</li>
                  <li>Place jars on rack; water should cover lids by 1-2 inches</li>
                  <li>{t('tools.canningTimer.bringToRollingBoilThen', 'Bring to rolling boil, then start timer')}</li>
                  <li>Remove jars after processing; cool 12-24 hours</li>
                  <li>{t('tools.canningTimer.checkSealsLabelAndStore', 'Check seals, label, and store')}</li>
                </ol>
              ) : (
                <ol className="mt-1 space-y-1 list-decimal list-inside">
                  <li>{t('tools.canningTimer.add23InchesOf', 'Add 2-3 inches of water to pressure canner')}</li>
                  <li>{t('tools.canningTimer.fillJarsLeaveProperHeadspace2', 'Fill jars, leave proper headspace, remove air bubbles')}</li>
                  <li>{t('tools.canningTimer.wipeRimsApplyLidsAnd2', 'Wipe rims, apply lids and bands finger-tight')}</li>
                  <li>Lock canner lid; vent steam for 10 minutes</li>
                  <li>Close vent; bring to {calculations.adjustedPressure} PSI</li>
                  <li>{t('tools.canningTimer.maintainPressureForFullProcessing', 'Maintain pressure for full processing time')}</li>
                  <li>Turn off heat; let pressure drop naturally</li>
                  <li>{t('tools.canningTimer.wait10MinAfterPressure', 'Wait 10 min after pressure reaches 0 to open')}</li>
                  <li>Remove jars; cool 12-24 hours undisturbed</li>
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" />
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>{t('tools.canningTimer.safetyWarning', 'Safety Warning:')}</strong> Always use tested recipes from trusted sources (USDA, NCHFP, Ball). Improper canning can lead to botulism and other foodborne illnesses. When in doubt, throw it out.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanningTimerTool;
