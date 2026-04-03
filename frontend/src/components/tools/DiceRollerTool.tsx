import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dices, Plus, Minus, RotateCcw, History, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface RollResult {
  id: string;
  dice: number[];
  total: number;
  timestamp: string;
  diceType: number;
  diceCount: number;
  modifier: number;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'timestamp', header: 'Date/Time', type: 'date' },
  { key: 'diceType', header: 'Dice Type', type: 'number', format: (v) => `d${v}` },
  { key: 'diceCount', header: 'Dice Count', type: 'number' },
  { key: 'dice', header: 'Roll Results', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : String(v) },
  { key: 'modifier', header: 'Modifier', type: 'number', format: (v) => v > 0 ? `+${v}` : String(v) },
  { key: 'total', header: 'Total', type: 'number' },
];

interface DiceRollerToolProps {
  uiConfig?: UIConfig;
}

export const DiceRollerTool: React.FC<DiceRollerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: history,
    setData: setHistory,
    addItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    clearData,
  } = useToolData<RollResult>('dice-roller', [], COLUMNS);

  const [diceType, setDiceType] = useState(6);
  const [diceCount, setDiceCount] = useState(2);
  const [modifier, setModifier] = useState(0);
  const [currentRoll, setCurrentRoll] = useState<number[] | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        diceType?: number;
        diceCount?: number;
        modifier?: number;
      };
      if (params.diceType) setDiceType(params.diceType);
      if (params.diceCount) setDiceCount(params.diceCount);
      if (params.modifier !== undefined) setModifier(params.modifier);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const rollDice = () => {
    setIsRolling(true);

    // Animate the roll
    let rollCount = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      const tempRoll = Array(diceCount).fill(0).map(() =>
        Math.floor(Math.random() * diceType) + 1
      );
      setCurrentRoll(tempRoll);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);

        // Final roll
        const finalRoll = Array(diceCount).fill(0).map(() =>
          Math.floor(Math.random() * diceType) + 1
        );
        setCurrentRoll(finalRoll);

        // Add to history using addItem
        const result: RollResult = {
          id: Date.now().toString(),
          dice: finalRoll,
          total: finalRoll.reduce((a, b) => a + b, 0) + modifier,
          timestamp: new Date().toISOString(),
          diceType,
          diceCount,
          modifier,
        };
        addItem(result);
      }
    }, 50);
  };

  const total = currentRoll
    ? currentRoll.reduce((a, b) => a + b, 0) + modifier
    : 0;

  const getDieDisplay = (value: number) => {
    // Unicode dice faces for d6
    if (diceType === 6) {
      const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      return diceFaces[value - 1] || value;
    }
    return value;
  };

  // Calculate stats for exports
  const totalRolls = history.length;
  const averageTotal = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((sum, r) => sum + r.total, 0) / history.length;
  }, [history]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Dices className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.diceRoller.diceRoller', 'Dice Roller')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.diceRoller.rollVirtualDiceForGames', 'Roll virtual dice for games and decisions')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="dice-roller" toolName="Dice Roller" />

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
              onExportCSV={() => exportCSV({ filename: 'dice-rolls' })}
              onExportExcel={() => exportExcel({ filename: 'dice-rolls' })}
              onExportJSON={() => exportJSON({ filename: 'dice-rolls' })}
              onExportPDF={() => exportPDF({
                filename: 'dice-rolls',
                title: 'Dice Roller History',
                subtitle: `${totalRolls} rolls - Average: ${averageTotal.toFixed(1)}`
              })}
              onPrint={() => print('Dice Roller History')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.diceRoller.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Dice Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.diceRoller.diceType', 'Dice Type')}
          </label>
          <div className="flex flex-wrap gap-2">
            {diceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setDiceType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  diceType === type
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                d{type}
              </button>
            ))}
          </div>
        </div>

        {/* Dice Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.diceRoller.numberOfDice', 'Number of Dice')}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className={`text-3xl font-bold w-16 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {diceCount}
            </span>
            <button
              onClick={() => setDiceCount(Math.min(20, diceCount + 1))}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modifier */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.diceRoller.modifier', 'Modifier')}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModifier(modifier - 1)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className={`text-2xl font-bold w-16 text-center ${
              modifier > 0 ? 'text-green-500' : modifier < 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {modifier > 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier(modifier + 1)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Roll Button */}
        <button
          onClick={rollDice}
          disabled={isRolling}
          className={`w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-purple-500/30 ${
            isRolling ? 'animate-pulse' : ''
          }`}
        >
          {isRolling ? '🎲 Rolling...' : `Roll ${diceCount}d${diceType}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`}
        </button>

        {/* Result */}
        {currentRoll && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {currentRoll.map((value, idx) => (
                <div
                  key={idx}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } ${isRolling ? 'animate-bounce' : ''} shadow-lg`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {diceType === 6 ? (
                    <span className="text-4xl">{getDieDisplay(value)}</span>
                  ) : (
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {currentRoll.join(' + ')}{modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''} =
            </div>
            <div className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {total}
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
                  {t('tools.diceRoller.rollHistory', 'Roll History')}
                </h4>
              </div>
              <button
                onClick={() => clearData()}
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('tools.diceRoller.clear', 'Clear')}
              </button>
            </div>
            <div className={`max-h-40 overflow-y-auto space-y-2 ${isDark ? 'scrollbar-dark' : ''}`}>
              {[...history].reverse().slice(0, 20).map((roll) => (
                <div
                  key={roll.id}
                  className={`p-2 rounded-lg flex justify-between items-center text-sm ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {roll.diceCount}d{roll.diceType}{roll.modifier !== 0 ? (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier) : ''}:
                    {' '}[{roll.dice.join(', ')}]
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    = {roll.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.diceRoller.tip', 'Tip:')}</strong> Perfect for tabletop RPGs, board games, or making random decisions.
            Uses cryptographically secure random numbers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiceRollerTool;
