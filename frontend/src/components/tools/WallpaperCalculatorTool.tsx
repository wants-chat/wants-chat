import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Square, DoorOpen, Maximize2, Percent, Calculator, Info, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

type UnitSystem = 'metric' | 'imperial';

interface RollSize {
  name: string;
  width: number; // cm for metric, inches for imperial
  length: number; // meters for metric, feet for imperial
}

interface Deduction {
  id: string;
  type: 'door' | 'window';
  width: number;
  height: number;
}

interface WallpaperCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const WallpaperCalculatorTool: React.FC<WallpaperCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Room dimensions
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [wallsLength, setWallsLength] = useState('14'); // Total perimeter of walls
  const [wallHeight, setWallHeight] = useState('2.5');

  // Roll dimensions
  const [rollWidth, setRollWidth] = useState('53'); // cm or inches
  const [rollLength, setRollLength] = useState('10'); // meters or feet

  // Pattern repeat
  const [patternRepeat, setPatternRepeat] = useState('0'); // 0 for no pattern

  // Waste factor
  const [wasteFactor, setWasteFactor] = useState('10'); // percentage

  // Deductions (doors/windows)
  const [deductions, setDeductions] = useState<Deduction[]>([
    { id: '1', type: 'door', width: 0.9, height: 2.1 },
    { id: '2', type: 'window', width: 1.2, height: 1.2 },
  ]);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setWallsLength(params.numbers[0].toString());
        setWallHeight(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.length && params.height) {
        setWallsLength(params.length.toString());
        setWallHeight(params.height.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const rollSizes: Record<UnitSystem, RollSize[]> = {
    metric: [
      { name: 'European Standard', width: 53, length: 10 },
      { name: 'Wide European', width: 70, length: 10 },
      { name: 'Double Roll', width: 53, length: 10.05 },
      { name: 'Commercial', width: 90, length: 50 },
    ],
    imperial: [
      { name: 'American Single', width: 20.5, length: 16.5 },
      { name: 'American Double', width: 20.5, length: 33 },
      { name: 'Wide Format', width: 27, length: 27 },
      { name: 'Commercial', width: 36, length: 150 },
    ],
  };

  const applyPresetRoll = (roll: RollSize) => {
    setRollWidth(roll.width.toString());
    setRollLength(roll.length.toString());
  };

  const addDeduction = (type: 'door' | 'window') => {
    const defaultSize = type === 'door'
      ? { width: unitSystem === 'metric' ? 0.9 : 3, height: unitSystem === 'metric' ? 2.1 : 7 }
      : { width: unitSystem === 'metric' ? 1.2 : 4, height: unitSystem === 'metric' ? 1.2 : 4 };

    setDeductions([...deductions, {
      id: Date.now().toString(),
      type,
      ...defaultSize,
    }]);
  };

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter(d => d.id !== id));
  };

  const updateDeduction = (id: string, field: 'width' | 'height', value: string) => {
    setDeductions(deductions.map(d =>
      d.id === id ? { ...d, [field]: parseFloat(value) || 0 } : d
    ));
  };

  const resetCalculator = () => {
    setWallsLength('14');
    setWallHeight('2.5');
    setRollWidth('53');
    setRollLength('10');
    setPatternRepeat('0');
    setWasteFactor('10');
    setDeductions([
      { id: '1', type: 'door', width: 0.9, height: 2.1 },
      { id: '2', type: 'window', width: 1.2, height: 1.2 },
    ]);
    setUnitSystem('metric');
  };

  const calculations = useMemo(() => {
    const perimeter = parseFloat(wallsLength) || 0;
    const height = parseFloat(wallHeight) || 0;
    const rWidth = parseFloat(rollWidth) || 0;
    const rLength = parseFloat(rollLength) || 0;
    const pattern = parseFloat(patternRepeat) || 0;
    const waste = parseFloat(wasteFactor) || 0;

    // Convert everything to consistent units (meters for metric, feet for imperial)
    const rollWidthInMainUnit = unitSystem === 'metric' ? rWidth / 100 : rWidth / 12; // cm to m or inches to ft
    const rollLengthInMainUnit = rLength; // already in meters or feet

    // Calculate total wall area
    const grossWallArea = perimeter * height;

    // Calculate deduction area
    const deductionArea = deductions.reduce((sum, d) => sum + (d.width * d.height), 0);

    // Net wall area
    const netWallArea = Math.max(0, grossWallArea - deductionArea);

    // Calculate drops needed (number of strips)
    const dropsNeeded = rollWidthInMainUnit > 0 ? Math.ceil(perimeter / rollWidthInMainUnit) : 0;

    // Calculate usable drop length (accounting for pattern repeat)
    let dropLength = height;
    if (pattern > 0) {
      const patternInMainUnit = unitSystem === 'metric' ? pattern / 100 : pattern / 12;
      const repeatsNeeded = Math.ceil(height / patternInMainUnit);
      dropLength = repeatsNeeded * patternInMainUnit;
    }

    // Calculate drops per roll
    const dropsPerRoll = rollLengthInMainUnit > 0 && dropLength > 0
      ? Math.floor(rollLengthInMainUnit / dropLength)
      : 0;

    // Calculate base rolls needed
    const baseRolls = dropsPerRoll > 0 ? Math.ceil(dropsNeeded / dropsPerRoll) : 0;

    // Add waste factor
    const rollsWithWaste = Math.ceil(baseRolls * (1 + waste / 100));

    // Roll coverage
    const rollCoverage = rollWidthInMainUnit * rollLengthInMainUnit;

    // Total coverage needed
    const totalCoverageNeeded = netWallArea * (1 + waste / 100);

    // Alternative calculation (area-based)
    const rollsByArea = rollCoverage > 0 ? Math.ceil(totalCoverageNeeded / rollCoverage) : 0;

    // Use the higher of the two methods for safety
    const recommendedRolls = Math.max(rollsWithWaste, rollsByArea);

    return {
      grossWallArea: grossWallArea.toFixed(2),
      deductionArea: deductionArea.toFixed(2),
      netWallArea: netWallArea.toFixed(2),
      dropsNeeded,
      dropLength: dropLength.toFixed(2),
      dropsPerRoll,
      baseRolls,
      rollsWithWaste,
      rollsByArea,
      recommendedRolls,
      rollCoverage: rollCoverage.toFixed(2),
      totalCoverageNeeded: totalCoverageNeeded.toFixed(2),
    };
  }, [wallsLength, wallHeight, rollWidth, rollLength, patternRepeat, wasteFactor, deductions, unitSystem]);

  const unitLabels = {
    metric: { length: 'm', small: 'cm', area: 'm²' },
    imperial: { length: 'ft', small: 'in', area: 'ft²' },
  };

  const units = unitLabels[unitSystem];

  // Export data structure
  const COLUMNS = [
    { key: 'label', label: 'Metric' },
    { key: 'value', label: 'Value' },
    { key: 'unit', label: 'Unit' },
  ];

  const exportData = [
    { label: 'Unit System', value: unitSystem.toUpperCase(), unit: '' },
    { label: 'Wall Perimeter', value: wallsLength, unit: units.length },
    { label: 'Wall Height', value: wallHeight, unit: units.length },
    { label: 'Roll Width', value: rollWidth, unit: units.small },
    { label: 'Roll Length', value: rollLength, unit: units.length },
    { label: 'Pattern Repeat', value: patternRepeat || 'None', unit: patternRepeat ? units.small : '' },
    { label: 'Waste Factor', value: `${wasteFactor}%`, unit: '' },
    { label: 'Gross Wall Area', value: calculations.grossWallArea, unit: units.area },
    { label: 'Deduction Area', value: calculations.deductionArea, unit: units.area },
    { label: 'Net Wall Area', value: calculations.netWallArea, unit: units.area },
    { label: 'Rolls Needed', value: calculations.recommendedRolls.toString(), unit: 'rolls' },
    { label: 'Drops Needed', value: calculations.dropsNeeded.toString(), unit: 'strips' },
    { label: 'Drop Length', value: calculations.dropLength, unit: units.length },
    { label: 'Drops Per Roll', value: calculations.dropsPerRoll.toString(), unit: '' },
    { label: 'Roll Coverage', value: calculations.rollCoverage, unit: units.area },
  ];

  const handleExportCSV = () => {
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = exportData.map(row =>
      `"${row.label}","${row.value}","${row.unit}"`
    ).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wallpaper-calculator-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonData = {
      timestamp: new Date().toISOString(),
      inputs: {
        unitSystem,
        wallPerimeter: parseFloat(wallsLength),
        wallHeight: parseFloat(wallHeight),
        rollWidth: parseFloat(rollWidth),
        rollLength: parseFloat(rollLength),
        patternRepeat: parseFloat(patternRepeat) || 0,
        wasteFactor: parseFloat(wasteFactor),
        deductions: deductions.map(d => ({
          type: d.type,
          width: d.width,
          height: d.height,
        })),
      },
      results: {
        recommendedRolls: calculations.recommendedRolls,
        grossWallArea: parseFloat(calculations.grossWallArea),
        deductionArea: parseFloat(calculations.deductionArea),
        netWallArea: parseFloat(calculations.netWallArea),
        dropsNeeded: calculations.dropsNeeded,
        dropLength: parseFloat(calculations.dropLength),
        dropsPerRoll: calculations.dropsPerRoll,
        rollCoverage: parseFloat(calculations.rollCoverage),
      },
      units,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wallpaper-calculator-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const textData = `
Wallpaper Calculator Results
============================
Unit System: ${unitSystem}
Wall Perimeter: ${wallsLength} ${units.length}
Wall Height: ${wallHeight} ${units.length}
Roll Width: ${rollWidth} ${units.small}
Roll Length: ${rollLength} ${units.length}
Pattern Repeat: ${patternRepeat || 'None'} ${patternRepeat ? units.small : ''}
Waste Factor: ${wasteFactor}%

RESULTS:
--------
Rolls Needed: ${calculations.recommendedRolls}
Gross Wall Area: ${calculations.grossWallArea} ${units.area}
Net Wall Area: ${calculations.netWallArea} ${units.area}
Drops Needed: ${calculations.dropsNeeded}
Drop Length: ${calculations.dropLength} ${units.length}
Drops Per Roll: ${calculations.dropsPerRoll}
Roll Coverage: ${calculations.rollCoverage} ${units.area}
    `.trim();

    try {
      await navigator.clipboard.writeText(textData);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Square className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperCalculator.wallpaperCalculator', 'Wallpaper Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wallpaperCalculator.calculateRollsNeededForYour', 'Calculate rolls needed for your room')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={resetCalculator}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title={t('tools.wallpaperCalculator.resetCalculator', 'Reset calculator')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Unit System Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'metric' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.wallpaperCalculator.metricMCm', 'Metric (m, cm)')}
          </button>
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'imperial' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.wallpaperCalculator.imperialFtIn', 'Imperial (ft, in)')}
          </button>
        </div>

        {/* Room Dimensions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Maximize2 className="w-4 h-4 text-purple-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperCalculator.roomDimensions', 'Room Dimensions')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Total Wall Length ({units.length})
              </label>
              <input
                type="number"
                value={wallsLength}
                onChange={(e) => setWallsLength(e.target.value)}
                placeholder={t('tools.wallpaperCalculator.roomPerimeter', 'Room perimeter')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.wallpaperCalculator.sumOfAllWallLengths', 'Sum of all wall lengths')}
              </p>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Wall Height ({units.length})
              </label>
              <input
                type="number"
                value={wallHeight}
                onChange={(e) => setWallHeight(e.target.value)}
                placeholder={t('tools.wallpaperCalculator.ceilingHeight', 'Ceiling height')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Roll Dimensions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-purple-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperCalculator.rollDimensions', 'Roll Dimensions')}</h4>
          </div>

          {/* Preset Roll Sizes */}
          <div className="grid grid-cols-2 gap-2">
            {rollSizes[unitSystem].map((roll) => (
              <button
                key={roll.name}
                onClick={() => applyPresetRoll(roll)}
                className={`py-2 px-3 rounded-lg text-sm text-left ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium">{roll.name}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {roll.width}{units.small} x {roll.length}{units.length}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Roll Width ({units.small})
              </label>
              <input
                type="number"
                value={rollWidth}
                onChange={(e) => setRollWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Roll Length ({units.length})
              </label>
              <input
                type="number"
                value={rollLength}
                onChange={(e) => setRollLength(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Pattern Repeat & Waste Factor */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Pattern Repeat ({units.small})
            </label>
            <input
              type="number"
              value={patternRepeat}
              onChange={(e) => setPatternRepeat(e.target.value)}
              placeholder={t('tools.wallpaperCalculator.0ForNoPattern', '0 for no pattern')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.wallpaperCalculator.enter0ForPlainWallpaper', 'Enter 0 for plain wallpaper')}
            </p>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.wallpaperCalculator.wasteFactor', 'Waste Factor (%)')}
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setWasteFactor(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseInt(wasteFactor) === n ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Door/Window Deductions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-purple-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperCalculator.deductions', 'Deductions')}</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addDeduction('door')}
                className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.wallpaperCalculator.door', '+ Door')}
              </button>
              <button
                onClick={() => addDeduction('window')}
                className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.wallpaperCalculator.window', '+ Window')}
              </button>
            </div>
          </div>

          {deductions.length > 0 && (
            <div className="space-y-2">
              {deductions.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <span className={`text-sm font-medium capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {d.type}
                  </span>
                  <input
                    type="number"
                    value={d.width}
                    onChange={(e) => updateDeduction(d.id, 'width', e.target.value)}
                    placeholder={t('tools.wallpaperCalculator.width', 'Width')}
                    className={`w-20 px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>x</span>
                  <input
                    type="number"
                    value={d.height}
                    onChange={(e) => updateDeduction(d.id, 'height', e.target.value)}
                    placeholder={t('tools.wallpaperCalculator.height', 'Height')}
                    className={`w-20 px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{units.length}</span>
                  <button
                    onClick={() => removeDeduction(d.id)}
                    className={`ml-auto text-red-500 hover:text-red-400 text-sm`}
                  >
                    {t('tools.wallpaperCalculator.remove', 'Remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-100 border-purple-300'} border`}>
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-purple-500" />
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperCalculator.results', 'Results')}</h4>
          </div>

          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.wallpaperCalculator.rollsNeeded', 'Rolls Needed')}</div>
            <div className="text-5xl font-bold text-purple-500">{calculations.recommendedRolls}</div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              including {wasteFactor}% waste allowance
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.wallpaperCalculator.grossWallArea', 'Gross Wall Area')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.grossWallArea} {units.area}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.wallpaperCalculator.deductions2', 'Deductions')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                -{calculations.deductionArea} {units.area}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.wallpaperCalculator.netWallArea', 'Net Wall Area')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.netWallArea} {units.area}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.wallpaperCalculator.rollCoverage', 'Roll Coverage')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.rollCoverage} {units.area}
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-purple-200'}`}>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.wallpaperCalculator.dropsNeeded', 'Drops Needed')}</div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.dropsNeeded}</div>
              </div>
              <div>
                <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.wallpaperCalculator.dropLength', 'Drop Length')}</div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.dropLength}{units.length}</div>
              </div>
              <div>
                <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.wallpaperCalculator.dropsRoll', 'Drops/Roll')}</div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.dropsPerRoll}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.wallpaperCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Always buy 1-2 extra rolls from the same batch</li>
                <li>- Large patterns need more waste allowance (15-20%)</li>
                <li>- Measure at multiple points for uneven walls</li>
                <li>- Check roll batch numbers match before starting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallpaperCalculatorTool;
