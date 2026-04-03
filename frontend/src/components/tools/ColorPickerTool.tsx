import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Palette, Check, Sparkles, Sliders } from 'lucide-react';
import { ToolContainer } from './ToolContainer';
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

interface ColorPickerToolProps {
  uiConfig?: UIConfig;
}

interface ColorFormat {
  hex: string;
  rgb: string;
  hsl: string;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

const MATERIAL_PALETTE = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
];

const TAILWIND_PALETTE = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#A855F7',
  '#F43F5E', '#EAB308', '#22C55E', '#0EA5E9', '#7C3AED', '#D946EF',
];

const COLUMNS: ColumnConfig[] = [
  { key: 'hex', header: 'HEX' },
  { key: 'rgb', header: 'RGB' },
  { key: 'hsl', header: 'HSL' },
];

export const ColorPickerTool: React.FC<ColorPickerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [color, setColor] = useState('#0D9488');
  const [colorFormats, setColorFormats] = useState<ColorFormat>({ hex: '', rgb: '', hsl: '' });
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [useCustomPicker, setUseCustomPicker] = useState(false);
  const [hslValues, setHslValues] = useState<HSLColor>({ h: 174, s: 84, l: 29 });
  const [rgbValues, setRgbValues] = useState<RGBColor>({ r: 13, g: 148, b: 136 });
  const gradientRef = useRef<HTMLDivElement>(null);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.color) setColor(data.color);
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.color) setColor(params.color);
      if (params.recentColors) setRecentColors(params.recentColors);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    updateColorFormats(color);
    addToRecent(color);
  }, [color]);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const updateColorFormats = (hexColor: string) => {
    const rgb = hexToRgb(hexColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    setColorFormats({
      hex: hexColor.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    });
  };

  const addToRecent = (newColor: string) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== newColor);
      return [newColor, ...filtered].slice(0, 12);
    });
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getComplementaryColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const compHue = (hsl.h + 180) % 360;
    return hslToHex(compHue, hsl.s, hsl.l);
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hslToRgb = (h: number, s: number, l: number): RGBColor => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  // Update HSL and RGB values when color changes
  useEffect(() => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHslValues(hsl);
    setRgbValues(rgb);
  }, [color]);

  // Handle HSL slider changes
  const handleHslChange = (key: keyof HSLColor, value: number) => {
    const newHsl = { ...hslValues, [key]: value };
    setHslValues(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setColor(newHex);
  };

  // Handle RGB input changes
  const handleRgbChange = (key: keyof RGBColor, value: number) => {
    const clampedValue = Math.max(0, Math.min(255, value));
    const newRgb = { ...rgbValues, [key]: clampedValue };
    setRgbValues(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(newHex);
  };

  const getAnalogousColors = (hex: string): string[] => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return [
      hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    ];
  };

  const complementaryColor = getComplementaryColor(color);
  const analogousColors = getAnalogousColors(color);

  // Prepare data for export
  const exportData = [colorFormats];

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'colors' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'colors' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'colors' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'colors',
      title: 'Color Picker Export',
      subtitle: `Color: ${color}`,
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, COLUMNS);
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, { title: 'Color Picker Report' });
  };

  return (
    <ToolContainer
      title={t('tools.colorPicker.colorPicker2', 'Color Picker')}
      description="Advanced color picker with multiple formats and palettes"
      icon={Palette}
    >
      {isPrefilled && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-teal-900/20 border border-teal-800">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className="text-sm text-teal-400">
            {t('tools.colorPicker.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      {/* Export Actions */}
      <div className="mb-6 flex justify-end">
        <ExportDropdown
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportJSON={handleExportJSON}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
          onCopyToClipboard={handleCopyToClipboard}
          showImport={false}
          theme="dark"
        />
      </div>

      <div className="space-y-6">
        {/* Picker Mode Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">{t('tools.colorPicker.colorPicker', 'Color Picker')}</h3>
          <button
            onClick={() => setUseCustomPicker(!useCustomPicker)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              useCustomPicker
                ? t('tools.colorPicker.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {useCustomPicker ? t('tools.colorPicker.customPicker', 'Custom Picker') : t('tools.colorPicker.nativePicker', 'Native Picker')}
          </button>
        </div>

        {/* Main Color Picker */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-24 h-24 rounded-lg cursor-pointer border-4 border-gray-600"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {t('tools.colorPicker.hexColor', 'Hex Color')}
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setColor(value);
                }
              }}
              className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Custom Color Picker Controls */}
        {useCustomPicker && (
          <div className="space-y-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            {/* HSL Sliders */}
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">HSL Controls</h4>

              {/* Hue Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <label className="text-gray-400">{t('tools.colorPicker.hue', 'Hue')}</label>
                  <span className="text-gray-300">{hslValues.h}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hslValues.h}
                  onChange={(e) => handleHslChange('h', Number(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  }}
                />
              </div>

              {/* Saturation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <label className="text-gray-400">{t('tools.colorPicker.saturation', 'Saturation')}</label>
                  <span className="text-gray-300">{hslValues.s}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hslValues.s}
                  onChange={(e) => handleHslChange('s', Number(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${hslValues.h}, 0%, ${hslValues.l}%), hsl(${hslValues.h}, 100%, ${hslValues.l}%))`,
                  }}
                />
              </div>

              {/* Lightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <label className="text-gray-400">{t('tools.colorPicker.lightness', 'Lightness')}</label>
                  <span className="text-gray-300">{hslValues.l}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hslValues.l}
                  onChange={(e) => handleHslChange('l', Number(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${hslValues.h}, ${hslValues.s}%, 0%), hsl(${hslValues.h}, ${hslValues.s}%, 50%), hsl(${hslValues.h}, ${hslValues.s}%, 100%))`,
                  }}
                />
              </div>
            </div>

            {/* RGB Inputs */}
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">RGB Values</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t('tools.colorPicker.red', 'Red')}</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t('tools.colorPicker.green', 'Green')}</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t('tools.colorPicker.blue', 'Blue')}</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview Bar */}
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">{t('tools.colorPicker.preview', 'Preview')}</h4>
              <div
                className="w-full h-12 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        )}

        {/* Color Formats */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">{t('tools.colorPicker.colorFormats', 'Color Formats')}</h3>

          {/* HEX */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('tools.colorPicker.hex', 'HEX')}</p>
                <p className="text-white font-mono">{colorFormats.hex}</p>
              </div>
              <button
                onClick={() => copyToClipboard(colorFormats.hex, 'hex')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedFormat === 'hex' ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.colorPicker.copied', 'Copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.colorPicker.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RGB */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">RGB</p>
                <p className="text-white font-mono">{colorFormats.rgb}</p>
              </div>
              <button
                onClick={() => copyToClipboard(colorFormats.rgb, 'rgb')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedFormat === 'rgb' ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.colorPicker.copied2', 'Copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.colorPicker.copy2', 'Copy')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* HSL */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">HSL</p>
                <p className="text-white font-mono">{colorFormats.hsl}</p>
              </div>
              <button
                onClick={() => copyToClipboard(colorFormats.hsl, 'hsl')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedFormat === 'hsl' ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.colorPicker.copied3', 'Copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.colorPicker.copy3', 'Copy')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Color Harmony */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">{t('tools.colorPicker.colorHarmony', 'Color Harmony')}</h3>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">{t('tools.colorPicker.complementary', 'Complementary')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setColor(color)}
                className="flex-1 h-12 rounded-lg border-2 border-white"
                style={{ backgroundColor: color }}
                title={color}
              />
              <button
                onClick={() => setColor(complementaryColor)}
                className="flex-1 h-12 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                style={{ backgroundColor: complementaryColor }}
                title={complementaryColor}
              />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">{t('tools.colorPicker.analogous', 'Analogous')}</p>
            <div className="flex gap-2">
              {analogousColors.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setColor(c)}
                  className="flex-1 h-12 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <button
                onClick={() => setColor(color)}
                className="flex-1 h-12 rounded-lg border-2 border-white"
                style={{ backgroundColor: color }}
                title={color}
              />
            </div>
          </div>
        </div>

        {/* Material Palette */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">{t('tools.colorPicker.materialDesignColors', 'Material Design Colors')}</h3>
          <div className="grid grid-cols-6 gap-2">
            {MATERIAL_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-10 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Tailwind Palette */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">{t('tools.colorPicker.tailwindCssColors', 'Tailwind CSS Colors')}</h3>
          <div className="grid grid-cols-6 gap-2">
            {TAILWIND_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-10 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold">{t('tools.colorPicker.recentColors', 'Recent Colors')}</h3>
            <div className="grid grid-cols-6 gap-2">
              {recentColors.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setColor(c)}
                  className="h-10 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
