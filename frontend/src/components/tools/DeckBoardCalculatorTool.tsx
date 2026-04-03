import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Grid3X3, Package, DollarSign, Info, Hammer, Settings2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type BoardWidth = '5.5' | '6';
type JoistSpacing = '12' | '16' | '24';

interface BoardLengthOption {
  feet: number;
  label: string;
}

interface DeckBoardCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DeckBoardCalculatorTool: React.FC<DeckBoardCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Deck dimensions
  const [deckLength, setDeckLength] = useState('12');
  const [deckWidth, setDeckWidth] = useState('10');

  // Board settings
  const [boardWidth, setBoardWidth] = useState<BoardWidth>('5.5');
  const [boardLength, setBoardLength] = useState('12');
  const [joistSpacing, setJoistSpacing] = useState<JoistSpacing>('16');

  // Additional settings
  const [wasteFactor, setWasteFactor] = useState('10');
  const [pricePerBoard, setPricePerBoard] = useState('15');
  const [fastenersPerSqFt, setFastenersPerSqFt] = useState('2');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setDeckLength(params.numbers[0].toString());
        setDeckWidth(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setDeckLength(params.length.toString());
        setDeckWidth(params.width.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const boardLengthOptions: BoardLengthOption[] = [
    { feet: 8, label: '8 ft' },
    { feet: 10, label: '10 ft' },
    { feet: 12, label: '12 ft' },
    { feet: 16, label: '16 ft' },
    { feet: 20, label: '20 ft' },
  ];

  const calculations = useMemo(() => {
    const length = parseFloat(deckLength) || 0;
    const width = parseFloat(deckWidth) || 0;
    const bWidth = parseFloat(boardWidth) || 5.5;
    const bLength = parseFloat(boardLength) || 12;
    const waste = parseFloat(wasteFactor) || 10;
    const price = parseFloat(pricePerBoard) || 0;
    const fastenersPerFt = parseFloat(fastenersPerSqFt) || 2;
    const jSpacing = parseFloat(joistSpacing) || 16;

    // Calculate deck area in square feet
    const deckAreaSqFt = length * width;

    // Convert board width from inches to feet
    const boardWidthFt = bWidth / 12;

    // Calculate number of boards needed (width of deck / board width)
    // Boards run perpendicular to joists, typically along the length
    const boardsNeededRaw = width / boardWidthFt;

    // Apply waste factor
    const wasteMultiplier = 1 + (waste / 100);
    const boardsWithWaste = Math.ceil(boardsNeededRaw * wasteMultiplier);

    // Calculate how many board lengths fit across deck length
    // If deck is longer than board, we need multiple boards per row
    const boardsPerRow = Math.ceil(length / bLength);
    const totalBoardsNeeded = boardsWithWaste * boardsPerRow;

    // Calculate linear feet
    const linearFeetRaw = boardsNeededRaw * length;
    const linearFeetWithWaste = linearFeetRaw * wasteMultiplier;

    // Calculate number of joists
    // Joists run perpendicular to deck boards
    const joistCount = Math.ceil((length * 12) / jSpacing) + 1;

    // Calculate fasteners
    // Typically 2 fasteners per board at each joist
    const fastenersPerBoard = joistCount * 2;
    const totalFasteners = Math.ceil(totalBoardsNeeded * fastenersPerBoard);

    // Alternative: fasteners per square foot
    const fastenersBySqFt = Math.ceil(deckAreaSqFt * fastenersPerFt * wasteMultiplier);

    // Cost calculations
    const boardCost = totalBoardsNeeded * price;
    const estimatedFastenerCost = totalFasteners * 0.05; // ~$0.05 per fastener
    const totalCost = boardCost + estimatedFastenerCost;

    // Coverage per board
    const coveragePerBoard = bLength * boardWidthFt;

    return {
      deckAreaSqFt: deckAreaSqFt.toFixed(1),
      boardsNeeded: totalBoardsNeeded,
      boardsPerRow,
      linearFeet: linearFeetWithWaste.toFixed(1),
      linearFeetRaw: linearFeetRaw.toFixed(1),
      joistCount,
      fastenerCount: totalFasteners,
      fastenersBySqFt,
      coveragePerBoard: coveragePerBoard.toFixed(2),
      boardCost: boardCost.toFixed(2),
      fastenerCost: estimatedFastenerCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      wasteBoards: Math.ceil(totalBoardsNeeded - (boardsNeededRaw * boardsPerRow)),
    };
  }, [deckLength, deckWidth, boardWidth, boardLength, joistSpacing, wasteFactor, pricePerBoard, fastenersPerSqFt]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Grid3X3 className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.deckBoardCalculator', 'Deck Board Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.deckBoardCalculator.calculateDeckingMaterialsAndCosts', 'Calculate decking materials and costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Deck Dimensions */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 text-emerald-500" />
            {t('tools.deckBoardCalculator.deckDimensions', 'Deck Dimensions')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.deckBoardCalculator.lengthFeet', 'Length (feet)')}
              </label>
              <input
                type="number"
                value={deckLength}
                onChange={(e) => setDeckLength(e.target.value)}
                placeholder="12"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.deckBoardCalculator.widthFeet', 'Width (feet)')}
              </label>
              <input
                type="number"
                value={deckWidth}
                onChange={(e) => setDeckWidth(e.target.value)}
                placeholder="10"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className={`text-center py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deckBoardCalculator.totalArea', 'Total Area:')}</span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.deckAreaSqFt} sq ft</span>
          </div>
        </div>

        {/* Board Settings */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 text-emerald-500" />
            {t('tools.deckBoardCalculator.boardSettings', 'Board Settings')}
          </h4>

          {/* Board Width Selection */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.deckBoardCalculator.boardWidth', 'Board Width')}
            </label>
            <div className="flex gap-2">
              {(['5.5', '6'] as BoardWidth[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setBoardWidth(w)}
                  className={`flex-1 py-2 px-4 rounded-lg ${boardWidth === w ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {w}"
                </button>
              ))}
            </div>
          </div>

          {/* Board Length Selection */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.deckBoardCalculator.boardLength', 'Board Length')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {boardLengthOptions.map((opt) => (
                <button
                  key={opt.feet}
                  onClick={() => setBoardLength(opt.feet.toString())}
                  className={`py-2 px-4 rounded-lg ${parseInt(boardLength) === opt.feet ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Joist Spacing */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.deckBoardCalculator.joistSpacing', 'Joist Spacing')}
            </label>
            <div className="flex gap-2">
              {(['12', '16', '24'] as JoistSpacing[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setJoistSpacing(s)}
                  className={`flex-1 py-2 px-4 rounded-lg ${joistSpacing === s ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {s}" OC
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Settings2 className="w-4 h-4 text-emerald-500" />
            {t('tools.deckBoardCalculator.additionalSettings', 'Additional Settings')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.deckBoardCalculator.wasteFactor', 'Waste Factor (%)')}
              </label>
              <input
                type="number"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(e.target.value)}
                placeholder="10"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.deckBoardCalculator.pricePerBoard', 'Price per Board ($)')}
              </label>
              <input
                type="number"
                value={pricePerBoard}
                onChange={(e) => setPricePerBoard(e.target.value)}
                placeholder="15"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.boardsNeeded', 'Boards Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{calculations.boardsNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.boardsPerRow} per row + {calculations.wasteBoards} waste
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.linearFeet', 'Linear Feet')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.linearFeet}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.linearFeetRaw} ft before waste
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.joists', 'Joists')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.joistCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              at {joistSpacing}" on center
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Hammer className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.fasteners', 'Fasteners')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.fastenerCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.deckBoardCalculator.screwsNailsNeeded', 'screws/nails needed')}
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.costEstimate', 'Cost Estimate')}</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Deck Boards ({calculations.boardsNeeded} x ${pricePerBoard})</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.boardCost}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.deckBoardCalculator.fastenersEstimated', 'Fasteners (estimated)')}</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.fastenerCost}</span>
            </div>
            <div className={`pt-2 mt-2 border-t ${isDark ? 'border-emerald-800' : 'border-emerald-200'}`}>
              <div className="flex justify-between">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deckBoardCalculator.totalEstimate', 'Total Estimate')}</span>
                <span className="text-xl font-bold text-emerald-500">${calculations.totalCost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Material Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deckBoardCalculator.coveragePerBoard', 'Coverage per board')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.coveragePerBoard} sq ft
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {boardWidth}" x {boardLength}' boards
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.deckBoardCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- 10-15% waste factor is standard for most projects</li>
                <li>- 16" joist spacing is most common for residential decks</li>
                <li>- Consider diagonal patterns may require 15-20% more material</li>
                <li>- Always check local building codes for requirements</li>
                <li>- Prices vary by material: pressure-treated, composite, or hardwood</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBoardCalculatorTool;
