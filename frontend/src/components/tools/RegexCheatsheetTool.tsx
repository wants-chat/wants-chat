import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Code, Copy, Check, Search, TestTube, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RegexCheatsheetToolProps {
  uiConfig?: UIConfig;
}

interface RegexPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
  category: string;
}

export const RegexCheatsheetTool: React.FC<RegexCheatsheetToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [copied, setCopied] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testPattern, setTestPattern] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.code) {
        setTestPattern(params.code);
        setIsPrefilled(true);
      }
      if (params.text || params.content) {
        setTestInput(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [testResult, setTestResult] = useState<{ matches: boolean; groups: string[] } | null>(null);

  const patterns: RegexPattern[] = [
    // Character Classes
    { name: 'Any Character', pattern: '.', description: 'Matches any single character except newline', example: 'c.t matches cat, cot, cut', category: 'character' },
    { name: 'Digit', pattern: '\\d', description: 'Matches any digit (0-9)', example: '\\d+ matches 123, 456', category: 'character' },
    { name: 'Non-Digit', pattern: '\\D', description: 'Matches any non-digit', example: '\\D+ matches abc', category: 'character' },
    { name: 'Word Character', pattern: '\\w', description: 'Matches [a-zA-Z0-9_]', example: '\\w+ matches hello_123', category: 'character' },
    { name: 'Non-Word Character', pattern: '\\W', description: 'Matches non-word characters', example: '\\W matches @, #, !', category: 'character' },
    { name: 'Whitespace', pattern: '\\s', description: 'Matches whitespace (space, tab, newline)', example: 'hello\\sworld', category: 'character' },
    { name: 'Non-Whitespace', pattern: '\\S', description: 'Matches non-whitespace', example: '\\S+ matches hello', category: 'character' },
    // Quantifiers
    { name: 'Zero or More', pattern: '*', description: 'Matches 0 or more times', example: 'a* matches "", a, aa, aaa', category: 'quantifier' },
    { name: 'One or More', pattern: '+', description: 'Matches 1 or more times', example: 'a+ matches a, aa, aaa', category: 'quantifier' },
    { name: 'Zero or One', pattern: '?', description: 'Matches 0 or 1 time (optional)', example: 'colou?r matches color, colour', category: 'quantifier' },
    { name: 'Exactly N', pattern: '{n}', description: 'Matches exactly n times', example: 'a{3} matches aaa', category: 'quantifier' },
    { name: 'N or More', pattern: '{n,}', description: 'Matches n or more times', example: 'a{2,} matches aa, aaa, aaaa', category: 'quantifier' },
    { name: 'Between N and M', pattern: '{n,m}', description: 'Matches between n and m times', example: 'a{2,4} matches aa, aaa, aaaa', category: 'quantifier' },
    { name: 'Lazy Quantifier', pattern: '*? +? ??', description: 'Matches as few as possible', example: '<.*?> matches minimal', category: 'quantifier' },
    // Anchors
    { name: 'Start of String', pattern: '^', description: 'Matches start of string', example: '^Hello matches "Hello world"', category: 'anchor' },
    { name: 'End of String', pattern: '$', description: 'Matches end of string', example: 'world$ matches "Hello world"', category: 'anchor' },
    { name: 'Word Boundary', pattern: '\\b', description: 'Matches word boundary', example: '\\bcat\\b matches "cat" not "cats"', category: 'anchor' },
    { name: 'Non-Word Boundary', pattern: '\\B', description: 'Matches non-word boundary', example: '\\Bcat matches "scat"', category: 'anchor' },
    // Groups
    { name: 'Capturing Group', pattern: '(abc)', description: 'Captures matched text', example: '(\\d{3})-(\\d{4}) captures phone parts', category: 'group' },
    { name: 'Non-Capturing Group', pattern: '(?:abc)', description: 'Groups without capturing', example: '(?:ab)+ matches abab', category: 'group' },
    { name: 'Named Group', pattern: '(?<name>abc)', description: 'Captures with a name', example: '(?<year>\\d{4})', category: 'group' },
    { name: 'Alternation', pattern: 'a|b', description: 'Matches a OR b', example: 'cat|dog matches cat or dog', category: 'group' },
    // Lookahead/Lookbehind
    { name: 'Positive Lookahead', pattern: '(?=abc)', description: 'Matches if followed by abc', example: '\\d(?=px) matches digit before px', category: 'lookaround' },
    { name: 'Negative Lookahead', pattern: '(?!abc)', description: 'Matches if NOT followed by abc', example: '\\d(?!px) matches digit not before px', category: 'lookaround' },
    { name: 'Positive Lookbehind', pattern: '(?<=abc)', description: 'Matches if preceded by abc', example: '(?<=\\$)\\d+ matches digits after $', category: 'lookaround' },
    { name: 'Negative Lookbehind', pattern: '(?<!abc)', description: 'Matches if NOT preceded by abc', example: '(?<!\\$)\\d+ matches digits not after $', category: 'lookaround' },
    // Common Patterns
    { name: 'Email', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+', description: 'Matches email addresses', example: 'user@example.com', category: 'common' },
    { name: 'URL', pattern: 'https?://[\\w.-]+(?:/[\\w.-]*)*', description: 'Matches URLs', example: 'https://example.com/path', category: 'common' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', description: 'Matches US phone numbers', example: '(123) 456-7890', category: 'common' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', description: 'Matches ISO date format', example: '2024-01-15', category: 'common' },
    { name: 'IP Address', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', description: 'Matches IPv4 addresses', example: '192.168.1.1', category: 'common' },
    { name: 'Hex Color', pattern: '#[0-9A-Fa-f]{6}', description: 'Matches hex color codes', example: '#FF5733', category: 'common' },
  ];

  const categories = ['all', 'character', 'quantifier', 'anchor', 'group', 'lookaround', 'common'];

  const filteredPatterns = patterns.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.pattern.toLowerCase().includes(search.toLowerCase()) ||
                         p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (pattern: string) => {
    navigator.clipboard.writeText(pattern);
    setCopied(pattern);
    setTimeout(() => setCopied(''), 2000);
  };

  const runTest = () => {
    try {
      const regex = new RegExp(testPattern, 'g');
      const matches = testInput.match(regex);
      setTestResult({
        matches: !!matches,
        groups: matches || [],
      });
    } catch {
      setTestResult({ matches: false, groups: ['Invalid regex pattern'] });
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Code className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.regexCheatsheet.regexCheatsheet', 'Regex Cheatsheet')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.regexCheatsheet.quickReferenceForRegularExpressions', 'Quick reference for regular expressions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.regexCheatsheet.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Regex Tester */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <TestTube className="w-4 h-4 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.regexCheatsheet.testYourRegex', 'Test Your Regex')}</h4>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={testPattern}
              onChange={(e) => setTestPattern(e.target.value)}
              placeholder={t('tools.regexCheatsheet.enterRegexPattern', 'Enter regex pattern...')}
              className={`w-full px-4 py-2 rounded-lg border font-mono ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder={t('tools.regexCheatsheet.enterTestString', 'Enter test string...')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={runTest}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              {t('tools.regexCheatsheet.testPattern', 'Test Pattern')}
            </button>
            {testResult && (
              <div className={`p-3 rounded-lg ${testResult.matches && !testResult.groups.includes('Invalid regex pattern') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {testResult.groups.includes('Invalid regex pattern') ? (
                  <span>{t('tools.regexCheatsheet.invalidRegexPattern', 'Invalid regex pattern')}</span>
                ) : testResult.matches ? (
                  <div>
                    <div className="font-medium">Matches found: {testResult.groups.length}</div>
                    <div className="font-mono text-sm mt-1">{testResult.groups.join(', ')}</div>
                  </div>
                ) : (
                  <span>{t('tools.regexCheatsheet.noMatchesFound', 'No matches found')}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tools.regexCheatsheet.searchPatterns', 'Search patterns...')}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${category === cat ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Patterns List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredPatterns.map((p, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} group`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                      {p.pattern}
                    </code>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                  </div>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{p.description}</p>
                  <p className={`text-xs mt-1 font-mono ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Example: {p.example}</p>
                </div>
                <button
                  onClick={() => handleCopy(p.pattern)}
                  className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${copied === p.pattern ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  {copied === p.pattern ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.regexCheatsheet.flags', 'Flags')}</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}><code className="text-green-500">g</code> - Global</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}><code className="text-green-500">i</code> - Case insensitive</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}><code className="text-green-500">m</code> - Multiline</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}><code className="text-green-500">s</code> - Dotall</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}><code className="text-green-500">u</code> - Unicode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexCheatsheetTool;
