import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Clock, MapPin, AlertTriangle, Shield, Info, RotateCcw, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface LightningStrike {
  id: number;
  seconds: number;
  distanceMiles: number;
  distanceKm: number;
  timestamp: Date;
}

type InputMode = 'stopwatch' | 'manual';
type StopwatchPhase = 'idle' | 'waiting_flash' | 'timing' | 'complete';

const SPEED_OF_SOUND_MPH = 767; // mph at sea level
const MILES_PER_SECOND = SPEED_OF_SOUND_MPH / 3600; // ~0.213 miles per second
const KM_PER_SECOND = 0.343; // km per second (speed of sound)

const COLUMNS: ColumnConfig[] = [
  { key: 'strikeNumber', header: 'Strike #', type: 'number' },
  { key: 'seconds', header: 'Delay (seconds)', type: 'number' },
  { key: 'distanceMiles', header: 'Distance (miles)', type: 'number' },
  { key: 'distanceKm', header: 'Distance (km)', type: 'number' },
  { key: 'timestamp', header: 'Time', type: 'date' },
];

const calculateDistance = (seconds: number) => {
  const distanceMiles = seconds * MILES_PER_SECOND;
  const distanceKm = seconds * KM_PER_SECOND;
  return { distanceMiles, distanceKm };
};

const getStormMovement = (strikes: LightningStrike[]): 'approaching' | 'receding' | 'stable' | 'unknown' => {
  if (strikes.length < 2) return 'unknown';

  const recent = strikes.slice(-3);
  if (recent.length < 2) return 'unknown';

  const distances = recent.map(s => s.distanceMiles);
  const avgChange = (distances[distances.length - 1] - distances[0]) / (distances.length - 1);

  if (avgChange < -0.3) return 'approaching';
  if (avgChange > 0.3) return 'receding';
  return 'stable';
};

const getSafetyLevel = (distanceMiles: number): { level: 'danger' | 'warning' | 'caution' | 'safe'; message: string; color: string } => {
  if (distanceMiles < 1) {
    return {
      level: 'danger',
      message: 'IMMEDIATE DANGER! Seek shelter NOW!',
      color: '#ef4444'
    };
  } else if (distanceMiles < 3) {
    return {
      level: 'warning',
      message: 'Very close! Move to a safe location immediately.',
      color: '#f97316'
    };
  } else if (distanceMiles < 6) {
    return {
      level: 'caution',
      message: 'Storm is nearby. Consider seeking shelter.',
      color: '#eab308'
    };
  }
  return {
    level: 'safe',
    message: 'Storm is at a safe distance. Continue monitoring.',
    color: '#22c55e'
  };
};

interface LightningDistanceToolProps {
  uiConfig?: UIConfig;
}

export const LightningDistanceTool: React.FC<LightningDistanceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('stopwatch');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setManualSeconds(String(params.amount));
        setInputMode('manual');
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setManualSeconds(numMatch[0]);
          setInputMode('manual');
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);
  const [stopwatchPhase, setStopwatchPhase] = useState<StopwatchPhase>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [manualSeconds, setManualSeconds] = useState('');
  const [strikes, setStrikes] = useState<LightningStrike[]>([]);
  const [currentResult, setCurrentResult] = useState<{ distanceMiles: number; distanceKm: number } | null>(null);
  const [showSafetyTips, setShowSafetyTips] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (stopwatchPhase === 'timing') {
      startTimeRef.current = Date.now();
      intervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
      }, 100);
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
  }, [stopwatchPhase]);

  const handleFlashClick = () => {
    if (stopwatchPhase === 'idle' || stopwatchPhase === 'complete') {
      setStopwatchPhase('waiting_flash');
      setElapsedTime(0);
      setCurrentResult(null);
    } else if (stopwatchPhase === 'waiting_flash') {
      setStopwatchPhase('timing');
    }
  };

  const handleThunderClick = () => {
    if (stopwatchPhase === 'timing') {
      const seconds = elapsedTime;
      const { distanceMiles, distanceKm } = calculateDistance(seconds);

      const newStrike: LightningStrike = {
        id: Date.now(),
        seconds,
        distanceMiles,
        distanceKm,
        timestamp: new Date()
      };

      setStrikes(prev => [...prev, newStrike]);
      setCurrentResult({ distanceMiles, distanceKm });
      setStopwatchPhase('complete');
    }
  };

  const handleManualCalculate = () => {
    const seconds = parseFloat(manualSeconds);
    if (isNaN(seconds) || seconds <= 0) {
      setValidationMessage('Please enter a valid number of seconds');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const { distanceMiles, distanceKm } = calculateDistance(seconds);

    const newStrike: LightningStrike = {
      id: Date.now(),
      seconds,
      distanceMiles,
      distanceKm,
      timestamp: new Date()
    };

    setStrikes(prev => [...prev, newStrike]);
    setCurrentResult({ distanceMiles, distanceKm });
    setManualSeconds('');
  };

  const resetStopwatch = () => {
    setStopwatchPhase('idle');
    setElapsedTime(0);
    setCurrentResult(null);
  };

  const clearHistory = () => {
    setStrikes([]);
    setCurrentResult(null);
    resetStopwatch();
  };

  const formatTime = (seconds: number): string => {
    return seconds.toFixed(1);
  };

  // Prepare data for export with index
  const getExportData = () => {
    return strikes.map((strike, idx) => ({
      strikeNumber: idx + 1,
      seconds: parseFloat(strike.seconds.toFixed(1)),
      distanceMiles: parseFloat(strike.distanceMiles.toFixed(1)),
      distanceKm: parseFloat(strike.distanceKm.toFixed(1)),
      timestamp: strike.timestamp,
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    exportToCSV(data, COLUMNS, { filename: 'lightning-distance-data' });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    exportToExcel(data, COLUMNS, { filename: 'lightning-distance-data' });
  };

  const handleExportJSON = () => {
    const data = getExportData();
    exportToJSON(data, { filename: 'lightning-distance-data' });
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    await exportToPDF(data, COLUMNS, {
      filename: 'lightning-distance-data',
      title: 'Lightning Distance Measurements',
      subtitle: `Recorded on ${new Date().toLocaleDateString()}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const data = getExportData();
    return await copyUtil(data, COLUMNS, 'json');
  };

  const handlePrint = () => {
    const data = getExportData();
    printData(data, COLUMNS, { title: 'Lightning Distance Measurements' });
  };

  const stormMovement = getStormMovement(strikes);
  const latestStrike = strikes[strikes.length - 1];
  const safetyInfo = latestStrike ? getSafetyLevel(latestStrike.distanceMiles) : null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.lightningDistance.lightningDistanceCalculator', 'Lightning Distance Calculator')}
              </h1>
            </div>
            {strikes.length > 0 && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopyToClipboard}
                onPrint={handlePrint}
                showImport={false}
                theme={theme}
              />
            )}
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.lightningDistance.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Input Mode Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('stopwatch')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  inputMode === 'stopwatch'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                {t('tools.lightningDistance.stopwatchMode', 'Stopwatch Mode')}
              </button>
              <button
                onClick={() => setInputMode('manual')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.lightningDistance.manualInput', 'Manual Input')}
              </button>
            </div>
          </div>

          {/* Stopwatch Mode */}
          {inputMode === 'stopwatch' && (
            <div className="space-y-4 mb-6">
              {/* Timer Display */}
              <div className={`text-center py-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-5xl font-mono font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(elapsedTime)}s
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stopwatchPhase === 'idle' && 'Ready to start'}
                  {stopwatchPhase === 'waiting_flash' && 'Click when you SEE lightning'}
                  {stopwatchPhase === 'timing' && 'Click when you HEAR thunder'}
                  {stopwatchPhase === 'complete' && 'Measurement complete'}
                </div>
              </div>

              {/* Stopwatch Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleFlashClick}
                  disabled={stopwatchPhase === 'timing'}
                  className={`py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    stopwatchPhase === 'timing'
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  {stopwatchPhase === 'idle' || stopwatchPhase === 'complete' ? t('tools.lightningDistance.start', 'Start') : t('tools.lightningDistance.flash', 'Flash!')}
                </button>
                <button
                  onClick={handleThunderClick}
                  disabled={stopwatchPhase !== 'timing'}
                  className={`py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    stopwatchPhase !== 'timing'
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl animate-pulse'
                  }`}
                >
                  <span className="text-lg">{t('tools.lightningDistance.thunder', 'Thunder!')}</span>
                </button>
              </div>

              <button
                onClick={resetStopwatch}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {t('tools.lightningDistance.reset', 'Reset')}
              </button>
            </div>
          )}

          {/* Manual Input Mode */}
          {inputMode === 'manual' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.lightningDistance.secondsBetweenFlashAndThunder', 'Seconds Between Flash and Thunder')}
                </label>
                <input
                  type="number"
                  value={manualSeconds}
                  onChange={(e) => setManualSeconds(e.target.value)}
                  placeholder={t('tools.lightningDistance.enterSecondsEG5', 'Enter seconds (e.g., 5)')}
                  step="0.1"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <button
                onClick={handleManualCalculate}
                className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                {t('tools.lightningDistance.calculateDistance', 'Calculate Distance')}
              </button>
            </div>
          )}

          {/* Current Result */}
          {currentResult && (
            <div
              className="p-6 rounded-lg mb-6"
              style={{
                backgroundColor: safetyInfo ? `${safetyInfo.color}15` : undefined,
                borderLeft: safetyInfo ? `4px solid ${safetyInfo.color}` : undefined
              }}
            >
              <div className="text-center mb-4">
                <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.lightningDistance.distanceToLightning', 'Distance to Lightning')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-4xl font-bold text-[#0D9488]">
                      {currentResult.distanceMiles.toFixed(1)}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      miles
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#0D9488]">
                      {currentResult.distanceKm.toFixed(1)}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      kilometers
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Warning */}
              {safetyInfo && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: `${safetyInfo.color}20` }}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: safetyInfo.color }} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {safetyInfo.message}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Visual Distance Indicator */}
          {currentResult && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.lightningDistance.distanceIndicator', 'Distance Indicator')}
              </div>
              <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
                <div
                  className="absolute top-0 h-full w-2 bg-white rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-500"
                  style={{
                    left: `${Math.min(Math.max((currentResult.distanceMiles / 10) * 100, 5), 95)}%`
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>0 mi</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>10+ mi</span>
              </div>
            </div>
          )}

          {/* Storm Movement Indicator */}
          {strikes.length >= 2 && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.lightningDistance.stormMovement', 'Storm Movement')}
              </div>
              <div className="flex items-center gap-3">
                {stormMovement === 'approaching' && (
                  <>
                    <TrendingDown className="w-6 h-6 text-red-500" />
                    <span className="text-red-500 font-semibold">{t('tools.lightningDistance.stormIsApproaching', 'Storm is APPROACHING')}</span>
                  </>
                )}
                {stormMovement === 'receding' && (
                  <>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <span className="text-green-500 font-semibold">{t('tools.lightningDistance.stormIsMovingAway', 'Storm is moving AWAY')}</span>
                  </>
                )}
                {stormMovement === 'stable' && (
                  <>
                    <Minus className="w-6 h-6 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">{t('tools.lightningDistance.stormIsStable', 'Storm is STABLE')}</span>
                  </>
                )}
                {stormMovement === 'unknown' && (
                  <>
                    <Minus className="w-6 h-6 text-gray-500" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.lightningDistance.needMoreDataPoints', 'Need more data points')}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Strike History */}
          {strikes.length > 0 && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Strike History ({strikes.length})
                </h3>
                <button
                  onClick={clearHistory}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.lightningDistance.clearAll', 'Clear All')}
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...strikes].reverse().map((strike, index) => (
                  <div
                    key={strike.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        #{strikes.length - index}
                      </span>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {strike.distanceMiles.toFixed(1)} mi / {strike.distanceKm.toFixed(1)} km
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {strike.seconds.toFixed(1)}s delay - {strike.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSafetyLevel(strike.distanceMiles).color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Tips Section */}
          <button
            onClick={() => setShowSafetyTips(!showSafetyTips)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors mb-4`}
          >
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.lightningDistance.lightningSafetyTips', 'Lightning Safety Tips')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showSafetyTips ? '-' : '+'}
            </span>
          </button>

          {showSafetyTips && (
            <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p><strong>30-30 Rule:</strong> {t('tools.lightningDistance.seekShelterIfTheTime', 'Seek shelter if the time between lightning and thunder is 30 seconds or less. Stay inside for 30 minutes after the last thunder.')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p><strong>{t('tools.lightningDistance.safeLocations', 'Safe locations:')}</strong> {t('tools.lightningDistance.enclosedBuildingsWithWiringAnd', 'Enclosed buildings with wiring and plumbing, or hard-topped vehicles with windows closed.')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p><strong>{t('tools.lightningDistance.avoid', 'Avoid:')}</strong> {t('tools.lightningDistance.openFieldsHilltopsTallIsolated', 'Open fields, hilltops, tall isolated trees, water, and metal objects like fences or poles.')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p><strong>{t('tools.lightningDistance.ifCaughtOutside', 'If caught outside:')}</strong> {t('tools.lightningDistance.crouchLowWithFeetTogether', 'Crouch low with feet together, minimize contact with ground. Do not lie flat.')}</p>
                </div>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.lightningDistance.howItWorks', 'How It Works')}
            </h3>
            <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Light travels almost instantly, while sound travels at ~343 m/s (~767 mph)</li>
              <li>Each second between flash and thunder equals ~0.21 miles (~0.34 km)</li>
              <li>The classic "5 seconds = 1 mile" rule is a useful approximation</li>
              <li>{t('tools.lightningDistance.trackMultipleStrikesToDetermine', 'Track multiple strikes to determine if the storm is approaching or moving away')}</li>
            </ul>
          </div>
        </div>
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

export default LightningDistanceTool;
