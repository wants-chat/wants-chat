import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, Calculator, Info, Package, DollarSign, Ruler, Circle, Square, Triangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface SandCalculatorToolProps {
  uiConfig?: UIConfig;
}

type AreaShape = 'rectangle' | 'circle' | 'triangle';
type SandType = 'fill' | 'concrete' | 'paver' | 'play' | 'masonry' | 'pool-filter';
type DepthUnit = 'inches' | 'feet';

interface SandInfo {
  label: string;
  description: string;
  lbsPerCubicFt: number;
  costPerTon: { low: number; high: number };
  uses: string[];
}

const SAND_TYPES: Record<SandType, SandInfo> = {
  'fill': {
    label: 'Fill Sand',
    description: 'General purpose sand for filling and leveling',
    lbsPerCubicFt: 100,
    costPerTon: { low: 25, high: 40 },
    uses: ['Backfill', 'Grading', 'Pipe bedding', 'Foundation base'],
  },
  'concrete': {
    label: 'Concrete Sand',
    description: 'Washed sand for concrete and masonry mixes',
    lbsPerCubicFt: 100,
    costPerTon: { low: 30, high: 50 },
    uses: ['Concrete mixing', 'Mortar', 'Stucco base'],
  },
  'paver': {
    label: 'Paver Sand / Leveling Sand',
    description: 'Fine sand for paver installation base',
    lbsPerCubicFt: 100,
    costPerTon: { low: 35, high: 55 },
    uses: ['Paver base', 'Patio bedding', 'Joint filling'],
  },
  'play': {
    label: 'Play Sand',
    description: 'Fine, washed sand for play areas',
    lbsPerCubicFt: 90,
    costPerTon: { low: 40, high: 80 },
    uses: ['Sandboxes', 'Play areas', 'Volleyball courts'],
  },
  'masonry': {
    label: 'Masonry Sand',
    description: 'Fine sand for mortar and grout',
    lbsPerCubicFt: 100,
    costPerTon: { low: 35, high: 55 },
    uses: ['Mortar mixing', 'Brick laying', 'Block work'],
  },
  'pool-filter': {
    label: 'Pool Filter Sand',
    description: 'Specially graded for pool filtration',
    lbsPerCubicFt: 100,
    costPerTon: { low: 60, high: 100 },
    uses: ['Pool filters', 'Water filtration'],
  },
};

export const SandCalculatorTool: React.FC<SandCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [shape, setShape] = useState<AreaShape>('rectangle');
  const [length, setLength] = useState<string>('10');
  const [width, setWidth] = useState<string>('10');
  const [diameter, setDiameter] = useState<string>('10');
  const [triangleBase, setTriangleBase] = useState<string>('10');
  const [triangleHeight, setTriangleHeight] = useState<string>('10');
  const [depth, setDepth] = useState<string>('2');
  const [depthUnit, setDepthUnit] = useState<DepthUnit>('inches');
  const [sandType, setSandType] = useState<SandType>('fill');
  const [compactionFactor, setCompactionFactor] = useState<string>('10');

  const calculations = useMemo(() => {
    let areaSqFt = 0;

    switch (shape) {
      case 'rectangle':
        areaSqFt = (parseFloat(length) || 0) * (parseFloat(width) || 0);
        break;
      case 'circle':
        const radius = (parseFloat(diameter) || 0) / 2;
        areaSqFt = Math.PI * radius * radius;
        break;
      case 'triangle':
        areaSqFt = 0.5 * (parseFloat(triangleBase) || 0) * (parseFloat(triangleHeight) || 0);
        break;
    }

    // Convert depth to feet
    const depthValue = parseFloat(depth) || 0;
    const depthFt = depthUnit === 'inches' ? depthValue / 12 : depthValue;

    // Calculate volume
    const cubicFeet = areaSqFt * depthFt;
    const cubicYards = cubicFeet / 27;

    // Apply compaction factor (sand compacts about 10-15%)
    const compaction = parseFloat(compactionFactor) || 10;
    const adjustedCubicYards = cubicYards * (1 + compaction / 100);

    // Get sand info
    const sandInfo = SAND_TYPES[sandType];

    // Calculate weight
    const totalLbs = adjustedCubicYards * 27 * sandInfo.lbsPerCubicFt;
    const totalTons = totalLbs / 2000;

    // Cost calculations
    const costLow = totalTons * sandInfo.costPerTon.low;
    const costHigh = totalTons * sandInfo.costPerTon.high;

    // Bags calculation (50 lb bags)
    const bags50lb = Math.ceil(totalLbs / 50);
    // Bulk calculation (typically sold by cubic yard or ton)
    const bagsRecommended = totalTons < 1; // Recommend bags if less than 1 ton

    return {
      areaSqFt: areaSqFt.toFixed(2),
      depthFt: depthFt.toFixed(3),
      cubicFeet: cubicFeet.toFixed(2),
      cubicYards: cubicYards.toFixed(2),
      adjustedCubicYards: adjustedCubicYards.toFixed(2),
      totalLbs: Math.ceil(totalLbs),
      totalTons: totalTons.toFixed(2),
      bags50lb,
      bagsRecommended,
      costLow: costLow.toFixed(2),
      costHigh: costHigh.toFixed(2),
      sandInfo,
    };
  }, [shape, length, width, diameter, triangleBase, triangleHeight, depth, depthUnit, sandType, compactionFactor]);

  const getShapeIcon = (s: AreaShape) => {
    switch (s) {
      case 'rectangle': return Square;
      case 'circle': return Circle;
      case 'triangle': return Triangle;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Mountain className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sandCalculator.sandCalculator', 'Sand Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sandCalculator.calculateSandVolumeAndWeight', 'Calculate sand volume and weight')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Shape Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sandCalculator.areaShape', 'Area Shape')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['rectangle', 'circle', 'triangle'] as AreaShape[]).map((s) => {
              const Icon = getShapeIcon(s);
              return (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                    shape === s
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions Based on Shape */}
        {shape === 'rectangle' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                {t('tools.sandCalculator.lengthFeet', 'Length (feet)')}
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sandCalculator.widthFeet', 'Width (feet)')}
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        )}

        {shape === 'circle' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.sandCalculator.diameterFeet', 'Diameter (feet)')}
            </label>
            <input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        )}

        {shape === 'triangle' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                {t('tools.sandCalculator.baseFeet', 'Base (feet)')}
              </label>
              <input
                type="number"
                value={triangleBase}
                onChange={(e) => setTriangleBase(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sandCalculator.heightFeet', 'Height (feet)')}
              </label>
              <input
                type="number"
                value={triangleHeight}
                onChange={(e) => setTriangleHeight(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        )}

        {/* Depth Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.sandCalculator.depth', 'Depth')}
            </label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              min="0"
              step="0.5"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.sandCalculator.depthUnit', 'Depth Unit')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['inches', 'feet'] as DepthUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setDepthUnit(unit)}
                  className={`py-3 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                    depthUnit === unit
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sand Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sandCalculator.sandType', 'Sand Type')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(SAND_TYPES).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSandType(key as SandType)}
                className={`py-3 px-3 rounded-lg text-sm font-medium text-left transition-colors ${
                  sandType === key
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold text-xs">{info.label}</div>
              </button>
            ))}
          </div>
          <div className={`p-3 rounded-lg ${isDark ? t('tools.sandCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border mt-2`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {calculations.sandInfo.description}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Uses: {calculations.sandInfo.uses.join(', ')}
            </p>
          </div>
        </div>

        {/* Compaction Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Compaction Factor: {compactionFactor}%
          </label>
          <input
            type="range"
            min="0"
            max="25"
            value={compactionFactor}
            onChange={(e) => setCompactionFactor(e.target.value)}
            className="w-full accent-[#0D9488]"
          />
          <div className={`flex justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>0% (No compaction)</span>
            <span>10% (Standard)</span>
            <span>25% (Heavy)</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sandCalculator.area', 'Area')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{calculations.areaSqFt}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.sandCalculator.sqFt', 'sq ft')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sandCalculator.volume', 'Volume')}</div>
            <div className="text-2xl font-bold text-blue-500">{calculations.adjustedCubicYards}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.sandCalculator.cubicYards', 'cubic yards')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sandCalculator.weight', 'Weight')}</div>
            <div className="text-2xl font-bold text-amber-500">{calculations.totalTons}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>tons</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>50 lb Bags</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{calculations.bags50lb}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.sandCalculator.ifBagged', 'if bagged')}</div>
          </div>
        </div>

        {/* Purchase Recommendation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.sandCalculator.purchaseRecommendation', 'Purchase Recommendation')}
          </h4>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {calculations.bagsRecommended ? (
              <p>For this quantity, <strong>{t('tools.sandCalculator.baggedSand', 'bagged sand')}</strong> is recommended ({calculations.bags50lb} bags of 50 lbs).</p>
            ) : (
              <p>For this quantity, <strong>{t('tools.sandCalculator.bulkDelivery', 'bulk delivery')}</strong> is recommended ({calculations.adjustedCubicYards} cubic yards or {calculations.totalTons} tons).</p>
            )}
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-800' : t('tools.sandCalculator.bg0d948810', 'bg-[#0D9488]/10')}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sandCalculator.estimatedCostBulk', 'Estimated Cost (Bulk)')}</span>
          </div>
          <div className="text-3xl font-bold text-[#0D9488]">
            ${calculations.costLow} - ${calculations.costHigh}
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Based on ${calculations.sandInfo.costPerTon.low}-${calculations.sandInfo.costPerTon.high} per ton for {calculations.sandInfo.label.toLowerCase()}
          </p>
        </div>

        {/* Volume Details */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.sandCalculator.bg0d948810Border0d94882', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sandCalculator.volumeDetails', 'Volume Details')}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.sandCalculator.baseVolume', 'Base Volume:')}</span> {calculations.cubicYards} cu yd
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.sandCalculator.withCompaction', 'With Compaction:')}</span> {calculations.adjustedCubicYards} cu yd
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.sandCalculator.cubicFeet', 'Cubic Feet:')}</span> {calculations.cubicFeet}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.sandCalculator.totalWeight', 'Total Weight:')}</span> {calculations.totalLbs.toLocaleString()} lbs
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.sandCalculator.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- 1 cubic yard of sand weighs approximately 2,700 lbs (1.35 tons)</li>
                <li>- Add 10% extra for compaction when leveling</li>
                <li>- Bulk delivery is more economical for quantities over 1 ton</li>
                <li>- Sand should be dry for accurate weight measurements</li>
                <li>- Consider delivery access - trucks need adequate space</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandCalculatorTool;
