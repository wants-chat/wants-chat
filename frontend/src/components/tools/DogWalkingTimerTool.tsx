import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dog, Timer, MapPin, Target, History, CloudSun, Droplets, Play, Pause, RotateCcw, Plus, Check, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface DogWalkingTimerToolProps {
  uiConfig?: UIConfig;
}

interface WalkRecord {
  id: string;
  date: string;
  duration: number; // seconds
  distance: number; // km
  pace: number; // min/km
}

interface WeatherTip {
  condition: string;
  icon: React.ReactNode;
  tips: string[];
}

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'duration', label: 'Duration (minutes)' },
  { key: 'distance', label: 'Distance (km)' },
  { key: 'pace', label: 'Pace (min/km)' },
];

export const DogWalkingTimerTool: React.FC<DogWalkingTimerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const [walkStartTime, setWalkStartTime] = useState<Date | null>(null);

  // Settings
  const [dailyGoal, setDailyGoal] = useState(30); // minutes
  const [averageSpeed, setAverageSpeed] = useState(4.5); // km/h (average dog walking speed)
  const [selectedWeather, setSelectedWeather] = useState<'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold'>('sunny');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.dailyGoal) setDailyGoal(Number(prefillData.dailyGoal));
      if (prefillData.averageSpeed) setAverageSpeed(Number(prefillData.averageSpeed));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Walk history
  const [walkHistory, setWalkHistory] = useState<WalkRecord[]>([
    { id: '1', date: '2024-01-15', duration: 1800, distance: 2.25, pace: 13.3 },
    { id: '2', date: '2024-01-14', duration: 2400, distance: 3.0, pace: 13.3 },
    { id: '3', date: '2024-01-13', duration: 1500, distance: 1.88, pace: 13.3 },
  ]);

  // Hydration reminder
  const [lastHydrationReminder, setLastHydrationReminder] = useState(0);
  const [showHydrationReminder, setShowHydrationReminder] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Hydration reminder effect (every 15 minutes)
  useEffect(() => {
    if (isRunning && elapsedTime > 0 && elapsedTime % 900 === 0 && elapsedTime !== lastHydrationReminder) {
      setShowHydrationReminder(true);
      setLastHydrationReminder(elapsedTime);
      setTimeout(() => setShowHydrationReminder(false), 5000);
    }
  }, [elapsedTime, isRunning, lastHydrationReminder]);

  // Calculations
  const calculations = useMemo(() => {
    const hours = elapsedTime / 3600;
    const distance = hours * averageSpeed;
    const pace = distance > 0 ? elapsedTime / 60 / distance : 0;

    // Today's total (including current walk if running)
    const today = new Date().toISOString().split('T')[0];
    const todayWalks = walkHistory.filter((w) => w.date === today);
    const todayMinutes = todayWalks.reduce((acc, w) => acc + w.duration / 60, 0) + elapsedTime / 60;
    const goalProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);

    // Weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekWalks = walkHistory.filter((w) => new Date(w.date) >= weekAgo);
    const weeklyDistance = weekWalks.reduce((acc, w) => acc + w.distance, 0);
    const weeklyDuration = weekWalks.reduce((acc, w) => acc + w.duration, 0);

    return {
      currentDistance: distance.toFixed(2),
      currentPace: pace > 0 ? pace.toFixed(1) : '0.0',
      todayMinutes: todayMinutes.toFixed(0),
      goalProgress: goalProgress.toFixed(0),
      weeklyDistance: weeklyDistance.toFixed(1),
      weeklyDuration: Math.round(weeklyDuration / 60),
      averageWalkTime: weekWalks.length > 0 ? Math.round(weeklyDuration / 60 / weekWalks.length) : 0,
    };
  }, [elapsedTime, averageSpeed, walkHistory, dailyGoal]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (!isRunning) {
      setWalkStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setWalkStartTime(null);
    setLastHydrationReminder(0);
  };

  const handleSaveWalk = () => {
    if (elapsedTime < 60) return; // Minimum 1 minute walk

    const hours = elapsedTime / 3600;
    const distance = hours * averageSpeed;
    const pace = distance > 0 ? elapsedTime / 60 / distance : 0;

    const newWalk: WalkRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      duration: elapsedTime,
      distance: parseFloat(distance.toFixed(2)),
      pace: parseFloat(pace.toFixed(1)),
    };

    setWalkHistory([newWalk, ...walkHistory]);
    handleReset();
  };

  const handleExportCSV = () => {
    const csvContent = [
      COLUMNS.map((col) => col.label).join(','),
      ...walkHistory.map((walk) =>
        COLUMNS.map((col) => {
          if (col.key === 'duration') {
            return Math.round(walk.duration / 60);
          }
          return walk[col.key as keyof WalkRecord];
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dog-walks.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonData = walkHistory.map((walk) => ({
      date: walk.date,
      durationMinutes: Math.round(walk.duration / 60),
      distanceKm: walk.distance,
      paceMinKm: walk.pace,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dog-walks.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const weatherTips: Record<string, WeatherTip> = {
    sunny: {
      condition: 'Sunny',
      icon: <CloudSun className="w-4 h-4 text-yellow-500" />,
      tips: [
        'Walk during cooler parts of the day (early morning or evening)',
        'Stick to shaded routes when possible',
        'Check pavement temperature with your hand',
        'Bring water for both you and your dog',
      ],
    },
    cloudy: {
      condition: 'Cloudy',
      icon: <CloudSun className="w-4 h-4 text-gray-500" />,
      tips: [
        'Great walking conditions!',
        'Perfect for longer walks',
        'Keep an eye on weather changes',
        'Still bring water for longer walks',
      ],
    },
    rainy: {
      condition: 'Rainy',
      icon: <Droplets className="w-4 h-4 text-blue-500" />,
      tips: [
        'Use a waterproof coat for your dog if needed',
        'Dry your dog thoroughly after the walk',
        'Watch for slippery surfaces',
        'Shorter, more frequent walks may be better',
      ],
    },
    hot: {
      condition: 'Hot Weather',
      icon: <CloudSun className="w-4 h-4 text-orange-500" />,
      tips: [
        'Avoid walking on hot pavement (can burn paws)',
        'Walk only in early morning or late evening',
        'Watch for signs of overheating (excessive panting)',
        'Bring plenty of water and take frequent breaks',
      ],
    },
    cold: {
      condition: 'Cold Weather',
      icon: <CloudSun className="w-4 h-4 text-blue-400" />,
      tips: [
        'Consider a dog jacket for short-haired breeds',
        'Protect paws from ice and salt',
        'Keep walks shorter in extreme cold',
        'Watch for signs of hypothermia',
      ],
    },
  };

  const currentWeatherTip = weatherTips[selectedWeather];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Dog className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dogWalkingTimer.dogWalkingTimer', 'Dog Walking Timer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dogWalkingTimer.trackWalksDistanceAndDaily', 'Track walks, distance, and daily goals')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Hydration Reminder Alert */}
        {showHydrationReminder && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border flex items-center gap-3`}>
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t('tools.dogWalkingTimer.hydrationReminder', 'Hydration Reminder!')}</p>
              <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.dogWalkingTimer.timeToOfferWaterTo', 'Time to offer water to your dog and take a drink yourself.')}</p>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-6xl font-mono font-bold ${isRunning ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(elapsedTime)}
          </div>
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {walkStartTime ? `Started at ${walkStartTime.toLocaleTimeString()}` : 'Ready to start'}
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleStartStop}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? t('tools.dogWalkingTimer.pause', 'Pause') : t('tools.dogWalkingTimer.startWalk', 'Start Walk')}
            </button>
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            {elapsedTime >= 60 && (
              <button
                onClick={handleSaveWalk}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Check className="w-5 h-5" />
                {t('tools.dogWalkingTimer.save', 'Save')}
              </button>
            )}
          </div>
        </div>

        {/* Current Walk Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dogWalkingTimer.distance', 'Distance')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.currentDistance} km</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {(parseFloat(calculations.currentDistance) * 0.621371).toFixed(2)} miles
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dogWalkingTimer.pace', 'Pace')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.currentPace}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dogWalkingTimer.minKm', 'min/km')}</div>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dogWalkingTimer.dailyGoal', 'Daily Goal')}</span>
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.todayMinutes} / {dailyGoal} min
            </span>
          </div>
          <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${calculations.goalProgress}%` }}
            />
          </div>
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {parseFloat(calculations.goalProgress) >= 100 ? 'Goal achieved! Great job!' : `${(dailyGoal - parseFloat(calculations.todayMinutes)).toFixed(0)} minutes to go`}
          </div>
        </div>

        {/* Goal Setting */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.dogWalkingTimer.dailyWalkGoalMinutes', 'Daily Walk Goal (minutes)')}
          </label>
          <div className="flex gap-2">
            {[15, 30, 45, 60, 90].map((n) => (
              <button
                key={n}
                onClick={() => setDailyGoal(n)}
                className={`flex-1 py-2 rounded-lg ${dailyGoal === n ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Walking Speed Setting */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.dogWalkingTimer.averageWalkingSpeedKmH', 'Average Walking Speed (km/h)')}
          </label>
          <input
            type="range"
            min="2"
            max="7"
            step="0.5"
            value={averageSpeed}
            onChange={(e) => setAverageSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{t('tools.dogWalkingTimer.slow2KmH', 'Slow (2 km/h)')}</span>
            <span className="font-medium text-green-500">{averageSpeed} km/h</span>
            <span>{t('tools.dogWalkingTimer.fast7KmH', 'Fast (7 km/h)')}</span>
          </div>
        </div>

        {/* Weather Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.dogWalkingTimer.currentWeather', 'Current Weather')}
          </label>
          <div className="flex gap-2">
            {(['sunny', 'cloudy', 'rainy', 'hot', 'cold'] as const).map((weather) => (
              <button
                key={weather}
                onClick={() => setSelectedWeather(weather)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize ${selectedWeather === weather ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {weather}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            {currentWeatherTip.icon}
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentWeatherTip.condition} Tips</span>
          </div>
          <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentWeatherTip.tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>

        {/* Weekly Stats */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dogWalkingTimer.weeklySummary', 'Weekly Summary')}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.weeklyDistance}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dogWalkingTimer.kmWalked', 'km walked')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.weeklyDuration}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dogWalkingTimer.totalMin', 'total min')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.averageWalkTime}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dogWalkingTimer.avgMinWalk', 'avg min/walk')}</div>
            </div>
          </div>
        </div>

        {/* Walk History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.dogWalkingTimer.recentWalks', 'Recent Walks')}
            </label>
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
              className="text-xs"
            />
          </div>
          <div className={`max-h-48 overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {walkHistory.length === 0 ? (
              <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.dogWalkingTimer.noWalksRecordedYetStart', 'No walks recorded yet. Start your first walk!')}
              </div>
            ) : (
              walkHistory.slice(0, 5).map((walk) => (
                <div
                  key={walk.id}
                  className={`flex items-center justify-between p-3 border-b last:border-b-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(walk.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {Math.round(walk.duration / 60)} min • {walk.distance} km
                    </div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {walk.pace} min/km
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.dogWalkingTimer.dogWalkingTips', 'Dog Walking Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Most dogs need 30-60 minutes of exercise daily</li>
                <li>• Let your dog sniff - it is mental exercise for them</li>
                <li>• Bring waste bags and clean up after your dog</li>
                <li>• Watch for signs of fatigue, especially in hot weather</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogWalkingTimerTool;
