import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Coffee, Briefcase, Settings, Volume2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  id: string | number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStart?: boolean;
  completedSessions?: number;
  lastUpdated?: string;
}

interface PomodoroTimerToolProps {
  uiConfig?: UIConfig;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  id: 'default-pomodoro',
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStart: false,
  completedSessions: 0,
};

const POMODORO_COLUMNS = [
  { key: 'workDuration', header: 'Work Duration (min)' },
  { key: 'shortBreakDuration', header: 'Short Break (min)' },
  { key: 'longBreakDuration', header: 'Long Break (min)' },
  { key: 'sessionsUntilLongBreak', header: 'Sessions Until Long Break' },
  { key: 'completedSessions', header: 'Completed Sessions' },
];

export const PomodoroTimerTool = ({ uiConfig }: PomodoroTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { data: settingsData, updateItem, isSynced, isSaving, syncError, forceSync, lastSaved } = useToolData<PomodoroSettings>(
    'pomodoro-timer',
    [DEFAULT_SETTINGS],
    POMODORO_COLUMNS,
    { autoSave: true, autoSaveDelay: 1000 }
  );

  // Get the current settings (first item or default)
  const currentSettings = settingsData[0] || DEFAULT_SETTINGS;

  const [settings, setSettings] = useState<PomodoroSettings>(currentSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [remainingSeconds, setRemainingSeconds] = useState(settings.workDuration * 60);
  const [totalSeconds, setTotalSeconds] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(settings.completedSessions || 0);
  const [autoStart, setAutoStart] = useState(settings.autoStart || false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync settings from backend data when it loads
  useEffect(() => {
    if (settingsData.length > 0) {
      const loadedSettings = settingsData[0];
      setSettings(loadedSettings);
      setCompletedSessions(loadedSettings.completedSessions || 0);
      setAutoStart(loadedSettings.autoStart || false);
      setRemainingSeconds(loadedSettings.workDuration * 60);
      setTotalSeconds(loadedSettings.workDuration * 60);
    }
  }, [settingsData]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        // Set work duration from amount (in minutes)
        const workMins = Math.floor(params.amount);
        const updatedSettings = { ...settings, workDuration: workMins };
        setSettings(updatedSettings);
        updateItem('default-pomodoro', updatedSettings);
        setRemainingSeconds(workMins * 60);
        setTotalSeconds(workMins * 60);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.settings) {
        setSettings(params.settings);
        if (params.settings.workDuration) {
          setRemainingSeconds(params.settings.workDuration * 60);
          setTotalSeconds(params.settings.workDuration * 60);
        }
      }
      if (params.sessionType) setSessionType(params.sessionType);
      if (params.completedSessions !== undefined) setCompletedSessions(params.completedSessions);
      if (params.autoStart !== undefined) setAutoStart(params.autoStart);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';

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
            handleSessionComplete();
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

  const handleSessionComplete = () => {
    playCompletionSound();
    setIsRunning(false);

    if (sessionType === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Sync completed sessions to backend
      updateItem('default-pomodoro', {
        ...settings,
        completedSessions: newCompletedSessions,
        lastUpdated: new Date().toISOString(),
      });

      // Determine next break type
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        switchSession('longBreak');
      } else {
        switchSession('shortBreak');
      }

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } else {
      // After break, switch to work
      switchSession('work');
    }

    if (autoStart) {
      setTimeout(() => setIsRunning(true), 1000);
    }
  };

  const switchSession = (type: SessionType) => {
    setSessionType(type);
    let duration: number;
    switch (type) {
      case 'work':
        duration = settings.workDuration * 60;
        break;
      case 'shortBreak':
        duration = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        duration = settings.longBreakDuration * 60;
        break;
    }
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
  };

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        sessionType === 'work' ? t('tools.pomodoroTimer.workSessionComplete', 'Work Session Complete!') : t('tools.pomodoroTimer.breakComplete', 'Break Complete!'),
        {
          body: sessionType === 'work' ? t('tools.pomodoroTimer.timeForABreak', 'Time for a break!') : t('tools.pomodoroTimer.readyToGetBackTo', 'Ready to get back to work?'),
          icon: '/favicon.ico',
        }
      );
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const formatTime = (totalSec: number): string => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    switchSession(sessionType);
  };

  const handleSkip = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const applySettings = (newSettings: PomodoroSettings) => {
    const updatedSettings = {
      ...newSettings,
      autoStart: autoStart,
      completedSessions: 0,
      lastUpdated: new Date().toISOString(),
    };
    setSettings(updatedSettings);
    updateItem('default-pomodoro', updatedSettings);
    setShowSettings(false);
    setIsRunning(false);
    setCompletedSessions(0);
    switchSession('work');
  };

  const getProgress = (): number => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return '#0D9488';
      case 'shortBreak':
        return '#10b981';
      case 'longBreak':
        return '#3b82f6';
    }
  };

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work':
        return <Briefcase className="w-6 h-6" />;
      case 'shortBreak':
        return <Coffee className="w-6 h-6" />;
      case 'longBreak':
        return <Coffee className="w-6 h-6" />;
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work':
        return 'Work Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: getSessionColor() }}>
            {getSessionIcon()}
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.pomodoroTimer.pomodoroTimer', 'Pomodoro Timer')}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <WidgetEmbedButton toolSlug="pomodoro-timer" toolName="Pomodoro Timer" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
            showLabel={true}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportToCSV(settingsData, POMODORO_COLUMNS as ColumnConfig[], { filename: 'pomodoro-settings' })}
            onExportExcel={() => exportToExcel(settingsData, POMODORO_COLUMNS as ColumnConfig[], { filename: 'pomodoro-settings' })}
            onExportJSON={() => exportToJSON(settingsData, { filename: 'pomodoro-settings' })}
            onExportPDF={() => exportToPDF(settingsData, POMODORO_COLUMNS as ColumnConfig[], { filename: 'pomodoro-settings', title: 'Pomodoro Timer Settings' })}
            onPrint={() => printData(settingsData, POMODORO_COLUMNS as ColumnConfig[], { title: 'Pomodoro Timer Settings' })}
            onCopyToClipboard={() => copyUtil(settingsData, POMODORO_COLUMNS as ColumnConfig[])}
            theme={theme}
            showImport={false}
          />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pomodoroTimer.timerSettings', 'Timer Settings')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pomodoroTimer.workDurationMinutes', 'Work Duration (minutes)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                  className={`w-20 px-3 py-1 text-center rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pomodoroTimer.shortBreakMinutes', 'Short Break (minutes)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 5 })}
                  className={`w-20 px-3 py-1 text-center rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pomodoroTimer.longBreakMinutes', 'Long Break (minutes)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                  className={`w-20 px-3 py-1 text-center rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pomodoroTimer.sessionsUntilLongBreak', 'Sessions until long break')}
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                  className={`w-20 px-3 py-1 text-center rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pomodoroTimer.autoStartNextSession', 'Auto-start next session')}
                </label>
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#0D9488]"
                />
              </div>
            </div>
            <button
              onClick={() => applySettings(settings)}
              className="w-full mt-4 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              {t('tools.pomodoroTimer.applySettings', 'Apply Settings')}
            </button>
          </div>
        )}

        {/* Session Type Indicator */}
        <div className={`text-center py-3 rounded-lg`} style={{ backgroundColor: `${getSessionColor()}20` }}>
          <div className={`text-lg font-semibold`} style={{ color: getSessionColor() }}>
            {getSessionLabel()}
          </div>
        </div>

        {/* Time Display */}
        <div className={`text-center py-12 rounded-lg relative overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-1 transition-all duration-1000"
            style={{ width: `${getProgress()}%`, backgroundColor: getSessionColor() }}
          />

          <div className={`text-7xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* Session Counter */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < completedSessions % settings.sessionsUntilLongBreak
                  ? 'bg-[#0D9488]'
                  : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
          <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {completedSessions} sessions completed
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleStartPause}
            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: isRunning ? '#f59e0b' : getSessionColor(),
              color: 'white',
            }}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                {t('tools.pomodoroTimer.pause', 'Pause')}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {t('tools.pomodoroTimer.start', 'Start')}
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            {t('tools.pomodoroTimer.reset', 'Reset')}
          </button>

          <button
            onClick={handleSkip}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.pomodoroTimer.skip', 'Skip')}
          </button>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Volume2 className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.pomodoroTimer.pomodoroTechnique', 'Pomodoro Technique')}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Work in focused 25-minute sessions, followed by short breaks. After 4 sessions, take a longer break.
                This timer will notify you when each session is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
