'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Medal,
  Target,
  Clock,
  Sparkles,
  Shield,
  Star,
  TrendingUp,
  Award,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SportsLeagueToolProps {
  uiConfig?: UIConfig;
}

// Types
type SportType = 'soccer' | 'basketball' | 'volleyball' | 'tennis' | 'softball' | 'football' | 'hockey' | 'baseball';
type SeasonStatus = 'registration' | 'active' | 'playoffs' | 'completed';
type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
type Division = 'recreational' | 'competitive' | 'elite' | 'youth' | 'adult' | 'senior';

interface League {
  id: string;
  name: string;
  sport: SportType;
  division: Division;
  seasonName: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  registrationFee: number;
  description: string;
  rules: string;
  createdAt: string;
}

interface Team {
  id: string;
  leagueId: string;
  name: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  players: Player[];
  wins: number;
  losses: number;
  ties: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  registeredAt: string;
  isActive: boolean;
}

interface Player {
  id: string;
  name: string;
  email: string;
  jerseyNumber: number;
  position: string;
}

interface Game {
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: string;
  time: string;
  location: string;
  field: string;
  homeScore: number | null;
  awayScore: number | null;
  status: GameStatus;
  notes: string;
}

// Constants
const SPORT_TYPES: { sport: SportType; label: string; icon: string }[] = [
  { sport: 'soccer', label: 'Soccer', icon: '⚽' },
  { sport: 'basketball', label: 'Basketball', icon: '🏀' },
  { sport: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { sport: 'tennis', label: 'Tennis', icon: '🎾' },
  { sport: 'softball', label: 'Softball', icon: '🥎' },
  { sport: 'football', label: 'Football', icon: '🏈' },
  { sport: 'hockey', label: 'Hockey', icon: '🏒' },
  { sport: 'baseball', label: 'Baseball', icon: '⚾' },
];

const DIVISIONS: { division: Division; label: string }[] = [
  { division: 'recreational', label: 'Recreational' },
  { division: 'competitive', label: 'Competitive' },
  { division: 'elite', label: 'Elite' },
  { division: 'youth', label: 'Youth' },
  { division: 'adult', label: 'Adult' },
  { division: 'senior', label: 'Senior' },
];

const STATUS_COLORS: Record<SeasonStatus, { bg: string; text: string }> = {
  registration: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  playoffs: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
};

const GAME_STATUS_COLORS: Record<GameStatus, { bg: string; text: string }> = {
  scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  postponed: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

// Column configurations
const LEAGUE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'League Name', type: 'string' },
  { key: 'sport', header: 'Sport', type: 'string' },
  { key: 'division', header: 'Division', type: 'string' },
  { key: 'seasonName', header: 'Season', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
];

const TEAM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Team Name', type: 'string' },
  { key: 'captainName', header: 'Captain', type: 'string' },
  { key: 'wins', header: 'Wins', type: 'number' },
  { key: 'losses', header: 'Losses', type: 'number' },
  { key: 'ties', header: 'Ties', type: 'number' },
  { key: 'points', header: 'Points', type: 'number' },
];

const GAME_COLUMNS: ColumnConfig[] = [
  { key: 'homeTeamName', header: 'Home Team', type: 'string' },
  { key: 'awayTeamName', header: 'Away Team', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  if (!time) return 'TBD';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes || '00'} ${ampm}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const SportsLeagueTool: React.FC<SportsLeagueToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: leagues,
    addItem: addLeagueToBackend,
    updateItem: updateLeagueBackend,
    deleteItem: deleteLeagueBackend,
    isSynced: leaguesSynced,
    isSaving: leaguesSaving,
    lastSaved: leaguesLastSaved,
    syncError: leaguesSyncError,
    forceSync: forceLeaguesSync,
  } = useToolData<League>('sports-leagues', [], LEAGUE_COLUMNS);

  const {
    data: teams,
    addItem: addTeamToBackend,
    updateItem: updateTeamBackend,
    deleteItem: deleteTeamBackend,
  } = useToolData<Team>('league-teams', [], TEAM_COLUMNS);

  const {
    data: games,
    addItem: addGameToBackend,
    updateItem: updateGameBackend,
    deleteItem: deleteGameBackend,
  } = useToolData<Game>('league-games', [], GAME_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'leagues' | 'teams' | 'schedule' | 'standings'>('leagues');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [showLeagueForm, setShowLeagueForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState<SportType | 'all'>('all');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Form states
  const [newLeague, setNewLeague] = useState<Partial<League>>({
    name: '',
    sport: 'soccer',
    division: 'recreational',
    seasonName: '',
    status: 'registration',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeams: 12,
    registrationFee: 500,
    description: '',
    rules: '',
  });

  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    players: [],
  });

  const [newGame, setNewGame] = useState<Partial<Game>>({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '18:00',
    location: '',
    field: '',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.leagueName || params.sport) {
        setNewLeague({
          ...newLeague,
          name: params.leagueName || '',
          sport: params.sport || 'soccer',
          description: params.description || '',
        });
        setShowLeagueForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Selected league
  const selectedLeague = useMemo(() => {
    return leagues.find(l => l.id === selectedLeagueId);
  }, [leagues, selectedLeagueId]);

  // Teams for selected league
  const leagueTeams = useMemo(() => {
    if (!selectedLeagueId) return [];
    return teams.filter(t => t.leagueId === selectedLeagueId);
  }, [teams, selectedLeagueId]);

  // Games for selected league
  const leagueGames = useMemo(() => {
    if (!selectedLeagueId) return [];
    return games.filter(g => g.leagueId === selectedLeagueId);
  }, [games, selectedLeagueId]);

  // Filter leagues
  const filteredLeagues = useMemo(() => {
    return leagues.filter(league => {
      const matchesSearch = searchTerm === '' || league.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = filterSport === 'all' || league.sport === filterSport;
      return matchesSearch && matchesSport;
    });
  }, [leagues, searchTerm, filterSport]);

  // Standings sorted by points
  const standings = useMemo(() => {
    return [...leagueTeams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGoalDiff = a.goalsFor - a.goalsAgainst;
      const bGoalDiff = b.goalsFor - b.goalsAgainst;
      if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
      return b.goalsFor - a.goalsFor;
    });
  }, [leagueTeams]);

  // Add league
  const addLeague = () => {
    if (!newLeague.name || !newLeague.seasonName) {
      setValidationMessage('Please fill in required fields (League Name, Season Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const league: League = {
      id: generateId(),
      name: newLeague.name || '',
      sport: newLeague.sport || 'soccer',
      division: newLeague.division || 'recreational',
      seasonName: newLeague.seasonName || '',
      status: newLeague.status || 'registration',
      startDate: newLeague.startDate || '',
      endDate: newLeague.endDate || '',
      registrationDeadline: newLeague.registrationDeadline || '',
      maxTeams: newLeague.maxTeams || 12,
      registrationFee: newLeague.registrationFee || 500,
      description: newLeague.description || '',
      rules: newLeague.rules || '',
      createdAt: new Date().toISOString(),
    };

    addLeagueToBackend(league);
    setSelectedLeagueId(league.id);
    resetLeagueForm();
  };

  // Add team
  const addTeam = () => {
    if (!selectedLeagueId || !newTeam.name || !newTeam.captainName) {
      setValidationMessage('Please select a league and fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const team: Team = {
      id: generateId(),
      leagueId: selectedLeagueId,
      name: newTeam.name || '',
      captainName: newTeam.captainName || '',
      captainEmail: newTeam.captainEmail || '',
      captainPhone: newTeam.captainPhone || '',
      players: newTeam.players || [],
      wins: 0,
      losses: 0,
      ties: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      registeredAt: new Date().toISOString(),
      isActive: true,
    };

    addTeamToBackend(team);
    resetTeamForm();
  };

  // Add game
  const addGame = () => {
    if (!selectedLeagueId || !newGame.homeTeamId || !newGame.awayTeamId || !newGame.date) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (newGame.homeTeamId === newGame.awayTeamId) {
      setValidationMessage('Home and away teams must be different');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const homeTeam = teams.find(t => t.id === newGame.homeTeamId);
    const awayTeam = teams.find(t => t.id === newGame.awayTeamId);

    const game: Game = {
      id: generateId(),
      leagueId: selectedLeagueId,
      homeTeamId: newGame.homeTeamId || '',
      homeTeamName: homeTeam?.name || '',
      awayTeamId: newGame.awayTeamId || '',
      awayTeamName: awayTeam?.name || '',
      date: newGame.date || '',
      time: newGame.time || '18:00',
      location: newGame.location || '',
      field: newGame.field || '',
      homeScore: null,
      awayScore: null,
      status: 'scheduled',
      notes: newGame.notes || '',
    };

    addGameToBackend(game);
    resetGameForm();
  };

  // Update game score
  const updateGameScore = (gameId: string, homeScore: number, awayScore: number) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    updateGameBackend(gameId, {
      homeScore,
      awayScore,
      status: 'completed',
    });

    // Update team standings
    const homeTeam = teams.find(t => t.id === game.homeTeamId);
    const awayTeam = teams.find(t => t.id === game.awayTeamId);

    if (homeTeam) {
      const isWin = homeScore > awayScore;
      const isTie = homeScore === awayScore;
      updateTeamBackend(homeTeam.id, {
        wins: homeTeam.wins + (isWin ? 1 : 0),
        losses: homeTeam.losses + (!isWin && !isTie ? 1 : 0),
        ties: homeTeam.ties + (isTie ? 1 : 0),
        points: homeTeam.points + (isWin ? 3 : isTie ? 1 : 0),
        goalsFor: homeTeam.goalsFor + homeScore,
        goalsAgainst: homeTeam.goalsAgainst + awayScore,
      });
    }

    if (awayTeam) {
      const isWin = awayScore > homeScore;
      const isTie = homeScore === awayScore;
      updateTeamBackend(awayTeam.id, {
        wins: awayTeam.wins + (isWin ? 1 : 0),
        losses: awayTeam.losses + (!isWin && !isTie ? 1 : 0),
        ties: awayTeam.ties + (isTie ? 1 : 0),
        points: awayTeam.points + (isWin ? 3 : isTie ? 1 : 0),
        goalsFor: awayTeam.goalsFor + awayScore,
        goalsAgainst: awayTeam.goalsAgainst + homeScore,
      });
    }
  };

  // Delete functions
  const deleteLeague = async (leagueId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure? This will delete all teams and games in this league.',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteLeagueBackend(leagueId);
    teams.filter(t => t.leagueId === leagueId).forEach(t => deleteTeamBackend(t.id));
    games.filter(g => g.leagueId === leagueId).forEach(g => deleteGameBackend(g.id));
    if (selectedLeagueId === leagueId) setSelectedLeagueId('');
  };

  const deleteTeam = async (teamId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this team?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteTeamBackend(teamId);
  };

  const deleteGame = async (gameId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this game?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteGameBackend(gameId);
  };

  // Reset forms
  const resetLeagueForm = () => {
    setShowLeagueForm(false);
    setEditingLeague(null);
    setNewLeague({
      name: '',
      sport: 'soccer',
      division: 'recreational',
      seasonName: '',
      status: 'registration',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxTeams: 12,
      registrationFee: 500,
      description: '',
      rules: '',
    });
  };

  const resetTeamForm = () => {
    setShowTeamForm(false);
    setEditingTeam(null);
    setNewTeam({
      name: '',
      captainName: '',
      captainEmail: '',
      captainPhone: '',
      players: [],
    });
  };

  const resetGameForm = () => {
    setShowGameForm(false);
    setEditingGame(null);
    setNewGame({
      homeTeamId: '',
      awayTeamId: '',
      date: '',
      time: '18:00',
      location: '',
      field: '',
      notes: '',
    });
  };

  // Analytics
  const analytics = useMemo(() => {
    const activeLeagues = leagues.filter(l => l.status === 'active' || l.status === 'playoffs');
    const totalTeams = teams.length;
    const upcomingGames = games.filter(g => g.status === 'scheduled');
    const completedGames = games.filter(g => g.status === 'completed');

    return {
      totalLeagues: leagues.length,
      activeLeagues: activeLeagues.length,
      totalTeams,
      upcomingGames: upcomingGames.length,
      completedGames: completedGames.length,
    };
  }, [leagues, teams, games]);

  const getSportIcon = (sport: SportType) => {
    return SPORT_TYPES.find(s => s.sport === sport)?.icon || '🏆';
  };

  const getSportLabel = (sport: SportType) => {
    return SPORT_TYPES.find(s => s.sport === sport)?.label || sport;
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.sportsLeague.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.sportsLeague.sportsLeagueManager', 'Sports League Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.sportsLeague.manageLeaguesTeamsSchedulesAnd', 'Manage leagues, teams, schedules, and standings')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="sports-league" toolName="Sports League" />

              <SyncStatus
                isSynced={leaguesSynced}
                isSaving={leaguesSaving}
                lastSaved={leaguesLastSaved}
                syncError={leaguesSyncError}
                onForceSync={forceLeaguesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(leagues, LEAGUE_COLUMNS, { filename: 'sports-leagues' })}
                onExportExcel={() => exportToExcel(leagues, LEAGUE_COLUMNS, { filename: 'sports-leagues' })}
                onExportJSON={() => exportToJSON(leagues, { filename: 'sports-leagues' })}
                onExportPDF={async () => {
                  await exportToPDF(leagues, LEAGUE_COLUMNS, {
                    filename: 'sports-leagues',
                    title: 'Sports League Report',
                    subtitle: `${analytics.totalLeagues} leagues | ${analytics.totalTeams} teams`,
                  });
                }}
                onPrint={() => printData(leagues, LEAGUE_COLUMNS, { title: 'Sports Leagues' })}
                onCopyToClipboard={() => copyUtil(leagues, LEAGUE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'leagues', label: 'Leagues', icon: <Trophy className="w-4 h-4" /> },
              { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
              { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
              { id: 'standings', label: 'Standings', icon: <Medal className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Leagues', value: analytics.totalLeagues, icon: <Trophy className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Active Leagues', value: analytics.activeLeagues, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Total Teams', value: analytics.totalTeams, icon: <Users className="w-5 h-5" />, color: 'bg-purple-500' },
            { label: 'Upcoming Games', value: analytics.upcomingGames, icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-500' },
            { label: 'Completed Games', value: analytics.completedGames, icon: <Medal className="w-5 h-5" />, color: 'bg-teal-500' },
          ].map((stat, index) => (
            <Card key={index} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.color} rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* League Selector */}
        {(activeTab === 'teams' || activeTab === 'schedule' || activeTab === 'standings') && (
          <div className="mb-6">
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              <option value="">{t('tools.sportsLeague.selectALeague', 'Select a league...')}</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>
                  {getSportIcon(league.sport)} {league.name} - {league.seasonName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.sportsLeague.searchLeagues', 'Search leagues...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value as SportType | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.sportsLeague.allSports', 'All Sports')}</option>
                  {SPORT_TYPES.map(sport => (
                    <option key={sport.sport} value={sport.sport}>{sport.icon} {sport.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowLeagueForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.sportsLeague.createLeague', 'Create League')}
              </button>
            </div>

            {/* League Form */}
            {showLeagueForm && (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span>{t('tools.sportsLeague.createNewLeague', 'Create New League')}</span>
                    <button onClick={resetLeagueForm} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.leagueName', 'League Name *')}
                      </label>
                      <input
                        type="text"
                        value={newLeague.name}
                        onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                        placeholder={t('tools.sportsLeague.eGCitySoccerLeague', 'e.g., City Soccer League')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.sport', 'Sport')}
                      </label>
                      <select
                        value={newLeague.sport}
                        onChange={(e) => setNewLeague({ ...newLeague, sport: e.target.value as SportType })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {SPORT_TYPES.map(sport => (
                          <option key={sport.sport} value={sport.sport}>{sport.icon} {sport.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.seasonName', 'Season Name *')}
                      </label>
                      <input
                        type="text"
                        value={newLeague.seasonName}
                        onChange={(e) => setNewLeague({ ...newLeague, seasonName: e.target.value })}
                        placeholder={t('tools.sportsLeague.eGSpring2024', 'e.g., Spring 2024')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.division', 'Division')}
                      </label>
                      <select
                        value={newLeague.division}
                        onChange={(e) => setNewLeague({ ...newLeague, division: e.target.value as Division })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {DIVISIONS.map(div => (
                          <option key={div.division} value={div.division}>{div.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.startDate', 'Start Date')}
                      </label>
                      <input
                        type="date"
                        value={newLeague.startDate}
                        onChange={(e) => setNewLeague({ ...newLeague, startDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.endDate', 'End Date')}
                      </label>
                      <input
                        type="date"
                        value={newLeague.endDate}
                        onChange={(e) => setNewLeague({ ...newLeague, endDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.maxTeams', 'Max Teams')}
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="64"
                        value={newLeague.maxTeams}
                        onChange={(e) => setNewLeague({ ...newLeague, maxTeams: parseInt(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sportsLeague.registrationFee', 'Registration Fee')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newLeague.registrationFee}
                        onChange={(e) => setNewLeague({ ...newLeague, registrationFee: parseInt(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={resetLeagueForm}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.sportsLeague.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={addLeague}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      {t('tools.sportsLeague.createLeague2', 'Create League')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leagues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeagues.length === 0 ? (
                <Card className={`md:col-span-2 lg:col-span-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-8 text-center">
                    <Trophy className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('tools.sportsLeague.noLeaguesFoundCreateYour', 'No leagues found. Create your first league!')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredLeagues.map(league => (
                  <Card key={league.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getSportIcon(league.sport)}</span>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {league.name}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {league.seasonName}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[league.status].bg} ${STATUS_COLORS[league.status].text}`}>
                          {league.status}
                        </span>
                      </div>

                      <div className={`grid grid-cols-2 gap-2 mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div>Division: {DIVISIONS.find(d => d.division === league.division)?.label}</div>
                        <div>Max Teams: {league.maxTeams}</div>
                        <div>Start: {formatDate(league.startDate)}</div>
                        <div>Fee: {formatCurrency(league.registrationFee)}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLeagueId(league.id);
                            setActiveTab('teams');
                          }}
                          className="flex-1 px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] text-sm"
                        >
                          {t('tools.sportsLeague.manage', 'Manage')}
                        </button>
                        <button
                          onClick={() => deleteLeague(league.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {!selectedLeagueId ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardContent className="p-8 text-center">
                  <Users className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.sportsLeague.pleaseSelectALeagueTo', 'Please select a league to view teams')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowTeamForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.sportsLeague.registerTeam2', 'Register Team')}
                  </button>
                </div>

                {/* Team Form */}
                {showTeamForm && (
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span>{t('tools.sportsLeague.registerTeam', 'Register Team')}</span>
                        <button onClick={resetTeamForm} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <X className="w-5 h-5" />
                        </button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.teamName', 'Team Name *')}
                          </label>
                          <input
                            type="text"
                            value={newTeam.name}
                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.captainName', 'Captain Name *')}
                          </label>
                          <input
                            type="text"
                            value={newTeam.captainName}
                            onChange={(e) => setNewTeam({ ...newTeam, captainName: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.captainEmail', 'Captain Email')}
                          </label>
                          <input
                            type="email"
                            value={newTeam.captainEmail}
                            onChange={(e) => setNewTeam({ ...newTeam, captainEmail: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.captainPhone', 'Captain Phone')}
                          </label>
                          <input
                            type="tel"
                            value={newTeam.captainPhone}
                            onChange={(e) => setNewTeam({ ...newTeam, captainPhone: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={resetTeamForm}
                          className={`px-4 py-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t('tools.sportsLeague.cancel2', 'Cancel')}
                        </button>
                        <button
                          onClick={addTeam}
                          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                        >
                          <Save className="w-4 h-4 inline mr-2" />
                          {t('tools.sportsLeague.registerTeam3', 'Register Team')}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Teams List */}
                <div className="space-y-3">
                  {leagueTeams.length === 0 ? (
                    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                      <CardContent className="p-8 text-center">
                        <Users className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {t('tools.sportsLeague.noTeamsRegisteredYet', 'No teams registered yet')}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    leagueTeams.map(team => (
                      <Card key={team.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                              }`}>
                                <Shield className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {team.name}
                                </h3>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Captain: {team.captainName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {team.wins}-{team.losses}-{team.ties}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  W-L-T
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`text-lg font-bold text-[#0D9488]`}>
                                  {team.points}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {t('tools.sportsLeague.points', 'Points')}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteTeam(team.id)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {!selectedLeagueId ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardContent className="p-8 text-center">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.sportsLeague.pleaseSelectALeagueTo2', 'Please select a league to view schedule')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowGameForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.sportsLeague.scheduleGame2', 'Schedule Game')}
                  </button>
                </div>

                {/* Game Form */}
                {showGameForm && (
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span>{t('tools.sportsLeague.scheduleGame', 'Schedule Game')}</span>
                        <button onClick={resetGameForm} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <X className="w-5 h-5" />
                        </button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.homeTeam', 'Home Team *')}
                          </label>
                          <select
                            value={newGame.homeTeamId}
                            onChange={(e) => setNewGame({ ...newGame, homeTeamId: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          >
                            <option value="">{t('tools.sportsLeague.selectHomeTeam', 'Select home team...')}</option>
                            {leagueTeams.map(team => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.awayTeam', 'Away Team *')}
                          </label>
                          <select
                            value={newGame.awayTeamId}
                            onChange={(e) => setNewGame({ ...newGame, awayTeamId: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          >
                            <option value="">{t('tools.sportsLeague.selectAwayTeam', 'Select away team...')}</option>
                            {leagueTeams.map(team => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.date', 'Date *')}
                          </label>
                          <input
                            type="date"
                            value={newGame.date}
                            onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.time', 'Time')}
                          </label>
                          <input
                            type="time"
                            value={newGame.time}
                            onChange={(e) => setNewGame({ ...newGame, time: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.location', 'Location')}
                          </label>
                          <input
                            type="text"
                            value={newGame.location}
                            onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
                            placeholder={t('tools.sportsLeague.eGCitySportsComplex', 'e.g., City Sports Complex')}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.sportsLeague.field', 'Field')}
                          </label>
                          <input
                            type="text"
                            value={newGame.field}
                            onChange={(e) => setNewGame({ ...newGame, field: e.target.value })}
                            placeholder={t('tools.sportsLeague.eGFieldA', 'e.g., Field A')}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={resetGameForm}
                          className={`px-4 py-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t('tools.sportsLeague.cancel3', 'Cancel')}
                        </button>
                        <button
                          onClick={addGame}
                          className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                        >
                          <Save className="w-4 h-4 inline mr-2" />
                          {t('tools.sportsLeague.scheduleGame3', 'Schedule Game')}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Games List */}
                <div className="space-y-3">
                  {leagueGames.length === 0 ? (
                    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                      <CardContent className="p-8 text-center">
                        <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {t('tools.sportsLeague.noGamesScheduledYet', 'No games scheduled yet')}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    leagueGames
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(game => (
                        <Card key={game.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="text-center min-w-[100px]">
                                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {game.homeTeamName}
                                  </p>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sportsLeague.home', 'Home')}</p>
                                </div>
                                <div className="text-center">
                                  {game.status === 'completed' ? (
                                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {game.homeScore} - {game.awayScore}
                                    </p>
                                  ) : (
                                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      vs
                                    </p>
                                  )}
                                </div>
                                <div className="text-center min-w-[100px]">
                                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {game.awayTeamName}
                                  </p>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sportsLeague.away', 'Away')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatDate(game.date)}
                                  </p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatTime(game.time)} @ {game.location || 'TBD'}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${GAME_STATUS_COLORS[game.status].bg} ${GAME_STATUS_COLORS[game.status].text}`}>
                                  {game.status.replace('_', ' ')}
                                </span>
                                <button
                                  onClick={() => deleteGame(game.id)}
                                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && (
          <div className="space-y-6">
            {!selectedLeagueId ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardContent className="p-8 text-center">
                  <Medal className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.sportsLeague.pleaseSelectALeagueTo3', 'Please select a league to view standings')}
                  </p>
                </CardContent>
              </Card>
            ) : standings.length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardContent className="p-8 text-center">
                  <Medal className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.sportsLeague.noTeamsToDisplayStandings', 'No teams to display standings')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    League Standings - {selectedLeague?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                          <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sportsLeague.rank', 'Rank')}</th>
                          <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sportsLeague.team', 'Team')}</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>W</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>L</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>T</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>GF</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>GA</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>GD</th>
                          <th className={`text-center py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sportsLeague.pts', 'Pts')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((team, index) => (
                          <tr
                            key={team.id}
                            className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'} ${
                              index < 3 ? (theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50') : ''
                            }`}
                          >
                            <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 inline mr-1" />}
                              {index === 1 && <Medal className="w-4 h-4 text-gray-400 inline mr-1" />}
                              {index === 2 && <Award className="w-4 h-4 text-orange-500 inline mr-1" />}
                              {index + 1}
                            </td>
                            <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {team.name}
                            </td>
                            <td className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {team.wins}
                            </td>
                            <td className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {team.losses}
                            </td>
                            <td className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {team.ties}
                            </td>
                            <td className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {team.goalsFor}
                            </td>
                            <td className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {team.goalsAgainst}
                            </td>
                            <td className={`text-center py-3 px-4 font-medium ${
                              team.goalsFor - team.goalsAgainst > 0
                                ? 'text-green-500'
                                : team.goalsFor - team.goalsAgainst < 0
                                ? 'text-red-500'
                                : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                            </td>
                            <td className={`text-center py-3 px-4 font-bold text-[#0D9488]`}>
                              {team.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default SportsLeagueTool;
