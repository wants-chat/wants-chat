import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3X3, Calculator, Info, Package, DollarSign, Ruler, Circle, Square, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface PaverCalculatorToolProps {
  uiConfig?: UIConfig;
}

type AreaShape = 'rectangle' | 'circle' | 'irregular';
type PaverSize = '4x8' | '6x6' | '6x9' | '8x8' | '12x12' | '16x16' | '24x24' | 'custom';
type PatternType = 'running-bond' | 'herringbone' | 'basket-weave' | 'stack-bond' | 'random';

interface PaverInfo {
  label: string;
  lengthInches: number;
  widthInches: number;
  sqFtEach: number;
}

interface PatternInfo {
  label: string;
  wasteFactor: number;
  description: string;
}

const PAVER_SIZES: Record<PaverSize, PaverInfo> = {
  '4x8': { label: '4" x 8" (Brick)', lengthInches: 8, widthInches: 4, sqFtEach: 0.222 },
  '6x6': { label: '6" x 6"', lengthInches: 6, widthInches: 6, sqFtEach: 0.25 },
  '6x9': { label: '6" x 9"', lengthInches: 9, widthInches: 6, sqFtEach: 0.375 },
  '8x8': { label: '8" x 8"', lengthInches: 8, widthInches: 8, sqFtEach: 0.444 },
  '12x12': { label: '12" x 12"', lengthInches: 12, widthInches: 12, sqFtEach: 1.0 },
  '16x16': { label: '16" x 16"', lengthInches: 16, widthInches: 16, sqFtEach: 1.778 },
  '24x24': { label: '24" x 24"', lengthInches: 24, widthInches: 24, sqFtEach: 4.0 },
  'custom': { label: 'Custom Size', lengthInches: 0, widthInches: 0, sqFtEach: 0 },
};

const PATTERNS: Record<PatternType, PatternInfo> = {
  'running-bond': { label: 'Running Bond', wasteFactor: 1.05, description: 'Offset pattern, versatile and classic' },
  'herringbone': { label: 'Herringbone (45°)', wasteFactor: 1.15, description: 'Interlocking V-pattern, best for driveways' },
  'basket-weave': { label: 'Basket Weave', wasteFactor: 1.10, description: 'Pairs alternating directions' },
  'stack-bond': { label: 'Stack Bond', wasteFactor: 1.03, description: 'Aligned grid, modern look' },
  'random': { label: 'Random/Modular', wasteFactor: 1.12, description: 'Mixed sizes, natural look' },
};

export const PaverCalculatorTool: React.FC<PaverCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [shape, setShape] = useState<AreaShape>('rectangle');
  const [length, setLength] = useState<string>('20');
  const [width, setWidth] = useState<string>('15');
  const [diameter, setDiameter] = useState<string>('15');
  const [irregularSqFt, setIrregularSqFt] = useState<string>('300');
  const [paverSize, setPaverSize] = useState<PaverSize>('4x8');
  const [customLength, setCustomLength] = useState<string>('12');
  const [customWidth, setCustomWidth] = useState<string>('12');
  const [pattern, setPattern] = useState<PatternType>('running-bond');
  const [extraWaste, setExtraWaste] = useState<string>('5');
  const [paverCost, setPaverCost] = useState<string>('0.50');
  const [baseDepth, setBaseDepth] = useState<string>('4');
  const [sandDepth, setSandDepth] = useState<string>('1');

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
      case 'irregular':
        areaSqFt = parseFloat(irregularSqFt) || 0;
        break;
    }

    // Get paver info
    let paverInfo: PaverInfo;
    if (paverSize === 'custom') {
      const cLength = parseFloat(customLength) || 12;
      const cWidth = parseFloat(customWidth) || 12;
      paverInfo = {
        label: `${cLength}" x ${cWidth}" (Custom)`,
        lengthInches: cLength,
        widthInches: cWidth,
        sqFtEach: (cLength * cWidth) / 144,
      };
    } else {
      paverInfo = PAVER_SIZES[paverSize];
    }

    const patternInfo = PATTERNS[pattern];
    const waste = parseFloat(extraWaste) || 5;
    const costPerPaver = parseFloat(paverCost) || 0.50;

    // Calculate base pavers needed
    const basePavers = areaSqFt / paverInfo.sqFtEach;

    // Apply pattern waste
    const paversWithPattern = basePavers * patternInfo.wasteFactor;

    // Apply additional waste
    const totalPavers = Math.ceil(paversWithPattern * (1 + waste / 100));

    // Calculate base materials
    const baseDepthFt = (parseFloat(baseDepth) || 4) / 12;
    const baseCubicYards = (areaSqFt * baseDepthFt) / 27;

    // Calculate sand bedding
    const sandDepthFt = (parseFloat(sandDepth) || 1) / 12;
    const sandCubicYards = (areaSqFt * sandDepthFt) / 27;

    // Edge restraints (perimeter)
    let perimeter = 0;
    switch (shape) {
      case 'rectangle':
        perimeter = 2 * ((parseFloat(length) || 0) + (parseFloat(width) || 0));
        break;
      case 'circle':
        perimeter = Math.PI * (parseFloat(diameter) || 0);
        break;
      case 'irregular':
        // Estimate perimeter as square root of area * 4
        perimeter = Math.sqrt(areaSqFt) * 4;
        break;
    }
    const edgeRestraintFeet = Math.ceil(perimeter);

    // Polymeric sand for joints (typically 50 lb bag covers 50-75 sq ft)
    const polymericSandBags = Math.ceil(areaSqFt / 50);

    // Geotextile fabric
    const fabricSqYd = Math.ceil(areaSqFt / 9);

    // Cost calculations
    const paverCostTotal = totalPavers * costPerPaver;
    const baseCost = baseCubicYards * 35; // ~$35 per cubic yard
    const sandCost = sandCubicYards * 40; // ~$40 per cubic yard
    const polymericCost = polymericSandBags * 25; // ~$25 per bag
    const edgeCost = edgeRestraintFeet * 2; // ~$2 per linear foot
    const fabricCost = fabricSqYd * 0.50; // ~$0.50 per sq yd
    const totalMaterialCost = paverCostTotal + baseCost + sandCost + polymericCost + edgeCost + fabricCost;

    // Pavers per square foot (for reference)
    const paversPerSqFt = 1 / paverInfo.sqFtEach;

    return {
      areaSqFt: areaSqFt.toFixed(2),
      perimeter: perimeter.toFixed(2),
      basePavers: Math.ceil(basePavers),
      totalPavers,
      paversPerSqFt: paversPerSqFt.toFixed(1),
      baseCubicYards: baseCubicYards.toFixed(2),
      sandCubicYards: sandCubicYards.toFixed(2),
      edgeRestraintFeet,
      polymericSandBags,
      fabricSqYd,
      paverCostTotal,
      baseCost,
      sandCost,
      polymericCost,
      edgeCost,
      totalMaterialCost,
      paverInfo,
      patternInfo,
    };
  }, [shape, length, width, diameter, irregularSqFt, paverSize, customLength, customWidth, pattern, extraWaste, paverCost, baseDepth, sandDepth]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Grid3X3 className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paverCalculator.paverCalculator', 'Paver Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.paverCalculator.calculatePaverQuantityAndBase', 'Calculate paver quantity and base materials')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Area Shape Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.paverCalculator.areaShape', 'Area Shape')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['rectangle', 'circle', 'irregular'] as AreaShape[]).map((s) => {
              const Icon = s === 'rectangle' ? Square : s === 'circle' ? Circle : Grid3X3;
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
                {t('tools.paverCalculator.lengthFeet', 'Length (feet)')}
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
                {t('tools.paverCalculator.widthFeet', 'Width (feet)')}
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
              {t('tools.paverCalculator.diameterFeet', 'Diameter (feet)')}
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

        {shape === 'irregular' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calculator className="w-4 h-4 inline mr-1" />
              {t('tools.paverCalculator.totalSquareFootage', 'Total Square Footage')}
            </label>
            <input
              type="number"
              value={irregularSqFt}
              onChange={(e) => setIrregularSqFt(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        )}

        {/* Paver Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Grid3X3 className="w-4 h-4 inline mr-1" />
            {t('tools.paverCalculator.paverSize2', 'Paver Size')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(PAVER_SIZES).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setPaverSize(key as PaverSize)}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                  paverSize === key
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {info.label.split(' ')[0]}
              </button>
            ))}
          </div>
          {paverSize === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.paverCalculator.lengthInches', 'Length (inches)')}
                </label>
                <input
                  type="number"
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.paverCalculator.widthInches', 'Width (inches)')}
                </label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pattern Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Layers className="w-4 h-4 inline mr-1" />
            {t('tools.paverCalculator.layingPattern', 'Laying Pattern')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(PATTERNS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setPattern(key as PatternType)}
                className={`py-3 px-3 rounded-lg text-sm font-medium text-left transition-colors ${
                  pattern === key
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold text-xs">{info.label}</div>
                <div className={`text-xs mt-1 ${pattern === key ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{((info.wasteFactor - 1) * 100).toFixed(0)}% waste
                </div>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {calculations.patternInfo.description}
          </p>
        </div>

        {/* Base & Sand Depth */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paverCalculator.baseDepthInches', 'Base Depth (inches)')}
            </label>
            <input
              type="number"
              value={baseDepth}
              onChange={(e) => setBaseDepth(e.target.value)}
              min="2"
              max="12"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>4-6" typical</p>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paverCalculator.sandBeddingInches', 'Sand Bedding (inches)')}
            </label>
            <input
              type="number"
              value={sandDepth}
              onChange={(e) => setSandDepth(e.target.value)}
              min="0.5"
              max="2"
              step="0.25"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>1" typical</p>
          </div>
        </div>

        {/* Extra Waste & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paverCalculator.extraWaste', 'Extra Waste (%)')}
            </label>
            <input
              type="number"
              value={extraWaste}
              onChange={(e) => setExtraWaste(e.target.value)}
              min="0"
              max="25"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paverCalculator.paverCostEach', 'Paver Cost ($/each)')}
            </label>
            <input
              type="number"
              value={paverCost}
              onChange={(e) => setPaverCost(e.target.value)}
              min="0"
              step="0.10"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paverCalculator.area', 'Area')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{calculations.areaSqFt}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.paverCalculator.sqFt', 'sq ft')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paverCalculator.paversNeeded', 'Pavers Needed')}</div>
            <div className="text-2xl font-bold text-blue-500">{calculations.totalPavers.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.paverCalculator.includingWaste', 'including waste')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paverCalculator.baseMaterial', 'Base Material')}</div>
            <div className="text-2xl font-bold text-amber-500">{calculations.baseCubicYards}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.paverCalculator.cubicYards', 'cubic yards')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paverCalculator.beddingSand', 'Bedding Sand')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{calculations.sandCubicYards}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.paverCalculator.cubicYards2', 'cubic yards')}</div>
          </div>
        </div>

        {/* Additional Materials */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.paverCalculator.additionalMaterials', 'Additional Materials')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.edgeRestraint', 'Edge Restraint:')}</span> {calculations.edgeRestraintFeet} ft
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.polymericSand', 'Polymeric Sand:')}</span> {calculations.polymericSandBags} bags
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.geotextileFabric', 'Geotextile Fabric:')}</span> {calculations.fabricSqYd} sq yd
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-800' : t('tools.paverCalculator.bg0d948810', 'bg-[#0D9488]/10')}`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paverCalculator.materialCostEstimate', 'Material Cost Estimate')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.paverCalculator.pavers', 'Pavers')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.paverCostTotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.paverCalculator.baseMaterial2', 'Base Material')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.baseCost.toFixed(2)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.paverCalculator.sand', 'Sand')}</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.sandCost.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-600">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.paverCalculator.totalMaterials', 'Total Materials')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">
              ${calculations.totalMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {t('tools.paverCalculator.noteLaborTypicallyAdds8', 'Note: Labor typically adds $8-$15 per sq ft for professional installation')}
          </p>
        </div>

        {/* Summary */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.paverCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paverCalculator.projectSummary', 'Project Summary')}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.paverSize', 'Paver Size:')}</span> {calculations.paverInfo.label}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.paversSqFt', 'Pavers/sq ft:')}</span> {calculations.paversPerSqFt}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.pattern', 'Pattern:')}</span> {calculations.patternInfo.label}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.paverCalculator.perimeter', 'Perimeter:')}</span> {calculations.perimeter} ft
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.paverCalculator.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Use herringbone pattern for driveways (highest interlock)</li>
                <li>- Compact base in 2" lifts for proper density</li>
                <li>- Install edge restraints before laying pavers</li>
                <li>- Run strings to maintain straight lines</li>
                <li>- Wet polymeric sand with a fine mist, not a heavy spray</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaverCalculatorTool;
