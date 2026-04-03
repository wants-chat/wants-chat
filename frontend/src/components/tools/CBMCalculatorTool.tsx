import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Plus, Trash2, Calculator, Sparkles, Package, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CBMCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface CartonItem {
  id: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
}

export const CBMCalculatorTool: React.FC<CBMCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [unit, setUnit] = useState<'cm' | 'inch' | 'm'>('cm');
  const [items, setItems] = useState<CartonItem[]>([
    { id: '1', length: '60', width: '40', height: '40', quantity: '10' }
  ]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.length !== undefined && params.width !== undefined && params.height !== undefined) {
        setItems([{
          id: '1',
          length: String(params.length),
          width: String(params.width),
          height: String(params.height),
          quantity: String(params.quantity || 1),
        }]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      length: '',
      width: '',
      height: '',
      quantity: '1',
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CartonItem, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculations = useMemo(() => {
    let totalCBM = 0;
    let totalCartons = 0;

    const itemResults = items.map(item => {
      let l = parseFloat(item.length) || 0;
      let w = parseFloat(item.width) || 0;
      let h = parseFloat(item.height) || 0;
      const qty = parseInt(item.quantity) || 0;

      // Convert to meters
      if (unit === 'cm') {
        l = l / 100;
        w = w / 100;
        h = h / 100;
      } else if (unit === 'inch') {
        l = l * 0.0254;
        w = w * 0.0254;
        h = h * 0.0254;
      }

      const cbmPerUnit = l * w * h;
      const totalItemCBM = cbmPerUnit * qty;
      totalCBM += totalItemCBM;
      totalCartons += qty;

      return {
        id: item.id,
        cbmPerUnit,
        totalItemCBM,
        quantity: qty,
      };
    });

    // Container capacity estimates
    const container20ft = 33.2; // CBM
    const container40ft = 67.7; // CBM
    const container40hc = 76.3; // CBM

    const fit20ft = Math.floor(container20ft / totalCBM * 100) / 100;
    const fit40ft = Math.floor(container40ft / totalCBM * 100) / 100;
    const fit40hc = Math.floor(container40hc / totalCBM * 100) / 100;

    const containerNeeded20ft = Math.ceil(totalCBM / container20ft);
    const containerNeeded40ft = Math.ceil(totalCBM / container40ft);
    const containerNeeded40hc = Math.ceil(totalCBM / container40hc);

    const utilizationPct20ft = totalCBM > 0 ? Math.min((totalCBM / container20ft) * 100, 100) : 0;
    const utilizationPct40ft = totalCBM > 0 ? Math.min((totalCBM / container40ft) * 100, 100) : 0;
    const utilizationPct40hc = totalCBM > 0 ? Math.min((totalCBM / container40hc) * 100, 100) : 0;

    return {
      itemResults,
      totalCBM,
      totalCartons,
      totalCubicFeet: totalCBM * 35.3147,
      container20ft: { capacity: container20ft, fit: fit20ft, needed: containerNeeded20ft, utilization: utilizationPct20ft },
      container40ft: { capacity: container40ft, fit: fit40ft, needed: containerNeeded40ft, utilization: utilizationPct40ft },
      container40hc: { capacity: container40hc, fit: fit40hc, needed: containerNeeded40hc, utilization: utilizationPct40hc },
    };
  }, [items, unit]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Box className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cBMCalculator.cbmCalculator', 'CBM Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cBMCalculator.calculateCubicMeterVolumeFor', 'Calculate cubic meter volume for shipping')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.cBMCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          {[
            { value: 'cm', label: 'Centimeters' },
            { value: 'inch', label: 'Inches' },
            { value: 'm', label: 'Meters' },
          ].map((u) => (
            <button
              key={u.value}
              onClick={() => setUnit(u.value as typeof unit)}
              className={`flex-1 py-2 rounded-lg transition-colors ${unit === u.value ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {u.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Package className="w-4 h-4 inline mr-1" />
              {t('tools.cBMCalculator.cartonDimensions', 'Carton Dimensions')}
            </label>
            <button
              onClick={addItem}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.cBMCalculator.addItem', 'Add Item')}
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Item {index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <input
                    type="number"
                    value={item.length}
                    onChange={(e) => updateItem(item.id, 'length', e.target.value)}
                    placeholder={t('tools.cBMCalculator.length', 'Length')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Length ({unit})</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={item.width}
                    onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                    placeholder={t('tools.cBMCalculator.width', 'Width')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Width ({unit})</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={item.height}
                    onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                    placeholder={t('tools.cBMCalculator.height', 'Height')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Height ({unit})</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    placeholder={t('tools.cBMCalculator.qty', 'Qty')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.cBMCalculator.quantity', 'Quantity')}</span>
                </div>
              </div>
              {calculations.itemResults.find(r => r.id === item.id) && (
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {calculations.itemResults.find(r => r.id === item.id)?.cbmPerUnit.toFixed(4)} CBM each = {calculations.itemResults.find(r => r.id === item.id)?.totalItemCBM.toFixed(4)} CBM total
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cBMCalculator.totalVolume', 'Total Volume')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.totalCBM.toFixed(4)}
          </div>
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cBMCalculator.cubicMetersCbm', 'Cubic Meters (CBM)')}</div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.totalCubicFeet.toFixed(2)} ft³ | {calculations.totalCartons} cartons
          </div>
        </div>

        {/* Container Capacity */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.cBMCalculator.containerCapacityComparison', 'Container Capacity Comparison')}
          </label>

          {[
            { name: '20ft Container', data: calculations.container20ft },
            { name: '40ft Container', data: calculations.container40ft },
            { name: '40ft HC Container', data: calculations.container40hc },
          ].map((container) => (
            <div key={container.name} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{container.name}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {container.data.capacity} CBM capacity
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${Math.min(container.data.utilization, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {container.data.utilization.toFixed(1)}% utilized
                </span>
                <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {container.data.needed} container{container.data.needed !== 1 ? 's' : ''} needed
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.cBMCalculator.cbmCubicMeters', 'CBM (Cubic Meters)')}</p>
            <p>{t('tools.cBMCalculator.cbmIsTheStandardInternational', 'CBM is the standard international unit for measuring shipping volume. One CBM equals the volume of a cube with 1 meter sides. Most freight rates are calculated based on CBM or weight, whichever is greater.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBMCalculatorTool;
