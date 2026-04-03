import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, Copy, Check, Settings, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SlugOptions {
  lowercase: boolean;
  separator: string;
  maxLength: number;
  removeStopWords: boolean;
  transliterate: boolean;
}

const stopWords = [
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
  'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'how',
];

const transliterationMap: Record<string, string> = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
  'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i',
  'î': 'i', 'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o',
  'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'ý': 'y', 'ÿ': 'y', 'ß': 'ss', 'œ': 'oe',
};

interface SlugGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const SlugGeneratorTool: React.FC<SlugGeneratorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [input, setInput] = useState('');
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<SlugOptions>({
    lowercase: true,
    separator: '-',
    maxLength: 100,
    removeStopWords: false,
    transliterate: true,
  });

  const generateSlug = (text: string, opts: SlugOptions): string => {
    if (!text.trim()) return '';

    let result = text.trim();

    // Transliterate special characters
    if (opts.transliterate) {
      result = result.split('').map(char =>
        transliterationMap[char.toLowerCase()] || char
      ).join('');
    }

    // Convert to lowercase if enabled
    if (opts.lowercase) {
      result = result.toLowerCase();
    }

    // Remove stop words if enabled
    if (opts.removeStopWords) {
      const words = result.split(/\s+/);
      result = words.filter(word =>
        !stopWords.includes(word.toLowerCase())
      ).join(' ');
    }

    // Replace spaces and special characters with separator
    result = result
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/[\s_]+/g, opts.separator) // Replace spaces and underscores with separator
      .replace(new RegExp(`${opts.separator}+`, 'g'), opts.separator) // Remove duplicate separators
      .replace(new RegExp(`^${opts.separator}|${opts.separator}$`, 'g'), ''); // Trim separators from ends

    // Apply max length
    if (opts.maxLength > 0 && result.length > opts.maxLength) {
      result = result.substring(0, opts.maxLength);
      // Don't cut in the middle of a word
      const lastSeparator = result.lastIndexOf(opts.separator);
      if (lastSeparator > opts.maxLength * 0.7) {
        result = result.substring(0, lastSeparator);
      }
    }

    return result;
  };

  useEffect(() => {
    setSlug(generateSlug(input, options));
  }, [input, options]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.title || '';
      if (textContent) {
        setInput(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleCopy = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const separators = [
    { value: '-', label: 'Hyphen (-)' },
    { value: '_', label: 'Underscore (_)' },
    { value: '.', label: 'Dot (.)' },
  ];

  const examples = [
    'How to Build a REST API with Node.js',
    '10 Tips for Better React Performance!',
    'The Ultimate Guide to TypeScript in 2024',
    'Why Café & Résumé Characters Matter',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-sky-900/20' : 'bg-gradient-to-r from-white to-sky-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg">
              <Link2 className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.slugGenerator.slugGenerator', 'Slug Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.slugGenerator.createUrlFriendlySlugsFrom', 'Create URL-friendly slugs from text')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
              showOptions
                ? 'bg-sky-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Options
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Options */}
        {showOptions && (
          <div className={`p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.slugGenerator.separator', 'Separator')}
              </label>
              <select
                value={options.separator}
                onChange={(e) => setOptions({ ...options, separator: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {separators.map((sep) => (
                  <option key={sep.value} value={sep.value}>{sep.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.slugGenerator.maxLength', 'Max Length')}
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={options.maxLength}
                onChange={(e) => setOptions({ ...options, maxLength: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500"
              />
              <span className="text-sm">{t('tools.slugGenerator.lowercase', 'Lowercase')}</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.removeStopWords}
                onChange={(e) => setOptions({ ...options, removeStopWords: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500"
              />
              <span className="text-sm">{t('tools.slugGenerator.removeStopWords', 'Remove stop words')}</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.transliterate}
                onChange={(e) => setOptions({ ...options, transliterate: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500"
              />
              <span className="text-sm">Transliterate (é → e)</span>
            </label>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Enter Title or Text
            {isPrefilled && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-sky-500">
                <Sparkles className="w-3 h-3" />
                {t('tools.slugGenerator.prefilledFromAi', 'Prefilled from AI')}
              </span>
            )}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.slugGenerator.enterYourTextHere', 'Enter your text here...')}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
          />
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.slugGenerator.quickExamples', 'Quick Examples')}
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setInput(ex)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {ex.substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.slugGenerator.generatedSlug', 'Generated Slug')}
            </label>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {slug.length} characters
            </span>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-sky-900/20 border-sky-800' : 'bg-sky-50 border-sky-100'} border`}>
            <div className="flex items-center justify-between gap-4">
              <code className={`flex-1 font-mono text-lg break-all ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                {slug || 'your-slug-will-appear-here'}
              </code>
              <button
                onClick={handleCopy}
                disabled={!slug}
                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-sky-800 hover:bg-sky-700 text-sky-200'
                    : 'bg-sky-100 hover:bg-sky-200 text-sky-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* URL Preview */}
        {slug && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.slugGenerator.urlPreview', 'URL Preview:')}</p>
            <p className={`font-mono text-sm mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              https://example.com/blog/<span className="text-sky-500">{slug}</span>
            </p>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.slugGenerator.whatIsASlug', 'What is a slug?')}</strong> A slug is the URL-friendly version of a title or name.
            It's used in web addresses to identify a specific page (e.g., /blog/my-awesome-post).
            Good slugs are lowercase, use hyphens instead of spaces, and contain only letters, numbers, and separators.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlugGeneratorTool;
