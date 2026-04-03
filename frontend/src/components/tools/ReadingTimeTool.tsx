import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Clock, FileText, Copy, Check, BarChart2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ReadingTimeToolProps {
  uiConfig?: UIConfig;
}

export const ReadingTimeTool: React.FC<ReadingTimeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [text, setText] = useState('');
  const [wordsPerMinute, setWordsPerMinute] = useState(200);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Prefill the text content if available
      if (params.text) {
        setText(params.text);
        setIsPrefilled(true);
      } else if (params.content) {
        setText(params.content);
        setIsPrefilled(true);
      }
      // Optionally set words per minute from amount
      if (params.amount && typeof params.amount === 'number') {
        setWordsPerMinute(params.amount);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0,
      };
    }

    const words = trimmedText.split(/\s+/).filter(Boolean);
    const sentences = trimmedText.split(/[.!?]+/).filter(Boolean);
    const paragraphs = trimmedText.split(/\n\n+/).filter(Boolean);

    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    const speakingTime = Math.ceil(wordCount / 150); // Average speaking pace

    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: wordCount,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime,
      speakingTime,
    };
  }, [text, wordsPerMinute]);

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleCopy = () => {
    const summary = `
Reading Time Analysis
---------------------
Words: ${stats.words.toLocaleString()}
Characters: ${stats.characters.toLocaleString()}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading Time: ${formatTime(stats.readingTime)}
Speaking Time: ${formatTime(stats.speakingTime)}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speedPresets = [
    { label: 'Slow', wpm: 150 },
    { label: 'Average', wpm: 200 },
    { label: 'Fast', wpm: 250 },
    { label: 'Speed Reader', wpm: 400 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.readingTime.readingTimeCalculator', 'Reading Time Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTime.estimateHowLongItTakes', 'Estimate how long it takes to read your content')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Reading Speed */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Reading Speed: {wordsPerMinute} WPM
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={wordsPerMinute}
                onChange={(e) => setWordsPerMinute(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {speedPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setWordsPerMinute(preset.wpm)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    wordsPerMinute === preset.wpm
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.readingTime.pasteYourContent', 'Paste Your Content')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('tools.readingTime.pasteYourArticleBlogPost', 'Paste your article, blog post, or any text here to calculate reading time...')}
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Words', value: stats.words.toLocaleString(), icon: FileText },
            { label: 'Characters', value: stats.characters.toLocaleString(), icon: FileText },
            { label: 'Sentences', value: stats.sentences.toLocaleString(), icon: FileText },
            { label: 'Paragraphs', value: stats.paragraphs.toLocaleString(), icon: FileText },
            { label: 'Reading Time', value: formatTime(stats.readingTime), icon: Clock, highlight: true },
            { label: 'Speaking Time', value: formatTime(stats.speakingTime), icon: Clock },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`p-4 rounded-xl text-center ${
                stat.highlight
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800'
                  : 'bg-gray-50'
              }`}
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.highlight ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-2xl font-bold ${stat.highlight ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </div>
              <div className={`text-xs ${stat.highlight ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reading Level Indicator */}
        {stats.words > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <BarChart2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.readingTime.contentLength', 'Content Length')}</span>
            </div>
            <div className="space-y-2">
              <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.min((stats.words / 2000) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.readingTime.quickRead', 'Quick Read')}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.readingTime.blogPost', 'Blog Post')}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.readingTime.longForm', 'Long Form')}</span>
              </div>
            </div>
            <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {stats.words < 300 && 'Quick read - Perfect for social media or brief updates.'}
              {stats.words >= 300 && stats.words < 1000 && 'Standard blog post length - Good for SEO and engagement.'}
              {stats.words >= 1000 && stats.words < 2000 && 'In-depth article - Great for comprehensive topics.'}
              {stats.words >= 2000 && 'Long-form content - Ideal for guides, tutorials, or detailed analysis.'}
            </p>
          </div>
        )}

        {/* Copy Summary */}
        <button
          onClick={handleCopy}
          disabled={stats.words === 0}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? t('tools.readingTime.copied', 'Copied!') : t('tools.readingTime.copySummary', 'Copy Summary')}
        </button>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.readingTime.readingSpeedGuide', 'Reading speed guide:')}</strong> Average adult reading speed is 200-250 words per minute.
            Technical content is typically read at 150 WPM, while casual content can be scanned at 300+ WPM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingTimeTool;
