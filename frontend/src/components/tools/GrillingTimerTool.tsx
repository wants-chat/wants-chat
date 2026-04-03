import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Timer, Thermometer, RotateCcw, Play, Pause, Bell, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GrillingTimerToolProps {
  uiConfig?: UIConfig;
}

type MeatType = 'beef' | 'chicken' | 'pork' | 'fish';
type Doneness = 'rare' | 'medium-rare' | 'medium' | 'medium-well' | 'well-done';

interface CutConfig {
  name: string;
  baseTime: number; // minutes per inch at medium
  minThickness: number;
  maxThickness: number;
  supportedDoneness: Doneness[];
}

interface MeatConfig {
  name: string;
  icon: string;
  cuts: Record<string, CutConfig>;
  defaultCut: string;
}

interface TemperatureTarget {
  fahrenheit: number;
  celsius: number;
  description: string;
}

export const GrillingTimerTool: React.FC<GrillingTimerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [meatType, setMeatType] = useState<MeatType>('beef');
  const [selectedCut, setSelectedCut] = useState('ribeye');
  const [thickness, setThickness] = useState('1');
  const [doneness, setDoneness] = useState<Doneness>('medium');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentSide, setCurrentSide] = useState(1);
  const [flipReminder, setFlipReminder] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.meatType) setMeatType(data.meatType as MeatType);
      if (data.cut) setSelectedCut(String(data.cut));
      if (data.thickness) setThickness(String(data.thickness));
      if (data.doneness) setDoneness(data.doneness as Doneness);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const meats: Record<MeatType, MeatConfig> = {
    beef: {
      name: 'Beef',
      icon: '🥩',
      defaultCut: 'ribeye',
      cuts: {
        ribeye: {
          name: 'Ribeye Steak',
          baseTime: 5,
          minThickness: 0.75,
          maxThickness: 2.5,
          supportedDoneness: ['rare', 'medium-rare', 'medium', 'medium-well', 'well-done'],
        },
        sirloin: {
          name: 'Sirloin Steak',
          baseTime: 4.5,
          minThickness: 0.75,
          maxThickness: 2,
          supportedDoneness: ['rare', 'medium-rare', 'medium', 'medium-well', 'well-done'],
        },
        filet: {
          name: 'Filet Mignon',
          baseTime: 5,
          minThickness: 1,
          maxThickness: 3,
          supportedDoneness: ['rare', 'medium-rare', 'medium', 'medium-well', 'well-done'],
        },
        burger: {
          name: 'Burger Patty',
          baseTime: 4,
          minThickness: 0.5,
          maxThickness: 1.5,
          supportedDoneness: ['medium', 'medium-well', 'well-done'],
        },
        flank: {
          name: 'Flank Steak',
          baseTime: 5,
          minThickness: 0.5,
          maxThickness: 1.5,
          supportedDoneness: ['medium-rare', 'medium', 'medium-well'],
        },
      },
    },
    chicken: {
      name: 'Chicken',
      icon: '🍗',
      defaultCut: 'breast',
      cuts: {
        breast: {
          name: 'Chicken Breast',
          baseTime: 7,
          minThickness: 0.5,
          maxThickness: 1.5,
          supportedDoneness: ['well-done'],
        },
        thigh: {
          name: 'Chicken Thigh',
          baseTime: 6,
          minThickness: 0.5,
          maxThickness: 1.5,
          supportedDoneness: ['well-done'],
        },
        drumstick: {
          name: 'Drumstick',
          baseTime: 10,
          minThickness: 1,
          maxThickness: 2,
          supportedDoneness: ['well-done'],
        },
        wings: {
          name: 'Wings',
          baseTime: 8,
          minThickness: 0.5,
          maxThickness: 1,
          supportedDoneness: ['well-done'],
        },
      },
    },
    pork: {
      name: 'Pork',
      icon: '🥓',
      defaultCut: 'chop',
      cuts: {
        chop: {
          name: 'Pork Chop',
          baseTime: 5,
          minThickness: 0.5,
          maxThickness: 2,
          supportedDoneness: ['medium', 'medium-well', 'well-done'],
        },
        tenderloin: {
          name: 'Pork Tenderloin',
          baseTime: 6,
          minThickness: 1,
          maxThickness: 2,
          supportedDoneness: ['medium', 'medium-well', 'well-done'],
        },
        ribs: {
          name: 'Ribs',
          baseTime: 15,
          minThickness: 1,
          maxThickness: 2,
          supportedDoneness: ['well-done'],
        },
        sausage: {
          name: 'Sausage',
          baseTime: 6,
          minThickness: 1,
          maxThickness: 1.5,
          supportedDoneness: ['well-done'],
        },
      },
    },
    fish: {
      name: 'Fish',
      icon: '🐟',
      defaultCut: 'salmon',
      cuts: {
        salmon: {
          name: 'Salmon Fillet',
          baseTime: 4,
          minThickness: 0.5,
          maxThickness: 1.5,
          supportedDoneness: ['medium-rare', 'medium', 'medium-well'],
        },
        tuna: {
          name: 'Tuna Steak',
          baseTime: 3,
          minThickness: 0.75,
          maxThickness: 1.5,
          supportedDoneness: ['rare', 'medium-rare', 'medium'],
        },
        swordfish: {
          name: 'Swordfish',
          baseTime: 5,
          minThickness: 0.75,
          maxThickness: 1.5,
          supportedDoneness: ['medium', 'medium-well'],
        },
        shrimp: {
          name: 'Shrimp',
          baseTime: 2,
          minThickness: 0.5,
          maxThickness: 1,
          supportedDoneness: ['well-done'],
        },
      },
    },
  };

  const temperatures: Record<MeatType, Record<Doneness, TemperatureTarget>> = {
    beef: {
      'rare': { fahrenheit: 125, celsius: 52, description: 'Cool red center' },
      'medium-rare': { fahrenheit: 135, celsius: 57, description: 'Warm red center' },
      'medium': { fahrenheit: 145, celsius: 63, description: 'Warm pink center' },
      'medium-well': { fahrenheit: 150, celsius: 66, description: 'Slightly pink' },
      'well-done': { fahrenheit: 160, celsius: 71, description: 'No pink' },
    },
    chicken: {
      'rare': { fahrenheit: 165, celsius: 74, description: 'Not safe' },
      'medium-rare': { fahrenheit: 165, celsius: 74, description: 'Not safe' },
      'medium': { fahrenheit: 165, celsius: 74, description: 'Not safe' },
      'medium-well': { fahrenheit: 165, celsius: 74, description: 'Almost there' },
      'well-done': { fahrenheit: 165, celsius: 74, description: 'Safe & juicy' },
    },
    pork: {
      'rare': { fahrenheit: 145, celsius: 63, description: 'Not recommended' },
      'medium-rare': { fahrenheit: 145, celsius: 63, description: 'Not recommended' },
      'medium': { fahrenheit: 145, celsius: 63, description: 'Safe minimum' },
      'medium-well': { fahrenheit: 150, celsius: 66, description: 'Slightly pink' },
      'well-done': { fahrenheit: 160, celsius: 71, description: 'No pink' },
    },
    fish: {
      'rare': { fahrenheit: 110, celsius: 43, description: 'Sushi-grade only' },
      'medium-rare': { fahrenheit: 125, celsius: 52, description: 'Translucent center' },
      'medium': { fahrenheit: 135, celsius: 57, description: 'Opaque throughout' },
      'medium-well': { fahrenheit: 140, celsius: 60, description: 'Flaky' },
      'well-done': { fahrenheit: 145, celsius: 63, description: 'Fully cooked' },
    },
  };

  const donenessModifiers: Record<Doneness, number> = {
    'rare': 0.7,
    'medium-rare': 0.85,
    'medium': 1,
    'medium-well': 1.15,
    'well-done': 1.3,
  };

  const donenessLabels: Record<Doneness, string> = {
    'rare': 'Rare',
    'medium-rare': 'Medium-Rare',
    'medium': 'Medium',
    'medium-well': 'Medium-Well',
    'well-done': 'Well-Done',
  };

  const currentMeat = meats[meatType];
  const currentCut = currentMeat.cuts[selectedCut];
  const currentTemp = temperatures[meatType][doneness];

  // Update cut when meat type changes
  useEffect(() => {
    const defaultCut = meats[meatType].defaultCut;
    setSelectedCut(defaultCut);
    const cut = meats[meatType].cuts[defaultCut];
    if (!cut.supportedDoneness.includes(doneness)) {
      setDoneness(cut.supportedDoneness[Math.floor(cut.supportedDoneness.length / 2)]);
    }
  }, [meatType]);

  // Update doneness when cut changes
  useEffect(() => {
    const cut = currentMeat.cuts[selectedCut];
    if (cut && !cut.supportedDoneness.includes(doneness)) {
      setDoneness(cut.supportedDoneness[Math.floor(cut.supportedDoneness.length / 2)]);
    }
  }, [selectedCut, currentMeat.cuts, doneness]);

  const calculations = useMemo(() => {
    const thicknessVal = parseFloat(thickness) || 1;
    const baseTime = currentCut.baseTime;
    const modifier = donenessModifiers[doneness];

    // Calculate total time per side based on thickness and doneness
    const totalMinutes = Math.round(baseTime * thicknessVal * modifier);
    const timePerSide = Math.round(totalMinutes / 2);

    return {
      totalMinutes,
      timePerSide,
      restTime: Math.max(3, Math.round(totalMinutes * 0.3)),
    };
  }, [thickness, doneness, currentCut]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setFlipReminder(true);
            // Play notification sound if available
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Grill Timer', {
                body: currentSide === 1 ? 'Time to flip!' : 'Done! Let it rest.',
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, currentSide]);

  const startTimer = useCallback(() => {
    setTimeRemaining(calculations.timePerSide * 60);
    setIsTimerRunning(true);
    setFlipReminder(false);
  }, [calculations.timePerSide]);

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(0);
    setCurrentSide(1);
    setFlipReminder(false);
  };

  const handleFlip = () => {
    setCurrentSide(2);
    setFlipReminder(false);
    startTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.grillingTimer.grillingTimer', 'Grilling Timer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.grillingTimer.perfectGrillTimesWithFlip', 'Perfect grill times with flip reminders')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Meat Type Selection */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(meats) as MeatType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMeatType(m)}
              className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${meatType === m ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <span className="text-xl">{meats[m].icon}</span>
              <span>{meats[m].name}</span>
            </button>
          ))}
        </div>

        {/* Cut Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.grillingTimer.selectCut', 'Select Cut')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(currentMeat.cuts).map((cut) => (
              <button
                key={cut}
                onClick={() => setSelectedCut(cut)}
                className={`py-2 px-3 rounded-lg text-sm ${selectedCut === cut ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {currentMeat.cuts[cut].name}
              </button>
            ))}
          </div>
        </div>

        {/* Thickness Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.grillingTimer.thicknessInches', 'Thickness (inches)')}
          </label>
          <div className="flex gap-2">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((t) => (
              <button
                key={t}
                onClick={() => setThickness(t.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseFloat(thickness) === t ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t}"
              </button>
            ))}
          </div>
          <input
            type="number"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            min={currentCut.minThickness}
            max={currentCut.maxThickness}
            step="0.25"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Doneness Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.grillingTimer.donenessLevel', 'Doneness Level')}
          </label>
          <div className="flex flex-wrap gap-2">
            {currentCut.supportedDoneness.map((d) => (
              <button
                key={d}
                onClick={() => setDoneness(d)}
                className={`py-2 px-4 rounded-lg text-sm ${doneness === d ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {donenessLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Target */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-orange-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.grillingTimer.targetTemperature', 'Target Temperature')}</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-500">{currentTemp.fahrenheit}°F</span>
            <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/ {currentTemp.celsius}°C</span>
          </div>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentTemp.description}
          </p>
        </div>

        {/* Timing Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.grillingTimer.perSide', 'Per Side')}</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{calculations.timePerSide} min</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.grillingTimer.totalGrill', 'Total Grill')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.totalMinutes} min</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.grillingTimer.restTime', 'Rest Time')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.restTime} min</div>
          </div>
        </div>

        {/* Timer Display */}
        <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {timeRemaining > 0 || isTimerRunning ? (
            <>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Side {currentSide} of 2
              </div>
              <div className="text-5xl font-bold text-orange-500 mb-4 font-mono">
                {formatTime(timeRemaining)}
              </div>
              <div className="flex justify-center gap-3">
                {isTimerRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    {t('tools.grillingTimer.pause', 'Pause')}
                  </button>
                ) : (
                  <button
                    onClick={resumeTimer}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {t('tools.grillingTimer.resume', 'Resume')}
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  <RotateCcw className="w-5 h-5" />
                  {t('tools.grillingTimer.reset', 'Reset')}
                </button>
              </div>
            </>
          ) : flipReminder && currentSide === 1 ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bell className="w-6 h-6 text-orange-500 animate-bounce" />
                <span className="text-2xl font-bold text-orange-500">{t('tools.grillingTimer.timeToFlip', 'Time to Flip!')}</span>
              </div>
              <button
                onClick={handleFlip}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                {t('tools.grillingTimer.flipStartSide2', 'Flip & Start Side 2')}
              </button>
            </>
          ) : flipReminder && currentSide === 2 ? (
            <>
              <div className="text-2xl font-bold text-green-500 mb-2">{t('tools.grillingTimer.done', 'Done!')}</div>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Let it rest for {calculations.restTime} minutes before serving
              </p>
              <button
                onClick={resetTimer}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 mx-auto ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                <RotateCcw className="w-5 h-5" />
                {t('tools.grillingTimer.startNewTimer', 'Start New Timer')}
              </button>
            </>
          ) : (
            <>
              <div className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Ready to grill your {currentCut.name}?
              </div>
              <button
                onClick={startTimer}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                {t('tools.grillingTimer.startTimer', 'Start Timer')}
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.grillingTimer.grillingTips', 'Grilling Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.grillingTimer.letMeatReachRoomTemperature', 'Let meat reach room temperature before grilling')}</li>
                <li>{t('tools.grillingTimer.preheatGrillToHigh450', 'Preheat grill to high (450-500 F) for steaks')}</li>
                <li>{t('tools.grillingTimer.useAMeatThermometerFor', 'Use a meat thermometer for accuracy')}</li>
                <li>{t('tools.grillingTimer.alwaysLetMeatRestAfter', 'Always let meat rest after cooking')}</li>
                <li>{t('tools.grillingTimer.flipOnlyOnceForBest', 'Flip only once for best grill marks')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrillingTimerTool;
