import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface DiffCheckerToolProps {
  uiConfig?: UIConfig;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

interface DiffStats {
  linesAdded: number;
  linesRemoved: number;
  linesChanged: number;
  linesUnchanged: number;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'lineNumber',
    header: 'Line',
    type: 'number',
  },
  {
    key: 'type',
    header: 'Type',
    type: 'string',
  },
  {
    key: 'content',
    header: 'Content',
    type: 'string',
  },
];

export const DiffCheckerTool: React.FC<DiffCheckerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [originalText, setOriginalText] = useState('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
  const [modifiedText, setModifiedText] = useState('Line 1\nLine 2 modified\nLine 3\nNew Line\nLine 5');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [stats, setStats] = useState<DiffStats>({
    linesAdded: 0,
    linesRemoved: 0,
    linesChanged: 0,
    linesUnchanged: 0,
  });
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedModified, setCopiedModified] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setOriginalText(codeContent);
        setIsPrefilled(true);
      }
      // Support sourceText/targetText for diff tools
      if (params.sourceText) {
        setOriginalText(params.sourceText);
        setIsPrefilled(true);
      }
      if (params.targetText) {
        setModifiedText(params.targetText);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    calculateDiff();
  }, [originalText, modifiedText]);

  const calculateDiff = () => {
    const originalLines = originalText.split('\n');
    const modifiedLines = modifiedText.split('\n');
    const diffResult: DiffLine[] = [];
    let stats: DiffStats = {
      linesAdded: 0,
      linesRemoved: 0,
      linesChanged: 0,
      linesUnchanged: 0,
    };

    // Simple line-by-line comparison (can be enhanced with LCS algorithm)
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    let originalIndex = 0;
    let modifiedIndex = 0;

    while (originalIndex < originalLines.length || modifiedIndex < modifiedLines.length) {
      const originalLine = originalLines[originalIndex];
      const modifiedLine = modifiedLines[modifiedIndex];

      if (originalIndex >= originalLines.length) {
        // Added line
        diffResult.push({
          type: 'added',
          content: modifiedLine,
          lineNumber: modifiedIndex + 1,
        });
        stats.linesAdded++;
        modifiedIndex++;
      } else if (modifiedIndex >= modifiedLines.length) {
        // Removed line
        diffResult.push({
          type: 'removed',
          content: originalLine,
          lineNumber: originalIndex + 1,
        });
        stats.linesRemoved++;
        originalIndex++;
      } else if (originalLine === modifiedLine) {
        // Unchanged line
        diffResult.push({
          type: 'unchanged',
          content: originalLine,
          lineNumber: originalIndex + 1,
        });
        stats.linesUnchanged++;
        originalIndex++;
        modifiedIndex++;
      } else {
        // Try to find if the line exists ahead
        const foundInModified = modifiedLines
          .slice(modifiedIndex + 1)
          .findIndex((line) => line === originalLine);
        const foundInOriginal = originalLines
          .slice(originalIndex + 1)
          .findIndex((line) => line === modifiedLine);

        if (foundInModified !== -1 && foundInModified < 3) {
          // Line was removed
          diffResult.push({
            type: 'removed',
            content: originalLine,
            lineNumber: originalIndex + 1,
          });
          stats.linesRemoved++;
          originalIndex++;
        } else if (foundInOriginal !== -1 && foundInOriginal < 3) {
          // Line was added
          diffResult.push({
            type: 'added',
            content: modifiedLine,
            lineNumber: modifiedIndex + 1,
          });
          stats.linesAdded++;
          modifiedIndex++;
        } else {
          // Line was changed
          diffResult.push({
            type: 'removed',
            content: originalLine,
            lineNumber: originalIndex + 1,
          });
          diffResult.push({
            type: 'added',
            content: modifiedLine,
            lineNumber: modifiedIndex + 1,
          });
          stats.linesChanged++;
          originalIndex++;
          modifiedIndex++;
        }
      }
    }

    setDiff(diffResult);
    setStats(stats);
  };

  const handleCopy = async (text: string, setCopied: (value: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiffLineClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-900/30 border-l-4 border-green-500 text-green-200';
      case 'removed':
        return 'bg-red-900/30 border-l-4 border-red-500 text-red-200';
      case 'unchanged':
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
      default:
        return '';
    }
  };

  const getDiffSymbol = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return '+ ';
      case 'removed':
        return '- ';
      case 'unchanged':
        return '  ';
      default:
        return '';
    }
  };

  const handleExportCSV = () => {
    exportToCSV(diff, COLUMNS, { filename: 'diff_results' });
  };

  const handleExportExcel = () => {
    exportToExcel(diff, COLUMNS, { filename: 'diff_results' });
  };

  const handleExportJSON = () => {
    exportToJSON(diff, { filename: 'diff_results' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(diff, COLUMNS, { filename: 'diff_results' });
  };

  const handlePrint = () => {
    printData(diff, COLUMNS);
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(diff, COLUMNS);
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.diffChecker.diffChecker', 'Diff Checker')}
        </h2>
        {diff.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            disabled={diff.length === 0}
            showImport={false}
            theme={theme}
          />
        )}
      </div>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.diffChecker.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Input Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.diffChecker.originalText', 'Original Text')}
              </label>
              <button
                onClick={() => handleCopy(originalText, setCopiedOriginal)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {copiedOriginal ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.diffChecker.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.diffChecker.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder={t('tools.diffChecker.pasteOriginalTextHere', 'Paste original text here...')}
              className={`w-full h-64 p-3 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {/* Modified Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.diffChecker.modifiedText', 'Modified Text')}
              </label>
              <button
                onClick={() => handleCopy(modifiedText, setCopiedModified)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {copiedModified ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.diffChecker.copied2', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.diffChecker.copy2', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              placeholder={t('tools.diffChecker.pasteModifiedTextHere', 'Paste modified text here...')}
              className={`w-full h-64 p-3 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.diffChecker.statistics', 'Statistics')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-green-500 font-bold text-2xl">{stats.linesAdded}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.diffChecker.linesAdded', 'Lines Added')}</div>
            </div>
            <div>
              <div className="text-red-500 font-bold text-2xl">{stats.linesRemoved}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.diffChecker.linesRemoved', 'Lines Removed')}</div>
            </div>
            <div>
              <div className="text-yellow-500 font-bold text-2xl">{stats.linesChanged}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.diffChecker.linesChanged', 'Lines Changed')}</div>
            </div>
            <div>
              <div className={`font-bold text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.linesUnchanged}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.diffChecker.linesUnchanged', 'Lines Unchanged')}</div>
            </div>
          </div>
        </div>

        {/* Diff Display */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.diffChecker.differences', 'Differences')}
          </label>
          <div
            className={`rounded-lg border overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="max-h-96 overflow-y-auto">
              {diff.length === 0 ? (
                <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.diffChecker.noDifferencesFound', 'No differences found')}
                </div>
              ) : (
                <div className="font-mono text-sm">
                  {diff.map((line, index) => (
                    <div
                      key={index}
                      className={`px-4 py-1 ${getDiffLineClass(line.type)}`}
                    >
                      <span className="select-none opacity-60 mr-2">
                        {String(line.lineNumber).padStart(4, ' ')}
                      </span>
                      <span className="select-none font-bold mr-1">
                        {getDiffSymbol(line.type)}
                      </span>
                      <span>{line.content || ' '}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-900/30 border-l-2 border-green-500 rounded"></div>
              <span>{t('tools.diffChecker.added', 'Added')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-900/30 border-l-2 border-red-500 rounded"></div>
              <span>{t('tools.diffChecker.removed', 'Removed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <span>{t('tools.diffChecker.unchanged', 'Unchanged')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
