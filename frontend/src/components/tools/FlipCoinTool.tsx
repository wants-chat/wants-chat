import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleDot, RotateCcw, BarChart2, Coins, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface FlipResult {
  result: 'heads' | 'tails';
  timestamp: Date;
}

interface FlipCoinToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

const FLIP_COLUMNS: ColumnConfig[] = [
  { key: 'result', header: 'Result', type: 'string' },
  { key: 'timestamp', header: 'Timestamp', type: 'date' },
];

export const FlipCoinTool: React.FC<FlipCoinToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [isFlipping, setIsFlipping] = useState(false);
  const [currentResult, setCurrentResult] = useState<'heads' | 'tails' | null>(null);
  const [history, setHistory] = useState<FlipResult[]>([]);
  const [flipCount, setFlipCount] = useState(1);

  // Use the useToolData hook for export functionality and sync status
  const {
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<FlipResult>('flip_coin', history, FLIP_COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.flipCount) setFlipCount(prefillData.params.flipCount);
      setIsPrefilled(true);
    }
  }, [prefillData]);

  const flipCoin = useCallback(() => {
    setIsFlipping(true);

    // Simulate flip animation time
    setTimeout(() => {
      const newFlips: FlipResult[] = [];
      for (let i = 0; i < flipCount; i++) {
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        newFlips.push({ result, timestamp: new Date() });
      }

      setHistory([...newFlips.reverse(), ...history].slice(0, 100));
      setCurrentResult(newFlips[0].result);
      setIsFlipping(false);
    }, 800);
  }, [flipCount, history]);

  const resetHistory = () => {
    setHistory([]);
    setCurrentResult(null);
  };

  const headsCount = history.filter((h) => h.result === 'heads').length;
  const tailsCount = history.filter((h) => h.result === 'tails').length;
  const totalFlips = history.length;
  const headsPercent = totalFlips > 0 ? ((headsCount / totalFlips) * 100).toFixed(1) : '0';
  const tailsPercent = totalFlips > 0 ? ((tailsCount / totalFlips) * 100).toFixed(1) : '0';

  // Get streak
  const getStreak = () => {
    if (history.length === 0) return { type: null, count: 0 };
    const first = history[0].result;
    let count = 0;
    for (const h of history) {
      if (h.result === first) count++;
      else break;
    }
    return { type: first, count };
  };

  const streak = getStreak();

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Coins className="w-5 h-5 text-yellow-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flipCoin.flipACoin', 'Flip a Coin')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.flipCoin.randomCoinFlipWithStatistics', 'Random coin flip with statistics')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="flip-coin" toolName="Flip Coin" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'flip_coin_results' })}
              onExportExcel={() => exportExcel({ filename: 'flip_coin_results' })}
              onExportJSON={() => exportJSON({ filename: 'flip_coin_results' })}
              onExportPDF={() => exportPDF({
                filename: 'flip_coin_results',
                title: 'Coin Flip Results',
                subtitle: `Total Flips: ${history.length}`
              })}
              onPrint={() => print('Flip Coin Results')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              theme={isDark ? 'dark' : 'light'}
              showImport={false}
            />
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.flipCoin.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Coin Display */}
        <div className="flex justify-center">
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-all duration-300 ${
              isFlipping ? 'animate-spin' : ''
            } ${
              currentResult === 'heads'
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                : currentResult === 'tails'
                ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-gray-900'
                : isDark
                ? 'bg-gray-700 text-gray-500'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isFlipping ? (
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
            ) : currentResult ? (
              currentResult === 'heads' ? 'H' : 'T'
            ) : (
              '?'
            )}
          </div>
        </div>

        {/* Result */}
        {currentResult && !isFlipping && (
          <div className={`text-center text-3xl font-bold capitalize ${currentResult === 'heads' ? 'text-yellow-500' : 'text-gray-400'}`}>
            {currentResult}!
          </div>
        )}

        {/* Flip Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.flipCoin.numberOfFlips', 'Number of flips')}
          </label>
          <div className="flex gap-2">
            {[1, 5, 10, 25, 100].map((count) => (
              <button
                key={count}
                onClick={() => setFlipCount(count)}
                className={`flex-1 py-2 rounded-lg ${flipCount === count ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
            isFlipping
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          <CircleDot className="w-6 h-6" />
          {isFlipping ? 'Flipping...' : `Flip ${flipCount > 1 ? `${flipCount} Coins` : 'Coin'}`}
        </button>

        {/* Statistics */}
        {totalFlips > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-yellow-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flipCoin.statistics', 'Statistics')}</h4>
              </div>
              <button
                onClick={resetHistory}
                className={`p-1.5 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Bar */}
            <div className="flex h-6 rounded-full overflow-hidden mb-3">
              <div
                className="bg-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-900 transition-all"
                style={{ width: `${headsPercent}%` }}
              >
                {headsCount > 0 && headsCount}
              </div>
              <div
                className="bg-gray-500 flex items-center justify-center text-xs font-bold text-gray-900 transition-all"
                style={{ width: `${tailsPercent}%` }}
              >
                {tailsCount > 0 && tailsCount}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-500">{headsCount}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Heads ({headsPercent}%)</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalFlips}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flipCoin.totalFlips', 'Total Flips')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{tailsCount}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tails ({tailsPercent}%)</div>
              </div>
            </div>

            {streak.count > 1 && (
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.flipCoin.currentStreak', 'Current streak:')}</span>
                <span className={`font-bold ${streak.type === 'heads' ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {streak.count} {streak.type} in a row!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flipCoin.recentFlips', 'Recent Flips')}</h4>
            <div className="flex flex-wrap gap-1">
              {history.slice(0, 50).map((flip, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    flip.result === 'heads'
                      ? 'bg-yellow-500 text-yellow-900'
                      : 'bg-gray-500 text-gray-900'
                  }`}
                >
                  {flip.result === 'heads' ? 'H' : 'T'}
                </div>
              ))}
              {history.length > 50 && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  +{history.length - 50}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('tools.flipCoin.probability50Heads50Tails', 'Probability: 50% heads, 50% tails')}
        </div>
      </div>
    </div>
  );
};

export default FlipCoinTool;
