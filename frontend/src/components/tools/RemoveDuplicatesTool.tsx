import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ListX, Copy, Check, ArrowDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Mode = 'lines' | 'words' | 'characters';

interface RemoveDuplicatesToolProps {
  uiConfig?: UIConfig;
}

export const RemoveDuplicatesTool: React.FC<RemoveDuplicatesToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInput(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [mode, setMode] = useState<Mode>('lines');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [sortOutput, setSortOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: '', original: 0, unique: 0, removed: 0 };

    let items: string[];
    let separator: string;

    switch (mode) {
      case 'lines':
        items = input.split('\n');
        separator = '\n';
        break;
      case 'words':
        items = input.split(/\s+/).filter(Boolean);
        separator = ' ';
        break;
      case 'characters':
        items = input.split('');
        separator = '';
        break;
    }

    const original = items.length;

    // Apply trimming if enabled
    if (trimWhitespace && mode !== 'characters') {
      items = items.map(item => item.trim());
    }

    // Remove duplicates
    const seen = new Set<string>();
    const unique: string[] = [];

    items.forEach(item => {
      const key = caseSensitive ? item : item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    // Sort if enabled
    let finalItems = unique;
    if (sortOutput) {
      finalItems = [...unique].sort((a, b) => {
        const aVal = caseSensitive ? a : a.toLowerCase();
        const bVal = caseSensitive ? b : b.toLowerCase();
        return aVal.localeCompare(bVal);
      });
    }

    return {
      output: finalItems.join(separator),
      original,
      unique: unique.length,
      removed: original - unique.length,
    };
  }, [input, mode, caseSensitive, trimWhitespace, sortOutput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { value: Mode; label: string; description: string }[] = [
    { value: 'lines', label: 'Lines', description: 'Remove duplicate lines' },
    { value: 'words', label: 'Words', description: 'Remove duplicate words' },
    { value: 'characters', label: 'Characters', description: 'Remove duplicate chars' },
  ];

  const examples = [
    'apple\nbanana\napple\ncherry\nbanana\ndate',
    'the quick brown fox jumps over the lazy the dog',
    'abracadabra',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <ListX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.removeDuplicates.removeDuplicates', 'Remove Duplicates')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.removeDuplicates.removeDuplicateLinesWordsOr', 'Remove duplicate lines, words, or characters')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.removeDuplicates.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.removeDuplicates.removeDuplicatesBy', 'Remove Duplicates By')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  mode === m.value
                    ? 'bg-red-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium">{m.label}</div>
                <div className={`text-xs mt-1 ${mode === m.value ? 'opacity-75' : 'opacity-60'}`}>
                  {m.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded accent-red-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.removeDuplicates.caseSensitive', 'Case sensitive')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              disabled={mode === 'characters'}
              className="w-4 h-4 rounded accent-red-500 disabled:opacity-50"
            />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} ${mode === 'characters' ? 'opacity-50' : ''}`}>
              {t('tools.removeDuplicates.trimWhitespace', 'Trim whitespace')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sortOutput}
              onChange={(e) => setSortOutput(e.target.checked)}
              className="w-4 h-4 rounded accent-red-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.removeDuplicates.sortAlphabetically', 'Sort alphabetically')}</span>
          </label>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => { setInput(ex); setMode(idx === 0 ? 'lines' : idx === 1 ? 'words' : 'characters'); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {modes[idx].label} Example
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.removeDuplicates.inputText', 'Input Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter text with duplicate ${mode}...`}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border resize-none font-mono text-sm ${
              isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Stats */}
        {input && (
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {result.original}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.removeDuplicates.original', 'Original')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className={`text-xl font-bold text-green-500`}>
                {result.unique}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.removeDuplicates.unique', 'Unique')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className={`text-xl font-bold text-red-500`}>
                {result.removed}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.removeDuplicates.removed', 'Removed')}</div>
            </div>
          </div>
        )}

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowDown className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.removeDuplicates.resultDuplicatesRemoved', 'Result (Duplicates Removed)')}
            </label>
            <button
              onClick={handleCopy}
              disabled={!result.output}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${
                copied
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.removeDuplicates.copied', 'Copied!') : t('tools.removeDuplicates.copy', 'Copy')}
            </button>
          </div>
          <textarea
            value={result.output}
            readOnly
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border resize-none font-mono text-sm ${
              isDark ? 'bg-red-900/20 border-red-800 text-white' : 'bg-red-50 border-red-100 text-gray-900'
            }`}
          />
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.removeDuplicates.useCases', 'Use cases:')}</strong> Clean up lists, remove repeated entries from logs,
            deduplicate data exports, or find unique values in a dataset.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RemoveDuplicatesTool;
