/**
 * Podcast Component Generators
 */

export interface PodcastOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePodcastPlayer(options: PodcastOptions = {}): string {
  const { componentName = 'PodcastPlayer' } = options;

  return `import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Bookmark } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  podcast_name: string;
  src: string;
  cover_url?: string;
  duration?: number;
}

interface ${componentName}Props {
  episode: Episode;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ episode, onNext, onPrevious }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (audioRef.current && episode.src) {
      audioRef.current.src = episode.src;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [episode.src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hours > 0) {
      return \`\${hours}:\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
    }
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={onNext}
      />

      <div className="flex gap-6">
        {episode.cover_url ? (
          <img src={episode.cover_url} alt={episode.title} className="w-32 h-32 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-32 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Play className="w-12 h-12 text-purple-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{episode.title}</h2>
          <p className="text-gray-500">{episode.podcast_name}</p>

          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(duration - currentTime)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button onClick={() => skip(-15)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Rewind 15s">
                <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button onClick={togglePlay} className="p-4 bg-purple-600 rounded-full hover:bg-purple-700">
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
              </button>
              <button onClick={() => skip(30)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Forward 30s">
                <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={changePlaybackRate}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {playbackRate}x
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bookmark className="w-5 h-5 text-gray-500" />
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {isMuted ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateEpisodeList(options: PodcastOptions = {}): string {
  const { componentName = 'EpisodeList', endpoint = '/episodes' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Play, Clock, Calendar, Download, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  podcastId?: string;
  currentEpisodeId?: string;
  onSelectEpisode: (episode: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ podcastId, currentEpisodeId, onSelectEpisode }) => {
  const { data: episodes, isLoading } = useQuery({
    queryKey: ['episodes', podcastId],
    queryFn: async () => {
      const url = '${endpoint}' + (podcastId ? '?podcast_id=' + podcastId : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {episodes?.map((episode: any) => {
        const isCurrent = currentEpisodeId === episode.id;
        return (
          <div
            key={episode.id}
            className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 \${
              isCurrent ? 'ring-2 ring-purple-500' : ''
            }\`}
          >
            <div className="flex gap-4">
              {episode.cover_url ? (
                <img src={episode.cover_url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className={\`font-semibold \${isCurrent ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
                  {episode.title}
                </h3>
                {episode.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{episode.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {episode.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(episode.published_at).toLocaleDateString()}
                    </span>
                  )}
                  {episode.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {episode.duration}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectEpisode(episode)}
                  className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePodcastGrid(options: PodcastOptions = {}): string {
  const { componentName = 'PodcastGrid', endpoint = '/podcasts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Mic, Play } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: podcasts, isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {podcasts && podcasts.length > 0 ? (
        podcasts.map((podcast: any) => (
          <Link
            key={podcast.id}
            to={\`/podcasts/\${podcast.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="relative aspect-square">
              {podcast.cover_url ? (
                <img src={podcast.cover_url} alt={podcast.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-16 h-16 text-white/80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Play className="w-7 h-7 text-purple-600 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{podcast.title}</h3>
              {podcast.author && (
                <p className="text-sm text-gray-500 mt-0.5">{podcast.author}</p>
              )}
              {podcast.category && (
                <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs mt-2">
                  {podcast.category}
                </span>
              )}
              {podcast.episode_count !== undefined && (
                <p className="text-xs text-gray-400 mt-2">{podcast.episode_count} episodes</p>
              )}
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No podcasts found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePodcastSearch(options: PodcastOptions = {}): string {
  const { componentName = 'PodcastSearch', endpoint = '/podcasts/search' } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, Mic, X, Filter, Play, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSelect?: (podcast: any) => void;
  placeholder?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSelect, placeholder = 'Search podcasts...' }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    language: '',
  });

  // Debounce search
  const debounceSearch = useCallback((value: string) => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value);
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['podcast-search', debouncedQuery, filters],
    queryFn: async () => {
      if (!debouncedQuery && !filters.category && !filters.language) return [];
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.language) params.append('language', filters.language);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!(debouncedQuery || filters.category || filters.language),
  });

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  const categories = ['Technology', 'Business', 'Comedy', 'News', 'Education', 'Health', 'Sports', 'Music', 'True Crime', 'Society'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean', 'Chinese'];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={\`p-2 rounded-lg transition-colors \${
              showFilters ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
            }\`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {results && results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {results.map((podcast: any) => (
            <div
              key={podcast.id}
              onClick={() => onSelect?.(podcast)}
              className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              {podcast.cover_url ? (
                <img src={podcast.cover_url} alt={podcast.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic className="w-8 h-8 text-white/80" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{podcast.title}</h4>
                <p className="text-sm text-gray-500">{podcast.author}</p>
                <div className="flex items-center gap-2 mt-1">
                  {podcast.category && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                      {podcast.category}
                    </span>
                  )}
                  {podcast.episode_count !== undefined && (
                    <span className="text-xs text-gray-400">{podcast.episode_count} episodes</span>
                  )}
                </div>
              </div>
              <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 self-center">
                <Play className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && results && results.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No podcasts found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateEpisodeCard(options: PodcastOptions = {}): string {
  const { componentName = 'EpisodeCard' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Clock, Calendar, Download, Share2, Heart, MoreVertical, CheckCircle } from 'lucide-react';

interface ${componentName}Props {
  episode: {
    id: string;
    title: string;
    description?: string;
    cover_url?: string;
    podcast_name?: string;
    podcast_id?: string;
    duration?: string;
    published_at?: string;
    is_played?: boolean;
    progress?: number;
  };
  variant?: 'card' | 'compact' | 'list';
  isPlaying?: boolean;
  onPlay?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  episode,
  variant = 'card',
  isPlaying = false,
  onPlay,
  onDownload,
  onShare,
  onLike,
  isLiked = false
}) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return \`\${days} days ago\`;
    if (days < 30) return \`\${Math.floor(days / 7)} weeks ago\`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
        <button
          onClick={onPlay}
          className={\`p-2 rounded-full flex-shrink-0 \${
            isPlaying ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
          }\`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={\`font-medium text-sm truncate \${isPlaying ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
            {episode.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {episode.duration && <span>{episode.duration}</span>}
            {episode.is_played && <CheckCircle className="w-3 h-3 text-green-500" />}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative flex-shrink-0">
          {episode.cover_url ? (
            <img src={episode.cover_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Play className="w-8 h-8 text-white/80" />
            </div>
          )}
          {episode.progress !== undefined && episode.progress > 0 && episode.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
              <div className="h-full bg-purple-600" style={{ width: \`\${episode.progress}%\` }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={\`font-semibold line-clamp-1 \${isPlaying ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
                {episode.title}
              </h3>
              {episode.podcast_name && (
                <Link
                  to={\`/podcasts/\${episode.podcast_id}\`}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {episode.podcast_name}
                </Link>
              )}
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          {episode.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{episode.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {episode.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(episode.published_at)}
                </span>
              )}
              {episode.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {episode.duration}
                </span>
              )}
              {episode.is_played && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Played
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onPlay}
                className={\`p-2 rounded-full \${
                  isPlaying ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200'
                }\`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              {onDownload && (
                <button onClick={onDownload} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-square">
        {episode.cover_url ? (
          <img src={episode.cover_url} alt={episode.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Play className="w-16 h-16 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onPlay}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-purple-600" />
            ) : (
              <Play className="w-7 h-7 text-purple-600 ml-1" fill="currentColor" />
            )}
          </button>
        </div>
        {episode.duration && (
          <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {episode.duration}
          </span>
        )}
        {episode.progress !== undefined && episode.progress > 0 && episode.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50">
            <div className="h-full bg-purple-600" style={{ width: \`\${episode.progress}%\` }} />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className={\`font-semibold line-clamp-2 \${isPlaying ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
          {episode.title}
        </h3>
        {episode.podcast_name && (
          <Link
            to={\`/podcasts/\${episode.podcast_id}\`}
            className="text-sm text-gray-500 hover:text-purple-600 mt-0.5 block"
          >
            {episode.podcast_name}
          </Link>
        )}
        {episode.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-2">{episode.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {episode.published_at && <span>{formatDate(episode.published_at)}</span>}
            {episode.is_played && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onLike && (
              <button
                onClick={onLike}
                className={\`p-1.5 rounded-lg \${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}\`}
              >
                <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            )}
            {onShare && (
              <button onClick={onShare} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {onDownload && (
              <button onClick={onDownload} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
