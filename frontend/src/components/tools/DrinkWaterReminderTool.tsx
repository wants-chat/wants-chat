import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Plus, Minus, Target, Bell, Volume2, RotateCcw, TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToJSON,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DrinkWaterReminderToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for export
const HISTORY_COLUMNS: ColumnConfig[] = [
  { key: 'time', header: 'Time', type: 'string', format: (v) => v instanceof Date ? v.toLocaleTimeString() : new Date(v).toLocaleTimeString() },
  { key: 'cups', header: 'Cups Consumed', type: 'number' },
];

export const DrinkWaterReminderTool: React.FC<DrinkWaterReminderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dailyGoal, setDailyGoal] = useState(8); // cups
  const [cupsDrank, setCupsDrank] = useState(0);
  const [customCupSize, setCustomCupSize] = useState(8); // oz
  const [reminderInterval, setReminderInterval] = useState(60); // minutes
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [nextReminderIn, setNextReminderIn] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<{ time: Date; cups: number }[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        dailyGoal?: number;
        customCupSize?: number;
        reminderInterval?: number;
      };
      if (params.dailyGoal) setDailyGoal(params.dailyGoal);
      if (params.customCupSize) setCustomCupSize(params.customCupSize);
      if (params.reminderInterval) setReminderInterval(params.reminderInterval);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.dailyGoal) setDailyGoal(params.dailyGoal);
      if (params.cupsDrank) setCupsDrank(params.cupsDrank);
      if (params.customCupSize) setCustomCupSize(params.customCupSize);
      if (params.reminderInterval) setReminderInterval(params.reminderInterval);
      if (params.history) setHistory(params.history);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reminderRef = useRef<NodeJS.Timeout | null>(null);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Water drop sound effect
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const addCup = useCallback(() => {
    setCupsDrank(prev => {
      const newCount = prev + 1;
      setHistory(h => [...h, { time: new Date(), cups: newCount }]);
      return newCount;
    });
    playSound();

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  }, [playSound, uiConfig?.params]);

  const removeCup = () => {
    setCupsDrank(prev => Math.max(0, prev - 1));
  };

  const resetDay = () => {
    setCupsDrank(0);
    setHistory([]);
  };

  // Reminder system
  useEffect(() => {
    if (!isReminderActive) {
      if (reminderRef.current) clearTimeout(reminderRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setNextReminderIn(reminderInterval * 60);

    intervalRef.current = setInterval(() => {
      setNextReminderIn(prev => {
        if (prev <= 1) {
          // Time for reminder
          playSound();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💧 Hydration Reminder', {
              body: `Time to drink water! You've had ${cupsDrank}/${dailyGoal} cups today.`,
              icon: '💧',
            });
          }
          return reminderInterval * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReminderActive, reminderInterval, cupsDrank, dailyGoal, playSound]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    setIsReminderActive(true);
  };

  const progress = Math.min(100, (cupsDrank / dailyGoal) * 100);
  const totalOz = cupsDrank * customCupSize;
  const totalMl = totalOz * 29.5735;
  const remaining = Math.max(0, dailyGoal - cupsDrank);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quickGoals = [6, 8, 10, 12];
  const cupSizes = [
    { label: 'Small (6 oz)', oz: 6 },
    { label: 'Standard (8 oz)', oz: 8 },
    { label: 'Large (12 oz)', oz: 12 },
    { label: 'Bottle (16 oz)', oz: 16 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Droplets className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.drinkWaterReminder.waterReminder', 'Water Reminder')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.drinkWaterReminder.trackYourDailyHydration', 'Track your daily hydration')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportDropdown
              onExportCSV={() => exportToCSV(history, HISTORY_COLUMNS, { filename: 'water-reminder-log' })}
              onExportJSON={() => exportToJSON(history, { filename: 'water-reminder-log' })}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg ${soundEnabled ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.drinkWaterReminder.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Progress Circle */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke={isDark ? '#374151' : '#e5e7eb'}
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${progress * 5.53} 553`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="w-8 h-8 text-blue-500 mb-1" />
              <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {cupsDrank}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                of {dailyGoal} cups
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add/Remove */}
        <div className="flex justify-center gap-4">
          <button
            onClick={removeCup}
            disabled={cupsDrank === 0}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Minus className="w-6 h-6" />
          </button>
          <button
            onClick={addCup}
            className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-lg"
          >
            <Plus className="w-8 h-8" />
          </button>
          <button
            onClick={resetDay}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold text-blue-500`}>{totalOz} oz</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.drinkWaterReminder.total', 'Total')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.round(totalMl)} mL</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.drinkWaterReminder.metric', 'Metric')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${remaining === 0 ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {remaining}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.drinkWaterReminder.remaining', 'Remaining')}</div>
          </div>
        </div>

        {/* Goal achieved */}
        {cupsDrank >= dailyGoal && (
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="text-2xl mb-1">🎉</div>
            <div className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              {t('tools.drinkWaterReminder.goalAchieved', 'Goal Achieved!')}
            </div>
            <div className={`text-sm ${isDark ? 'text-green-500' : 'text-green-600'}`}>
              {t('tools.drinkWaterReminder.greatJobStayingHydratedToday', 'Great job staying hydrated today!')}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.drinkWaterReminder.settings', 'Settings')}</h4>

          {/* Daily Goal */}
          <div className="mb-4">
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Target className="w-4 h-4 inline mr-1" />
              {t('tools.drinkWaterReminder.dailyGoal', 'Daily Goal')}
            </label>
            <div className="flex gap-2">
              {quickGoals.map(g => (
                <button
                  key={g}
                  onClick={() => setDailyGoal(g)}
                  className={`flex-1 py-2 rounded-lg text-sm ${dailyGoal === g ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {g} cups
                </button>
              ))}
            </div>
          </div>

          {/* Cup Size */}
          <div className="mb-4">
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.drinkWaterReminder.cupSize', 'Cup Size')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cupSizes.map(size => (
                <button
                  key={size.oz}
                  onClick={() => setCustomCupSize(size.oz)}
                  className={`py-2 px-3 rounded-lg text-sm ${customCupSize === size.oz ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Bell className="w-4 h-4 inline mr-1" />
              {t('tools.drinkWaterReminder.reminderInterval', 'Reminder Interval')}
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={reminderInterval}
                onChange={(e) => setReminderInterval(parseInt(e.target.value))}
                className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="30">{t('tools.drinkWaterReminder.every30Min', 'Every 30 min')}</option>
                <option value="45">{t('tools.drinkWaterReminder.every45Min', 'Every 45 min')}</option>
                <option value="60">{t('tools.drinkWaterReminder.everyHour', 'Every hour')}</option>
                <option value="90">{t('tools.drinkWaterReminder.every15Hours', 'Every 1.5 hours')}</option>
                <option value="120">{t('tools.drinkWaterReminder.every2Hours', 'Every 2 hours')}</option>
              </select>
              <button
                onClick={() => isReminderActive ? setIsReminderActive(false) : requestNotificationPermission()}
                className={`px-4 py-2 rounded-lg ${isReminderActive ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
              >
                {isReminderActive ? t('tools.drinkWaterReminder.stop', 'Stop') : t('tools.drinkWaterReminder.start', 'Start')}
              </button>
            </div>
            {isReminderActive && (
              <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Next reminder in: {formatCountdown(nextReminderIn)}
              </div>
            )}
          </div>
        </div>

        {/* Today's Log */}
        {history.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.drinkWaterReminder.todaySLog', 'Today\'s Log')}</h4>
            </div>
            <div className="flex gap-1 flex-wrap">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}
                  title={entry.time.toLocaleTimeString()}
                >
                  💧 {entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.drinkWaterReminder.hydrationTips', 'Hydration Tips')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Start your day with a glass of water</li>
            <li>• Drink a glass before each meal</li>
            <li>• Keep a water bottle at your desk</li>
            <li>• Eat water-rich fruits and vegetables</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DrinkWaterReminderTool;
