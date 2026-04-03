import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCompare, Copy, Trash2, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: { left?: number; right?: number };
}

interface TextCompareToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS = [
  { key: 'lineNumber', label: 'Line' },
  { key: 'type', label: 'Type' },
  { key: 'content', label: 'Content' },
];

export const TextCompareTool: React.FC<TextCompareToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setLeftText(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [hasCompared, setHasCompared] = useState(false);
  const [viewMode, setViewMode] = useState<'unified' | 'side-by-side'>('unified');

  const computeDiff = () => {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    const result: DiffLine[] = [];

    // Simple LCS-based diff
    const maxLen = Math.max(leftLines.length, rightLines.length);
    let leftIdx = 0;
    let rightIdx = 0;

    for (let i = 0; i < maxLen; i++) {
      const leftLine = leftLines[leftIdx];
      const rightLine = rightLines[rightIdx];

      if (leftLine === rightLine) {
        result.push({
          type: 'unchanged',
          content: leftLine || '',
          lineNumber: { left: leftIdx + 1, right: rightIdx + 1 }
        });
        leftIdx++;
        rightIdx++;
      } else if (leftIdx < leftLines.length && (rightIdx >= rightLines.length || !rightLines.slice(rightIdx).includes(leftLine))) {
        result.push({
          type: 'removed',
          content: leftLine || '',
          lineNumber: { left: leftIdx + 1 }
        });
        leftIdx++;
      } else if (rightIdx < rightLines.length) {
        result.push({
          type: 'added',
          content: rightLine || '',
          lineNumber: { right: rightIdx + 1 }
        });
        rightIdx++;
      }
    }

    // Handle remaining lines
    while (leftIdx < leftLines.length) {
      result.push({
        type: 'removed',
        content: leftLines[leftIdx],
        lineNumber: { left: leftIdx + 1 }
      });
      leftIdx++;
    }

    while (rightIdx < rightLines.length) {
      result.push({
        type: 'added',
        content: rightLines[rightIdx],
        lineNumber: { right: rightIdx + 1 }
      });
      rightIdx++;
    }

    setDiffResult(result);
    setHasCompared(true);
  };

  const handleSwap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    setHasCompared(false);
    setDiffResult([]);
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
    setDiffResult([]);
    setHasCompared(false);
  };

  const handleCopyDiff = () => {
    const diffText = diffResult
      .map(line => {
        if (line.type === 'added') return `+ ${line.content}`;
        if (line.type === 'removed') return `- ${line.content}`;
        return `  ${line.content}`;
      })
      .join('\n');
    navigator.clipboard.writeText(diffText);
  };

  const handleExportCSV = () => {
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = diffResult.map(line => {
      const lineNum = line.lineNumber.left || line.lineNumber.right || '';
      return [lineNum, line.type, `"${line.content.replace(/"/g, '""')}"`].join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-comparison.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    added: diffResult.filter(d => d.type === 'added').length,
    removed: diffResult.filter(d => d.type === 'removed').length,
    unchanged: diffResult.filter(d => d.type === 'unchanged').length,
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <GitCompare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.textCompare.textCompare', 'Text Compare')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.textCompare.compareAndFindDifferencesBetween', 'Compare and find differences between two texts')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'unified'
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.textCompare.unified', 'Unified')}
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.textCompare.sideBySide', 'Side by Side')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.textCompare.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Input Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.textCompare.originalText', 'Original Text')}
            </label>
            <textarea
              value={leftText}
              onChange={(e) => {
                setLeftText(e.target.value);
                setHasCompared(false);
              }}
              placeholder={t('tools.textCompare.enterOriginalTextHere', 'Enter original text here...')}
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Swap Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
            <button
              onClick={handleSwap}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors z-10`}
              title={t('tools.textCompare.swapTexts', 'Swap texts')}
            >
              <ArrowRightLeft className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.textCompare.modifiedText', 'Modified Text')}
            </label>
            <textarea
              value={rightText}
              onChange={(e) => {
                setRightText(e.target.value);
                setHasCompared(false);
              }}
              placeholder={t('tools.textCompare.enterModifiedTextHere', 'Enter modified text here...')}
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={computeDiff}
            disabled={!leftText && !rightText}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <GitCompare className="w-5 h-5" />
            {t('tools.textCompare.compareTexts', 'Compare Texts')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <ExportDropdown
            onExportCSV={hasCompared && diffResult.length > 0 ? handleExportCSV : undefined}
            showImport={false}
            disabled={!hasCompared}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Diff Results */}
        {hasCompared && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="inline-block w-3 h-3 rounded bg-green-500/20 mr-1" />
                  <span className="text-green-500 font-medium">+{stats.added}</span> added
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="inline-block w-3 h-3 rounded bg-red-500/20 mr-1" />
                  <span className="text-red-500 font-medium">-{stats.removed}</span> removed
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-gray-500 font-medium">{stats.unchanged}</span> unchanged
                </span>
              </div>
              <button
                onClick={handleCopyDiff}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {t('tools.textCompare.copyDiff', 'Copy Diff')}
              </button>
            </div>

            {/* Diff View */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border overflow-hidden`}>
              {viewMode === 'unified' ? (
                <div className="overflow-x-auto">
                  <div className="font-mono text-sm">
                    {diffResult.map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          line.type === 'added'
                            ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                            : line.type === 'removed'
                            ? isDark ? 'bg-red-900/20' : 'bg-red-50'
                            : ''
                        }`}
                      >
                        <div className={`w-12 px-2 py-1 text-right text-xs ${isDark ? 'text-gray-500 border-r border-gray-700' : 'text-gray-400 border-r border-gray-200'}`}>
                          {line.lineNumber.left || line.lineNumber.right}
                        </div>
                        <div className={`w-6 px-1 py-1 text-center font-bold ${
                          line.type === 'added'
                            ? 'text-green-500'
                            : line.type === 'removed'
                            ? 'text-red-500'
                            : isDark ? 'text-gray-600' : 'text-gray-300'
                        }`}>
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </div>
                        <pre className={`flex-1 px-2 py-1 overflow-x-auto ${
                          line.type === 'added'
                            ? isDark ? 'text-green-300' : 'text-green-700'
                            : line.type === 'removed'
                            ? isDark ? 'text-red-300' : 'text-red-700'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {line.content || ' '}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 divide-x divide-gray-700">
                  <div className="font-mono text-sm">
                    {diffResult.filter(d => d.type !== 'added').map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          line.type === 'removed'
                            ? isDark ? 'bg-red-900/20' : 'bg-red-50'
                            : ''
                        }`}
                      >
                        <div className={`w-10 px-2 py-1 text-right text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {line.lineNumber.left || ''}
                        </div>
                        <pre className={`flex-1 px-2 py-1 overflow-x-auto ${
                          line.type === 'removed'
                            ? isDark ? 'text-red-300' : 'text-red-700'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {line.content || ' '}
                        </pre>
                      </div>
                    ))}
                  </div>
                  <div className="font-mono text-sm">
                    {diffResult.filter(d => d.type !== 'removed').map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          line.type === 'added'
                            ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                            : ''
                        }`}
                      >
                        <div className={`w-10 px-2 py-1 text-right text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {line.lineNumber.right || ''}
                        </div>
                        <pre className={`flex-1 px-2 py-1 overflow-x-auto ${
                          line.type === 'added'
                            ? isDark ? 'text-green-300' : 'text-green-700'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {line.content || ' '}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {diffResult.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.textCompare.bothTextsAreIdentical', 'Both texts are identical')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextCompareTool;
