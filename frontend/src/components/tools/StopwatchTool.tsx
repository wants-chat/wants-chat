import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Clock, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface Lap {
  id: number;
  time: number;
  lapTime: number;
}

interface StopwatchToolProps {
  uiConfig?: UIConfig;
}

const getColumns = (t: (key: string) => string) => [
  { key: 'id', label: t('tools.stopwatch.columns.lapNumber') },
  { key: 'lapTime', label: t('tools.stopwatch.columns.lapTime') },
  { key: 'time', label: t('tools.stopwatch.columns.totalTime') },
];

export const StopwatchTool = ({ uiConfig }: StopwatchToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Stopwatch doesn't have duration prefill, but mark as prefilled for tracking
      if (params.amount || params.content || params.text) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setTime(elapsed);
        accumulatedTimeRef.current = elapsed;
      }, 10);
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
  }, [isRunning]);

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleLap = () => {
    if (!isRunning && time === 0) return;

    const lapTime = laps.length === 0 ? time : time - laps[laps.length - 1].time;
    const newLap: Lap = {
      id: laps.length + 1,
      time: time,
      lapTime: lapTime,
    };
    setLaps([...laps, newLap]);
  };

  // Export handlers
  const COLUMNS = getColumns(t);
  const handleExportCSV = () => {
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = laps.map(lap =>
      [
        lap.id,
        formatTime(lap.lapTime),
        formatTime(lap.time),
      ].join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stopwatch-laps-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonData = laps.map(lap => ({
      lapNumber: lap.id,
      lapTime: formatTime(lap.lapTime),
      totalTime: formatTime(lap.time),
    }));
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stopwatch-laps-${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    const text = laps.map((lap) =>
      `Lap ${lap.id}: ${formatTime(lap.lapTime)} (Total: ${formatTime(lap.time)})`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#0D9488] rounded-lg">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.stopwatch.title')}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Time Display */}
        <div className={`text-center py-12 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-6xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(time)}
          </div>
          <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            HH:MM:SS.MS
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              isRunning
                ? theme === 'dark'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                {t('tools.stopwatch.buttons.pause')}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {t('tools.stopwatch.buttons.start')}
              </>
            )}
          </button>

          <button
            onClick={handleLap}
            disabled={!isRunning && time === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              !isRunning && time === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Plus className="w-5 h-5" />
            {t('tools.stopwatch.buttons.lap')}
          </button>

          <button
            onClick={handleReset}
            disabled={time === 0 && laps.length === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              time === 0 && laps.length === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            {t('tools.stopwatch.buttons.reset')}
          </button>
        </div>

        {/* Laps List */}
        {laps.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.stopwatch.laps')} ({laps.length})
              </h3>
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            </div>
            <div className={`space-y-2 max-h-64 overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
              {[...laps].reverse().map((lap, index) => (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      #{laps.length - index}
                    </span>
                    <div>
                      <div className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(lap.lapTime)}
                      </div>
                      <div className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.stopwatch.total')}: {formatTime(lap.time)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.stopwatch.howToUse.title')}
          </h3>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• {t('tools.stopwatch.howToUse.start')}</li>
            <li>• {t('tools.stopwatch.howToUse.lap')}</li>
            <li>• {t('tools.stopwatch.howToUse.pause')}</li>
            <li>• {t('tools.stopwatch.howToUse.reset')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
