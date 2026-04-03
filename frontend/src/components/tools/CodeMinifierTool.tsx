import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Minimize2, Copy, RefreshCw, Zap, FileCode, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CodeMinifierToolProps {
  uiConfig?: UIConfig;
}

const languages = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'json', label: 'JSON', extension: 'json' },
];

interface MinifyStats {
  original: number;
  minified: number;
  savings: number;
  percentage: number;
}

export const CodeMinifierTool: React.FC<CodeMinifierToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [minified, setMinified] = useState('');
  const [stats, setStats] = useState<MinifyStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeWhitespace, setRemoveWhitespace] = useState(true);
  const [shortenVariables, setShortenVariables] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setCode(codeContent);
        setIsPrefilled(true);
      }
      if (params.language) {
        const langValue = params.language.toLowerCase();
        if (languages.find(l => l.value === langValue)) {
          setLanguage(langValue);
        }
      }
    }
  }, [uiConfig?.params]);

  const minifyCode = () => {
    if (!code.trim()) {
      setMinified('');
      setStats(null);
      return;
    }

    try {
      let result = code;

      switch (language) {
        case 'javascript':
          result = minifyJavaScript(code);
          break;
        case 'css':
          result = minifyCss(code);
          break;
        case 'html':
          result = minifyHtml(code);
          break;
        case 'json':
          result = minifyJson(code);
          break;
      }

      const original = new Blob([code]).size;
      const minifiedSize = new Blob([result]).size;
      const savings = original - minifiedSize;

      setMinified(result);
      setStats({
        original,
        minified: minifiedSize,
        savings,
        percentage: original > 0 ? Math.round((savings / original) * 100) : 0,
      });
    } catch (error: any) {
      setMinified(`Error: ${error.message}`);
      setStats(null);
    }
  };

  const minifyJavaScript = (input: string): string => {
    let result = input;

    // Remove single-line comments
    if (removeComments) {
      result = result.replace(/\/\/.*$/gm, '');
    }

    // Remove multi-line comments
    if (removeComments) {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    if (removeWhitespace) {
      // Remove leading/trailing whitespace from lines
      result = result.replace(/^\s+|\s+$/gm, '');

      // Replace multiple spaces with single space
      result = result.replace(/\s+/g, ' ');

      // Remove spaces around operators
      result = result.replace(/\s*([{}()[\];,:<>+=\-*/%&|^!?])\s*/g, '$1');

      // Remove newlines
      result = result.replace(/\n/g, '');
    }

    return result.trim();
  };

  const minifyCss = (input: string): string => {
    let result = input;

    // Remove comments
    if (removeComments) {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    if (removeWhitespace) {
      // Remove newlines and extra spaces
      result = result.replace(/\s+/g, ' ');

      // Remove spaces around special characters
      result = result.replace(/\s*([{}:;,>+~])\s*/g, '$1');

      // Remove last semicolon before }
      result = result.replace(/;}/g, '}');

      // Remove leading zeros
      result = result.replace(/(:|\s)0\./g, '$1.');
    }

    return result.trim();
  };

  const minifyHtml = (input: string): string => {
    let result = input;

    // Remove HTML comments
    if (removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    if (removeWhitespace) {
      // Remove whitespace between tags
      result = result.replace(/>\s+</g, '><');

      // Remove leading/trailing whitespace
      result = result.replace(/^\s+|\s+$/gm, '');

      // Replace multiple spaces with single
      result = result.replace(/\s+/g, ' ');
    }

    return result.trim();
  };

  const minifyJson = (input: string): string => {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    } catch {
      throw new Error('Invalid JSON');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(minified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode('');
    setMinified('');
    setStats(null);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Minimize2 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.codeMinifier.codeMinifier', 'Code Minifier')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.codeMinifier.minifyAndCompressYourCode', 'Minify and compress your code')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.codeMinifier.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Language & Options */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.codeMinifier.language', 'Language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options */}
        <div className={`p-4 rounded-lg flex flex-wrap gap-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={removeComments}
              onChange={(e) => setRemoveComments(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500"
            />
            <span className="text-sm">{t('tools.codeMinifier.removeComments', 'Remove Comments')}</span>
          </label>

          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={removeWhitespace}
              onChange={(e) => setRemoveWhitespace(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500"
            />
            <span className="text-sm">{t('tools.codeMinifier.removeWhitespace', 'Remove Whitespace')}</span>
          </label>

          {language === 'javascript' && (
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={shortenVariables}
                onChange={(e) => setShortenVariables(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500"
              />
              <span className="text-sm">{t('tools.codeMinifier.shortenVariablesAdvanced', 'Shorten Variables (Advanced)')}</span>
            </label>
          )}
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.codeMinifier.inputCode', 'Input Code')}
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('tools.codeMinifier.pasteYourCodeHereTo', 'Paste your code here to minify...')}
            rows={10}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={minifyCode}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-5 h-5" />
            {t('tools.codeMinifier.minifyCode', 'Minify Code')}
          </button>
          <button
            onClick={handleReset}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.codeMinifier.original', 'Original')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatBytes(stats.original)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.codeMinifier.minified', 'Minified')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatBytes(stats.minified)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.codeMinifier.saved', 'Saved')}</p>
              <p className={`text-xl font-bold text-green-500`}>
                {formatBytes(stats.savings)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.codeMinifier.reduction', 'Reduction')}</p>
              <p className={`text-xl font-bold text-green-500`}>
                {stats.percentage}%
              </p>
            </div>
          </div>
        )}

        {/* Minified Output */}
        {minified && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.codeMinifier.minifiedCode', 'Minified Code')}
              </label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.codeMinifier.copied', 'Copied!') : t('tools.codeMinifier.copy', 'Copy')}
              </button>
            </div>
            <textarea
              value={minified}
              readOnly
              rows={6}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
                isDark ? 'bg-gray-800 border-gray-600 text-orange-300' : 'bg-gray-50 border-gray-200 text-orange-700'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeMinifierTool;
