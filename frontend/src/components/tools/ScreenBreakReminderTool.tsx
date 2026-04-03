import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Eye, Clock, Play, Pause, RotateCcw, Bell, Volume2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ScreenBreakReminderToolProps {
  uiConfig?: UIConfig;
}

type RuleType = '20-20-20' | '50-10' | '90-20' | 'custom';

interface BreakRule {
  name: string;
  workMinutes: number;
  breakMinutes: number;
  description: string;
}

export const ScreenBreakReminderTool: React.FC<ScreenBreakReminderToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [rule, setRule] = useState<RuleType>('20-20-20');
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom settings
  const [customWork, setCustomWork] = useState(30);
  const [customBreak, setCustomBreak] = useState(5);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.formData) {
        if (params.formData.rule) setRule(params.formData.rule as RuleType);
        if (params.formData.customWork) setCustomWork(parseInt(params.formData.customWork));
        if (params.formData.customBreak) setCustomBreak(parseInt(params.formData.customBreak));
        if (params.formData.soundEnabled !== undefined) setSoundEnabled(params.formData.soundEnabled);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const rules: Record<RuleType, BreakRule> = {
    '20-20-20': { name: '20-20-20 Rule', workMinutes: 20, breakMinutes: 0.33, description: 'Every 20 min, look 20 feet away for 20 sec' },
    '50-10': { name: '50-10 Pomodoro', workMinutes: 50, breakMinutes: 10, description: 'Work 50 min, break 10 min' },
    '90-20': { name: '90-20 Deep Work', workMinutes: 90, breakMinutes: 20, description: 'Deep focus 90 min, rest 20 min' },
    'custom': { name: 'Custom', workMinutes: customWork, breakMinutes: customBreak, description: 'Your personalized schedule' },
  };

  const currentRule = rule === 'custom'
    ? { ...rules.custom, workMinutes: customWork, breakMinutes: customBreak }
    : rules[rule];

  const playSound = useCallback((frequency: number = 440) => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const startWork = useCallback(() => {
    setIsBreakTime(false);
    setTimeRemaining(currentRule.workMinutes * 60);
    setIsRunning(true);
  }, [currentRule.workMinutes]);

  const startBreak = useCallback(() => {
    setIsBreakTime(true);
    setTimeRemaining(currentRule.breakMinutes * 60);
    playSound(880);
  }, [currentRule.breakMinutes, playSound]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (isBreakTime) {
            // Break ended, start work
            setCompletedSessions(s => s + 1);
            startWork();
            playSound(440);
          } else {
            // Work ended, start break
            setTotalWorkTime(t => t + currentRule.workMinutes);
            startBreak();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreakTime, currentRule.workMinutes, startWork, startBreak, playSound]);

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const reset = () => {
    stop();
    setTimeRemaining(0);
    setIsBreakTime(false);
    setCompletedSessions(0);
    setTotalWorkTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isRunning
    ? ((isBreakTime ? currentRule.breakMinutes * 60 : currentRule.workMinutes * 60) - timeRemaining) /
      (isBreakTime ? currentRule.breakMinutes * 60 : currentRule.workMinutes * 60) * 100
    : 0;

  const eyeExercises = [
    'Look at an object 20 feet away',
    'Blink rapidly 20 times',
    'Roll your eyes in circles',
    'Close your eyes and relax',
    'Look up, down, left, right',
    'Focus near then far alternately',
  ];

  const [currentExercise] = useState(Math.floor(Math.random() * eyeExercises.length));

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Monitor className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.screenBreakReminder.screenBreakReminder', 'Screen Break Reminder')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.screenBreakReminder.protectYourEyesWithRegular', 'Protect your eyes with regular breaks')}</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg ${soundEnabled ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.screenBreakReminder.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Rule Selection */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(rules) as RuleType[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRule(r); reset(); }}
              disabled={isRunning}
              className={`py-2 px-3 rounded-lg text-sm ${rule === r ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} disabled:opacity-50`}
            >
              {rules[r].name}
            </button>
          ))}
        </div>

        {/* Custom Settings */}
        {rule === 'custom' && !isRunning && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.screenBreakReminder.customSettings', 'Custom Settings')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenBreakReminder.workMin', 'Work (min)')}</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customWork}
                  onChange={(e) => setCustomWork(parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenBreakReminder.breakMin', 'Break (min)')}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customBreak}
                  onChange={(e) => setCustomBreak(parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rule Description */}
        <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentRule.description}</div>
        </div>

        {/* Timer Display */}
        <div className={`p-8 rounded-xl text-center ${
          isBreakTime
            ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            : isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
        } border`}>
          {isBreakTime ? (
            <Eye className="w-10 h-10 mx-auto mb-3 text-green-500" />
          ) : (
            <Clock className="w-10 h-10 mx-auto mb-3 text-blue-500" />
          )}

          <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isBreakTime ? 'Break Time!' : isRunning ? t('tools.screenBreakReminder.focusTime', 'Focus Time') : t('tools.screenBreakReminder.ready', 'Ready')}
          </div>

          <div className={`text-6xl font-bold my-4 ${isBreakTime ? 'text-green-500' : 'text-blue-500'}`}>
            {isRunning ? formatTime(timeRemaining) : formatTime(currentRule.workMinutes * 60)}
          </div>

          {/* Progress Bar */}
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full transition-all ${isBreakTime ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Break Exercise */}
          {isBreakTime && (
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.screenBreakReminder.eyeExercise', '👁️ Eye Exercise')}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {eyeExercises[currentExercise]}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <button
              onClick={startWork}
              className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
            >
              <Play className="w-5 h-5" /> Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium"
            >
              <Pause className="w-5 h-5" /> Pause
            </button>
          )}
          <button
            onClick={reset}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <RotateCcw className="w-5 h-5" /> Reset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Bell className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{completedSessions}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.screenBreakReminder.sessions', 'Sessions')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Clock className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalWorkTime}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.screenBreakReminder.workMin2', 'Work Min')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Eye className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(completedSessions * currentRule.breakMinutes)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.screenBreakReminder.breakMin2', 'Break Min')}</div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.screenBreakReminder.eyeCareTips', 'Eye Care Tips')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Position screen at arm's length, slightly below eye level</li>
            <li>• Adjust screen brightness to match surroundings</li>
            <li>• Use artificial tears if eyes feel dry</li>
            <li>• Blink more often when using screens</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenBreakReminderTool;
