import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Truck, Scale, Ruler, DollarSign, Sparkles, MapPin, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ShippingCostCalculatorToolProps {
  uiConfig?: UIConfig;
}

type ShippingCarrier = 'usps' | 'ups' | 'fedex' | 'dhl';
type ShippingSpeed = 'ground' | 'express' | 'overnight';

interface CarrierRate {
  name: string;
  baseRate: number;
  perLbRate: number;
  dimFactor: number;
  speedMultipliers: Record<ShippingSpeed, number>;
}

export const ShippingCostCalculatorTool: React.FC<ShippingCostCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('5');
  const [length, setLength] = useState('12');
  const [width, setWidth] = useState('8');
  const [height, setHeight] = useState('6');
  const [carrier, setCarrier] = useState<ShippingCarrier>('usps');
  const [speed, setSpeed] = useState<ShippingSpeed>('ground');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [distance, setDistance] = useState('500');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.weight !== undefined) {
        setWeight(String(params.weight));
        setIsPrefilled(true);
      }
      if (params.length !== undefined) {
        setLength(String(params.length));
        setIsPrefilled(true);
      }
      if (params.width !== undefined) {
        setWidth(String(params.width));
        setIsPrefilled(true);
      }
      if (params.height !== undefined) {
        setHeight(String(params.height));
        setIsPrefilled(true);
      }
      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const carrierRates: Record<ShippingCarrier, CarrierRate> = {
    usps: {
      name: 'USPS',
      baseRate: 4.50,
      perLbRate: 0.45,
      dimFactor: 166,
      speedMultipliers: { ground: 1, express: 1.8, overnight: 3.2 },
    },
    ups: {
      name: 'UPS',
      baseRate: 8.50,
      perLbRate: 0.55,
      dimFactor: 139,
      speedMultipliers: { ground: 1, express: 1.6, overnight: 2.8 },
    },
    fedex: {
      name: 'FedEx',
      baseRate: 9.00,
      perLbRate: 0.52,
      dimFactor: 139,
      speedMultipliers: { ground: 1, express: 1.7, overnight: 2.9 },
    },
    dhl: {
      name: 'DHL',
      baseRate: 12.00,
      perLbRate: 0.65,
      dimFactor: 139,
      speedMultipliers: { ground: 1, express: 1.5, overnight: 2.5 },
    },
  };

  const calculations = useMemo(() => {
    let w = parseFloat(weight) || 0;
    let l = parseFloat(length) || 0;
    let wd = parseFloat(width) || 0;
    let h = parseFloat(height) || 0;
    const dist = parseFloat(distance) || 0;

    // Convert to imperial if metric
    if (unit === 'metric') {
      w = w * 2.20462; // kg to lbs
      l = l * 0.393701; // cm to inches
      wd = wd * 0.393701;
      h = h * 0.393701;
    }

    const carrierInfo = carrierRates[carrier];

    // Calculate dimensional weight
    const cubicInches = l * wd * h;
    const dimWeight = cubicInches / carrierInfo.dimFactor;

    // Use billable weight (greater of actual or dimensional)
    const billableWeight = Math.max(w, dimWeight);

    // Base cost calculation
    let baseCost = carrierInfo.baseRate + (billableWeight * carrierInfo.perLbRate);

    // Add distance factor
    const distanceFactor = 1 + (dist / 3000);
    baseCost *= distanceFactor;

    // Apply speed multiplier
    const totalCost = baseCost * carrierInfo.speedMultipliers[speed];

    // Estimate delivery days
    const deliveryDays = speed === 'overnight' ? '1' : speed === 'express' ? '2-3' : '5-7';

    return {
      actualWeight: w,
      dimWeight,
      billableWeight,
      baseCost,
      totalCost,
      deliveryDays,
      cubicInches,
    };
  }, [weight, length, width, height, carrier, speed, unit, distance]);

  const allCarrierCosts = useMemo(() => {
    return Object.entries(carrierRates).map(([key, info]) => {
      let w = parseFloat(weight) || 0;
      let l = parseFloat(length) || 0;
      let wd = parseFloat(width) || 0;
      let h = parseFloat(height) || 0;
      const dist = parseFloat(distance) || 0;

      if (unit === 'metric') {
        w = w * 2.20462;
        l = l * 0.393701;
        wd = wd * 0.393701;
        h = h * 0.393701;
      }

      const cubicInches = l * wd * h;
      const dimWeight = cubicInches / info.dimFactor;
      const billableWeight = Math.max(w, dimWeight);
      let baseCost = info.baseRate + (billableWeight * info.perLbRate);
      const distanceFactor = 1 + (dist / 3000);
      baseCost *= distanceFactor;
      const cost = baseCost * info.speedMultipliers[speed];

      return { key, name: info.name, cost };
    }).sort((a, b) => a.cost - b.cost);
  }, [weight, length, width, height, speed, unit, distance]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Truck className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.shippingCostCalculator.shippingCostCalculator', 'Shipping Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shippingCostCalculator.calculateShippingCostsByWeight', 'Calculate shipping costs by weight and dimensions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.shippingCostCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.shippingCostCalculator.lbsInches', 'lbs / inches')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.shippingCostCalculator.kgCm', 'kg / cm')}
          </button>
        </div>

        {/* Weight and Distance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Scale className="w-4 h-4 inline mr-1" />
              Weight ({unit === 'imperial' ? 'lbs' : 'kg'})
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
              Distance ({unit === 'imperial' ? 'miles' : 'km'})
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            Package Dimensions ({unit === 'imperial' ? 'inches' : 'cm'})
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder={t('tools.shippingCostCalculator.length2', 'Length')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.shippingCostCalculator.length', 'Length')}</span>
            </div>
            <div>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder={t('tools.shippingCostCalculator.width2', 'Width')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.shippingCostCalculator.width', 'Width')}</span>
            </div>
            <div>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={t('tools.shippingCostCalculator.height2', 'Height')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.shippingCostCalculator.height', 'Height')}</span>
            </div>
          </div>
        </div>

        {/* Carrier Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.shippingCostCalculator.carrier', 'Carrier')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(carrierRates).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCarrier(key as ShippingCarrier)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${carrier === key ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {info.name}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.shippingCostCalculator.shippingSpeed', 'Shipping Speed')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['ground', 'express', 'overnight'] as ShippingSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${speed === s ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingCostCalculator.estimatedShippingCost', 'Estimated Shipping Cost')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            ${calculations.totalCost.toFixed(2)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {carrierRates[carrier].name} - {speed.charAt(0).toUpperCase() + speed.slice(1)} ({calculations.deliveryDays} days)
          </div>
        </div>

        {/* Weight Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingCostCalculator.actualWeight', 'Actual Weight')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.actualWeight.toFixed(1)} lbs
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingCostCalculator.dimWeight', 'Dim Weight')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.dimWeight.toFixed(1)} lbs
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingCostCalculator.billableWeight', 'Billable Weight')}</div>
            <div className="text-xl font-bold text-teal-500">
              {calculations.billableWeight.toFixed(1)} lbs
            </div>
          </div>
        </div>

        {/* Carrier Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            Compare All Carriers ({speed})
          </h4>
          <div className="space-y-2">
            {allCarrierCosts.map((c, idx) => (
              <div key={c.key} className={`flex justify-between items-center p-2 rounded ${c.key === carrier ? 'bg-teal-500/20' : ''}`}>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} ${idx === 0 ? 'font-medium' : ''}`}>
                  {idx === 0 && <span className="text-teal-500 mr-2">{t('tools.shippingCostCalculator.lowest', 'Lowest')}</span>}
                  {c.name}
                </span>
                <span className={`font-medium ${c.key === carrier ? 'text-teal-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${c.cost.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingCostCalculatorTool;
