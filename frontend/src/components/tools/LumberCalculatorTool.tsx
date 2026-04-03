import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TreeDeciduous, Ruler, Package, DollarSign, Info, Calculator, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type LumberSize = '2x4' | '2x6' | '2x8' | '2x10' | '2x12' | '4x4' | '1x4' | '1x6' | '1x8' | '1x12' | 'custom';
type LumberGrade = 'construction' | 'standard' | 'premium' | 'select';
type WoodType = 'pine' | 'cedar' | 'douglas_fir' | 'redwood' | 'pressure_treated';

interface LumberSizeConfig {
  name: string;
  nominalWidth: number;
  nominalThickness: number;
  actualWidth: number;
  actualThickness: number;
}

interface WoodTypeConfig {
  name: string;
  priceMultiplier: number;
  description: string;
}

interface LumberCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const LumberCalculatorTool: React.FC<LumberCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Lumber settings
  const [lumberSize, setLumberSize] = useState<LumberSize>('2x4');
  const [woodType, setWoodType] = useState<WoodType>('pine');
  const [lumberGrade, setLumberGrade] = useState<LumberGrade>('construction');

  // Custom dimensions (for custom size)
  const [customThickness, setCustomThickness] = useState('2');
  const [customWidth, setCustomWidth] = useState('4');

  // Board dimensions
  const [boardLength, setBoardLength] = useState('8');
  const [numberOfBoards, setNumberOfBoards] = useState('10');

  // Pricing
  const [pricePerLinearFoot, setPricePerLinearFoot] = useState('');
  const [pricePerBoardFoot, setPricePerBoardFoot] = useState('');
  const [wasteFactor, setWasteFactor] = useState('10');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 1) {
        setBoardLength(params.numbers[0].toString());
        if (params.numbers[1]) {
          setNumberOfBoards(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const lumberSizes: Record<LumberSize, LumberSizeConfig> = {
    '2x4': { name: '2x4', nominalWidth: 4, nominalThickness: 2, actualWidth: 3.5, actualThickness: 1.5 },
    '2x6': { name: '2x6', nominalWidth: 6, nominalThickness: 2, actualWidth: 5.5, actualThickness: 1.5 },
    '2x8': { name: '2x8', nominalWidth: 8, nominalThickness: 2, actualWidth: 7.25, actualThickness: 1.5 },
    '2x10': { name: '2x10', nominalWidth: 10, nominalThickness: 2, actualWidth: 9.25, actualThickness: 1.5 },
    '2x12': { name: '2x12', nominalWidth: 12, nominalThickness: 2, actualWidth: 11.25, actualThickness: 1.5 },
    '4x4': { name: '4x4', nominalWidth: 4, nominalThickness: 4, actualWidth: 3.5, actualThickness: 3.5 },
    '1x4': { name: '1x4', nominalWidth: 4, nominalThickness: 1, actualWidth: 3.5, actualThickness: 0.75 },
    '1x6': { name: '1x6', nominalWidth: 6, nominalThickness: 1, actualWidth: 5.5, actualThickness: 0.75 },
    '1x8': { name: '1x8', nominalWidth: 8, nominalThickness: 1, actualWidth: 7.25, actualThickness: 0.75 },
    '1x12': { name: '1x12', nominalWidth: 12, nominalThickness: 1, actualWidth: 11.25, actualThickness: 0.75 },
    'custom': { name: 'Custom', nominalWidth: 0, nominalThickness: 0, actualWidth: 0, actualThickness: 0 },
  };

  const woodTypes: Record<WoodType, WoodTypeConfig> = {
    pine: { name: 'Pine/SPF', priceMultiplier: 1.0, description: 'Most common, affordable softwood' },
    cedar: { name: 'Cedar', priceMultiplier: 2.5, description: 'Naturally rot-resistant, great for outdoor' },
    douglas_fir: { name: 'Douglas Fir', priceMultiplier: 1.4, description: 'Strong structural lumber' },
    redwood: { name: 'Redwood', priceMultiplier: 3.0, description: 'Premium outdoor lumber, naturally rot-resistant' },
    pressure_treated: { name: 'Pressure Treated', priceMultiplier: 1.6, description: 'Chemically treated for outdoor use' },
  };

  const gradeMultipliers: Record<LumberGrade, number> = {
    construction: 1.0,
    standard: 1.15,
    premium: 1.35,
    select: 1.6,
  };

  const calculations = useMemo(() => {
    const length = parseFloat(boardLength) || 0;
    const boards = parseInt(numberOfBoards) || 0;
    const waste = parseFloat(wasteFactor) || 10;

    // Get dimensions
    let thickness: number, width: number;
    if (lumberSize === 'custom') {
      thickness = parseFloat(customThickness) || 2;
      width = parseFloat(customWidth) || 4;
    } else {
      thickness = lumberSizes[lumberSize].nominalThickness;
      width = lumberSizes[lumberSize].nominalWidth;
    }

    // Calculate board feet
    // Board Foot = (Thickness x Width x Length) / 144
    // where thickness and width are in inches, length is in feet
    const boardFeetPerPiece = (thickness * width * length) / 12;
    const totalBoardFeet = boardFeetPerPiece * boards;
    const totalBoardFeetWithWaste = totalBoardFeet * (1 + waste / 100);

    // Calculate linear feet
    const linearFeetPerPiece = length;
    const totalLinearFeet = linearFeetPerPiece * boards;
    const totalLinearFeetWithWaste = totalLinearFeet * (1 + waste / 100);

    // Calculate square feet of coverage (for siding/decking calculations)
    let actualWidth: number;
    if (lumberSize === 'custom') {
      actualWidth = width - 0.5; // Approximate actual width
    } else {
      actualWidth = lumberSizes[lumberSize].actualWidth;
    }
    const sqFtPerPiece = (actualWidth / 12) * length;
    const totalSqFt = sqFtPerPiece * boards;

    // Calculate pricing
    const basePrice = 0.75; // Base price per board foot for pine construction grade
    const woodMultiplier = woodTypes[woodType].priceMultiplier;
    const gradeMultiplier = gradeMultipliers[lumberGrade];
    const calculatedPricePerBoardFoot = basePrice * woodMultiplier * gradeMultiplier;
    const calculatedPricePerLinearFoot = calculatedPricePerBoardFoot * boardFeetPerPiece / length;

    const effectivePricePerBoardFoot = pricePerBoardFoot ? parseFloat(pricePerBoardFoot) : calculatedPricePerBoardFoot;
    const effectivePricePerLinearFoot = pricePerLinearFoot ? parseFloat(pricePerLinearFoot) : calculatedPricePerLinearFoot;

    const costByBoardFoot = totalBoardFeetWithWaste * effectivePricePerBoardFoot;
    const costByLinearFoot = totalLinearFeetWithWaste * effectivePricePerLinearFoot;
    const costPerBoard = effectivePricePerLinearFoot * length;

    // Calculate weight (approximate, varies by wood type and moisture content)
    // Pine/SPF is approximately 2.5 lbs per board foot when dry
    const weightPerBoardFoot = woodType === 'cedar' ? 2.0 :
                                woodType === 'redwood' ? 2.3 :
                                woodType === 'douglas_fir' ? 2.7 :
                                woodType === 'pressure_treated' ? 3.5 : 2.5;
    const totalWeight = totalBoardFeetWithWaste * weightPerBoardFoot;

    return {
      boardFeetPerPiece: boardFeetPerPiece.toFixed(2),
      totalBoardFeet: totalBoardFeet.toFixed(2),
      totalBoardFeetWithWaste: totalBoardFeetWithWaste.toFixed(2),
      linearFeetPerPiece: linearFeetPerPiece.toFixed(1),
      totalLinearFeet: totalLinearFeet.toFixed(1),
      totalLinearFeetWithWaste: totalLinearFeetWithWaste.toFixed(1),
      sqFtPerPiece: sqFtPerPiece.toFixed(2),
      totalSqFt: totalSqFt.toFixed(1),
      pricePerBoardFoot: effectivePricePerBoardFoot.toFixed(2),
      pricePerLinearFoot: effectivePricePerLinearFoot.toFixed(2),
      costByBoardFoot: costByBoardFoot.toFixed(2),
      costByLinearFoot: costByLinearFoot.toFixed(2),
      costPerBoard: costPerBoard.toFixed(2),
      totalWeight: totalWeight.toFixed(0),
      boardsWithWaste: Math.ceil(boards * (1 + waste / 100)),
    };
  }, [lumberSize, woodType, lumberGrade, customThickness, customWidth, boardLength, numberOfBoards, wasteFactor, pricePerBoardFoot, pricePerLinearFoot]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><TreeDeciduous className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lumberCalculator.lumberCalculator', 'Lumber Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lumberCalculator.calculateBoardFeetLinearFeet', 'Calculate board feet, linear feet, and costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lumber Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lumberCalculator.lumberSizeNominal', 'Lumber Size (Nominal)')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(lumberSizes) as LumberSize[]).slice(0, 8).map((size) => (
              <button
                key={size}
                onClick={() => setLumberSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${lumberSize === size ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {lumberSizes[size].name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(lumberSizes) as LumberSize[]).slice(8).map((size) => (
              <button
                key={size}
                onClick={() => setLumberSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${lumberSize === size ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {lumberSizes[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Size Inputs */}
        {lumberSize === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lumberCalculator.thicknessInches', 'Thickness (inches)')}</label>
              <input
                type="number"
                value={customThickness}
                onChange={(e) => setCustomThickness(e.target.value)}
                step="0.25"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lumberCalculator.widthInches', 'Width (inches)')}</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                step="0.25"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}

        {/* Actual Dimensions Display */}
        {lumberSize !== 'custom' && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.lumberCalculator.actualDimensions', 'Actual dimensions:')}</span> {lumberSizes[lumberSize].actualThickness}" x {lumberSizes[lumberSize].actualWidth}"
            </p>
          </div>
        )}

        {/* Wood Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lumberCalculator.woodType', 'Wood Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(woodTypes) as WoodType[]).map((type) => (
              <button
                key={type}
                onClick={() => setWoodType(type)}
                className={`py-2 px-3 rounded-lg text-sm ${woodType === type ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {woodTypes[type].name}
              </button>
            ))}
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {woodTypes[woodType].description}
          </p>
        </div>

        {/* Grade Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lumberCalculator.grade', 'Grade')}
          </label>
          <div className="flex gap-2">
            {(['construction', 'standard', 'premium', 'select'] as LumberGrade[]).map((grade) => (
              <button
                key={grade}
                onClick={() => setLumberGrade(grade)}
                className={`flex-1 py-2 rounded-lg text-sm capitalize ${lumberGrade === grade ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Board Dimensions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 text-teal-500" />
            {t('tools.lumberCalculator.boardDetails', 'Board Details')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lumberCalculator.boardLengthFeet', 'Board Length (feet)')}</label>
              <div className="flex gap-2">
                {[8, 10, 12, 16].map((len) => (
                  <button
                    key={len}
                    onClick={() => setBoardLength(len.toString())}
                    className={`flex-1 py-2 rounded-lg text-sm ${parseInt(boardLength) === len ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {len}'
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={boardLength}
                onChange={(e) => setBoardLength(e.target.value)}
                placeholder={t('tools.lumberCalculator.customLength', 'Custom length')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lumberCalculator.numberOfBoards', 'Number of Boards')}</label>
              <input
                type="number"
                value={numberOfBoards}
                onChange={(e) => setNumberOfBoards(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lumberCalculator.wasteFactor', 'Waste Factor (%)')}
          </label>
          <div className="flex gap-2">
            {[0, 5, 10, 15, 20].map((w) => (
              <button
                key={w}
                onClick={() => setWasteFactor(w.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseInt(wasteFactor) === w ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {w}%
              </button>
            ))}
          </div>
        </div>

        {/* Results - Board Feet and Linear Feet */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-teal-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lumberCalculator.boardFeet', 'Board Feet')}</span>
            </div>
            <div className="text-3xl font-bold text-teal-500">{calculations.totalBoardFeetWithWaste}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.boardFeetPerPiece} BF per board
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lumberCalculator.linearFeet', 'Linear Feet')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.totalLinearFeetWithWaste}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.boardsWithWaste} boards needed
            </div>
          </div>
        </div>

        {/* Additional Calculations */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Layers className="w-4 h-4 text-amber-500" />
            {t('tools.lumberCalculator.additionalInformation', 'Additional Information')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lumberCalculator.coverageSqFt', 'Coverage (sq ft)')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.totalSqFt}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lumberCalculator.estimatedWeight', 'Estimated Weight')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.totalWeight} lbs</div>
            </div>
          </div>
        </div>

        {/* Custom Pricing */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-teal-500" />
            {t('tools.lumberCalculator.customPricingOptional', 'Custom Pricing (optional)')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.lumberCalculator.pricePerBoardFoot2', 'Price per Board Foot ($)')}
              </label>
              <input
                type="number"
                value={pricePerBoardFoot}
                onChange={(e) => setPricePerBoardFoot(e.target.value)}
                placeholder={calculations.pricePerBoardFoot}
                step="0.01"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.lumberCalculator.pricePerLinearFoot2', 'Price per Linear Foot ($)')}
              </label>
              <input
                type="number"
                value={pricePerLinearFoot}
                onChange={(e) => setPricePerLinearFoot(e.target.value)}
                placeholder={calculations.pricePerLinearFoot}
                step="0.01"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-teal-500" />
            {t('tools.lumberCalculator.costEstimate', 'Cost Estimate')}
          </h4>
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t('tools.lumberCalculator.pricePerBoardFoot', 'Price per board foot')}</span>
              <span>${calculations.pricePerBoardFoot}</span>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t('tools.lumberCalculator.pricePerLinearFoot', 'Price per linear foot')}</span>
              <span>${calculations.pricePerLinearFoot}</span>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Cost per board ({boardLength}')</span>
              <span>${calculations.costPerBoard}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-teal-800' : 'border-teal-200'}`}>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lumberCalculator.totalEstimatedCost', 'Total Estimated Cost')}</span>
              <span className="text-xl font-bold text-teal-500">${calculations.costByBoardFoot}</span>
            </div>
          </div>
        </div>

        {/* Board Foot Explanation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.lumberCalculator.boardFootFormula', 'Board Foot Formula:')}</strong>
              <p className="mt-1">
                Board Foot = (Thickness" x Width" x Length') / 12
              </p>
              <ul className="mt-2 space-y-1">
                <li>{t('tools.lumberCalculator.oneBoardFootEquals144', 'One board foot equals 144 cubic inches of wood')}</li>
                <li>{t('tools.lumberCalculator.equivalentToA1X', 'Equivalent to a 1" x 12" x 1\' board')}</li>
                <li>{t('tools.lumberCalculator.nominalDimensionsAreUsedFor', 'Nominal dimensions are used for calculations')}</li>
                <li>{t('tools.lumberCalculator.actualDimensionsAreSmallerDue', 'Actual dimensions are smaller due to planing/drying')}</li>
                <li>{t('tools.lumberCalculator.pricesVarySignificantlyByRegion', 'Prices vary significantly by region and market conditions')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LumberCalculatorTool;
