import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Plus, Trash2, Copy, Check, Droplet, Sparkles } from 'lucide-react';
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

interface ColorMixerToolProps {
  uiConfig?: UIConfig;
}

interface ColorStop {
  id: string;
  color: string;
  weight: number;
}

export const ColorMixerTool: React.FC<ColorMixerToolProps> = ({ uiConfig }) => {
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
      if (params.mode) setMode(params.mode);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const [colors, setColors] = useState<ColorStop[]>([
    { id: '1', color: '#FF6B6B', weight: 50 },
    { id: '2', color: '#4ECDC4', weight: 50 },
  ]);
  const [copied, setCopied] = useState('');
  const [mode, setMode] = useState<'rgb' | 'hsl'>('rgb');

  // Column configuration for exports
  const COLUMNS: ColumnConfig[] = [
    { key: 'color', header: 'Color (HEX)' },
    { key: 'weight', header: 'Weight (%)', type: 'number' },
  ];

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const mixedColor = useMemo(() => {
    if (colors.length === 0) return { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };

    const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };

    let r = 0, g = 0, b = 0;
    colors.forEach(c => {
      const rgb = hexToRgb(c.color);
      const normalizedWeight = c.weight / totalWeight;
      r += rgb.r * normalizedWeight;
      g += rgb.g * normalizedWeight;
      b += rgb.b * normalizedWeight;
    });

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    return {
      hex,
      rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
      hsl,
    };
  }, [colors]);

  const addColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setColors([...colors, { id: Date.now().toString(), color: randomColor, weight: 50 }]);
  };

  const removeColor = (id: string) => {
    if (colors.length > 1) {
      setColors(colors.filter(c => c.id !== id));
    }
  };

  const updateColor = (id: string, field: keyof ColorStop, value: string | number) => {
    setColors(colors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const presetPalettes = [
    { name: 'Sunset', colors: ['#FF6B6B', '#FFA07A', '#FFD700'] },
    { name: 'Ocean', colors: ['#1E90FF', '#00CED1', '#20B2AA'] },
    { name: 'Forest', colors: ['#228B22', '#32CD32', '#90EE90'] },
    { name: 'Berry', colors: ['#8B008B', '#FF1493', '#FF69B4'] },
  ];

  const applyPalette = (palette: string[]) => {
    setColors(palette.map((color, idx) => ({
      id: Date.now().toString() + idx,
      color,
      weight: 100 / palette.length,
    })));
  };

  // Export handlers
  const handleExportCSV = () => {
    const exportData = colors.map(c => ({
      color: c.color.toUpperCase(),
      weight: c.weight,
    }));
    exportToCSV(exportData, COLUMNS, { filename: 'color-mixer' });
  };

  const handleExportExcel = () => {
    const exportData = colors.map(c => ({
      color: c.color.toUpperCase(),
      weight: c.weight,
    }));
    exportToExcel(exportData, COLUMNS, { filename: 'color-mixer' });
  };

  const handleExportJSON = () => {
    const exportData = {
      colors: colors.map(c => ({
        color: c.color.toUpperCase(),
        weight: c.weight,
      })),
      mixed: {
        hex: mixedColor.hex.toUpperCase(),
        rgb: mixedColor.rgb,
        hsl: mixedColor.hsl,
      },
    };
    exportToJSON([exportData], { filename: 'color-mixer' });
  };

  const handleExportPDF = async () => {
    const exportData = colors.map(c => ({
      color: c.color.toUpperCase(),
      weight: c.weight,
    }));
    await exportToPDF(exportData, COLUMNS, {
      filename: 'color-mixer',
      title: 'Color Mixer Report',
      subtitle: `Mixed Result: ${mixedColor.hex.toUpperCase()}`,
    });
  };

  const handlePrint = () => {
    const exportData = colors.map(c => ({
      color: c.color.toUpperCase(),
      weight: c.weight,
    }));
    printData(exportData, COLUMNS, { title: 'Color Mixer Report' });
  };

  const handleCopyToClipboard = async () => {
    const exportData = colors.map(c => ({
      color: c.color.toUpperCase(),
      weight: c.weight,
    }));
    return await copyUtil(exportData, COLUMNS, 'tab');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Palette className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.colorMixer.colorMixer', 'Color Mixer')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.colorMixer.mixColorsWithWeightedBlending', 'Mix colors with weighted blending')}</p>
            </div>
          </div>
          <ExportDropdown
            theme={isDark ? 'dark' : 'light'}
            showImport={false}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
          />
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
            {t('tools.colorMixer.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Preset Palettes */}
        <div className="flex gap-2 flex-wrap">
          {presetPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPalette(palette.colors)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex -space-x-1">
                {palette.colors.map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              {palette.name}
            </button>
          ))}
        </div>

        {/* Color Inputs */}
        <div className="space-y-3">
          {colors.map((color, idx) => (
            <div key={color.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color.color}
                    onChange={(e) => updateColor(color.id, 'color', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={color.color.toUpperCase()}
                    onChange={(e) => updateColor(color.id, 'color', e.target.value)}
                    className={`w-24 px-3 py-2 rounded-lg border font-mono text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.colorMixer.weight', 'Weight')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{color.weight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={color.weight}
                    onChange={(e) => updateColor(color.id, 'weight', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                {colors.length > 1 && (
                  <button onClick={() => removeColor(color.id)} className="text-red-400 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addColor}
            className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
          >
            <Plus className="w-4 h-4" /> Add Color
          </button>
        </div>

        {/* Mixed Color Result */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center gap-6">
            <div
              className="w-32 h-32 rounded-xl shadow-lg"
              style={{ backgroundColor: mixedColor.hex }}
            />
            <div className="flex-1 space-y-3">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.colorMixer.mixedColor', 'Mixed Color')}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {mixedColor.hex.toUpperCase()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(mixedColor.hex)}
                    className={`p-1.5 rounded ${copied === mixedColor.hex ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {copied === mixedColor.hex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  RGB({mixedColor.rgb.r}, {mixedColor.rgb.g}, {mixedColor.rgb.b})
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  HSL({mixedColor.hsl.h}°, {mixedColor.hsl.s}%, {mixedColor.hsl.l}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Formats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'HEX', value: mixedColor.hex.toUpperCase() },
            { label: 'RGB', value: `rgb(${mixedColor.rgb.r}, ${mixedColor.rgb.g}, ${mixedColor.rgb.b})` },
            { label: 'HSL', value: `hsl(${mixedColor.hsl.h}, ${mixedColor.hsl.s}%, ${mixedColor.hsl.l}%)` },
          ].map((format) => (
            <button
              key={format.label}
              onClick={() => copyToClipboard(format.value)}
              className={`p-3 rounded-lg text-left ${copied === format.value ? 'bg-green-500/20 ring-1 ring-green-500' : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{format.label}</div>
              <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{format.value}</div>
            </button>
          ))}
        </div>

        {/* Visualization */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-4 h-4 text-purple-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.colorMixer.colorBlendVisualization', 'Color Blend Visualization')}</h4>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {colors.map((color) => (
              <div
                key={color.id}
                style={{ backgroundColor: color.color, width: `${color.weight}%` }}
              />
            ))}
          </div>
          <div className="flex h-8 mt-2 rounded-lg overflow-hidden">
            <div className="w-full" style={{ backgroundColor: mixedColor.hex }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMixerTool;
