import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Users, Plus, Minus, RotateCcw, Star, Sparkles, Crown, Medal, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

const COLUMNS: ColumnConfig[] = [
  { key: 'rank', header: 'Rank', type: 'number' },
  { key: 'name', header: 'Team/Player Name', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'bonusMultiplier', header: 'Bonus Multiplier', type: 'number' },
];

interface Player {
  id: string;
  name: string;
  score: number;
  bonusMultiplier: number;
}

interface TriviaScoreboardToolProps {
  uiConfig?: UIConfig;
}

export const TriviaScoreboardTool: React.FC<TriviaScoreboardToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Default players for initial state
  const defaultPlayers: Player[] = [
    { id: '1', name: 'Team Alpha', score: 0, bonusMultiplier: 1 },
    { id: '2', name: 'Team Beta', score: 0, bonusMultiplier: 1 },
  ];

  // Use the useToolData hook for backend persistence
  const {
    data: players,
    setData: setPlayers,
    addItem,
    updateItem,
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
  } = useToolData<Player>('trivia-scoreboard', defaultPlayers, COLUMNS);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(10);
  const [bonusMultiplier, setBonusMultiplier] = useState(2);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showWinner, setShowWinner] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.totalRounds) {
        setTotalRounds(Number(data.totalRounds));
      }
      if (data.pointsPerQuestion) {
        setPointsPerQuestion(Number(data.pointsPerQuestion));
      }
      if (data.bonusMultiplier) {
        setBonusMultiplier(Number(data.bonusMultiplier));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const winner = useMemo(() => {
    if (sortedPlayers.length === 0) return null;
    const topScore = sortedPlayers[0].score;
    const winners = sortedPlayers.filter(p => p.score === topScore);
    return winners.length === 1 ? winners[0] : null;
  }, [sortedPlayers]);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        bonusMultiplier: 1,
      };
      addItem(newPlayer);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id: string) => {
    deleteItem(id);
  };

  const addPoints = (id: string, points: number, isBonus: boolean = false) => {
    const player = players.find(p => p.id === id);
    if (player) {
      const multiplier = isBonus ? bonusMultiplier : 1;
      updateItem(id, { score: Math.max(0, player.score + (points * multiplier)) });
    }
  };

  const startEditing = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditingName(player.name);
  };

  const saveEditing = () => {
    if (editingName.trim() && editingPlayerId) {
      updateItem(editingPlayerId, { name: editingName.trim() });
    }
    setEditingPlayerId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingPlayerId(null);
    setEditingName('');
  };

  const nextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
    } else {
      setShowWinner(true);
    }
  };

  const previousRound = () => {
    if (currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }
  };

  const resetGame = () => {
    // Reset all player scores using updateItem
    players.forEach(p => {
      updateItem(p.id, { score: 0 });
    });
    setCurrentRound(1);
    setShowWinner(false);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{index + 1}</span>;
    }
  };

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
            <div className="p-2 bg-purple-500/10 rounded-lg"><Trophy className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.triviaScoreboard.triviaScoreboard', 'Trivia Scoreboard')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.triviaScoreboard.trackScoresRoundsAndCrown', 'Track scores, rounds, and crown the winner')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="trivia-scoreboard" toolName="Trivia Scoreboard" />

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
              onExportCSV={() => exportCSV({ filename: `trivia-scoreboard-round-${currentRound}` })}
              onExportExcel={() => exportExcel({ filename: `trivia-scoreboard-round-${currentRound}` })}
              onExportJSON={() => exportJSON({ filename: `trivia-scoreboard-round-${currentRound}` })}
              onExportPDF={() => exportPDF({
                filename: `trivia-scoreboard-round-${currentRound}`,
                title: 'Trivia Scoreboard',
                subtitle: `Round ${currentRound} of ${totalRounds}`
              })}
              onPrint={() => print('Trivia Scoreboard')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={players.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Winner Celebration */}
        {showWinner && winner && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gradient-to-br from-yellow-900/30 to-purple-900/30 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-purple-50 border-yellow-200'} border`}>
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Crown className="w-16 h-16 text-yellow-500" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {winner.name} Wins!
            </h2>
            <p className={`text-lg ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              Final Score: {winner.score} points
            </p>
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {t('tools.triviaScoreboard.playAgain', 'Play Again')}
            </button>
          </div>
        )}

        {/* Round Tracker */}
        {!showWinner && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.triviaScoreboard.roundProgress', 'Round Progress')}</span>
              <span className="text-purple-500 font-bold">Round {currentRound} of {totalRounds}</span>
            </div>
            <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <button
                onClick={previousRound}
                disabled={currentRound === 1}
                className={`px-3 py-1 rounded-lg text-sm ${currentRound === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {t('tools.triviaScoreboard.previousRound', 'Previous Round')}
              </button>
              <button
                onClick={nextRound}
                className="px-3 py-1 rounded-lg text-sm bg-purple-500 text-white hover:bg-purple-600"
              >
                {currentRound === totalRounds ? t('tools.triviaScoreboard.endGame', 'End Game') : t('tools.triviaScoreboard.nextRound', 'Next Round')}
              </button>
            </div>
          </div>
        )}

        {/* Game Settings */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.triviaScoreboard.totalRounds', 'Total Rounds')}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={totalRounds}
              onChange={(e) => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.triviaScoreboard.pointsQuestion', 'Points/Question')}
            </label>
            <input
              type="number"
              min="1"
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.triviaScoreboard.bonusMultiplier', 'Bonus Multiplier')}
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={bonusMultiplier}
              onChange={(e) => setBonusMultiplier(Math.max(1, parseFloat(e.target.value) || 1))}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Add Player */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            placeholder={t('tools.triviaScoreboard.addTeamPlayerName', 'Add team/player name...')}
            className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
          />
          <button
            onClick={addPlayer}
            disabled={!newPlayerName.trim()}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${newPlayerName.trim() ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <Users className="w-4 h-4" />
            {t('tools.triviaScoreboard.add', 'Add')}
          </button>
        </div>

        {/* Player/Team List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Teams/Players ({players.length})
            </h4>
            <button
              onClick={resetGame}
              className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <RotateCcw className="w-4 h-4" />
              {t('tools.triviaScoreboard.resetScores', 'Reset Scores')}
            </button>
          </div>

          {players.length === 0 ? (
            <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.triviaScoreboard.noTeamsYetAddA', 'No teams yet. Add a team to get started!')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {editingPlayerId === player.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
                            className={`flex-1 px-3 py-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            autoFocus
                          />
                          <button onClick={saveEditing} className="p-1 text-green-500 hover:text-green-400">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEditing} className="p-1 text-red-500 hover:text-red-400">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{player.name}</span>
                          <button
                            onClick={() => startEditing(player)}
                            className={`p-1 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-purple-500 min-w-[60px] text-right">
                        {player.score}
                      </div>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="p-1 text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Point Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => addPoints(player.id, -pointsPerQuestion)}
                      className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addPoints(player.id, pointsPerQuestion)}
                      className="flex-1 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      +{pointsPerQuestion} pts
                    </button>
                    <button
                      onClick={() => addPoints(player.id, pointsPerQuestion, true)}
                      className="py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 flex items-center gap-1"
                    >
                      <Star className="w-4 h-4" />
                      x{bonusMultiplier}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {players.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Trophy className="w-4 h-4 text-purple-500" />
              {t('tools.triviaScoreboard.leaderboard', 'Leaderboard')}
            </h4>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    index === 0
                      ? isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'
                      : isDark ? 'bg-gray-800/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <span className={`${index === 0 ? 'font-semibold' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {player.name}
                    </span>
                  </div>
                  <span className={`font-bold ${index === 0 ? 'text-yellow-500' : 'text-purple-500'}`}>
                    {player.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {players.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.triviaScoreboard.totalPoints', 'Total Points')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {players.reduce((sum, p) => sum + p.score, 0)}
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.triviaScoreboard.highestScore', 'Highest Score')}</div>
              <div className="text-xl font-bold text-purple-500">
                {Math.max(...players.map(p => p.score))}
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.triviaScoreboard.averageScore', 'Average Score')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length) : 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaScoreboardTool;
