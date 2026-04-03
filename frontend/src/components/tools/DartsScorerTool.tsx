import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Users, RotateCcw, Trophy, TrendingUp, Info, ChevronRight, ChevronLeft, Plus, Minus, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type GameType = 301 | 501 | 701;
type ScoreMultiplier = 'single' | 'double' | 'triple';

interface DartThrow {
  segment: number; // 1-20, 25 (outer bull), or 50 (bullseye)
  multiplier: ScoreMultiplier;
  points: number;
}

interface Turn {
  playerId: number;
  darts: DartThrow[];
  totalPoints: number;
  remainingAfter: number;
  isBust: boolean;
}

interface Player {
  id: number;
  name: string;
  score: number;
  turns: Turn[];
  checkouts: number;
  highestTurn: number;
}

interface GameStats {
  avgPerRound: number;
  highestTurn: number;
  checkoutPercentage: number;
  totalDarts: number;
}

// Game session for syncing to backend
interface GameSession {
  id: string;
  gameType: GameType;
  players: Player[];
  winner: string | null;
  completedAt: string;
  createdAt: string;
}

// Common checkout suggestions (double-out)
const CHECKOUT_SUGGESTIONS: Record<number, string[]> = {
  170: ['T20', 'T20', 'Bull'],
  167: ['T20', 'T19', 'Bull'],
  164: ['T20', 'T18', 'Bull'],
  161: ['T20', 'T17', 'Bull'],
  160: ['T20', 'T20', 'D20'],
  158: ['T20', 'T20', 'D19'],
  157: ['T20', 'T19', 'D20'],
  156: ['T20', 'T20', 'D18'],
  155: ['T20', 'T19', 'D19'],
  154: ['T20', 'T18', 'D20'],
  153: ['T20', 'T19', 'D18'],
  152: ['T20', 'T20', 'D16'],
  151: ['T20', 'T17', 'D20'],
  150: ['T20', 'T18', 'D18'],
  149: ['T20', 'T19', 'D16'],
  148: ['T20', 'T20', 'D14'],
  147: ['T20', 'T17', 'D18'],
  146: ['T20', 'T18', 'D16'],
  145: ['T20', 'T19', 'D14'],
  144: ['T20', 'T20', 'D12'],
  143: ['T20', 'T17', 'D16'],
  142: ['T20', 'T14', 'D20'],
  141: ['T20', 'T19', 'D12'],
  140: ['T20', 'T20', 'D10'],
  139: ['T20', 'T13', 'D20'],
  138: ['T20', 'T18', 'D12'],
  137: ['T20', 'T19', 'D10'],
  136: ['T20', 'T20', 'D8'],
  135: ['T20', 'T17', 'D12'],
  134: ['T20', 'T14', 'D16'],
  133: ['T20', 'T19', 'D8'],
  132: ['T20', 'T16', 'D12'],
  131: ['T20', 'T13', 'D16'],
  130: ['T20', 'T18', 'D8'],
  129: ['T19', 'T16', 'D12'],
  128: ['T18', 'T14', 'D16'],
  127: ['T20', 'T17', 'D8'],
  126: ['T19', 'T19', 'D6'],
  125: ['T20', 'T15', 'D10'],
  124: ['T20', 'T16', 'D8'],
  123: ['T19', 'T16', 'D9'],
  122: ['T18', 'T20', 'D4'],
  121: ['T20', 'T11', 'D14'],
  120: ['T20', 'S20', 'D20'],
  119: ['T19', 'T12', 'D13'],
  118: ['T20', 'S18', 'D20'],
  117: ['T20', 'S17', 'D20'],
  116: ['T20', 'S16', 'D20'],
  115: ['T19', 'S18', 'D20'],
  114: ['T20', 'S14', 'D20'],
  113: ['T19', 'S16', 'D20'],
  112: ['T20', 'S12', 'D20'],
  111: ['T19', 'S14', 'D20'],
  110: ['T20', 'S10', 'D20'],
  109: ['T20', 'S9', 'D20'],
  108: ['T20', 'S8', 'D20'],
  107: ['T19', 'S10', 'D20'],
  106: ['T20', 'S6', 'D20'],
  105: ['T20', 'S5', 'D20'],
  104: ['T18', 'S10', 'D20'],
  103: ['T19', 'S6', 'D20'],
  102: ['T20', 'S2', 'D20'],
  101: ['T17', 'S10', 'D20'],
  100: ['T20', 'D20'],
  99: ['T19', 'S10', 'D16'],
  98: ['T20', 'D19'],
  97: ['T19', 'D20'],
  96: ['T20', 'D18'],
  95: ['T19', 'D19'],
  94: ['T18', 'D20'],
  93: ['T19', 'D18'],
  92: ['T20', 'D16'],
  91: ['T17', 'D20'],
  90: ['T18', 'D18'],
  89: ['T19', 'D16'],
  88: ['T20', 'D14'],
  87: ['T17', 'D18'],
  86: ['T18', 'D16'],
  85: ['T15', 'D20'],
  84: ['T20', 'D12'],
  83: ['T17', 'D16'],
  82: ['T14', 'D20'],
  81: ['T19', 'D12'],
  80: ['T20', 'D10'],
  79: ['T13', 'D20'],
  78: ['T18', 'D12'],
  77: ['T19', 'D10'],
  76: ['T20', 'D8'],
  75: ['T17', 'D12'],
  74: ['T14', 'D16'],
  73: ['T19', 'D8'],
  72: ['T16', 'D12'],
  71: ['T13', 'D16'],
  70: ['T18', 'D8'],
  69: ['T19', 'D6'],
  68: ['T20', 'D4'],
  67: ['T17', 'D8'],
  66: ['T10', 'D18'],
  65: ['T19', 'D4'],
  64: ['T16', 'D8'],
  63: ['T13', 'D12'],
  62: ['T10', 'D16'],
  61: ['T15', 'D8'],
  60: ['S20', 'D20'],
  59: ['S19', 'D20'],
  58: ['S18', 'D20'],
  57: ['S17', 'D20'],
  56: ['T16', 'D4'],
  55: ['S15', 'D20'],
  54: ['S14', 'D20'],
  53: ['S13', 'D20'],
  52: ['S12', 'D20'],
  51: ['S11', 'D20'],
  50: ['S10', 'D20'],
  49: ['S9', 'D20'],
  48: ['S8', 'D20'],
  47: ['S7', 'D20'],
  46: ['S6', 'D20'],
  45: ['S5', 'D20'],
  44: ['S4', 'D20'],
  43: ['S3', 'D20'],
  42: ['S10', 'D16'],
  41: ['S9', 'D16'],
  40: ['D20'],
  39: ['S7', 'D16'],
  38: ['D19'],
  37: ['S5', 'D16'],
  36: ['D18'],
  35: ['S3', 'D16'],
  34: ['D17'],
  33: ['S1', 'D16'],
  32: ['D16'],
  31: ['S7', 'D12'],
  30: ['D15'],
  29: ['S5', 'D12'],
  28: ['D14'],
  27: ['S3', 'D12'],
  26: ['D13'],
  25: ['S9', 'D8'],
  24: ['D12'],
  23: ['S7', 'D8'],
  22: ['D11'],
  21: ['S5', 'D8'],
  20: ['D10'],
  19: ['S3', 'D8'],
  18: ['D9'],
  17: ['S1', 'D8'],
  16: ['D8'],
  15: ['S7', 'D4'],
  14: ['D7'],
  13: ['S5', 'D4'],
  12: ['D6'],
  11: ['S3', 'D4'],
  10: ['D5'],
  9: ['S1', 'D4'],
  8: ['D4'],
  7: ['S3', 'D2'],
  6: ['D3'],
  5: ['S1', 'D2'],
  4: ['D2'],
  3: ['S1', 'D1'],
  2: ['D1'],
};

interface DartsScorerToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports - for player statistics
const PLAYER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Player', type: 'string' },
  { key: 'score', header: 'Remaining Score', type: 'number' },
  { key: 'turnsPlayed', header: 'Turns Played', type: 'number' },
  { key: 'totalDarts', header: 'Total Darts', type: 'number' },
  { key: 'avgPerRound', header: 'Avg Per Round', type: 'number' },
  { key: 'highestTurn', header: 'Highest Turn', type: 'number' },
  { key: 'checkouts', header: 'Checkouts', type: 'number' },
  { key: 'checkoutPercentage', header: 'Checkout %', type: 'number' },
];

// Column configuration for game session sync
const SESSION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Game ID', type: 'string' },
  { key: 'gameType', header: 'Game Type', type: 'number' },
  { key: 'winner', header: 'Winner', type: 'string' },
  { key: 'playerCount', header: 'Players', type: 'number' },
  { key: 'completedAt', header: 'Completed', type: 'date' },
  { key: 'createdAt', header: 'Started', type: 'date' },
];

export const DartsScorerTool: React.FC<DartsScorerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Use the useToolData hook for backend persistence of game sessions
  const {
    data: gameSessions,
    addItem: addGameSession,
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
  } = useToolData<GameSession>('darts-scorer', [], SESSION_COLUMNS);

  // Game setup state
  const [gameType, setGameType] = useState<GameType>(501);
  const [playerCount, setPlayerCount] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        gameType?: GameType;
        playerCount?: number;
      };
      if (params.gameType) setGameType(params.gameType);
      if (params.playerCount) setPlayerCount(params.playerCount);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  // Players state
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Current turn state
  const [currentDarts, setCurrentDarts] = useState<DartThrow[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<ScoreMultiplier>('single');

  // UI state
  const [showRules, setShowRules] = useState(false);

  const segments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const initializeGame = () => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i + 1}`,
        score: gameType,
        turns: [],
        checkouts: 0,
        highestTurn: 0,
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setCurrentDarts([]);
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setCurrentGameId(Date.now().toString());
  };

  const calculateDartPoints = (segment: number, multiplier: ScoreMultiplier): number => {
    if (segment === 25) return multiplier === 'double' ? 50 : 25; // Bull
    if (segment === 50) return 50; // Bullseye (always 50)

    switch (multiplier) {
      case 'double':
        return segment * 2;
      case 'triple':
        return segment * 3;
      default:
        return segment;
    }
  };

  const addDart = () => {
    if (selectedSegment === null || currentDarts.length >= 3) return;

    const points = calculateDartPoints(selectedSegment, selectedMultiplier);
    const newDart: DartThrow = {
      segment: selectedSegment,
      multiplier: selectedMultiplier,
      points,
    };

    setCurrentDarts([...currentDarts, newDart]);
    setSelectedSegment(null);
    setSelectedMultiplier('single');
  };

  const removeDart = (index: number) => {
    const newDarts = currentDarts.filter((_, i) => i !== index);
    setCurrentDarts(newDarts);
  };

  const getCurrentTurnTotal = (): number => {
    return currentDarts.reduce((sum, dart) => sum + dart.points, 0);
  };

  const getCheckoutSuggestion = (remaining: number): string[] | null => {
    if (remaining > 170 || remaining < 2) return null;
    return CHECKOUT_SUGGESTIONS[remaining] || null;
  };

  const isValidFinish = (remaining: number, lastDart: DartThrow): boolean => {
    // Must finish on a double (or bullseye which counts as double)
    if (remaining !== 0) return false;
    return lastDart.multiplier === 'double' || lastDart.segment === 50;
  };

  const endTurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    const turnTotal = getCurrentTurnTotal();
    const potentialRemaining = currentPlayer.score - turnTotal;
    const lastDart = currentDarts[currentDarts.length - 1];

    let isBust = false;
    let actualRemaining = currentPlayer.score;
    let isCheckout = false;

    // Check for bust conditions
    if (potentialRemaining < 0) {
      // Score goes below 0 - bust
      isBust = true;
    } else if (potentialRemaining === 0) {
      // Check if it's a valid checkout (must end on double)
      if (lastDart && isValidFinish(potentialRemaining, lastDart)) {
        actualRemaining = 0;
        isCheckout = true;
      } else {
        // Didn't finish on a double - bust
        isBust = true;
      }
    } else if (potentialRemaining === 1) {
      // Can't checkout from 1 (no double possible) - bust
      isBust = true;
    } else {
      // Valid score reduction
      actualRemaining = potentialRemaining;
    }

    const newTurn: Turn = {
      playerId: currentPlayer.id,
      darts: [...currentDarts],
      totalPoints: isBust ? 0 : turnTotal,
      remainingAfter: actualRemaining,
      isBust,
    };

    const updatedPlayers = players.map((player, index) => {
      if (index === currentPlayerIndex) {
        const newScore = isBust ? player.score : actualRemaining;
        const newHighest = Math.max(player.highestTurn, isBust ? 0 : turnTotal);
        return {
          ...player,
          score: newScore,
          turns: [...player.turns, newTurn],
          checkouts: isCheckout ? player.checkouts + 1 : player.checkouts,
          highestTurn: newHighest,
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);

    // Check for game over
    if (isCheckout) {
      setGameOver(true);
      const winningPlayer = updatedPlayers[currentPlayerIndex];
      setWinner(winningPlayer);

      // Save completed game session to backend
      if (currentGameId) {
        const gameSession: GameSession = {
          id: currentGameId,
          gameType,
          players: updatedPlayers,
          winner: winningPlayer.name,
          completedAt: new Date().toISOString(),
          createdAt: new Date(parseInt(currentGameId)).toISOString(),
        };
        addGameSession(gameSession);
      }
    } else {
      // Move to next player
      setCurrentPlayerIndex((currentPlayerIndex + 1) % playerCount);
    }

    setCurrentDarts([]);
  };

  const calculateStats = (player: Player): GameStats => {
    const turns = player.turns;
    if (turns.length === 0) {
      return {
        avgPerRound: 0,
        highestTurn: 0,
        checkoutPercentage: 0,
        totalDarts: 0,
      };
    }

    const totalPoints = turns.reduce((sum, turn) => sum + turn.totalPoints, 0);
    const totalDarts = turns.reduce((sum, turn) => sum + turn.darts.length, 0);
    const checkoutAttempts = turns.filter(t => {
      const remaining = t.remainingAfter + t.totalPoints;
      return remaining <= 170 && remaining >= 2;
    }).length;

    return {
      avgPerRound: totalPoints / turns.length,
      highestTurn: player.highestTurn,
      checkoutPercentage: checkoutAttempts > 0 ? (player.checkouts / checkoutAttempts) * 100 : 0,
      totalDarts,
    };
  };

  // Prepare export data from players (for current game stats)
  const getExportData = useMemo(() => {
    return players.map((player) => {
      const stats = calculateStats(player);
      return {
        name: player.name,
        score: player.score,
        turnsPlayed: player.turns.length,
        totalDarts: stats.totalDarts,
        avgPerRound: Math.round(stats.avgPerRound * 10) / 10,
        highestTurn: stats.highestTurn,
        checkouts: player.checkouts,
        checkoutPercentage: Math.round(stats.checkoutPercentage * 10) / 10,
      };
    });
  }, [players]);

  // Prepare game session export data (for history)
  const getSessionExportData = useMemo(() => {
    return gameSessions.map((session) => ({
      ...session,
      playerCount: session.players.length,
    }));
  }, [gameSessions]);

  // Export handlers - use hook's export functions for game history
  const handleExportCSV = () => {
    exportCSV({ filename: `darts_history` });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: `darts_history` });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: `darts_history` });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: `darts_history`,
      title: 'Darts Game History',
      subtitle: `${gameSessions.length} Games Played`,
    });
  };

  const handlePrint = () => {
    print('Darts Game History');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  const handleImportCSV = async (file: File) => {
    await importCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    await importJSON(file);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentDarts([]);
    setSelectedSegment(null);
    setSelectedMultiplier('single');
    setCurrentGameId(null);
  };

  const currentPlayer = useMemo(() => {
    return gameStarted && players.length > 0 ? players[currentPlayerIndex] : null;
  }, [gameStarted, players, currentPlayerIndex]);

  const checkoutSuggestion = useMemo(() => {
    if (!currentPlayer) return null;
    const remaining = currentPlayer.score - getCurrentTurnTotal();
    return getCheckoutSuggestion(remaining);
  }, [currentPlayer, currentDarts]);

  const formatDartThrow = (dart: DartThrow): string => {
    if (dart.segment === 50) return 'Bull';
    if (dart.segment === 25) return dart.multiplier === 'double' ? 'Bull' : 'OB';
    const prefix = dart.multiplier === 'double' ? 'D' : dart.multiplier === 'triple' ? 'T' : 'S';
    return `${prefix}${dart.segment}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dartsScorer.dartsScorer', 'Darts Scorer')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.dartsScorer.scoreYourDartsGamesWith', 'Score your darts games with double-out rules')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="darts-scorer" toolName="Darts Scorer" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={handleImportCSV}
                onImportJSON={handleImportJSON}
                theme={theme}
              />
            </div>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.dartsScorer.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
            </div>
          )}

          {!gameStarted ? (
            // Game Setup
            <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dartsScorer.gameSetup', 'Game Setup')}
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.dartsScorer.configureYourDartsGame', 'Configure your darts game')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Game Type Selection */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dartsScorer.gameType', 'Game Type')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([301, 501, 701] as GameType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setGameType(type)}
                        className={`py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                          gameType === type
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Count Selection */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dartsScorer.numberOfPlayers', 'Number of Players')}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                      disabled={playerCount <= 2}
                      className={`p-2 rounded-lg transition-colors ${
                        playerCount <= 2
                          ? 'opacity-50 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {playerCount}
                      </span>
                    </div>
                    <button
                      onClick={() => setPlayerCount(Math.min(4, playerCount + 1))}
                      disabled={playerCount >= 4}
                      className={`p-2 rounded-lg transition-colors ${
                        playerCount >= 4
                          ? 'opacity-50 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Start Game Button */}
                <button
                  onClick={initializeGame}
                  className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  {t('tools.dartsScorer.startGame', 'Start Game')}
                </button>
              </CardContent>
            </Card>
          ) : gameOver && winner ? (
            // Game Over Screen
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {winner.name} Wins!
              </h2>
              <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.dartsScorer.congratulationsOnTheCheckout', 'Congratulations on the checkout!')}
              </p>

              {/* Final Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {players.map((player) => {
                  const stats = calculateStats(player);
                  return (
                    <Card key={player.id} className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} ${player.id === winner.id ? 'ring-2 ring-yellow-500' : ''}`}>
                      <CardContent className="pt-4">
                        <div className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {player.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div>Avg: {stats.avgPerRound.toFixed(1)}</div>
                          <div>High: {stats.highestTurn}</div>
                          <div>Darts: {stats.totalDarts}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <button
                onClick={resetGame}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                {t('tools.dartsScorer.newGame', 'New Game')}
              </button>
            </div>
          ) : (
            // Active Game
            <>
              {/* Scoreboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {players.map((player, index) => (
                  <Card
                    key={player.id}
                    className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} ${
                      index === currentPlayerIndex ? 'ring-2 ring-[#0D9488]' : ''
                    }`}
                  >
                    <CardContent className="pt-4 text-center">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {player.name}
                      </div>
                      <div className={`text-4xl font-bold ${
                        index === currentPlayerIndex ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {player.score}
                      </div>
                      {index === currentPlayerIndex && (
                        <div className="mt-2">
                          <ChevronRight className="w-5 h-5 inline-block text-[#0D9488] animate-pulse" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Current Turn */}
              {currentPlayer && (
                <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currentPlayer.name}'s Turn
                    </CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Remaining: {currentPlayer.score - getCurrentTurnTotal()} | Turn Total: {getCurrentTurnTotal()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Current Darts Display */}
                    <div className="flex gap-4 mb-4">
                      {[0, 1, 2].map((dartIndex) => {
                        const dart = currentDarts[dartIndex];
                        return (
                          <div
                            key={dartIndex}
                            className={`flex-1 p-4 rounded-lg text-center ${
                              dart
                                ? 'bg-[#0D9488] text-white cursor-pointer hover:bg-[#0F766E]'
                                : theme === 'dark'
                                ? 'bg-gray-600 text-gray-400'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                            onClick={() => dart && removeDart(dartIndex)}
                          >
                            <div className="text-2xl font-bold">
                              {dart ? dart.points : '-'}
                            </div>
                            <div className="text-xs">
                              {dart ? formatDartThrow(dart) : `Dart ${dartIndex + 1}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Checkout Suggestion */}
                    {checkoutSuggestion && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-4 h-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                            Checkout: {checkoutSuggestion.join(' - ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Segment Selection */}
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.dartsScorer.selectSegment', 'Select Segment')}
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {segments.map((segment) => (
                          <button
                            key={segment}
                            onClick={() => setSelectedSegment(segment)}
                            className={`py-2 px-1 rounded-lg font-medium text-sm transition-colors ${
                              selectedSegment === segment
                                ? 'bg-[#0D9488] text-white'
                                : theme === 'dark'
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {segment}
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedSegment(25)}
                          className={`py-2 px-1 rounded-lg font-medium text-sm transition-colors ${
                            selectedSegment === 25
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t('tools.dartsScorer.ob', 'OB')}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSegment(50);
                            setSelectedMultiplier('double');
                          }}
                          className={`py-2 px-1 rounded-lg font-medium text-sm transition-colors ${
                            selectedSegment === 50
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t('tools.dartsScorer.bull', 'Bull')}
                        </button>
                      </div>
                    </div>

                    {/* Multiplier Selection */}
                    {selectedSegment !== null && selectedSegment !== 50 && (
                      <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.dartsScorer.multiplier', 'Multiplier')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => setSelectedMultiplier('single')}
                            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                              selectedMultiplier === 'single'
                                ? 'bg-[#0D9488] text-white'
                                : theme === 'dark'
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {t('tools.dartsScorer.single', 'Single')}
                          </button>
                          <button
                            onClick={() => setSelectedMultiplier('double')}
                            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                              selectedMultiplier === 'double'
                                ? 'bg-[#0D9488] text-white'
                                : theme === 'dark'
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {t('tools.dartsScorer.double', 'Double')}
                          </button>
                          {selectedSegment !== 25 && (
                            <button
                              onClick={() => setSelectedMultiplier('triple')}
                              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                                selectedMultiplier === 'triple'
                                  ? 'bg-[#0D9488] text-white'
                                  : theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {t('tools.dartsScorer.triple', 'Triple')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add Dart Button */}
                    {selectedSegment !== null && currentDarts.length < 3 && (
                      <button
                        onClick={addDart}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
                      >
                        <Plus className="w-5 h-5" />
                        Add Dart ({calculateDartPoints(selectedSegment, selectedMultiplier)} points)
                      </button>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={endTurn}
                        disabled={currentDarts.length === 0}
                        className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          currentDarts.length === 0
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600' : t('tools.dartsScorer.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                        {t('tools.dartsScorer.endTurn', 'End Turn')}
                      </button>
                      <button
                        onClick={resetGame}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Game Statistics */}
              <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.dartsScorer.gameStatistics', 'Game Statistics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {players.map((player) => {
                      const stats = calculateStats(player);
                      return (
                        <div key={player.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white border border-gray-200'}`}>
                          <div className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {player.name}
                          </div>
                          <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div className="flex justify-between">
                              <span>{t('tools.dartsScorer.avgRound', 'Avg/Round:')}</span>
                              <span className="font-medium">{stats.avgPerRound.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('tools.dartsScorer.highest', 'Highest:')}</span>
                              <span className="font-medium">{stats.highestTurn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('tools.dartsScorer.checkouts', 'Checkouts:')}</span>
                              <span className="font-medium">{player.checkouts}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('tools.dartsScorer.totalDarts', 'Total Darts:')}</span>
                              <span className="font-medium">{stats.totalDarts}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Rules Section */}
          <button
            onClick={() => setShowRules(!showRules)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.dartsScorer.gameRules', 'Game Rules')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showRules ? '-' : '+'}
            </span>
          </button>

          {showRules && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`space-y-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <p className="font-semibold mb-2">{t('tools.dartsScorer.basicRules', 'Basic Rules:')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('tools.dartsScorer.eachPlayerStartsWith301', 'Each player starts with 301, 501, or 701 points')}</li>
                    <li>{t('tools.dartsScorer.throw3DartsPerTurn', 'Throw 3 darts per turn, subtracting scored points from total')}</li>
                    <li>{t('tools.dartsScorer.firstPlayerToReachExactly', 'First player to reach exactly 0 wins')}</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">{t('tools.dartsScorer.doubleOutRule', 'Double-Out Rule:')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('tools.dartsScorer.youMustFinishOnA', 'You MUST finish on a double (or bullseye)')}</li>
                    <li>{t('tools.dartsScorer.ifYouGoBelow0', 'If you go below 0 or hit exactly 1, your turn is "bust" (no score)')}</li>
                    <li>{t('tools.dartsScorer.ifYouReach0Without', 'If you reach 0 without a double finish, it\'s a bust')}</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">{t('tools.dartsScorer.scoring', 'Scoring:')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('tools.dartsScorer.singleFaceValue120', 'Single: Face value (1-20)')}</li>
                    <li>{t('tools.dartsScorer.double2xFaceValue', 'Double: 2x face value')}</li>
                    <li>{t('tools.dartsScorer.triple3xFaceValue', 'Triple: 3x face value')}</li>
                    <li>{t('tools.dartsScorer.outerBull25PointsSingle', 'Outer Bull: 25 points (single or double)')}</li>
                    <li>{t('tools.dartsScorer.bullseye50PointsCountsAs', 'Bullseye: 50 points (counts as double)')}</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">{t('tools.dartsScorer.checkoutTips', 'Checkout Tips:')}</p>
                  <p>{t('tools.dartsScorer.theMaximumCheckoutIs170', 'The maximum checkout is 170 (T20, T20, Bull). The scorer will suggest optimal checkouts when you\'re within range.')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DartsScorerTool;
