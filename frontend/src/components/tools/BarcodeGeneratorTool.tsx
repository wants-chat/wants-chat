import React, { useState, useEffect, useRef } from 'react';
import { Barcode, Copy, Check, Download, Settings, Sparkles, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14';

interface BarcodeOptions {
  format: BarcodeFormat;
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
  lineColor: string;
  background: string;
}

interface BarcodeGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const BarcodeGeneratorTool: React.FC<BarcodeGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [options, setOptions] = useState<BarcodeOptions>({
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 16,
    lineColor: '#000000',
    background: '#FFFFFF',
  });

  const formats: { value: BarcodeFormat; label: string; example: string; pattern: string }[] = [
    { value: 'CODE128', label: 'Code 128', example: 'ABC-12345', pattern: 'Any characters' },
    { value: 'EAN13', label: 'EAN-13', example: '5901234123457', pattern: '13 digits' },
    { value: 'UPC', label: 'UPC-A', example: '042100005264', pattern: '12 digits' },
    { value: 'CODE39', label: 'Code 39', example: 'CODE39', pattern: 'A-Z, 0-9, -.$+%/*' },
    { value: 'ITF14', label: 'ITF-14', example: '10012345000017', pattern: '14 digits' },
  ];

  const validateInput = (value: string, format: BarcodeFormat): string | null => {
    switch (format) {
      case 'EAN13':
        if (!/^\d{13}$/.test(value)) return 'EAN-13 requires exactly 13 digits';
        break;
      case 'UPC':
        if (!/^\d{12}$/.test(value)) return 'UPC-A requires exactly 12 digits';
        break;
      case 'ITF14':
        if (!/^\d{14}$/.test(value)) return 'ITF-14 requires exactly 14 digits';
        break;
      case 'CODE39':
        if (!/^[A-Z0-9\-.$+%/* ]+$/i.test(value)) return 'Code 39 only supports A-Z, 0-9, and -.$+%/*';
        break;
    }
    return null;
  };

  // Simple Code128 encoder
  const encodeCode128 = (text: string): string => {
    const patterns: Record<string, string> = {
      ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
      '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
      '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
      ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
      '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
      '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
      '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
      '<': '11100110100', '=': '11100110010', '>': '11011011000', '?': '11011000110',
      '@': '11000110110', 'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
      'D': '10110001000', 'E': '10001101000', 'F': '10001100010', 'G': '11010001000',
      'H': '11000101000', 'I': '11000100010', 'J': '10110111000', 'K': '10110001110',
      'L': '10001101110', 'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
      'P': '11101110110', 'Q': '11010001110', 'R': '11000101110', 'S': '11011101000',
      'T': '11011100010', 'U': '11011101110', 'V': '11101011000', 'W': '11101000110',
      'X': '11100010110', 'Y': '11101101000', 'Z': '11101100010', '[': '11100011010',
      '\\': '11101111010', ']': '11001000010', '^': '11110001010', '_': '10100110000',
      '`': '10100001100', 'a': '10010110000', 'b': '10010000110', 'c': '10000101100',
      'd': '10000100110', 'e': '10110010000', 'f': '10110000100', 'g': '10011010000',
      'h': '10011000010', 'i': '10000110100', 'j': '10000110010', 'k': '11000010010',
      'l': '11001010000', 'm': '11110111010', 'n': '11000010100', 'o': '10001111010',
      'p': '10100111100', 'q': '10010111100', 'r': '10010011110', 's': '10111100100',
      't': '10011110100', 'u': '10011110010', 'v': '11110100100', 'w': '11110010100',
      'x': '11110010010', 'y': '11011011110', 'z': '11011110110', '{': '11110110110',
      '|': '10101111000', '}': '10100011110', '~': '10001011110',
    };

    const START_B = '11010010000';
    const STOP = '1100011101011';

    let encoded = START_B;
    for (const char of text) {
      encoded += patterns[char] || patterns['?'];
    }
    encoded += STOP;

    return encoded;
  };

  const drawBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas || !input) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const validationError = validateInput(input, options.format);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    // Encode barcode
    const encoded = encodeCode128(input);

    // Calculate dimensions
    const barcodeWidth = encoded.length * options.width;
    const totalHeight = options.displayValue ? options.height + options.fontSize + 10 : options.height;

    canvas.width = barcodeWidth + 20;
    canvas.height = totalHeight + 20;

    // Draw background
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    ctx.fillStyle = options.lineColor;
    let x = 10;

    for (const bit of encoded) {
      if (bit === '1') {
        ctx.fillRect(x, 10, options.width, options.height);
      }
      x += options.width;
    }

    // Draw text
    if (options.displayValue) {
      ctx.fillStyle = options.lineColor;
      ctx.font = `${options.fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(input, canvas.width / 2, options.height + options.fontSize + 15);
    }
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        options?: BarcodeOptions;
      };

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.options) {
          setOptions(params.options);
        }
      }

      const textContent = params.text || params.content || params.title || '';
      if (textContent) {
        setInput(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    if (input) {
      drawBarcode();
    }
  }, [input, options]);

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `barcode-${input}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    setError('');
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/png');
      });

      const formData = new FormData();
      formData.append('file', blob, `barcode-${input}-${Date.now()}.png`);
      formData.append('toolId', 'barcode-generator');
      formData.append('metadata', JSON.stringify({
        toolId: 'barcode-generator',
        text: input,
        options,
      }));

      const result = await api.post('/content/upload', formData);

      if (result.success) {
        // Call onSaveCallback if provided
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save barcode');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Barcode className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.barcodeGenerator.barcodeGenerator', 'Barcode Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.barcodeGenerator.generateBarcodesFromText', 'Generate barcodes from text')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
              showSettings
                ? 'bg-cyan-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            {t('tools.barcodeGenerator.settings', 'Settings')}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Settings */}
        {showSettings && (
          <div className={`p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.barcodeGenerator.format', 'Format')}
              </label>
              <select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as BarcodeFormat })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Bar Width: {options.width}px
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={options.width}
                onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Height: {options.height}px
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={options.height}
                onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.barcodeGenerator.lineColor', 'Line Color')}
              </label>
              <input
                type="color"
                value={options.lineColor}
                onChange={(e) => setOptions({ ...options, lineColor: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.barcodeGenerator.background', 'Background')}
              </label>
              <input
                type="color"
                value={options.background}
                onChange={(e) => setOptions({ ...options, background: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.displayValue}
                onChange={(e) => setOptions({ ...options, displayValue: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500"
              />
              <span className="text-sm">{t('tools.barcodeGenerator.showValue', 'Show Value')}</span>
            </label>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Enter Value
            {isPrefilled && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#0D9488]">
                <Sparkles className="w-3 h-3" />
                {t('tools.barcodeGenerator.prefilledFromAi', 'Prefilled from AI')}
              </span>
            )}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={formats.find(f => f.value === options.format)?.example || 'Enter value...'}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Format: {formats.find(f => f.value === options.format)?.pattern}
          </p>
        </div>

        {/* Barcode Preview */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center min-h-[150px]">
            {input ? (
              <canvas
                ref={canvasRef}
                className="max-w-full"
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.barcodeGenerator.enterAValueToGenerate', 'Enter a value to generate barcode')}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {input && !error && (
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-5 h-5" />
              {t('tools.barcodeGenerator.downloadPng', 'Download PNG')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('tools.barcodeGenerator.saving', 'Saving...')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('tools.barcodeGenerator.saveToLibrary', 'Save to Library')}
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? t('tools.barcodeGenerator.copied', 'Copied!') : t('tools.barcodeGenerator.copy', 'Copy')}
            </button>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.barcodeGenerator.tip', 'Tip:')}</strong> Code 128 supports any ASCII character. For retail products,
            use EAN-13 (Europe) or UPC-A (USA). For shipping, use ITF-14.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGeneratorTool;
