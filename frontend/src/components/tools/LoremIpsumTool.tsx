import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type OutputType = 'paragraphs' | 'sentences' | 'words';

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
  'nesciunt', 'neque', 'porro', 'quisquam', 'dolorem', 'adipisci', 'numquam',
  'eius', 'modi', 'tempora', 'incidunt', 'magnam', 'quaerat',
];

interface LoremIpsumToolProps {
  uiConfig?: UIConfig;
}

export const LoremIpsumTool: React.FC<LoremIpsumToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [count, setCount] = useState(3);
  const [outputType, setOutputType] = useState<OutputType>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length > 0) {
        setCount(params.numbers[0]);
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setCount(Math.floor(params.amount));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const getRandomWord = (): string => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = (minWords: number = 8, maxWords: number = 15): string => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      words.push(getRandomWord());
    }

    // Capitalize first letter
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    // Add punctuation
    return words.join(' ') + '.';
  };

  const generateParagraph = (minSentences: number = 4, maxSentences: number = 8): string => {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    const sentences: string[] = [];

    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }

    return sentences.join(' ');
  };

  const generatedText = useMemo(() => {
    // Use regenerateKey to force recalculation
    void regenerateKey;

    let result = '';

    switch (outputType) {
      case 'paragraphs':
        const paragraphs: string[] = [];
        for (let i = 0; i < count; i++) {
          if (i === 0 && startWithLorem) {
            paragraphs.push(
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              generateParagraph(3, 6)
            );
          } else {
            paragraphs.push(generateParagraph());
          }
        }
        result = paragraphs.join('\n\n');
        break;

      case 'sentences':
        const sentences: string[] = [];
        for (let i = 0; i < count; i++) {
          if (i === 0 && startWithLorem) {
            sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
          } else {
            sentences.push(generateSentence());
          }
        }
        result = sentences.join(' ');
        break;

      case 'words':
        const words: string[] = [];
        if (startWithLorem) {
          words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        }
        while (words.length < count) {
          words.push(getRandomWord());
        }
        result = words.slice(0, count).join(' ');
        break;
    }

    return result;
  }, [count, outputType, startWithLorem, regenerateKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setRegenerateKey((prev) => prev + 1);
  };

  const wordCount = generatedText.split(/\s+/).filter(Boolean).length;
  const charCount = generatedText.length;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.loremIpsum.loremIpsumGenerator', 'Lorem Ipsum Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.loremIpsum.generatePlaceholderTextForDesigns', 'Generate placeholder text for designs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.loremIpsum.countLoadedFromYourConversation', 'Count loaded from your conversation')}</span>
          </div>
        )}
        {/* Options */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.loremIpsum.type', 'Type')}
              </label>
              <div className="flex gap-2">
                {(['paragraphs', 'sentences', 'words'] as OutputType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOutputType(type)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      outputType === type
                        ? 'bg-emerald-500 text-white'
                        : isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Count: {count}
              </label>
              <input
                type="range"
                min="1"
                max={outputType === 'words' ? 100 : outputType === 'sentences' ? 20 : 10}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500"
                />
                <span className="text-sm">{t('tools.loremIpsum.startWithLoremIpsum', 'Start with "Lorem ipsum"')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.loremIpsum.generatedText', 'Generated Text')}
            </label>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {wordCount} words • {charCount} characters
            </span>
          </div>
          <div className={`p-4 rounded-xl min-h-[200px] max-h-[400px] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {generatedText}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? t('tools.loremIpsum.copied', 'Copied!') : t('tools.loremIpsum.copyText', 'Copy Text')}
          </button>
          <button
            onClick={handleRegenerate}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            {t('tools.loremIpsum.regenerate', 'Regenerate')}
          </button>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.loremIpsum.whatIsLoremIpsum', 'What is Lorem Ipsum?')}</strong> Lorem Ipsum is placeholder text commonly used in the
            printing and design industry. It helps visualize the final look of a design without
            distracting meaningful content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoremIpsumTool;
