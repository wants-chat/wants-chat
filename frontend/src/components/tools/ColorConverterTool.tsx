import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
}

interface ColorConverterToolProps {
  uiConfig?: UIConfig;
}

const ColorConverterTool: React.FC<ColorConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [color, setColor] = useState<string>('#0D9488');
  const [formats, setFormats] = useState<ColorFormats>({ hex: '', rgb: '', hsl: '' });
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      const textContent = params.text || params.content || '';
      if (textContent) {
        // Try to extract a hex color from the text
        const hexMatch = textContent.match(/#[0-9A-Fa-f]{6}/);
        if (hexMatch) {
          setColor(hexMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
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

  useEffect(() => {
    const rgb = hexToRgb(color);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setFormats({
        hex: color.toUpperCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      });
    }
  }, [color]);

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const FormatCard = ({ label, value, format }: { label: string; value: string; format: string }) => (
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <button
          onClick={() => copyToClipboard(value, format)}
          className={`p-1.5 rounded ${
            isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
          } transition-colors`}
          title="Copy to clipboard"
        >
          {copiedFormat === format ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </button>
      </div>
      <code
        className={`block px-3 py-2 rounded font-mono text-sm ${
          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'
        }`}
      >
        {value}
      </code>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.colorConverter.colorConverter', 'Color Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.colorConverter.convertColorsBetweenHexRgb', 'Convert colors between HEX, RGB, and HSL formats')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.colorConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Color Picker Section */}
          <div className="mb-8">
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.colorConverter.pickAColor', 'Pick a Color')}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-24 h-24 rounded-lg cursor-pointer border-4 border-gray-300"
                  style={{ borderColor: isDarkMode ? '#4B5563' : '#D1D5DB' }}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      setColor(value);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono`}
                  placeholder={t('tools.colorConverter.rrggbb', '#RRGGBB')}
                  maxLength={7}
                />
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {t('tools.colorConverter.enterAHexColorCode', 'Enter a hex color code (e.g., #0D9488)')}
                </p>
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mb-8">
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.colorConverter.colorPreview', 'Color Preview')}
            </label>
            <div
              className="w-full h-32 rounded-lg shadow-inner border-2"
              style={{
                backgroundColor: color,
                borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
              }}
            />
          </div>

          {/* Format Cards */}
          <div className="space-y-4">
            <FormatCard label="HEX" value={formats.hex} format="hex" />
            <FormatCard label="RGB" value={formats.rgb} format="rgb" />
            <FormatCard label="HSL" value={formats.hsl} format="hsl" />
          </div>

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('tools.colorConverter.aboutColorFormats', 'About Color Formats')}
            </p>
            <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p><strong>{t('tools.colorConverter.hex', 'HEX:')}</strong> {t('tools.colorConverter.hexadecimalNotationEGRrggbb', 'Hexadecimal notation (e.g., #RRGGBB)')}</p>
              <p><strong>RGB:</strong> {t('tools.colorConverter.redGreenBlueValues0', 'Red, Green, Blue values (0-255)')}</p>
              <p><strong>HSL:</strong> Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorConverterTool;
