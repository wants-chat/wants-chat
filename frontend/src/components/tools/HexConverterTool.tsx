import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Hash, Copy, Check, ArrowRightLeft, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HexConverterToolProps {
  uiConfig?: UIConfig;
}

type ConversionMode = 'text' | 'number' | 'color';
type InputBase = 'hex' | 'decimal' | 'binary' | 'octal';

const HexConverterTool: React.FC<HexConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState<ConversionMode>('number');
  const [textInput, setTextInput] = useState<string>('Hello');
  const [numberInput, setNumberInput] = useState<string>('FF');
  const [inputBase, setInputBase] = useState<InputBase>('hex');
  const [colorInput, setColorInput] = useState<string>('#0D9488');
  const [copied, setCopied] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.text || params.content) {
        const text = params.text || params.content || '';
        // Check if it looks like a hex color
        if (/^#?[0-9A-Fa-f]{3,8}$/.test(text.trim())) {
          setColorInput(text.startsWith('#') ? text : `#${text}`);
          setMode('color');
        } else if (/^[0-9A-Fa-f]+$/.test(text.trim())) {
          setNumberInput(text.trim());
          setMode('number');
          setInputBase('hex');
        } else {
          setTextInput(text);
          setMode('text');
        }
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setNumberInput(params.amount.toString());
        setInputBase('decimal');
        setMode('number');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Text to hex conversion
  const textConversions = useMemo(() => {
    const hex = textInput
      .split('')
      .map((char) => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');

    const hexNoSpace = textInput
      .split('')
      .map((char) => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join('');

    const decimal = textInput
      .split('')
      .map((char) => char.charCodeAt(0).toString())
      .join(' ');

    return { hex, hexNoSpace, decimal };
  }, [textInput]);

  // Number base conversion
  const numberConversions = useMemo(() => {
    let decimalValue: number;

    try {
      const cleanInput = numberInput.replace(/\s/g, '').replace(/^0x/i, '');

      switch (inputBase) {
        case 'hex':
          decimalValue = parseInt(cleanInput, 16);
          break;
        case 'binary':
          decimalValue = parseInt(cleanInput, 2);
          break;
        case 'octal':
          decimalValue = parseInt(cleanInput, 8);
          break;
        default:
          decimalValue = parseInt(cleanInput, 10);
      }

      if (isNaN(decimalValue) || decimalValue < 0) {
        return null;
      }

      return {
        hex: decimalValue.toString(16).toUpperCase(),
        hexFormatted: '0x' + decimalValue.toString(16).toUpperCase(),
        decimal: decimalValue.toString(10),
        binary: decimalValue.toString(2),
        binaryFormatted: decimalValue
          .toString(2)
          .replace(/(\d{4})(?=\d)/g, '$1 '),
        octal: decimalValue.toString(8),
        octalFormatted: '0o' + decimalValue.toString(8),
      };
    } catch {
      return null;
    }
  }, [numberInput, inputBase]);

  // Color conversion
  const colorConversions = useMemo(() => {
    try {
      let hex = colorInput.replace('#', '');

      // Handle 3-digit hex
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map((c) => c + c)
          .join('');
      }

      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return null;
      }

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Convert to HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;

      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      const l = (max + min) / 2;

      let h = 0;
      let s = 0;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case rNorm:
            h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
            break;
          case gNorm:
            h = ((bNorm - rNorm) / d + 2) / 6;
            break;
          case bNorm:
            h = ((rNorm - gNorm) / d + 4) / 6;
            break;
        }
      }

      return {
        hex: `#${hex.toUpperCase()}`,
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, 1)`,
        hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
        r,
        g,
        b,
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      };
    } catch {
      return null;
    }
  }, [colorInput]);

  const hexToText = (hex: string) => {
    try {
      const cleanHex = hex.replace(/\s/g, '').replace(/^0x/i, '');
      const bytes = cleanHex.match(/.{2}/g);
      if (!bytes) return '';
      return bytes.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('');
    } catch {
      return '';
    }
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ value, label }: { value: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(value, label)}
      className={`p-1.5 rounded ${
        copied === label
          ? 'text-green-500'
          : isDarkMode
          ? 'text-gray-400 hover:text-white'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {copied === label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div
          className={`${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } rounded-lg shadow-lg p-8`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.hexConverter.hexadecimalConverter', 'Hexadecimal Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.hexConverter.convertBetweenHexTextNumbers', 'Convert between hex, text, numbers, and colors')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.hexConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('number')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  mode === 'number'
                    ? 'bg-[#0D9488] text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.hexConverter.numberBases', 'Number Bases')}
              </button>
              <button
                onClick={() => setMode('text')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  mode === 'text'
                    ? 'bg-[#0D9488] text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.hexConverter.textHex', 'Text ↔ Hex')}
              </button>
              <button
                onClick={() => setMode('color')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  mode === 'color'
                    ? 'bg-[#0D9488] text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.hexConverter.hexColors', 'Hex Colors')}
              </button>
            </div>
          </div>

          {/* Number Mode */}
          {mode === 'number' && (
            <>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.hexConverter.inputBase', 'Input Base')}
                </label>
                <div className="flex gap-2">
                  {(['hex', 'decimal', 'binary', 'octal'] as InputBase[]).map((base) => (
                    <button
                      key={base}
                      onClick={() => setInputBase(base)}
                      className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${
                        inputBase === base
                          ? 'bg-[#0D9488] text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {base === 'hex' ? 'Hex (16)' : base === 'decimal' ? 'Dec (10)' : base === 'binary' ? t('tools.hexConverter.bin2', 'Bin (2)') : t('tools.hexConverter.oct8', 'Oct (8)')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enter {inputBase} number
                </label>
                <input
                  type="text"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  placeholder={inputBase === 'hex' ? 'FF or 0xFF' : inputBase === 'binary' ? '11111111' : inputBase === 'octal' ? '377' : '255'}
                  className={`w-full px-4 py-3 rounded-lg border font-mono text-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {numberConversions && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`p-4 rounded-lg border ${inputBase === 'hex' ? 'ring-2 ring-[#0D9488]' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.hexConverter.hexadecimalBase162', 'Hexadecimal (Base 16)')}
                      </span>
                      <CopyButton value={numberConversions.hexFormatted} label="hex" />
                    </div>
                    <div className="font-mono text-xl text-[#0D9488] font-bold">
                      {numberConversions.hexFormatted}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${inputBase === 'decimal' ? 'ring-2 ring-[#0D9488]' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.hexConverter.decimalBase10', 'Decimal (Base 10)')}
                      </span>
                      <CopyButton value={numberConversions.decimal} label="decimal" />
                    </div>
                    <div className="font-mono text-xl text-[#0D9488] font-bold">
                      {numberConversions.decimal}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${inputBase === 'binary' ? 'ring-2 ring-[#0D9488]' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.hexConverter.binaryBase2', 'Binary (Base 2)')}
                      </span>
                      <CopyButton value={numberConversions.binary} label="binary" />
                    </div>
                    <div className="font-mono text-xl text-[#0D9488] font-bold break-all">
                      {numberConversions.binaryFormatted}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${inputBase === 'octal' ? 'ring-2 ring-[#0D9488]' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.hexConverter.octalBase8', 'Octal (Base 8)')}
                      </span>
                      <CopyButton value={numberConversions.octalFormatted} label="octal" />
                    </div>
                    <div className="font-mono text-xl text-[#0D9488] font-bold">
                      {numberConversions.octalFormatted}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Text Mode */}
          {mode === 'text' && (
            <>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.hexConverter.textInput', 'Text Input')}
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('tools.hexConverter.enterTextToConvert', 'Enter text to convert...')}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div className="space-y-4 mb-6">
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hexConverter.hexadecimalSpaced', 'Hexadecimal (spaced)')}
                    </span>
                    <CopyButton value={textConversions.hex} label="hexSpaced" />
                  </div>
                  <div className={`font-mono text-lg break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {textConversions.hex || '---'}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hexConverter.hexadecimalContinuous', 'Hexadecimal (continuous)')}
                    </span>
                    <CopyButton value={textConversions.hexNoSpace} label="hexContinuous" />
                  </div>
                  <div className={`font-mono text-lg break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {textConversions.hexNoSpace || '---'}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.hexConverter.decimalAsciiCodes', 'Decimal (ASCII codes)')}
                    </span>
                    <CopyButton value={textConversions.decimal} label="ascii" />
                  </div>
                  <div className={`font-mono text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {textConversions.decimal || '---'}
                  </div>
                </div>
              </div>

              {/* Hex to Text */}
              <div className={`p-4 rounded-lg border ${isDarkMode ? t('tools.hexConverter.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                  {t('tools.hexConverter.hexToTextPasteHex', 'Hex to Text (paste hex here)')}
                </label>
                <input
                  type="text"
                  placeholder="48 65 6C 6C 6F..."
                  onChange={(e) => {
                    const text = hexToText(e.target.value);
                    if (text) setTextInput(text);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border font-mono ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {/* Color Mode */}
          {mode === 'color' && (
            <>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.hexConverter.enterHexColor', 'Enter Hex Color')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="#0D9488"
                    className={`flex-1 px-4 py-3 rounded-lg border font-mono text-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <input
                    type="color"
                    value={colorConversions?.hex || '#0D9488'}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-14 h-12 rounded-lg cursor-pointer border-0"
                  />
                </div>
              </div>

              {colorConversions && (
                <>
                  {/* Color Preview */}
                  <div
                    className="mb-6 h-24 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: colorConversions.hex }}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.hexConverter.hex', 'HEX')}
                        </span>
                        <CopyButton value={colorConversions.hex} label="colorHex" />
                      </div>
                      <div className="font-mono text-xl text-[#0D9488] font-bold">
                        {colorConversions.hex}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          RGB
                        </span>
                        <CopyButton value={colorConversions.rgb} label="rgb" />
                      </div>
                      <div className="font-mono text-xl text-[#0D9488] font-bold">
                        {colorConversions.rgb}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          RGBA
                        </span>
                        <CopyButton value={colorConversions.rgba} label="rgba" />
                      </div>
                      <div className="font-mono text-xl text-[#0D9488] font-bold">
                        {colorConversions.rgba}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          HSL
                        </span>
                        <CopyButton value={colorConversions.hsl} label="hsl" />
                      </div>
                      <div className="font-mono text-xl text-[#0D9488] font-bold">
                        {colorConversions.hsl}
                      </div>
                    </div>
                  </div>

                  {/* RGB Values */}
                  <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.hexConverter.individualValues', 'Individual Values')}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hexConverter.red', 'Red')}</div>
                        <div className="font-mono text-lg font-bold text-red-500">{colorConversions.r}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hexConverter.green', 'Green')}</div>
                        <div className="font-mono text-lg font-bold text-green-500">{colorConversions.g}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hexConverter.blue', 'Blue')}</div>
                        <div className="font-mono text-lg font-bold text-blue-500">{colorConversions.b}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Info */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2">
                <strong>{t('tools.hexConverter.hexadecimalBase16', 'Hexadecimal (Base 16)')}</strong> uses digits 0-9 and letters A-F.
              </p>
              <p>
                {t('tools.hexConverter.commonUsesColorCodesFf0000', 'Common uses: Color codes (#FF0000), memory addresses, character encoding (ASCII/Unicode).')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexConverterTool;
