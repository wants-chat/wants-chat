import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, RotateCcw, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PalindromeCheckerToolProps {
  uiConfig?: UIConfig;
}

interface CheckResult {
  original: string;
  normalized: string;
  reversed: string;
  isPalindrome: boolean;
  type: 'word' | 'phrase' | 'sentence' | 'number';
}

const famousPalindromes = [
  { text: 'A man, a plan, a canal: Panama', type: 'phrase' },
  { text: 'Was it a car or a cat I saw?', type: 'sentence' },
  { text: 'Never odd or even', type: 'phrase' },
  { text: 'Do geese see God?', type: 'sentence' },
  { text: 'Madam, I\'m Adam', type: 'phrase' },
  { text: 'racecar', type: 'word' },
  { text: 'level', type: 'word' },
  { text: 'radar', type: 'word' },
  { text: '12321', type: 'number' },
  { text: 'A Santa at NASA', type: 'phrase' },
];

export const PalindromeCheckerTool = ({ uiConfig }: PalindromeCheckerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [ignoreSpaces, setIgnoreSpaces] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [ignorePunctuation, setIgnorePunctuation] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<CheckResult[]>([]);

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

  const normalizeText = (text: string): string => {
    let normalized = text;
    if (ignoreCase) normalized = normalized.toLowerCase();
    if (ignorePunctuation) normalized = normalized.replace(/[^\w\s]/g, '');
    if (ignoreSpaces) normalized = normalized.replace(/\s/g, '');
    return normalized;
  };

  const determineType = (text: string): 'word' | 'phrase' | 'sentence' | 'number' => {
    if (/^\d+$/.test(text.trim())) return 'number';
    if (/[.!?]$/.test(text.trim())) return 'sentence';
    if (/\s/.test(text.trim())) return 'phrase';
    return 'word';
  };

  const checkPalindrome = () => {
    if (!input.trim()) return;

    const normalized = normalizeText(input);
    const reversed = normalized.split('').reverse().join('');
    const isPalindrome = normalized === reversed;
    const type = determineType(input);

    const checkResult: CheckResult = {
      original: input,
      normalized,
      reversed,
      isPalindrome,
      type,
    };

    setResult(checkResult);
    setHistory(prev => [checkResult, ...prev.slice(0, 9)]);
  };

  const handleCopy = async () => {
    if (!result) return;
    const summary = `Palindrome Check Result
Original: "${result.original}"
Normalized: "${result.normalized}"
Reversed: "${result.reversed}"
Is Palindrome: ${result.isPalindrome ? 'Yes' : 'No'}
Type: ${result.type}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExampleClick = (text: string) => {
    setInput(text);
    setIsPrefilled(false);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setIsPrefilled(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.palindromeChecker.palindromeChecker', 'Palindrome Checker')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.palindromeChecker.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.palindromeChecker.ignoreCase', 'Ignore case')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreSpaces}
              onChange={(e) => setIgnoreSpaces(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.palindromeChecker.ignoreSpaces', 'Ignore spaces')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignorePunctuation}
              onChange={(e) => setIgnorePunctuation(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.palindromeChecker.ignorePunctuation', 'Ignore punctuation')}
            </span>
          </label>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.palindromeChecker.enterTextToCheck', 'Enter Text to Check')}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkPalindrome()}
              placeholder={t('tools.palindromeChecker.enterAWordPhraseOr', 'Enter a word, phrase, or sentence...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <button
              onClick={checkPalindrome}
              disabled={!input.trim()}
              className="px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {t('tools.palindromeChecker.check', 'Check')}
            </button>
            <button
              onClick={handleClear}
              className={`px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`p-6 rounded-lg border-2 ${
              result.isPalindrome
                ? 'border-green-500 bg-green-500/10'
                : 'border-red-500 bg-red-500/10'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              {result.isPalindrome ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
              <span className={`text-2xl font-bold ${result.isPalindrome ? 'text-green-500' : 'text-red-500'}`}>
                {result.isPalindrome ? 'It\'s a Palindrome!' : 'Not a Palindrome'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.palindromeChecker.original', 'Original')}
                </div>
                <div className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  "{result.original}"
                </div>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.palindromeChecker.normalized', 'Normalized')}
                </div>
                <div className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  "{result.normalized}"
                </div>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.palindromeChecker.reversed', 'Reversed')}
                </div>
                <div className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  "{result.reversed}"
                </div>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.palindromeChecker.type', 'Type')}
                </div>
                <div className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {result.type}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.palindromeChecker.copied', 'Copied!') : t('tools.palindromeChecker.copyResult', 'Copy Result')}
              </button>
            </div>
          </div>
        )}

        {/* Famous Palindromes */}
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.palindromeChecker.tryFamousPalindromes', 'Try Famous Palindromes')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {famousPalindromes.map((item, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(item.text)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.palindromeChecker.recentChecks', 'Recent Checks')}
            </h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  onClick={() => setInput(item.original)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {item.isPalindrome ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {item.original}
                  </span>
                  <span className={`text-xs ml-auto flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.palindromeChecker.whatIsAPalindrome', 'What is a Palindrome?')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            A palindrome is a word, phrase, number, or sequence of characters that reads the same forward and
            backward. Famous examples include "racecar", "level", and the phrase "A man, a plan, a canal: Panama".
            Palindromes often ignore spaces, punctuation, and capitalization when determining if text is palindromic.
          </p>
        </div>
      </div>
    </div>
  );
};
