import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, History, RotateCcw, Sparkles } from 'lucide-react';
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

interface CoinFlipperToolProps {
  uiConfig?: UIConfig;
}

interface FlipResult {
  result: 'heads' | 'tails';
  timestamp: Date;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  {
    key: 'result',
    header: 'Result',
    type: 'string',
    format: (value: any) => value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
  },
  {
    key: 'timestamp',
    header: 'Timestamp',
    type: 'date'
  }
];

export const CoinFlipperTool: React.FC<CoinFlipperToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.history) setHistory(params.history);
      if (params.flipCount) setFlipCount(params.flipCount);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<FlipResult[]>([]);
  const [flipCount, setFlipCount] = useState(1);

  const flipCoin = () => {
    setIsFlipping(true);

    // Animate with multiple flips
    let flipNumber = 0;
    const maxFlips = 15;
    const interval = setInterval(() => {
      const tempResult = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(tempResult);
      flipNumber++;

      if (flipNumber >= maxFlips) {
        clearInterval(interval);
        setIsFlipping(false);

        // Final result
        const finalResult = Math.random() < 0.5 ? 'heads' : 'tails';
        setResult(finalResult);

        // Add to history
        setHistory(prev => [
          { result: finalResult, timestamp: new Date() },
          ...prev.slice(0, 49)
        ]);

        // Call onSaveCallback if editing from gallery
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    }, 80);
  };

  const flipMultiple = () => {
    const results: ('heads' | 'tails')[] = [];
    for (let i = 0; i < flipCount; i++) {
      results.push(Math.random() < 0.5 ? 'heads' : 'tails');
    }

    // Add all to history
    const newHistory = results.map(r => ({
      result: r,
      timestamp: new Date()
    }));
    setHistory(prev => [...newHistory, ...prev].slice(0, 50));

    // Show last result
    setResult(results[results.length - 1]);
  };

  const stats = {
    total: history.length,
    heads: history.filter(h => h.result === 'heads').length,
    tails: history.filter(h => h.result === 'tails').length,
  };

  const headsPercentage = stats.total > 0 ? (stats.heads / stats.total) * 100 : 50;

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(history, COLUMNS, { filename: 'coin-flip-history' });
  };

  const handleExportExcel = () => {
    exportToExcel(history, COLUMNS, { filename: 'coin-flip-history' });
  };

  const handleExportJSON = () => {
    exportToJSON(history, { filename: 'coin-flip-history' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(history, COLUMNS, {
      filename: 'coin-flip-history',
      title: 'Coin Flip History'
    });
  };

  const handlePrint = () => {
    printData(history, COLUMNS, { title: 'Coin Flip History' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(history, COLUMNS, 'tab');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Circle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.coinFlipper.coinFlipper', 'Coin Flipper')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.coinFlipper.flipAVirtualCoinFor', 'Flip a virtual coin for quick decisions')}</p>
            </div>
          </div>
          {history.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
            {t('tools.coinFlipper.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Coin Display */}
        <div className="flex justify-center">
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-xl transition-all duration-300 ${
              isFlipping ? 'animate-spin' : ''
            } ${
              result === 'heads'
                ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                : result === 'tails'
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : isDark
                ? 'bg-gray-700'
                : 'bg-gray-200'
            }`}
            style={{ animationDuration: '0.15s' }}
          >
            {result === 'heads' ? '👑' : result === 'tails' ? '🦅' : '🪙'}
          </div>
        </div>

        {/* Result Text */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {result ? result.toUpperCase() : 'Ready to Flip'}
          </div>
        </div>

        {/* Single Flip Button */}
        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-yellow-500/30"
        >
          {isFlipping ? t('tools.coinFlipper.flipping', '🪙 Flipping...') : t('tools.coinFlipper.flipCoin', 'Flip Coin')}
        </button>

        {/* Multiple Flips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.coinFlipper.flipMultipleCoins', 'Flip Multiple Coins')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={flipCount}
              onChange={(e) => setFlipCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button
              onClick={flipMultiple}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Flip {flipCount}
            </button>
          </div>
        </div>

        {/* Statistics */}
        {history.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-100'} border`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                {t('tools.coinFlipper.statistics', 'Statistics')}
              </h4>
              <button
                onClick={() => setHistory([])}
                className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <RotateCcw className="w-3 h-3" />
                {t('tools.coinFlipper.reset', 'Reset')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.coinFlipper.totalFlips', 'Total Flips')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {stats.heads}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.coinFlipper.heads', 'Heads')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">
                  {stats.tails}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.coinFlipper.tails', 'Tails')}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-300"
                style={{ width: `${headsPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-yellow-500">{headsPercentage.toFixed(1)}% Heads</span>
              <span className="text-gray-500">{(100 - headsPercentage).toFixed(1)}% Tails</span>
            </div>
          </div>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <History className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.coinFlipper.recentFlips', 'Recent Flips')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 20).map((flip, idx) => (
                <span
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    flip.result === 'heads'
                      ? 'bg-yellow-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {flip.result === 'heads' ? 'H' : 'T'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.coinFlipper.funFact', 'Fun Fact:')}</strong> A fair coin has exactly 50% chance for heads or tails.
            Over many flips, the results should approach this ratio!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipperTool;
