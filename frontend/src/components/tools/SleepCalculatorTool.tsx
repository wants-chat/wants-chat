import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Clock, BedDouble, AlarmClock, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CalculationMode = 'wakeUp' | 'bedtime';

interface SleepCycle {
  time: string;
  cycles: number;
  duration: string;
  quality: 'optimal' | 'good' | 'fair';
}

interface SleepCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SleepCalculatorTool: React.FC<SleepCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('bedtime');
  const [time, setTime] = useState('07:00');
  const [fallAsleepTime, setFallAsleepTime] = useState(15);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        mode?: string;
        time?: string;
        fallAsleepTime?: number;
      };
      if (params.mode && (params.mode === 'wakeUp' || params.mode === 'bedtime')) {
        setMode(params.mode);
      }
      if (params.time) setTime(params.time);
      if (params.fallAsleepTime) setFallAsleepTime(params.fallAsleepTime);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const SLEEP_CYCLE_MINUTES = 90;

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getQuality = (cycles: number): 'optimal' | 'good' | 'fair' => {
    if (cycles >= 5 && cycles <= 6) return 'optimal';
    if (cycles === 4) return 'good';
    return 'fair';
  };

  const calculations = useMemo((): SleepCycle[] => {
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    const cycles: SleepCycle[] = [];

    if (mode === 'bedtime') {
      // Calculate bedtimes based on wake-up time
      for (let numCycles = 6; numCycles >= 3; numCycles--) {
        const sleepDuration = numCycles * SLEEP_CYCLE_MINUTES;
        const bedtime = new Date(targetTime);
        bedtime.setMinutes(bedtime.getMinutes() - sleepDuration - fallAsleepTime);

        cycles.push({
          time: formatTime(bedtime),
          cycles: numCycles,
          duration: formatDuration(sleepDuration),
          quality: getQuality(numCycles),
        });
      }
    } else {
      // Calculate wake-up times based on bedtime
      const sleepStart = new Date(targetTime);
      sleepStart.setMinutes(sleepStart.getMinutes() + fallAsleepTime);

      for (let numCycles = 3; numCycles <= 6; numCycles++) {
        const sleepDuration = numCycles * SLEEP_CYCLE_MINUTES;
        const wakeTime = new Date(sleepStart);
        wakeTime.setMinutes(wakeTime.getMinutes() + sleepDuration);

        cycles.push({
          time: formatTime(wakeTime),
          cycles: numCycles,
          duration: formatDuration(sleepDuration),
          quality: getQuality(numCycles),
        });
      }
    }

    return cycles;
  }, [time, mode, fallAsleepTime]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'optimal':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'good':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    }
  };

  const sleepTips = [
    { icon: '🌙', tip: 'Keep a consistent sleep schedule, even on weekends' },
    { icon: '📱', tip: 'Avoid screens 1 hour before bed - blue light disrupts melatonin' },
    { icon: '☕', tip: 'No caffeine after 2 PM for better sleep quality' },
    { icon: '🏃', tip: 'Exercise regularly, but not too close to bedtime' },
    { icon: '🌡️', tip: 'Keep bedroom cool (65-68°F / 18-20°C)' },
    { icon: '🧘', tip: 'Practice relaxation techniques before bed' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sleepCalculator.sleepCalculator', 'Sleep Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sleepCalculator.wakeUpRefreshedByCompleting', 'Wake up refreshed by completing full sleep cycles')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className={`inline-flex rounded-xl overflow-hidden p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <button
              onClick={() => setMode('bedtime')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'bedtime'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sun className="w-4 h-4" />
              {t('tools.sleepCalculator.iNeedToWakeUp', 'I need to wake up at...')}
            </button>
            <button
              onClick={() => setMode('wakeUp')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'wakeUp'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Moon className="w-4 h-4" />
              {t('tools.sleepCalculator.iWantToGoTo', 'I want to go to bed at...')}
            </button>
          </div>
        </div>

        {/* Time Input */}
        <div className="flex flex-col items-center space-y-4">
          <label className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'bedtime' ? t('tools.sleepCalculator.wakeUpTime', 'Wake-up Time') : t('tools.sleepCalculator.bedtime', 'Bedtime')}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`text-4xl font-bold text-center px-8 py-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Fall Asleep Time */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            Time to fall asleep: {fallAsleepTime} minutes
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={fallAsleepTime}
            onChange={(e) => setFallAsleepTime(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-600"
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>5 min</span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>60 min</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h4 className={`font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'bedtime' ? (
              <>
                <BedDouble className="w-5 h-5 inline mr-2" />
                {t('tools.sleepCalculator.recommendedBedtimes', 'Recommended Bedtimes')}
              </>
            ) : (
              <>
                <AlarmClock className="w-5 h-5 inline mr-2" />
                {t('tools.sleepCalculator.recommendedWakeUpTimes', 'Recommended Wake-up Times')}
              </>
            )}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calculations.map((cycle, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${getQualityColor(cycle.quality)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{cycle.time}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cycle.cycles} sleep cycles • {cycle.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      cycle.quality === 'optimal'
                        ? 'bg-green-500/20 text-green-500'
                        : cycle.quality === 'good'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-orange-500/20 text-orange-500'
                    }`}>
                      {cycle.quality}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Cycle Info */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} border`}>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sleepCalculator.whySleepCyclesMatter', 'Why Sleep Cycles Matter')}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Each sleep cycle lasts about 90 minutes and includes light sleep, deep sleep, and REM sleep.
                Waking up at the end of a cycle (during light sleep) helps you feel more refreshed.
                Most adults need 5-6 complete cycles per night for optimal rest.
              </p>
            </div>
          </div>
        </div>

        {/* Sleep Tips */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.sleepCalculator.sleepTipsForBetterRest', 'Sleep Tips for Better Rest')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sleepTips.map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepCalculatorTool;
