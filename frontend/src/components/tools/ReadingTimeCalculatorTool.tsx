import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, Type, BarChart3, Copy, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ReadingTimeCalculatorToolProps {
  uiConfig?: UIConfig;
}

const readingSpeedOptions = [
  { value: 150, label: 'Slow', description: '150 wpm' },
  { value: 200, label: 'Average', description: '200 wpm' },
  { value: 250, label: 'Fast', description: '250 wpm' },
  { value: 300, label: 'Speed Reader', description: '300 wpm' },
];

export const ReadingTimeCalculatorTool: React.FC<ReadingTimeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [text, setText] = useState('');
  const [readingSpeed, setReadingSpeed] = useState(200);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setText(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const stats = useMemo(() => {
    if (!text.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        readingTimeSeconds: 0,
        speakingTimeMinutes: 0,
        speakingTimeSeconds: 0,
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;

    // Reading time (based on selected speed)
    const readingTimeMinutes = Math.floor(words / readingSpeed);
    const readingTimeSeconds = Math.round((words % readingSpeed) / readingSpeed * 60);

    // Speaking time (average 125 wpm for speaking)
    const speakingTimeMinutes = Math.floor(words / 125);
    const speakingTimeSeconds = Math.round((words % 125) / 125 * 60);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTimeMinutes,
      readingTimeSeconds,
      speakingTimeMinutes,
      speakingTimeSeconds,
    };
  }, [text, readingSpeed]);

  const formatTime = (minutes: number, seconds: number): string => {
    if (minutes === 0 && seconds === 0) return '0 sec';
    if (minutes === 0) return `${seconds} sec`;
    if (seconds === 0) return `${minutes} min`;
    return `${minutes} min ${seconds} sec`;
  };

  const handleCopyStats = () => {
    const statsText = `
Text Statistics:
- Characters: ${stats.characters.toLocaleString()} (${stats.charactersNoSpaces.toLocaleString()} without spaces)
- Words: ${stats.words.toLocaleString()}
- Sentences: ${stats.sentences.toLocaleString()}
- Paragraphs: ${stats.paragraphs.toLocaleString()}
- Reading Time: ${formatTime(stats.readingTimeMinutes, stats.readingTimeSeconds)} (@${readingSpeed} wpm)
- Speaking Time: ${formatTime(stats.speakingTimeMinutes, stats.speakingTimeSeconds)} (@125 wpm)
    `.trim();
    navigator.clipboard.writeText(statsText);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.readingTimeCalculator.readingTimeCalculator', 'Reading Time Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.estimateReadingAndSpeakingTime', 'Estimate reading and speaking time for your text')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.readingTimeCalculator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.readingTimeCalculator.enterYourText', 'Enter your text')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('tools.readingTimeCalculator.pasteOrTypeYourText', 'Paste or type your text here to calculate reading time...')}
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          />
        </div>

        {/* Reading Speed */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.readingTimeCalculator.readingSpeed', 'Reading Speed')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {readingSpeedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setReadingSpeed(option.value)}
                className={`p-3 rounded-lg text-center transition-all ${
                  readingSpeed === option.value
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <p className="font-medium text-sm">{option.label}</p>
                <p className={`text-xs mt-1 ${readingSpeed === option.value ? 'text-indigo-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Reading Time */}
          <div className={`${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} rounded-xl p-4 border`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{t('tools.readingTimeCalculator.readingTime', 'Reading Time')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(stats.readingTimeMinutes, stats.readingTimeSeconds)}
            </p>
          </div>

          {/* Speaking Time */}
          <div className={`${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} rounded-xl p-4 border`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.readingTimeCalculator.speakingTime', 'Speaking Time')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(stats.speakingTimeMinutes, stats.speakingTimeSeconds)}
            </p>
          </div>

          {/* Words */}
          <div className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} rounded-xl p-4 border`}>
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-blue-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.readingTimeCalculator.words', 'Words')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.words.toLocaleString()}
            </p>
          </div>

          {/* Characters */}
          <div className={`${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} rounded-xl p-4 border`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-green-300' : 'text-green-600'}`}>{t('tools.readingTimeCalculator.characters', 'Characters')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.characters.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        {text.trim() && (
          <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.readingTimeCalculator.detailedStatistics', 'Detailed Statistics')}</h4>
              <button
                onClick={handleCopyStats}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Copy className="w-4 h-4" />
                {t('tools.readingTimeCalculator.copyStats', 'Copy Stats')}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.charactersWithSpaces', 'Characters (with spaces)')}</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.characters.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.charactersNoSpaces', 'Characters (no spaces)')}</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.charactersNoSpaces.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.words2', 'Words')}</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.words.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.sentences', 'Sentences')}</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.sentences.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.paragraphs', 'Paragraphs')}</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.paragraphs.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeCalculator.avgWordLength', 'Avg. Word Length')}</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : '0'} chars
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.readingTimeCalculator.tip', 'Tip:')}</strong> Average adult reading speed is 200-250 words per minute. Speaking speed is typically around 125 words per minute for presentations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingTimeCalculatorTool;
