import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Binary, ArrowRightLeft, Copy, Check, Hash, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ConversionMode = 'text' | 'number';
type NumberBase = 'binary' | 'decimal' | 'hexadecimal' | 'octal';

interface BinaryConverterToolProps {
  uiConfig?: UIConfig;
}

export const BinaryConverterTool: React.FC<BinaryConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<ConversionMode>('text');
  const [textInput, setTextInput] = useState('Hello');
  const [numberInput, setNumberInput] = useState('42');
  const [inputBase, setInputBase] = useState<NumberBase>('decimal');
  const [copied, setCopied] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setTextInput(params.text || params.content || '');
        setMode('text');
        setIsPrefilled(true);
      } else if (params.code) {
        setTextInput(params.code);
        setMode('text');
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setNumberInput(params.amount.toString());
        setMode('number');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const textConversions = useMemo(() => {
    const binary = textInput.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');

    const decimal = textInput.split('').map(char => {
      return char.charCodeAt(0).toString();
    }).join(' ');

    const hex = textInput.split('').map(char => {
      return char.charCodeAt(0).toString(16).toUpperCase();
    }).join(' ');

    const octal = textInput.split('').map(char => {
      return char.charCodeAt(0).toString(8);
    }).join(' ');

    return { binary, decimal, hex, octal };
  }, [textInput]);

  const numberConversions = useMemo(() => {
    let decimalValue: number;

    try {
      switch (inputBase) {
        case 'binary':
          decimalValue = parseInt(numberInput.replace(/\s/g, ''), 2);
          break;
        case 'hexadecimal':
          decimalValue = parseInt(numberInput.replace(/\s/g, ''), 16);
          break;
        case 'octal':
          decimalValue = parseInt(numberInput.replace(/\s/g, ''), 8);
          break;
        default:
          decimalValue = parseInt(numberInput.replace(/\s/g, ''), 10);
      }

      if (isNaN(decimalValue)) throw new Error('Invalid number');

      return {
        binary: decimalValue.toString(2),
        decimal: decimalValue.toString(10),
        hex: decimalValue.toString(16).toUpperCase(),
        octal: decimalValue.toString(8),
        binaryFormatted: decimalValue.toString(2).replace(/(\d{4})(?=\d)/g, '$1 '),
      };
    } catch {
      return {
        binary: 'Invalid',
        decimal: 'Invalid',
        hex: 'Invalid',
        octal: 'Invalid',
        binaryFormatted: 'Invalid',
      };
    }
  }, [numberInput, inputBase]);

  const binaryToText = (binary: string) => {
    try {
      const bytes = binary.replace(/\s/g, '').match(/.{8}/g);
      if (!bytes) return '';
      return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
    } catch {
      return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ value }: { value: string }) => (
    <button
      onClick={() => copyToClipboard(value)}
      className={`p-1.5 rounded ${copied === value ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {copied === value ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Binary className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.binaryConverter.binaryConverter', 'Binary Converter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.binaryConverter.convertBetweenTextBinaryHex', 'Convert between text, binary, hex & more')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.binaryConverter.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.binaryConverter.textBinary', 'Text ↔ Binary')}
          </button>
          <button
            onClick={() => setMode('number')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${mode === 'number' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.binaryConverter.numberBases', 'Number Bases')}
          </button>
        </div>

        {mode === 'text' ? (
          <>
            {/* Text Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.binaryConverter.textInput', 'Text Input')}
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t('tools.binaryConverter.enterText', 'Enter text...')}
                className={`w-full px-4 py-3 rounded-lg border resize-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                rows={2}
              />
            </div>

            {/* Conversions */}
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.binary', 'Binary')}</span>
                  <CopyButton value={textConversions.binary} />
                </div>
                <div className={`font-mono text-sm break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {textConversions.binary || '—'}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.decimalAscii', 'Decimal (ASCII)')}</span>
                  <CopyButton value={textConversions.decimal} />
                </div>
                <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {textConversions.decimal || '—'}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.hexadecimal', 'Hexadecimal')}</span>
                  <CopyButton value={textConversions.hex} />
                </div>
                <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {textConversions.hex || '—'}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.octal', 'Octal')}</span>
                  <CopyButton value={textConversions.octal} />
                </div>
                <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {textConversions.octal || '—'}
                </div>
              </div>
            </div>

            {/* Binary to Text */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                {t('tools.binaryConverter.binaryToTextPasteBinary', 'Binary to Text (paste binary here)')}
              </label>
              <input
                type="text"
                placeholder="01001000 01101001..."
                onChange={(e) => {
                  const text = binaryToText(e.target.value);
                  if (text) setTextInput(text);
                }}
                className={`w-full px-4 py-2 rounded-lg border font-mono ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </>
        ) : (
          <>
            {/* Number Base Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.binaryConverter.inputBase', 'Input Base')}
              </label>
              <div className="flex gap-2">
                {(['binary', 'decimal', 'hexadecimal', 'octal'] as NumberBase[]).map((base) => (
                  <button
                    key={base}
                    onClick={() => setInputBase(base)}
                    className={`flex-1 py-2 rounded-lg text-sm capitalize ${inputBase === base ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {base.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Number Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Hash className="w-4 h-4 inline mr-1" />
                Enter {inputBase} number
              </label>
              <input
                type="text"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder={inputBase === 'binary' ? '101010' : inputBase === 'hexadecimal' ? '2A' : inputBase === 'octal' ? '52' : '42'}
                className={`w-full px-4 py-3 rounded-lg border font-mono text-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* Conversions */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-lg ${inputBase === 'binary' ? 'ring-2 ring-cyan-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.binaryBase2', 'Binary (Base 2)')}</span>
                  <CopyButton value={numberConversions.binary} />
                </div>
                <div className={`font-mono text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {numberConversions.binaryFormatted}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${inputBase === 'decimal' ? 'ring-2 ring-cyan-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.decimalBase10', 'Decimal (Base 10)')}</span>
                  <CopyButton value={numberConversions.decimal} />
                </div>
                <div className={`font-mono text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {numberConversions.decimal}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${inputBase === 'hexadecimal' ? 'ring-2 ring-cyan-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.hexadecimalBase16', 'Hexadecimal (Base 16)')}</span>
                  <CopyButton value={numberConversions.hex} />
                </div>
                <div className={`font-mono text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  0x{numberConversions.hex}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${inputBase === 'octal' ? 'ring-2 ring-cyan-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.binaryConverter.octalBase8', 'Octal (Base 8)')}</span>
                  <CopyButton value={numberConversions.octal} />
                </div>
                <div className={`font-mono text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  0o{numberConversions.octal}
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.binaryConverter.quickReference', 'Quick Reference')}</h4>
              <div className={`grid grid-cols-4 gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div><span className="font-mono">0-9</span>: 0-9</div>
                <div><span className="font-mono">A</span>: 10</div>
                <div><span className="font-mono">B</span>: 11</div>
                <div><span className="font-mono">C</span>: 12</div>
                <div><span className="font-mono">D</span>: 13</div>
                <div><span className="font-mono">E</span>: 14</div>
                <div><span className="font-mono">F</span>: 15</div>
                <div><span className="font-mono">0xFF</span>: 255</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BinaryConverterTool;
