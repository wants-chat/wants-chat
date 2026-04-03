import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Egg, Timer, Play, Pause, RotateCcw, Plus, Trash2, Volume2, VolumeX, Sparkles, Mountain, Info, Snowflake } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EggTimerToolProps {
  uiConfig?: UIConfig;
}

// Types
type EggSize = 'medium' | 'large' | 'extra-large';
type StartingTemp = 'room' | 'fridge';
type Doneness = 'soft' | 'medium' | 'hard';

interface EggTimer {
  id: string;
  size: EggSize;
  startingTemp: StartingTemp;
  doneness: Doneness;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

// Cooking time matrix (in seconds) - base times for large eggs at sea level from room temp
const BASE_COOKING_TIMES: Record<Doneness, number> = {
  soft: 360,    // 6 minutes - runny yolk
  medium: 480,  // 8 minutes - jammy yolk
  hard: 720,    // 12 minutes - fully set
};

// Size adjustments (in seconds)
const SIZE_ADJUSTMENTS: Record<EggSize, number> = {
  'medium': -30,
  'large': 0,
  'extra-large': 45,
};

// Temperature adjustments (in seconds) - cold eggs need more time
const TEMP_ADJUSTMENTS: Record<StartingTemp, number> = {
  'room': 0,
  'fridge': 60,
};

// Altitude adjustment per 1000 feet (adds seconds)
const ALTITUDE_ADJUSTMENT_PER_1000FT = 30;

// Doneness descriptions and colors
const DONENESS_INFO: Record<Doneness, { label: string; description: string; color: string; yolkColor: string }> = {
  soft: {
    label: 'Soft Boiled',
    description: 'Runny, liquid yolk - perfect for dipping toast soldiers',
    color: '#f59e0b',
    yolkColor: '#fbbf24',
  },
  medium: {
    label: 'Medium Boiled',
    description: 'Jammy, creamy yolk - ideal for ramen or salads',
    color: '#f97316',
    yolkColor: '#fb923c',
  },
  hard: {
    label: 'Hard Boiled',
    description: 'Fully set yolk - great for egg salad or deviled eggs',
    color: '#eab308',
    yolkColor: '#fde047',
  },
};

// Export columns definition
const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'size', label: 'Size' },
  { key: 'startingTemp', label: 'Starting Temperature' },
  { key: 'doneness', label: 'Doneness' },
  { key: 'totalSeconds', label: 'Total Time (seconds)' },
  { key: 'remainingSeconds', label: 'Remaining Time (seconds)' },
  { key: 'isRunning', label: 'Is Running' },
  { key: 'isComplete', label: 'Is Complete' },
];

export const EggTimerTool = ({ uiConfig }: EggTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [eggs, setEggs] = useState<EggTimer[]>([]);
  const [altitudeEnabled, setAltitudeEnabled] = useState(false);
  const [altitude, setAltitude] = useState(0); // in feet
  const [showIceBathReminder, setShowIceBathReminder] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.altitude) setAltitude(Number(data.altitude));
      if (data.altitudeEnabled !== undefined) setAltitudeEnabled(Boolean(data.altitudeEnabled));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate cooking time based on all factors
  const calculateCookingTime = useCallback((size: EggSize, temp: StartingTemp, doneness: Doneness): number => {
    let time = BASE_COOKING_TIMES[doneness];
    time += SIZE_ADJUSTMENTS[size];
    time += TEMP_ADJUSTMENTS[temp];

    if (altitudeEnabled && altitude > 0) {
      time += Math.floor(altitude / 1000) * ALTITUDE_ADJUSTMENT_PER_1000FT;
    }

    return Math.max(time, 60); // Minimum 1 minute
  }, [altitudeEnabled, altitude]);

  // Timer tick effect
  useEffect(() => {
    const hasRunningEggs = eggs.some(egg => egg.isRunning && egg.remainingSeconds > 0);

    if (hasRunningEggs) {
      intervalRef.current = window.setInterval(() => {
        setEggs(prevEggs => {
          const updatedEggs = prevEggs.map(egg => {
            if (!egg.isRunning || egg.remainingSeconds <= 0) return egg;

            const newRemaining = egg.remainingSeconds - 1;

            if (newRemaining <= 0) {
              playCompletionSound();
              setShowIceBathReminder(true);
              return {
                ...egg,
                remainingSeconds: 0,
                isRunning: false,
                isComplete: true,
              };
            }

            return {
              ...egg,
              remainingSeconds: newRemaining,
            };
          });

          return updatedEggs;
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
  }, [eggs]);

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Eggs are ready!', {
        body: 'Transfer your eggs to an ice bath immediately to stop cooking!',
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const formatTime = (totalSec: number): string => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addEgg = () => {
    const newEgg: EggTimer = {
      id: crypto.randomUUID(),
      size: 'large',
      startingTemp: 'fridge',
      doneness: 'medium',
      totalSeconds: calculateCookingTime('large', 'fridge', 'medium'),
      remainingSeconds: calculateCookingTime('large', 'fridge', 'medium'),
      isRunning: false,
      isComplete: false,
    };
    setEggs(prev => [...prev, newEgg]);
  };

  const removeEgg = (id: string) => {
    setEggs(prev => prev.filter(egg => egg.id !== id));
  };

  const updateEgg = (id: string, updates: Partial<Pick<EggTimer, 'size' | 'startingTemp' | 'doneness'>>) => {
    setEggs(prev => prev.map(egg => {
      if (egg.id !== id || egg.isRunning) return egg;

      const updatedEgg = { ...egg, ...updates };
      const newTime = calculateCookingTime(updatedEgg.size, updatedEgg.startingTemp, updatedEgg.doneness);

      return {
        ...updatedEgg,
        totalSeconds: newTime,
        remainingSeconds: newTime,
        isComplete: false,
      };
    }));
  };

  const toggleEggTimer = (id: string) => {
    setEggs(prev => prev.map(egg => {
      if (egg.id !== id) return egg;
      return { ...egg, isRunning: !egg.isRunning };
    }));
  };

  const resetEgg = (id: string) => {
    setEggs(prev => prev.map(egg => {
      if (egg.id !== id) return egg;
      return {
        ...egg,
        remainingSeconds: egg.totalSeconds,
        isRunning: false,
        isComplete: false,
      };
    }));
    setShowIceBathReminder(false);
  };

  const startAllEggs = () => {
    setEggs(prev => prev.map(egg => ({
      ...egg,
      isRunning: !egg.isComplete && egg.remainingSeconds > 0,
    })));
  };

  const pauseAllEggs = () => {
    setEggs(prev => prev.map(egg => ({
      ...egg,
      isRunning: false,
    })));
  };

  const resetAllEggs = () => {
    setEggs(prev => prev.map(egg => ({
      ...egg,
      remainingSeconds: egg.totalSeconds,
      isRunning: false,
      isComplete: false,
    })));
    setShowIceBathReminder(false);
  };

  const getProgress = (egg: EggTimer): number => {
    if (egg.totalSeconds === 0) return 0;
    return ((egg.totalSeconds - egg.remainingSeconds) / egg.totalSeconds) * 100;
  };

  // Export handlers
  const exportToCSV = () => {
    if (eggs.length === 0) {
      setValidationMessage('No eggs to export');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = eggs.map(egg =>
      COLUMNS.map(col => {
        const value = egg[col.key as keyof EggTimer];
        if (typeof value === 'string') return `"${value}"`;
        return value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `egg-timer-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (eggs.length === 0) {
      setValidationMessage('No eggs to export');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const data = {
      exportDate: new Date().toISOString(),
      altitude: altitude,
      altitudeEnabled: altitudeEnabled,
      eggs: eggs,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `egg-timer-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (): Promise<boolean> => {
    if (eggs.length === 0) {
      setValidationMessage('No eggs to copy');
      setTimeout(() => setValidationMessage(null), 3000);
      return false;
    }

    const text = eggs.map((egg, idx) =>
      `Egg ${idx + 1}: ${egg.size} (${egg.startingTemp}) - ${egg.doneness} - ${formatTime(egg.remainingSeconds)}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  // Egg yolk visualization component
  const EggYolkVisualization = ({ doneness, isComplete }: { doneness: Doneness; isComplete: boolean }) => {
    const info = DONENESS_INFO[doneness];

    return (
      <div className="relative w-16 h-20 mx-auto">
        {/* Egg white (outer) */}
        <div
          className={`absolute inset-0 rounded-[50%] bg-gradient-to-b from-white to-gray-100 shadow-inner ${isComplete ? 'animate-pulse' : ''}`}
          style={{
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
        />
        {/* Egg yolk (inner) */}
        <div
          className="absolute left-1/2 top-1/2 w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${info.yolkColor}, ${info.color})`,
            boxShadow: doneness === 'soft' ? t('tools.eggTimer.inset008pxRgba', 'inset 0 0 8px rgba(0,0,0,0.2)') : 'none',
          }}
        />
        {/* Runny yolk effect for soft boiled */}
        {doneness === 'soft' && (
          <div
            className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-60"
            style={{
              background: 'radial-gradient(circle, #fcd34d, transparent)',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 rounded-lg">
            <Egg className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.eggTimer.eggTimer', 'Egg Timer')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.eggTimer.timeYourEggsToPerfect', 'Time your eggs to perfect doneness')}
            </p>
          </div>
        </div>
        <ExportDropdown
          onExportCSV={exportToCSV}
          onExportJSON={exportToJSON}
          onCopyToClipboard={copyToClipboard}
          showImport={false}
          theme={theme}
        />
      </div>

      <div className="space-y-6">
        {/* Altitude Settings */}
        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                <CardTitle className={`text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.eggTimer.altitudeAdjustment', 'Altitude Adjustment')}
                </CardTitle>
              </div>
              <Switch
                checked={altitudeEnabled}
                onCheckedChange={setAltitudeEnabled}
              />
            </div>
          </CardHeader>
          {altitudeEnabled && (
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {altitude.toLocaleString()} feet
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    +{Math.floor(altitude / 1000) * 30}s per egg
                  </span>
                </div>
                <Slider
                  value={[altitude]}
                  onValueChange={(value) => setAltitude(value[0])}
                  min={0}
                  max={14000}
                  step={500}
                  className="w-full"
                />
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.eggTimer.waterBoilsAtLowerTemperatures', 'Water boils at lower temperatures at high altitude, so eggs take longer to cook')}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Doneness Guide */}
        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              <CardTitle className={`text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.eggTimer.donenessGuide', 'Doneness Guide')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(DONENESS_INFO) as Doneness[]).map((d) => (
                <div key={d} className="text-center">
                  <EggYolkVisualization doneness={d} isComplete={false} />
                  <h4 className={`mt-2 font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {DONENESS_INFO[d].label}
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {DONENESS_INFO[d].description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ice Bath Reminder */}
        {showIceBathReminder && (
          <Card className="bg-cyan-500/20 border-cyan-400/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Snowflake className="w-8 h-8 text-cyan-400 animate-pulse" />
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.eggTimer.iceBathTime', 'Ice Bath Time!')}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.eggTimer.transferEggsToIceWater', 'Transfer eggs to ice water immediately to stop cooking and make peeling easier')}
                  </p>
                </div>
                <button
                  onClick={() => setShowIceBathReminder(false)}
                  className="ml-auto px-3 py-1 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
                >
                  {t('tools.eggTimer.gotIt', 'Got it')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eggs List */}
        <div className="space-y-4">
          {eggs.map((egg, index) => (
            <Card
              key={egg.id}
              className={`relative overflow-hidden ${
                egg.isComplete
                  ? 'bg-green-500/20 border-green-400/50'
                  : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Progress bar */}
              {egg.isRunning && (
                <div
                  className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-1000"
                  style={{ width: `${getProgress(egg)}%` }}
                />
              )}

              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Egg visualization */}
                  <div className="flex-shrink-0">
                    <EggYolkVisualization doneness={egg.doneness} isComplete={egg.isComplete} />
                    <p className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Egg #{index + 1}
                    </p>
                  </div>

                  {/* Settings */}
                  <div className="flex-grow grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.eggTimer.size', 'Size')}
                      </label>
                      <Select
                        value={egg.size}
                        onValueChange={(value) => updateEgg(egg.id, { size: value as EggSize })}
                      >
                        <SelectTrigger className={`h-9 ${egg.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medium">{t('tools.eggTimer.medium', 'Medium')}</SelectItem>
                          <SelectItem value="large">{t('tools.eggTimer.large', 'Large')}</SelectItem>
                          <SelectItem value="extra-large">{t('tools.eggTimer.extraLarge', 'Extra Large')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.eggTimer.startingTemp', 'Starting Temp')}
                      </label>
                      <Select
                        value={egg.startingTemp}
                        onValueChange={(value) => updateEgg(egg.id, { startingTemp: value as StartingTemp })}
                      >
                        <SelectTrigger className={`h-9 ${egg.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="room">{t('tools.eggTimer.roomTemp', 'Room Temp')}</SelectItem>
                          <SelectItem value="fridge">{t('tools.eggTimer.fridgeCold', 'Fridge Cold')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.eggTimer.doneness', 'Doneness')}
                      </label>
                      <Select
                        value={egg.doneness}
                        onValueChange={(value) => updateEgg(egg.id, { doneness: value as Doneness })}
                      >
                        <SelectTrigger className={`h-9 ${egg.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soft">{t('tools.eggTimer.softRunny', 'Soft (Runny)')}</SelectItem>
                          <SelectItem value="medium">{t('tools.eggTimer.mediumJammy', 'Medium (Jammy)')}</SelectItem>
                          <SelectItem value="hard">{t('tools.eggTimer.hardSet', 'Hard (Set)')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Timer Display */}
                  <div className="flex-shrink-0 text-center min-w-[100px]">
                    <div className={`text-3xl font-mono font-bold ${
                      egg.isComplete
                        ? 'text-green-500'
                        : theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                    }`}>
                      {formatTime(egg.remainingSeconds)}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {egg.isComplete ? 'Done!' : `of ${formatTime(egg.totalSeconds)}`}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!egg.isComplete && (
                      <button
                        onClick={() => toggleEggTimer(egg.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          egg.isRunning
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {egg.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                    )}
                    <button
                      onClick={() => resetEgg(egg.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeEgg(egg.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Egg Button */}
          <button
            onClick={addEgg}
            className={`w-full py-4 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            {t('tools.eggTimer.addEgg', 'Add Egg')}
          </button>
        </div>

        {/* Bulk Controls */}
        {eggs.length > 1 && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={startAllEggs}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
            >
              <Play className="w-4 h-4" />
              {t('tools.eggTimer.startAll', 'Start All')}
            </button>
            <button
              onClick={pauseAllEggs}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Pause className="w-4 h-4" />
              {t('tools.eggTimer.pauseAll', 'Pause All')}
            </button>
            <button
              onClick={resetAllEggs}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {t('tools.eggTimer.resetAll', 'Reset All')}
            </button>
          </div>
        )}

        {/* Tips Section */}
        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Volume2 className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.eggTimer.tipsForPerfectEggs', 'Tips for Perfect Eggs')}
                </h3>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>{t('tools.eggTimer.startWithEggsInAlready', 'Start with eggs in already boiling water for consistent results')}</li>
                  <li>{t('tools.eggTimer.addATablespoonOfVinegar', 'Add a tablespoon of vinegar to help with peeling')}</li>
                  <li>{t('tools.eggTimer.transferToIceBathImmediately', 'Transfer to ice bath immediately when timer ends')}</li>
                  <li>{t('tools.eggTimer.letEggsSitInIce', 'Let eggs sit in ice bath for at least 5 minutes before peeling')}</li>
                  <li>{t('tools.eggTimer.olderEggs12Weeks', 'Older eggs (1-2 weeks) are easier to peel than fresh eggs')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default EggTimerTool;
