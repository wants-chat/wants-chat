import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Type, Hash, Clock, FileText, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Stats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

interface WordCounterToolProps {
  uiConfig?: UIConfig;
}

export const WordCounterTool: React.FC<WordCounterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

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
  const [stats, setStats] = useState<Stats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    calculateStats(input);
  }, [input]);

  const calculateStats = (text: string) => {
    if (!text.trim()) {
      setStats({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
      });
      return;
    }

    // Words
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Characters
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Sentences (split by . ! ?)
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;

    // Paragraphs (split by newlines)
    const paragraphs = text.split(/\n\n+/).filter(para => para.trim().length > 0).length;

    // Reading time (assuming 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    setStats({
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
    });
  };

  const handleCopyStats = async () => {
    const statsText = `
Words: ${stats.words}
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading time: ${stats.readingTime} min
    `.trim();

    await navigator.clipboard.writeText(statsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; unit?: string }> = ({
    icon,
    label,
    value,
    unit = '',
  }) => (
    <div
      className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[#0D9488]">{icon}</div>
        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{label}</div>
      </div>
      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.wordCounter.wordCounter', 'Word Counter')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.wordCounter.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.wordCounter.enterYourText', 'Enter Your Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.wordCounter.startTypingOrPasteYour', 'Start typing or paste your text here...')}
            className={`w-full h-64 p-3 rounded-lg text-sm border ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={<Type className="w-5 h-5" />} label="Words" value={stats.words} />
          <StatCard icon={<Hash className="w-5 h-5" />} label="Characters" value={stats.characters} />
          <StatCard
            icon={<Hash className="w-5 h-5" />}
            label="Characters (no spaces)"
            value={stats.charactersNoSpaces}
          />
          <StatCard icon={<FileText className="w-5 h-5" />} label="Sentences" value={stats.sentences} />
          <StatCard icon={<FileText className="w-5 h-5" />} label="Paragraphs" value={stats.paragraphs} />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Reading Time" value={stats.readingTime} unit="min" />
        </div>

        {/* Copy Stats Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCopyStats}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t('tools.wordCounter.copiedStats', 'Copied Stats!')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('tools.wordCounter.copyStats', 'Copy Stats')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
