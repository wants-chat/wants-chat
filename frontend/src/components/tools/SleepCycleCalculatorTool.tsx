import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Clock, Bed, AlarmClock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Mode = 'wakeUp' | 'sleepNow' | 'bedtime';

interface SleepCycleCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SleepCycleCalculatorTool: React.FC<SleepCycleCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<Mode>('wakeUp');
  const [targetTime, setTargetTime] = useState('07:00');
  const [fallAsleepTime, setFallAsleepTime] = useState(15);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        mode?: string;
        targetTime?: string;
        fallAsleepTime?: number;
      };
      if (params.mode && ['wakeUp', 'sleepNow', 'bedtime'].includes(params.mode)) {
        setMode(params.mode as Mode);
      }
      if (params.targetTime) setTargetTime(params.targetTime);
      if (params.fallAsleepTime) setFallAsleepTime(params.fallAsleepTime);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const CYCLE_LENGTH = 90; // minutes
  const RECOMMENDED_CYCLES = [5, 6]; // 7.5 to 9 hours

  const calculations = useMemo(() => {
    const [hours, minutes] = targetTime.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    if (mode === 'wakeUp') {
      // Calculate bedtimes for wake-up time
      const bedtimes = [];
      for (let cycles = 6; cycles >= 3; cycles--) {
        const sleepDuration = cycles * CYCLE_LENGTH + fallAsleepTime;
        const bedtime = new Date(targetDate.getTime() - sleepDuration * 60000);
        bedtimes.push({
          time: bedtime,
          cycles,
          duration: cycles * CYCLE_LENGTH,
          isRecommended: RECOMMENDED_CYCLES.includes(cycles),
        });
      }
      return { bedtimes, wakeTimes: [] };
    } else if (mode === 'sleepNow') {
      // Calculate wake times if sleeping now
      const now = new Date();
      const sleepStart = new Date(now.getTime() + fallAsleepTime * 60000);
      const wakeTimes = [];
      for (let cycles = 3; cycles <= 6; cycles++) {
        const sleepDuration = cycles * CYCLE_LENGTH;
        const wakeTime = new Date(sleepStart.getTime() + sleepDuration * 60000);
        wakeTimes.push({
          time: wakeTime,
          cycles,
          duration: sleepDuration,
          isRecommended: RECOMMENDED_CYCLES.includes(cycles),
        });
      }
      return { bedtimes: [], wakeTimes };
    } else {
      // Calculate wake times for target bedtime
      const sleepStart = new Date(targetDate.getTime() + fallAsleepTime * 60000);
      const wakeTimes = [];
      for (let cycles = 3; cycles <= 6; cycles++) {
        const sleepDuration = cycles * CYCLE_LENGTH;
        const wakeTime = new Date(sleepStart.getTime() + sleepDuration * 60000);
        wakeTimes.push({
          time: wakeTime,
          cycles,
          duration: sleepDuration,
          isRecommended: RECOMMENDED_CYCLES.includes(cycles),
        });
      }
      return { bedtimes: [], wakeTimes };
    }
  }, [mode, targetTime, fallAsleepTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const getSleepQuality = (cycles: number) => {
    if (cycles >= 5) return { label: 'Optimal', color: 'text-green-500' };
    if (cycles >= 4) return { label: 'Good', color: 'text-yellow-500' };
    return { label: 'Minimal', color: 'text-orange-500' };
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Moon className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sleepCycleCalculator.sleepCycleCalculator', 'Sleep Cycle Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sleepCycleCalculator.wakeUpRefreshedBetweenSleep', 'Wake up refreshed between sleep cycles')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Selection */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMode('wakeUp')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center gap-1 ${mode === 'wakeUp' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <AlarmClock className="w-5 h-5" />
            <span className="text-sm">{t('tools.sleepCycleCalculator.wakeUpAt', 'Wake Up At')}</span>
          </button>
          <button
            onClick={() => setMode('sleepNow')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center gap-1 ${mode === 'sleepNow' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Bed className="w-5 h-5" />
            <span className="text-sm">{t('tools.sleepCycleCalculator.sleepNow', 'Sleep Now')}</span>
          </button>
          <button
            onClick={() => setMode('bedtime')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center gap-1 ${mode === 'bedtime' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm">{t('tools.sleepCycleCalculator.bedtimeAt', 'Bedtime At')}</span>
          </button>
        </div>

        {/* Time Input */}
        {mode !== 'sleepNow' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {mode === 'wakeUp' ? t('tools.sleepCycleCalculator.iWantToWakeUp', 'I want to wake up at:') : t('tools.sleepCycleCalculator.iPlanToGoTo', 'I plan to go to bed at:')}
            </label>
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {/* Fall Asleep Time */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            Time to fall asleep: {fallAsleepTime} minutes
          </label>
          <input
            type="range"
            min="5"
            max="45"
            step="5"
            value={fallAsleepTime}
            onChange={(e) => setFallAsleepTime(parseInt(e.target.value))}
            className="w-full"
          />
          <div className={`flex justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>5 min</span>
            <span>45 min</span>
          </div>
        </div>

        {/* Results */}
        {mode === 'wakeUp' ? (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Bed className="w-4 h-4 inline mr-2" />
              {t('tools.sleepCycleCalculator.goToBedAt', 'Go to bed at:')}
            </h4>
            {calculations.bedtimes.map((item, idx) => {
              const quality = getSleepQuality(item.cycles);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg flex items-center justify-between ${item.isRecommended ? (isDark ? 'bg-indigo-900/30 ring-1 ring-indigo-500' : 'bg-indigo-50 ring-1 ring-indigo-300') : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div>
                    <div className={`text-2xl font-bold ${item.isRecommended ? 'text-indigo-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(item.time)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.cycles} cycles • {formatDuration(item.duration)} sleep
                    </div>
                  </div>
                  <div className={`text-right ${quality.color}`}>
                    <div className="text-sm font-medium">{quality.label}</div>
                    {item.isRecommended && <div className="text-xs">{t('tools.sleepCycleCalculator.recommended', 'Recommended')}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Sun className="w-4 h-4 inline mr-2" />
              {t('tools.sleepCycleCalculator.wakeUpAt2', 'Wake up at:')}
            </h4>
            {calculations.wakeTimes.map((item, idx) => {
              const quality = getSleepQuality(item.cycles);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg flex items-center justify-between ${item.isRecommended ? (isDark ? 'bg-indigo-900/30 ring-1 ring-indigo-500' : 'bg-indigo-50 ring-1 ring-indigo-300') : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div>
                    <div className={`text-2xl font-bold ${item.isRecommended ? 'text-indigo-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(item.time)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.cycles} cycles • {formatDuration(item.duration)} sleep
                    </div>
                  </div>
                  <div className={`text-right ${quality.color}`}>
                    <div className="text-sm font-medium">{quality.label}</div>
                    {item.isRecommended && <div className="text-xs">{t('tools.sleepCycleCalculator.recommended2', 'Recommended')}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sleep Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sleepCycleCalculator.aboutSleepCycles', 'About Sleep Cycles')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Each sleep cycle lasts approximately 90 minutes</li>
            <li>• Adults typically need 5-6 cycles (7.5-9 hours) per night</li>
            <li>• Waking between cycles helps you feel more refreshed</li>
            <li>• Average time to fall asleep is 10-20 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SleepCycleCalculatorTool;
