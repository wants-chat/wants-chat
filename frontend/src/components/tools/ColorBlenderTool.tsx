import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Blend, Copy, Check, Plus, Minus, Sparkles } from 'lucide-react';
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

interface ColorBlenderToolProps {
  uiConfig?: UIConfig;
}

interface Color {
  id: string;
  hex: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'hex', header: 'Color (Hex)' },
  { key: 'index', header: 'Position' },
];

export const ColorBlenderTool: React.FC<ColorBlenderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.colors) setColors(params.colors);
      if (params.steps) setSteps(params.steps);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const [colors, setColors] = useState<Color[]>([
    { id: '1', hex: '#FF6B6B' },
    { id: '2', hex: '#4ECDC4' },
  ]);
  const [steps, setSteps] = useState(5);
  const [copied, setCopied] = useState('');

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const blendedColors = useMemo(() => {
    if (colors.length < 2) return [];

    const rgbColors = colors.map(c => hexToRgb(c.hex));
    const totalSteps = steps + (colors.length - 1);
    const stepsPerSegment = steps;

    const result: string[] = [];

    for (let i = 0; i < colors.length - 1; i++) {
      const start = rgbColors[i];
      const end = rgbColors[i + 1];

      for (let j = 0; j <= stepsPerSegment; j++) {
        if (i > 0 && j === 0) continue; // Skip first step for segments after first

        const ratio = j / stepsPerSegment;
        const r = start.r + (end.r - start.r) * ratio;
        const g = start.g + (end.g - start.g) * ratio;
        const b = start.b + (end.b - start.b) * ratio;

        result.push(rgbToHex(r, g, b));
      }
    }

    return result;
  }, [colors, steps]);

  const mixedColor = useMemo(() => {
    if (colors.length === 0) return '#000000';

    const rgbColors = colors.map(c => hexToRgb(c.hex));
    const avg = {
      r: rgbColors.reduce((sum, c) => sum + c.r, 0) / rgbColors.length,
      g: rgbColors.reduce((sum, c) => sum + c.g, 0) / rgbColors.length,
      b: rgbColors.reduce((sum, c) => sum + c.b, 0) / rgbColors.length,
    };

    return rgbToHex(avg.r, avg.g, avg.b);
  }, [colors]);

  const addColor = () => {
    setColors([...colors, { id: Date.now().toString(), hex: '#9B59B6' }]);
  };

  const removeColor = (id: string) => {
    if (colors.length > 2) {
      setColors(colors.filter(c => c.id !== id));
    }
  };

  const updateColor = (id: string, hex: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, hex } : c));
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(''), 2000);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const presetPalettes = [
    { name: 'Sunset', colors: ['#FF6B6B', '#FFC85C'] },
    { name: 'Ocean', colors: ['#4ECDC4', '#2C3E50'] },
    { name: 'Forest', colors: ['#27AE60', '#2ECC71', '#1ABC9C'] },
    { name: 'Rainbow', colors: ['#E74C3C', '#F39C12', '#27AE60', '#3498DB', '#9B59B6'] },
  ];

  // Export handlers
  const exportData = useMemo(() => {
    return blendedColors.map((hex, index) => ({
      hex,
      index: index + 1,
    }));
  }, [blendedColors]);

  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'color-blender-palette' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'color-blender-palette' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'color-blender-palette' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'color-blender-palette',
      title: 'Color Blender Palette',
      subtitle: `${steps} steps blend of ${colors.length} colors`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, { title: 'Color Blender Palette' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, COLUMNS, 'tab');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Blend className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.colorBlender.colorBlender', 'Color Blender')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.colorBlender.blendColorsToCreateGradients', 'Blend colors to create gradients')}</p>
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
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-pink-900/20 border border-pink-800' : 'bg-pink-50 border border-pink-200'}`}>
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className={`text-sm ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
            {t('tools.colorBlender.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Preset Palettes */}
        <div className="flex flex-wrap gap-2">
          {presetPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => setColors(palette.colors.map((c, i) => ({ id: String(i), hex: c })))}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="flex -space-x-1">
                {palette.colors.slice(0, 3).map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              {palette.name}
            </button>
          ))}
        </div>

        {/* Color Inputs */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.colorBlender.colorsToBlend', 'Colors to Blend')}
          </label>
          {colors.map((color, index) => (
            <div key={color.id} className="flex items-center gap-3">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateColor(color.id, e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={color.hex}
                onChange={(e) => updateColor(color.id, e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border font-mono ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button
                onClick={() => handleCopy(color.hex)}
                className={`p-2 rounded-lg transition-colors ${
                  copied === color.hex ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {copied === color.hex ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              {colors.length > 2 && (
                <button
                  onClick={() => removeColor(color.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addColor}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'border-gray-700 hover:border-gray-600 text-gray-400' : 'border-gray-300 hover:border-gray-400 text-gray-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.colorBlender.addColor', 'Add Color')}
          </button>
        </div>

        {/* Steps Slider */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Gradient Steps: {steps}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* Mixed Color */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.colorBlender.mixedColor', 'Mixed Color')}</div>
              <div className={`text-xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {mixedColor}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-lg shadow-lg" style={{ backgroundColor: mixedColor }} />
              <button
                onClick={() => handleCopy(mixedColor)}
                className={`p-2 rounded-lg transition-colors ${
                  copied === mixedColor ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {copied === mixedColor ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Gradient Preview */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.colorBlender.gradientPreview', 'Gradient Preview')}
          </label>
          <div
            className="h-16 rounded-xl"
            style={{
              background: `linear-gradient(to right, ${colors.map(c => c.hex).join(', ')})`,
            }}
          />
        </div>

        {/* Blended Colors */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Color Steps ({blendedColors.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {blendedColors.map((hex, index) => (
              <button
                key={index}
                onClick={() => handleCopy(hex)}
                className="group relative"
              >
                <div
                  className="w-12 h-12 rounded-lg shadow-md transition-transform hover:scale-110"
                  style={{ backgroundColor: hex }}
                />
                <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {copied === hex ? 'Copied!' : hex}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CSS Gradient */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.colorBlender.cssGradient', 'CSS Gradient')}</span>
            <button
              onClick={() => handleCopy(`linear-gradient(to right, ${colors.map(c => c.hex).join(', ')})`)}
              className={`p-1 rounded transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <code className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            linear-gradient(to right, {colors.map(c => c.hex).join(', ')})
          </code>
        </div>
      </div>
    </div>
  );
};

export default ColorBlenderTool;
