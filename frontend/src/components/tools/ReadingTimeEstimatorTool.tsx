import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Clock, FileText, Zap, Coffee } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ReadingTimeEstimatorToolProps {
  uiConfig?: UIConfig;
}

type ReadingSpeed = 'slow' | 'average' | 'fast' | 'speed';

export const ReadingTimeEstimatorTool: React.FC<ReadingTimeEstimatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.text) setText(data.text);
      if (data.wordCount) setWordCount(String(data.wordCount));
      if (data.readingSpeed) setReadingSpeed(data.readingSpeed as ReadingSpeed);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [readingSpeed, setReadingSpeed] = useState<ReadingSpeed>('average');
  const [inputMode, setInputMode] = useState<'text' | 'count'>('text');
  const [wordCount, setWordCount] = useState('1000');

  const speedWPM: Record<ReadingSpeed, number> = {
    slow: 150,
    average: 200,
    fast: 300,
    speed: 450,
  };

  const calculations = useMemo(() => {
    let words = 0;

    if (inputMode === 'text') {
      // Count words from pasted text
      words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
    } else {
      words = parseInt(wordCount) || 0;
    }

    const wpm = speedWPM[readingSpeed];
    const minutes = words / wpm;
    const seconds = (minutes % 1) * 60;

    // Character and page estimates
    const characters = inputMode === 'text' ? text.length : words * 5;
    const charactersNoSpaces = inputMode === 'text' ? text.replace(/\s/g, '').length : words * 4.5;
    const sentences = inputMode === 'text' ? (text.match(/[.!?]+/g) || []).length : Math.round(words / 15);
    const paragraphs = inputMode === 'text' ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : Math.round(words / 100);
    const pages = words / 250; // Standard page ~250 words

    // Speaking time (average 150 WPM speaking)
    const speakingMinutes = words / 150;

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      pages,
      readingMinutes: Math.floor(minutes),
      readingSeconds: Math.round(seconds),
      totalMinutes: minutes,
      speakingMinutes,
      wpm,
    };
  }, [text, wordCount, inputMode, readingSpeed, speedWPM]);

  const formatTime = (totalMinutes: number) => {
    if (totalMinutes < 1) {
      return `${Math.round(totalMinutes * 60)} sec`;
    }
    if (totalMinutes < 60) {
      const mins = Math.floor(totalMinutes);
      const secs = Math.round((totalMinutes % 1) * 60);
      return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
  };

  const speedLabels: Record<ReadingSpeed, string> = {
    slow: 'Slow (150 WPM)',
    average: 'Average (200 WPM)',
    fast: 'Fast (300 WPM)',
    speed: 'Speed Reader (450 WPM)',
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><BookOpen className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.readingTimeEstimator.readingTimeEstimator', 'Reading Time Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.readingTimeEstimator.calculateHowLongItTakes', 'Calculate how long it takes to read content')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${inputMode === 'text' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <FileText className="w-4 h-4" /> Paste Text
          </button>
          <button
            onClick={() => setInputMode('count')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${inputMode === 'count' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Zap className="w-4 h-4" /> Word Count
          </button>
        </div>

        {/* Input */}
        {inputMode === 'text' ? (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.readingTimeEstimator.pasteYourText', 'Paste your text')}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('tools.readingTimeEstimator.pasteYourArticleEssayOr', 'Paste your article, essay, or any text here...')}
              className={`w-full px-4 py-3 rounded-lg border resize-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              rows={6}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.readingTimeEstimator.enterWordCount', 'Enter word count')}
            </label>
            <input
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              placeholder={t('tools.readingTimeEstimator.numberOfWords', 'Number of words')}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000, 10000].map((count) => (
                <button
                  key={count}
                  onClick={() => setWordCount(count.toString())}
                  className={`flex-1 py-1.5 rounded text-sm ${parseInt(wordCount) === count ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {count >= 1000 ? `${count / 1000}k` : count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reading Speed */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.readingTimeEstimator.readingSpeed', 'Reading Speed')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(speedLabels) as ReadingSpeed[]).map((speed) => (
              <button
                key={speed}
                onClick={() => setReadingSpeed(speed)}
                className={`py-2 px-3 rounded-lg text-sm ${readingSpeed === speed ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {speedLabels[speed]}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Time Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
          <Clock className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.readingTimeEstimator.estimatedReadingTime', 'Estimated Reading Time')}</div>
          <div className="text-4xl font-bold text-indigo-500 my-2">
            {formatTime(calculations.totalMinutes)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            at {calculations.wpm} words per minute
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.words.toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.readingTimeEstimator.words', 'Words')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.characters.toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.readingTimeEstimator.characters', 'Characters')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.pages.toFixed(1)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.readingTimeEstimator.pages', 'Pages')}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.readingTimeEstimator.additionalDetails', 'Additional Details')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.readingTimeEstimator.sentences', 'Sentences')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.sentences}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.readingTimeEstimator.paragraphs', 'Paragraphs')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.paragraphs}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.readingTimeEstimator.charsNoSpaces', 'Chars (no spaces)')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.charactersNoSpaces.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.readingTimeEstimator.speakingTime', 'Speaking time')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formatTime(calculations.speakingMinutes)}</span>
            </div>
          </div>
        </div>

        {/* Coffee Break */}
        <div className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Coffee className="w-8 h-8 text-amber-500" />
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Coffee breaks needed: {Math.ceil(calculations.totalMinutes / 25)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.readingTimeEstimator.basedOn25MinuteFocus', 'Based on 25-minute focus sessions (Pomodoro Technique)')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingTimeEstimatorTool;
