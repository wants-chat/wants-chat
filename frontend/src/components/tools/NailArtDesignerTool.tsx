import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Sparkles, Clock, Layers, Info, Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type NailShape = 'round' | 'square' | 'oval' | 'almond' | 'stiletto' | 'coffin' | 'squoval' | 'ballerina';

type PolishType = 'regular' | 'gel' | 'dip' | 'acrylic' | 'shellac';

interface ShapeConfig {
  name: string;
  description: string;
  bestFor: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface DesignPattern {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  colors: number; // minimum colors needed
}

interface PolishLayer {
  type: 'base' | 'color' | 'design' | 'top';
  name: string;
  dryTime: number; // in minutes
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'nailShape',
    header: 'Nail Shape',
    type: 'string',
  },
  {
    key: 'polishType',
    header: 'Polish Type',
    type: 'string',
  },
  {
    key: 'designPattern',
    header: 'Design Pattern',
    type: 'string',
  },
  {
    key: 'selectedColors',
    header: 'Colors',
    type: 'string',
  },
  {
    key: 'colorLayers',
    header: 'Color Layers',
    type: 'number',
  },
  {
    key: 'totalDryTime',
    header: 'Total Dry Time (min)',
    type: 'number',
  },
  {
    key: 'totalLayers',
    header: 'Total Layers',
    type: 'number',
  },
];

interface NailArtDesignerToolProps {
  uiConfig?: UIConfig;
}

export const NailArtDesignerTool: React.FC<NailArtDesignerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedShape, setSelectedShape] = useState<NailShape>('almond');
  const [selectedColors, setSelectedColors] = useState<string[]>(['#E91E63', '#9C27B0']);
  const [selectedPattern, setSelectedPattern] = useState<string>('french');
  const [polishType, setPolishType] = useState<PolishType>('regular');
  const [colorLayers, setColorLayers] = useState(2);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.nailShape && ['round', 'square', 'oval', 'almond', 'stiletto', 'coffin', 'squoval', 'ballerina'].includes(params.nailShape)) {
        setSelectedShape(params.nailShape as NailShape);
        hasChanges = true;
      }
      if (params.pattern) {
        setSelectedPattern(params.pattern);
        hasChanges = true;
      }
      if (params.polishType && ['regular', 'gel', 'dip', 'acrylic', 'shellac'].includes(params.polishType)) {
        setPolishType(params.polishType as PolishType);
        hasChanges = true;
      }
      if (params.colorLayers && typeof params.colorLayers === 'number' && params.colorLayers >= 1 && params.colorLayers <= 3) {
        setColorLayers(params.colorLayers);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const shapes: Record<NailShape, ShapeConfig> = {
    round: {
      name: 'Round',
      description: 'Classic and natural looking',
      bestFor: 'Short nails, everyday wear',
      difficulty: 'Easy',
    },
    square: {
      name: 'Square',
      description: 'Sharp, straight edges',
      bestFor: 'Wide nail beds, bold looks',
      difficulty: 'Medium',
    },
    oval: {
      name: 'Oval',
      description: 'Elongated and feminine',
      bestFor: 'Making fingers look slimmer',
      difficulty: 'Easy',
    },
    almond: {
      name: 'Almond',
      description: 'Tapered with rounded tip',
      bestFor: 'Elegant, professional looks',
      difficulty: 'Medium',
    },
    stiletto: {
      name: 'Stiletto',
      description: 'Dramatic pointed tips',
      bestFor: 'Statement nails, special events',
      difficulty: 'Hard',
    },
    coffin: {
      name: 'Coffin/Ballerina',
      description: 'Tapered with flat tip',
      bestFor: 'Trendy designs, long nails',
      difficulty: 'Hard',
    },
    squoval: {
      name: 'Squoval',
      description: 'Square with rounded edges',
      bestFor: 'Best of both worlds',
      difficulty: 'Easy',
    },
    ballerina: {
      name: 'Ballerina',
      description: 'Similar to coffin, elegant',
      bestFor: 'Dance, formal events',
      difficulty: 'Hard',
    },
  };

  const colorPalettes = [
    { name: 'Classic Reds', colors: ['#8B0000', '#DC143C', '#FF6B6B', '#FFB6C1'] },
    { name: 'Nude & Natural', colors: ['#F5DEB3', '#DEB887', '#D2B48C', '#BC8F8F'] },
    { name: 'Berry Tones', colors: ['#8B008B', '#9932CC', '#BA55D3', '#DDA0DD'] },
    { name: 'Ocean Blues', colors: ['#000080', '#4169E1', '#87CEEB', '#E0FFFF'] },
    { name: 'Earth Tones', colors: ['#8B4513', '#A0522D', '#CD853F', '#F4A460'] },
    { name: 'Pastels', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'] },
    { name: 'Bold & Bright', colors: ['#FF1493', '#00FF00', '#FF4500', '#FFD700'] },
    { name: 'Metallics', colors: ['#FFD700', '#C0C0C0', '#B87333', '#E5E4E2'] },
  ];

  const designPatterns: DesignPattern[] = [
    { id: 'solid', name: 'Solid Color', description: 'Single color all over', difficulty: 'Beginner', colors: 1 },
    { id: 'french', name: 'French Tips', description: 'White tips with nude base', difficulty: 'Beginner', colors: 2 },
    { id: 'ombre', name: 'Ombre/Gradient', description: 'Smooth color transition', difficulty: 'Intermediate', colors: 2 },
    { id: 'marble', name: 'Marble Effect', description: 'Swirled stone pattern', difficulty: 'Advanced', colors: 3 },
    { id: 'geometric', name: 'Geometric', description: 'Lines, shapes, angles', difficulty: 'Intermediate', colors: 2 },
    { id: 'floral', name: 'Floral', description: 'Flower designs', difficulty: 'Advanced', colors: 3 },
    { id: 'glitter', name: 'Glitter Accent', description: 'Sparkly highlights', difficulty: 'Beginner', colors: 1 },
    { id: 'abstract', name: 'Abstract Art', description: 'Free-form artistic', difficulty: 'Intermediate', colors: 3 },
    { id: 'dotwork', name: 'Dot Art', description: 'Polka dots pattern', difficulty: 'Beginner', colors: 2 },
    { id: 'stamping', name: 'Nail Stamping', description: 'Stamped designs', difficulty: 'Intermediate', colors: 2 },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft, blended look', difficulty: 'Advanced', colors: 3 },
    { id: 'negative', name: 'Negative Space', description: 'Bare nail showing', difficulty: 'Intermediate', colors: 1 },
  ];

  const polishDryTimes: Record<PolishType, { base: number; color: number; top: number; cure: boolean }> = {
    regular: { base: 2, color: 3, top: 5, cure: false },
    gel: { base: 1, color: 2, top: 2, cure: true },
    dip: { base: 1, color: 0, top: 2, cure: false },
    acrylic: { base: 5, color: 3, top: 5, cure: false },
    shellac: { base: 1, color: 2, top: 2, cure: true },
  };

  const selectedPatternConfig = designPatterns.find(p => p.id === selectedPattern);
  const shapeConfig = shapes[selectedShape];

  const layeringOrder = useMemo((): PolishLayer[] => {
    const times = polishDryTimes[polishType];
    const layers: PolishLayer[] = [
      { type: 'base', name: 'Base Coat', dryTime: times.base },
    ];

    for (let i = 0; i < colorLayers; i++) {
      layers.push({ type: 'color', name: `Color Layer ${i + 1}`, dryTime: times.color });
    }

    if (selectedPatternConfig && selectedPatternConfig.id !== 'solid') {
      layers.push({ type: 'design', name: 'Design/Art Layer', dryTime: times.color });
    }

    layers.push({ type: 'top', name: 'Top Coat', dryTime: times.top });

    return layers;
  }, [polishType, colorLayers, selectedPatternConfig]);

  const totalDryTime = useMemo(() => {
    const times = polishDryTimes[polishType];
    if (times.cure) {
      // UV/LED curing is much faster
      return layeringOrder.length * 2; // ~2 min per layer with curing
    }
    return layeringOrder.reduce((acc, layer) => acc + layer.dryTime, 0);
  }, [layeringOrder, polishType]);

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter(c => c !== color));
      }
    } else {
      if (selectedColors.length < 4) {
        setSelectedColors([...selectedColors, color]);
      }
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const designPatternName = designPatterns.find(p => p.id === selectedPattern)?.name || selectedPattern;
    const dataToExport = [{
      nailShape: shapeConfig.name,
      polishType: polishType,
      designPattern: designPatternName,
      selectedColors: selectedColors.join(', '),
      colorLayers: colorLayers,
      totalDryTime: totalDryTime,
      totalLayers: layeringOrder.length,
    }];
    exportToCSV(dataToExport, COLUMNS, { filename: 'nail-art-design' });
  };

  const handleExportExcel = () => {
    const designPatternName = designPatterns.find(p => p.id === selectedPattern)?.name || selectedPattern;
    const dataToExport = [{
      nailShape: shapeConfig.name,
      polishType: polishType,
      designPattern: designPatternName,
      selectedColors: selectedColors.join(', '),
      colorLayers: colorLayers,
      totalDryTime: totalDryTime,
      totalLayers: layeringOrder.length,
    }];
    exportToExcel(dataToExport, COLUMNS, { filename: 'nail-art-design' });
  };

  const handleExportJSON = () => {
    const designPatternName = designPatterns.find(p => p.id === selectedPattern)?.name || selectedPattern;
    const dataToExport = [{
      nailShape: shapeConfig.name,
      polishType: polishType,
      designPattern: designPatternName,
      selectedColors: selectedColors.join(', '),
      colorLayers: colorLayers,
      totalDryTime: totalDryTime,
      totalLayers: layeringOrder.length,
    }];
    exportToJSON(dataToExport, { filename: 'nail-art-design' });
  };

  const handleExportPDF = async () => {
    const designPatternName = designPatterns.find(p => p.id === selectedPattern)?.name || selectedPattern;
    const dataToExport = [{
      nailShape: shapeConfig.name,
      polishType: polishType,
      designPattern: designPatternName,
      selectedColors: selectedColors.join(', '),
      colorLayers: colorLayers,
      totalDryTime: totalDryTime,
      totalLayers: layeringOrder.length,
    }];
    await exportToPDF(dataToExport, COLUMNS, {
      filename: 'nail-art-design',
      title: `Nail Art Design - ${shapeConfig.name} ${designPatternName}`,
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    const designPatternName = designPatterns.find(p => p.id === selectedPattern)?.name || selectedPattern;
    const dataToExport = [{
      nailShape: shapeConfig.name,
      polishType: polishType,
      designPattern: designPatternName,
      selectedColors: selectedColors.join(', '),
      colorLayers: colorLayers,
      totalDryTime: totalDryTime,
      totalLayers: layeringOrder.length,
    }];
    printData(dataToExport, COLUMNS, {
      title: `Nail Art Design - ${shapeConfig.name} ${designPatternName}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const designPatternName = designPatterns.find(p => p.id === selectedPattern)?.name || selectedPattern;
    const dataToExport = [{
      nailShape: shapeConfig.name,
      polishType: polishType,
      designPattern: designPatternName,
      selectedColors: selectedColors.join(', '),
      colorLayers: colorLayers,
      totalDryTime: totalDryTime,
      totalLayers: layeringOrder.length,
    }];
    return await copyUtil(dataToExport, COLUMNS, 'tab');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Sparkles className="w-5 h-5 text-pink-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nailArtDesigner.nailArtDesigner', 'Nail Art Designer')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.nailArtDesigner.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nailArtDesigner.planYourPerfectNailArt', 'Plan your perfect nail art design')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Nail Shape Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.nailArtDesigner.nailShape', 'Nail Shape')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(shapes) as NailShape[]).map((shape) => (
              <button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                className={`py-2 px-3 rounded-lg text-sm ${selectedShape === shape ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {shapes[shape].name}
              </button>
            ))}
          </div>
        </div>

        {/* Shape Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{shapeConfig.name}</h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              shapeConfig.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
              shapeConfig.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {shapeConfig.difficulty}
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{shapeConfig.description}</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span className="font-medium">{t('tools.nailArtDesigner.bestFor', 'Best for:')}</span> {shapeConfig.bestFor}
          </p>
        </div>

        {/* Color Palette Picker */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Palette className="w-4 h-4 inline mr-1" />
            {t('tools.nailArtDesigner.colorPaletteSelectUpTo', 'Color Palette (select up to 4)')}
          </label>
          {colorPalettes.map((palette) => (
            <div key={palette.name} className="space-y-1">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{palette.name}</span>
              <div className="flex gap-2">
                {palette.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      selectedColors.includes(color)
                        ? 'border-pink-500 scale-110 shadow-lg'
                        : isDark ? 'border-gray-600' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColors.includes(color) && (
                      <Heart className="w-4 h-4 mx-auto text-white drop-shadow" fill="white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Colors Display */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.nailArtDesigner.yourSelectedColors', 'Your Selected Colors')}
          </div>
          <div className="flex gap-3">
            {selectedColors.map((color, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-xs mt-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {color.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Design Pattern Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.nailArtDesigner.designPattern', 'Design Pattern')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {designPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern.id)}
                className={`py-2 px-3 rounded-lg text-sm text-left ${
                  selectedPattern === pattern.id
                    ? 'bg-pink-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-medium">{pattern.name}</div>
                <div className={`text-xs ${selectedPattern === pattern.id ? 'text-pink-100' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {pattern.difficulty}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Info */}
        {selectedPatternConfig && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPatternConfig.name}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedPatternConfig.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-500' :
                selectedPatternConfig.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {selectedPatternConfig.difficulty}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPatternConfig.description}</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Minimum colors needed: {selectedPatternConfig.colors}
            </p>
          </div>
        )}

        {/* Polish Type Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.nailArtDesigner.polishType', 'Polish Type')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(['regular', 'gel', 'dip', 'acrylic', 'shellac'] as PolishType[]).map((type) => (
              <button
                key={type}
                onClick={() => setPolishType(type)}
                className={`py-2 px-3 rounded-lg text-sm capitalize ${
                  polishType === type
                    ? 'bg-pink-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Color Layers */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.nailArtDesigner.colorCoatLayers', 'Color Coat Layers')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setColorLayers(num)}
                className={`flex-1 py-2 rounded-lg ${
                  colorLayers === num
                    ? 'bg-pink-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {num} {num === 1 ? t('tools.nailArtDesigner.layer', 'Layer') : t('tools.nailArtDesigner.layers', 'Layers')}
              </button>
            ))}
          </div>
        </div>

        {/* Polish Layering Order */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-pink-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nailArtDesigner.applicationOrder', 'Application Order')}</span>
          </div>
          <div className="space-y-2">
            {layeringOrder.map((layer, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-white'
                } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    layer.type === 'base' ? 'bg-blue-500/20 text-blue-500' :
                    layer.type === 'color' ? 'bg-pink-500/20 text-pink-500' :
                    layer.type === 'design' ? 'bg-purple-500/20 text-purple-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{layer.name}</span>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {polishDryTimes[polishType].cure ? 'Cure' : `${layer.dryTime} min`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Drying Time Calculator */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-pink-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nailArtDesigner.totalTime', 'Total Time')}</span>
            </div>
            <div className="text-3xl font-bold text-pink-500">{totalDryTime} min</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {polishDryTimes[polishType].cure ? t('tools.nailArtDesigner.withUvLedCuring', 'With UV/LED curing') : t('tools.nailArtDesigner.airDryBetweenLayers', 'Air dry between layers')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nailArtDesigner.totalLayers', 'Total Layers')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{layeringOrder.length}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.nailArtDesigner.includingBaseAndTopCoat', 'Including base and top coat')}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.nailArtDesigner.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Always start with clean, dry nails</li>
                <li>• Apply thin, even coats for best results</li>
                <li>• Let each layer dry completely before the next</li>
                <li>• Seal edges with top coat to prevent chipping</li>
                <li>• Use cuticle oil daily for healthy nails</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NailArtDesignerTool;
