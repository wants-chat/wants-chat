import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Square, Layers, Scissors, Info, RotateCw, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SheetSize = '4x8' | '4x10';
type ThicknessOption = '1/4' | '3/8' | '1/2' | '5/8' | '3/4' | '1';
type UnitSystem = 'imperial' | 'metric';
type Orientation = 'auto' | 'horizontal' | 'vertical';

interface SheetConfig {
  width: number; // in inches
  height: number; // in inches
  label: string;
}

interface ThicknessConfig {
  label: string;
  inches: number;
  mm: number;
  commonUse: string;
}

interface CutPiece {
  width: number;
  height: number;
  quantity: number;
  orientation: 'horizontal' | 'vertical';
}

interface CalculationResult {
  sheetsNeeded: number;
  totalArea: number;
  sheetArea: number;
  usedArea: number;
  wastePercentage: number;
  cutList: CutPiece[];
  optimizedOrientation: 'horizontal' | 'vertical';
}

interface PlywoodCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const PlywoodCalculatorTool: React.FC<PlywoodCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [sheetSize, setSheetSize] = useState<SheetSize>('4x8');
  const [thickness, setThickness] = useState<ThicknessOption>('3/4');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [wasteFactor, setWasteFactor] = useState('10');

  // Project dimensions
  const [projectWidth, setProjectWidth] = useState('48');
  const [projectHeight, setProjectHeight] = useState('96');
  const [quantity, setQuantity] = useState('1');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setProjectWidth(params.numbers[0].toString());
        setProjectHeight(params.numbers[1].toString());
        if (params.numbers[2]) {
          setQuantity(params.numbers[2].toString());
        }
        setIsPrefilled(true);
      } else if (params.width && params.height) {
        setProjectWidth(params.width.toString());
        setProjectHeight(params.height.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sheetSizes: Record<SheetSize, SheetConfig> = {
    '4x8': { width: 48, height: 96, label: '4\' x 8\' (48" x 96")' },
    '4x10': { width: 48, height: 120, label: '4\' x 10\' (48" x 120")' },
  };

  const thicknessOptions: Record<ThicknessOption, ThicknessConfig> = {
    '1/4': { label: '1/4"', inches: 0.25, mm: 6.35, commonUse: 'Backing, drawer bottoms' },
    '3/8': { label: '3/8"', inches: 0.375, mm: 9.53, commonUse: 'Underlayment, crafts' },
    '1/2': { label: '1/2"', inches: 0.5, mm: 12.7, commonUse: 'Shelving, cabinet backs' },
    '5/8': { label: '5/8"', inches: 0.625, mm: 15.88, commonUse: 'Subfloor, sheathing' },
    '3/4': { label: '3/4"', inches: 0.75, mm: 19.05, commonUse: 'Cabinets, furniture, shelves' },
    '1': { label: '1"', inches: 1, mm: 25.4, commonUse: 'Heavy-duty shelving, workbenches' },
  };

  const currentSheet = sheetSizes[sheetSize];
  const currentThickness = thicknessOptions[thickness];

  const convertToInches = (value: number): number => {
    return unitSystem === 'metric' ? value / 25.4 : value;
  };

  const formatDimension = (inches: number): string => {
    if (unitSystem === 'metric') {
      return `${(inches * 25.4).toFixed(1)} mm`;
    }
    return `${inches}"`;
  };

  const calculations = useMemo((): CalculationResult => {
    const width = convertToInches(parseFloat(projectWidth) || 0);
    const height = convertToInches(parseFloat(projectHeight) || 0);
    const qty = parseInt(quantity) || 1;
    const waste = (parseFloat(wasteFactor) || 0) / 100;

    const sheetWidth = currentSheet.width;
    const sheetHeight = currentSheet.height;
    const sheetArea = sheetWidth * sheetHeight;
    const pieceArea = width * height;
    const totalPieceArea = pieceArea * qty;

    // Calculate how many pieces fit in each orientation
    const calcFit = (pieceW: number, pieceH: number) => {
      const acrossWidth = Math.floor(sheetWidth / pieceW);
      const acrossHeight = Math.floor(sheetHeight / pieceH);
      return acrossWidth * acrossHeight;
    };

    const horizontalFit = calcFit(width, height);
    const verticalFit = calcFit(height, width);

    let piecesPerSheet: number;
    let optOrientation: 'horizontal' | 'vertical';

    if (orientation === 'auto') {
      if (horizontalFit >= verticalFit) {
        piecesPerSheet = horizontalFit;
        optOrientation = 'horizontal';
      } else {
        piecesPerSheet = verticalFit;
        optOrientation = 'vertical';
      }
    } else if (orientation === 'horizontal') {
      piecesPerSheet = horizontalFit;
      optOrientation = 'horizontal';
    } else {
      piecesPerSheet = verticalFit;
      optOrientation = 'vertical';
    }

    // Handle case where piece doesn't fit at all
    if (piecesPerSheet === 0) {
      if (width <= sheetWidth && height <= sheetHeight) {
        piecesPerSheet = 1;
        optOrientation = 'horizontal';
      } else if (height <= sheetWidth && width <= sheetHeight) {
        piecesPerSheet = 1;
        optOrientation = 'vertical';
      }
    }

    const sheetsNeededRaw = piecesPerSheet > 0 ? Math.ceil(qty / piecesPerSheet) : 0;
    const sheetsWithWaste = Math.ceil(sheetsNeededRaw * (1 + waste));
    const usedArea = totalPieceArea;
    const totalSheetArea = sheetsWithWaste * sheetArea;
    const wastePercentage = totalSheetArea > 0 ? ((totalSheetArea - usedArea) / totalSheetArea) * 100 : 0;

    // Generate cut list
    const cutList: CutPiece[] = [];
    if (width > 0 && height > 0) {
      cutList.push({
        width: optOrientation === 'horizontal' ? width : height,
        height: optOrientation === 'horizontal' ? height : width,
        quantity: qty,
        orientation: optOrientation,
      });
    }

    return {
      sheetsNeeded: sheetsWithWaste,
      totalArea: totalPieceArea,
      sheetArea,
      usedArea,
      wastePercentage: Math.max(0, wastePercentage),
      cutList,
      optimizedOrientation: optOrientation,
    };
  }, [projectWidth, projectHeight, quantity, sheetSize, orientation, wasteFactor, unitSystem, currentSheet]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Layers className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plywoodCalculator.plywoodCalculator', 'Plywood Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plywoodCalculator.calculateSheetsNeededWithCut', 'Calculate sheets needed with cut optimization')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Unit System Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'imperial' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.plywoodCalculator.imperialIn', 'Imperial (in)')}
          </button>
          <button
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'metric' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.plywoodCalculator.metricMm', 'Metric (mm)')}
          </button>
        </div>

        {/* Sheet Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Square className="w-4 h-4 inline mr-1" />
            {t('tools.plywoodCalculator.sheetSize', 'Sheet Size')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(sheetSizes) as SheetSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setSheetSize(size)}
                className={`py-3 px-4 rounded-lg text-sm ${sheetSize === size ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {sheetSizes[size].label}
              </button>
            ))}
          </div>
        </div>

        {/* Thickness Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Layers className="w-4 h-4 inline mr-1" />
            {t('tools.plywoodCalculator.thickness', 'Thickness')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(thicknessOptions) as ThicknessOption[]).map((t) => (
              <button
                key={t}
                onClick={() => setThickness(t)}
                className={`py-2 px-3 rounded-lg text-sm ${thickness === t ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {thicknessOptions[t].label}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {currentThickness.commonUse}
          </p>
        </div>

        {/* Project Dimensions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.plywoodCalculator.projectDimensions', 'Project Dimensions')}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Width ({unitSystem === 'metric' ? 'mm' : 'in'})
              </label>
              <input
                type="number"
                value={projectWidth}
                onChange={(e) => setProjectWidth(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Height ({unitSystem === 'metric' ? 'mm' : 'in'})
              </label>
              <input
                type="number"
                value={projectHeight}
                onChange={(e) => setProjectHeight(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.plywoodCalculator.quantity', 'Quantity')}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Orientation Optimization */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <RotateCw className="w-4 h-4 inline mr-1" />
            {t('tools.plywoodCalculator.orientation', 'Orientation')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setOrientation('auto')}
              className={`py-2 px-3 rounded-lg text-sm ${orientation === 'auto' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.plywoodCalculator.autoBest', 'Auto (Best)')}
            </button>
            <button
              onClick={() => setOrientation('horizontal')}
              className={`py-2 px-3 rounded-lg text-sm ${orientation === 'horizontal' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.plywoodCalculator.horizontal', 'Horizontal')}
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={`py-2 px-3 rounded-lg text-sm ${orientation === 'vertical' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.plywoodCalculator.vertical', 'Vertical')}
            </button>
          </div>
        </div>

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scissors className="w-4 h-4 inline mr-1" />
            {t('tools.plywoodCalculator.wasteFactor', 'Waste Factor')}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((w) => (
              <button
                key={w}
                onClick={() => setWasteFactor(w.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseInt(wasteFactor) === w ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {w}%
              </button>
            ))}
          </div>
          <input
            type="number"
            min="0"
            max="50"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(e.target.value)}
            placeholder={t('tools.plywoodCalculator.custom', 'Custom %')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plywoodCalculator.sheetsNeeded', 'Sheets Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{calculations.sheetsNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {sheetSize} sheets at {thickness}"
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plywoodCalculator.waste', 'Waste')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.wastePercentage.toFixed(1)}%</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Including {wasteFactor}% buffer
            </div>
          </div>
        </div>

        {/* Optimization Info */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.plywoodCalculator.optimizedOrientation', 'Optimized Orientation')}</div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.optimizedOrientation === 'horizontal' ? t('tools.plywoodCalculator.horizontal2', 'Horizontal') : t('tools.plywoodCalculator.vertical2', 'Vertical')}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Total area needed: {(calculations.totalArea / 144).toFixed(2)} sq ft
          </div>
        </div>

        {/* Cut List */}
        {calculations.cutList.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Scissors className="w-4 h-4 inline mr-1" />
              {t('tools.plywoodCalculator.cutList', 'Cut List')}
            </h4>
            <div className="space-y-2">
              {calculations.cutList.map((cut, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {formatDimension(cut.width)} x {formatDimension(cut.height)}
                  </span>
                  <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    x{cut.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.plywoodCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Account for saw blade kerf (typically 1/8")</li>
                <li>- Consider grain direction for visible pieces</li>
                <li>- Buy extra sheets for mistakes (5-10%)</li>
                <li>- Check for defects before cutting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlywoodCalculatorTool;
