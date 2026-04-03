import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Clock, Copy, Check, Sunrise, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SleepCycleToolProps {
  uiConfig?: UIConfig;
}

type Mode = 'wake' | 'sleep';

export const SleepCycleTool: React.FC<SleepCycleToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<Mode>('wake');
  const [time, setTime] = useState('07:00');
  const [copied, setCopied] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.formData) {
        if (params.formData.mode) setMode(params.formData.mode as Mode);
        if (params.formData.time) setTime(params.formData.time);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const CYCLE_DURATION = 90; // minutes per sleep cycle
  const FALL_ASLEEP_TIME = 14; // average time to fall asleep

  const results = useMemo(() => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    const cycles: { time: string; cycles: number; quality: string; qualityColor: string }[] = [];

    if (mode === 'wake') {
      // Calculate when to go to bed to wake up at the specified time
      for (let numCycles = 6; numCycles >= 3; numCycles--) {
        const sleepDuration = numCycles * CYCLE_DURATION;
        let bedtimeMinutes = timeInMinutes - sleepDuration - FALL_ASLEEP_TIME;

        // Handle day wrap
        if (bedtimeMinutes < 0) bedtimeMinutes += 24 * 60;

        const bedtimeHours = Math.floor(bedtimeMinutes / 60) % 24;
        const bedtimeMins = bedtimeMinutes % 60;

        let quality: string;
        let qualityColor: string;

        if (numCycles >= 5) {
          quality = 'Optimal';
          qualityColor = 'green';
        } else if (numCycles >= 4) {
          quality = 'Good';
          qualityColor = 'blue';
        } else {
          quality = 'Minimum';
          qualityColor = 'yellow';
        }

        cycles.push({
          time: `${String(bedtimeHours).padStart(2, '0')}:${String(bedtimeMins).padStart(2, '0')}`,
          cycles: numCycles,
          quality,
          qualityColor,
        });
      }
    } else {
      // Calculate when to wake up if going to bed at the specified time
      for (let numCycles = 3; numCycles <= 6; numCycles++) {
        const sleepDuration = numCycles * CYCLE_DURATION;
        let wakeTimeMinutes = timeInMinutes + sleepDuration + FALL_ASLEEP_TIME;

        // Handle day wrap
        wakeTimeMinutes = wakeTimeMinutes % (24 * 60);

        const wakeHours = Math.floor(wakeTimeMinutes / 60);
        const wakeMins = wakeTimeMinutes % 60;

        let quality: string;
        let qualityColor: string;

        if (numCycles >= 5) {
          quality = 'Optimal';
          qualityColor = 'green';
        } else if (numCycles >= 4) {
          quality = 'Good';
          qualityColor = 'blue';
        } else {
          quality = 'Minimum';
          qualityColor = 'yellow';
        }

        cycles.push({
          time: `${String(wakeHours).padStart(2, '0')}:${String(wakeMins).padStart(2, '0')}`,
          cycles: numCycles,
          quality,
          qualityColor,
        });
      }
    }

    return cycles;
  }, [time, mode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatDuration = (cycles: number) => {
    const totalMinutes = cycles * CYCLE_DURATION;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const quickTimes = mode === 'wake'
    ? ['06:00', '06:30', '07:00', '07:30', '08:00']
    : ['21:00', '22:00', '23:00', '00:00'];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sleepCycle.sleepCycleCalculator', 'Sleep Cycle Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sleepCycle.wakeUpRefreshedAtThe', 'Wake up refreshed at the right time')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.sleepCycle.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sleepCycle.iWantTo', 'I want to...')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('wake')}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                mode === 'wake'
                  ? 'bg-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Sunrise className="w-5 h-5" />
              <div>
                <div className="font-medium">{t('tools.sleepCycle.wakeUpAt', 'Wake up at')}</div>
                <div className="text-xs opacity-75">{t('tools.sleepCycle.findBestBedtime', 'Find best bedtime')}</div>
              </div>
            </button>
            <button
              onClick={() => setMode('sleep')}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                mode === 'sleep'
                  ? 'bg-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Moon className="w-5 h-5" />
              <div>
                <div className="font-medium">{t('tools.sleepCycle.goToBedAt', 'Go to bed at')}</div>
                <div className="text-xs opacity-75">{t('tools.sleepCycle.findBestWakeTime', 'Find best wake time')}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {mode === 'wake' ? t('tools.sleepCycle.wakeUpTime', 'Wake up time') : t('tools.sleepCycle.bedtime', 'Bedtime')}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border text-2xl text-center ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Quick Time Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickTimes.map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                time === t
                  ? 'bg-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} border`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
            {mode === 'wake' ? t('tools.sleepCycle.bestTimesToGoTo', 'Best times to go to bed') : t('tools.sleepCycle.bestTimesToWakeUp', 'Best times to wake up')}
          </h4>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {result.time}
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {result.cycles} cycles ({formatDuration(result.cycles)})
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.qualityColor === 'green' ? 'bg-green-500/20 text-green-500' :
                      result.qualityColor === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {result.quality}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(result.time)}
                  className={`p-2 rounded-lg transition-colors ${
                    copied === result.time ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {copied === result.time ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Cycle Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.sleepCycle.aboutSleepCycles', 'About Sleep Cycles')}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold text-indigo-500`}>90</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sleepCycle.minPerCycle', 'min per cycle')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-indigo-500`}>5-6</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sleepCycle.idealCycles', 'ideal cycles')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-indigo-500`}>14</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sleepCycle.minToFallAsleep', 'min to fall asleep')}</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.sleepCycle.tip', 'Tip:')}</strong> Waking up between sleep cycles helps you feel more refreshed.
            Aim for 5-6 complete cycles (7.5-9 hours) for optimal rest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SleepCycleTool;
