import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Layers, Box, Info, ArrowUpDown, Grid3X3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type BlockSize = 'small' | 'medium' | 'large' | 'xlarge';

interface BlockConfig {
  name: string;
  length: number; // inches
  height: number; // inches
  depth: number; // inches
  weight: number; // lbs per block
  description: string;
}

interface RetainingWallCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const RetainingWallCalculatorTool: React.FC<RetainingWallCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [blockSize, setBlockSize] = useState<BlockSize>('medium');
  const [wallLength, setWallLength] = useState('20');
  const [wallHeight, setWallHeight] = useState('3');
  const [includeGeogrid, setIncludeGeogrid] = useState(true);
  const [gravelDepth, setGravelDepth] = useState('6');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setWallLength(params.numbers[0].toString());
        setWallHeight(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.length && params.height) {
        setWallLength(params.length.toString());
        setWallHeight(params.height.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const blockSizes: Record<BlockSize, BlockConfig> = {
    small: {
      name: 'Small Block',
      length: 8,
      height: 4,
      depth: 6,
      weight: 25,
      description: 'Garden edges, small borders',
    },
    medium: {
      name: 'Medium Block',
      length: 12,
      height: 4,
      depth: 8,
      weight: 35,
      description: 'Standard retaining walls up to 3ft',
    },
    large: {
      name: 'Large Block',
      length: 16,
      height: 6,
      depth: 12,
      weight: 60,
      description: 'Structural walls up to 4ft',
    },
    xlarge: {
      name: 'Extra Large',
      length: 18,
      height: 8,
      depth: 14,
      weight: 85,
      description: 'Heavy-duty structural walls',
    },
  };

  const config = blockSizes[blockSize];

  const calculations = useMemo(() => {
    const length = parseFloat(wallLength) || 0; // feet
    const height = parseFloat(wallHeight) || 0; // feet
    const gravel = parseFloat(gravelDepth) || 6; // inches

    // Convert wall dimensions to inches for calculation
    const wallLengthInches = length * 12;
    const wallHeightInches = height * 12;

    // Calculate blocks per row
    const blocksPerRow = Math.ceil(wallLengthInches / config.length);

    // Calculate number of rows
    const numberOfRows = Math.ceil(wallHeightInches / config.height);

    // Total blocks (accounting for staggered pattern - add extra for cuts)
    const totalBlocks = Math.ceil(blocksPerRow * numberOfRows * 1.1); // 10% extra for cuts

    // Cap blocks (for top row)
    const capBlocks = blocksPerRow;

    // Total weight
    const totalWeight = totalBlocks * config.weight;

    // Gravel backfill calculation (cubic yards)
    // Gravel behind wall: wall length x wall height x gravel depth
    const gravelVolumeCuFt = (length * height * (gravel / 12)) +
                            (length * (config.depth / 12) * 0.5); // base gravel
    const gravelCubicYards = gravelVolumeCuFt / 27;

    // Drainage pipe (linear feet - same as wall length + extra)
    const drainagePipe = Math.ceil(length * 1.1);

    // Geogrid requirements (for walls over 2 feet)
    const needsGeogrid = height > 2;
    const geogridLayers = needsGeogrid ? Math.floor(height) : 0;
    // Geogrid extends 3-4 feet behind wall per foot of height
    const geogridLength = length;
    const geogridWidth = height * 3; // 3 feet per foot of wall height
    const geogridSqFt = geogridLayers * geogridLength * geogridWidth;

    // Base material (crushed stone for leveling pad)
    const baseMaterialCuFt = length * (config.depth / 12 + 0.5) * 0.5;
    const baseMaterialCuYd = baseMaterialCuFt / 27;

    // Filter fabric (landscape fabric)
    const filterFabricSqFt = length * (height + 2); // extra 2 feet overlap

    return {
      blocksPerRow,
      numberOfRows,
      totalBlocks,
      capBlocks,
      totalWeight: Math.round(totalWeight),
      gravelCubicYards: gravelCubicYards.toFixed(2),
      drainagePipe,
      needsGeogrid,
      geogridLayers,
      geogridSqFt: Math.round(geogridSqFt),
      baseMaterialCuYd: baseMaterialCuYd.toFixed(2),
      filterFabricSqFt: Math.round(filterFabricSqFt),
      wallArea: (length * height).toFixed(1),
    };
  }, [wallLength, wallHeight, gravelDepth, config, includeGeogrid]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-stone-900/20' : 'bg-gradient-to-r from-white to-stone-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-500/10 rounded-lg"><Layers className="w-5 h-5 text-stone-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.retainingWallCalculator.retainingWallCalculator', 'Retaining Wall Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.retainingWallCalculator.calculateBlocksGravelAndMaterials', 'Calculate blocks, gravel, and materials needed')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Block Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.retainingWallCalculator.blockSize', 'Block Size')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(blockSizes) as BlockSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setBlockSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${blockSize === size ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {blockSizes[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Block Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-stone-900/20 border-stone-800' : 'bg-stone-50 border-stone-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-stone-500 font-bold">{config.weight} lbs</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">L:</span> {config.length}"
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">H:</span> {config.height}"
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">D:</span> {config.depth}"
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Wall Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.retainingWallCalculator.wallLengthFeet', 'Wall Length (feet)')}
            </label>
            <input
              type="number"
              value={wallLength}
              onChange={(e) => setWallLength(e.target.value)}
              min="1"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <ArrowUpDown className="w-4 h-4 inline mr-1" />
              {t('tools.retainingWallCalculator.wallHeightFeet', 'Wall Height (feet)')}
            </label>
            <input
              type="number"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value)}
              min="1"
              max="10"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Quick Height Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.retainingWallCalculator.quickHeightSelect', 'Quick Height Select')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <button
                key={h}
                onClick={() => setWallHeight(h.toString())}
                className={`flex-1 py-2 rounded-lg ${parseFloat(wallHeight) === h ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {h}ft
              </button>
            ))}
          </div>
        </div>

        {/* Gravel Depth */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.retainingWallCalculator.gravelBackfillDepthInches', 'Gravel Backfill Depth (inches)')}
          </label>
          <div className="flex gap-2">
            {[4, 6, 8, 12].map((d) => (
              <button
                key={d}
                onClick={() => setGravelDepth(d.toString())}
                className={`flex-1 py-2 rounded-lg ${parseFloat(gravelDepth) === d ? 'bg-stone-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {d}"
              </button>
            ))}
          </div>
        </div>

        {/* Geogrid Toggle */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.retainingWallCalculator.includeGeogrid', 'Include Geogrid')}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.retainingWallCalculator.recommendedForWallsOver2', 'Recommended for walls over 2 feet')}
            </div>
          </div>
          <button
            onClick={() => setIncludeGeogrid(!includeGeogrid)}
            className={`relative w-12 h-6 rounded-full transition-colors ${includeGeogrid ? 'bg-stone-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${includeGeogrid ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Primary Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Box className="w-4 h-4 text-stone-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.retainingWallCalculator.wallBlocks', 'Wall Blocks')}</span>
            </div>
            <div className="text-3xl font-bold text-stone-500">{calculations.totalBlocks}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.blocksPerRow} per row x {calculations.numberOfRows} rows
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-amber-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.retainingWallCalculator.capBlocks', 'Cap Blocks')}</span>
            </div>
            <div className="text-3xl font-bold text-amber-500">{calculations.capBlocks}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.retainingWallCalculator.forTopFinishingRow', 'For top finishing row')}
            </div>
          </div>
        </div>

        {/* Secondary Results */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.retainingWallCalculator.materialsSummary', 'Materials Summary')}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.retainingWallCalculator.wallArea', 'Wall Area:')}</span>
              <span className="font-medium">{calculations.wallArea} sq ft</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.retainingWallCalculator.totalWeight', 'Total Weight:')}</span>
              <span className="font-medium">{calculations.totalWeight.toLocaleString()} lbs</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.retainingWallCalculator.gravelBackfill', 'Gravel Backfill:')}</span>
              <span className="font-medium">{calculations.gravelCubicYards} cu yd</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.retainingWallCalculator.drainagePipe', 'Drainage Pipe:')}</span>
              <span className="font-medium">{calculations.drainagePipe} ft</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.retainingWallCalculator.baseMaterial', 'Base Material:')}</span>
              <span className="font-medium">{calculations.baseMaterialCuYd} cu yd</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.retainingWallCalculator.filterFabric', 'Filter Fabric:')}</span>
              <span className="font-medium">{calculations.filterFabricSqFt} sq ft</span>
            </div>
          </div>
        </div>

        {/* Geogrid Requirements */}
        {includeGeogrid && calculations.needsGeogrid && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.retainingWallCalculator.geogridRequirements', 'Geogrid Requirements')}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">{t('tools.retainingWallCalculator.layersNeeded', 'Layers needed:')}</span> {calculations.geogridLayers}
              </div>
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">{t('tools.retainingWallCalculator.totalArea', 'Total area:')}</span> {calculations.geogridSqFt} sq ft
              </div>
            </div>
          </div>
        )}

        {/* Height Warning */}
        {parseFloat(wallHeight) > 4 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <div className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              {t('tools.retainingWallCalculator.engineeringRequired', 'Engineering Required')}
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
              Walls over 4 feet typically require engineering approval and may need permits.
              Consult a licensed engineer before construction.
            </p>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.retainingWallCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Order 10% extra blocks for cuts and breakage</li>
                <li>• Compact gravel in 4" lifts for proper drainage</li>
                <li>• Install drainage pipe at the base behind the wall</li>
                <li>• Check local building codes for permit requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetainingWallCalculatorTool;
