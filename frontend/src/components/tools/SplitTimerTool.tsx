import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Timer, Flag, Copy, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface Split {
  id: number;
  lapTime: number;
  totalTime: number;
  timestamp: Date;
}

interface SplitStats {
  average: number;
  fastest: number;
  slowest: number;
  fastestIndex: number;
  slowestIndex: number;
}

interface SplitTimerToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Lap #' },
  { key: 'lapTime', header: 'Lap Time' },
  { key: 'totalTime', header: 'Total Time' },
  { key: 'timestamp', header: 'Timestamp', type: 'date' },
];

export const SplitTimerTool = ({
  uiConfig }: SplitTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [totalTime, setTotalTime] = useState(0);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [splits, setSplits] = useState<Split[]>([]);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const lastSplitTimeRef = useRef<number>(0);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Split timer is typically started fresh, but we can indicate it's ready
      if (params.amount || params.text) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params (timer state can be restored)
      if (params.splits) setSplits(params.splits);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setTotalTime(elapsed);
        setCurrentLapTime(elapsed - lastSplitTimeRef.current);
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

  const formatTime = (ms: number, includeMs: boolean = true): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      if (includeMs) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    if (includeMs) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDifference = (diff: number): string => {
    const sign = diff >= 0 ? '+' : '-';
    const absDiff = Math.abs(diff);
    const seconds = Math.floor(absDiff / 1000);
    const milliseconds = Math.floor((absDiff % 1000) / 10);
    return `${sign}${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const calculateStats = (): SplitStats | null => {
    if (splits.length === 0) return null;

    const lapTimes = splits.map((s) => s.lapTime);
    const total = lapTimes.reduce((sum, t) => sum + t, 0);
    const average = total / lapTimes.length;
    const fastest = Math.min(...lapTimes);
    const slowest = Math.max(...lapTimes);
    const fastestIndex = lapTimes.indexOf(fastest);
    const slowestIndex = lapTimes.indexOf(slowest);

    return { average, fastest, slowest, fastestIndex, slowestIndex };
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleSplit = () => {
    if (!isRunning && totalTime === 0) return;

    const lapTime = totalTime - lastSplitTimeRef.current;
    const newSplit: Split = {
      id: splits.length + 1,
      lapTime,
      totalTime,
      timestamp: new Date(),
    };

    setSplits([...splits, newSplit]);
    lastSplitTimeRef.current = totalTime;
    setCurrentLapTime(0);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalTime(0);
    setCurrentLapTime(0);
    setSplits([]);
    accumulatedTimeRef.current = 0;
    lastSplitTimeRef.current = 0;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleExport = async () => {
    const stats = calculateStats();
    let exportText = 'Split Timer Results\n';
    exportText += '===================\n\n';
    exportText += `Date: ${new Date().toLocaleDateString()}\n`;
    exportText += `Total Time: ${formatTime(totalTime, false)}\n`;
    exportText += `Total Splits: ${splits.length}\n\n`;

    if (stats) {
      exportText += 'Statistics:\n';
      exportText += `-----------\n`;
      exportText += `Average Split: ${formatTime(stats.average, false)}\n`;
      exportText += `Fastest Split: ${formatTime(stats.fastest, false)} (Lap #${stats.fastestIndex + 1})\n`;
      exportText += `Slowest Split: ${formatTime(stats.slowest, false)} (Lap #${stats.slowestIndex + 1})\n\n`;
    }

    exportText += 'Splits:\n';
    exportText += '-------\n';
    splits.forEach((split, index) => {
      const diff = stats ? split.lapTime - stats.average : 0;
      exportText += `Lap ${index + 1}: ${formatTime(split.lapTime, false)} | Total: ${formatTime(split.totalTime, false)}`;
      if (stats) {
        exportText += ` | ${formatDifference(diff)} from avg`;
      }
      exportText += '\n';
    });

    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const stats = calculateStats();

  const getSplitIndicator = (split: Split, index: number) => {
    if (!stats || splits.length < 2) return null;

    if (index === stats.fastestIndex) {
      return { icon: TrendingUp, color: 'text-green-500', label: 'Fastest' };
    }
    if (index === stats.slowestIndex) {
      return { icon: TrendingDown, color: 'text-red-500', label: 'Slowest' };
    }
    return null;
  };

  const getDifferenceColor = (diff: number): string => {
    if (diff < -500) return 'text-green-500';
    if (diff > 500) return 'text-red-500';
    return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  };

  const handleExportCSV = () => {
    exportToCSV(splits, COLUMNS, { filename: 'split-timer-results' });
  };

  const handleExportExcel = () => {
    exportToExcel(splits, COLUMNS, { filename: 'split-timer-results' });
  };

  const handleExportJSON = () => {
    exportToJSON(splits, { filename: 'split-timer-results' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(splits, COLUMNS, {
      filename: 'split-timer-results',
      title: 'Split Timer Results',
      subtitle: 'Export of lap times and statistics',
    });
  };

  const handlePrint = () => {
    printData(splits, COLUMNS, { title: 'Split Timer Results' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(splits, COLUMNS, 'tab');
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 sm:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.splitTimer.splitTimer', 'Split Timer')}
          </h2>
        </div>
        {splits.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme}
          />
        )}
      </div>

      <div className="space-y-6">
        {/* Main Timer Display */}
        <div className={`text-center py-8 sm:py-12 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          {/* Total Elapsed Time */}
          <div className={`text-5xl sm:text-7xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(totalTime)}
          </div>
          <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.splitTimer.totalElapsedTime', 'Total Elapsed Time')}
          </div>

          {/* Current Lap Time */}
          {(isRunning || splits.length > 0) && (
            <div className="mt-6">
              <div className={`text-2xl sm:text-3xl font-mono ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
                {formatTime(currentLapTime)}
              </div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Current Lap (#{splits.length + 1})
              </div>
            </div>
          )}
        </div>

        {/* Large Control Buttons - Optimized for touch */}
        <div className="grid grid-cols-2 sm:flex gap-3 sm:justify-center">
          <button
            onClick={handleStartPause}
            className={`flex items-center justify-center gap-2 px-6 py-5 sm:py-4 rounded-xl sm:rounded-lg transition-colors font-medium text-lg sm:text-base touch-manipulation ${
              isRunning
                ? theme === 'dark'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white active:bg-yellow-800'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white active:bg-yellow-700'
                : 'bg-[#0D9488] hover:bg-[#0F766E] text-white active:bg-[#0A5E54]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 sm:w-5 sm:h-5" />
                {t('tools.splitTimer.pause2', 'Pause')}
              </>
            ) : (
              <>
                <Play className="w-6 h-6 sm:w-5 sm:h-5" />
                {t('tools.splitTimer.start2', 'Start')}
              </>
            )}
          </button>

          <button
            onClick={handleSplit}
            disabled={!isRunning && totalTime === 0}
            className={`flex items-center justify-center gap-2 px-6 py-5 sm:py-4 rounded-xl sm:rounded-lg transition-colors font-medium text-lg sm:text-base touch-manipulation ${
              !isRunning && totalTime === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white active:bg-blue-700'
            }`}
          >
            <Flag className="w-6 h-6 sm:w-5 sm:h-5" />
            {t('tools.splitTimer.split2', 'Split')}
          </button>

          <button
            onClick={handleReset}
            disabled={totalTime === 0 && splits.length === 0}
            className={`flex items-center justify-center gap-2 px-6 py-5 sm:py-4 rounded-xl sm:rounded-lg transition-colors font-medium text-lg sm:text-base touch-manipulation ${
              totalTime === 0 && splits.length === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white active:bg-gray-500'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 active:bg-gray-400'
            }`}
          >
            <RotateCcw className="w-6 h-6 sm:w-5 sm:h-5" />
            {t('tools.splitTimer.reset', 'Reset')}
          </button>

          <button
            onClick={handleExport}
            disabled={splits.length === 0}
            className={`flex items-center justify-center gap-2 px-6 py-5 sm:py-4 rounded-xl sm:rounded-lg transition-colors font-medium text-lg sm:text-base touch-manipulation ${
              splits.length === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white active:bg-gray-500'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 active:bg-gray-400'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-6 h-6 sm:w-5 sm:h-5 text-green-500" />
                {t('tools.splitTimer.copied', 'Copied!')}
              </>
            ) : (
              <>
                <Copy className="w-6 h-6 sm:w-5 sm:h-5" />
                {t('tools.splitTimer.export2', 'Export')}
              </>
            )}
          </button>
        </div>

        {/* Statistics Card */}
        {stats && (
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.splitTimer.splitStatistics', 'Split Statistics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.splitTimer.average', 'Average')}
                  </div>
                  <div className={`text-lg font-mono font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(stats.average, false)}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.splitTimer.fastest', 'Fastest')}
                  </div>
                  <div className="text-lg font-mono font-semibold text-green-500">
                    {formatTime(stats.fastest, false)}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Lap #{stats.fastestIndex + 1}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-xs uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.splitTimer.slowest', 'Slowest')}
                  </div>
                  <div className="text-lg font-mono font-semibold text-red-500">
                    {formatTime(stats.slowest, false)}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Lap #{stats.slowestIndex + 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Splits List */}
        {splits.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Splits ({splits.length})
            </h3>
            <div className={`space-y-2 max-h-80 overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
              {[...splits].reverse().map((split, reversedIndex) => {
                const actualIndex = splits.length - 1 - reversedIndex;
                const indicator = getSplitIndicator(split, actualIndex);
                const diff = stats ? split.lapTime - stats.average : 0;

                return (
                  <div
                    key={split.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                    } ${indicator ? (indicator.label === 'Fastest' ? 'ring-2 ring-green-500/30' : 'ring-2 ring-red-500/30') : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg w-10 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          #{split.id}
                        </span>
                        {indicator && (
                          <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
                        )}
                      </div>
                      <div>
                        <div className={`font-mono text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatTime(split.lapTime)}
                        </div>
                        <div className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Total: {formatTime(split.totalTime)}
                        </div>
                      </div>
                    </div>

                    {/* Difference from average */}
                    {stats && splits.length >= 2 && (
                      <div className={`flex items-center gap-1 font-mono text-sm ${getDifferenceColor(diff)}`}>
                        {diff === 0 ? (
                          <Minus className="w-3 h-3" />
                        ) : diff < 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatDifference(diff)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.splitTimer.howToUse', 'How to Use')}
          </h3>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Press <strong>{t('tools.splitTimer.start', 'Start')}</strong> {t('tools.splitTimer.toBeginTimingYourActivity', 'to begin timing your activity')}</li>
            <li>Press <strong>{t('tools.splitTimer.split', 'Split')}</strong> {t('tools.splitTimer.toRecordALapSplit', 'to record a lap/split time')}</li>
            <li>Press <strong>{t('tools.splitTimer.pause', 'Pause')}</strong> {t('tools.splitTimer.toTemporarilyStopTheTimer', 'to temporarily stop the timer')}</li>
            <li>Press <strong>{t('tools.splitTimer.export', 'Export')}</strong> {t('tools.splitTimer.toCopyAllSplitsTo', 'to copy all splits to clipboard')}</li>
            <li>{t('tools.splitTimer.viewStatisticsAverageFastestAnd', 'View statistics: average, fastest, and slowest split times')}</li>
            <li>{t('tools.splitTimer.greenRedIndicatorsShowDifference', 'Green/red indicators show difference from average pace')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SplitTimerTool;
