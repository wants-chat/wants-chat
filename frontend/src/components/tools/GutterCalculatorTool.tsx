import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Calculator, Info, Package, DollarSign, Ruler, ArrowDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface GutterCalculatorToolProps {
  uiConfig?: UIConfig;
}

type GutterStyle = '5-inch-k' | '6-inch-k' | '5-inch-half-round' | '6-inch-half-round' | 'box' | 'fascia';
type GutterMaterial = 'aluminum' | 'vinyl' | 'steel' | 'copper' | 'zinc';
type DownspoutSize = '2x3' | '3x4' | '4-inch-round';

interface GutterInfo {
  label: string;
  capacity: string;
  costPerFoot: { low: number; high: number };
}

interface MaterialInfo {
  label: string;
  multiplier: number;
  lifespan: string;
}

const GUTTER_STYLES: Record<GutterStyle, GutterInfo> = {
  '5-inch-k': { label: '5" K-Style', capacity: '5,520 sq ft roof', costPerFoot: { low: 4, high: 8 } },
  '6-inch-k': { label: '6" K-Style', capacity: '7,960 sq ft roof', costPerFoot: { low: 5, high: 10 } },
  '5-inch-half-round': { label: '5" Half-Round', capacity: '5,520 sq ft roof', costPerFoot: { low: 6, high: 12 } },
  '6-inch-half-round': { label: '6" Half-Round', capacity: '7,960 sq ft roof', costPerFoot: { low: 8, high: 15 } },
  'box': { label: 'Box Gutter', capacity: 'Custom', costPerFoot: { low: 10, high: 25 } },
  'fascia': { label: 'Fascia Gutter', capacity: 'Custom', costPerFoot: { low: 8, high: 18 } },
};

const GUTTER_MATERIALS: Record<GutterMaterial, MaterialInfo> = {
  'aluminum': { label: 'Aluminum', multiplier: 1.0, lifespan: '20-30 years' },
  'vinyl': { label: 'Vinyl', multiplier: 0.7, lifespan: '10-20 years' },
  'steel': { label: 'Galvanized Steel', multiplier: 1.2, lifespan: '15-25 years' },
  'copper': { label: 'Copper', multiplier: 4.0, lifespan: '50+ years' },
  'zinc': { label: 'Zinc', multiplier: 3.0, lifespan: '50+ years' },
};

const DOWNSPOUT_SIZES: { value: DownspoutSize; label: string; coverage: string }[] = [
  { value: '2x3', label: '2" x 3"', coverage: '600 sq ft roof' },
  { value: '3x4', label: '3" x 4"', coverage: '1,200 sq ft roof' },
  { value: '4-inch-round', label: '4" Round', coverage: '1,400 sq ft roof' },
];

export const GutterCalculatorTool: React.FC<GutterCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gutterLength, setGutterLength] = useState<string>('150');
  const [gutterStyle, setGutterStyle] = useState<GutterStyle>('5-inch-k');
  const [gutterMaterial, setGutterMaterial] = useState<GutterMaterial>('aluminum');
  const [downspoutSize, setDownspoutSize] = useState<DownspoutSize>('2x3');
  const [roofArea, setRoofArea] = useState<string>('1500');
  const [downspoutLength, setDownspoutLength] = useState<string>('10');
  const [numberOfCorners, setNumberOfCorners] = useState<string>('4');
  const [includeGuards, setIncludeGuards] = useState<boolean>(false);

  const calculations = useMemo(() => {
    const length = parseFloat(gutterLength) || 0;
    const roof = parseFloat(roofArea) || 1500;
    const dsLength = parseFloat(downspoutLength) || 10;
    const corners = parseInt(numberOfCorners) || 0;

    const styleInfo = GUTTER_STYLES[gutterStyle];
    const materialInfo = GUTTER_MATERIALS[gutterMaterial];

    // Calculate number of downspouts needed based on roof area
    const downspoutCoverage = downspoutSize === '2x3' ? 600 : downspoutSize === '3x4' ? 1200 : 1400;
    const downspoutsNeeded = Math.max(2, Math.ceil(roof / downspoutCoverage));

    // Calculate total downspout length
    const totalDownspoutLength = downspoutsNeeded * dsLength;

    // Calculate accessories
    const endCaps = 2; // Usually 2 end caps
    const outlets = downspoutsNeeded;
    const elbows = downspoutsNeeded * 2; // 2 elbows per downspout typically
    const hangers = Math.ceil(length / 2); // Hangers every 2 feet
    const splicers = Math.max(0, Math.ceil(length / 10) - 1); // Sections typically 10 feet

    // Calculate costs
    const baseCostPerFoot = (styleInfo.costPerFoot.low + styleInfo.costPerFoot.high) / 2;
    const adjustedCostPerFoot = baseCostPerFoot * materialInfo.multiplier;

    const gutterCostLow = length * styleInfo.costPerFoot.low * materialInfo.multiplier;
    const gutterCostHigh = length * styleInfo.costPerFoot.high * materialInfo.multiplier;

    const downspoutCostPerFoot = adjustedCostPerFoot * 0.6; // Downspouts typically 60% of gutter cost
    const downspoutCost = totalDownspoutLength * downspoutCostPerFoot;

    const accessoryCost = (corners * 8) + (endCaps * 5) + (outlets * 10) + (elbows * 6) + (hangers * 2) + (splicers * 4);

    const guardCost = includeGuards ? length * 6 : 0; // About $6 per foot for guards

    const laborCostPerFoot = 3; // Average $3 per foot labor
    const laborCost = length * laborCostPerFoot;

    const totalMaterialLow = gutterCostLow + downspoutCost + accessoryCost + guardCost;
    const totalMaterialHigh = gutterCostHigh + downspoutCost + accessoryCost + guardCost;

    return {
      gutterLength: length,
      downspoutsNeeded,
      totalDownspoutLength,
      endCaps,
      outlets,
      elbows,
      hangers,
      splicers,
      corners,
      gutterCost: { low: gutterCostLow, high: gutterCostHigh },
      downspoutCost,
      accessoryCost,
      guardCost,
      laborCost,
      totalMaterial: { low: totalMaterialLow, high: totalMaterialHigh },
      totalCost: { low: totalMaterialLow + laborCost, high: totalMaterialHigh + laborCost },
      styleInfo,
      materialInfo,
    };
  }, [gutterLength, gutterStyle, gutterMaterial, downspoutSize, roofArea, downspoutLength, numberOfCorners, includeGuards]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Droplets className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gutterCalculator.gutterCalculator', 'Gutter Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gutterCalculator.calculateGutterLengthAndMaterials', 'Calculate gutter length and materials')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.gutterCalculator.totalGutterLengthFeet', 'Total Gutter Length (feet)')}
            </label>
            <input
              type="number"
              value={gutterLength}
              onChange={(e) => setGutterLength(e.target.value)}
              placeholder={t('tools.gutterCalculator.housePerimeter', 'House perimeter')}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.gutterCalculator.eaveLengthOnAllSides', 'Eave length on all sides')}
            </p>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gutterCalculator.roofAreaSqFt', 'Roof Area (sq ft)')}
            </label>
            <input
              type="number"
              value={roofArea}
              onChange={(e) => setRoofArea(e.target.value)}
              min="100"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.gutterCalculator.forDownspoutSizing', 'For downspout sizing')}
            </p>
          </div>
        </div>

        {/* Gutter Style */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.gutterCalculator.gutterStyle', 'Gutter Style')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(GUTTER_STYLES).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setGutterStyle(key as GutterStyle)}
                className={`py-3 px-3 rounded-lg text-sm font-medium text-left transition-colors ${
                  gutterStyle === key
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold">{info.label}</div>
                <div className={`text-xs mt-1 ${gutterStyle === key ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {info.capacity}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Material Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.gutterCalculator.gutterMaterial', 'Gutter Material')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(GUTTER_MATERIALS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setGutterMaterial(key as GutterMaterial)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  gutterMaterial === key
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Downspout Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <ArrowDown className="w-4 h-4 inline mr-1" />
              {t('tools.gutterCalculator.downspoutSize', 'Downspout Size')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DOWNSPOUT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setDownspoutSize(size.value)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                    downspoutSize === size.value
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gutterCalculator.downspoutLengthFeetEach', 'Downspout Length (feet each)')}
            </label>
            <input
              type="number"
              value={downspoutLength}
              onChange={(e) => setDownspoutLength(e.target.value)}
              min="1"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gutterCalculator.numberOfCorners', 'Number of Corners')}
            </label>
            <input
              type="number"
              value={numberOfCorners}
              onChange={(e) => setNumberOfCorners(e.target.value)}
              min="0"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gutterCalculator.gutterGuards', 'Gutter Guards')}
            </label>
            <button
              onClick={() => setIncludeGuards(!includeGuards)}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                includeGuards
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {includeGuards ? t('tools.gutterCalculator.included', 'Included') : t('tools.gutterCalculator.notIncluded', 'Not Included')}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gutterCalculator.gutters', 'Gutters')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{calculations.gutterLength}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gutterCalculator.linearFeet', 'linear feet')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gutterCalculator.downspouts', 'Downspouts')}</div>
            <div className="text-2xl font-bold text-blue-500">{calculations.downspoutsNeeded}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>required</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gutterCalculator.hangers', 'Hangers')}</div>
            <div className="text-2xl font-bold text-amber-500">{calculations.hangers}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>@2ft spacing</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gutterCalculator.elbows', 'Elbows')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{calculations.elbows}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gutterCalculator.forDownspouts', 'for downspouts')}</div>
          </div>
        </div>

        {/* Materials List */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.gutterCalculator.materialsList', 'Materials List')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.gutterCalculator.endCaps', 'End Caps:')}</span> {calculations.endCaps}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.gutterCalculator.outlets', 'Outlets:')}</span> {calculations.outlets}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.gutterCalculator.corners', 'Corners:')}</span> {calculations.corners}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.gutterCalculator.splicers', 'Splicers:')}</span> {calculations.splicers}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.gutterCalculator.downspoutLength', 'Downspout Length:')}</span> {calculations.totalDownspoutLength} ft
            </div>
            {includeGuards && (
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">{t('tools.gutterCalculator.guards', 'Guards:')}</span> {calculations.gutterLength} ft
              </div>
            )}
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-800' : t('tools.gutterCalculator.bg0d948810', 'bg-[#0D9488]/10')}`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gutterCalculator.costEstimate', 'Cost Estimate')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.gutterCalculator.gutters2', 'Gutters')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.gutterCost.low.toFixed(0)} - ${calculations.gutterCost.high.toFixed(0)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.gutterCalculator.downspouts2', 'Downspouts')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.downspoutCost.toFixed(0)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.gutterCalculator.accessories', 'Accessories')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.accessoryCost.toFixed(0)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.gutterCalculator.labor', 'Labor')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.laborCost.toFixed(0)}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-600">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.gutterCalculator.totalEstimatedCost', 'Total Estimated Cost')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">
              ${calculations.totalCost.low.toLocaleString()} - ${calculations.totalCost.high.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Material Info */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.gutterCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.materialInfo.label} - {calculations.styleInfo.label}
          </h4>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>{t('tools.gutterCalculator.expectedLifespan', 'Expected Lifespan:')}</strong> {calculations.materialInfo.lifespan}
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.gutterCalculator.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Slope gutters 1/4" per 10 feet toward downspouts</li>
                <li>- Place downspouts at corners and every 35-40 feet</li>
                <li>- Extend downspouts 4-6 feet away from foundation</li>
                <li>- Clean gutters twice yearly (spring and fall)</li>
                <li>- Consider seamless gutters for fewer leak points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GutterCalculatorTool;
