import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, ArrowRight, ArrowLeft, AlertCircle, Sparkles, Code } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HTMLEncoderToolProps {
  uiConfig?: UIConfig;
}

// HTML entities map for encoding
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// Reverse map for decoding
const ENTITY_TO_CHAR: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&#x2F;': '/',
  '&#x60;': '`',
  '&#x3D;': '=',
  '&nbsp;': ' ',
  '&copy;': '\u00A9',
  '&reg;': '\u00AE',
  '&trade;': '\u2122',
  '&euro;': '\u20AC',
  '&pound;': '\u00A3',
  '&yen;': '\u00A5',
  '&cent;': '\u00A2',
  '&deg;': '\u00B0',
  '&plusmn;': '\u00B1',
  '&times;': '\u00D7',
  '&divide;': '\u00F7',
  '&frac12;': '\u00BD',
  '&frac14;': '\u00BC',
  '&frac34;': '\u00BE',
  '&hellip;': '\u2026',
  '&mdash;': '\u2014',
  '&ndash;': '\u2013',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&bull;': '\u2022',
  '&middot;': '\u00B7',
};

export const HTMLEncoderTool = ({ uiConfig }: HTMLEncoderToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [encodeMode, setEncodeMode] = useState<'basic' | 'full'>('basic');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const content = params.code || params.content || params.text || '';
      if (content) {
        setInput(content);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const encodeHTML = (text: string): string => {
    if (encodeMode === 'basic') {
      // Basic encoding: only encode dangerous characters
      return text.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] || char);
    } else {
      // Full encoding: encode all non-ASCII and special characters
      return text
        .split('')
        .map((char) => {
          if (HTML_ENTITIES[char]) {
            return HTML_ENTITIES[char];
          }
          const code = char.charCodeAt(0);
          if (code > 127) {
            return `&#${code};`;
          }
          return char;
        })
        .join('');
    }
  };

  const decodeHTML = (text: string): string => {
    // First, replace named entities
    let decoded = text;
    for (const [entity, char] of Object.entries(ENTITY_TO_CHAR)) {
      decoded = decoded.split(entity).join(char);
    }

    // Then decode numeric entities (&#123; and &#x7B;)
    decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

    return decoded;
  };

  const handleEncode = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to encode');
      return;
    }
    try {
      const encoded = encodeHTML(input);
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode HTML entities');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter HTML entities to decode');
      return;
    }
    try {
      const decoded = decodeHTML(input);
      setOutput(decoded);
    } catch (err) {
      setError('Failed to decode HTML entities');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setError('');
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Code className="w-7 h-7 text-teal-500" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.hTMLEncoder.htmlEntityEncoderDecoder', 'HTML Entity Encoder/Decoder')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.hTMLEncoder.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Encode Mode Toggle */}
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.hTMLEncoder.encodeMode', 'Encode Mode:')}
          </span>
          <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
            <button
              onClick={() => setEncodeMode('basic')}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                encodeMode === 'basic'
                  ? 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.hTMLEncoder.basic', 'Basic')}
            </button>
            <button
              onClick={() => setEncodeMode('full')}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                encodeMode === 'full'
                  ? 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.hTMLEncoder.fullUnicode', 'Full (Unicode)')}
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder={t('tools.hTMLEncoder.enterTextOrHtmlEntities', 'Enter text or HTML entities...')}
            className={`w-full h-32 px-4 py-2 rounded-lg border font-mono text-sm ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEncode}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            {t('tools.hTMLEncoder.encodeToHtml', 'Encode to HTML')}
          </button>
          <button
            onClick={handleDecode}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('tools.hTMLEncoder.decodeFromHtml', 'Decode from HTML')}
          </button>
          {output && (
            <button
              onClick={handleSwap}
              className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('tools.hTMLEncoder.swap', 'Swap')}
            </button>
          )}
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.hTMLEncoder.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.hTMLEncoder.output', 'Output')}
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.hTMLEncoder.copied', 'Copied!') : t('tools.hTMLEncoder.copy', 'Copy')}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.hTMLEncoder.resultWillAppearHere', 'Result will appear here...')}
            className={`w-full h-32 px-4 py-2 rounded-lg border font-mono text-sm ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none`}
          />
        </div>

        {/* Common Entities Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hTMLEncoder.commonHtmlEntities', 'Common HTML Entities')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { char: '<', entity: '&lt;' },
              { char: '>', entity: '&gt;' },
              { char: '&', entity: '&amp;' },
              { char: '"', entity: '&quot;' },
              { char: "'", entity: '&#39;' },
              { char: '\u00A9', entity: '&copy;' },
              { char: '\u00AE', entity: '&reg;' },
              { char: '\u2122', entity: '&trade;' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-3 py-1.5 rounded ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <span className={`font-mono text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.char}
                </span>
                <span className={`font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.entity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-teal-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hTMLEncoder.aboutHtmlEntities', 'About HTML Entities')}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            HTML entities are used to represent special characters that have meaning in HTML or cannot be easily typed.
            Encoding prevents XSS attacks and ensures your content displays correctly in web browsers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HTMLEncoderTool;
