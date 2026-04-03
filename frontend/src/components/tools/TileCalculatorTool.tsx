import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3X3, Ruler, Package, Droplets, Percent, Info, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type TilePattern = 'straight' | 'diagonal' | 'herringbone';
type TileSize = 'custom' | '12x12' | '18x18' | '24x24' | '12x24' | '6x24';

interface TileSizeConfig {
  name: string;
  width: number; // in inches
  height: number; // in inches
}

interface PatternConfig {
  name: string;
  wasteFactor: number; // additional waste percentage for pattern
  description: string;
}

interface TileCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const TileCalculatorTool: React.FC<TileCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Room dimensions
  const [roomLength, setRoomLength] = useState('12');
  const [roomWidth, setRoomWidth] = useState('10');
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');

  // Tile settings
  const [tileSize, setTileSize] = useState<TileSize>('12x12');
  const [customTileWidth, setCustomTileWidth] = useState('12');
  const [customTileHeight, setCustomTileHeight] = useState('12');
  const [tilesPerBox, setTilesPerBox] = useState('10');

  // Pattern and spacing
  const [pattern, setPattern] = useState<TilePattern>('straight');
  const [groutSpacing, setGroutSpacing] = useState('0.125'); // in inches
  const [wastePercentage, setWastePercentage] = useState('10');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setRoomLength(params.numbers[0].toString());
        setRoomWidth(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setRoomLength(params.length.toString());
        setRoomWidth(params.width.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const tileSizes: Record<TileSize, TileSizeConfig> = {
    'custom': { name: 'Custom Size', width: 0, height: 0 },
    '12x12': { name: '12" x 12"', width: 12, height: 12 },
    '18x18': { name: '18" x 18"', width: 18, height: 18 },
    '24x24': { name: '24" x 24"', width: 24, height: 24 },
    '12x24': { name: '12" x 24"', width: 12, height: 24 },
    '6x24': { name: '6" x 24" (Plank)', width: 6, height: 24 },
  };

  const patterns: Record<TilePattern, PatternConfig> = {
    straight: {
      name: 'Straight Lay',
      wasteFactor: 0,
      description: 'Classic grid pattern, minimal waste',
    },
    diagonal: {
      name: 'Diagonal',
      wasteFactor: 15,
      description: '45° angle layout, more cuts needed',
    },
    herringbone: {
      name: 'Herringbone',
      wasteFactor: 20,
      description: 'Elegant zigzag pattern, most cuts',
    },
  };

  const calculations = useMemo(() => {
    // Get room dimensions in inches
    const lengthFt = parseFloat(roomLength) || 0;
    const widthFt = parseFloat(roomWidth) || 0;
    const conversionFactor = unit === 'meters' ? 39.37 : 12; // convert to inches
    const roomLengthIn = lengthFt * conversionFactor;
    const roomWidthIn = widthFt * conversionFactor;

    // Calculate room area in square feet
    const roomAreaSqFt = (roomLengthIn * roomWidthIn) / 144;
    const roomAreaSqM = roomAreaSqFt * 0.0929;

    // Get tile dimensions
    let tileWidthIn = parseFloat(customTileWidth) || 12;
    let tileHeightIn = parseFloat(customTileHeight) || 12;
    if (tileSize !== 'custom') {
      tileWidthIn = tileSizes[tileSize].width;
      tileHeightIn = tileSizes[tileSize].height;
    }

    // Add grout spacing to tile dimensions
    const groutIn = parseFloat(groutSpacing) || 0;
    const effectiveTileWidth = tileWidthIn + groutIn;
    const effectiveTileHeight = tileHeightIn + groutIn;

    // Calculate single tile area in square feet
    const tileAreaSqFt = (tileWidthIn * tileHeightIn) / 144;

    // Calculate base number of tiles needed
    const tilesNeededBase = roomAreaSqFt / tileAreaSqFt;

    // Apply waste factors
    const baseWaste = parseFloat(wastePercentage) || 10;
    const patternWaste = patterns[pattern].wasteFactor;
    const totalWastePercent = baseWaste + patternWaste;
    const wasteMultiplier = 1 + (totalWastePercent / 100);
    const tilesNeeded = Math.ceil(tilesNeededBase * wasteMultiplier);

    // Calculate boxes needed
    const tilesPerBoxNum = parseInt(tilesPerBox) || 10;
    const boxesNeeded = Math.ceil(tilesNeeded / tilesPerBoxNum);

    // Estimate grout needed (lbs) - rough estimate based on tile size and area
    // Smaller tiles = more grout lines = more grout needed
    const groutCoverage = (effectiveTileWidth + effectiveTileHeight) / 2; // average tile dimension
    const groutFactor = 25 / groutCoverage; // base factor adjusted by tile size
    const groutLbs = Math.ceil(roomAreaSqFt * groutFactor * (groutIn / 0.125));

    // Estimate adhesive/thinset needed (lbs)
    // Approximately 3-4 lbs per sq ft for standard application
    const adhesiveLbs = Math.ceil(roomAreaSqFt * 3.5);

    // Calculate linear feet of grout lines (for caulk/sealant)
    const tilesAcross = roomWidthIn / effectiveTileWidth;
    const tilesDown = roomLengthIn / effectiveTileHeight;
    const groutLinearFt = ((tilesAcross * roomLengthIn) + (tilesDown * roomWidthIn)) / 12;

    return {
      roomAreaSqFt: roomAreaSqFt.toFixed(1),
      roomAreaSqM: roomAreaSqM.toFixed(2),
      tileAreaSqFt: tileAreaSqFt.toFixed(3),
      tilesNeededBase: Math.ceil(tilesNeededBase),
      totalWastePercent: totalWastePercent.toFixed(0),
      tilesNeeded,
      extraTiles: tilesNeeded - Math.ceil(tilesNeededBase),
      boxesNeeded,
      tilesInBoxes: boxesNeeded * tilesPerBoxNum,
      groutLbs: Math.max(groutLbs, 5),
      adhesiveLbs,
      groutLinearFt: groutLinearFt.toFixed(0),
    };
  }, [roomLength, roomWidth, unit, tileSize, customTileWidth, customTileHeight,
      groutSpacing, wastePercentage, pattern, tilesPerBox]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Grid3X3 className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tileCalculator.tileCalculator', 'Tile Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tileCalculator.calculateTilesMaterialsCostsFor', 'Calculate tiles, materials & costs for your project')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Room Dimensions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.tileCalculator.roomDimensions', 'Room Dimensions')}
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setUnit('feet')}
                className={`px-3 py-1 rounded text-xs ${unit === 'feet' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.tileCalculator.feet', 'Feet')}
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-3 py-1 rounded text-xs ${unit === 'meters' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.tileCalculator.meters', 'Meters')}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{t('tools.tileCalculator.length', 'Length')}</label>
              <input
                type="number"
                value={roomLength}
                onChange={(e) => setRoomLength(e.target.value)}
                placeholder="12"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{t('tools.tileCalculator.width', 'Width')}</label>
              <input
                type="number"
                value={roomWidth}
                onChange={(e) => setRoomWidth(e.target.value)}
                placeholder="10"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Tile Size Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.tileCalculator.tileSize', 'Tile Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(tileSizes) as TileSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setTileSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${tileSize === size ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {tileSizes[size].name}
              </button>
            ))}
          </div>

          {tileSize === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{t('tools.tileCalculator.widthInches', 'Width (inches)')}</label>
                <input
                  type="number"
                  value={customTileWidth}
                  onChange={(e) => setCustomTileWidth(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{t('tools.tileCalculator.heightInches', 'Height (inches)')}</label>
                <input
                  type="number"
                  value={customTileHeight}
                  onChange={(e) => setCustomTileHeight(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pattern Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.tileCalculator.tilePattern', 'Tile Pattern')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(patterns) as TilePattern[]).map((p) => (
              <button
                key={p}
                onClick={() => setPattern(p)}
                className={`py-2 px-3 rounded-lg text-sm ${pattern === p ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {patterns[p].name}
              </button>
            ))}
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{patterns[pattern].description}</span>
              <span className="text-teal-500 text-sm font-medium">+{patterns[pattern].wasteFactor}% waste</span>
            </div>
          </div>
        </div>

        {/* Grout Spacing & Waste */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Droplets className="w-4 h-4 inline mr-1" />
              {t('tools.tileCalculator.groutSpacingInches', 'Grout Spacing (inches)')}
            </label>
            <select
              value={groutSpacing}
              onChange={(e) => setGroutSpacing(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="0.0625">1/16" (1.5mm)</option>
              <option value="0.125">1/8" (3mm)</option>
              <option value="0.1875">3/16" (5mm)</option>
              <option value="0.25">1/4" (6mm)</option>
              <option value="0.375">3/8" (10mm)</option>
              <option value="0.5">1/2" (12mm)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.tileCalculator.extraWaste', 'Extra Waste %')}
            </label>
            <div className="flex gap-2">
              {['5', '10', '15', '20'].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setWastePercentage(pct)}
                  className={`flex-1 py-2 rounded-lg text-sm ${wastePercentage === pct ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tiles Per Box */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.tileCalculator.tilesPerBox', 'Tiles Per Box')}
          </label>
          <input
            type="number"
            value={tilesPerBox}
            onChange={(e) => setTilesPerBox(e.target.value)}
            placeholder="10"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Results */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-teal-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tileCalculator.roomArea', 'Room Area')}</span>
          </div>
          <div className="text-3xl font-bold text-teal-500">{calculations.roomAreaSqFt} sq ft</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculations.roomAreaSqM} sq meters
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-teal-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tileCalculator.tilesNeeded', 'Tiles Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-teal-500">{calculations.tilesNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.tilesNeededBase} base + {calculations.extraTiles} extra ({calculations.totalWastePercent}% waste)
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tileCalculator.boxesNeeded', 'Boxes Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.boxesNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.tilesInBoxes} tiles total in boxes
            </div>
          </div>
        </div>

        {/* Material Estimates */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tileCalculator.materialEstimates', 'Material Estimates')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.tileCalculator.grout', 'Grout')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>~{calculations.groutLbs} lbs</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.tileCalculator.sandedGroutRecommendedForJoints', 'Sanded grout recommended for joints over 1/8"')}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.tileCalculator.adhesiveThinset', 'Adhesive/Thinset')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>~{calculations.adhesiveLbs} lbs</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.tileCalculator.basedOnStandard14', 'Based on standard 1/4" x 1/4" trowel')}
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.tileCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>* Always buy 10-15% extra tiles for cuts and future repairs</li>
                <li>* Diagonal and herringbone patterns require more cuts at edges</li>
                <li>* Larger tiles may need back-buttering for proper adhesion</li>
                <li>* Allow grout and thinset to cure before heavy use (24-72 hours)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TileCalculatorTool;
