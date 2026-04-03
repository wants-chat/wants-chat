import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Sparkles, Clock, Heart, Users, Shuffle, Plus, X, Check, Tv, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

type Genre = 'action' | 'comedy' | 'drama' | 'horror' | 'scifi' | 'romance' | 'thriller' | 'animation' | 'documentary' | 'fantasy';
type Mood = 'excited' | 'relaxed' | 'romantic' | 'thoughtful' | 'scared' | 'nostalgic';
type Runtime = 'short' | 'medium' | 'long' | 'epic';

interface Movie {
  id: string;
  title: string;
  genre: Genre;
  mood: Mood[];
  runtime: Runtime;
  year: number;
  rating: number;
  streamingHints: string[];
}

interface WatchlistItem extends Movie {
  addedAt: Date;
}

interface GroupVote {
  odId: string;
  odTitle: string;
  votes: { odUserId: string; odVote: 'up' | 'down' }[];
}

const SAMPLE_MOVIES: Movie[] = [
  { id: '1', title: 'Inception', genre: 'scifi', mood: ['excited', 'thoughtful'], runtime: 'long', year: 2010, rating: 8.8, streamingHints: ['Netflix', 'Prime Video'] },
  { id: '2', title: 'The Grand Budapest Hotel', genre: 'comedy', mood: ['relaxed', 'nostalgic'], runtime: 'medium', year: 2014, rating: 8.1, streamingHints: ['Disney+', 'Hulu'] },
  { id: '3', title: 'Get Out', genre: 'horror', mood: ['scared', 'thoughtful'], runtime: 'medium', year: 2017, rating: 7.7, streamingHints: ['Peacock', 'Prime Video'] },
  { id: '4', title: 'La La Land', genre: 'romance', mood: ['romantic', 'nostalgic'], runtime: 'long', year: 2016, rating: 8.0, streamingHints: ['Netflix', 'Hulu'] },
  { id: '5', title: 'Mad Max: Fury Road', genre: 'action', mood: ['excited'], runtime: 'long', year: 2015, rating: 8.1, streamingHints: ['HBO Max', 'Prime Video'] },
  { id: '6', title: 'Spirited Away', genre: 'animation', mood: ['relaxed', 'nostalgic', 'thoughtful'], runtime: 'long', year: 2001, rating: 8.6, streamingHints: ['HBO Max', 'Netflix'] },
  { id: '7', title: 'The Social Network', genre: 'drama', mood: ['thoughtful'], runtime: 'long', year: 2010, rating: 7.8, streamingHints: ['Netflix', 'Prime Video'] },
  { id: '8', title: 'Amélie', genre: 'romance', mood: ['romantic', 'relaxed', 'nostalgic'], runtime: 'long', year: 2001, rating: 8.3, streamingHints: ['Prime Video', 'Hulu'] },
  { id: '9', title: 'The Dark Knight', genre: 'action', mood: ['excited', 'thoughtful'], runtime: 'long', year: 2008, rating: 9.0, streamingHints: ['HBO Max', 'Netflix'] },
  { id: '10', title: 'Hereditary', genre: 'horror', mood: ['scared'], runtime: 'long', year: 2018, rating: 7.3, streamingHints: ['Prime Video', 'Showtime'] },
  { id: '11', title: 'Superbad', genre: 'comedy', mood: ['excited', 'relaxed'], runtime: 'medium', year: 2007, rating: 7.6, streamingHints: ['Netflix', 'Prime Video'] },
  { id: '12', title: 'Interstellar', genre: 'scifi', mood: ['thoughtful', 'excited'], runtime: 'epic', year: 2014, rating: 8.7, streamingHints: ['Paramount+', 'Prime Video'] },
  { id: '13', title: 'Free Solo', genre: 'documentary', mood: ['excited', 'thoughtful'], runtime: 'medium', year: 2018, rating: 8.2, streamingHints: ['Disney+', 'Hulu'] },
  { id: '14', title: 'The Lord of the Rings: Fellowship', genre: 'fantasy', mood: ['excited', 'nostalgic'], runtime: 'epic', year: 2001, rating: 8.8, streamingHints: ['HBO Max', 'Prime Video'] },
  { id: '15', title: 'A Quiet Place', genre: 'thriller', mood: ['scared', 'excited'], runtime: 'short', year: 2018, rating: 7.5, streamingHints: ['Paramount+', 'Prime Video'] },
];

const GENRES: { value: Genre; label: string; emoji: string }[] = [
  { value: 'action', label: 'Action', emoji: '💥' },
  { value: 'comedy', label: 'Comedy', emoji: '😂' },
  { value: 'drama', label: 'Drama', emoji: '🎭' },
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'scifi', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'romance', label: 'Romance', emoji: '💕' },
  { value: 'thriller', label: 'Thriller', emoji: '😱' },
  { value: 'animation', label: 'Animation', emoji: '🎨' },
  { value: 'documentary', label: 'Documentary', emoji: '📹' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
];

const MOODS: { value: Mood; label: string; description: string }[] = [
  { value: 'excited', label: 'Excited', description: 'Ready for action & thrills' },
  { value: 'relaxed', label: 'Relaxed', description: 'Easy watching, feel-good' },
  { value: 'romantic', label: 'Romantic', description: 'Love is in the air' },
  { value: 'thoughtful', label: 'Thoughtful', description: 'Something to ponder' },
  { value: 'scared', label: 'Scared', description: 'Bring on the scares' },
  { value: 'nostalgic', label: 'Nostalgic', description: 'Classic vibes' },
];

const RUNTIMES: { value: Runtime; label: string; range: string }[] = [
  { value: 'short', label: 'Short', range: 'Under 90 min' },
  { value: 'medium', label: 'Medium', range: '90-120 min' },
  { value: 'long', label: 'Long', range: '120-150 min' },
  { value: 'epic', label: 'Epic', range: '150+ min' },
];

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'genre', label: 'Genre' },
  { key: 'mood', label: 'Moods' },
  { key: 'runtime', label: 'Runtime' },
  { key: 'year', label: 'Year' },
  { key: 'rating', label: 'Rating' },
  { key: 'streamingHints', label: 'Streaming Services' },
];

interface MovieNightPickerToolProps {
  uiConfig?: UIConfig;
}

export const MovieNightPickerTool: React.FC<MovieNightPickerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.genre && GENRES.find(g => g.value === data.genre)) {
        setSelectedGenres([data.genre as Genre]);
      }
      if (data.mood && MOODS.find(m => m.value === data.mood)) {
        setSelectedMood(data.mood as Mood);
      }
      if (data.runtime && RUNTIMES.find(r => r.value === data.runtime)) {
        setSelectedRuntime(data.runtime as Runtime);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedRuntime, setSelectedRuntime] = useState<Runtime | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [pickedMovie, setPickedMovie] = useState<Movie | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState<'picker' | 'watchlist' | 'group'>('picker');

  // Group voting state
  const [groupMode, setGroupMode] = useState(false);
  const [groupVotes, setGroupVotes] = useState<GroupVote[]>([]);
  const [currentUser, setCurrentUser] = useState('User 1');
  const [groupUsers] = useState(['User 1', 'User 2', 'User 3', 'User 4']);

  // Export handlers
  const exportAsCSV = () => {
    const exportData = activeTab === 'watchlist' ? watchlist : activeTab === 'group' ? SAMPLE_MOVIES.filter(m => groupVotes.some(gv => gv.odId === m.id)) : filteredMovies;
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = exportData.map(movie => {
      const moods = Array.isArray(movie.mood) ? movie.mood.join('; ') : movie.mood;
      const streaming = Array.isArray(movie.streamingHints) ? movie.streamingHints.join('; ') : movie.streamingHints;
      return [
        `"${movie.id}"`,
        `"${movie.title}"`,
        `"${movie.genre}"`,
        `"${moods}"`,
        `"${movie.runtime}"`,
        `"${movie.year}"`,
        `"${movie.rating}"`,
        `"${streaming}"`,
      ].join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `movies-${Date.now()}.csv`;
    link.click();
  };

  const exportAsJSON = () => {
    const exportData = activeTab === 'watchlist' ? watchlist : activeTab === 'group' ? SAMPLE_MOVIES.filter(m => groupVotes.some(gv => gv.odId === m.id)) : filteredMovies;
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `movies-${Date.now()}.json`;
    link.click();
  };

  const copyToClipboard = async (): Promise<boolean> => {
    try {
      const exportData = activeTab === 'watchlist' ? watchlist : activeTab === 'group' ? SAMPLE_MOVIES.filter(m => groupVotes.some(gv => gv.odId === m.id)) : filteredMovies;
      const json = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(json);
      return true;
    } catch {
      return false;
    }
  };

  const filteredMovies = useMemo(() => {
    return SAMPLE_MOVIES.filter((movie) => {
      if (selectedGenres.length > 0 && !selectedGenres.includes(movie.genre)) return false;
      if (selectedMood && !movie.mood.includes(selectedMood)) return false;
      if (selectedRuntime && movie.runtime !== selectedRuntime) return false;
      return true;
    });
  }, [selectedGenres, selectedMood, selectedRuntime]);

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const pickRandomMovie = () => {
    if (filteredMovies.length === 0) return;
    setIsSpinning(true);
    setPickedMovie(null);

    // Simulate spinning animation
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredMovies.length);
      setPickedMovie(filteredMovies[randomIndex]);
      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  const addToWatchlist = (movie: Movie) => {
    if (watchlist.some((w) => w.id === movie.id)) return;
    setWatchlist((prev) => [...prev, { ...movie, addedAt: new Date() }]);
  };

  const removeFromWatchlist = (movieId: string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
  };

  const addToGroupVoting = (movie: Movie) => {
    if (groupVotes.some((v) => v.odId === movie.id)) return;
    setGroupVotes((prev) => [...prev, { odId: movie.id, odTitle: movie.title, votes: [] }]);
  };

  const castVote = (movieId: string, vote: 'up' | 'down') => {
    setGroupVotes((prev) =>
      prev.map((gv) => {
        if (gv.odId !== movieId) return gv;
        const existingVoteIndex = gv.votes.findIndex((v) => v.odUserId === currentUser);
        const newVotes = [...gv.votes];
        if (existingVoteIndex >= 0) {
          newVotes[existingVoteIndex] = { odUserId: currentUser, odVote: vote };
        } else {
          newVotes.push({ odUserId: currentUser, odVote: vote });
        }
        return { ...gv, votes: newVotes };
      })
    );
  };

  const getVoteCounts = (movieId: string) => {
    const gv = groupVotes.find((v) => v.odId === movieId);
    if (!gv) return { up: 0, down: 0 };
    const up = gv.votes.filter((v) => v.odVote === 'up').length;
    const down = gv.votes.filter((v) => v.odVote === 'down').length;
    return { up, down };
  };

  const getUserVote = (movieId: string) => {
    const gv = groupVotes.find((v) => v.odId === movieId);
    if (!gv) return null;
    const vote = gv.votes.find((v) => v.odUserId === currentUser);
    return vote?.odVote || null;
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedMood(null);
    setSelectedRuntime(null);
    setPickedMovie(null);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Film className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movieNightPicker.movieNightPicker', 'Movie Night Picker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movieNightPicker.findThePerfectMovieFor', 'Find the perfect movie for any occasion')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={exportAsCSV}
            onExportJSON={exportAsJSON}
            onCopyToClipboard={copyToClipboard}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {[
          { id: 'picker', label: 'Pick a Movie', icon: Sparkles },
          { id: 'watchlist', label: `Watchlist (${watchlist.length})`, icon: Heart },
          { id: 'group', label: 'Group Vote', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'picker' | 'watchlist' | 'group')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `${isDark ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'picker' && (
          <>
            {/* Genre Filter */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.movieNightPicker.genreSelectMultiple', 'Genre (select multiple)')}
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre.value}
                    onClick={() => toggleGenre(genre.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                      selectedGenres.includes(genre.value)
                        ? 'bg-purple-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{genre.emoji}</span>
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Sparkles className="w-4 h-4 inline mr-1" />
                {t('tools.movieNightPicker.howAreYouFeeling', 'How are you feeling?')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      selectedMood === mood.value
                        ? 'bg-purple-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{mood.label}</div>
                    <div className={`text-xs ${selectedMood === mood.value ? 'text-purple-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {mood.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Runtime Preference */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                {t('tools.movieNightPicker.howMuchTimeDoYou', 'How much time do you have?')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {RUNTIMES.map((runtime) => (
                  <button
                    key={runtime.value}
                    onClick={() => setSelectedRuntime(selectedRuntime === runtime.value ? null : runtime.value)}
                    className={`py-2 px-3 rounded-lg text-center transition-colors ${
                      selectedRuntime === runtime.value
                        ? 'bg-purple-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{runtime.label}</div>
                    <div className={`text-xs ${selectedRuntime === runtime.value ? 'text-purple-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {runtime.range}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Info & Clear */}
            <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} match your criteria
              </span>
              {(selectedGenres.length > 0 || selectedMood || selectedRuntime) && (
                <button
                  onClick={clearFilters}
                  className={`text-sm ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  {t('tools.movieNightPicker.clearFilters', 'Clear filters')}
                </button>
              )}
            </div>

            {/* Random Pick Button */}
            <button
              onClick={pickRandomMovie}
              disabled={filteredMovies.length === 0 || isSpinning}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                filteredMovies.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isSpinning
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? t('tools.movieNightPicker.picking', 'Picking...') : t('tools.movieNightPicker.pickRandomMovie', 'Pick Random Movie')}
            </button>

            {/* Picked Movie Result */}
            {pickedMovie && !isSpinning && (
              <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {t('tools.movieNightPicker.tonightSPick', 'Tonight\'s Pick')}
                    </div>
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {pickedMovie.title}
                    </h4>
                    <div className={`flex items-center gap-3 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>{pickedMovie.year}</span>
                      <span>|</span>
                      <span>{GENRES.find((g) => g.value === pickedMovie.genre)?.label}</span>
                      <span>|</span>
                      <span className="text-yellow-500">★ {pickedMovie.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToWatchlist(pickedMovie)}
                    className={`p-2 rounded-lg transition-colors ${
                      watchlist.some((w) => w.id === pickedMovie.id)
                        ? 'bg-pink-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={watchlist.some((w) => w.id === pickedMovie.id) ? t('tools.movieNightPicker.inWatchlist', 'In watchlist') : t('tools.movieNightPicker.addToWatchlist', 'Add to watchlist')}
                  >
                    <Heart className={`w-5 h-5 ${watchlist.some((w) => w.id === pickedMovie.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Streaming Hints */}
                <div className="mt-4">
                  <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <Tv className="w-3 h-3 inline mr-1" />
                    {t('tools.movieNightPicker.possiblyAvailableOn', 'Possibly available on:')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pickedMovie.streamingHints.map((service) => (
                      <span
                        key={service}
                        className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={pickRandomMovie}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t('tools.movieNightPicker.pickAnother', 'Pick Another')}
                  </button>
                  <button
                    onClick={() => addToGroupVoting(pickedMovie)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t('tools.movieNightPicker.addToGroupVote', 'Add to Group Vote')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'watchlist' && (
          <>
            {watchlist.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.movieNightPicker.yourWatchlistIsEmpty', 'Your watchlist is empty')}</p>
                <p className="text-sm mt-1">{t('tools.movieNightPicker.pickSomeMoviesToSave', 'Pick some movies to save them here')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((movie) => (
                  <div
                    key={movie.id}
                    className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{movie.title}</h4>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {movie.year} | {GENRES.find((g) => g.value === movie.genre)?.label} | ★ {movie.rating}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.streamingHints.map((service) => (
                          <span
                            key={service}
                            className={`px-1.5 py-0.5 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToGroupVoting(movie)}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        title={t('tools.movieNightPicker.addToGroupVote2', 'Add to group vote')}
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(movie.id)}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-red-400 hover:bg-red-900/30' : 'bg-gray-200 text-red-500 hover:bg-red-100'}`}
                        title={t('tools.movieNightPicker.removeFromWatchlist', 'Remove from watchlist')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'group' && (
          <>
            {/* User Selector */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.movieNightPicker.votingAs', 'Voting as:')}
              </label>
              <div className="flex flex-wrap gap-2">
                {groupUsers.map((user) => (
                  <button
                    key={user}
                    onClick={() => setCurrentUser(user)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      currentUser === user
                        ? 'bg-purple-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>

            {/* Group Voting List */}
            {groupVotes.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.movieNightPicker.noMoviesAddedForGroup', 'No movies added for group voting')}</p>
                <p className="text-sm mt-1">{t('tools.movieNightPicker.pickMoviesAndAddThem', 'Pick movies and add them here to vote together')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupVotes
                  .sort((a, b) => {
                    const aCount = getVoteCounts(a.odId);
                    const bCount = getVoteCounts(b.odId);
                    return (bCount.up - bCount.down) - (aCount.up - aCount.down);
                  })
                  .map((gv) => {
                    const movie = SAMPLE_MOVIES.find((m) => m.id === gv.odId);
                    const counts = getVoteCounts(gv.odId);
                    const userVote = getUserVote(gv.odId);
                    const score = counts.up - counts.down;

                    return (
                      <div
                        key={gv.odId}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{gv.odTitle}</h4>
                            {movie && (
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {movie.year} | {GENRES.find((g) => g.value === movie.genre)?.label}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`text-lg font-bold ${score > 0 ? 'text-green-500' : score < 0 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {score > 0 ? '+' : ''}{score}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => castVote(gv.odId, 'up')}
                                className={`p-2 rounded-lg transition-colors ${
                                  userVote === 'up'
                                    ? 'bg-green-500 text-white'
                                    : isDark
                                    ? 'bg-gray-700 text-gray-300 hover:bg-green-900/50'
                                    : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => castVote(gv.odId, 'down')}
                                className={`p-2 rounded-lg transition-colors ${
                                  userVote === 'down'
                                    ? 'bg-red-500 text-white'
                                    : isDark
                                    ? 'bg-gray-700 text-gray-300 hover:bg-red-900/50'
                                    : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                                }`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {counts.up} upvote{counts.up !== 1 ? 's' : ''} | {counts.down} downvote{counts.down !== 1 ? 's' : ''} | {gv.votes.length}/{groupUsers.length} voted
                        </div>
                      </div>
                    );
                  })}

                {/* Winner Banner */}
                {groupVotes.length > 0 && groupVotes.every((gv) => gv.votes.length === groupUsers.length) && (
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        Everyone voted! Winner:{' '}
                        {groupVotes.sort((a, b) => {
                          const aCount = getVoteCounts(a.odId);
                          const bCount = getVoteCounts(b.odId);
                          return (bCount.up - bCount.down) - (aCount.up - aCount.down);
                        })[0]?.odTitle}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Quick Movies to Group */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.movieNightPicker.quickAddFromSuggestions', 'Quick add from suggestions:')}
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_MOVIES.slice(0, 5)
                  .filter((m) => !groupVotes.some((gv) => gv.odId === m.id))
                  .map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => addToGroupVoting(movie)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Plus className="w-3 h-3" />
                      {movie.title}
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieNightPickerTool;
