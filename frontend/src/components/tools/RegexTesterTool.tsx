import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, AlertCircle, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface RegexTesterToolProps {
  uiConfig?: UIConfig;
}

interface Match {
  match: string;
  index: number;
  groups: string[];
}

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { name: 'Hex Color', pattern: '#[0-9a-fA-F]{6}\\b|#[0-9a-fA-F]{3}\\b' },
  { name: 'Credit Card', pattern: '\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}' },
  { name: 'Username', pattern: '^[a-zA-Z0-9_]{3,16}$' },
];

const COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'match', label: 'Match' },
  { key: 'groups', label: 'Groups' },
];

export const RegexTesterTool: React.FC<RegexTesterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [pattern, setPattern] = useState('\\b[A-Z][a-z]+\\b');
  const [testString, setTestString] = useState('Hello World! This is a Test String with Multiple Words.');
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setTestString(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    testRegex();
  }, [pattern, testString, flags]);

  const testRegex = () => {
    try {
      setError('');
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');

      const regex = new RegExp(pattern, flagString);
      const foundMatches: Match[] = [];

      if (flags.g) {
        let match;
        const tempRegex = new RegExp(pattern, flagString);
        while ((match = tempRegex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (!flags.g) break;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(foundMatches);
      highlightMatches(foundMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regular expression');
      setMatches([]);
      setHighlightedText(testString);
    }
  };

  const highlightMatches = (foundMatches: Match[]) => {
    if (foundMatches.length === 0) {
      setHighlightedText(testString);
      return;
    }

    let result = '';
    let lastIndex = 0;

    foundMatches.forEach((match, i) => {
      result += escapeHtml(testString.slice(lastIndex, match.index));
      result += `<mark class="highlight-${i % 5}">${escapeHtml(match.match)}</mark>`;
      lastIndex = match.index + match.match.length;
    });

    result += escapeHtml(testString.slice(lastIndex));
    setHighlightedText(result);
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleFlagToggle = (flag: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleExampleSelect = (examplePattern: string) => {
    setPattern(examplePattern);
    setShowExamples(false);
  };

  const handleCopyPattern = async () => {
    await navigator.clipboard.writeText(pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = COLUMNS.map((col) => col.label).join(',');
    const rows = matches.map((match) =>
      [match.index, `"${match.match.replace(/"/g, '""')}"`, `"${match.groups.join('; ')}"`].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `regex-matches-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const data = {
      pattern,
      flags: Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag),
      testString,
      matches: matches.map((match) => ({
        match: match.match,
        index: match.index,
        groups: match.groups,
      })),
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `regex-matches-${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    try {
      const headers = COLUMNS.map((col) => col.label).join('\t');
      const rows = matches.map((match) =>
        [match.index, match.match, match.groups.join('; ')].join('\t')
      );
      const text = [headers, ...rows].join('\n');
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.regexTester.regexTester', 'Regex Tester')}
        </h2>
        {matches.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            onCopyToClipboard={handleCopyToClipboard}
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
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.regexTester.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Pattern Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.regexTester.regularExpressionPattern', 'Regular Expression Pattern')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={t('tools.regexTester.enterRegexPattern', 'Enter regex pattern')}
              className={`flex-1 p-3 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <button
              onClick={handleCopyPattern}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Flags */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.regexTester.flags', 'Flags')}
          </label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(flags).map(([flag, enabled]) => (
              <label
                key={flag}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  enabled
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleFlagToggle(flag as keyof typeof flags)}
                  className="sr-only"
                />
                <span className="font-mono font-bold">{flag}</span>
                <span className="text-xs">
                  {flag === 'g' && '(global)'}
                  {flag === 'i' && '(case-insensitive)'}
                  {flag === 'm' && '(multiline)'}
                  {flag === 's' && '(dotall)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Common Examples Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Common Patterns
            <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
          </button>
          {showExamples && (
            <div
              className={`absolute z-10 mt-2 w-full rounded-lg shadow-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              {COMMON_PATTERNS.map((example) => (
                <button
                  key={example.name}
                  onClick={() => handleExampleSelect(example.pattern)}
                  className={`w-full text-left px-4 py-2 hover:bg-[#0D9488]/20 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  } first:rounded-t-lg last:rounded-b-lg`}
                >
                  <div className="font-medium">{example.name}</div>
                  <div className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {example.pattern}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Test String */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.regexTester.testString', 'Test String')}
          </label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder={t('tools.regexTester.enterTextToTestAgainst', 'Enter text to test against the pattern')}
            className={`w-full h-32 p-3 rounded-lg font-mono text-sm border ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Highlighted Text */}
        {!error && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.regexTester.matchesHighlighted', 'Matches Highlighted')}
            </label>
            <div
              className={`w-full min-h-32 p-3 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } whitespace-pre-wrap break-words`}
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          </div>
        )}

        {/* Match Results */}
        {matches.length > 0 && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Matches Found: {matches.length}
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matches.map((match, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold bg-[#0D9488] text-white`}>
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        "{match.match}"
                      </div>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Index: {match.index}
                      </div>
                      {match.groups.length > 0 && (
                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Groups: {match.groups.map((g, gi) => `[${gi + 1}]: "${g}"`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!error && matches.length === 0 && (
          <div className={`text-center p-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.regexTester.noMatchesFound', 'No matches found')}
          </div>
        )}
      </div>

      <style>{`
        mark.highlight-0 { background-color: #fef08a; color: #000; }
        mark.highlight-1 { background-color: #bfdbfe; color: #000; }
        mark.highlight-2 { background-color: #c7d2fe; color: #000; }
        mark.highlight-3 { background-color: #fecaca; color: #000; }
        mark.highlight-4 { background-color: #d9f99d; color: #000; }
      `}</style>
    </div>
  );
};
