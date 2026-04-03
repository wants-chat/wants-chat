import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Ruler, Home, Sparkles, Info, Plus, Minus, Calculator, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type StorageType = 'self-storage' | 'garage' | 'basement' | 'attic' | 'closet' | 'shed';
type ItemCategory = 'furniture' | 'boxes' | 'appliances' | 'sports' | 'seasonal' | 'clothing' | 'documents';

interface StorageItem {
  id: string;
  name: string;
  category: ItemCategory;
  cubicFeet: number;
  quantity: number;
}

interface StorageCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const StorageCalculatorTool: React.FC<StorageCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [storageType, setStorageType] = useState<StorageType>('self-storage');
  const [items, setItems] = useState<StorageItem[]>([
    { id: '1', name: 'Medium Boxes', category: 'boxes', cubicFeet: 3, quantity: 10 },
    { id: '2', name: 'Large Boxes', category: 'boxes', cubicFeet: 4.5, quantity: 5 },
    { id: '3', name: 'Sofa', category: 'furniture', cubicFeet: 40, quantity: 1 },
    { id: '4', name: 'Queen Mattress', category: 'furniture', cubicFeet: 60, quantity: 1 },
  ]);
  const [customSpaceWidth, setCustomSpaceWidth] = useState('10');
  const [customSpaceDepth, setCustomSpaceDepth] = useState('10');
  const [customSpaceHeight, setCustomSpaceHeight] = useState('8');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.storageType) {
        setStorageType(params.storageType as StorageType);
        setIsPrefilled(true);
      }
      if (params.width !== undefined) {
        setCustomSpaceWidth(String(params.width));
        setIsPrefilled(true);
      }
      if (params.depth !== undefined) {
        setCustomSpaceDepth(String(params.depth));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const storageTypes = {
    'self-storage': { name: 'Self Storage', description: 'Rental storage unit' },
    'garage': { name: 'Garage', description: 'Home garage space' },
    'basement': { name: 'Basement', description: 'Below-ground storage' },
    'attic': { name: 'Attic', description: 'Above-ceiling storage' },
    'closet': { name: 'Closet', description: 'Indoor closet space' },
    'shed': { name: 'Outdoor Shed', description: 'Backyard storage shed' },
  };

  const presetItems: { name: string; category: ItemCategory; cubicFeet: number }[] = [
    // Furniture
    { name: 'Sofa (3-seat)', category: 'furniture', cubicFeet: 40 },
    { name: 'Loveseat', category: 'furniture', cubicFeet: 28 },
    { name: 'Armchair', category: 'furniture', cubicFeet: 20 },
    { name: 'Coffee Table', category: 'furniture', cubicFeet: 10 },
    { name: 'Dining Table', category: 'furniture', cubicFeet: 35 },
    { name: 'Dining Chair', category: 'furniture', cubicFeet: 8 },
    { name: 'Queen Mattress', category: 'furniture', cubicFeet: 60 },
    { name: 'King Mattress', category: 'furniture', cubicFeet: 80 },
    { name: 'Bed Frame (Queen)', category: 'furniture', cubicFeet: 40 },
    { name: 'Dresser', category: 'furniture', cubicFeet: 30 },
    { name: 'Nightstand', category: 'furniture', cubicFeet: 6 },
    { name: 'Bookshelf', category: 'furniture', cubicFeet: 20 },
    { name: 'Desk', category: 'furniture', cubicFeet: 25 },
    { name: 'Office Chair', category: 'furniture', cubicFeet: 15 },
    // Boxes
    { name: 'Small Box', category: 'boxes', cubicFeet: 1.5 },
    { name: 'Medium Box', category: 'boxes', cubicFeet: 3 },
    { name: 'Large Box', category: 'boxes', cubicFeet: 4.5 },
    { name: 'Extra Large Box', category: 'boxes', cubicFeet: 6 },
    { name: 'Wardrobe Box', category: 'boxes', cubicFeet: 16 },
    // Appliances
    { name: 'Refrigerator', category: 'appliances', cubicFeet: 40 },
    { name: 'Washer', category: 'appliances', cubicFeet: 25 },
    { name: 'Dryer', category: 'appliances', cubicFeet: 25 },
    { name: 'Dishwasher', category: 'appliances', cubicFeet: 20 },
    { name: 'Microwave', category: 'appliances', cubicFeet: 3 },
    { name: 'TV (55"+)', category: 'appliances', cubicFeet: 15 },
    // Sports
    { name: 'Bicycle', category: 'sports', cubicFeet: 20 },
    { name: 'Golf Clubs', category: 'sports', cubicFeet: 5 },
    { name: 'Kayak', category: 'sports', cubicFeet: 50 },
    { name: 'Ski Equipment', category: 'sports', cubicFeet: 8 },
    // Seasonal
    { name: 'Christmas Tree (boxed)', category: 'seasonal', cubicFeet: 10 },
    { name: 'Holiday Decorations Box', category: 'seasonal', cubicFeet: 4 },
    { name: 'Patio Furniture Set', category: 'seasonal', cubicFeet: 60 },
    { name: 'Grill', category: 'seasonal', cubicFeet: 15 },
  ];

  const standardUnitSizes = [
    { name: '5x5', sqft: 25, cubicFeet: 200, useCase: 'Closet equivalent' },
    { name: '5x10', sqft: 50, cubicFeet: 400, useCase: 'Walk-in closet' },
    { name: '10x10', sqft: 100, cubicFeet: 800, useCase: 'Half garage' },
    { name: '10x15', sqft: 150, cubicFeet: 1200, useCase: 'Two-thirds garage' },
    { name: '10x20', sqft: 200, cubicFeet: 1600, useCase: 'One-car garage' },
    { name: '10x25', sqft: 250, cubicFeet: 2000, useCase: 'Two-car garage' },
    { name: '10x30', sqft: 300, cubicFeet: 2400, useCase: 'Large home contents' },
  ];

  const addItem = (preset: typeof presetItems[0]) => {
    const existingItem = items.find(i => i.name === preset.name);
    if (existingItem) {
      setItems(items.map(i =>
        i.id === existingItem.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItems([...items, {
        id: Date.now().toString(),
        ...preset,
        quantity: 1,
      }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculations = useMemo(() => {
    const totalCubicFeet = items.reduce((sum, item) => sum + (item.cubicFeet * item.quantity), 0);

    // Add 20% for access aisles and stacking inefficiency
    const requiredCubicFeet = totalCubicFeet * 1.2;

    // Custom space calculation
    const customWidth = parseFloat(customSpaceWidth) || 10;
    const customDepth = parseFloat(customSpaceDepth) || 10;
    const customHeight = parseFloat(customSpaceHeight) || 8;
    const customCubicFeet = customWidth * customDepth * customHeight;
    const customSqFt = customWidth * customDepth;

    // Find recommended unit size
    const recommendedUnit = standardUnitSizes.find(unit => unit.cubicFeet >= requiredCubicFeet)
      || standardUnitSizes[standardUnitSizes.length - 1];

    // Calculate utilization of custom space
    const utilizationPercent = customCubicFeet > 0
      ? Math.min(100, (totalCubicFeet / customCubicFeet) * 100)
      : 0;

    // Estimate monthly cost (rough estimate)
    const costPerSqFt = 1.50; // Average $1.50/sqft/month
    const estimatedMonthlyCost = recommendedUnit.sqft * costPerSqFt;

    // Category breakdown
    const categoryBreakdown: Record<ItemCategory, number> = {
      furniture: 0,
      boxes: 0,
      appliances: 0,
      sports: 0,
      seasonal: 0,
      clothing: 0,
      documents: 0,
    };

    items.forEach(item => {
      categoryBreakdown[item.category] += item.cubicFeet * item.quantity;
    });

    return {
      totalCubicFeet,
      requiredCubicFeet: Math.ceil(requiredCubicFeet),
      recommendedUnit,
      customCubicFeet,
      customSqFt,
      utilizationPercent,
      estimatedMonthlyCost,
      categoryBreakdown,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items, customSpaceWidth, customSpaceDepth, customSpaceHeight]);

  const getCategoryIcon = (category: ItemCategory): string => {
    const icons: Record<ItemCategory, string> = {
      furniture: 'sofa',
      boxes: 'box',
      appliances: 'tv',
      sports: 'dumbbell',
      seasonal: 'snowflake',
      clothing: 'shirt',
      documents: 'file',
    };
    return icons[category];
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Box className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageCalculator.title')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.storageCalculator.description')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.storageCalculator.valuesLoaded')}</span>
          </div>
        )}

        {/* Storage Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.storageCalculator.storageType')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(storageTypes) as StorageType[]).map((type) => (
              <button
                key={type}
                onClick={() => setStorageType(type)}
                className={`py-2 px-2 rounded-lg text-xs text-center ${
                  storageType === type
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {storageTypes[type].name}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Items */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Plus className="w-4 h-4 inline mr-1" />
            {t('tools.storageCalculator.quickAddItems')}
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {presetItems.slice(0, 15).map((preset, index) => (
              <button
                key={index}
                onClick={() => addItem(preset)}
                className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Items */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.storageCalculator.yourItems')} ({calculations.totalItems} {t('tools.storageCalculator.items')})
          </label>
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-3 max-h-48 overflow-y-auto`}>
            {items.length === 0 ? (
              <p className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.storageCalculator.noItemsYet')}
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                  >
                    <div>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                      <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {item.cubicFeet} {t('tools.storageCalculator.cuFtEach')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`w-6 text-center font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.storageCalculator.spaceNeeded')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.requiredCubicFeet} cu ft
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {t('tools.storageCalculator.recommended')}: {calculations.recommendedUnit.name} {t('tools.storageCalculator.unit')} ({calculations.recommendedUnit.sqft} {t('tools.storageCalculator.sqFt')})
          </div>
        </div>

        {/* Recommended Unit Details */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.storageCalculator.recommended')}: {calculations.recommendedUnit.name} {t('tools.storageCalculator.storageUnit')}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.storageCalculator.size')}</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.recommendedUnit.sqft} {t('tools.storageCalculator.sqFt')}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.storageCalculator.volume')}</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.recommendedUnit.cubicFeet} {t('tools.storageCalculator.cuFt')}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.storageCalculator.estCost')}</div>
              <div className="font-bold text-teal-500">${calculations.estimatedMonthlyCost.toFixed(0)}/{t('tools.storageCalculator.mo')}</div>
            </div>
          </div>
          <p className={`text-xs mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {calculations.recommendedUnit.useCase}
          </p>
        </div>

        {/* Custom Space Calculator */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.storageCalculator.checkYourSpace')}
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.storageCalculator.width')}</label>
              <input
                type="number"
                value={customSpaceWidth}
                onChange={(e) => setCustomSpaceWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.storageCalculator.depth')}</label>
              <input
                type="number"
                value={customSpaceDepth}
                onChange={(e) => setCustomSpaceDepth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.storageCalculator.height')}</label>
              <input
                type="number"
                value={customSpaceHeight}
                onChange={(e) => setCustomSpaceHeight(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.storageCalculator.yourSpaceCapacity')}:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.customCubicFeet} {t('tools.storageCalculator.cuFt')}</span>
            </div>
            <div className={`mt-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  calculations.utilizationPercent > 100 ? 'bg-red-500' :
                  calculations.utilizationPercent > 80 ? 'bg-yellow-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, calculations.utilizationPercent)}%` }}
              />
            </div>
            <div className={`mt-1 text-xs text-center ${calculations.utilizationPercent > 100 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.utilizationPercent > 100
                ? t('tools.storageCalculator.spaceTooSmall')
                : t('tools.storageCalculator.spaceUsed', { percent: Math.round(calculations.utilizationPercent) })}
            </div>
          </div>
        </div>

        {/* Standard Unit Sizes Reference */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.storageCalculator.standardUnitSizes')}
          </h4>
          <div className="space-y-2">
            {standardUnitSizes.map((unit, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  unit.name === calculations.recommendedUnit.name
                    ? 'ring-2 ring-teal-500 ' + (isDark ? 'bg-gray-700/50' : 'bg-white')
                    : isDark ? 'bg-gray-700/30' : 'bg-white/50'
                }`}
              >
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{unit.name}</span>
                  <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{unit.useCase}</span>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{unit.cubicFeet} cu ft</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.storageCalculator.storageTips')}:</strong>
              <ul className="mt-1 space-y-1">
                <li>- {t('tools.storageCalculator.tips.stack')}</li>
                <li>- {t('tools.storageCalculator.tips.aisle')}</li>
                <li>- {t('tools.storageCalculator.tips.frequently')}</li>
                <li>- {t('tools.storageCalculator.tips.climate')}</li>
                <li>- {t('tools.storageCalculator.tips.label')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageCalculatorTool;
