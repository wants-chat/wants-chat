import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Timer, Flame, Settings, Volume2, SkipForward } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Phase = 'idle' | 'warmup' | 'work' | 'rest' | 'cooldown' | 'complete';

interface IntervalSettings {
  workDuration: number;
  restDuration: number;
  rounds: number;
  warmupDuration: number;
  cooldownDuration: number;
}

interface PresetWorkout {
  name: string;
  description: string;
  settings: IntervalSettings;
}

interface IntervalTimerToolProps {
  uiConfig?: UIConfig;
}

const presetWorkouts: PresetWorkout[] = [
  {
    name: 'Tabata',
    description: '20s work / 10s rest x 8 rounds',
    settings: {
      workDuration: 20,
      restDuration: 10,
      rounds: 8,
      warmupDuration: 0,
      cooldownDuration: 0,
    },
  },
  {
    name: 'EMOM',
    description: '45s work / 15s rest x 10 rounds',
    settings: {
      workDuration: 45,
      restDuration: 15,
      rounds: 10,
      warmupDuration: 0,
      cooldownDuration: 0,
    },
  },
  {
    name: 'HIIT Classic',
    description: '30s work / 30s rest x 10 rounds',
    settings: {
      workDuration: 30,
      restDuration: 30,
      rounds: 10,
      warmupDuration: 60,
      cooldownDuration: 60,
    },
  },
  {
    name: 'Sprint Intervals',
    description: '15s work / 45s rest x 8 rounds',
    settings: {
      workDuration: 15,
      restDuration: 45,
      rounds: 8,
      warmupDuration: 120,
      cooldownDuration: 60,
    },
  },
  {
    name: 'Endurance',
    description: '60s work / 20s rest x 6 rounds',
    settings: {
      workDuration: 60,
      restDuration: 20,
      rounds: 6,
      warmupDuration: 60,
      cooldownDuration: 60,
    },
  },
];

export const IntervalTimerTool = ({ uiConfig }: IntervalTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<IntervalSettings>({
    workDuration: 30,
    restDuration: 15,
    rounds: 8,
    warmupDuration: 0,
    cooldownDuration: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        // Set work duration from amount (in seconds)
        const workSecs = Math.floor(params.amount);
        setSettings(prev => ({ ...prev, workDuration: workSecs }));
        setIsPrefilled(true);
      } else if (params.text) {
        // Try to find a matching preset workout
        const presetName = params.text.toLowerCase();
        const matchingPreset = presetWorkouts.find(p =>
          p.name.toLowerCase().includes(presetName)
        );
        if (matchingPreset) {
          setSettings(matchingPreset.settings);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    // Create audio context for phase change sounds
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';

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
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeRemaining((prev) => Math.max(0, prev - 1));
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
  }, [isRunning]);

  const calculateTotalTime = (): number => {
    const { workDuration, restDuration, rounds, warmupDuration, cooldownDuration } = settings;
    return warmupDuration + (workDuration + restDuration) * rounds - restDuration + cooldownDuration;
  };

  const playPhaseSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handlePhaseComplete = () => {
    playPhaseSound();

    switch (phase) {
      case 'warmup':
        setPhase('work');
        setCurrentRound(1);
        setRemainingSeconds(settings.workDuration);
        break;
      case 'work':
        if (currentRound >= settings.rounds) {
          if (settings.cooldownDuration > 0) {
            setPhase('cooldown');
            setRemainingSeconds(settings.cooldownDuration);
          } else {
            setPhase('complete');
            setIsRunning(false);
            showCompletionNotification();
          }
        } else {
          setPhase('rest');
          setRemainingSeconds(settings.restDuration);
        }
        break;
      case 'rest':
        setPhase('work');
        setCurrentRound((prev) => prev + 1);
        setRemainingSeconds(settings.workDuration);
        break;
      case 'cooldown':
        setPhase('complete');
        setIsRunning(false);
        showCompletionNotification();
        break;
      default:
        break;
    }
  };

  const showCompletionNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Workout Complete!', {
        body: `Great job! You completed ${settings.rounds} rounds.`,
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleStart = () => {
    if (phase === 'idle' || phase === 'complete') {
      setTotalTimeRemaining(calculateTotalTime());
      if (settings.warmupDuration > 0) {
        setPhase('warmup');
        setRemainingSeconds(settings.warmupDuration);
        setCurrentRound(0);
      } else {
        setPhase('work');
        setRemainingSeconds(settings.workDuration);
        setCurrentRound(1);
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('idle');
    setRemainingSeconds(0);
    setCurrentRound(0);
    setTotalTimeRemaining(0);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSkipPhase = () => {
    if (phase !== 'idle' && phase !== 'complete') {
      handlePhaseComplete();
    }
  };

  const applyPreset = (preset: PresetWorkout) => {
    setSettings(preset.settings);
    handleReset();
  };

  const formatTime = (totalSec: number): string => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (totalSec: number): string => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'warmup':
        return '#f59e0b'; // amber
      case 'work':
        return '#22c55e'; // green
      case 'rest':
        return '#ef4444'; // red
      case 'cooldown':
        return '#3b82f6'; // blue
      case 'complete':
        return '#0D9488'; // teal
      default:
        return '#6b7280'; // gray
    }
  };

  const getPhaseLabel = (): string => {
    switch (phase) {
      case 'idle':
        return 'Ready';
      case 'warmup':
        return 'Warm Up';
      case 'work':
        return 'Work';
      case 'rest':
        return 'Rest';
      case 'cooldown':
        return 'Cool Down';
      case 'complete':
        return 'Complete!';
      default:
        return '';
    }
  };

  const getPhaseDuration = (): number => {
    switch (phase) {
      case 'warmup':
        return settings.warmupDuration;
      case 'work':
        return settings.workDuration;
      case 'rest':
        return settings.restDuration;
      case 'cooldown':
        return settings.cooldownDuration;
      default:
        return 0;
    }
  };

  const getProgress = (): number => {
    const duration = getPhaseDuration();
    if (duration === 0) return 0;
    return ((duration - remainingSeconds) / duration) * 100;
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: getPhaseColor() }}>
            {phase === 'work' ? (
              <Flame className="w-6 h-6 text-white" />
            ) : (
              <Timer className="w-6 h-6 text-white" />
            )}
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.intervalTimer.intervalTimer', 'Interval Timer')}
          </h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          disabled={isRunning}
          className={`p-2 rounded-lg transition-colors ${
            isRunning
              ? 'opacity-50 cursor-not-allowed'
              : theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Settings Panel */}
        {showSettings && !isRunning && (
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.intervalTimer.timerSettings', 'Timer Settings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.intervalTimer.workDurationSec', 'Work Duration (sec)')}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={settings.workDuration}
                    onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 30 })}
                    className={`w-full px-3 py-2 text-center rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.intervalTimer.restDurationSec', 'Rest Duration (sec)')}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.restDuration}
                    onChange={(e) => setSettings({ ...settings, restDuration: parseInt(e.target.value) || 15 })}
                    className={`w-full px-3 py-2 text-center rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.intervalTimer.numberOfRounds', 'Number of Rounds')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.rounds}
                    onChange={(e) => setSettings({ ...settings, rounds: parseInt(e.target.value) || 8 })}
                    className={`w-full px-3 py-2 text-center rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.intervalTimer.warmUpSec0To', 'Warm-up (sec, 0 to skip)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={settings.warmupDuration}
                    onChange={(e) => setSettings({ ...settings, warmupDuration: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-center rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.intervalTimer.coolDownSec0To', 'Cool-down (sec, 0 to skip)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={settings.cooldownDuration}
                    onChange={(e) => setSettings({ ...settings, cooldownDuration: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-center rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Preset Workouts */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.intervalTimer.presetWorkouts', 'Preset Workouts')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presetWorkouts.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Indicator */}
        <div
          className="text-center py-4 rounded-lg transition-all duration-300"
          style={{ backgroundColor: `${getPhaseColor()}20` }}
        >
          <div className="text-2xl font-bold" style={{ color: getPhaseColor() }}>
            {getPhaseLabel()}
          </div>
          {phase !== 'idle' && phase !== 'complete' && (
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Round {currentRound} of {settings.rounds}
            </div>
          )}
        </div>

        {/* Time Display */}
        <div
          className={`text-center py-12 rounded-lg relative overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}
        >
          {/* Progress Bar */}
          {phase !== 'idle' && phase !== 'complete' && (
            <div
              className="absolute top-0 left-0 h-2 transition-all duration-1000"
              style={{ width: `${getProgress()}%`, backgroundColor: getPhaseColor() }}
            />
          )}

          <div
            className={`text-7xl font-mono font-bold transition-colors duration-300 ${
              phase === 'complete' ? 'animate-pulse' : ''
            }`}
            style={{ color: phase === 'idle' ? (theme === 'dark' ? '#fff' : '#111') : getPhaseColor() }}
          >
            {formatTime(remainingSeconds)}
          </div>

          {/* Round Progress Dots */}
          {phase !== 'idle' && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: settings.rounds }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index < currentRound
                      ? 'bg-[#0D9488]'
                      : index === currentRound - 1 && phase === 'work'
                      ? 'bg-green-500'
                      : theme === 'dark'
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Total Time Remaining */}
          {phase !== 'idle' && phase !== 'complete' && (
            <div className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Total remaining: {formatTotalTime(totalTimeRemaining)}
            </div>
          )}
        </div>

        {/* Workout Summary (when idle) */}
        {phase === 'idle' && (
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3`}>
            <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-green-500 font-bold text-lg">{settings.workDuration}s</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.intervalTimer.work', 'Work')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-red-500 font-bold text-lg">{settings.restDuration}s</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.intervalTimer.rest', 'Rest')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {settings.rounds}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.intervalTimer.rounds', 'Rounds')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatTotalTime(calculateTotalTime())}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.intervalTimer.total', 'Total')}</div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium"
              style={{ backgroundColor: getPhaseColor(), color: 'white' }}
            >
              <Play className="w-5 h-5" />
              {phase === 'complete' ? 'Restart' : phase === 'idle' ? t('tools.intervalTimer.start', 'Start') : t('tools.intervalTimer.resume', 'Resume')}
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
              {t('tools.intervalTimer.pause', 'Pause')}
            </button>
          )}

          {phase !== 'idle' && phase !== 'complete' && (
            <button
              onClick={handleSkipPhase}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <SkipForward className="w-5 h-5" />
              {t('tools.intervalTimer.skip', 'Skip')}
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={phase === 'idle'}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              phase === 'idle'
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            {t('tools.intervalTimer.reset', 'Reset')}
          </button>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Volume2 className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.intervalTimer.intervalTrainingTips', 'Interval Training Tips')}
              </h3>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>
                  <span className="text-green-500 font-medium">{t('tools.intervalTimer.workPhases', 'Work phases')}</span> - Give maximum effort
                </li>
                <li>
                  <span className="text-red-500 font-medium">{t('tools.intervalTimer.restPhases', 'Rest phases')}</span> - Active recovery, keep moving lightly
                </li>
                <li>{t('tools.intervalTimer.audioCuesWillSoundAt', 'Audio cues will sound at each phase change')}</li>
                <li>{t('tools.intervalTimer.usePresetsOrCustomizeYour', 'Use presets or customize your own intervals')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervalTimerTool;
