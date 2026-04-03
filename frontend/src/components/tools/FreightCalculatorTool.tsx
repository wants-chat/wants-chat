import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Package, MapPin, Scale, DollarSign, Sparkles, Info, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FreightCalculatorToolProps {
  uiConfig?: UIConfig;
}

type FreightClass = '50' | '55' | '60' | '65' | '70' | '77.5' | '85' | '92.5' | '100' | '110' | '125' | '150' | '175' | '200' | '250' | '300' | '400' | '500';
type FreightMode = 'ltl' | 'ftl' | 'expedited';

export const FreightCalculatorTool: React.FC<FreightCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('1000');
  const [length, setLength] = useState('48');
  const [width, setWidth] = useState('40');
  const [height, setHeight] = useState('48');
  const [freightClass, setFreightClass] = useState<FreightClass>('70');
  const [mode, setMode] = useState<FreightMode>('ltl');
  const [distance, setDistance] = useState('500');
  const [palletCount, setPalletCount] = useState('2');
  const [accessorials, setAccessorials] = useState({
    liftgate: false,
    residential: false,
    insideDelivery: false,
    appointmentRequired: false,
  });
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.weight !== undefined) {
        setWeight(String(params.weight));
        setIsPrefilled(true);
      }
      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        setIsPrefilled(true);
      }
      if (params.pallets !== undefined) {
        setPalletCount(String(params.pallets));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const freightClassRates: Record<FreightClass, number> = {
    '50': 1.00, '55': 1.10, '60': 1.20, '65': 1.30, '70': 1.40,
    '77.5': 1.55, '85': 1.70, '92.5': 1.85, '100': 2.00, '110': 2.20,
    '125': 2.50, '150': 3.00, '175': 3.50, '200': 4.00, '250': 5.00,
    '300': 6.00, '400': 8.00, '500': 10.00,
  };

  const accessorialCosts = {
    liftgate: 75,
    residential: 85,
    insideDelivery: 125,
    appointmentRequired: 25,
  };

  const calculations = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const l = parseFloat(length) || 0;
    const wd = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const dist = parseFloat(distance) || 0;
    const pallets = parseInt(palletCount) || 1;

    // Calculate cubic feet
    const cubicFeet = (l * wd * h) / 1728;

    // Calculate density (lbs per cubic foot)
    const density = cubicFeet > 0 ? w / cubicFeet : 0;

    // Base rate per CWT (hundred weight)
    const classRate = freightClassRates[freightClass];
    const cwtWeight = w / 100;

    // Distance factor
    const distanceFactor = 1 + (dist / 1000) * 0.15;

    let baseCost: number;
    let fuelSurcharge: number;

    if (mode === 'ltl') {
      baseCost = cwtWeight * classRate * 25 * distanceFactor;
      baseCost = Math.max(baseCost, 150); // Minimum charge
    } else if (mode === 'ftl') {
      baseCost = dist * 2.85; // Per mile rate
      baseCost = Math.max(baseCost, 500); // Minimum charge
    } else {
      baseCost = dist * 4.50; // Expedited per mile rate
      baseCost = Math.max(baseCost, 750);
    }

    // Fuel surcharge (approximately 25%)
    fuelSurcharge = baseCost * 0.25;

    // Accessorial charges
    let accessorialTotal = 0;
    if (accessorials.liftgate) accessorialTotal += accessorialCosts.liftgate;
    if (accessorials.residential) accessorialTotal += accessorialCosts.residential;
    if (accessorials.insideDelivery) accessorialTotal += accessorialCosts.insideDelivery;
    if (accessorials.appointmentRequired) accessorialTotal += accessorialCosts.appointmentRequired;

    const totalCost = baseCost + fuelSurcharge + accessorialTotal;
    const costPerPallet = totalCost / pallets;
    const costPerPound = w > 0 ? totalCost / w : 0;

    return {
      cubicFeet,
      density,
      baseCost,
      fuelSurcharge,
      accessorialTotal,
      totalCost,
      costPerPallet,
      costPerPound,
      cwtWeight,
    };
  }, [weight, length, width, height, freightClass, mode, distance, palletCount, accessorials]);

  const getSuggestedClass = (density: number): FreightClass => {
    if (density >= 50) return '50';
    if (density >= 35) return '55';
    if (density >= 30) return '60';
    if (density >= 22.5) return '65';
    if (density >= 15) return '70';
    if (density >= 13.5) return '77.5';
    if (density >= 12) return '85';
    if (density >= 10.5) return '92.5';
    if (density >= 9) return '100';
    if (density >= 8) return '110';
    if (density >= 7) return '125';
    if (density >= 6) return '150';
    if (density >= 5) return '175';
    if (density >= 4) return '200';
    if (density >= 3) return '250';
    if (density >= 2) return '300';
    if (density >= 1) return '400';
    return '500';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Truck className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.freightCalculator.freightCostCalculator', 'Freight Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.freightCalculator.ltlAndFtlFreightRate', 'LTL and FTL freight rate estimator')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.freightCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Freight Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.freightCalculator.freightMode', 'Freight Mode')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'ltl', label: 'LTL', desc: 'Less Than Truckload' },
              { value: 'ftl', label: 'FTL', desc: 'Full Truckload' },
              { value: 'expedited', label: 'Expedited', desc: 'Time-Critical' },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value as FreightMode)}
                className={`py-3 px-3 rounded-lg text-sm transition-colors ${mode === m.value ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium">{m.label}</div>
                <div className={`text-xs ${mode === m.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weight and Distance */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Scale className="w-4 h-4 inline mr-1" />
              {t('tools.freightCalculator.weightLbs', 'Weight (lbs)')}
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tools.freightCalculator.distanceMiles', 'Distance (miles)')}
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Package className="w-4 h-4 inline mr-1" />
              {t('tools.freightCalculator.pallets', 'Pallets')}
            </label>
            <input
              type="number"
              min="1"
              value={palletCount}
              onChange={(e) => setPalletCount(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.freightCalculator.totalDimensionsInches', 'Total Dimensions (inches)')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.freightCalculator.length', 'Length')}</span>
            </div>
            <div>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.freightCalculator.width', 'Width')}</span>
            </div>
            <div>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.freightCalculator.height', 'Height')}</span>
            </div>
          </div>
        </div>

        {/* Freight Class */}
        {mode === 'ltl' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calculator className="w-4 h-4 inline mr-1" />
              {t('tools.freightCalculator.freightClass', 'Freight Class')}
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={freightClass}
                onChange={(e) => setFreightClass(e.target.value as FreightClass)}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                {Object.keys(freightClassRates).map((fc) => (
                  <option key={fc} value={fc}>Class {fc}</option>
                ))}
              </select>
              <button
                onClick={() => setFreightClass(getSuggestedClass(calculations.density))}
                className="px-3 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-colors"
              >
                {t('tools.freightCalculator.autoDetect', 'Auto-Detect')}
              </button>
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Density: {calculations.density.toFixed(1)} lbs/ft³ | Suggested Class: {getSuggestedClass(calculations.density)}
            </div>
          </div>
        )}

        {/* Accessorials */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.freightCalculator.accessorialServices', 'Accessorial Services')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'liftgate', label: 'Liftgate', cost: accessorialCosts.liftgate },
              { key: 'residential', label: 'Residential Delivery', cost: accessorialCosts.residential },
              { key: 'insideDelivery', label: 'Inside Delivery', cost: accessorialCosts.insideDelivery },
              { key: 'appointmentRequired', label: 'Appointment', cost: accessorialCosts.appointmentRequired },
            ].map((acc) => (
              <label key={acc.key} className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <input
                  type="checkbox"
                  checked={accessorials[acc.key as keyof typeof accessorials]}
                  onChange={(e) => setAccessorials({ ...accessorials, [acc.key]: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{acc.label}</span>
                <span className={`text-xs ml-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>+${acc.cost}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.freightCalculator.estimatedFreightCost', 'Estimated Freight Cost')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            ${calculations.totalCost.toFixed(2)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {mode.toUpperCase()} | {calculations.cwtWeight.toFixed(0)} CWT | {calculations.cubicFeet.toFixed(1)} ft³
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.freightCalculator.baseRate', 'Base Rate')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.baseCost.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.freightCalculator.fuelSurcharge', 'Fuel Surcharge')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.fuelSurcharge.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.freightCalculator.costPerPallet', 'Cost per Pallet')}</div>
            <div className="text-2xl font-bold text-teal-500">
              ${calculations.costPerPallet.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.freightCalculator.costPerPound', 'Cost per Pound')}</div>
            <div className="text-2xl font-bold text-teal-500">
              ${calculations.costPerPound.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.freightCalculator.aboutFreightClasses', 'About Freight Classes')}</p>
            <p>{t('tools.freightCalculator.nmfcFreightClassesRangeFrom', 'NMFC freight classes range from 50-500 based on density, handling, stowability, and liability. Lower classes mean lower rates. Use the auto-detect feature to find your approximate class based on density.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightCalculatorTool;
