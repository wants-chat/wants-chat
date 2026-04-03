import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Boxes as Brick, Calculator, Info, Package, DollarSign, Ruler, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface BrickCalculatorToolProps {
  uiConfig?: UIConfig;
}

type BrickSize = 'standard' | 'modular' | 'queen' | 'king' | 'utility' | 'closure';
type BondPattern = 'running' | 'stack' | 'flemish' | 'english' | 'herringbone';

interface BrickInfo {
  label: string;
  lengthInches: number;
  heightInches: number;
  depthInches: number;
  bricksPerSqFt: number; // with standard 3/8" mortar joint
}

interface BondInfo {
  label: string;
  wasteFactor: number;
  description: string;
}

const BRICK_SIZES: Record<BrickSize, BrickInfo> = {
  standard: { label: 'Standard', lengthInches: 8, heightInches: 2.25, depthInches: 3.75, bricksPerSqFt: 6.55 },
  modular: { label: 'Modular', lengthInches: 7.625, heightInches: 2.25, depthInches: 3.625, bricksPerSqFt: 6.86 },
  queen: { label: 'Queen', lengthInches: 7.625, heightInches: 2.75, depthInches: 2.75, bricksPerSqFt: 5.76 },
  king: { label: 'King', lengthInches: 9.625, heightInches: 2.625, depthInches: 2.75, bricksPerSqFt: 4.65 },
  utility: { label: 'Utility', lengthInches: 11.625, heightInches: 3.625, depthInches: 3.625, bricksPerSqFt: 3.00 },
  closure: { label: 'Closure', lengthInches: 7.625, heightInches: 3.625, depthInches: 3.625, bricksPerSqFt: 4.50 },
};

const BOND_PATTERNS: Record<BondPattern, BondInfo> = {
  running: { label: 'Running Bond', wasteFactor: 1.05, description: 'Standard offset pattern, most economical' },
  stack: { label: 'Stack Bond', wasteFactor: 1.03, description: 'Bricks aligned vertically, modern look' },
  flemish: { label: 'Flemish Bond', wasteFactor: 1.10, description: 'Alternating headers and stretchers' },
  english: { label: 'English Bond', wasteFactor: 1.10, description: 'Alternating rows of headers and stretchers' },
  herringbone: { label: 'Herringbone', wasteFactor: 1.15, description: 'Zigzag pattern, highest waste' },
};

export const BrickCalculatorTool: React.FC<BrickCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [wallLength, setWallLength] = useState<string>('20');
  const [wallHeight, setWallHeight] = useState<string>('8');
  const [brickSize, setBrickSize] = useState<BrickSize>('modular');
  const [bondPattern, setBondPattern] = useState<BondPattern>('running');
  const [numberOfOpenings, setNumberOfOpenings] = useState<string>('0');
  const [openingArea, setOpeningArea] = useState<string>('0');
  const [mortarJoint, setMortarJoint] = useState<string>('0.375');
  const [extraWaste, setExtraWaste] = useState<string>('5');
  const [brickCost, setBrickCost] = useState<string>('0.75');

  const calculations = useMemo(() => {
    const length = parseFloat(wallLength) || 0;
    const height = parseFloat(wallHeight) || 0;
    const numOpenings = parseInt(numberOfOpenings) || 0;
    const openingAreaSqFt = parseFloat(openingArea) || 0;
    const waste = parseFloat(extraWaste) || 5;
    const costPerBrick = parseFloat(brickCost) || 0.75;

    const brickInfo = BRICK_SIZES[brickSize];
    const bondInfo = BOND_PATTERNS[bondPattern];

    // Calculate gross wall area
    const grossArea = length * height;

    // Calculate net wall area (subtract openings)
    const totalOpeningArea = numOpenings * openingAreaSqFt;
    const netArea = Math.max(0, grossArea - totalOpeningArea);

    // Calculate bricks needed (base quantity)
    const baseBricks = netArea * brickInfo.bricksPerSqFt;

    // Apply bond pattern waste factor
    const bricksWithPattern = baseBricks * bondInfo.wasteFactor;

    // Apply additional waste factor
    const totalBricks = Math.ceil(bricksWithPattern * (1 + waste / 100));

    // Calculate mortar needed
    // Approximately 7 bags of mortar per 1000 bricks for standard joints
    const mortarBags = Math.ceil((totalBricks / 1000) * 7);

    // Calculate sand needed
    // Approximately 1 cubic yard of sand per 1000 bricks
    const sandCubicYards = (totalBricks / 1000).toFixed(2);

    // Calculate wall ties (for veneer walls, about 1 per 2.67 sq ft)
    const wallTies = Math.ceil(netArea / 2.67);

    // Calculate lintel requirements for openings
    const lintels = numOpenings;

    // Cost calculations
    const brickCostTotal = totalBricks * costPerBrick;
    const mortarCostTotal = mortarBags * 8; // ~$8 per bag
    const sandCostTotal = parseFloat(sandCubicYards) * 40; // ~$40 per cubic yard
    const tiesCostTotal = wallTies * 0.25; // ~$0.25 per tie
    const totalMaterialCost = brickCostTotal + mortarCostTotal + sandCostTotal + tiesCostTotal;

    // Weight calculation (standard brick weighs about 4.5 lbs)
    const totalWeight = totalBricks * 4.5;
    const weightTons = totalWeight / 2000;

    return {
      grossArea,
      netArea,
      totalOpeningArea,
      baseBricks: Math.ceil(baseBricks),
      totalBricks,
      mortarBags,
      sandCubicYards,
      wallTies,
      lintels,
      brickCostTotal,
      mortarCostTotal,
      sandCostTotal,
      totalMaterialCost,
      totalWeight: totalWeight.toFixed(0),
      weightTons: weightTons.toFixed(2),
      brickInfo,
      bondInfo,
    };
  }, [wallLength, wallHeight, brickSize, bondPattern, numberOfOpenings, openingArea, extraWaste, brickCost]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Brick className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.brickCalculator.brickCalculator', 'Brick Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.brickCalculator.calculateBrickQuantityAndMaterials', 'Calculate brick quantity and materials')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Wall Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.brickCalculator.wallLengthFeet', 'Wall Length (feet)')}
            </label>
            <input
              type="number"
              value={wallLength}
              onChange={(e) => setWallLength(e.target.value)}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.brickCalculator.wallHeightFeet', 'Wall Height (feet)')}
            </label>
            <input
              type="number"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value)}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Brick Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Brick className="w-4 h-4 inline mr-1" />
            {t('tools.brickCalculator.brickSize2', 'Brick Size')}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(BRICK_SIZES).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setBrickSize(key as BrickSize)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  brickSize === key
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
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {calculations.brickInfo.lengthInches}" x {calculations.brickInfo.heightInches}" x {calculations.brickInfo.depthInches}" - {calculations.brickInfo.bricksPerSqFt.toFixed(2)} bricks/sq ft
          </p>
        </div>

        {/* Bond Pattern Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Layers className="w-4 h-4 inline mr-1" />
            {t('tools.brickCalculator.bondPattern2', 'Bond Pattern')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(BOND_PATTERNS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setBondPattern(key as BondPattern)}
                className={`py-3 px-3 rounded-lg text-sm font-medium text-left transition-colors ${
                  bondPattern === key
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold">{info.label}</div>
                <div className={`text-xs mt-1 ${bondPattern === key ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{((info.wasteFactor - 1) * 100).toFixed(0)}% waste
                </div>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {calculations.bondInfo.description}
          </p>
        </div>

        {/* Openings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.brickCalculator.numberOfOpenings', 'Number of Openings')}
            </label>
            <input
              type="number"
              value={numberOfOpenings}
              onChange={(e) => setNumberOfOpenings(e.target.value)}
              min="0"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.brickCalculator.windowsDoorsEtc', 'Windows, doors, etc.')}
            </p>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.brickCalculator.avgOpeningAreaSqFt', 'Avg. Opening Area (sq ft)')}
            </label>
            <input
              type="number"
              value={openingArea}
              onChange={(e) => setOpeningArea(e.target.value)}
              min="0"
              step="0.5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.brickCalculator.extraWasteFactor', 'Extra Waste Factor (%)')}
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
              {t('tools.brickCalculator.brickCostEach', 'Brick Cost ($/each)')}
            </label>
            <input
              type="number"
              value={brickCost}
              onChange={(e) => setBrickCost(e.target.value)}
              min="0"
              step="0.05"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.brickCalculator.wallArea', 'Wall Area')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{calculations.netArea.toFixed(0)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.brickCalculator.sqFtNet', 'sq ft (net)')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.brickCalculator.bricksNeeded', 'Bricks Needed')}</div>
            <div className="text-2xl font-bold text-blue-500">{calculations.totalBricks.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.brickCalculator.includingWaste', 'including waste')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.brickCalculator.mortarBags', 'Mortar Bags')}</div>
            <div className="text-2xl font-bold text-amber-500">{calculations.mortarBags}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>80 lb bags</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.brickCalculator.sand', 'Sand')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{calculations.sandCubicYards}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.brickCalculator.cubicYards', 'cubic yards')}</div>
          </div>
        </div>

        {/* Additional Materials */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.brickCalculator.additionalMaterials', 'Additional Materials')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.wallTies', 'Wall Ties:')}</span> {calculations.wallTies}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.lintels', 'Lintels:')}</span> {calculations.lintels}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.totalWeight', 'Total Weight:')}</span> {calculations.weightTons} tons
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-800' : t('tools.brickCalculator.bg0d948810', 'bg-[#0D9488]/10')}`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.brickCalculator.materialCostEstimate', 'Material Cost Estimate')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Bricks ({calculations.totalBricks.toLocaleString()})</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.brickCostTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mortar ({calculations.mortarBags} bags)</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.mortarCostTotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Sand ({calculations.sandCubicYards} yd)</div>
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.sandCostTotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.brickCalculator.totalMaterials', 'Total Materials')}</div>
              <div className="text-xl font-bold text-[#0D9488]">
                ${calculations.totalMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {t('tools.brickCalculator.noteLaborCostsTypicallyAdd', 'Note: Labor costs typically add $10-$20 per square foot')}
          </p>
        </div>

        {/* Summary Box */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.brickCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.brickCalculator.projectSummary', 'Project Summary')}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.grossWallArea', 'Gross Wall Area:')}</span> {calculations.grossArea.toFixed(0)} sq ft
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.openingDeduction', 'Opening Deduction:')}</span> {calculations.totalOpeningArea.toFixed(0)} sq ft
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.brickSize', 'Brick Size:')}</span> {calculations.brickInfo.label}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('tools.brickCalculator.bondPattern', 'Bond Pattern:')}</span> {calculations.bondInfo.label}
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.brickCalculator.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Order 5-10% extra bricks to account for breakage and future repairs</li>
                <li>- Mix bricks from multiple pallets for consistent color distribution</li>
                <li>- Store bricks covered and off the ground to prevent staining</li>
                <li>- Consider weather conditions - don't lay brick below 40°F</li>
                <li>- Veneer walls require wall ties every 2.67 sq ft minimum</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrickCalculatorTool;
