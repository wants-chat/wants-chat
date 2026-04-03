import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Timer, Volume2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface CountdownTimerToolProps {
  uiConfig?: UIConfig;
}

export const CountdownTimerTool = ({
  uiConfig }: CountdownTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        // Set minutes from amount (assuming minutes as default unit)
        const mins = Math.floor(params.amount);
        const secs = Math.round((params.amount - mins) * 60);
        setMinutes(mins);
        setSeconds(secs);
        setIsPrefilled(true);
      } else if (params.text) {
        // Try to parse time from text (e.g., "5 minutes", "30 seconds")
        const timeMatch = params.text.match(/(\d+)\s*(min|minute|sec|second|hour|hr)/i);
        if (timeMatch) {
          const value = parseInt(timeMatch[1]);
          const unit = timeMatch[2].toLowerCase();
          if (unit.startsWith('hour') || unit.startsWith('hr')) {
            setHours(value);
          } else if (unit.startsWith('min')) {
            setMinutes(value);
          } else if (unit.startsWith('sec')) {
            setSeconds(value);
          }
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    // Create audio context for completion sound
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback: Try to request notification permission and show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Timer Complete!', {
            body: 'Your countdown timer has finished.',
            icon: '/favicon.ico',
          });
        }
      });
    }

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Show notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: 'Your countdown timer has finished.',
        icon: '/favicon.ico',
      });
    }
  };

  const formatTime = (totalSec: number): string => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (hours === 0 && minutes === 0 && seconds === 0 && remainingSeconds === 0) {
      setValidationMessage('Please set a timer duration');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (remainingSeconds === 0) {
      const total = hours * 3600 + minutes * 60 + seconds;
      setTotalSeconds(total);
      setRemainingSeconds(total);
    }

    setIsRunning(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setIsComplete(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const setPreset = (mins: number) => {
    setHours(0);
    setMinutes(mins);
    setSeconds(0);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setIsRunning(false);
    setIsComplete(false);
  };

  const getProgress = (): number => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#0D9488] rounded-lg">
          <Timer className="w-6 h-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.countdownTimer.countdownTimer', 'Countdown Timer')}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Time Display */}
        <div className={`text-center py-12 rounded-lg relative overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          {/* Progress Bar */}
          {totalSeconds > 0 && (
            <div className="absolute top-0 left-0 h-1 bg-[#0D9488] transition-all duration-1000" style={{ width: `${getProgress()}%` }} />
          )}

          <div className={`text-6xl font-mono font-bold ${isComplete ? 'text-[#0D9488] animate-pulse' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(remainingSeconds)}
          </div>
          <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {isComplete ? 'Time\'s Up!' : 'HH:MM:SS'}
          </div>
        </div>

        {/* Time Input */}
        {!isRunning && remainingSeconds === 0 && (
          <div className="flex gap-3 justify-center">
            <div>
              <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.countdownTimer.hours', 'Hours')}</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                className={`w-20 px-3 py-2 text-center rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.countdownTimer.minutes', 'Minutes')}</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className={`w-20 px-3 py-2 text-center rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.countdownTimer.seconds', 'Seconds')}</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className={`w-20 px-3 py-2 text-center rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
          </div>
        )}

        {/* Preset Buttons */}
        {!isRunning && remainingSeconds === 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {[5, 10, 15, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setPreset(mins)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <Play className="w-5 h-5" />
              {t('tools.countdownTimer.start', 'Start')}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <Pause className="w-5 h-5" />
              {t('tools.countdownTimer.pause', 'Pause')}
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={remainingSeconds === 0 && totalSeconds === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              remainingSeconds === 0 && totalSeconds === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            {t('tools.countdownTimer.reset', 'Reset')}
          </button>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Volume2 className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.countdownTimer.notificationSettings', 'Notification Settings')}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                This timer will play a sound and show a browser notification when complete.
                Make sure to allow notifications for the best experience.
              </p>
            </div>
          </div>
        </div>

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
            {validationMessage}
          </div>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
};
