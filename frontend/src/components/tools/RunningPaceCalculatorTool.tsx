import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, MapPin, TrendingUp, Zap, Target, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RunningPaceCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'pace' | 'time' | 'distance';
type Unit = 'miles' | 'km';

export const RunningPaceCalculatorTool: React.FC<RunningPaceCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('pace');
  const [unit, setUnit] = useState<Unit>('miles');

  // Pace inputs (min:sec per mile/km)
  const [paceMin, setPaceMin] = useState('8');
  const [paceSec, setPaceSec] = useState('30');

  // Time inputs (hh:mm:ss)
  const [timeHours, setTimeHours] = useState('0');
  const [timeMinutes, setTimeMinutes] = useState('42');
  const [timeSeconds, setTimeSeconds] = useState('0');

  // Distance input
  const [distance, setDistance] = useState('5');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setDistance(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.mode) setMode(params.formData.mode as CalculationMode);
        if (params.formData.unit) setUnit(params.formData.unit as Unit);
        if (params.formData.distance) setDistance(params.formData.distance.toString());
        if (params.formData.paceMin) setPaceMin(params.formData.paceMin.toString());
        if (params.formData.paceSec) setPaceSec(params.formData.paceSec.toString());
        if (params.formData.timeHours) setTimeHours(params.formData.timeHours.toString());
        if (params.formData.timeMinutes) setTimeMinutes(params.formData.timeMinutes.toString());
        if (params.formData.timeSeconds) setTimeSeconds(params.formData.timeSeconds.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const raceDistances = [
    { name: '1 Mile', miles: 1, km: 1.60934 },
    { name: '5K', miles: 3.10686, km: 5 },
    { name: '10K', miles: 6.21371, km: 10 },
    { name: 'Half Marathon', miles: 13.1094, km: 21.0975 },
    { name: 'Marathon', miles: 26.2188, km: 42.195 },
    { name: '50K', miles: 31.0686, km: 50 },
  ];

  const calculations = useMemo(() => {
    const paceInSeconds = (parseInt(paceMin) || 0) * 60 + (parseInt(paceSec) || 0);
    const totalTimeInSeconds = (parseInt(timeHours) || 0) * 3600 + (parseInt(timeMinutes) || 0) * 60 + (parseInt(timeSeconds) || 0);
    const dist = parseFloat(distance) || 0;

    let calculatedPace: number; // seconds per unit
    let calculatedTime: number; // total seconds
    let calculatedDistance: number; // in selected unit

    switch (mode) {
      case 'pace':
        // Calculate pace from time and distance
        calculatedDistance = dist;
        calculatedTime = totalTimeInSeconds;
        calculatedPace = dist > 0 ? totalTimeInSeconds / dist : 0;
        break;
      case 'time':
        // Calculate time from pace and distance
        calculatedPace = paceInSeconds;
        calculatedDistance = dist;
        calculatedTime = paceInSeconds * dist;
        break;
      case 'distance':
        // Calculate distance from pace and time
        calculatedPace = paceInSeconds;
        calculatedTime = totalTimeInSeconds;
        calculatedDistance = paceInSeconds > 0 ? totalTimeInSeconds / paceInSeconds : 0;
        break;
    }

    // Calculate speed
    const hoursForSpeed = calculatedTime / 3600;
    const speed = hoursForSpeed > 0 ? calculatedDistance / hoursForSpeed : 0;

    // Format pace
    const paceMinutes = Math.floor(calculatedPace / 60);
    const paceSecondsRem = Math.round(calculatedPace % 60);

    // Format time
    const hours = Math.floor(calculatedTime / 3600);
    const minutes = Math.floor((calculatedTime % 3600) / 60);
    const seconds = Math.round(calculatedTime % 60);

    // Convert to other unit
    const conversionFactor = unit === 'miles' ? 1.60934 : 1 / 1.60934;
    const otherUnitPace = calculatedPace * conversionFactor;
    const otherPaceMin = Math.floor(otherUnitPace / 60);
    const otherPaceSec = Math.round(otherUnitPace % 60);

    // Race predictions
    const predictions = raceDistances.map(race => {
      const raceDist = unit === 'miles' ? race.miles : race.km;
      const raceTime = calculatedPace * raceDist;
      const h = Math.floor(raceTime / 3600);
      const m = Math.floor((raceTime % 3600) / 60);
      const s = Math.round(raceTime % 60);
      return {
        name: race.name,
        time: h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`,
      };
    });

    return {
      pace: `${paceMinutes}:${paceSecondsRem.toString().padStart(2, '0')}`,
      paceSeconds: calculatedPace,
      otherPace: `${otherPaceMin}:${otherPaceSec.toString().padStart(2, '0')}`,
      time: `${hours > 0 ? hours + ':' : ''}${hours > 0 ? minutes.toString().padStart(2, '0') : minutes}:${seconds.toString().padStart(2, '0')}`,
      timeSeconds: calculatedTime,
      distance: calculatedDistance.toFixed(2),
      speed: speed.toFixed(1),
      predictions,
    };
  }, [mode, unit, paceMin, paceSec, timeHours, timeMinutes, timeSeconds, distance, raceDistances]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Timer className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.runningPaceCalculator.runningPaceCalculator', 'Running Pace Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.runningPaceCalculator.calculatePaceTimeOrDistance', 'Calculate pace, time, or distance')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.runningPaceCalculator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('miles')}
            className={`flex-1 py-2 rounded-lg ${unit === 'miles' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.runningPaceCalculator.miles', 'Miles')}
          </button>
          <button
            onClick={() => setUnit('km')}
            className={`flex-1 py-2 rounded-lg ${unit === 'km' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.runningPaceCalculator.kilometers', 'Kilometers')}
          </button>
        </div>

        {/* Calculation Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('pace')}
            className={`flex-1 py-2 rounded-lg text-sm ${mode === 'pace' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.runningPaceCalculator.calculatePace', 'Calculate Pace')}
          </button>
          <button
            onClick={() => setMode('time')}
            className={`flex-1 py-2 rounded-lg text-sm ${mode === 'time' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.runningPaceCalculator.calculateTime', 'Calculate Time')}
          </button>
          <button
            onClick={() => setMode('distance')}
            className={`flex-1 py-2 rounded-lg text-sm ${mode === 'distance' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.runningPaceCalculator.calculateDistance', 'Calculate Distance')}
          </button>
        </div>

        {/* Inputs based on mode */}
        <div className="space-y-4">
          {/* Pace Input - shown when calculating time or distance */}
          {mode !== 'pace' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Timer className="w-4 h-4 inline mr-1" />
                Pace (per {unit === 'miles' ? 'mile' : 'km'})
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  value={paceMin}
                  onChange={(e) => setPaceMin(e.target.value)}
                  className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="min"
                />
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={paceSec}
                  onChange={(e) => setPaceSec(e.target.value)}
                  className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="sec"
                />
              </div>
            </div>
          )}

          {/* Time Input - shown when calculating pace or distance */}
          {mode !== 'time' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Timer className="w-4 h-4 inline mr-1" />
                {t('tools.runningPaceCalculator.time', 'Time')}
              </label>
              <div className="flex gap-2 items-center">
                <div className="text-center">
                  <input
                    type="number"
                    min="0"
                    value={timeHours}
                    onChange={(e) => setTimeHours(e.target.value)}
                    className={`w-16 px-2 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>hrs</div>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>:</span>
                <div className="text-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(e.target.value)}
                    className={`w-16 px-2 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>min</div>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>:</span>
                <div className="text-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timeSeconds}
                    onChange={(e) => setTimeSeconds(e.target.value)}
                    className={`w-16 px-2 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>sec</div>
                </div>
              </div>
            </div>
          )}

          {/* Distance Input - shown when calculating pace or time */}
          {mode !== 'distance' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <MapPin className="w-4 h-4 inline mr-1" />
                Distance ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className="flex gap-2 flex-wrap">
                {raceDistances.map(race => (
                  <button
                    key={race.name}
                    onClick={() => setDistance((unit === 'miles' ? race.miles : race.km).toFixed(2))}
                    className={`px-3 py-1 rounded text-xs ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {race.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {mode === 'pace' ? 'Your Pace' : mode === 'time' ? t('tools.runningPaceCalculator.totalTime', 'Total Time') : t('tools.runningPaceCalculator.totalDistance', 'Total Distance')}
          </div>
          <div className="text-5xl font-bold text-blue-500 my-2">
            {mode === 'pace' ? calculations.pace :
             mode === 'time' ? calculations.time :
             `${calculations.distance} ${unit}`}
          </div>
          {mode === 'pace' && (
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              per {unit === 'miles' ? 'mile' : 'kilometer'}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Timer className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.pace}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              /{unit === 'miles' ? 'mi' : 'km'}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Zap className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.speed}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {unit === 'miles' ? 'mph' : t('tools.runningPaceCalculator.kmH', 'km/h')}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.otherPace}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              /{unit === 'miles' ? 'km' : 'mi'}
            </div>
          </div>
        </div>

        {/* Race Predictions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Target className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.runningPaceCalculator.racePredictions', 'Race Predictions')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {calculations.predictions.map((pred) => (
              <div key={pred.name} className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{pred.name}</span>
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{pred.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunningPaceCalculatorTool;
