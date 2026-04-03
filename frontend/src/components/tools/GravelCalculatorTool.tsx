import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, Ruler, Layers, Truck, Info, Calculator, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type GravelType = 'pea' | 'crushed' | 'river' | 'decomposed' | 'limestone' | 'marble';
type AreaShape = 'rectangle' | 'circle';
type UnitSystem = 'imperial' | 'metric';

interface GravelConfig {
  name: string;
  density: number; // tons per cubic yard
  coverageRate: string; // description of coverage
  description: string;
  priceRange: string; // per ton estimate
}

interface GravelCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const GravelCalculatorTool: React.FC<GravelCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [gravelType, setGravelType] = useState<GravelType>('pea');
  const [areaShape, setAreaShape] = useState<AreaShape>('rectangle');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  // Imperial measurements (feet)
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('10');
  const [diameter, setDiameter] = useState('10');
  const [depth, setDepth] = useState('3'); // inches for imperial, cm for metric

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setLength(params.numbers[0].toString());
        setWidth(params.numbers[1].toString());
        if (params.numbers[2]) {
          setDepth(params.numbers[2].toString());
        }
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setLength(params.length.toString());
        setWidth(params.width.toString());
        if (params.depth) {
          setDepth(params.depth.toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const gravelTypes: Record<GravelType, GravelConfig> = {
    pea: {
      name: 'Pea Gravel',
      density: 1.4,
      coverageRate: '~100 sq ft at 3" depth per cubic yard',
      description: 'Small, rounded stones. Great for walkways, patios, and drainage.',
      priceRange: '$30-60/ton',
    },
    crushed: {
      name: 'Crushed Stone',
      density: 1.35,
      coverageRate: '~100 sq ft at 3" depth per cubic yard',
      description: 'Angular stones that compact well. Ideal for driveways and base material.',
      priceRange: '$25-50/ton',
    },
    river: {
      name: 'River Rock',
      density: 1.5,
      coverageRate: '~80 sq ft at 3" depth per cubic yard',
      description: 'Smooth, rounded stones. Decorative landscaping and dry creek beds.',
      priceRange: '$50-100/ton',
    },
    decomposed: {
      name: 'Decomposed Granite',
      density: 1.35,
      coverageRate: '~110 sq ft at 3" depth per cubic yard',
      description: 'Fine, compacted granite. Natural paths and rustic patios.',
      priceRange: '$40-80/ton',
    },
    limestone: {
      name: 'Limestone Gravel',
      density: 1.3,
      coverageRate: '~100 sq ft at 3" depth per cubic yard',
      description: 'White/gray crushed limestone. Driveways and formal landscaping.',
      priceRange: '$35-65/ton',
    },
    marble: {
      name: 'Marble Chips',
      density: 1.5,
      coverageRate: '~80 sq ft at 3" depth per cubic yard',
      description: 'Decorative white/colored chips. Accent beds and high-end landscaping.',
      priceRange: '$75-150/ton',
    },
  };

  const config = gravelTypes[gravelType];

  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(diameter) || 0;
    const depthVal = parseFloat(depth) || 0;

    // Calculate area in square feet (or square meters)
    let area: number;
    if (areaShape === 'rectangle') {
      area = l * w;
    } else {
      const radius = d / 2;
      area = Math.PI * radius * radius;
    }

    // Convert depth to feet (or meters)
    let depthInFeet: number;
    let areaInSqFt: number;

    if (unitSystem === 'imperial') {
      depthInFeet = depthVal / 12; // inches to feet
      areaInSqFt = area;
    } else {
      // Metric: area in m², depth in cm
      depthInFeet = (depthVal / 100) * 3.28084; // cm to meters to feet
      areaInSqFt = area * 10.7639; // m² to ft²
    }

    // Calculate volume in cubic feet, then convert to cubic yards
    const volumeCubicFeet = areaInSqFt * depthInFeet;
    const cubicYards = volumeCubicFeet / 27;

    // Calculate tons based on gravel density
    const tons = cubicYards * config.density;

    // Calculate bags needed (assuming 0.5 cubic feet per 50lb bag)
    const bagsNeeded = Math.ceil(volumeCubicFeet / 0.5);

    // Delivery estimate (typical truck holds 10-15 cubic yards)
    let deliveryType: string;
    if (cubicYards <= 1) {
      deliveryType = 'Pickup truck or trailer';
    } else if (cubicYards <= 5) {
      deliveryType = 'Small dump truck (5 yards)';
    } else if (cubicYards <= 10) {
      deliveryType = 'Standard dump truck (10 yards)';
    } else if (cubicYards <= 15) {
      deliveryType = 'Large dump truck (15 yards)';
    } else {
      deliveryType = 'Multiple deliveries required';
    }

    // Coverage rate (sq ft per cubic yard at given depth)
    const coveragePerYard = 324 / depthInFeet; // 324 sq ft per cubic yard at 1 ft depth

    return {
      area: areaInSqFt.toFixed(1),
      areaMetric: (areaInSqFt / 10.7639).toFixed(2),
      cubicYards: cubicYards.toFixed(2),
      cubicMeters: (cubicYards * 0.7646).toFixed(2),
      tons: tons.toFixed(2),
      tonnes: (tons * 0.9072).toFixed(2),
      bagsNeeded: bagsNeeded,
      deliveryType,
      coveragePerYard: coveragePerYard.toFixed(0),
    };
  }, [length, width, diameter, depth, areaShape, unitSystem, config.density]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-stone-900/20' : 'bg-gradient-to-r from-white to-stone-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-500/10 rounded-lg"><Mountain className="w-5 h-5 text-stone-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gravelCalculator.gravelStoneCalculator', 'Gravel & Stone Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gravelCalculator.calculateMaterialNeededForYour', 'Calculate material needed for your project')}</p>
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.gravelCalculator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Unit System Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 py-2 rounded-lg text-sm ${unitSystem === 'imperial' ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gravelCalculator.imperialFtIn', 'Imperial (ft/in)')}
          </button>
          <button
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 py-2 rounded-lg text-sm ${unitSystem === 'metric' ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gravelCalculator.metricMCm', 'Metric (m/cm)')}
          </button>
        </div>

        {/* Gravel Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.gravelCalculator.gravelType', 'Gravel Type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(gravelTypes) as GravelType[]).map((type) => (
              <button
                key={type}
                onClick={() => setGravelType(type)}
                className={`py-2 px-3 rounded-lg text-sm ${gravelType === type ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {gravelTypes[type].name}
              </button>
            ))}
          </div>
        </div>

        {/* Gravel Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-stone-900/20 border-stone-800' : 'bg-stone-50 border-stone-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-stone-500 font-bold">{config.priceRange}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.gravelCalculator.density', 'Density:')}</span> {config.density} tons/yd³
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.gravelCalculator.coverage', 'Coverage:')}</span> {config.coverageRate.split('~')[1]?.split(' at')[0] || '100'} sq ft
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Area Shape Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setAreaShape('rectangle')}
            className={`flex-1 py-2 rounded-lg ${areaShape === 'rectangle' ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gravelCalculator.rectangle', 'Rectangle')}
          </button>
          <button
            onClick={() => setAreaShape('circle')}
            className={`flex-1 py-2 rounded-lg ${areaShape === 'circle' ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gravelCalculator.circle', 'Circle')}
          </button>
        </div>

        {/* Dimension Inputs */}
        {areaShape === 'rectangle' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                Length ({unitSystem === 'imperial' ? 'feet' : 'meters'})
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                Width ({unitSystem === 'imperial' ? 'feet' : 'meters'})
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              Diameter ({unitSystem === 'imperial' ? 'feet' : 'meters'})
            </label>
            <input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {/* Depth Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Layers className="w-4 h-4 inline mr-1" />
            Depth ({unitSystem === 'imperial' ? 'inches' : 'centimeters'})
          </label>
          <div className="flex gap-2">
            {(unitSystem === 'imperial' ? [2, 3, 4, 6] : [5, 8, 10, 15]).map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d.toString())}
                className={`flex-1 py-2 rounded-lg ${parseFloat(depth) === d ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {d}{unitSystem === 'imperial' ? '"' : 'cm'}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            placeholder={unitSystem === 'imperial' ? t('tools.gravelCalculator.customDepthInInches', 'Custom depth in inches') : t('tools.gravelCalculator.customDepthInCm', 'Custom depth in cm')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-stone-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gravelCalculator.cubicYards', 'Cubic Yards')}</span>
            </div>
            <div className="text-3xl font-bold text-stone-500">{calculations.cubicYards}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.cubicMeters} m³
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-4 h-4 text-amber-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gravelCalculator.weightTons', 'Weight (Tons)')}</span>
            </div>
            <div className="text-3xl font-bold text-amber-500">{calculations.tons}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.tonnes} tonnes
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gravelCalculator.areaCoverage', 'Area Coverage')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.area} sq ft
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.areaMetric} m²
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>50lb Bags Needed</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ~{calculations.bagsNeeded} bags
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.gravelCalculator.forSmallProjects', 'For small projects')}
            </div>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-stone-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gravelCalculator.deliveryRecommendation', 'Delivery Recommendation')}</span>
          </div>
          <div className={`text-lg font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            {calculations.deliveryType}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Coverage rate: ~{calculations.coveragePerYard} sq ft per cubic yard
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.gravelCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Order 10-15% extra for settling and waste</li>
                <li>• 2-3" depth for walkways, 4-6" for driveways</li>
                <li>• Add landscape fabric under gravel to prevent weeds</li>
                <li>• Prices vary by region and delivery distance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GravelCalculatorTool;
