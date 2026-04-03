import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Luggage, Scale, Plane, AlertTriangle, Lightbulb, Plus, Trash2, Info, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface LuggageItem {
  id: string;
  name: string;
  weight: number;
  quantity: number;
}

interface AirlineLimit {
  name: string;
  carryon: number;
  checked: number;
  overweightFee: number;
  perKgFee: number;
}

interface CommonItem {
  name: string;
  weight: number;
  category: string;
}

interface LuggageWeightToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'weight', header: 'Weight (kg)', type: 'number' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'totalWeight', header: 'Total Weight (kg)', type: 'number' },
];

export const LuggageWeightTool: React.FC<LuggageWeightToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: items,
    setData: setItems,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<LuggageItem>('luggage-weight', [], COLUMNS);

  const [selectedAirline, setSelectedAirline] = useState<string>('standard');
  const [bagType, setBagType] = useState<'carryon' | 'checked'>('checked');
  const [bagWeight, setBagWeight] = useState('2.5');
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  const [showCommonItems, setShowCommonItems] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.airline) {
        setSelectedAirline(params.airline);
        hasChanges = true;
      }
      if (params.bagType) {
        setBagType(params.bagType as 'carryon' | 'checked');
        hasChanges = true;
      }
      if (params.bagWeight) {
        setBagWeight(String(params.bagWeight));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const airlines: Record<string, AirlineLimit> = {
    standard: {
      name: 'Standard (Most Airlines)',
      carryon: 7,
      checked: 23,
      overweightFee: 100,
      perKgFee: 15,
    },
    delta: {
      name: 'Delta Airlines',
      carryon: 7,
      checked: 23,
      overweightFee: 100,
      perKgFee: 0,
    },
    united: {
      name: 'United Airlines',
      carryon: 7,
      checked: 23,
      overweightFee: 100,
      perKgFee: 0,
    },
    american: {
      name: 'American Airlines',
      carryon: 7,
      checked: 23,
      overweightFee: 100,
      perKgFee: 0,
    },
    southwest: {
      name: 'Southwest Airlines',
      carryon: 7,
      checked: 23,
      overweightFee: 75,
      perKgFee: 0,
    },
    ryanair: {
      name: 'Ryanair',
      carryon: 10,
      checked: 20,
      overweightFee: 11,
      perKgFee: 11,
    },
    emirates: {
      name: 'Emirates',
      carryon: 7,
      checked: 30,
      overweightFee: 75,
      perKgFee: 18,
    },
    british: {
      name: 'British Airways',
      carryon: 6,
      checked: 23,
      overweightFee: 65,
      perKgFee: 0,
    },
  };

  const commonItems: CommonItem[] = [
    { name: 'Laptop', weight: 2.0, category: 'Electronics' },
    { name: 'Tablet/iPad', weight: 0.5, category: 'Electronics' },
    { name: 'Phone + Chargers', weight: 0.3, category: 'Electronics' },
    { name: 'Camera + Accessories', weight: 1.5, category: 'Electronics' },
    { name: 'Hairdryer', weight: 0.8, category: 'Electronics' },
    { name: 'T-shirts (5)', weight: 1.0, category: 'Clothing' },
    { name: 'Jeans (2)', weight: 1.2, category: 'Clothing' },
    { name: 'Jacket/Coat', weight: 1.5, category: 'Clothing' },
    { name: 'Shoes (pair)', weight: 1.0, category: 'Clothing' },
    { name: 'Underwear/Socks (7)', weight: 0.4, category: 'Clothing' },
    { name: 'Swimwear', weight: 0.2, category: 'Clothing' },
    { name: 'Toiletry Bag', weight: 1.5, category: 'Toiletries' },
    { name: 'Makeup Bag', weight: 0.8, category: 'Toiletries' },
    { name: 'Medication', weight: 0.3, category: 'Toiletries' },
    { name: 'Book', weight: 0.4, category: 'Misc' },
    { name: 'Travel Pillow', weight: 0.3, category: 'Misc' },
    { name: 'Umbrella', weight: 0.4, category: 'Misc' },
    { name: 'Sunglasses + Case', weight: 0.1, category: 'Misc' },
    { name: 'Travel Documents', weight: 0.2, category: 'Misc' },
    { name: 'Snacks', weight: 0.5, category: 'Misc' },
  ];

  const packingTips = [
    'Roll clothes instead of folding to save space and reduce weight',
    'Wear your heaviest items (jacket, boots) on the plane',
    'Use travel-size toiletries or solid alternatives',
    'Pack versatile clothing that can be mixed and matched',
    'Consider shipping heavy items ahead if cheaper than fees',
    'Use packing cubes to organize and compress clothes',
    'Remove unnecessary packaging from new items',
    'Weigh your bag before leaving home',
  ];

  const airlineConfig = airlines[selectedAirline];
  const weightLimit = bagType === 'carryon' ? airlineConfig.carryon : airlineConfig.checked;

  const calculations = useMemo(() => {
    const emptyBagWeight = parseFloat(bagWeight) || 0;
    const itemsWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const totalWeight = emptyBagWeight + itemsWeight;
    const remaining = weightLimit - totalWeight;
    const isOverweight = totalWeight > weightLimit;
    const overweightAmount = isOverweight ? totalWeight - weightLimit : 0;

    let overweightFee = 0;
    if (isOverweight) {
      if (airlineConfig.perKgFee > 0) {
        overweightFee = Math.ceil(overweightAmount) * airlineConfig.perKgFee;
      } else {
        overweightFee = airlineConfig.overweightFee;
      }
    }

    const percentUsed = (totalWeight / weightLimit) * 100;

    return {
      emptyBagWeight,
      itemsWeight: itemsWeight.toFixed(1),
      totalWeight: totalWeight.toFixed(1),
      remaining: remaining.toFixed(1),
      isOverweight,
      overweightAmount: overweightAmount.toFixed(1),
      overweightFee,
      percentUsed: Math.min(percentUsed, 100).toFixed(0),
    };
  }, [items, bagWeight, weightLimit, airlineConfig]);

  const handleAddItem = () => {
    if (newItemName && newItemWeight) {
      addItem({
        id: Date.now().toString(),
        name: newItemName,
        weight: parseFloat(newItemWeight),
        quantity: 1,
      });
      setNewItemName('');
      setNewItemWeight('');
    }
  };

  const addCommonItem = (commonItem: CommonItem) => {
    addItem({
      id: Date.now().toString(),
      name: commonItem.name,
      weight: commonItem.weight,
      quantity: 1,
    });
  };

  const handleRemoveItem = (id: string) => {
    deleteItem(id);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateItem(id, { quantity: Math.max(1, quantity) });
  };

  const getStatusColor = () => {
    const percent = parseFloat(calculations.percentUsed);
    if (percent > 100) return 'red';
    if (percent > 90) return 'yellow';
    if (percent > 75) return 'orange';
    return 'green';
  };

  const statusColor = getStatusColor();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Luggage className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.luggageWeight.luggageWeightEstimator', 'Luggage Weight Estimator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.luggageWeight.checkYourBagWeightAnd', 'Check your bag weight and avoid overweight fees')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="luggage-weight" toolName="Luggage Weight" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'luggage-items' })}
              onExportExcel={() => exportExcel({ filename: 'luggage-items' })}
              onExportJSON={() => exportJSON({ filename: 'luggage-items' })}
              onExportPDF={() => exportPDF({
                filename: 'luggage-items',
                title: 'Luggage Weight Estimate',
                subtitle: `${airlines[selectedAirline].name} - ${bagType === 'carryon' ? t('tools.luggageWeight.carryOn', 'Carry-on') : t('tools.luggageWeight.checked', 'Checked')} Bag`,
              })}
              onPrint={() => print('Luggage Weight Estimate')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={items.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-500 font-medium">{t('tools.luggageWeight.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Airline Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Plane className="w-4 h-4 inline mr-1" />
            {t('tools.luggageWeight.airline', 'Airline')}
          </label>
          <select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {Object.keys(airlines).map((key) => (
              <option key={key} value={key}>{airlines[key].name}</option>
            ))}
          </select>
        </div>

        {/* Bag Type Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setBagType('carryon')}
            className={`flex-1 py-2 rounded-lg ${bagType === 'carryon' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            Carry-on ({airlineConfig.carryon} kg)
          </button>
          <button
            onClick={() => setBagType('checked')}
            className={`flex-1 py-2 rounded-lg ${bagType === 'checked' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            Checked ({airlineConfig.checked} kg)
          </button>
        </div>

        {/* Weight Progress Bar */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between mb-2">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Weight: {calculations.totalWeight} kg / {weightLimit} kg
            </span>
            <span className={`font-medium ${
              statusColor === 'red' ? 'text-red-500' :
              statusColor === 'yellow' ? 'text-yellow-500' :
              statusColor === 'orange' ? 'text-orange-500' :
              'text-green-500'
            }`}>
              {calculations.percentUsed}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-3 rounded-full transition-all ${
                statusColor === 'red' ? 'bg-red-500' :
                statusColor === 'yellow' ? 'bg-yellow-500' :
                statusColor === 'orange' ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(parseFloat(calculations.percentUsed), 100)}%` }}
            />
          </div>
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculations.isOverweight ? (
              <span className="text-red-500">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {calculations.overweightAmount} kg overweight
              </span>
            ) : (
              <span className="text-green-500">{calculations.remaining} kg remaining</span>
            )}
          </div>
        </div>

        {/* Overweight Fee Calculator */}
        {calculations.isOverweight && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.luggageWeight.estimatedOverweightFee', 'Estimated Overweight Fee')}</span>
            </div>
            <div className="text-3xl font-bold text-red-500">${calculations.overweightFee}</div>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {airlineConfig.perKgFee > 0
                ? `${airlineConfig.name} charges $${airlineConfig.perKgFee}/kg over limit`
                : `${airlineConfig.name} charges a flat fee for overweight bags`}
            </p>
          </div>
        )}

        {/* Bag Weight */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-1" />
            {t('tools.luggageWeight.emptyBagWeightKg', 'Empty Bag Weight (kg)')}
          </label>
          <input
            type="number"
            step="0.1"
            value={bagWeight}
            onChange={(e) => setBagWeight(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Item List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.luggageWeight.itemsInBag', 'Items in Bag')}
            </label>
            <button
              onClick={() => setShowCommonItems(!showCommonItems)}
              className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              {showCommonItems ? t('tools.luggageWeight.hide', 'Hide') : t('tools.luggageWeight.show', 'Show')} Common Items
            </button>
          </div>

          {/* Common Items Grid */}
          {showCommonItems && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.luggageWeight.clickToAdd', 'Click to add:')}</p>
              <div className="flex flex-wrap gap-2">
                {commonItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => addCommonItem(item)}
                    className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {item.name} ({item.weight} kg)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex-1">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.weight} kg each
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    -
                  </button>
                  <span className={`w-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    +
                  </button>
                </div>
                <div className={`w-16 text-right font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {(item.weight * item.quantity).toFixed(1)} kg
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Item */}
          <div className={`flex gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <input
              type="text"
              placeholder={t('tools.luggageWeight.itemName', 'Item name')}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
            />
            <input
              type="number"
              step="0.1"
              placeholder={t('tools.luggageWeight.weightKg', 'Weight (kg)')}
              value={newItemWeight}
              onChange={(e) => setNewItemWeight(e.target.value)}
              className={`w-28 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
            />
            <button
              onClick={handleAddItem}
              disabled={!newItemName || !newItemWeight}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.luggageWeight.bag', 'Bag')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.emptyBagWeight} kg</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.luggageWeight.items', 'Items')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.itemsWeight} kg</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.luggageWeight.total', 'Total')}</div>
            <div className="text-xl font-bold text-blue-500">{calculations.totalWeight} kg</div>
          </div>
        </div>

        {/* Packing Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Lightbulb className={`w-4 h-4 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.luggageWeight.packingOptimizationTips', 'Packing Optimization Tips:')}</strong>
              <ul className="mt-2 space-y-1">
                {packingTips.slice(0, 4).map((tip, idx) => (
                  <li key={idx}>- {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.luggageWeight.weightLimitsAndFeesMay', 'Weight limits and fees may vary by route, fare class, and frequent flyer status. Always verify with your airline before traveling.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuggageWeightTool;
