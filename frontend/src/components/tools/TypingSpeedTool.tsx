import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Play, RotateCcw, Trophy, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface TypingSpeedToolProps {
  uiConfig?: UIConfig;
}

interface TestResult {
  wpm: number;
  accuracy: number;
  time: number;
  date: Date;
}

const COLUMNS = [
  { key: 'wpm', label: 'WPM' },
  { key: 'accuracy', label: 'Accuracy (%)' },
  { key: 'time', label: 'Duration (s)' },
  { key: 'date', label: 'Date' },
];

export const TypingSpeedTool: React.FC<TypingSpeedToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.testDuration) setTestDuration(Number(data.testDuration));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is often used for typing practice.",
    "Programming is the process of creating a set of instructions that tell a computer how to perform a task. It requires logical thinking and problem-solving skills.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Every accomplishment starts with the decision to try.",
    "The best way to predict the future is to create it. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
    "In the middle of difficulty lies opportunity. Life is what happens when you're busy making other plans. Time you enjoy wasting is not wasted time.",
  ];

  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [sampleText, setSampleText] = useState(sampleTexts[0]);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testDuration, setTestDuration] = useState(60);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateStats = useCallback(() => {
    if (!startTime) return { wpm: 0, accuracy: 0 };

    const timeTaken = (endTime || Date.now()) - startTime;
    const minutes = timeTaken / 60000;

    // Count correct characters
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === sampleText[i]) {
        correctChars++;
      }
    }

    // WPM: (characters typed / 5) / minutes
    const wpm = Math.round((userInput.length / 5) / minutes);

    // Accuracy: correct characters / total typed
    const accuracy = userInput.length > 0
      ? Math.round((correctChars / userInput.length) * 100)
      : 100;

    return { wpm, accuracy };
  }, [startTime, endTime, userInput, sampleText]);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimeElapsed(elapsed);

          if (elapsed >= testDuration) {
            finishTest();
          }
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime, testDuration]);

  const startTest = () => {
    setSampleText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
    setUserInput('');
    setStartTime(Date.now());
    setEndTime(null);
    setTimeElapsed(0);
    setStatus('running');
    inputRef.current?.focus();
  };

  const finishTest = () => {
    setEndTime(Date.now());
    setStatus('finished');
    if (timerRef.current) clearInterval(timerRef.current);

    const stats = calculateStats();
    setResults([
      { wpm: stats.wpm, accuracy: stats.accuracy, time: testDuration, date: new Date() },
      ...results.slice(0, 9),
    ]);
  };

  const reset = () => {
    setStatus('idle');
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setTimeElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);

    // Auto-finish if user completes the text
    if (value.length >= sampleText.length) {
      finishTest();
    }
  };

  const stats = calculateStats();
  const timeRemaining = testDuration - timeElapsed;

  const renderText = () => {
    return sampleText.split('').map((char, idx) => {
      let className = isDark ? 'text-gray-500' : 'text-gray-400';
      if (idx < userInput.length) {
        className = userInput[idx] === char
          ? 'text-green-500'
          : 'text-red-500 bg-red-500/20';
      } else if (idx === userInput.length) {
        className = `${isDark ? 'text-white' : 'text-gray-900'} border-l-2 border-blue-500 animate-pulse`;
      }
      return (
        <span key={idx} className={className}>
          {char}
        </span>
      );
    });
  };

  const bestResult = results.length > 0
    ? results.reduce((best, r) => r.wpm > best.wpm ? r : best)
    : null;

  // Export handlers
  const handleExportCSV = () => {
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = results.map(result =>
      [
        result.wpm,
        result.accuracy,
        result.time,
        new Date(result.date).toLocaleString(),
      ].join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `typing-speed-results-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonData = results.map(result => ({
      wpm: result.wpm,
      accuracy: result.accuracy,
      duration: result.time,
      date: new Date(result.date).toISOString(),
    }));
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `typing-speed-results-${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    const text = results.map((result, idx) =>
      `Test ${idx + 1}: ${result.wpm} WPM, ${result.accuracy}% accuracy, ${result.time}s duration`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Keyboard className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.typingSpeed.typingSpeedTest', 'Typing Speed Test')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.typingSpeed.testYourTypingSpeedAnd', 'Test your typing speed and accuracy')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-3xl font-bold text-blue-500">{stats.wpm}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.typingSpeed.wpm', 'WPM')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-3xl font-bold ${stats.accuracy >= 95 ? 'text-green-500' : stats.accuracy >= 80 ? 'text-yellow-500' : 'text-red-500'}`}>
              {stats.accuracy}%
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.typingSpeed.accuracy', 'Accuracy')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-3xl font-bold ${timeRemaining < 10 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {status === 'running' ? timeRemaining : testDuration}s
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {status === 'running' ? t('tools.typingSpeed.remaining', 'Remaining') : t('tools.typingSpeed.duration', 'Duration')}
            </div>
          </div>
        </div>

        {/* Test Duration Selection (when idle) */}
        {status === 'idle' && (
          <div className="flex gap-2">
            {[30, 60, 120].map((d) => (
              <button
                key={d}
                onClick={() => setTestDuration(d)}
                className={`flex-1 py-2 rounded-lg ${testDuration === d ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {d}s
              </button>
            ))}
          </div>
        )}

        {/* Text Display */}
        <div className={`p-4 rounded-lg font-mono text-lg leading-relaxed ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {renderText()}
        </div>

        {/* Input Area */}
        {status !== 'idle' && (
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            disabled={status === 'finished'}
            placeholder={status === 'finished' ? t('tools.typingSpeed.testComplete', 'Test complete!') : t('tools.typingSpeed.startTyping', 'Start typing...')}
            className={`w-full px-4 py-3 rounded-lg border font-mono resize-none ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } ${status === 'finished' ? 'opacity-50' : ''}`}
            rows={3}
            autoFocus
          />
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {status === 'idle' && (
            <button
              onClick={startTest}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600"
            >
              <Play className="w-5 h-5" /> Start Test
            </button>
          )}
          {status !== 'idle' && (
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <RotateCcw className="w-5 h-5" /> Try Again
            </button>
          )}
        </div>

        {/* Results History */}
        {results.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.typingSpeed.recentResults', 'Recent Results')}</h4>
              {bestResult && (
                <span className="ml-auto text-sm text-yellow-500">Best: {bestResult.wpm} WPM</span>
              )}
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
            <div className="space-y-2">
              {results.slice(0, 5).map((result, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${result === bestResult ? 'text-yellow-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.wpm} WPM
                    </span>
                    <span className={`text-sm ${result.accuracy >= 95 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {result.accuracy}%
                    </span>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {result.time}s test
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.typingSpeed.tip', 'Tip:')}</strong> Focus on accuracy first, speed will follow. The average typing speed is 40 WPM, while professional typists reach 65-75 WPM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypingSpeedTool;
