import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Egg, Timer, Mountain, Thermometer, Play, Pause, RotateCcw, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type EggSize = 'small' | 'medium' | 'large' | 'extra-large';
type Doneness = 'soft' | 'medium' | 'hard';
type StartingTemp = 'room' | 'refrigerated';

interface DonenessConfig {
  name: string;
  description: string;
  yolkDescription: string;
}

interface TimingTable {
  [key: string]: {
    [key in StartingTemp]: number; // seconds
  };
}

interface EggBoilingToolProps {
  uiConfig?: UIConfig;
}

export const EggBoilingTool: React.FC<EggBoilingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [eggSize, setEggSize] = useState<EggSize>('large');
  const [doneness, setDoneness] = useState<Doneness>('medium');
  const [startingTemp, setStartingTemp] = useState<StartingTemp>('refrigerated');
  const [altitude, setAltitude] = useState('0');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        eggSize?: EggSize;
        doneness?: Doneness;
        startingTemp?: StartingTemp;
        altitude?: string;
      };
      if (params.eggSize) setEggSize(params.eggSize);
      if (params.doneness) setDoneness(params.doneness);
      if (params.startingTemp) setStartingTemp(params.startingTemp);
      if (params.altitude) setAltitude(params.altitude);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const eggSizes: { value: EggSize; label: string; weight: string }[] = [
    { value: 'small', label: 'Small', weight: '~45g' },
    { value: 'medium', label: 'Medium', weight: '~50g' },
    { value: 'large', label: 'Large', weight: '~57g' },
    { value: 'extra-large', label: 'Extra Large', weight: '~64g' },
  ];

  const donenessOptions: Record<Doneness, DonenessConfig> = {
    soft: {
      name: 'Soft Boiled',
      description: 'Runny yolk, barely set white',
      yolkDescription: 'Liquid, jammy center',
    },
    medium: {
      name: 'Medium Boiled',
      description: 'Jammy yolk, fully set white',
      yolkDescription: 'Creamy, slightly soft center',
    },
    hard: {
      name: 'Hard Boiled',
      description: 'Fully set yolk and white',
      yolkDescription: 'Firm, fully cooked through',
    },
  };

  // Base cooking times in seconds for large eggs at sea level
  const baseTimes: TimingTable = {
    'small-soft': { room: 240, refrigerated: 270 },
    'small-medium': { room: 360, refrigerated: 390 },
    'small-hard': { room: 480, refrigerated: 510 },
    'medium-soft': { room: 270, refrigerated: 300 },
    'medium-medium': { room: 390, refrigerated: 420 },
    'medium-hard': { room: 510, refrigerated: 540 },
    'large-soft': { room: 300, refrigerated: 360 },
    'large-medium': { room: 420, refrigerated: 480 },
    'large-hard': { room: 540, refrigerated: 600 },
    'extra-large-soft': { room: 330, refrigerated: 390 },
    'extra-large-medium': { room: 450, refrigerated: 510 },
    'extra-large-hard': { room: 570, refrigerated: 660 },
  };

  const calculateCookingTime = useCallback((): number => {
    const key = `${eggSize}-${doneness}`;
    const baseTime = baseTimes[key]?.[startingTemp] || 480;

    // Altitude adjustment: add ~1 minute per 1000 feet above sea level
    const altitudeFeet = parseFloat(altitude) || 0;
    const altitudeAdjustment = Math.floor(altitudeFeet / 1000) * 60;

    return baseTime + altitudeAdjustment;
  }, [eggSize, doneness, startingTemp, altitude, baseTimes]);

  const calculatedTime = useMemo(() => calculateCookingTime(), [calculateCookingTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  }, [totalTime, timeRemaining]);

  const startTimer = () => {
    const time = calculateCookingTime();
    setTotalTime(time);
    setTimeRemaining(time);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setTotalTime(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Could add notification/sound here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const getProgressColor = (): string => {
    if (progress < 33) return 'bg-yellow-500';
    if (progress < 66) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const isTimerActive = timeRemaining > 0 || isRunning;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Egg className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eggBoiling.eggBoilingTimer', 'Egg Boiling Timer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eggBoiling.perfectEggsEveryTime', 'Perfect eggs every time')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.eggBoiling.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Egg Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eggBoiling.eggSize', 'Egg Size')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {eggSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => !isTimerActive && setEggSize(size.value)}
                disabled={isTimerActive}
                className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                  eggSize === size.value
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">{size.label}</div>
                <div className="text-xs opacity-75">{size.weight}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Doneness Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eggBoiling.doneness', 'Doneness')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(donenessOptions) as Doneness[]).map((d) => (
              <button
                key={d}
                onClick={() => !isTimerActive && setDoneness(d)}
                disabled={isTimerActive}
                className={`py-3 px-3 rounded-lg text-sm transition-colors ${
                  doneness === d
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">{donenessOptions[d].name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Doneness Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{donenessOptions[doneness].name}</h4>
            <span className="text-orange-500 font-bold">{formatTime(calculatedTime)}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {donenessOptions[doneness].description}
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Yolk: {donenessOptions[doneness].yolkDescription}
          </p>
        </div>

        {/* Starting Temperature */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.eggBoiling.startingTemperature', 'Starting Temperature')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => !isTimerActive && setStartingTemp('room')}
              disabled={isTimerActive}
              className={`py-2 px-4 rounded-lg ${
                startingTemp === 'room'
                  ? 'bg-orange-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="font-medium">{t('tools.eggBoiling.roomTemp', 'Room Temp')}</div>
              <div className="text-xs opacity-75">~20C / 68F</div>
            </button>
            <button
              onClick={() => !isTimerActive && setStartingTemp('refrigerated')}
              disabled={isTimerActive}
              className={`py-2 px-4 rounded-lg ${
                startingTemp === 'refrigerated'
                  ? 'bg-orange-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="font-medium">{t('tools.eggBoiling.refrigerated', 'Refrigerated')}</div>
              <div className="text-xs opacity-75">~4C / 40F</div>
            </button>
          </div>
        </div>

        {/* Altitude Adjustment */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Mountain className="w-4 h-4 inline mr-1" />
            {t('tools.eggBoiling.altitudeFeetAboveSeaLevel', 'Altitude (feet above sea level)')}
          </label>
          <input
            type="number"
            value={altitude}
            onChange={(e) => !isTimerActive && setAltitude(e.target.value)}
            disabled={isTimerActive}
            placeholder="0"
            min="0"
            step="500"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.eggBoiling.higherAltitudesRequireLongerCooking', 'Higher altitudes require longer cooking times (+1 min per 1,000 ft)')}
          </p>
        </div>

        {/* Timer Display */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isTimerActive ? t('tools.eggBoiling.timeRemaining', 'Time Remaining') : t('tools.eggBoiling.cookingTime', 'Cooking Time')}
              </span>
            </div>
            <div className={`text-5xl font-bold ${timeRemaining === 0 && totalTime > 0 ? 'text-green-500' : 'text-orange-500'}`}>
              {isTimerActive ? formatTime(timeRemaining) : formatTime(calculatedTime)}
            </div>
            {timeRemaining === 0 && totalTime > 0 && (
              <p className="text-green-500 font-medium mt-2">{t('tools.eggBoiling.eggsAreDoneRemoveFrom', 'Eggs are done! Remove from heat.')}</p>
            )}
          </div>

          {/* Progress Bar */}
          {isTimerActive && (
            <div className="mt-4">
              <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full transition-all duration-1000 ${getProgressColor()}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{t('tools.eggBoiling.start', 'Start')}</span>
                <span>{Math.round(progress)}%</span>
                <span>{t('tools.eggBoiling.done', 'Done')}</span>
              </div>
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex gap-3 mt-4 justify-center">
            {!isRunning && timeRemaining === 0 && (
              <button
                onClick={startTimer}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Play className="w-5 h-5" />
                {t('tools.eggBoiling.startTimer', 'Start Timer')}
              </button>
            )}
            {isRunning && (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Pause className="w-5 h-5" />
                {t('tools.eggBoiling.pause', 'Pause')}
              </button>
            )}
            {!isRunning && timeRemaining > 0 && (
              <button
                onClick={() => setIsRunning(true)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Play className="w-5 h-5" />
                {t('tools.eggBoiling.resume', 'Resume')}
              </button>
            )}
            {isTimerActive && (
              <button
                onClick={resetTimer}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
                {t('tools.eggBoiling.reset', 'Reset')}
              </button>
            )}
          </div>
        </div>

        {/* Visual Egg Progress */}
        {isTimerActive && (
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-10 rounded-full transition-colors duration-500 ${
                  progress >= (i + 1) * 20
                    ? doneness === 'soft'
                      ? 'bg-yellow-400'
                      : doneness === 'medium'
                      ? 'bg-orange-400'
                      : 'bg-orange-600'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                }`}
                style={{
                  clipPath: 'ellipse(50% 50% at 50% 50%)',
                }}
              />
            ))}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.eggBoiling.tipsForPerfectEggs', 'Tips for perfect eggs:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.eggBoiling.useATimerTimingIs', 'Use a timer - timing is everything')}</li>
                <li>{t('tools.eggBoiling.startWithEggsInCold', 'Start with eggs in cold water, bring to boil')}</li>
                <li>{t('tools.eggBoiling.onceBoilingReduceToGentle', 'Once boiling, reduce to gentle simmer')}</li>
                <li>{t('tools.eggBoiling.transferToIceBathImmediately', 'Transfer to ice bath immediately when done')}</li>
                <li>{t('tools.eggBoiling.olderEggs710Days', 'Older eggs (7-10 days) peel more easily')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EggBoilingTool;
