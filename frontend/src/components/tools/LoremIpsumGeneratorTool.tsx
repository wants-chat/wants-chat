import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, Type, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface LoremIpsumGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const LoremIpsumGeneratorTool = ({ uiConfig }: LoremIpsumGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [paragraphs, setParagraphs] = useState(3);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'vitae', 'elementum',
    'tempus', 'egestas', 'fringilla', 'purus', 'volutpat', 'commodo', 'vivamus',
    'arcu', 'felis', 'bibendum', 'at', 'varius', 'vel', 'pharetra', 'turpis',
    'nunc', 'eget', 'lorem', 'donec', 'massa', 'sapien', 'faucibus', 'cursus',
    'integer', 'enim', 'neque', 'volutpat', 'ac', 'tincidunt', 'vitae', 'semper',
    'quis', 'lectus', 'nulla', 'facilisi', 'morbi', 'proin', 'libero', 'nunc',
    'consequat', 'interdum', 'varius', 'maecenas', 'ultricies', 'pellentesque',
    'habitant', 'tristique', 'senectus', 'netus', 'malesuada', 'fames', 'turpis',
    'egestas', 'integer', 'eget', 'aliquet', 'nibh', 'praesent', 'tristique',
    'magna', 'mattis', 'pulvinar', 'etiam', 'erat', 'velit', 'scelerisque',
    'mauris', 'pellentesque', 'diam', 'venenatis', 'condimentum', 'lacinia',
    'quis', 'vel', 'eros', 'donec', 'ac', 'odio', 'tempor', 'orci', 'dapibus',
    'ultrices', 'iaculis', 'nunc', 'sed', 'augue', 'lacus', 'viverra', 'vitae',
    'congue', 'eu', 'consequat', 'dui', 'nunc', 'mattis', 'enim', 'rhoncus',
    'elementum', 'integer', 'enim', 'neque', 'volutpat', 'ac', 'tincidunt'
  ];

  const loremStart = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateParagraph = (wordCount: number, isFirst: boolean): string => {
    const words: string[] = [];

    if (isFirst && startWithLorem) {
      // Start with classic lorem ipsum
      const startWords = loremStart.toLowerCase().split(/\s+/);
      words.push(...startWords);
      wordCount -= startWords.length;
    }

    // Add random words to reach desired count
    for (let i = 0; i < wordCount; i++) {
      const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
      words.push(randomWord);
    }

    // Capitalize first word
    if (words.length > 0) {
      words[0] = capitalizeFirst(words[0]);
    }

    // Add periods every 10-15 words for variety
    let result = '';
    let sentenceLength = 0;
    const targetSentenceLength = Math.floor(Math.random() * 6) + 10; // 10-15 words

    for (let i = 0; i < words.length; i++) {
      result += words[i];
      sentenceLength++;

      if (sentenceLength >= targetSentenceLength && i < words.length - 1) {
        result += '. ';
        // Capitalize next word
        if (i + 1 < words.length) {
          words[i + 1] = capitalizeFirst(words[i + 1]);
        }
        sentenceLength = 0;
      } else if (i < words.length - 1) {
        result += ' ';
      }
    }

    // Ensure paragraph ends with period
    if (!result.endsWith('.')) {
      result += '.';
    }

    return result;
  };

  const handleGenerate = () => {
    const paragraphCount = Math.min(Math.max(1, paragraphs), 20);
    const wordCount = Math.min(Math.max(10, wordsPerParagraph), 200);

    const generatedParagraphs: string[] = [];

    for (let i = 0; i < paragraphCount; i++) {
      generatedParagraphs.push(generateParagraph(wordCount, i === 0));
    }

    setOutput(generatedParagraphs.join('\n\n'));
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setOutput('');
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Lorem Ipsum can prefill paragraph count if specified
      if (params.numbers && params.numbers.length > 0) {
        const prefillParagraphs = Math.min(Math.max(1, params.numbers[0]), 20);
        setParagraphs(prefillParagraphs);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const charCount = output.length;

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.loremIpsumGenerator.loremIpsumGenerator', 'Lorem Ipsum Generator')}
      </h2>

      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Paragraphs Count */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Number of Paragraphs: {paragraphs}
              {isPrefilled && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#0D9488]">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.loremIpsumGenerator.prefilledFromAi', 'Prefilled from AI')}
                </span>
              )}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={paragraphs}
              onChange={(e) => setParagraphs(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          {/* Words Per Paragraph */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Words per Paragraph: {wordsPerParagraph}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={wordsPerParagraph}
              onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>200</span>
            </div>
          </div>
        </div>

        {/* Start with Lorem Option */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {t('tools.loremIpsumGenerator.startWithLoremIpsumDolor', 'Start with "Lorem ipsum dolor sit amet..."')}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            {t('tools.loremIpsumGenerator.generateLoremIpsum', 'Generate Lorem Ipsum')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.loremIpsumGenerator.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.loremIpsumGenerator.generatedText', 'Generated Text')}
            </label>
            <div className="flex items-center gap-4">
              {output && (
                <>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {wordCount} words, {charCount} characters
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                      copied
                        ? 'bg-green-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? t('tools.loremIpsumGenerator.copied', 'Copied!') : t('tools.loremIpsumGenerator.copy', 'Copy')}
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.loremIpsumGenerator.clickGenerateToCreateLorem', 'Click \'Generate\' to create Lorem Ipsum text...')}
            className={`w-full h-96 px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none leading-relaxed`}
          />
        </div>

        {/* Quick Actions */}
        {output && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setParagraphs(1); setWordsPerParagraph(50); handleGenerate(); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.loremIpsumGenerator.1ShortParagraph', '1 Short Paragraph')}
            </button>
            <button
              onClick={() => { setParagraphs(3); setWordsPerParagraph(75); handleGenerate(); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.loremIpsumGenerator.3MediumParagraphs', '3 Medium Paragraphs')}
            </button>
            <button
              onClick={() => { setParagraphs(5); setWordsPerParagraph(100); handleGenerate(); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.loremIpsumGenerator.5LongParagraphs', '5 Long Paragraphs')}
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.loremIpsumGenerator.aboutLoremIpsum', 'About Lorem Ipsum')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.loremIpsumGenerator.loremIpsumIsPlaceholderText', 'Lorem Ipsum is placeholder text commonly used in design and publishing. It helps visualize how text will look in a layout without the distraction of meaningful content. The text is derived from sections of Cicero\'s "De Finibus Bonorum et Malorum" written in 45 BC.')}
          </p>
        </div>
      </div>
    </div>
  );
};
