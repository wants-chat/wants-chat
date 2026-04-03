import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StudyTimerToolProps {
  uiConfig?: UIConfig;
}

type TimerMode = 'study' | 'shortBreak' | 'longBreak';

export const StudyTimerTool: React.FC<StudyTimerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [mode, setMode] = useState<TimerMode>('study');

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.studyMinutes) setStudyMinutes(Number(data.studyMinutes));
      if (data.shortBreakMinutes) setShortBreakMinutes(Number(data.shortBreakMinutes));
      if (data.longBreakMinutes) setLongBreakMinutes(Number(data.longBreakMinutes));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

  const [timeLeft, setTimeLeft] = useState(studyMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = (m: TimerMode) => {
    switch (m) {
      case 'study': return studyMinutes * 60;
      case 'shortBreak': return shortBreakMinutes * 60;
      case 'longBreak': return longBreakMinutes * 60;
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (mode === 'study') setTotalStudyTime((t) => t + 1);
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'study') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      if (newCount % sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakMinutes * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakMinutes * 60);
      }
    } else {
      setMode('study');
      setTimeLeft(studyMinutes * 60);
    }
    // Play notification sound
    try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onq+3wczW3ePo7fDz9fb29vb19PPw7ejh2tPMyL+2raSdlpGNioiHh4iKjpWdpa60vMXN1dzj6O3x9Pb39/f39vTx7unj3NXOwb22raSdlY+KhoSDg4SGi5CYoKmyusTN1d3k6u/z9vj5+fn5+Pby7ejh2dHJwLiupaGZk46JhYKAgICChYmOlZyiq7O8xc7W3uXr8PT3+fr7+/r5+Pby7ObfAA==').play(); } catch {}
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  const modeColors = {
    study: { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500' },
    shortBreak: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
    longBreak: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' },
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studyTimer.studyTimer', 'Study Timer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studyTimer.pomodoroStyleStudySessions', 'Pomodoro-style study sessions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Tabs */}
        <div className="flex gap-2">
          {[
            { mode: 'study' as TimerMode, label: 'Study', icon: <Brain className="w-4 h-4" /> },
            { mode: 'shortBreak' as TimerMode, label: 'Short Break', icon: <Coffee className="w-4 h-4" /> },
            { mode: 'longBreak' as TimerMode, label: 'Long Break', icon: <Coffee className="w-4 h-4" /> },
          ].map((m) => (
            <button key={m.mode} onClick={() => switchMode(m.mode)} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${mode === m.mode ? `${modeColors[m.mode].bg} text-white` : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="120" fill="none" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="8" />
              <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 120}`} strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`} className={`${modeColors[mode].text} transition-all duration-1000`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatTime(timeLeft)}</span>
              <span className={`text-sm mt-2 capitalize ${modeColors[mode].text}`}>{mode === 'study' ? 'Focus Time' : mode === 'shortBreak' ? t('tools.studyTimer.shortBreak2', 'Short Break') : t('tools.studyTimer.longBreak2', 'Long Break')}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button onClick={toggleTimer} className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 ${modeColors[mode].bg} text-white hover:opacity-90 transition-opacity`}>
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? t('tools.studyTimer.pause', 'Pause') : t('tools.studyTimer.start', 'Start')}
          </button>
          <button onClick={resetTimer} className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            <RotateCcw className="w-5 h-5" /> Reset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{completedSessions}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.sessions', 'Sessions')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatTotalTime(totalStudyTime)}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.studyTime', 'Study Time')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{sessionsUntilLongBreak - (completedSessions % sessionsUntilLongBreak)}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.untilLongBreak', 'Until Long Break')}</div>
          </div>
        </div>

        {/* Settings */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studyTimer.timerSettings', 'Timer Settings')}</h4>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.studyMin', 'Study (min)')}</label>
              <input type="number" value={studyMinutes} onChange={(e) => setStudyMinutes(parseInt(e.target.value) || 25)} className={`w-full mt-1 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.shortBreak', 'Short Break')}</label>
              <input type="number" value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(parseInt(e.target.value) || 5)} className={`w-full mt-1 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.longBreak', 'Long Break')}</label>
              <input type="number" value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(parseInt(e.target.value) || 15)} className={`w-full mt-1 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studyTimer.sessions2', 'Sessions')}</label>
              <input type="number" value={sessionsUntilLongBreak} onChange={(e) => setSessionsUntilLongBreak(parseInt(e.target.value) || 4)} className={`w-full mt-1 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimerTool;
