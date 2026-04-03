import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Scale, Ruler, Sparkles, Info, ArrowRight, Package, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DimensionalWeightToolProps {
  uiConfig?: UIConfig;
}

type Carrier = 'ups' | 'fedex' | 'usps' | 'dhl';

interface CarrierDimFactor {
  name: string;
  domestic: number;
  international: number;
}

export const DimensionalWeightTool: React.FC<DimensionalWeightToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [length, setLength] = useState('18');
  const [width, setWidth] = useState('12');
  const [height, setHeight] = useState('8');
  const [actualWeight, setActualWeight] = useState('5');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [carrier, setCarrier] = useState<Carrier>('ups');
  const [shipmentType, setShipmentType] = useState<'domestic' | 'international'>('domestic');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
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
      if (params.weight !== undefined) {
        setActualWeight(String(params.weight));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const carrierFactors: Record<Carrier, CarrierDimFactor> = {
    ups: { name: 'UPS', domestic: 139, international: 139 },
    fedex: { name: 'FedEx', domestic: 139, international: 139 },
    usps: { name: 'USPS', domestic: 166, international: 166 },
    dhl: { name: 'DHL', domestic: 139, international: 139 },
  };

  const calculations = useMemo(() => {
    let l = parseFloat(length) || 0;
    let w = parseFloat(width) || 0;
    let h = parseFloat(height) || 0;
    let actual = parseFloat(actualWeight) || 0;

    // Convert to imperial if metric
    if (unit === 'metric') {
      l = l * 0.393701; // cm to inches
      w = w * 0.393701;
      h = h * 0.393701;
      actual = actual * 2.20462; // kg to lbs
    }

    const cubicInches = l * w * h;

    // Calculate DIM weight for all carriers
    const allCarrierResults = Object.entries(carrierFactors).map(([key, info]) => {
      const factor = shipmentType === 'domestic' ? info.domestic : info.international;
      const dimWeight = cubicInches / factor;
      const billableWeight = Math.max(dimWeight, actual);
      const isDimWeightBased = dimWeight > actual;

      return {
        carrier: key,
        name: info.name,
        factor,
        dimWeight,
        billableWeight,
        isDimWeightBased,
      };
    });

    const selectedCarrier = allCarrierResults.find(c => c.carrier === carrier)!;

    // Calculate girth
    const girth = (2 * w) + (2 * h);
    const lengthPlusGirth = l + girth;

    // Cost estimate (simplified)
    const baseCostPerLb = 0.50;
    const estimatedCost = selectedCarrier.billableWeight * baseCostPerLb;

    // Savings if optimized
    const potentialSavings = selectedCarrier.isDimWeightBased
      ? (selectedCarrier.dimWeight - actual) * baseCostPerLb
      : 0;

    return {
      cubicInches,
      cubicFeet: cubicInches / 1728,
      girth,
      lengthPlusGirth,
      actualWeight: actual,
      selectedCarrier,
      allCarrierResults,
      estimatedCost,
      potentialSavings,
      oversized: lengthPlusGirth > 165,
    };
  }, [length, width, height, actualWeight, unit, carrier, shipmentType]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Box className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dimensionalWeight.dimensionalWeightCalculator', 'Dimensional Weight Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dimensionalWeight.calculateDimWeightForShipping', 'Calculate DIM weight for shipping quotes')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.dimensionalWeight.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'imperial' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.dimensionalWeight.imperialInLbs', 'Imperial (in/lbs)')}
          </button>
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-2 rounded-lg transition-colors ${unit === 'metric' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.dimensionalWeight.metricCmKg', 'Metric (cm/kg)')}
          </button>
        </div>

        {/* Shipment Type */}
        <div className="flex gap-2">
          <button
            onClick={() => setShipmentType('domestic')}
            className={`flex-1 py-2 rounded-lg transition-colors ${shipmentType === 'domestic' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.dimensionalWeight.domestic', 'Domestic')}
          </button>
          <button
            onClick={() => setShipmentType('international')}
            className={`flex-1 py-2 rounded-lg transition-colors ${shipmentType === 'international' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.dimensionalWeight.international', 'International')}
          </button>
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
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.dimensionalWeight.length', 'Length')}</span>
            </div>
            <div>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.dimensionalWeight.width', 'Width')}</span>
            </div>
            <div>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.dimensionalWeight.height', 'Height')}</span>
            </div>
          </div>
        </div>

        {/* Actual Weight */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-1" />
            Actual Weight ({unit === 'imperial' ? 'lbs' : 'kg'})
          </label>
          <input
            type="number"
            value={actualWeight}
            onChange={(e) => setActualWeight(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* Carrier Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.dimensionalWeight.carrier', 'Carrier')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(carrierFactors).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCarrier(key as Carrier)}
                className={`py-2 px-3 rounded-lg text-sm transition-colors ${carrier === key ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium">{info.name}</div>
                <div className={`text-xs ${carrier === key ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Factor: {info.domestic}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Oversized Warning */}
        {calculations.oversized && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500">
              Oversized package (L + Girth {'>'} 165"). Additional fees may apply.
            </span>
          </div>
        )}

        {/* Main Result */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dimensionalWeight.actual', 'Actual')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.actualWeight.toFixed(1)} lbs
              </div>
            </div>
            <ArrowRight className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dimensionalWeight.dimWeight', 'DIM Weight')}</div>
              <div className={`text-2xl font-bold ${calculations.selectedCarrier.isDimWeightBased ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.selectedCarrier.dimWeight.toFixed(1)} lbs
              </div>
            </div>
            <ArrowRight className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dimensionalWeight.billable', 'Billable')}</div>
              <div className="text-2xl font-bold text-teal-500">
                {calculations.selectedCarrier.billableWeight.toFixed(1)} lbs
              </div>
            </div>
          </div>
          <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.selectedCarrier.isDimWeightBased ? (
              <span className="text-amber-500">{t('tools.dimensionalWeight.billedByDimWeightPackage', 'Billed by DIM weight (package is light for its size)')}</span>
            ) : (
              <span className="text-green-500">{t('tools.dimensionalWeight.billedByActualWeightPackage', 'Billed by actual weight (package is dense)')}</span>
            )}
          </div>
        </div>

        {/* Formula Display */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.dimensionalWeight.dimWeightFormula', 'DIM Weight Formula')}
          </div>
          <div className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            (L x W x H) / {calculations.selectedCarrier.factor} = DIM Weight
          </div>
          <div className={`text-sm font-mono mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
            ({length} x {width} x {height}) / {calculations.selectedCarrier.factor} = {calculations.selectedCarrier.dimWeight.toFixed(2)} lbs
          </div>
        </div>

        {/* All Carriers Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.dimensionalWeight.carrierComparison', 'Carrier Comparison')}
          </h4>
          <div className="space-y-2">
            {calculations.allCarrierResults.map((c) => (
              <div key={c.carrier} className={`flex justify-between items-center p-2 rounded ${c.carrier === carrier ? 'bg-teal-500/20' : ''}`}>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {c.name}
                  <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    (factor: {c.factor})
                  </span>
                </span>
                <div className="text-right">
                  <span className={`font-medium ${c.isDimWeightBased ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    {c.billableWeight.toFixed(1)} lbs
                  </span>
                  <span className={`text-xs ml-2 ${c.isDimWeightBased ? 'text-amber-400' : 'text-green-500'}`}>
                    {c.isDimWeightBased ? t('tools.dimensionalWeight.dim', 'DIM') : t('tools.dimensionalWeight.actual2', 'Actual')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Measurements */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dimensionalWeight.cubicInches', 'Cubic Inches')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.cubicInches.toLocaleString()}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dimensionalWeight.girth', 'Girth')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.girth.toFixed(1)}"
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dimensionalWeight.lGirth', 'L + Girth')}</div>
            <div className={`text-xl font-bold ${calculations.oversized ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.lengthPlusGirth.toFixed(1)}"
            </div>
          </div>
        </div>

        {/* Optimization Tips */}
        {calculations.selectedCarrier.isDimWeightBased && calculations.potentialSavings > 0 && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              <p className="font-medium mb-1">{t('tools.dimensionalWeight.packagingOptimization', 'Packaging Optimization')}</p>
              <p>This package is billed by DIM weight. Using a smaller box could save approximately ${calculations.potentialSavings.toFixed(2)} per shipment based on the weight difference of {(calculations.selectedCarrier.dimWeight - calculations.actualWeight).toFixed(1)} lbs.</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.dimensionalWeight.aboutDimensionalWeight', 'About Dimensional Weight')}</p>
            <p>{t('tools.dimensionalWeight.dimWeightIsAPricing', 'DIM weight is a pricing technique that accounts for package volume rather than just weight. Carriers charge by whichever is greater: actual weight or DIM weight. Lower DIM factors (like 139) result in higher DIM weights.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionalWeightTool;
