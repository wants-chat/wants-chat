import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Code2, Copy, RefreshCw, Wand2, Settings, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CodeBeautifierToolProps {
  uiConfig?: UIConfig;
}

const languages = [
  { value: 'javascript', label: 'JavaScript', extensions: ['js', 'jsx'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['ts', 'tsx'] },
  { value: 'json', label: 'JSON', extensions: ['json'] },
  { value: 'html', label: 'HTML', extensions: ['html', 'htm'] },
  { value: 'css', label: 'CSS', extensions: ['css'] },
  { value: 'scss', label: 'SCSS/SASS', extensions: ['scss', 'sass'] },
  { value: 'python', label: 'Python', extensions: ['py'] },
  { value: 'sql', label: 'SQL', extensions: ['sql'] },
  { value: 'xml', label: 'XML', extensions: ['xml'] },
  { value: 'markdown', label: 'Markdown', extensions: ['md'] },
];

interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  singleQuote: boolean;
  semicolons: boolean;
  trailingComma: boolean;
}

export const CodeBeautifierTool: React.FC<CodeBeautifierToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.language) setLanguage(data.language);
      if (data.code) setCode(data.code);
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [formatted, setFormatted] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    useTabs: false,
    singleQuote: true,
    semicolons: true,
    trailingComma: false,
  });

  const formatCode = () => {
    if (!code.trim()) {
      setFormatted('');
      return;
    }

    try {
      let result = code;

      switch (language) {
        case 'json':
          const parsed = JSON.parse(code);
          result = JSON.stringify(parsed, null, options.useTabs ? '\t' : options.indentSize);
          break;

        case 'javascript':
        case 'typescript':
          result = formatJavaScript(code, options);
          break;

        case 'html':
        case 'xml':
          result = formatHtml(code, options);
          break;

        case 'css':
        case 'scss':
          result = formatCss(code, options);
          break;

        case 'sql':
          result = formatSql(code, options);
          break;

        case 'python':
          result = formatPython(code, options);
          break;

        default:
          result = code;
      }

      setFormatted(result);
    } catch (error: any) {
      setFormatted(`Error: ${error.message}`);
    }
  };

  const formatJavaScript = (input: string, opts: FormatOptions): string => {
    const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indentSize);
    let result = input;
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let output = '';
    let i = 0;

    // Simple JS beautifier
    while (i < result.length) {
      const char = result[i];
      const nextChar = result[i + 1];

      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && result[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        output += char;
        i++;
        continue;
      }

      if (inString) {
        output += char;
        i++;
        continue;
      }

      // Handle braces and brackets
      if (char === '{' || char === '[') {
        output += char + '\n' + indent.repeat(++depth);
        i++;
        continue;
      }

      if (char === '}' || char === ']') {
        output = output.trimEnd() + '\n' + indent.repeat(--depth) + char;
        i++;
        continue;
      }

      if (char === ',') {
        output += char + '\n' + indent.repeat(depth);
        i++;
        continue;
      }

      if (char === ';') {
        output += char + '\n' + indent.repeat(depth);
        i++;
        continue;
      }

      output += char;
      i++;
    }

    return output.trim();
  };

  const formatHtml = (input: string, opts: FormatOptions): string => {
    const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indentSize);
    let result = input;
    let depth = 0;
    let output = '';

    // Simple HTML formatter
    const tagRegex = /<\/?[^>]+>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(result)) !== null) {
      const text = result.substring(lastIndex, match.index).trim();
      if (text) {
        output += indent.repeat(depth) + text + '\n';
      }

      const tag = match[0];
      const isClosing = tag.startsWith('</');
      const isSelfClosing = tag.endsWith('/>') || /^<(br|hr|img|input|meta|link)[\s>]/i.test(tag);

      if (isClosing) depth = Math.max(0, depth - 1);
      output += indent.repeat(depth) + tag + '\n';
      if (!isClosing && !isSelfClosing) depth++;

      lastIndex = match.index + match[0].length;
    }

    return output.trim();
  };

  const formatCss = (input: string, opts: FormatOptions): string => {
    const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indentSize);
    let result = input;

    // Add newlines after { and ;
    result = result.replace(/\{/g, ' {\n');
    result = result.replace(/;/g, ';\n');
    result = result.replace(/\}/g, '\n}\n');

    // Indent properties
    const lines = result.split('\n');
    let depth = 0;
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.endsWith('}')) {
        depth = Math.max(0, depth - 1);
        return indent.repeat(depth) + trimmed;
      }
      const indented = indent.repeat(depth) + trimmed;
      if (trimmed.endsWith('{')) depth++;
      return indented;
    });

    return formatted.filter(Boolean).join('\n');
  };

  const formatSql = (input: string, opts: FormatOptions): string => {
    const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indentSize);
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
                      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON',
                      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER',
                      'DROP', 'TABLE', 'INDEX', 'VIEW', 'AS', 'LIMIT', 'OFFSET', 'UNION'];

    let result = input.trim();

    // Uppercase keywords
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(regex, kw);
    });

    // Add newlines before major keywords
    const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT'];
    majorKeywords.forEach(kw => {
      result = result.replace(new RegExp(`\\b${kw}\\b`, 'g'), `\n${kw}`);
    });

    // Indent after SELECT
    result = result.replace(/SELECT\n/g, 'SELECT\n' + indent);

    return result.trim();
  };

  const formatPython = (input: string, opts: FormatOptions): string => {
    const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indentSize);
    const lines = input.split('\n');
    let depth = 0;

    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease depth for dedent keywords at start
      if (/^(elif|else|except|finally)/.test(trimmed)) {
        depth = Math.max(0, depth - 1);
      }

      const indented = indent.repeat(depth) + trimmed;

      // Increase depth after colon
      if (trimmed.endsWith(':')) {
        depth++;
      }

      return indented;
    }).join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode('');
    setFormatted('');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Code2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.codeBeautifier.codeBeautifier', 'Code Beautifier')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.codeBeautifier.formatAndBeautifyYourCode', 'Format and beautify your code')}</p>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-indigo-900/20 border border-indigo-800' : 'bg-indigo-50 border border-indigo-200'}`}>
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
            {t('tools.codeBeautifier.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Language Selection */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.codeBeautifier.language', 'Language')}
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
          <div className="flex items-end">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Options
            </button>
          </div>
        </div>

        {/* Format Options */}
        {showOptions && (
          <div className={`p-4 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.codeBeautifier.indentSize', 'Indent Size')}
              </label>
              <select
                value={options.indentSize}
                onChange={(e) => setOptions({ ...options, indentSize: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.useTabs}
                onChange={(e) => setOptions({ ...options, useTabs: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
              <span className="text-sm">{t('tools.codeBeautifier.useTabs', 'Use Tabs')}</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.singleQuote}
                onChange={(e) => setOptions({ ...options, singleQuote: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
              <span className="text-sm">{t('tools.codeBeautifier.singleQuotes', 'Single Quotes')}</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.semicolons}
                onChange={(e) => setOptions({ ...options, semicolons: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
              <span className="text-sm">{t('tools.codeBeautifier.semicolons', 'Semicolons')}</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.trailingComma}
                onChange={(e) => setOptions({ ...options, trailingComma: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
              <span className="text-sm">{t('tools.codeBeautifier.trailingCommas', 'Trailing Commas')}</span>
            </label>
          </div>
        )}

        {/* Code Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.codeBeautifier.inputCode', 'Input Code')}
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('tools.codeBeautifier.pasteYourUnformattedCodeHere', 'Paste your unformatted code here...')}
            rows={10}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={formatCode}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Wand2 className="w-5 h-5" />
            {t('tools.codeBeautifier.formatCode', 'Format Code')}
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

        {/* Formatted Output */}
        {formatted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.codeBeautifier.formattedCode', 'Formatted Code')}
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
                {copied ? t('tools.codeBeautifier.copied', 'Copied!') : t('tools.codeBeautifier.copy', 'Copy')}
              </button>
            </div>
            <pre className={`p-4 rounded-lg overflow-x-auto font-mono text-sm ${
              isDark ? 'bg-gray-800 text-indigo-300' : 'bg-gray-50 text-indigo-700'
            }`}>
              {formatted}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBeautifierTool;
