import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, ArrowLeftRight, Sparkles, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PigLatinToolProps {
  uiConfig?: UIConfig;
}

const vowels = ['a', 'e', 'i', 'o', 'u'];

export const PigLatinTool = ({ uiConfig }: PigLatinToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [mode, setMode] = useState<'toPigLatin' | 'fromPigLatin'>('toPigLatin');
  const [copied, setCopied] = useState(false);
  const [preserveCase, setPreserveCase] = useState(true);

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

  useEffect(() => {
    if (mode === 'toPigLatin') {
      setOutput(toPigLatin(input));
    } else {
      setOutput(fromPigLatin(input));
    }
  }, [input, mode, preserveCase]);

  const isVowel = (char: string): boolean => {
    return vowels.includes(char.toLowerCase());
  };

  const isLetter = (char: string): boolean => {
    return /[a-zA-Z]/.test(char);
  };

  const isUpperCase = (char: string): boolean => {
    return char === char.toUpperCase() && char !== char.toLowerCase();
  };

  const applyCase = (original: string, converted: string): string => {
    if (!preserveCase) return converted.toLowerCase();

    // Check if original was all caps
    if (original === original.toUpperCase() && original.length > 1) {
      return converted.toUpperCase();
    }

    // Check if original started with capital
    if (isUpperCase(original[0])) {
      return converted.charAt(0).toUpperCase() + converted.slice(1).toLowerCase();
    }

    return converted.toLowerCase();
  };

  const wordToPigLatin = (word: string): string => {
    if (!word) return word;

    // Extract leading and trailing punctuation
    const leadingPunct = word.match(/^[^a-zA-Z]*/)?.[0] || '';
    const trailingPunct = word.match(/[^a-zA-Z]*$/)?.[0] || '';
    const cleanWord = word.slice(leadingPunct.length, word.length - (trailingPunct.length || undefined));

    if (!cleanWord) return word;

    let result: string;
    const lowerWord = cleanWord.toLowerCase();

    // Rule 1: If word starts with vowel, add "way" or "yay"
    if (isVowel(lowerWord[0])) {
      result = lowerWord + 'way';
    }
    // Rule 2: If word starts with consonant cluster, move to end and add "ay"
    else {
      let consonantCluster = '';
      let i = 0;

      // Special case: 'qu' is treated as a consonant cluster
      while (i < lowerWord.length && (!isVowel(lowerWord[i]) || (lowerWord[i - 1] === 'q' && lowerWord[i] === 'u'))) {
        consonantCluster += lowerWord[i];
        i++;
      }

      // Handle 'y' as a vowel when it's not at the start
      if (consonantCluster.length === lowerWord.length && lowerWord.includes('y') && lowerWord.indexOf('y') > 0) {
        const yIndex = lowerWord.indexOf('y');
        consonantCluster = lowerWord.slice(0, yIndex);
        i = yIndex;
      }

      result = lowerWord.slice(i) + consonantCluster + 'ay';
    }

    result = applyCase(cleanWord, result);
    return leadingPunct + result + trailingPunct;
  };

  const wordFromPigLatin = (word: string): string => {
    if (!word) return word;

    // Extract leading and trailing punctuation
    const leadingPunct = word.match(/^[^a-zA-Z]*/)?.[0] || '';
    const trailingPunct = word.match(/[^a-zA-Z]*$/)?.[0] || '';
    const cleanWord = word.slice(leadingPunct.length, word.length - (trailingPunct.length || undefined));

    if (!cleanWord) return word;

    const lowerWord = cleanWord.toLowerCase();
    let result: string;

    // Check if it ends with "way" (vowel start words)
    if (lowerWord.endsWith('way') && lowerWord.length > 3) {
      const base = lowerWord.slice(0, -3);
      // Check if the first letter of base is a vowel
      if (isVowel(base[0])) {
        result = base;
      } else {
        result = lowerWord; // Not valid pig latin
      }
    }
    // Check if it ends with "ay"
    else if (lowerWord.endsWith('ay') && lowerWord.length > 2) {
      const base = lowerWord.slice(0, -2);
      // Find where the consonant cluster might be
      let i = base.length - 1;
      while (i >= 0 && !isVowel(base[i])) {
        i--;
      }
      const consonants = base.slice(i + 1);
      const rest = base.slice(0, i + 1);
      result = consonants + rest;
    }
    else {
      result = lowerWord; // Not pig latin
    }

    result = applyCase(cleanWord, result);
    return leadingPunct + result + trailingPunct;
  };

  const toPigLatin = (text: string): string => {
    return text.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part;
      return wordToPigLatin(part);
    }).join('');
  };

  const fromPigLatin = (text: string): string => {
    return text.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part;
      return wordFromPigLatin(part);
    }).join('');
  };

  const handleSwap = () => {
    setMode(mode === 'toPigLatin' ? 'fromPigLatin' : 'toPigLatin');
    setInput(output);
    setIsPrefilled(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsPrefilled(false);
  };

  const examples = [
    { english: 'Hello', pigLatin: 'Ellohay' },
    { english: 'World', pigLatin: 'Orldway' },
    { english: 'Apple', pigLatin: 'Appleway' },
    { english: 'Smile', pigLatin: 'Ilesmay' },
    { english: 'Question', pigLatin: 'Estionquay' },
    { english: 'String', pigLatin: 'Ingstray' },
  ];

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.pigLatin.pigLatinTranslator', 'Pig Latin Translator')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.pigLatin.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`font-medium ${mode === 'toPigLatin' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.pigLatin.english', 'English')}
          </span>
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <span className={`font-medium ${mode === 'fromPigLatin' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.pigLatin.pigLatin', 'Pig Latin')}
          </span>
        </div>

        {/* Options */}
        <div className="flex justify-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveCase}
              onChange={(e) => setPreserveCase(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.pigLatin.preserveCapitalization', 'Preserve capitalization')}
            </span>
          </label>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {mode === 'toPigLatin' ? t('tools.pigLatin.enterEnglishText', 'Enter English Text') : t('tools.pigLatin.enterPigLatinText', 'Enter Pig Latin Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'toPigLatin' ? t('tools.pigLatin.typeYourMessageHere', 'Type your message here...') : t('tools.pigLatin.ypetayOuryayEssagemayErehay', 'Ypetay ouryay essagemay erehay...')}
            className={`w-full h-32 px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {mode === 'toPigLatin' ? t('tools.pigLatin.pigLatin2', 'Pig Latin') : t('tools.pigLatin.english2', 'English')}
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.pigLatin.copied', 'Copied!') : t('tools.pigLatin.copy', 'Copy')}
              </button>
            )}
          </div>
          <div
            className={`w-full min-h-[128px] px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          >
            {output || <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t('tools.pigLatin.outputWillAppearHere', 'Output will appear here...')}</span>}
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex justify-end">
          <button
            onClick={handleClear}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t('tools.pigLatin.clear', 'Clear')}
          </button>
        </div>

        {/* Examples */}
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pigLatin.quickExamples', 'Quick Examples')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {examples.map((ex, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(mode === 'toPigLatin' ? ex.english : ex.pigLatin);
                  setIsPrefilled(false);
                }}
                className={`p-3 rounded-lg text-left transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {ex.english}
                </div>
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {ex.pigLatin}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pigLatin.pigLatinRules', 'Pig Latin Rules')}
          </h3>
          <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>
              <strong>1. Words starting with consonants:</strong> Move the consonant(s) to the end and add "ay"
              <br />
              <span className="text-[#0D9488]">{t('tools.pigLatin.exampleHelloBecomesEllohay', 'Example: "hello" becomes "ellohay"')}</span>
            </li>
            <li>
              <strong>2. Words starting with vowels:</strong> Add "way" to the end
              <br />
              <span className="text-[#0D9488]">{t('tools.pigLatin.exampleAppleBecomesAppleway', 'Example: "apple" becomes "appleway"')}</span>
            </li>
            <li>
              <strong>3. Consonant clusters:</strong> Move the entire cluster before adding "ay"
              <br />
              <span className="text-[#0D9488]">{t('tools.pigLatin.exampleStringBecomesIngstray', 'Example: "string" becomes "ingstray"')}</span>
            </li>
            <li>
              <strong>4. Special case "qu":</strong> Treat "qu" as a consonant cluster
              <br />
              <span className="text-[#0D9488]">{t('tools.pigLatin.exampleQuestionBecomesEstionquay', 'Example: "question" becomes "estionquay"')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
