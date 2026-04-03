import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Replace, Copy, Check, CaseSensitive, Regex, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FindReplaceToolProps {
  uiConfig?: UIConfig;
}

export const FindReplaceTool: React.FC<FindReplaceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [text, setText] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setText(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text || !find) return { text: text, count: 0 };

    try {
      let pattern: RegExp;

      if (useRegex) {
        pattern = new RegExp(find, caseSensitive ? 'g' : 'gi');
      } else {
        const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundary = wholeWord ? `\\b${escaped}\\b` : escaped;
        pattern = new RegExp(wordBoundary, caseSensitive ? 'g' : 'gi');
      }

      const matches = text.match(pattern);
      const count = matches ? matches.length : 0;
      const replaced = text.replace(pattern, replace);

      return { text: replaced, count };
    } catch (e) {
      return { text: text, count: 0, error: 'Invalid regex pattern' };
    }
  }, [text, find, replace, caseSensitive, useRegex, wholeWord]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const examples = [
    { text: 'Hello World! Hello Universe!', find: 'Hello', replace: 'Hi' },
    { text: 'The cat sat on the mat', find: 'at', replace: 'og' },
    { text: 'user@email.com, admin@site.org', find: '@\\w+\\.\\w+', replace: '@example.com' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Replace className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.findReplace.findReplace', 'Find & Replace')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.findReplace.searchAndReplaceTextWith', 'Search and replace text with regex support')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.findReplace.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Find/Replace Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Search className="w-4 h-4 inline mr-1" /> Find
            </label>
            <input
              type="text"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder={t('tools.findReplace.textToFind', 'Text to find...')}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Replace className="w-4 h-4 inline mr-1" /> Replace With
            </label>
            <input
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder={t('tools.findReplace.replacementText', 'Replacement text...')}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded accent-green-500"
            />
            <CaseSensitive className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.findReplace.caseSensitive', 'Case sensitive')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="w-4 h-4 rounded accent-green-500"
            />
            <Regex className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.findReplace.useRegex', 'Use regex')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
              disabled={useRegex}
              className="w-4 h-4 rounded accent-green-500 disabled:opacity-50"
            />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} ${useRegex ? 'opacity-50' : ''}`}>
              {t('tools.findReplace.wholeWordOnly', 'Whole word only')}
            </span>
          </label>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => { setText(ex.text); setFind(ex.find); setReplace(ex.replace); setUseRegex(idx === 2); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        {/* Input Text */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.findReplace.inputText', 'Input Text')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('tools.findReplace.enterYourTextHere', 'Enter your text here...')}
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Match Count */}
        {find && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            result.error
              ? 'bg-red-500/10 text-red-500'
              : result.count > 0
                ? 'bg-green-500/10 text-green-500'
                : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            {result.error ? (
              <span>{result.error}</span>
            ) : (
              <span>
                {result.count} match{result.count !== 1 ? 'es' : ''} found
                {result.count > 0 && ` and replaced`}
              </span>
            )}
          </div>
        )}

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.findReplace.result', 'Result')}
            </label>
            <button
              onClick={handleCopy}
              disabled={!result.text}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${
                copied
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.findReplace.copied', 'Copied!') : t('tools.findReplace.copy', 'Copy')}
            </button>
          </div>
          <textarea
            value={result.text}
            readOnly
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark ? 'bg-green-900/20 border-green-800 text-white' : 'bg-green-50 border-green-100 text-gray-900'
            }`}
          />
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.findReplace.tip', 'Tip:')}</strong> Enable regex for powerful pattern matching.
            Use <code className="px-1 bg-gray-700/50 rounded">\d</code> for digits,
            <code className="px-1 bg-gray-700/50 rounded">\w</code> for word characters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindReplaceTool;
