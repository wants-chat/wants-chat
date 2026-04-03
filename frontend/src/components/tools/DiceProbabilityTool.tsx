import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dices, BarChart2, RefreshCw, Sparkles } from 'lucide-react';
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

interface RollResult {
  dice: number[];
  total: number;
}

interface DiceProbabilityToolProps {
  uiConfig?: UIConfig;
}

export const DiceProbabilityTool: React.FC<DiceProbabilityToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [numDice, setNumDice] = useState(2);
  const [dieSides, setDieSides] = useState(6);
  const [modifier, setModifier] = useState(0);
  const [targetNumber, setTargetNumber] = useState(7);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<number[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        numDice?: number;
        dieSides?: number;
        modifier?: number;
        targetNumber?: number;
      };
      if (params.numDice) setNumDice(params.numDice);
      if (params.dieSides) setDieSides(params.dieSides);
      if (params.modifier !== undefined) setModifier(params.modifier);
      if (params.targetNumber) setTargetNumber(params.targetNumber);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const diceOptions = [4, 6, 8, 10, 12, 20, 100];

  // Column configuration for export
  const COLUMNS: ColumnConfig[] = [
    { key: 'roll', header: 'Roll Result' },
    { key: 'timestamp', header: 'Timestamp', type: 'date' },
    { key: 'hitTarget', header: 'Hit Target' },
  ];

  const statistics = useMemo(() => {
    const minRoll = numDice + modifier;
    const maxRoll = numDice * dieSides + modifier;
    const avgRoll = numDice * ((dieSides + 1) / 2) + modifier;

    // Calculate probability distribution
    const distribution: Record<number, number> = {};
    const totalOutcomes = Math.pow(dieSides, numDice);

    // For small numbers of dice, calculate exact probabilities
    if (numDice <= 4) {
      const countWays = (target: number, diceLeft: number): number => {
        if (diceLeft === 0) return target === 0 ? 1 : 0;
        let ways = 0;
        for (let face = 1; face <= dieSides; face++) {
          if (target - face >= 0) {
            ways += countWays(target - face, diceLeft - 1);
          }
        }
        return ways;
      };

      for (let sum = numDice; sum <= numDice * dieSides; sum++) {
        const ways = countWays(sum, numDice);
        distribution[sum + modifier] = ways / totalOutcomes;
      }
    }

    // Calculate probability of hitting target or higher
    let probAtLeast = 0;
    let probExact = 0;
    if (numDice <= 4) {
      Object.entries(distribution).forEach(([sum, prob]) => {
        const numSum = parseInt(sum);
        if (numSum >= targetNumber) probAtLeast += prob;
        if (numSum === targetNumber) probExact = prob;
      });
    } else {
      // Approximate for more dice using central limit theorem
      const variance = numDice * ((dieSides * dieSides - 1) / 12);
      const stdDev = Math.sqrt(variance);
      // Simple approximation
      const zScore = (targetNumber - modifier - avgRoll + modifier) / stdDev;
      probAtLeast = 1 - 0.5 * (1 + Math.sign(zScore) * Math.sqrt(1 - Math.exp(-2 * zScore * zScore / Math.PI)));
      if (isNaN(probAtLeast)) probAtLeast = 0;
    }

    return {
      minRoll,
      maxRoll,
      avgRoll,
      distribution,
      probAtLeast: Math.max(0, Math.min(1, probAtLeast)) * 100,
      probExact: probExact * 100,
    };
  }, [numDice, dieSides, modifier, targetNumber]);

  const rollDice = () => {
    const dice: number[] = [];
    for (let i = 0; i < numDice; i++) {
      dice.push(Math.floor(Math.random() * dieSides) + 1);
    }
    const total = dice.reduce((sum, d) => sum + d, 0) + modifier;
    setLastRoll({ dice, total });
    setRollHistory((prev) => [total, ...prev].slice(0, 20));
  };

  const clearHistory = () => {
    setRollHistory([]);
    setLastRoll(null);
  };

  const historyStats = useMemo(() => {
    if (rollHistory.length === 0) return null;
    const avg = rollHistory.reduce((sum, r) => sum + r, 0) / rollHistory.length;
    const max = Math.max(...rollHistory);
    const min = Math.min(...rollHistory);
    const atLeastTarget = rollHistory.filter((r) => r >= targetNumber).length;
    return { avg, max, min, atLeastTarget, total: rollHistory.length };
  }, [rollHistory, targetNumber]);

  const getDieEmoji = (sides: number): string => {
    const emojis: Record<number, string> = {
      4: '🔺',
      6: '🎲',
      8: '◆',
      10: '⬡',
      12: '⬢',
      20: '🔷',
      100: '%',
    };
    return emojis[sides] || '🎲';
  };

  // Export handlers
  const exportData = rollHistory.map((roll, idx) => ({
    roll,
    timestamp: new Date().toISOString(),
    hitTarget: roll >= targetNumber ? 'Yes' : 'No',
  }));

  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'dice_rolls' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'dice_rolls' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'dice_rolls' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'dice_rolls',
      title: `Dice Roll History (${numDice}d${dieSides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''})`,
      subtitle: `Target: ${targetNumber}`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, {
      title: `Dice Roll History (${numDice}d${dieSides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''})`,
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, COLUMNS, 'tab');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg"><Dices className="w-5 h-5 text-red-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.diceProbability.diceProbabilityCalculator', 'Dice Probability Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.diceProbability.calculateOddsForAnyDice', 'Calculate odds for any dice combination')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            disabled={rollHistory.length === 0}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.diceProbability.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Dice Configuration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.diceProbability.numberOfDice', 'Number of Dice')}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNumDice(Math.max(1, numDice - 1))}
                className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
              >
                -
              </button>
              <input
                type="number"
                value={numDice}
                onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-16 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={() => setNumDice(numDice + 1)}
                className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
              >
                +
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.diceProbability.dieType', 'Die Type')}</label>
            <select
              value={dieSides}
              onChange={(e) => setDieSides(parseInt(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {diceOptions.map((sides) => (
                <option key={sides} value={sides}>d{sides} {getDieEmoji(sides)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.diceProbability.modifier', 'Modifier')}</label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Dice Notation Display */}
        <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className={`text-4xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {numDice}d{dieSides}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
          </div>
          <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Range: {statistics.minRoll} - {statistics.maxRoll} | Average: {statistics.avgRoll.toFixed(1)}
          </div>
        </div>

        {/* Roll Button */}
        <button
          onClick={rollDice}
          className="w-full py-4 bg-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
        >
          <Dices className="w-5 h-5" /> Roll {numDice}d{dieSides}!
        </button>

        {/* Last Roll Result */}
        {lastRoll && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border text-center`}>
            <div className="flex justify-center gap-2 mb-2">
              {lastRoll.dice.map((die, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 shadow'}`}
                >
                  {die}
                </div>
              ))}
              {modifier !== 0 && (
                <>
                  <span className={`self-center text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{modifier > 0 ? '+' : ''}{modifier}</span>
                </>
              )}
            </div>
            <div className={`text-3xl font-bold text-red-500`}>= {lastRoll.total}</div>
            <div className={`text-sm ${lastRoll.total >= targetNumber ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {lastRoll.total >= targetNumber ? '✓ Hits target!' : `Below target (${targetNumber})`}
            </div>
          </div>
        )}

        {/* Target Probability */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.diceProbability.targetNumber', 'Target Number:')}</label>
            <input
              type="number"
              value={targetNumber}
              onChange={(e) => setTargetNumber(parseInt(e.target.value) || 0)}
              className={`w-24 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className={`grid grid-cols-2 gap-4`}>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>P(exactly {targetNumber})</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {numDice <= 4 ? statistics.probExact.toFixed(1) : '~'}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>P({targetNumber} or higher)</div>
              <div className={`text-2xl font-bold text-green-500`}>
                {statistics.probAtLeast.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Probability Distribution */}
        {numDice <= 4 && Object.keys(statistics.distribution).length <= 24 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-red-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.diceProbability.probabilityDistribution', 'Probability Distribution')}</h4>
            </div>
            <div className="flex items-end gap-1 h-32">
              {Object.entries(statistics.distribution).map(([sum, prob]) => {
                const numSum = parseInt(sum);
                const height = prob * 100 / Math.max(...Object.values(statistics.distribution)) * 100;
                return (
                  <div key={sum} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t ${numSum >= targetNumber ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ height: `${height}%` }}
                      title={`${sum}: ${(prob * 100).toFixed(1)}%`}
                    />
                    <span className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sum}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.diceProbability.rollHistory', 'Roll History')}</h4>
              <button onClick={clearHistory} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {rollHistory.map((roll, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-sm ${roll >= targetNumber ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {roll}
                </span>
              ))}
            </div>
            {historyStats && (
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg: {historyStats.avg.toFixed(1)} | Range: {historyStats.min}-{historyStats.max} |
                Hits ({targetNumber}+): {historyStats.atLeastTarget}/{historyStats.total} ({((historyStats.atLeastTarget / historyStats.total) * 100).toFixed(0)}%)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceProbabilityTool;
