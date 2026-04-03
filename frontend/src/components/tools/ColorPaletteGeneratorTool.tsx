import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Copy, Check, RefreshCw, Lock, Unlock, Download, Sparkles } from 'lucide-react';
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

interface ColorItem {
  hex: string;
  locked: boolean;
}

type PaletteMode = 'random' | 'analogous' | 'complementary' | 'triadic' | 'monochromatic';

interface ColorPaletteGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const ColorPaletteGeneratorTool: React.FC<ColorPaletteGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  const [colors, setColors] = useState<ColorItem[]>([
    { hex: '#FF6B6B', locked: false },
    { hex: '#4ECDC4', locked: false },
    { hex: '#45B7D1', locked: false },
    { hex: '#96CEB4', locked: false },
    { hex: '#FFEAA7', locked: false },
  ]);
  const [copied, setCopied] = useState<string | null>(null);
  const [mode, setMode] = useState<PaletteMode>('random');

  const generateRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
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

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const generatePalette = useCallback(() => {
    const baseColor = colors.find(c => c.locked)?.hex || generateRandomColor();
    const { h, s, l } = hexToHSL(baseColor);

    let newColors: string[] = [];

    switch (mode) {
      case 'analogous':
        newColors = [
          hslToHex(h - 30, s, l),
          hslToHex(h - 15, s, l),
          hslToHex(h, s, l),
          hslToHex(h + 15, s, l),
          hslToHex(h + 30, s, l),
        ];
        break;

      case 'complementary':
        newColors = [
          hslToHex(h, s, l - 20),
          hslToHex(h, s, l),
          hslToHex(h, s, l + 20),
          hslToHex(h + 180, s, l),
          hslToHex(h + 180, s, l + 20),
        ];
        break;

      case 'triadic':
        newColors = [
          hslToHex(h, s, l),
          hslToHex(h, s * 0.7, l + 15),
          hslToHex(h + 120, s, l),
          hslToHex(h + 120, s * 0.7, l + 15),
          hslToHex(h + 240, s, l),
        ];
        break;

      case 'monochromatic':
        newColors = [
          hslToHex(h, s, l - 30),
          hslToHex(h, s, l - 15),
          hslToHex(h, s, l),
          hslToHex(h, s, l + 15),
          hslToHex(h, s * 0.5, l + 25),
        ];
        break;

      default: // random
        newColors = Array(5).fill(null).map(() => generateRandomColor());
    }

    setColors(colors.map((c, i) => ({
      hex: c.locked ? c.hex : newColors[i],
      locked: c.locked,
    })));
  }, [colors, mode]);

  const toggleLock = (index: number) => {
    setColors(colors.map((c, i) =>
      i === index ? { ...c, locked: !c.locked } : c
    ));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const getContrastColor = (hex: string): string => {
    const { l } = hexToHSL(hex);
    return l > 50 ? '#000000' : '#FFFFFF';
  };

  const hexToRGB = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgb(0, 0, 0)';
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
  };

  const exportPalette = () => {
    const css = colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
    const text = `/* Color Palette */\n:root {\n  ${css}\n}`;
    const blob = new Blob([text], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const modes: { value: PaletteMode; label: string }[] = [
    { value: 'random', label: 'Random' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'monochromatic', label: 'Monochromatic' },
  ];

  // Define columns for export
  const COLUMNS: ColumnConfig[] = [
    {
      key: 'index',
      header: 'Color Number',
      type: 'number',
    },
    {
      key: 'hex',
      header: 'HEX Code',
      type: 'string',
    },
    {
      key: 'rgb',
      header: 'RGB Code',
      type: 'string',
    },
    {
      key: 'hsl',
      header: 'HSL Code',
      type: 'string',
    },
    {
      key: 'locked',
      header: 'Locked',
      type: 'boolean',
    },
  ];

  // Prepare data for export
  const getExportData = () => {
    return colors.map((color, index) => {
      const hsl = hexToHSL(color.hex);
      return {
        index: index + 1,
        hex: color.hex,
        rgb: hexToRGB(color.hex),
        hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
        locked: color.locked,
      };
    });
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(getExportData(), COLUMNS, { filename: 'color-palette' });
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), COLUMNS, { filename: 'color-palette' });
  };

  const handleExportJSON = () => {
    exportToJSON(getExportData(), { filename: 'color-palette' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(getExportData(), COLUMNS, {
      filename: 'color-palette',
      title: 'Color Palette',
      subtitle: `Generated with ${mode} mode`,
    });
  };

  const handlePrint = () => {
    printData(getExportData(), COLUMNS, { title: 'Color Palette' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(getExportData(), COLUMNS, 'tab');
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Color palette can prefill a base color if provided
      const colorContent = params.text || params.content || '';
      if (colorContent && /^#[0-9A-Fa-f]{6}$/.test(colorContent)) {
        setColors(prev => prev.map((c, i) => i === 0 ? { hex: colorContent.toUpperCase(), locked: true } : c));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

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

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-rose-900/20' : 'bg-gradient-to-r from-white to-rose-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Palette className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.colorPaletteGenerator.colorPaletteGenerator', 'Color Palette Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.colorPaletteGenerator.generateBeautifulColorCombinations', 'Generate beautiful color combinations')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportPalette}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Download className="w-4 h-4" />
              {t('tools.colorPaletteGenerator.exportCss', 'Export CSS')}
            </button>
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
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Selection */}
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.value
                  ? 'bg-rose-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="grid grid-cols-5 gap-3 h-48 rounded-xl overflow-hidden">
          {colors.map((color, index) => (
            <div
              key={index}
              className="relative group cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: color.hex }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleLock(index)}
                  className="p-2 rounded-full mb-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: getContrastColor(color.hex) }}
                >
                  {color.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleCopy(color.hex)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: getContrastColor(color.hex) }}
                >
                  {copied === color.hex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {color.locked && (
                <Lock
                  className="absolute top-2 right-2 w-4 h-4"
                  style={{ color: getContrastColor(color.hex) }}
                />
              )}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: getContrastColor(color.hex),
                }}
              >
                {color.hex}
              </div>
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePalette}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
        >
          <RefreshCw className="w-5 h-5" />
          {t('tools.colorPaletteGenerator.generateNewPalette', 'Generate New Palette')}
        </button>

        {/* Color Details */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.colorPaletteGenerator.colorDetails', 'Color Details')}</h4>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className="w-full text-sm">
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.colorPaletteGenerator.color', 'Color')}</th>
                  <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.colorPaletteGenerator.hex', 'HEX')}</th>
                  <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>RGB</th>
                  <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>HSL</th>
                  <th className={`px-4 py-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.colorPaletteGenerator.copy', 'Copy')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {colors.map((color, index) => {
                  const hsl = hexToHSL(color.hex);
                  return (
                    <tr key={index} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                      <td className="px-4 py-2">
                        <div
                          className="w-8 h-8 rounded-lg border"
                          style={{ backgroundColor: color.hex, borderColor: isDark ? '#374151' : '#E5E7EB' }}
                        />
                      </td>
                      <td className={`px-4 py-2 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {color.hex}
                      </td>
                      <td className={`px-4 py-2 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {hexToRGB(color.hex)}
                      </td>
                      <td className={`px-4 py-2 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        hsl({Math.round(hsl.h)}, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%)
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleCopy(color.hex)}
                          className={`p-1.5 rounded transition-colors ${
                            copied === color.hex
                              ? 'text-green-500'
                              : isDark
                              ? 'text-gray-400 hover:text-white'
                              : 'text-gray-400 hover:text-gray-900'
                          }`}
                        >
                          {copied === color.hex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tip */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.colorPaletteGenerator.tip', 'Tip:')}</strong> Click the lock icon to keep a color while generating new palettes. Press spacebar or click "Generate" to create new combinations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGeneratorTool;
