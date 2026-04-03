import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gamepad2, Clock, Trophy, FileText, Bell, BarChart3, Plus, Trash2, Play, Pause, RotateCcw, Calendar, Timer, Target, Star, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GameSession {
  id: string;
  gameName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in minutes
  notes: string;
  achievements: string[];
}

interface Game {
  id: string;
  name: string;
  totalPlayTime: number; // in minutes
  sessions: number;
  lastPlayed: Date | null;
}

type TabType = 'tracker' | 'session' | 'achievements' | 'stats';
type StatsView = 'weekly' | 'monthly';

// Combined data type for sync
interface GamingData {
  id: string;
  type: 'game' | 'session' | 'achievement';
  data: Game | GameSession | string;
}

interface GamingSessionLogToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const SESSION_COLUMNS: ColumnConfig[] = [
  { key: 'gameName', header: 'Game', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'date' },
  { key: 'endTime', header: 'End Time', type: 'date' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'achievements', header: 'Achievements', type: 'string', format: (val: string[]) => Array.isArray(val) ? val.join(', ') : '' },
];

// Column configuration for games export
const GAME_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Game Name', type: 'string' },
  { key: 'totalPlayTime', header: 'Total Play Time (min)', type: 'number' },
  { key: 'sessions', header: 'Sessions', type: 'number' },
  { key: 'lastPlayed', header: 'Last Played', type: 'date' },
];

// Combined columns for synced data
const DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'data', header: 'Data', type: 'string' },
];

export const GamingSessionLogTool: React.FC<GamingSessionLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('tracker');
  const [statsView, setStatsView] = useState<StatsView>('weekly');

  // Use the useToolData hook for backend persistence
  const {
    data: syncedData,
    setData: setSyncedData,
    addItem: addSyncedItem,
    updateItem: updateSyncedItem,
    deleteItem: deleteSyncedItem,
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
  } = useToolData<GamingData>('gaming-session-log', [], DATA_COLUMNS);

  // Derived state from synced data
  const games = useMemo(() => {
    return syncedData
      .filter(item => item.type === 'game')
      .map(item => {
        const gameData = item.data as Game;
        return {
          ...gameData,
          lastPlayed: gameData.lastPlayed ? new Date(gameData.lastPlayed) : null,
        };
      });
  }, [syncedData]);

  const sessions = useMemo(() => {
    return syncedData
      .filter(item => item.type === 'session')
      .map(item => {
        const sessionData = item.data as GameSession;
        return {
          ...sessionData,
          startTime: new Date(sessionData.startTime),
          endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
        };
      });
  }, [syncedData]);

  const achievements = useMemo(() => {
    return syncedData
      .filter(item => item.type === 'achievement')
      .map(item => item.data as string);
  }, [syncedData]);

  const [newGameName, setNewGameName] = useState('');

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSession, setActiveSession] = useState<Partial<GameSession> | null>(null);
  const [selectedGame, setSelectedGame] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Achievements input state
  const [newAchievement, setNewAchievement] = useState('');
  const [achievementGame, setAchievementGame] = useState('');

  // Break reminder state
  const [breakReminder, setBreakReminder] = useState(60); // minutes
  const [breakReminderEnabled, setBreakReminderEnabled] = useState(true);
  const [lastBreakReminder, setLastBreakReminder] = useState<Date | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.gameName) {
        setNewGameName(data.gameName as string);
      }
      if (data.breakReminder) {
        setBreakReminder(Number(data.breakReminder));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Format time helper
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimerDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add new game
  const addGame = () => {
    if (!newGameName.trim()) return;
    const gameId = Date.now().toString();
    const newGame: Game = {
      id: gameId,
      name: newGameName.trim(),
      totalPlayTime: 0,
      sessions: 0,
      lastPlayed: null,
    };
    addSyncedItem({
      id: `game-${gameId}`,
      type: 'game',
      data: newGame,
    });
    setNewGameName('');
  };

  // Remove game
  const removeGame = (id: string) => {
    deleteSyncedItem(`game-${id}`);
  };

  // Start session
  const startSession = () => {
    if (!selectedGame) return;
    setIsSessionActive(true);
    setActiveSession({
      id: Date.now().toString(),
      gameName: selectedGame,
      startTime: new Date(),
      notes: '',
      achievements: [],
    });
    setSessionTimer(0);
    const interval = setInterval(() => {
      setSessionTimer((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
    setLastBreakReminder(new Date());
  };

  // End session
  const endSession = () => {
    if (!activeSession || !timerInterval) return;
    clearInterval(timerInterval);
    setTimerInterval(null);

    const duration = Math.floor(sessionTimer / 60);
    const sessionId = activeSession.id!;
    const completedSession: GameSession = {
      id: sessionId,
      gameName: activeSession.gameName!,
      startTime: activeSession.startTime!,
      endTime: new Date(),
      duration,
      notes: sessionNotes,
      achievements: [],
    };

    // Add session to synced data
    addSyncedItem({
      id: `session-${sessionId}`,
      type: 'session',
      data: completedSession,
    });

    // Update game stats
    const gameToUpdate = games.find(g => g.name === activeSession.gameName);
    if (gameToUpdate) {
      updateSyncedItem(`game-${gameToUpdate.id}`, {
        data: {
          ...gameToUpdate,
          totalPlayTime: gameToUpdate.totalPlayTime + duration,
          sessions: gameToUpdate.sessions + 1,
          lastPlayed: new Date(),
        },
      });
    }

    setIsSessionActive(false);
    setActiveSession(null);
    setSessionTimer(0);
    setSessionNotes('');
    setSelectedGame('');
  };

  // Add achievement
  const addAchievement = () => {
    if (!newAchievement.trim() || !achievementGame) return;
    const achievement = `${newAchievement.trim()} - ${achievementGame}`;
    const achievementId = Date.now().toString();
    addSyncedItem({
      id: `achievement-${achievementId}`,
      type: 'achievement',
      data: achievement,
    });
    setNewAchievement('');
    setAchievementGame('');
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklySessions = sessions.filter((s) => s.startTime >= weekAgo);
    const monthlySessions = sessions.filter((s) => s.startTime >= monthAgo);

    const weeklyPlayTime = weeklySessions.reduce((acc, s) => acc + s.duration, 0);
    const monthlyPlayTime = monthlySessions.reduce((acc, s) => acc + s.duration, 0);

    const totalPlayTime = games.reduce((acc, g) => acc + g.totalPlayTime, 0);
    const totalSessions = games.reduce((acc, g) => acc + g.sessions, 0);
    const avgSessionLength = totalSessions > 0 ? Math.round(totalPlayTime / totalSessions) : 0;

    const mostPlayedGame = [...games].sort((a, b) => b.totalPlayTime - a.totalPlayTime)[0];

    return {
      weeklyPlayTime,
      monthlyPlayTime,
      weeklySessions: weeklySessions.length,
      monthlySessions: monthlySessions.length,
      totalPlayTime,
      totalSessions,
      avgSessionLength,
      mostPlayedGame,
      totalGames: games.length,
      totalAchievements: achievements.length,
    };
  }, [sessions, games, achievements]);

  // Check break reminder
  const shouldShowBreakReminder = useMemo(() => {
    if (!breakReminderEnabled || !isSessionActive || !lastBreakReminder) return false;
    const minutesSinceLastBreak = (Date.now() - lastBreakReminder.getTime()) / 1000 / 60;
    return minutesSinceLastBreak >= breakReminder;
  }, [breakReminderEnabled, isSessionActive, lastBreakReminder, breakReminder, sessionTimer]);

  const dismissBreakReminder = () => {
    setLastBreakReminder(new Date());
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'tracker', label: 'Games', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'session', label: 'Session', icon: <Timer className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Prepare export data - convert Date objects to ISO strings for export
  const exportData = useMemo(() => {
    return sessions.map(session => ({
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : '',
      achievements: session.achievements,
    }));
  }, [sessions]);

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
              <Gamepad2 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gamingSessionLog.gamingSessionLog', 'Gaming Session Log')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gamingSessionLog.trackYourGamingSessionsAnd', 'Track your gaming sessions and achievements')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="gaming-session-log" toolName="Gaming Session Log" />

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
              onExportCSV={() => exportCSV({ filename: 'gaming_sessions' })}
              onExportExcel={() => exportExcel({ filename: 'gaming_sessions' })}
              onExportJSON={() => exportJSON({ filename: 'gaming_sessions' })}
              onExportPDF={() => exportPDF({
                filename: 'gaming_sessions',
                title: 'Gaming Sessions Log',
                subtitle: `${sessions.length} sessions, ${games.length} games, ${achievements.length} achievements`
              })}
              onPrint={() => print('Gaming Sessions Log')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Break Reminder Alert */}
      {shouldShowBreakReminder && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className={`font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>{t('tools.gamingSessionLog.timeForABreak', 'Time for a break!')}</p>
              <p className={`text-sm ${isDark ? 'text-yellow-300/70' : 'text-yellow-700'}`}>You've been playing for {breakReminder} minutes. Take a short break!</p>
            </div>
          </div>
          <button
            onClick={dismissBreakReminder}
            className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
          >
            {t('tools.gamingSessionLog.dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `${isDark ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* Game Tracker Tab */}
        {activeTab === 'tracker' && (
          <>
            {/* Add New Game */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.gamingSessionLog.addNewGame', 'Add New Game')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder={t('tools.gamingSessionLog.enterGameName', 'Enter game name...')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  onKeyPress={(e) => e.key === 'Enter' && addGame()}
                />
                <button
                  onClick={addGame}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.gamingSessionLog.add', 'Add')}
                </button>
              </div>
            </div>

            {/* Games List */}
            <div className="space-y-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Games ({games.length})</h4>
              {games.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.gamingSessionLog.noGamesAddedYetAdd', 'No games added yet. Add your first game above!')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-between`}
                    >
                      <div className="flex-1">
                        <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{game.name}</h5>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex gap-4 mt-1`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(game.totalPlayTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {game.sessions} sessions
                          </span>
                          {game.lastPlayed && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {game.lastPlayed.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeGame(game.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'} transition-colors`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Session Tab */}
        {activeTab === 'session' && (
          <>
            {/* Active Session */}
            {isSessionActive ? (
              <div className={`p-6 rounded-lg ${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} border space-y-4`}>
                <div className="text-center">
                  <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.gamingSessionLog.currentlyPlaying', 'Currently Playing')}</p>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeSession?.gameName}</h4>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-purple-500">{formatTimerDisplay(sessionTimer)}</div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <FileText className="w-4 h-4 inline mr-1" />
                    {t('tools.gamingSessionLog.sessionNotes', 'Session Notes')}
                  </label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder={t('tools.gamingSessionLog.addNotesAboutThisSession', 'Add notes about this session...')}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  />
                </div>
                <button
                  onClick={endSession}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  {t('tools.gamingSessionLog.endSession', 'End Session')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.gamingSessionLog.selectGame', 'Select Game')}</label>
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.gamingSessionLog.chooseAGame', 'Choose a game...')}</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.name}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={startSession}
                  disabled={!selectedGame}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    selectedGame
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                  }`}
                >
                  <Play className="w-5 h-5" />
                  {t('tools.gamingSessionLog.startSession', 'Start Session')}
                </button>
              </div>
            )}

            {/* Break Reminder Settings */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gamingSessionLog.breakReminders', 'Break Reminders')}</span>
                </div>
                <button
                  onClick={() => setBreakReminderEnabled(!breakReminderEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    breakReminderEnabled ? 'bg-purple-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      breakReminderEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {breakReminderEnabled && (
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remind every {breakReminder} minutes
                  </label>
                  <div className="flex gap-2">
                    {[30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setBreakReminder(mins)}
                        className={`flex-1 py-2 rounded-lg text-sm ${
                          breakReminder === mins
                            ? 'bg-purple-500 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="space-y-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gamingSessionLog.recentSessions', 'Recent Sessions')}</h4>
              {sessions.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gamingSessionLog.noSessionsRecordedYet', 'No sessions recorded yet.')}</p>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{session.gameName}</span>
                        <span className="text-purple-500 font-medium">{formatTime(session.duration)}</span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {session.notes && (
                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{session.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <>
            {/* Add Achievement */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.gamingSessionLog.logNewAchievement', 'Log New Achievement')}</label>
              <select
                value={achievementGame}
                onChange={(e) => setAchievementGame(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">{t('tools.gamingSessionLog.selectGame2', 'Select game...')}</option>
                {games.map((game) => (
                  <option key={game.id} value={game.name}>
                    {game.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder={t('tools.gamingSessionLog.achievementName', 'Achievement name...')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                />
                <button
                  onClick={addAchievement}
                  disabled={!newAchievement.trim() || !achievementGame}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    newAchievement.trim() && achievementGame
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  {t('tools.gamingSessionLog.add2', 'Add')}
                </button>
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Achievements ({achievements.length})
              </h4>
              {achievements.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.gamingSessionLog.noAchievementsLoggedYetStart', 'No achievements logged yet. Start tracking your wins!')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center gap-3`}
                    >
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{achievement}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            {/* Stats Period Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatsView('weekly')}
                className={`flex-1 py-2 rounded-lg ${
                  statsView === 'weekly' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.gamingSessionLog.weekly', 'Weekly')}
              </button>
              <button
                onClick={() => setStatsView('monthly')}
                className={`flex-1 py-2 rounded-lg ${
                  statsView === 'monthly' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.gamingSessionLog.monthly', 'Monthly')}
              </button>
            </div>

            {/* Period Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gamingSessionLog.playTime', 'Play Time')}</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {formatTime(statsView === 'weekly' ? stats.weeklyPlayTime : stats.monthlyPlayTime)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gamingSessionLog.sessions', 'Sessions')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {statsView === 'weekly' ? stats.weeklySessions : stats.monthlySessions}
                </div>
              </div>
            </div>

            {/* All-Time Stats */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border space-y-3`}>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gamingSessionLog.allTimeStats', 'All-Time Stats')}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.gamingSessionLog.totalPlayTime', 'Total Play Time')}</span>
                  <div className="font-semibold">{formatTime(stats.totalPlayTime)}</div>
                </div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.gamingSessionLog.totalSessions', 'Total Sessions')}</span>
                  <div className="font-semibold">{stats.totalSessions}</div>
                </div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.gamingSessionLog.avgSession', 'Avg Session')}</span>
                  <div className="font-semibold">{formatTime(stats.avgSessionLength)}</div>
                </div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.gamingSessionLog.gamesTracked', 'Games Tracked')}</span>
                  <div className="font-semibold">{stats.totalGames}</div>
                </div>
              </div>
            </div>

            {/* Most Played Game */}
            {stats.mostPlayedGame && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-yellow-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gamingSessionLog.mostPlayedGame', 'Most Played Game')}</span>
                </div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.mostPlayedGame.name}</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formatTime(stats.mostPlayedGame.totalPlayTime)} across {stats.mostPlayedGame.sessions} sessions
                </div>
              </div>
            )}

            {/* Achievements Count */}
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalAchievements}</div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.gamingSessionLog.totalAchievements', 'Total Achievements')}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GamingSessionLogTool;
