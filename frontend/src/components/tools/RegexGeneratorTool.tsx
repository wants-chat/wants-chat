import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSearch, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RegexGeneratorToolProps {
  uiConfig?: UIConfig;
}

const commonPatterns = [
  { label: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: 'Validates email addresses' },
  { label: 'URL', pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$', description: 'Validates URLs with optional protocol' },
  { label: 'Phone (US)', pattern: '^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$', description: 'US phone number formats' },
  { label: 'Phone (Intl)', pattern: '^\\+?[1-9]\\d{1,14}$', description: 'International phone format (E.164)' },
  { label: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', description: 'ISO date format' },
  { label: 'Date (MM/DD/YYYY)', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])\\/\\d{4}$', description: 'US date format' },
  { label: 'Time (24h)', pattern: '^([01]?\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$', description: '24-hour time format' },
  { label: 'IPv4 Address', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', description: 'IPv4 address validation' },
  { label: 'IPv6 Address', pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$', description: 'IPv6 address (full format)' },
  { label: 'Hex Color', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', description: 'Hex color code (#RGB or #RRGGBB)' },
  { label: 'Credit Card', pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$', description: 'Major credit card formats' },
  { label: 'SSN', pattern: '^\\d{3}-\\d{2}-\\d{4}$', description: 'US Social Security Number' },
  { label: 'ZIP Code (US)', pattern: '^\\d{5}(-\\d{4})?$', description: 'US ZIP code (5 or 9 digit)' },
  { label: 'Username', pattern: '^[a-zA-Z0-9_]{3,16}$', description: 'Alphanumeric username (3-16 chars)' },
  { label: 'Password (Strong)', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', description: 'Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special' },
  { label: 'Slug', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', description: 'URL-friendly slug' },
  { label: 'UUID', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', description: 'UUID v1-5 format' },
  { label: 'HTML Tag', pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)', description: 'Matches HTML tags' },
  { label: 'File Extension', pattern: '\\.[a-zA-Z0-9]+$', description: 'File extension at end of string' },
  { label: 'Whitespace', pattern: '^\\s*$', description: 'Only whitespace characters' },
];

const cheatSheet = [
  { symbol: '.', meaning: 'Any character except newline' },
  { symbol: '\\d', meaning: 'Digit (0-9)' },
  { symbol: '\\w', meaning: 'Word character (a-z, A-Z, 0-9, _)' },
  { symbol: '\\s', meaning: 'Whitespace' },
  { symbol: '^', meaning: 'Start of string' },
  { symbol: '$', meaning: 'End of string' },
  { symbol: '*', meaning: 'Zero or more' },
  { symbol: '+', meaning: 'One or more' },
  { symbol: '?', meaning: 'Zero or one' },
  { symbol: '{n}', meaning: 'Exactly n times' },
  { symbol: '{n,}', meaning: 'n or more times' },
  { symbol: '{n,m}', meaning: 'Between n and m times' },
  { symbol: '[abc]', meaning: 'Any of a, b, or c' },
  { symbol: '[^abc]', meaning: 'Not a, b, or c' },
  { symbol: '(abc)', meaning: 'Capture group' },
  { symbol: 'a|b', meaning: 'a or b' },
];

export const RegexGeneratorTool: React.FC<RegexGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [copied, setCopied] = useState<string | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.code) {
        setPattern(params.code);
        setIsPrefilled(true);
      }
      if (params.text || params.content) {
        setTestString(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const getMatches = (): { match: string; index: number; groups: string[] }[] => {
    if (!pattern || !testString) return [];

    try {
      const flagStr = Object.entries(flags)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join('');
      const regex = new RegExp(pattern, flagStr);
      const matches: { match: string; index: number; groups: string[] }[] = [];

      if (flags.g) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      return matches;
    } catch {
      return [];
    }
  };

  const isValidRegex = (): boolean => {
    if (!pattern) return true;
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectPattern = (pat: string) => {
    setPattern(pat);
    setSearchQuery('');
  };

  const filteredPatterns = searchQuery
    ? commonPatterns.filter(
        p =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commonPatterns;

  const matches = getMatches();
  const valid = isValidRegex();

  const highlightedText = () => {
    if (!testString || !pattern || !valid || matches.length === 0) {
      return testString;
    }

    try {
      const flagStr = Object.entries(flags)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join('');
      const regex = new RegExp(`(${pattern})`, flagStr);
      const parts = testString.split(regex);

      return parts.map((part, i) => {
        if (regex.test(part)) {
          return (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return part;
      });
    } catch {
      return testString;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <FileSearch className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.regexGenerator.regexGenerator', 'Regex Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.regexGenerator.buildAndTestRegularExpressions', 'Build and test regular expressions')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('tools.regexGenerator.cheatSheet', 'Cheat Sheet')}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.regexGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Cheat Sheet */}
        {showCheatSheet && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.regexGenerator.regexCheatSheet', 'Regex Cheat Sheet')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cheatSheet.map((item) => (
                <div key={item.symbol} className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <code className="text-pink-500 font-mono text-sm">{item.symbol}</code>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Patterns */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.regexGenerator.commonPatterns', 'Common Patterns')}</h4>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.regexGenerator.searchPatterns', 'Search patterns...')}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {filteredPatterns.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSelectPattern(item.pattern)}
                className={`p-3 rounded-lg text-left transition-all ${
                  pattern === item.pattern
                    ? 'bg-pink-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <p className="font-medium text-sm">{item.label}</p>
                <p className={`text-xs mt-1 ${pattern === item.pattern ? 'text-pink-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.regexGenerator.regexPattern', 'Regex Pattern')}
            </label>
            <div className="flex gap-2">
              {Object.entries(flags).map(([flag, enabled]) => (
                <button
                  key={flag}
                  onClick={() => setFlags({ ...flags, [flag]: !enabled })}
                  className={`w-8 h-8 rounded text-sm font-mono transition-colors ${
                    enabled
                      ? 'bg-pink-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={flag === 'g' ? 'Global' : flag === 'i' ? t('tools.regexGenerator.caseInsensitive', 'Case insensitive') : t('tools.regexGenerator.multiline', 'Multiline')}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={t('tools.regexGenerator.enterYourRegexPattern', 'Enter your regex pattern')}
              className={`w-full pl-8 pr-16 py-3 rounded-lg border font-mono ${
                !valid
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:border-transparent`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              /{Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join('')}
            </span>
          </div>
          {!valid && (
            <p className="text-red-500 text-sm">{t('tools.regexGenerator.invalidRegexPattern', 'Invalid regex pattern')}</p>
          )}
        </div>

        {/* Test String */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.regexGenerator.testString', 'Test String')}
          </label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder={t('tools.regexGenerator.enterTextToTestAgainst', 'Enter text to test against the pattern')}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
          />
        </div>

        {/* Highlighted Result */}
        {testString && pattern && valid && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Highlighted Matches ({matches.length})
            </label>
            <div className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap ${
              isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
              {highlightedText()}
            </div>
          </div>
        )}

        {/* Match Results */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.regexGenerator.matchDetails', 'Match Details')}
            </label>
            <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>#</th>
                    <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.regexGenerator.match', 'Match')}</th>
                    <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.regexGenerator.index', 'Index')}</th>
                    <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.regexGenerator.groups', 'Groups')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {matches.slice(0, 10).map((m, i) => (
                    <tr key={i} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                      <td className={`px-4 py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</td>
                      <td className={`px-4 py-2 font-mono ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{m.match}</td>
                      <td className={`px-4 py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m.index}</td>
                      <td className={`px-4 py-2 font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {m.groups.length > 0 ? m.groups.join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 10 && (
                <p className={`px-4 py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ...and {matches.length - 10} more matches
                </p>
              )}
            </div>
          </div>
        )}

        {/* Copy Buttons */}
        {pattern && valid && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCopy(pattern, 'pattern')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                copied === 'pattern'
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied === 'pattern' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy Pattern
            </button>
            <button
              onClick={() => handleCopy(`/${pattern}/${Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join('')}`, 'literal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                copied === 'literal'
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied === 'literal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy as Literal
            </button>
            <button
              onClick={() => handleCopy(`new RegExp('${pattern.replace(/'/g, "\\'")}', '${Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join('')}')`, 'js')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                copied === 'js'
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy as JavaScript
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegexGeneratorTool;
