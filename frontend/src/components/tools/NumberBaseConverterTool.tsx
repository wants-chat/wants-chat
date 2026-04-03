import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Binary, Hash, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type NumberBase = 2 | 8 | 10 | 16;

interface BaseInfo {
  name: string;
  prefix: string;
}

interface NumberBaseConverterToolProps {
  uiConfig?: UIConfig;
}

const NumberBaseConverterTool: React.FC<NumberBaseConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState<string>('42');
  const [inputBase, setInputBase] = useState<NumberBase>(10);
  const [results, setResults] = useState<Record<NumberBase, string>>({
    2: '',
    8: '',
    10: '',
    16: '',
  });
  const [error, setError] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setInputValue(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d]+/);
        if (numMatch) {
          setInputValue(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const baseInfo: Record<NumberBase, BaseInfo> = {
    2: { name: 'Binary', prefix: '0b' },
    8: { name: 'Octal', prefix: '0o' },
    10: { name: 'Decimal', prefix: '' },
    16: { name: 'Hexadecimal', prefix: '0x' },
  };

  const isValidForBase = (value: string, base: NumberBase): boolean => {
    if (!value) return false;

    const validChars: Record<NumberBase, RegExp> = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9A-Fa-f]+$/,
    };

    return validChars[base].test(value);
  };

  const convertNumber = () => {
    setError('');

    if (!inputValue.trim()) {
      setError('Please enter a number');
      setResults({ 2: '', 8: '', 10: '', 16: '' });
      return;
    }

    if (!isValidForBase(inputValue, inputBase)) {
      setError(`Invalid ${baseInfo[inputBase].name} number`);
      setResults({ 2: '', 8: '', 10: '', 16: '' });
      return;
    }

    try {
      // Parse the input number with the specified base
      const decimalValue = parseInt(inputValue, inputBase);

      if (isNaN(decimalValue) || decimalValue < 0) {
        setError('Invalid number');
        setResults({ 2: '', 8: '', 10: '', 16: '' });
        return;
      }

      // Convert to all bases
      setResults({
        2: decimalValue.toString(2),
        8: decimalValue.toString(8),
        10: decimalValue.toString(10),
        16: decimalValue.toString(16).toUpperCase(),
      });
    } catch (err) {
      setError('Conversion failed');
      setResults({ 2: '', 8: '', 10: '', 16: '' });
    }
  };

  useEffect(() => {
    convertNumber();
  }, [inputValue, inputBase]);

  const handleInputChange = (value: string) => {
    // Remove any whitespace
    const cleaned = value.trim();
    setInputValue(cleaned);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Binary className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.numberBaseConverter.numberBaseConverter', 'Number Base Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.numberBaseConverter.convertBetweenBinaryOctalDecimal', 'Convert between Binary, Octal, Decimal, and Hexadecimal')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.numberBaseConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Input Section */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.numberBaseConverter.inputNumber', 'Input Number')}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] mb-3 font-mono text-lg`}
              placeholder={t('tools.numberBaseConverter.enterANumber', 'Enter a number')}
            />

            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.numberBaseConverter.inputBase', 'Input Base')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(baseInfo) as unknown as NumberBase[]).map((base) => (
                <button
                  key={base}
                  onClick={() => setInputBase(base)}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    inputBase === base
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium">{baseInfo[base].name}</div>
                  <div className="text-xs opacity-75">Base {base}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Results Section */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('tools.numberBaseConverter.conversions', 'Conversions')}
            </h3>
            <div className="grid gap-4">
              {(Object.keys(baseInfo) as unknown as NumberBase[]).map((base) => (
                <div
                  key={base}
                  className={`p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {baseInfo[base].name} (Base {base})
                      </span>
                      {baseInfo[base].prefix && (
                        <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Prefix: {baseInfo[base].prefix}
                        </span>
                      )}
                    </div>
                    {results[base] && (
                      <button
                        onClick={() => copyToClipboard(results[base])}
                        className={`text-xs px-3 py-1 rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } transition-colors`}
                      >
                        {t('tools.numberBaseConverter.copy', 'Copy')}
                      </button>
                    )}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg font-mono text-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } ${results[base] ? 'text-[#0D9488]' : isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
                  >
                    {results[base] || '---'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2">
                <strong>{t('tools.numberBaseConverter.binaryBase2', 'Binary (Base 2):')}</strong> Uses digits 0-1
              </p>
              <p className="mb-2">
                <strong>{t('tools.numberBaseConverter.octalBase8', 'Octal (Base 8):')}</strong> Uses digits 0-7
              </p>
              <p className="mb-2">
                <strong>{t('tools.numberBaseConverter.decimalBase10', 'Decimal (Base 10):')}</strong> Uses digits 0-9
              </p>
              <p>
                <strong>{t('tools.numberBaseConverter.hexadecimalBase16', 'Hexadecimal (Base 16):')}</strong> Uses digits 0-9 and A-F
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverterTool;
