import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Timer, Info, TrendingUp, Activity, Droplets, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type PoolLength = '25m' | '25yd' | '50m';
type DistanceUnit = 'meters' | 'yards';

interface TimeInput {
  hours: string;
  minutes: string;
  seconds: string;
}

interface PredictedTime {
  distance: number;
  unit: string;
  time: string;
  label: string;
}

interface TrainingZone {
  name: string;
  description: string;
  paceMultiplier: number;
  color: string;
  pace: string;
}

interface CompetitiveStandard {
  level: string;
  time100m: string;
  color: string;
}

const COMPETITIVE_STANDARDS_100M: CompetitiveStandard[] = [
  { level: 'World Elite', time100m: '0:46', color: '#FFD700' },
  { level: 'National', time100m: '0:52', color: '#C0C0C0' },
  { level: 'Regional', time100m: '1:00', color: '#CD7F32' },
  { level: 'Club', time100m: '1:10', color: '#3b82f6' },
  { level: 'Intermediate', time100m: '1:30', color: '#10b981' },
  { level: 'Beginner', time100m: '2:00', color: '#8b5cf6' },
];

const TRAINING_ZONES: Omit<TrainingZone, 'pace'>[] = [
  { name: 'Easy/Recovery', description: 'Light effort, conversational pace', paceMultiplier: 1.25, color: '#10b981' },
  { name: 'Endurance', description: 'Moderate effort, sustainable', paceMultiplier: 1.15, color: '#3b82f6' },
  { name: 'Tempo', description: 'Comfortably hard, lactate threshold', paceMultiplier: 1.08, color: '#f59e0b' },
  { name: 'Threshold', description: 'Hard effort, race simulation', paceMultiplier: 1.03, color: '#ef4444' },
  { name: 'Race Pace', description: 'Maximum sustainable effort', paceMultiplier: 1.0, color: '#dc2626' },
];

const PREDICTION_DISTANCES = [
  { distance: 50, label: '50' },
  { distance: 100, label: '100' },
  { distance: 200, label: '200' },
  { distance: 400, label: '400' },
  { distance: 800, label: '800' },
  { distance: 1500, label: '1500' },
];

interface SwimPaceCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SwimPaceCalculatorTool: React.FC<SwimPaceCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [poolLength, setPoolLength] = useState<PoolLength>('25m');
  const [timeInput, setTimeInput] = useState<TimeInput>({ hours: '', minutes: '1', seconds: '30' });
  const [distance, setDistance] = useState<string>('100');
  const [strokeCount, setStrokeCount] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        setIsPrefilled(true);
      }
      if (params.time) {
        const timeStr = String(params.time);
        const parts = timeStr.split(':');
        if (parts.length === 3) {
          setTimeInput({ hours: parts[0], minutes: parts[1], seconds: parts[2] });
          setIsPrefilled(true);
        } else if (parts.length === 2) {
          setTimeInput({ hours: '', minutes: parts[0], seconds: parts[1] });
          setIsPrefilled(true);
        }
      }
      if (params.poolLength) {
        setPoolLength(params.poolLength as PoolLength);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const getDistanceUnit = (): DistanceUnit => {
    return poolLength === '25yd' ? 'yards' : 'meters';
  };

  const getUnitAbbreviation = (): string => {
    return poolLength === '25yd' ? 'yd' : 'm';
  };

  const parseTimeToSeconds = (): number => {
    const hours = parseFloat(timeInput.hours) || 0;
    const minutes = parseFloat(timeInput.minutes) || 0;
    const seconds = parseFloat(timeInput.seconds) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (totalSeconds: number): string => {
    if (totalSeconds <= 0 || !isFinite(totalSeconds)) return '--:--';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hundredths = Math.round((totalSeconds % 1) * 100);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
  };

  const calculatePacePer100 = (): number => {
    const totalSeconds = parseTimeToSeconds();
    const dist = parseFloat(distance) || 0;
    if (dist <= 0 || totalSeconds <= 0) return 0;
    return (totalSeconds / dist) * 100;
  };

  const getPredictedTimes = (): PredictedTime[] => {
    const pacePer100 = calculatePacePer100();
    if (pacePer100 <= 0) return [];

    const unit = getUnitAbbreviation();

    return PREDICTION_DISTANCES.map(({ distance: dist, label }) => {
      // Apply fatigue factor for longer distances
      let fatigueFactor = 1.0;
      if (dist > 200) fatigueFactor = 1.02;
      if (dist > 400) fatigueFactor = 1.04;
      if (dist > 800) fatigueFactor = 1.06;

      const predictedSeconds = (pacePer100 / 100) * dist * fatigueFactor;

      return {
        distance: dist,
        unit,
        time: formatTime(predictedSeconds),
        label: `${label}${unit}`,
      };
    });
  };

  const getTrainingZones = (): TrainingZone[] => {
    const pacePer100 = calculatePacePer100();
    if (pacePer100 <= 0) return [];

    return TRAINING_ZONES.map((zone) => ({
      ...zone,
      pace: formatTime(pacePer100 * zone.paceMultiplier),
    }));
  };

  const calculateSwolf = (): number | null => {
    const strokes = parseFloat(strokeCount);
    const totalSeconds = parseTimeToSeconds();
    const dist = parseFloat(distance) || 0;

    if (!strokes || strokes <= 0 || totalSeconds <= 0 || dist <= 0) return null;

    // SWOLF = time (seconds) for one length + stroke count for one length
    const poolLengthValue = poolLength === '25m' || poolLength === '25yd' ? 25 : 50;
    const numLengths = dist / poolLengthValue;
    const timePerLength = totalSeconds / numLengths;
    const strokesPerLength = strokes / numLengths;

    return Math.round(timePerLength + strokesPerLength);
  };

  const estimateStrokesPerMinute = (): number | null => {
    const strokes = parseFloat(strokeCount);
    const totalSeconds = parseTimeToSeconds();

    if (!strokes || strokes <= 0 || totalSeconds <= 0) return null;

    return Math.round((strokes / totalSeconds) * 60);
  };

  const convertToOpenWaterPace = (): string => {
    const pacePer100 = calculatePacePer100();
    if (pacePer100 <= 0) return '--:--';

    // Open water typically 5-10% slower due to no walls, navigation, currents
    const openWaterPace = pacePer100 * 1.08;
    return formatTime(openWaterPace);
  };

  const getCompetitiveLevel = (): CompetitiveStandard | null => {
    const pacePer100 = calculatePacePer100();
    if (pacePer100 <= 0) return null;

    // Convert to meters if in yards for fair comparison
    let pacePer100m = pacePer100;
    if (getDistanceUnit() === 'yards') {
      pacePer100m = pacePer100 * 1.0936; // yards to meters conversion factor
    }

    for (const standard of COMPETITIVE_STANDARDS_100M) {
      const [mins, secs] = standard.time100m.split(':').map(Number);
      const standardSeconds = mins * 60 + secs;
      if (pacePer100m <= standardSeconds) {
        return standard;
      }
    }
    return COMPETITIVE_STANDARDS_100M[COMPETITIVE_STANDARDS_100M.length - 1];
  };

  const handleTimeChange = (field: keyof TimeInput, value: string) => {
    setTimeInput((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setTimeInput({ hours: '', minutes: '1', seconds: '30' });
    setDistance('100');
    setStrokeCount('');
  };

  const pacePer100 = calculatePacePer100();
  const predictedTimes = getPredictedTimes();
  const trainingZones = getTrainingZones();
  const swolf = calculateSwolf();
  const strokesPerMinute = estimateStrokesPerMinute();
  const openWaterPace = convertToOpenWaterPace();
  const competitiveLevel = getCompetitiveLevel();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.swimPaceCalculator.swimPaceCalculator', 'Swim Pace Calculator')}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.swimPaceCalculator.calculatePacePredictTimesAnd', 'Calculate pace, predict times, and analyze your swimming performance')}
              </p>
            </div>
          </div>

          {/* Pool Length Toggle */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.swimPaceCalculator.poolLength', 'Pool Length')}
            </label>
            <div className="flex gap-2">
              {(['25m', '25yd', '50m'] as PoolLength[]).map((length) => (
                <button
                  key={length}
                  onClick={() => setPoolLength(length)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    poolLength === length
                      ? 'bg-[#0D9488] text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {length}
                </button>
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Time Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Timer className="w-4 h-4 inline mr-1" />
                {t('tools.swimPaceCalculator.timeSwam', 'Time Swam')}
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={timeInput.hours}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                    placeholder="HH"
                    className={`w-full px-3 py-3 rounded-lg border text-center ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <span className={`block text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.swimPaceCalculator.hours', 'Hours')}
                  </span>
                </div>
                <span className={`self-center text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timeInput.minutes}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    placeholder="MM"
                    className={`w-full px-3 py-3 rounded-lg border text-center ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <span className={`block text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.swimPaceCalculator.minutes', 'Minutes')}
                  </span>
                </div>
                <span className={`self-center text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="0.01"
                    value={timeInput.seconds}
                    onChange={(e) => handleTimeChange('seconds', e.target.value)}
                    placeholder="SS"
                    className={`w-full px-3 py-3 rounded-lg border text-center ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <span className={`block text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.swimPaceCalculator.seconds', 'Seconds')}
                  </span>
                </div>
              </div>
            </div>

            {/* Distance Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Distance ({getUnitAbbreviation()})
              </label>
              <input
                type="number"
                min="1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder={`Enter distance in ${getDistanceUnit()}`}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <div className="flex gap-2 mt-2">
                {[100, 200, 400, 800].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistance(String(d))}
                    className={`flex-1 py-1 text-xs rounded ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stroke Count for SWOLF */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Activity className="w-4 h-4 inline mr-1" />
              {t('tools.swimPaceCalculator.totalStrokeCountOptionalFor', 'Total Stroke Count (optional, for SWOLF)')}
            </label>
            <input
              type="number"
              min="0"
              value={strokeCount}
              onChange={(e) => setStrokeCount(e.target.value)}
              placeholder={t('tools.swimPaceCalculator.totalStrokesForTheDistance', 'Total strokes for the distance')}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {/* Reset Button */}
          <div className="mb-6">
            <button
              onClick={reset}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.swimPaceCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results Section */}
          {pacePer100 > 0 && (
            <div className="space-y-6">
              {/* Main Pace Display */}
              <div
                className="p-6 rounded-lg text-center"
                style={{ backgroundColor: '#0D948820', borderLeft: '4px solid #0D9488' }}
              >
                <div className="text-4xl font-bold text-[#0D9488] mb-2">
                  {formatTime(pacePer100)}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pace per 100{getUnitAbbreviation()}
                </div>
                {competitiveLevel && (
                  <div className="mt-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${competitiveLevel.color}30`, color: competitiveLevel.color }}
                    >
                      {competitiveLevel.level} Level
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Droplets className="w-4 h-4 inline mr-1" />
                    {t('tools.swimPaceCalculator.openWaterPace', 'Open Water Pace')}
                  </div>
                  <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {openWaterPace}/100{getUnitAbbreviation()}
                  </div>
                </div>

                {swolf !== null && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.swimPaceCalculator.swolfScore2', 'SWOLF Score')}
                    </div>
                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {swolf}
                    </div>
                  </div>
                )}

                {strokesPerMinute !== null && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.swimPaceCalculator.strokesMin', 'Strokes/Min')}
                    </div>
                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {strokesPerMinute} SPM
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.swimPaceCalculator.speed', 'Speed')}
                  </div>
                  <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {((100 / pacePer100) * 3.6).toFixed(2)} km/h
                  </div>
                </div>
              </div>

              {/* Predicted Times */}
              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.swimPaceCalculator.predictedTimes2', 'Predicted Times')}
                  </CardTitle>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.swimPaceCalculator.estimatedTimesForStandardDistances', 'Estimated times for standard distances (includes fatigue factor)')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {predictedTimes.map((prediction) => (
                      <div
                        key={prediction.label}
                        className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}
                      >
                        <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {prediction.label}
                        </div>
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {prediction.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Training Zones */}
              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Activity className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.swimPaceCalculator.trainingZones2', 'Training Zones')}
                  </CardTitle>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.swimPaceCalculator.targetPacesForDifferentTraining', 'Target paces for different training intensities')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainingZones.map((zone) => (
                      <div
                        key={zone.name}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } border-l-4`}
                        style={{ borderLeftColor: zone.color }}
                      >
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {zone.name}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {zone.description}
                          </div>
                        </div>
                        <div
                          className="text-lg font-bold"
                          style={{ color: zone.color }}
                        >
                          {zone.pace}/100{getUnitAbbreviation()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Competitive Standards */}
              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.swimPaceCalculator.competitiveStandards100mFreestyle', 'Competitive Standards (100m Freestyle)')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMPETITIVE_STANDARDS_100M.map((standard) => (
                      <div
                        key={standard.level}
                        className={`p-3 rounded-lg text-center ${
                          competitiveLevel?.level === standard.level
                            ? 'ring-2 ring-offset-2'
                            : ''
                        } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        style={{
                          borderLeft: `3px solid ${standard.color}`,
                          ...(competitiveLevel?.level === standard.level && { ringColor: standard.color })
                        }}
                      >
                        <div style={{ color: standard.color }} className="font-semibold text-sm">
                          {standard.level}
                        </div>
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {standard.time100m}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Info Section */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-full mt-6 flex items-center justify-between p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.swimPaceCalculator.aboutSwimPaceCalculator', 'About Swim Pace Calculator')}
              </span>
            </div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {showInfo ? '-' : '+'}
            </span>
          </button>

          {showInfo && (
            <div className={`mt-2 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <p className="font-semibold">{t('tools.swimPaceCalculator.swolfScore', 'SWOLF Score:')}</p>
                  <p>SWOLF (Swim Golf) = Time per length (seconds) + Strokes per length. Lower is better, indicating efficient swimming.</p>
                </div>
                <div>
                  <p className="font-semibold">{t('tools.swimPaceCalculator.openWaterConversion', 'Open Water Conversion:')}</p>
                  <p>{t('tools.swimPaceCalculator.openWaterPaceIsTypically', 'Open water pace is typically 5-10% slower than pool pace due to no wall push-offs, navigation, and environmental factors.')}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('tools.swimPaceCalculator.trainingZones', 'Training Zones:')}</p>
                  <p>{t('tools.swimPaceCalculator.basedOnYourRacePace', 'Based on your race pace, training zones help structure workouts for optimal improvement. Each zone targets different energy systems.')}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('tools.swimPaceCalculator.predictedTimes', 'Predicted Times:')}</p>
                  <p>{t('tools.swimPaceCalculator.includesFatigueFactorsForLonger', 'Includes fatigue factors for longer distances. Actual times may vary based on fitness, technique, and race conditions.')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwimPaceCalculatorTool;
