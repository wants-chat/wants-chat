import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Users, History, Calculator, RotateCcw, Plus, Minus, Trophy, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type GameType = '301' | '501' | 'cricket';

interface Player {
  id: number;
  name: string;
  score: number;
  turns: Turn[];
  cricketScores: Record<number, number>; // For cricket: 15-20 and bull
}

interface Turn {
  darts: Dart[];
  total: number;
}

interface Dart {
  value: number;
  multiplier: 1 | 2 | 3; // single, double, triple
}

interface CheckoutOption {
  darts: string[];
  total: number;
}

// Syncable game record for backend persistence
interface GameRecord {
  id: string;
  gameType: GameType;
  players: Player[];
  currentPlayerIndex: number;
  winnerId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'playerName', header: 'Player', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'turnsPlayed', header: 'Turns Played', type: 'number' },
  { key: 'totalPoints', header: 'Total Points Scored', type: 'number' },
  { key: 'averagePerTurn', header: 'Average Per Turn', type: 'number' },
  { key: 'highestTurn', header: 'Highest Turn', type: 'number' },
  { key: 'cricketProgress', header: 'Cricket Progress', type: 'string' },
  { key: 'gameType', header: 'Game Type', type: 'string' },
];

interface DartsScoreToolProps {
  uiConfig?: UIConfig;
}

export const DartsScoreTool: React.FC<DartsScoreToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gameType, setGameType] = useState<GameType>('501');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: gameRecords,
    setData: setGameRecords,
    addItem: addGameRecord,
    updateItem: updateGameRecord,
    deleteItem: deleteGameRecord,
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
  } = useToolData<GameRecord>('darts-score', [], COLUMNS);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        gameType?: GameType;
      };
      if (params.gameType) setGameType(params.gameType);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Current game state (local state for active game)
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', score: 501, turns: [], cricketScores: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 } },
    { id: 2, name: 'Player 2', score: 501, turns: [], cricketScores: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 } },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentDarts, setCurrentDarts] = useState<Dart[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<1 | 2 | 3>(1);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Helper function to check if a player has won
  const isGameWon = (player: Player): boolean => {
    if (gameType === 'cricket') {
      return Object.values(player.cricketScores).every(v => v >= 3);
    }
    return player.score === 0;
  };

  // Load the most recent game from records on mount
  useEffect(() => {
    if (!isLoading && gameRecords.length > 0) {
      const mostRecent = gameRecords[gameRecords.length - 1];
      setGameType(mostRecent.gameType);
      setPlayers(mostRecent.players);
      setCurrentPlayerIndex(mostRecent.currentPlayerIndex);
      setCurrentGameId(mostRecent.id);
    }
  }, [isLoading, gameRecords.length]);

  // Save current game state to backend when game state changes
  useEffect(() => {
    if (isLoading) return;

    const winner = players.find(p => isGameWon(p));
    const gameData: Omit<GameRecord, 'id' | 'createdAt'> = {
      gameType,
      players,
      currentPlayerIndex,
      winnerId: winner?.id || null,
      updatedAt: new Date().toISOString(),
    };

    if (currentGameId) {
      // Update existing game record
      updateGameRecord(currentGameId, gameData);
    } else if (players.some(p => p.turns.length > 0)) {
      // Create new game record when first turn is played
      const newId = Date.now().toString();
      const newRecord: GameRecord = {
        id: newId,
        ...gameData,
        createdAt: new Date().toISOString(),
      };
      addGameRecord(newRecord);
      setCurrentGameId(newId);
    }
  }, [players, gameType, currentPlayerIndex]);

  const startingScore = gameType === '301' ? 301 : gameType === '501' ? 501 : 0;
  const currentPlayer = players[currentPlayerIndex];

  // Checkout calculations for common finishes
  const checkoutOptions = useMemo((): CheckoutOption[] => {
    if (gameType === 'cricket') return [];
    const remaining = currentPlayer.score;
    if (remaining > 170 || remaining < 2) return [];

    const checkouts: CheckoutOption[] = [];

    // Common checkout combinations (must finish on a double)
    const doubles = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50];
    const singles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
    const triples = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60];

    // One dart checkouts
    if (doubles.includes(remaining)) {
      checkouts.push({ darts: [`D${remaining / 2}`], total: remaining });
    }

    // Two dart checkouts
    for (const d of doubles) {
      const need = remaining - d;
      if (need > 0 && need <= 60) {
        if (singles.includes(need)) {
          checkouts.push({ darts: [`${need}`, `D${d / 2}`], total: remaining });
        }
        if (triples.includes(need) && need <= 60) {
          checkouts.push({ darts: [`T${need / 3}`, `D${d / 2}`], total: remaining });
        }
      }
    }

    // Three dart checkouts (simplified - just show a few common ones)
    if (remaining === 170) checkouts.push({ darts: ['T20', 'T20', 'Bull'], total: 170 });
    if (remaining === 167) checkouts.push({ darts: ['T20', 'T19', 'Bull'], total: 167 });
    if (remaining === 164) checkouts.push({ darts: ['T20', 'T18', 'Bull'], total: 164 });
    if (remaining === 161) checkouts.push({ darts: ['T20', 'T17', 'Bull'], total: 161 });
    if (remaining === 160) checkouts.push({ darts: ['T20', 'T20', 'D20'], total: 160 });
    if (remaining === 158) checkouts.push({ darts: ['T20', 'T20', 'D19'], total: 158 });

    return checkouts.slice(0, 3); // Show top 3 options
  }, [currentPlayer.score, gameType]);

  const handleStartGame = () => {
    const newScore = gameType === '301' ? 301 : gameType === '501' ? 501 : 0;
    setPlayers(players.map(p => ({
      ...p,
      score: newScore,
      turns: [],
      cricketScores: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 },
    })));
    setCurrentPlayerIndex(0);
    setCurrentDarts([]);
    // Reset game ID so a new game record will be created
    setCurrentGameId(null);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, {
        id: Date.now(),
        name: newPlayerName.trim(),
        score: startingScore,
        turns: [],
        cricketScores: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 },
      }]);
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (id: number) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
      if (currentPlayerIndex >= players.length - 1) {
        setCurrentPlayerIndex(0);
      }
    }
  };

  const handleAddDart = () => {
    if (selectedValue !== null && currentDarts.length < 3) {
      const newDart: Dart = { value: selectedValue, multiplier: selectedMultiplier };
      setCurrentDarts([...currentDarts, newDart]);
      setSelectedValue(null);
      setSelectedMultiplier(1);
    }
  };

  const handleRemoveLastDart = () => {
    setCurrentDarts(currentDarts.slice(0, -1));
  };

  const handleEndTurn = () => {
    const turnTotal = currentDarts.reduce((sum, d) => sum + (d.value * d.multiplier), 0);
    const newTurn: Turn = { darts: [...currentDarts], total: turnTotal };

    if (gameType === 'cricket') {
      // Cricket scoring logic
      const updatedPlayers = [...players];
      const player = { ...updatedPlayers[currentPlayerIndex] };
      const newCricketScores = { ...player.cricketScores };

      currentDarts.forEach(dart => {
        const cricketNumbers = [15, 16, 17, 18, 19, 20, 25];
        if (cricketNumbers.includes(dart.value)) {
          newCricketScores[dart.value] = Math.min(3, newCricketScores[dart.value] + dart.multiplier);
        }
      });

      player.cricketScores = newCricketScores;
      player.turns = [...player.turns, newTurn];
      updatedPlayers[currentPlayerIndex] = player;
      setPlayers(updatedPlayers);
    } else {
      // 301/501 scoring logic
      const updatedPlayers = [...players];
      const player = { ...updatedPlayers[currentPlayerIndex] };
      const newScore = player.score - turnTotal;

      // Check for bust (went below 0 or to 1, or didn't finish on double)
      if (newScore < 0 || newScore === 1) {
        // Bust - score doesn't change
        player.turns = [...player.turns, { darts: currentDarts, total: 0 }];
      } else if (newScore === 0) {
        // Check if last dart was a double
        const lastDart = currentDarts[currentDarts.length - 1];
        if (lastDart && lastDart.multiplier === 2) {
          player.score = 0;
          player.turns = [...player.turns, newTurn];
        } else {
          // Bust - didn't finish on double
          player.turns = [...player.turns, { darts: currentDarts, total: 0 }];
        }
      } else {
        player.score = newScore;
        player.turns = [...player.turns, newTurn];
      }

      updatedPlayers[currentPlayerIndex] = player;
      setPlayers(updatedPlayers);
    }

    setCurrentDarts([]);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const getDartDisplay = (dart: Dart): string => {
    if (dart.value === 25) {
      return dart.multiplier === 2 ? 'Bull' : 'OB';
    }
    const prefix = dart.multiplier === 3 ? 'T' : dart.multiplier === 2 ? 'D' : '';
    return `${prefix}${dart.value}`;
  };

  const getCurrentTurnTotal = () => {
    return currentDarts.reduce((sum, d) => sum + (d.value * d.multiplier), 0);
  };

  const getCricketMark = (marks: number): string => {
    if (marks === 0) return '';
    if (marks === 1) return '/';
    if (marks === 2) return 'X';
    return 'O';
  };

  const winner = players.find(p => isGameWon(p));

  // Transform players data for export using useMemo for performance
  const exportableData = useMemo(() => {
    return players.map(player => {
      const totalPointsScored = player.turns.reduce((sum, turn) => sum + turn.total, 0);
      const turnsPlayed = player.turns.length;
      const averagePerTurn = turnsPlayed > 0 ? Math.round((totalPointsScored / turnsPlayed) * 10) / 10 : 0;
      const highestTurn = player.turns.length > 0
        ? Math.max(...player.turns.map(t => t.total))
        : 0;
      const cricketProgress = gameType === 'cricket'
        ? Object.entries(player.cricketScores)
            .map(([num, marks]) => `${num}:${marks}`)
            .join(', ')
        : 'N/A';

      return {
        id: player.id.toString(),
        playerName: player.name,
        score: player.score,
        turnsPlayed,
        totalPoints: totalPointsScored,
        averagePerTurn,
        highestTurn,
        cricketProgress,
        gameType: gameType.toUpperCase(),
      };
    });
  }, [players, gameType]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg"><Target className="w-5 h-5 text-red-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dartsScore.dartsScoreTracker', 'Darts Score Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dartsScore.track301501OrCricket', 'Track 301, 501, or Cricket games')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="darts-score" toolName="Darts Score" />

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
              onExportCSV={() => exportCSV({ filename: 'darts-scores' })}
              onExportExcel={() => exportExcel({ filename: 'darts-scores' })}
              onExportJSON={() => exportJSON({ filename: 'darts-scores' })}
              onExportPDF={() => exportPDF({
                filename: 'darts-scores',
                title: 'Darts Score Report',
                subtitle: `Game Type: ${gameType.toUpperCase()}`
              })}
              onPrint={() => print('Darts Score Report')}
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
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.dartsScore.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Game Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(['301', '501', 'cricket'] as GameType[]).map((type) => (
            <button
              key={type}
              onClick={() => setGameType(type)}
              className={`py-2 px-3 rounded-lg text-sm font-medium ${gameType === type ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border text-center`}>
            <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {winner.name} Wins!
            </div>
            <button
              onClick={handleStartGame}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
            >
              {t('tools.dartsScore.newGame', 'New Game')}
            </button>
          </div>
        )}

        {/* Players Management */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-red-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dartsScore.players', 'Players')}</span>
          </div>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === currentPlayerIndex
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : isDark ? 'bg-gray-700' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => {
                      const updatedPlayers = [...players];
                      updatedPlayers[index].name = e.target.value;
                      setPlayers(updatedPlayers);
                    }}
                    className={`bg-transparent border-none font-medium ${isDark ? 'text-white' : 'text-gray-900'} w-24`}
                  />
                  {gameType !== 'cricket' ? (
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {player.score}
                    </span>
                  ) : (
                    <div className="flex gap-1">
                      {[20, 19, 18, 17, 16, 15, 25].map(num => (
                        <span
                          key={num}
                          className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                            player.cricketScores[num] >= 3
                              ? 'bg-green-500 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {getCricketMark(player.cricketScores[num])}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {players.length > 1 && (
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Minus className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder={t('tools.dartsScore.addPlayer', 'Add player...')}
              className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={handleAddPlayer}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Turn */}
        {!winner && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentPlayer.name}'s Turn
              </h4>
              <span className="text-red-500 font-bold text-xl">
                {getCurrentTurnTotal()} pts
              </span>
            </div>

            {/* Current Darts */}
            <div className="flex gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold ${
                    currentDarts[i]
                      ? 'bg-red-500 text-white'
                      : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentDarts[i] ? getDartDisplay(currentDarts[i]) : '-'}
                </div>
              ))}
            </div>

            {/* Value Selection */}
            <div className="mb-3">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.dartsScore.selectValue', 'Select Value')}
              </label>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25].map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedValue(val)}
                    className={`py-2 rounded text-sm font-medium ${
                      selectedValue === val
                        ? 'bg-red-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {val === 25 ? 'B' : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Selection */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.dartsScore.multiplier', 'Multiplier')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMultiplier(1)}
                  className={`py-2 rounded-lg font-medium ${
                    selectedMultiplier === 1
                      ? 'bg-red-500 text-white'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('tools.dartsScore.single', 'Single')}
                </button>
                <button
                  onClick={() => setSelectedMultiplier(2)}
                  className={`py-2 rounded-lg font-medium ${
                    selectedMultiplier === 2
                      ? 'bg-red-500 text-white'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('tools.dartsScore.double', 'Double')}
                </button>
                <button
                  onClick={() => setSelectedMultiplier(3)}
                  disabled={selectedValue === 25}
                  className={`py-2 rounded-lg font-medium ${
                    selectedMultiplier === 3
                      ? 'bg-red-500 text-white'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  } ${selectedValue === 25 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('tools.dartsScore.triple', 'Triple')}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddDart}
                disabled={selectedValue === null || currentDarts.length >= 3}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {t('tools.dartsScore.addDart', 'Add Dart')}
              </button>
              <button
                onClick={handleRemoveLastDart}
                disabled={currentDarts.length === 0}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleEndTurn}
                disabled={currentDarts.length === 0}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {t('tools.dartsScore.endTurn', 'End Turn')}
              </button>
            </div>
          </div>
        )}

        {/* Checkout Calculator */}
        {gameType !== 'cricket' && checkoutOptions.length > 0 && !winner && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dartsScore.checkoutOptions', 'Checkout Options')}</span>
            </div>
            <div className="space-y-2">
              {checkoutOptions.map((option, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <div className="flex gap-2">
                    {option.darts.map((dart, j) => (
                      <span
                        key={j}
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          dart.startsWith('D') ? 'bg-green-500/20 text-green-500' :
                          dart.startsWith('T') ? 'bg-red-500/20 text-red-500' :
                          isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {dart}
                      </span>
                    ))}
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    = {option.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turn History */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 w-full"
          >
            <History className="w-4 h-4 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dartsScore.turnHistory', 'Turn History')}</span>
            <span className={`ml-auto text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {showHistory ? t('tools.dartsScore.hide', 'Hide') : t('tools.dartsScore.show', 'Show')}
            </span>
          </button>
          {showHistory && (
            <div className="mt-3 space-y-3">
              {players.map(player => (
                <div key={player.id}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {player.name}
                  </div>
                  <div className="space-y-1">
                    {player.turns.length === 0 ? (
                      <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.dartsScore.noTurnsYet', 'No turns yet')}</div>
                    ) : (
                      player.turns.slice(-5).map((turn, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          <div className="flex gap-1">
                            {turn.darts.map((dart, j) => (
                              <span key={j} className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {getDartDisplay(dart)}
                              </span>
                            ))}
                          </div>
                          <span className={turn.total === 0 ? 'text-red-500' : ''}>
                            {turn.total === 0 ? 'BUST' : `+${turn.total}`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset Game Button */}
        <button
          onClick={handleStartGame}
          className={`w-full py-3 rounded-lg font-medium ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          {t('tools.dartsScore.newGame2', 'New Game')}
        </button>
      </div>
    </div>
  );
};

export default DartsScoreTool;
