import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Frame, Ruler, Square, Layers, Maximize2, Grid3X3, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Unit = 'inches' | 'cm';

interface StandardSize {
  name: string;
  width: number;
  height: number;
}

interface MatOption {
  name: string;
  width: number;
  description: string;
}

interface FrameSizerToolProps {
  uiConfig?: UIConfig;
}

export const FrameSizerTool: React.FC<FrameSizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [unit, setUnit] = useState<Unit>('inches');
  const [artworkWidth, setArtworkWidth] = useState('8');
  const [artworkHeight, setArtworkHeight] = useState('10');
  const [matWidth, setMatWidth] = useState('2');
  const [frameWidth, setFrameWidth] = useState('1');
  const [selectedMatOption, setSelectedMatOption] = useState<string>('standard');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.artworkWidth) {
        setArtworkWidth(String(params.artworkWidth));
        hasChanges = true;
      }
      if (params.artworkHeight) {
        setArtworkHeight(String(params.artworkHeight));
        hasChanges = true;
      }
      if (params.matWidth) {
        setMatWidth(String(params.matWidth));
        setSelectedMatOption('custom');
        hasChanges = true;
      }
      if (params.frameWidth) {
        setFrameWidth(String(params.frameWidth));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const matOptions: MatOption[] = [
    { name: 'none', width: 0, description: 'No mat border' },
    { name: 'minimal', width: 1, description: 'Subtle 1" border' },
    { name: 'standard', width: 2, description: 'Classic 2" border' },
    { name: 'gallery', width: 3, description: 'Museum-style 3" border' },
    { name: 'statement', width: 4, description: 'Bold 4" border' },
    { name: 'custom', width: parseFloat(matWidth) || 0, description: 'Custom width' },
  ];

  const standardSizes: StandardSize[] = [
    { name: '4x6', width: 4, height: 6 },
    { name: '5x7', width: 5, height: 7 },
    { name: '8x10', width: 8, height: 10 },
    { name: '11x14', width: 11, height: 14 },
    { name: '16x20', width: 16, height: 20 },
    { name: '18x24', width: 18, height: 24 },
    { name: '20x24', width: 20, height: 24 },
    { name: '24x30', width: 24, height: 30 },
    { name: '24x36', width: 24, height: 36 },
  ];

  const getMatWidthValue = (): number => {
    if (selectedMatOption === 'custom') {
      return parseFloat(matWidth) || 0;
    }
    const option = matOptions.find(m => m.name === selectedMatOption);
    return option ? option.width : 2;
  };

  const calculations = useMemo(() => {
    const artW = parseFloat(artworkWidth) || 0;
    const artH = parseFloat(artworkHeight) || 0;
    const mat = getMatWidthValue();
    const frame = parseFloat(frameWidth) || 0;

    // Mat opening (same as artwork size)
    const matOpeningWidth = artW;
    const matOpeningHeight = artH;

    // Mat board size (artwork + mat on all sides)
    const matBoardWidth = artW + (mat * 2);
    const matBoardHeight = artH + (mat * 2);

    // Glass/Glazing size (same as mat board)
    const glassWidth = matBoardWidth;
    const glassHeight = matBoardHeight;

    // Backing board size (same as mat board)
    const backingWidth = matBoardWidth;
    const backingHeight = matBoardHeight;

    // Frame outer dimensions (mat board + frame molding on all sides)
    const frameOuterWidth = matBoardWidth + (frame * 2);
    const frameOuterHeight = matBoardHeight + (frame * 2);

    // Frame rabbet size (inner edge where glass sits)
    const frameRabbetWidth = matBoardWidth;
    const frameRabbetHeight = matBoardHeight;

    // Calculate aspect ratio
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(Math.round(artW * 100), Math.round(artH * 100));
    const aspectWidth = Math.round(artW * 100) / divisor;
    const aspectHeight = Math.round(artH * 100) / divisor;

    // Find matching standard size
    const tolerance = 0.5;
    const matchingStandard = standardSizes.find(
      s => Math.abs(s.width - matBoardWidth) <= tolerance &&
           Math.abs(s.height - matBoardHeight) <= tolerance
    );

    // Convert if needed
    const conversionFactor = unit === 'cm' ? 2.54 : 1;
    const unitLabel = unit === 'cm' ? 'cm' : '"';

    return {
      artwork: { width: artW, height: artH },
      matOpening: { width: matOpeningWidth, height: matOpeningHeight },
      matBoard: { width: matBoardWidth, height: matBoardHeight },
      glass: { width: glassWidth, height: glassHeight },
      backing: { width: backingWidth, height: backingHeight },
      frameOuter: { width: frameOuterWidth, height: frameOuterHeight },
      frameRabbet: { width: frameRabbetWidth, height: frameRabbetHeight },
      aspectRatio: `${aspectWidth}:${aspectHeight}`,
      matchingStandard: matchingStandard?.name || null,
      matWidth: mat,
      unitLabel,
      conversionFactor,
    };
  }, [artworkWidth, artworkHeight, matWidth, frameWidth, selectedMatOption, unit]);

  const formatSize = (value: number): string => {
    return value.toFixed(2).replace(/\.?0+$/, '');
  };

  const handleStandardSizeSelect = (size: StandardSize) => {
    setArtworkWidth(size.width.toString());
    setArtworkHeight(size.height.toString());
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Frame className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.pictureFrameSizeCalculator', 'Picture Frame Size Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.frameSizer.calculateFrameMatGlassAnd', 'Calculate frame, mat, glass, and backing dimensions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-indigo-500 font-medium">{t('tools.frameSizer.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Unit Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('inches')}
            className={`flex-1 py-2 rounded-lg ${unit === 'inches' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.frameSizer.inches', 'Inches')}
          </button>
          <button
            onClick={() => setUnit('cm')}
            className={`flex-1 py-2 rounded-lg ${unit === 'cm' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.frameSizer.centimeters', 'Centimeters')}
          </button>
        </div>

        {/* Standard Size Quick Select */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Grid3X3 className="w-4 h-4 inline mr-1" />
            {t('tools.frameSizer.quickSelectStandardSize', 'Quick Select Standard Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {standardSizes.slice(0, 6).map((size) => (
              <button
                key={size.name}
                onClick={() => handleStandardSizeSelect(size)}
                className={`py-2 px-3 rounded-lg text-sm ${
                  artworkWidth === size.width.toString() && artworkHeight === size.height.toString()
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {size.name}{unit === 'inches' ? '"' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Artwork Dimensions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Maximize2 className="w-4 h-4 inline mr-1" />
            {t('tools.frameSizer.artworkDimensions', 'Artwork Dimensions')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.frameSizer.width', 'Width')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={artworkWidth}
                  onChange={(e) => setArtworkWidth(e.target.value)}
                  step="0.25"
                  min="0"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {unit === 'inches' ? 'in' : 'cm'}
                </span>
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.frameSizer.height', 'Height')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={artworkHeight}
                  onChange={(e) => setArtworkHeight(e.target.value)}
                  step="0.25"
                  min="0"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {unit === 'inches' ? 'in' : 'cm'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Display */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Square className="w-4 h-4 text-indigo-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.aspectRatio', 'Aspect Ratio')}</span>
            </div>
            <span className="text-indigo-500 font-bold">{calculations.aspectRatio}</span>
          </div>
          {calculations.matchingStandard && (
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Mat board matches standard size: <strong>{calculations.matchingStandard}</strong>
            </p>
          )}
        </div>

        {/* Mat Width Options */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Layers className="w-4 h-4 inline mr-1" />
            {t('tools.frameSizer.matBorderWidth', 'Mat Border Width')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {matOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  setSelectedMatOption(option.name);
                  if (option.name !== 'custom') {
                    setMatWidth(option.width.toString());
                  }
                }}
                className={`py-2 px-3 rounded-lg text-sm ${
                  selectedMatOption === option.name
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {option.name === 'none' ? 'None' :
                 option.name === 'custom' ? 'Custom' :
                 `${option.width}${unit === 'inches' ? '"' : 'cm'}`}
              </button>
            ))}
          </div>
          {selectedMatOption === 'custom' && (
            <div className="relative mt-2">
              <input
                type="number"
                value={matWidth}
                onChange={(e) => setMatWidth(e.target.value)}
                step="0.25"
                min="0"
                placeholder={t('tools.frameSizer.customMatWidth', 'Custom mat width')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {unit === 'inches' ? 'in' : 'cm'}
              </span>
            </div>
          )}
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {matOptions.find(m => m.name === selectedMatOption)?.description}
          </p>
        </div>

        {/* Frame Molding Width */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Frame className="w-4 h-4 inline mr-1" />
            {t('tools.frameSizer.frameMoldingWidth', 'Frame Molding Width')}
          </label>
          <div className="flex gap-2">
            {[0.5, 1, 1.5, 2, 2.5].map((w) => (
              <button
                key={w}
                onClick={() => setFrameWidth(w.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  parseFloat(frameWidth) === w
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {w}{unit === 'inches' ? '"' : 'cm'}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="number"
              value={frameWidth}
              onChange={(e) => setFrameWidth(e.target.value)}
              step="0.25"
              min="0"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {unit === 'inches' ? 'in' : 'cm'}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.frameSizer.calculatedSizes', 'Calculated Sizes')}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Mat Opening */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.matOpening', 'Mat Opening')}</span>
              </div>
              <div className="text-xl font-bold text-amber-500">
                {formatSize(calculations.matOpening.width)} x {formatSize(calculations.matOpening.height)}{calculations.unitLabel}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.frameSizer.cutOpeningForArtwork', 'Cut opening for artwork')}
              </div>
            </div>

            {/* Mat Board Size */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.matBoard', 'Mat Board')}</span>
              </div>
              <div className="text-xl font-bold text-indigo-500">
                {formatSize(calculations.matBoard.width)} x {formatSize(calculations.matBoard.height)}{calculations.unitLabel}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.frameSizer.fullMatBoardSize', 'Full mat board size')}
              </div>
            </div>

            {/* Glass Size */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.glassGlazing', 'Glass/Glazing')}</span>
              </div>
              <div className="text-xl font-bold text-cyan-500">
                {formatSize(calculations.glass.width)} x {formatSize(calculations.glass.height)}{calculations.unitLabel}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.frameSizer.glassOrAcrylicSize', 'Glass or acrylic size')}
              </div>
            </div>

            {/* Backing Board */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.backingBoard', 'Backing Board')}</span>
              </div>
              <div className="text-xl font-bold text-emerald-500">
                {formatSize(calculations.backing.width)} x {formatSize(calculations.backing.height)}{calculations.unitLabel}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.frameSizer.foamCoreOrCardboard', 'Foam core or cardboard')}
              </div>
            </div>
          </div>

          {/* Frame Outer Size - Highlighted */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-100 border-indigo-300'} border`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Frame className="w-5 h-5 text-indigo-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.frameOuterSize', 'Frame Outer Size')}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-500">
              {formatSize(calculations.frameOuter.width)} x {formatSize(calculations.frameOuter.height)}{calculations.unitLabel}
            </div>
            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.frameSizer.totalFrameDimensionsIncludingMolding', 'Total frame dimensions including molding')}
            </div>
          </div>

          {/* Frame Rabbet */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frameSizer.frameRabbetSize', 'Frame Rabbet Size')}</span>
            </div>
            <div className="text-xl font-bold text-purple-500">
              {formatSize(calculations.frameRabbet.width)} x {formatSize(calculations.frameRabbet.height)}{calculations.unitLabel}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.frameSizer.innerEdgeWhereContentsSit', 'Inner edge where contents sit')}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.frameSizer.framingTips', 'Framing Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Mat width should be proportional to artwork size</li>
                <li>• Use acid-free mat board for valuable art</li>
                <li>• Consider UV-protective glass for sun exposure</li>
                <li>• Leave 1/8" clearance in rabbet for expansion</li>
                <li>• Bottom mat border is often slightly wider than top</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameSizerTool;
