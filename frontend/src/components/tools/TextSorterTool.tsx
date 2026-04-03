import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Copy, Check, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SortMode = 'alphabetical' | 'length' | 'numeric' | 'random';
type SortOrder = 'asc' | 'desc';

interface TextSorterToolProps {
  uiConfig?: UIConfig;
}

export const TextSorterTool: React.FC<TextSorterToolProps> = ({ uiConfig }) => {
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
  const [mode, setMode] = useState<SortMode>('alphabetical');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [copied, setCopied] = useState(false);

  const sorted = useMemo(() => {
    if (!input) return '';

    let lines = input.split('\n');

    // Remove empty lines if enabled
    if (removeEmpty) {
      lines = lines.filter(line => line.trim() !== '');
    }

    // Remove duplicates if enabled
    if (removeDuplicates) {
      lines = [...new Set(lines)];
    }

    // Sort based on mode
    lines.sort((a, b) => {
      let comparison = 0;

      switch (mode) {
        case 'alphabetical':
          const aVal = caseSensitive ? a : a.toLowerCase();
          const bVal = caseSensitive ? b : b.toLowerCase();
          comparison = aVal.localeCompare(bVal);
          break;
        case 'length':
          comparison = a.length - b.length;
          break;
        case 'numeric':
          const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
          const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
          comparison = numA - numB;
          break;
        case 'random':
          comparison = Math.random() - 0.5;
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return lines.join('\n');
  }, [input, mode, order, caseSensitive, removeDuplicates, removeEmpty]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sorted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { value: SortMode; label: string; icon: string }[] = [
    { value: 'alphabetical', label: 'Alphabetical', icon: 'Aa' },
    { value: 'length', label: 'By Length', icon: '↔' },
    { value: 'numeric', label: 'Numeric', icon: '123' },
    { value: 'random', label: 'Shuffle', icon: '🎲' },
  ];

  const examples = [
    'banana\napple\ncherry\ndate',
    'line one\na longer line here\nshort\nmedium length',
    'Item 10\nItem 2\nItem 1\nItem 20',
    'First\nSecond\nThird\nFirst\nSecond',
  ];

  const lineCount = input.split('\n').filter(l => removeEmpty ? l.trim() !== '' : true).length;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ArrowUpDown className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.textSorter.textSorter', 'Text Sorter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.textSorter.sortLinesOfTextIn', 'Sort lines of text in various ways')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.textSorter.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Sort Mode */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.textSorter.sortBy', 'Sort By')}
            </label>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    mode === m.value
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span className="mr-1">{m.icon}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          {mode !== 'random' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.textSorter.order', 'Order')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrder('asc')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    order === 'asc'
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" /> Asc
                </button>
                <button
                  onClick={() => setOrder('desc')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    order === 'desc'
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" /> Desc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.textSorter.caseSensitive', 'Case sensitive')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={(e) => setRemoveDuplicates(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.textSorter.removeDuplicates', 'Remove duplicates')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(e) => setRemoveEmpty(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.textSorter.removeEmptyLines', 'Remove empty lines')}</span>
          </label>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setInput(ex)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        {/* Input/Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Input ({lineCount} lines)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('tools.textSorter.enterLinesToSortOne', 'Enter lines to sort (one per line)...')}
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border resize-none font-mono text-sm ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.textSorter.sortedOutput', 'Sorted Output')}
              </label>
              <button
                onClick={handleCopy}
                disabled={!sorted}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.textSorter.copied', 'Copied!') : t('tools.textSorter.copy', 'Copy')}
              </button>
            </div>
            <textarea
              value={sorted}
              readOnly
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border resize-none font-mono text-sm ${
                isDark
                  ? 'bg-blue-900/20 border-blue-800 text-white'
                  : 'bg-blue-50 border-blue-100 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.textSorter.tip', 'Tip:')}</strong> Use numeric sort for lines containing numbers (e.g., "Item 10" will come after "Item 2").
            Use shuffle to randomize the order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextSorterTool;
