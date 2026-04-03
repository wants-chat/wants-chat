import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCompare, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DiffResult {
  type: 'equal' | 'added' | 'removed';
  value: string;
}

interface TextDiffToolProps {
  uiConfig?: UIConfig;
}

export const TextDiffTool: React.FC<TextDiffToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setText1(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [compareMode, setCompareMode] = useState<'lines' | 'words' | 'chars'>('lines');
  const [copied, setCopied] = useState(false);

  const computeDiff = (a: string[], b: string[]): DiffResult[] => {
    const results: DiffResult[] = [];
    const m = a.length;
    const n = b.length;

    // Simple LCS-based diff
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff
    let i = m, j = n;
    const temp: DiffResult[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        temp.push({ type: 'equal', value: a[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        temp.push({ type: 'added', value: b[j - 1] });
        j--;
      } else {
        temp.push({ type: 'removed', value: a[i - 1] });
        i--;
      }
    }

    return temp.reverse();
  };

  const diffResults = useMemo(() => {
    if (!text1 && !text2) return [];

    let parts1: string[];
    let parts2: string[];

    switch (compareMode) {
      case 'lines':
        parts1 = text1.split('\n');
        parts2 = text2.split('\n');
        break;
      case 'words':
        parts1 = text1.split(/\s+/).filter(Boolean);
        parts2 = text2.split(/\s+/).filter(Boolean);
        break;
      case 'chars':
        parts1 = text1.split('');
        parts2 = text2.split('');
        break;
    }

    return computeDiff(parts1, parts2);
  }, [text1, text2, compareMode]);

  const stats = useMemo(() => {
    const added = diffResults.filter(d => d.type === 'added').length;
    const removed = diffResults.filter(d => d.type === 'removed').length;
    const unchanged = diffResults.filter(d => d.type === 'equal').length;
    return { added, removed, unchanged };
  }, [diffResults]);

  const handleCopy = () => {
    const diffText = diffResults.map(d => {
      const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
      return prefix + d.value;
    }).join(compareMode === 'lines' ? '\n' : ' ');
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  const handleClear = () => {
    setText1('');
    setText2('');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <GitCompare className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.textDiff.textDiff', 'Text Diff')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.textDiff.compareTwoTextsAndSee', 'Compare two texts and see differences')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['lines', 'words', 'chars'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCompareMode(mode)}
                className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                  compareMode === mode
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.textDiff.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Input Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.textDiff.originalText', 'Original Text')}
            </label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder={t('tools.textDiff.pasteOriginalTextHere', 'Paste original text here...')}
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border resize-none font-mono text-sm ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.textDiff.modifiedText', 'Modified Text')}
            </label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder={t('tools.textDiff.pasteModifiedTextHere', 'Paste modified text here...')}
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border resize-none font-mono text-sm ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSwap}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t('tools.textDiff.swap', 'Swap')}
          </button>
          <button
            onClick={handleClear}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.textDiff.clearAll', 'Clear All')}
          </button>
        </div>

        {/* Stats */}
        {diffResults.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className="text-2xl font-bold text-green-500">+{stats.added}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.textDiff.added', 'Added')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className="text-2xl font-bold text-red-500">-{stats.removed}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.textDiff.removed', 'Removed')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{stats.unchanged}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.textDiff.unchanged', 'Unchanged')}</div>
            </div>
          </div>
        )}

        {/* Diff Output */}
        {diffResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.textDiff.differences', 'Differences')}
              </label>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.textDiff.copied', 'Copied!') : t('tools.textDiff.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-4 rounded-lg overflow-x-auto font-mono text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {compareMode === 'lines' ? (
                <div className="space-y-1">
                  {diffResults.map((diff, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 rounded ${
                        diff.type === 'added'
                          ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : diff.type === 'removed'
                          ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                          : isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-2 opacity-60">
                        {diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : ' '}
                      </span>
                      {diff.value || ' '}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {diffResults.map((diff, idx) => (
                    <span
                      key={idx}
                      className={`px-1 rounded ${
                        diff.type === 'added'
                          ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : diff.type === 'removed'
                          ? isDark ? 'bg-red-900/30 text-red-400 line-through' : 'bg-red-100 text-red-800 line-through'
                          : isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {diff.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.textDiff.tip', 'Tip:')}</strong> Choose compare mode based on your needs - Lines for code/documents,
            Words for prose, Characters for detailed comparison.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextDiffTool;
