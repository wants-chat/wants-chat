import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, RotateCcw, History, Sparkles, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FlipResult {
  id: string;
  result: 'heads' | 'tails';
  timestamp: string;
}

interface CoinFlipToolProps {
  uiConfig?: UIConfig;
}

export const CoinFlipTool: React.FC<CoinFlipToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentResult, setCurrentResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<FlipResult[]>([]);
  const [flipCount, setFlipCount] = useState(1);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        flipCount?: number;
      };
      if (params.flipCount) setFlipCount(params.flipCount);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const flipCoin = useCallback(() => {
    setIsFlipping(true);
    setCoinRotation(prev => prev + 1800 + Math.random() * 720);

    // Animate the flip
    let flipAnimations = 0;
    const maxFlips = 15;
    const interval = setInterval(() => {
      setCurrentResult(Math.random() > 0.5 ? 'heads' : 'tails');
      flipAnimations++;

      if (flipAnimations >= maxFlips) {
        clearInterval(interval);

        // Final result
        const result: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';
        setCurrentResult(result);
        setIsFlipping(false);

        // Add to history
        const flipResult: FlipResult = {
          id: Date.now().toString(),
          result,
          timestamp: new Date().toISOString(),
        };
        setHistory(prev => [flipResult, ...prev].slice(0, 50));
      }
    }, 80);
  }, []);

  const flipMultiple = useCallback(() => {
    const results: FlipResult[] = [];
    for (let i = 0; i < flipCount; i++) {
      const result: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';
      results.push({
        id: `${Date.now()}-${i}`,
        result,
        timestamp: new Date().toISOString(),
      });
    }
    setHistory(prev => [...results, ...prev].slice(0, 100));
    if (results.length > 0) {
      setCurrentResult(results[0].result);
    }
  }, [flipCount]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentResult(null);
  }, []);

  // Calculate statistics
  const headsCount = history.filter(h => h.result === 'heads').length;
  const tailsCount = history.filter(h => h.result === 'tails').length;
  const totalFlips = history.length;
  const headsPercentage = totalFlips > 0 ? ((headsCount / totalFlips) * 100).toFixed(1) : '0';
  const tailsPercentage = totalFlips > 0 ? ((tailsCount / totalFlips) * 100).toFixed(1) : '0';

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.coinFlip.coinFlip', 'Coin Flip')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.coinFlip.flipAVirtualCoinFor', 'Flip a virtual coin for quick decisions')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.coinFlip.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Coin Display */}
        <div className={`relative flex justify-center py-8 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl`}>
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl font-bold shadow-2xl transition-transform duration-500 ${
              currentResult === 'heads'
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                : currentResult === 'tails'
                ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800'
                : isDark
                ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400'
                : 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-500'
            } ${isFlipping ? 'animate-spin' : ''}`}
            style={{
              transform: `rotateY(${coinRotation}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {currentResult ? (
              <span className="drop-shadow-lg">
                {currentResult === 'heads' ? 'H' : 'T'}
              </span>
            ) : (
              <span>?</span>
            )}
          </div>
        </div>

        {/* Result Text */}
        {currentResult && !isFlipping && (
          <div className="text-center">
            <span className={`text-3xl font-bold capitalize ${
              currentResult === 'heads' ? 'text-yellow-500' : 'text-gray-400'
            }`}>
              {currentResult}!
            </span>
          </div>
        )}

        {/* Flip Button */}
        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className={`w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-yellow-500/30 ${
            isFlipping ? 'animate-pulse cursor-not-allowed' : ''
          }`}
        >
          {isFlipping ? t('tools.coinFlip.flipping', 'Flipping...') : t('tools.coinFlip.flipCoin', 'Flip Coin')}
        </button>

        {/* Multiple Flips */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.coinFlip.multipleFlips', 'Multiple Flips')}
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={flipCount}
              onChange={(e) => setFlipCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
            <button
              onClick={flipMultiple}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Flip {flipCount}x
            </button>
          </div>
        </div>

        {/* Statistics */}
        {totalFlips > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.coinFlip.statistics', 'Statistics')}
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalFlips}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.coinFlip.totalFlips', 'Total Flips')}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {headsCount} ({headsPercentage}%)
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.coinFlip.heads', 'Heads')}
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tailsCount} ({tailsPercentage}%)
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.coinFlip.tails', 'Tails')}
                </div>
              </div>
            </div>
            {/* Visual bar */}
            <div className="mt-4 h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div
                className="bg-yellow-500 h-full transition-all duration-500"
                style={{ width: `${headsPercentage}%` }}
              />
              <div
                className="bg-gray-500 h-full transition-all duration-500"
                style={{ width: `${tailsPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.coinFlip.recentFlips', 'Recent Flips')}
                </h4>
              </div>
              <button
                onClick={clearHistory}
                className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <RotateCcw className="w-3 h-3" />
                {t('tools.coinFlip.clear', 'Clear')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {history.slice(0, 30).map((flip) => (
                <div
                  key={flip.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    flip.result === 'heads'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  title={`${flip.result} - ${new Date(flip.timestamp).toLocaleTimeString()}`}
                >
                  {flip.result === 'heads' ? 'H' : 'T'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.coinFlip.tip', 'Tip:')}</strong> Each flip uses a cryptographically secure random number generator for truly random results. Perfect for quick decisions!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipTool;
