import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones, Play, Pause, Heart, Clock, List, StickyNote, Plus, Trash2, Check, ChevronDown, ChevronUp, Star, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface Episode {
  id: string;
  title: string;
  duration: number; // in minutes
  listenedAt?: Date;
  progress: number; // percentage 0-100
  notes: string;
  isFavorite: boolean;
}

interface Podcast {
  id: string;
  name: string;
  author: string;
  category: string;
  imageUrl?: string;
  episodes: Episode[];
  isFavorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type ViewTab = 'podcasts' | 'queue' | 'history' | 'stats';

interface PodcastTrackerToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for export (flattened episode data with podcast info)
const podcastEpisodeColumns: ColumnConfig[] = [
  { key: 'podcastName', header: 'Podcast', type: 'string' },
  { key: 'author', header: 'Author', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'episodeTitle', header: 'Episode Title', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'progress', header: 'Progress (%)', type: 'number' },
  { key: 'listenedAt', header: 'Listened Date', type: 'date' },
  { key: 'isFavorite', header: 'Favorite', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Column configuration for podcast data storage
const podcastColumns: ColumnConfig[] = [
  { key: 'name', header: 'Podcast Name', type: 'string' },
  { key: 'author', header: 'Author', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'isFavorite', header: 'Favorite', type: 'boolean' },
];

export const PodcastTrackerTool: React.FC<PodcastTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  const [activeTab, setActiveTab] = useState<ViewTab>('podcasts');

  // Default podcasts data for initialization
  const defaultPodcasts: Podcast[] = [
    {
      id: '1',
      name: 'Tech Talk Daily',
      author: 'John Smith',
      category: 'Technology',
      episodes: [
        { id: '1-1', title: 'The Future of AI', duration: 45, progress: 100, notes: 'Great insights on GPT models', isFavorite: true, listenedAt: new Date('2024-12-20') },
        { id: '1-2', title: 'Web Development Trends', duration: 38, progress: 60, notes: '', isFavorite: false },
        { id: '1-3', title: 'Cloud Computing Basics', duration: 52, progress: 0, notes: '', isFavorite: false },
      ],
      isFavorite: true,
      createdAt: new Date('2024-12-15').toISOString(),
      updatedAt: new Date('2024-12-20').toISOString(),
    },
    {
      id: '2',
      name: 'Mindful Moments',
      author: 'Sarah Johnson',
      category: 'Health & Wellness',
      episodes: [
        { id: '2-1', title: 'Morning Meditation Guide', duration: 20, progress: 100, notes: 'Perfect for starting the day', isFavorite: true, listenedAt: new Date('2024-12-22') },
        { id: '2-2', title: 'Stress Management', duration: 35, progress: 0, notes: '', isFavorite: false },
      ],
      isFavorite: false,
      createdAt: new Date('2024-12-18').toISOString(),
      updatedAt: new Date('2024-12-22').toISOString(),
    },
  ];

  // useToolData hook for podcasts management with backend sync
  // Note: We use custom export functions instead of hook's export methods because
  // we need to flatten the nested podcast/episode structure for human-readable exports.
  // The hook handles CRUD operations and sync, while exports use the flattened exportData.
  const {
    data: podcasts,
    addItem: addPodcast,
    updateItem: updatePodcast,
    deleteItem: deletePodcast,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Podcast>('podcast-tracker', defaultPodcasts, podcastColumns);

  const [queue, setQueue] = useState<{ podcastId: string; episodeId: string }[]>([
    { podcastId: '1', episodeId: '1-3' },
    { podcastId: '2', episodeId: '2-2' },
  ]);

  const [expandedPodcast, setExpandedPodcast] = useState<string | null>('1');
  const [showAddPodcast, setShowAddPodcast] = useState(false);
  const [newPodcastName, setNewPodcastName] = useState('');
  const [newPodcastAuthor, setNewPodcastAuthor] = useState('');
  const [newPodcastCategory, setNewPodcastCategory] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const categories = ['Technology', 'Health & Wellness', 'Business', 'Entertainment', 'Education', 'News', 'Comedy', 'Sports'];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.podcastName) {
        setNewPodcastName(data.podcastName as string);
        setShowAddPodcast(true);
      }
      if (data.author) {
        setNewPodcastAuthor(data.author as string);
      }
      if (data.category && categories.includes(data.category as string)) {
        setNewPodcastCategory(data.category as string);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.activeTab) setActiveTab(params.activeTab);
      if (params.queue) setQueue(params.queue);
      if (params.newPodcastName) setNewPodcastName(params.newPodcastName);
      if (params.newPodcastAuthor) setNewPodcastAuthor(params.newPodcastAuthor);
      if (params.newPodcastCategory) setNewPodcastCategory(params.newPodcastCategory);
      if (params.showAddPodcast) setShowAddPodcast(params.showAddPodcast);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalEpisodes = 0;
    let completedEpisodes = 0;
    let totalListeningTime = 0;
    let favoriteEpisodes = 0;

    podcasts.forEach((podcast) => {
      podcast.episodes.forEach((episode) => {
        totalEpisodes++;
        if (episode.progress === 100) {
          completedEpisodes++;
          totalListeningTime += episode.duration;
        } else if (episode.progress > 0) {
          totalListeningTime += Math.round((episode.duration * episode.progress) / 100);
        }
        if (episode.isFavorite) favoriteEpisodes++;
      });
    });

    const hours = Math.floor(totalListeningTime / 60);
    const minutes = totalListeningTime % 60;

    return {
      totalPodcasts: podcasts.length,
      totalEpisodes,
      completedEpisodes,
      inProgress: totalEpisodes - completedEpisodes,
      totalListeningTime: `${hours}h ${minutes}m`,
      favoriteEpisodes,
      favoritePodcasts: podcasts.filter((p) => p.isFavorite).length,
      queueLength: queue.length,
    };
  }, [podcasts, queue]);

  // Get listening history
  const listeningHistory = useMemo(() => {
    const history: { podcast: Podcast; episode: Episode }[] = [];
    podcasts.forEach((podcast) => {
      podcast.episodes.forEach((episode) => {
        if (episode.listenedAt) {
          history.push({ podcast, episode });
        }
      });
    });
    return history.sort((a, b) =>
      (b.episode.listenedAt?.getTime() || 0) - (a.episode.listenedAt?.getTime() || 0)
    );
  }, [podcasts]);

  // Prepare flattened export data (all episodes with podcast info)
  const exportData = useMemo(() => {
    const data: Record<string, any>[] = [];
    podcasts.forEach((podcast) => {
      podcast.episodes.forEach((episode) => {
        data.push({
          podcastName: podcast.name,
          author: podcast.author,
          category: podcast.category,
          episodeTitle: episode.title,
          duration: episode.duration,
          progress: episode.progress,
          listenedAt: episode.listenedAt?.toISOString() || '',
          isFavorite: episode.isFavorite,
          notes: episode.notes,
        });
      });
    });
    return data;
  }, [podcasts]);

  const togglePodcastFavorite = (podcastId: string) => {
    const podcast = podcasts.find((p) => p.id === podcastId);
    if (podcast) {
      updatePodcast(podcastId, { isFavorite: !podcast.isFavorite, updatedAt: new Date().toISOString() });
    }
  };

  const toggleEpisodeFavorite = (podcastId: string, episodeId: string) => {
    const podcast = podcasts.find((p) => p.id === podcastId);
    if (podcast) {
      const updatedEpisodes = podcast.episodes.map((e) =>
        e.id === episodeId ? { ...e, isFavorite: !e.isFavorite } : e
      );
      updatePodcast(podcastId, { episodes: updatedEpisodes, updatedAt: new Date().toISOString() });
    }
  };

  const updateEpisodeProgress = (podcastId: string, episodeId: string, progress: number) => {
    const podcast = podcasts.find((p) => p.id === podcastId);
    if (podcast) {
      const updatedEpisodes = podcast.episodes.map((e) =>
        e.id === episodeId
          ? { ...e, progress, listenedAt: progress === 100 ? new Date() : e.listenedAt }
          : e
      );
      updatePodcast(podcastId, { episodes: updatedEpisodes, updatedAt: new Date().toISOString() });
    }
  };

  const saveEpisodeNotes = (podcastId: string, episodeId: string) => {
    const podcast = podcasts.find((p) => p.id === podcastId);
    if (podcast) {
      const updatedEpisodes = podcast.episodes.map((e) =>
        e.id === episodeId ? { ...e, notes: tempNotes } : e
      );
      updatePodcast(podcastId, { episodes: updatedEpisodes, updatedAt: new Date().toISOString() });
    }
    setEditingNotes(null);
    setTempNotes('');
  };

  const addToQueue = (podcastId: string, episodeId: string) => {
    if (!queue.find((q) => q.podcastId === podcastId && q.episodeId === episodeId)) {
      setQueue((prev) => [...prev, { podcastId, episodeId }]);
    }
  };

  const removeFromQueue = (podcastId: string, episodeId: string) => {
    setQueue((prev) =>
      prev.filter((q) => !(q.podcastId === podcastId && q.episodeId === episodeId))
    );
  };

  const handleAddPodcast = () => {
    if (newPodcastName.trim() && newPodcastAuthor.trim()) {
      const newPodcast: Podcast = {
        id: Date.now().toString(),
        name: newPodcastName.trim(),
        author: newPodcastAuthor.trim(),
        category: newPodcastCategory || 'Uncategorized',
        episodes: [],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addPodcast(newPodcast);
      setNewPodcastName('');
      setNewPodcastAuthor('');
      setNewPodcastCategory('');
      setShowAddPodcast(false);

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    }
  };

  const handleDeletePodcast = (podcastId: string) => {
    deletePodcast(podcastId);
    setQueue((prev) => prev.filter((q) => q.podcastId !== podcastId));
  };

  const addEpisode = (podcastId: string, title: string, duration: number) => {
    const podcast = podcasts.find((p) => p.id === podcastId);
    if (podcast) {
      const newEpisode: Episode = {
        id: `${podcastId}-${Date.now()}`,
        title,
        duration,
        progress: 0,
        notes: '',
        isFavorite: false,
      };
      updatePodcast(podcastId, { episodes: [...podcast.episodes, newEpisode], updatedAt: new Date().toISOString() });
    }
  };

  const getQueueEpisodes = () => {
    return queue
      .map((q) => {
        const podcast = podcasts.find((p) => p.id === q.podcastId);
        const episode = podcast?.episodes.find((e) => e.id === q.episodeId);
        return podcast && episode ? { podcast, episode } : null;
      })
      .filter(Boolean) as { podcast: Podcast; episode: Episode }[];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Headphones className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.podcastTracker.podcastTracker', 'Podcast Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.podcastTracker.trackYourPodcastListeningJourney', 'Track your podcast listening journey')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="podcast-tracker" toolName="Podcast Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            <ExportDropdown
              onExportCSV={() => exportToCSV(exportData, podcastEpisodeColumns, { filename: 'podcast-tracker' })}
              onExportExcel={() => exportToExcel(exportData, podcastEpisodeColumns, { filename: 'podcast-tracker' })}
              onExportJSON={() => exportToJSON(exportData, { filename: 'podcast-tracker' })}
              onExportPDF={() => exportToPDF(exportData, podcastEpisodeColumns, { filename: 'podcast-tracker', title: 'Podcast Tracker Report' })}
              onPrint={() => printData(exportData, podcastEpisodeColumns, { title: 'Podcast Tracker Report' })}
              onCopyToClipboard={() => copyUtil(exportData, podcastEpisodeColumns)}
              disabled={exportData.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
        <div className="flex gap-2">
          {(['podcasts', 'queue', 'history', 'stats'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'queue' ? `Queue (${queue.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Podcasts Tab */}
        {activeTab === 'podcasts' && (
          <>
            {/* Add Podcast Button */}
            {!showAddPodcast && (
              <button
                onClick={() => setShowAddPodcast(true)}
                className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400'
                    : 'border-gray-300 text-gray-500 hover:border-purple-500 hover:text-purple-500'
                }`}
              >
                <Plus className="w-5 h-5" />
                {t('tools.podcastTracker.addNewPodcast', 'Add New Podcast')}
              </button>
            )}

            {/* Add Podcast Form */}
            {showAddPodcast && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
                <input
                  type="text"
                  placeholder={t('tools.podcastTracker.podcastName', 'Podcast Name')}
                  value={newPodcastName}
                  onChange={(e) => setNewPodcastName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.podcastTracker.authorHost', 'Author/Host')}
                  value={newPodcastAuthor}
                  onChange={(e) => setNewPodcastAuthor(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={newPodcastCategory}
                  onChange={(e) => setNewPodcastCategory(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">{t('tools.podcastTracker.selectCategory', 'Select Category')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPodcast}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    {t('tools.podcastTracker.addPodcast', 'Add Podcast')}
                  </button>
                  <button
                    onClick={() => setShowAddPodcast(false)}
                    className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.podcastTracker.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Podcast List */}
            <div className="space-y-4">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  {/* Podcast Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedPodcast(expandedPodcast === podcast.id ? null : podcast.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <Headphones className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{podcast.name}</h4>
                          {podcast.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {podcast.author} • {podcast.category}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {podcast.episodes.length} episodes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePodcastFavorite(podcast.id);
                        }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      >
                        <Heart className={`w-5 h-5 ${podcast.isFavorite ? 'text-red-500 fill-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePodcast(podcast.id);
                        }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {expandedPodcast === podcast.id ? (
                        <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>
                  </div>

                  {/* Episodes */}
                  {expandedPodcast === podcast.id && (
                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      {podcast.episodes.length === 0 ? (
                        <p className={`p-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.podcastTracker.noEpisodesAddedYet', 'No episodes added yet')}
                        </p>
                      ) : (
                        podcast.episodes.map((episode) => (
                          <div
                            key={episode.id}
                            className={`p-4 border-b last:border-b-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {episode.title}
                                  </h5>
                                  {episode.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                </div>
                                <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {episode.duration} min
                                  </span>
                                  {episode.listenedAt && (
                                    <span>Listened: {formatDate(episode.listenedAt)}</span>
                                  )}
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2">
                                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                      className="h-2 rounded-full bg-purple-500 transition-all"
                                      style={{ width: `${episode.progress}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {episode.progress}% complete
                                    </span>
                                    <div className="flex gap-1">
                                      {[0, 25, 50, 75, 100].map((p) => (
                                        <button
                                          key={p}
                                          onClick={() => updateEpisodeProgress(podcast.id, episode.id, p)}
                                          className={`px-2 py-0.5 text-xs rounded ${
                                            episode.progress === p
                                              ? 'bg-purple-500 text-white'
                                              : isDark
                                              ? 'bg-gray-700 text-gray-400'
                                              : 'bg-gray-200 text-gray-600'
                                          }`}
                                        >
                                          {p}%
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {editingNotes === episode.id ? (
                                  <div className="mt-3 space-y-2">
                                    <textarea
                                      value={tempNotes}
                                      onChange={(e) => setTempNotes(e.target.value)}
                                      placeholder={t('tools.podcastTracker.addNotesAboutThisEpisode', 'Add notes about this episode...')}
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                      rows={3}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => saveEpisodeNotes(podcast.id, episode.id)}
                                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
                                      >
                                        {t('tools.podcastTracker.save', 'Save')}
                                      </button>
                                      <button
                                        onClick={() => setEditingNotes(null)}
                                        className={`px-3 py-1 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                      >
                                        {t('tools.podcastTracker.cancel2', 'Cancel')}
                                      </button>
                                    </div>
                                  </div>
                                ) : episode.notes ? (
                                  <div
                                    onClick={() => {
                                      setEditingNotes(episode.id);
                                      setTempNotes(episode.notes);
                                    }}
                                    className={`mt-3 p-2 rounded-lg text-sm cursor-pointer ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                  >
                                    <StickyNote className="w-3 h-3 inline mr-1" />
                                    {episode.notes}
                                  </div>
                                ) : null}
                              </div>

                              {/* Episode Actions */}
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => toggleEpisodeFavorite(podcast.id, episode.id)}
                                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                  <Star className={`w-4 h-4 ${episode.isFavorite ? 'text-yellow-500 fill-yellow-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(episode.id);
                                    setTempNotes(episode.notes);
                                  }}
                                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                  <StickyNote className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                </button>
                                <button
                                  onClick={() => addToQueue(podcast.id, episode.id)}
                                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                  <List className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Add Episode */}
                      <AddEpisodeForm
                        isDark={isDark}
                        onAdd={(title, duration) => addEpisode(podcast.id, title, duration)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Up Next ({queue.length} episodes)
            </h4>
            {queue.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.podcastTracker.yourQueueIsEmpty', 'Your queue is empty')}</p>
                <p className="text-sm mt-1">{t('tools.podcastTracker.addEpisodesFromYourPodcasts', 'Add episodes from your podcasts to build your queue')}</p>
              </div>
            ) : (
              getQueueEpisodes().map(({ podcast, episode }, index) => (
                <div
                  key={`${podcast.id}-${episode.id}`}
                  className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <span className={`text-lg font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {episode.title}
                    </h5>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {podcast.name} • {episode.duration} min
                    </p>
                  </div>
                  <button
                    onClick={() => updateEpisodeProgress(podcast.id, episode.id, 100)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromQueue(podcast.id, episode.id)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.podcastTracker.listeningHistory', 'Listening History')}
            </h4>
            {listeningHistory.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.podcastTracker.noListeningHistoryYet', 'No listening history yet')}</p>
                <p className="text-sm mt-1">{t('tools.podcastTracker.startListeningToEpisodesTo', 'Start listening to episodes to build your history')}</p>
              </div>
            ) : (
              listeningHistory.map(({ podcast, episode }) => (
                <div
                  key={`${podcast.id}-${episode.id}`}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {episode.title}
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {podcast.name}
                      </p>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {episode.listenedAt && formatDate(episode.listenedAt)}
                    </div>
                  </div>
                  {episode.notes && (
                    <div className={`mt-2 p-2 rounded text-sm ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      <StickyNote className="w-3 h-3 inline mr-1" />
                      {episode.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.podcastTracker.listeningStatistics', 'Listening Statistics')}
            </h4>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.podcastTracker.totalTime', 'Total Time')}</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">{stats.totalListeningTime}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.podcastTracker.podcasts', 'Podcasts')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">{stats.totalPodcasts}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.podcastTracker.completed', 'Completed')}</span>
                </div>
                <div className="text-2xl font-bold text-green-500">{stats.completedEpisodes}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.podcastTracker.inProgress', 'In Progress')}</span>
                </div>
                <div className="text-2xl font-bold text-orange-500">{stats.inProgress}</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.podcastTracker.summary', 'Summary')}</h5>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.podcastTracker.totalEpisodes', 'Total Episodes:')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalEpisodes}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.podcastTracker.favoritePodcasts', 'Favorite Podcasts:')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.favoritePodcasts}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.podcastTracker.favoriteEpisodes', 'Favorite Episodes:')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.favoriteEpisodes}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.podcastTracker.queueLength', 'Queue Length:')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.queueLength}</div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex justify-between mb-2">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.podcastTracker.completionRate', 'Completion Rate')}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalEpisodes > 0 ? Math.round((stats.completedEpisodes / stats.totalEpisodes) * 100) : 0}%
                </span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${stats.totalEpisodes > 0 ? (stats.completedEpisodes / stats.totalEpisodes) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for adding episodes
const AddEpisodeForm: React.FC<{ isDark: boolean; onAdd: (title: string, duration: number) => void }> = ({
  isDark,
  onAdd,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = () => {
    if (title.trim() && duration) {
      onAdd(title.trim(), parseInt(duration));
      setTitle('');
      setDuration('');
      setShowForm(false);
    }
  };

  return (
    <div className={`p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full py-2 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm ${
            isDark
              ? 'border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400'
              : 'border-gray-300 text-gray-500 hover:border-purple-500 hover:text-purple-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.podcastTracker.addEpisode', 'Add Episode')}
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder={t('tools.podcastTracker.episodeTitle', 'Episode Title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <input
            type="number"
            placeholder={t('tools.podcastTracker.durationMinutes', 'Duration (minutes)')}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
            >
              {t('tools.podcastTracker.add', 'Add')}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className={`flex-1 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {t('tools.podcastTracker.cancel3', 'Cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastTrackerTool;
