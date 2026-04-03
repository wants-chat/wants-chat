/**
 * Church Component Generators
 * Components for church management, sermons, and prayer requests
 */

export interface ChurchOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateChurchStats(options: ChurchOptions = {}): string {
  const { componentName = 'ChurchStats', endpoint = '/church' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Heart, Calendar, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['church-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/stats');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Members',
      value: stats?.total_members || 0,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      change: stats?.member_growth || '+0%'
    },
    {
      label: 'Weekly Attendance',
      value: stats?.weekly_attendance || 0,
      icon: Calendar,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      change: stats?.attendance_change || '+0%'
    },
    {
      label: 'Prayer Requests',
      value: stats?.active_prayers || 0,
      icon: Heart,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      change: null
    },
    {
      label: 'Sermons',
      value: stats?.total_sermons || 0,
      icon: BookOpen,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      change: null
    },
    {
      label: 'Monthly Donations',
      value: \`$\${(stats?.monthly_donations || 0).toLocaleString()}\`,
      icon: DollarSign,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
      change: stats?.donation_change || '+0%'
    },
    {
      label: 'Small Groups',
      value: stats?.small_groups || 0,
      icon: Users,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
      change: null
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-medium opacity-90">Welcome to {stats?.church_name || 'Our Church'}</h2>
        <p className="text-3xl font-bold mt-2">{stats?.weekly_attendance || 0} in attendance this week</p>
        <p className="text-sm mt-2 opacity-80">
          {stats?.next_service || 'Sunday Service at 10:00 AM'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className={\`p-3 rounded-lg \${stat.color}\`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.change && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSermonList(options: ChurchOptions = {}): string {
  const { componentName = 'SermonList', endpoint = '/sermons' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Play, Calendar, User, Clock, Search, Filter, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showFilters?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit, showFilters = true }) => {
  const [search, setSearch] = useState('');
  const [series, setSeries] = useState('all');

  const { data: sermons, isLoading } = useQuery({
    queryKey: ['sermons', series],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (series !== 'all') params.append('series', series);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: seriesList } = useQuery({
    queryKey: ['sermon-series'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/series');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: showFilters,
  });

  const filteredSermons = sermons?.filter((sermon: any) =>
    sermon.title?.toLowerCase().includes(search.toLowerCase()) ||
    sermon.speaker?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sermons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Series</option>
              {seriesList?.map((s: any) => (
                <option key={s.id || s} value={s.id || s}>{s.name || s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredSermons && filteredSermons.length > 0 ? (
          filteredSermons.map((sermon: any) => (
            <Link
              key={sermon.id}
              to={\`/sermons/\${sermon.id}\`}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors flex gap-4"
            >
              <div className="flex-shrink-0">
                {sermon.thumbnail_url ? (
                  <img
                    src={sermon.thumbnail_url}
                    alt={sermon.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{sermon.title}</h3>
                {sermon.series_name && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">{sermon.series_name}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {sermon.speaker && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {sermon.speaker}
                    </span>
                  )}
                  {sermon.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(sermon.date).toLocaleDateString()}
                    </span>
                  )}
                  {sermon.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {sermon.duration}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Play className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No sermons found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSermonNotes(options: ChurchOptions = {}): string {
  const { componentName = 'SermonNotes', endpoint = '/sermons' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, Save, Download, Share2, Printer, BookmarkPlus, Check } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [personalNotes, setPersonalNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: sermon, isLoading } = useQuery({
    queryKey: ['sermon', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: myNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['sermon-notes', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/notes\`);
      const notes = response?.data || response;
      if (notes?.content) setPersonalNotes(notes.content);
      return notes;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.post<any>(\`${endpoint}/\${id}/notes\`, { content });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['sermon-notes', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!sermon) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Sermon not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sermon.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {sermon.speaker} - {new Date(sermon.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>

        {sermon.scripture && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg mb-4">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Scripture Reference</p>
            <p className="text-gray-900 dark:text-white">{sermon.scripture}</p>
          </div>
        )}

        {sermon.outline && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sermon Outline
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {typeof sermon.outline === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: sermon.outline }} />
              ) : (
                <ul className="space-y-2">
                  {sermon.outline?.map((point: any, i: number) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{point.text || point}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {sermon.key_points && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Points</h2>
            <div className="grid gap-3">
              {sermon.key_points?.map((point: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5" />
            My Notes
          </h2>
          <button
            onClick={() => saveMutation.mutate(personalNotes)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved!' : 'Save Notes'}
          </button>
        </div>
        <textarea
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Write your personal notes here..."
          rows={8}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSermonPlayer(options: ChurchOptions = {}): string {
  const { componentName = 'SermonPlayer', endpoint = '/sermons' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, FileText, Download, Share2, Heart, ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const { data: sermon, isLoading } = useQuery({
    queryKey: ['sermon', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: relatedSermons } = useQuery({
    queryKey: ['related-sermons', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/related\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [sermon]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!sermon) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Sermon not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-black rounded-xl overflow-hidden">
        <div className="aspect-video relative">
          {sermon.video_url ? (
            <video
              ref={videoRef}
              src={sermon.video_url}
              poster={sermon.thumbnail_url}
              className="w-full h-full object-contain"
            />
          ) : sermon.audio_url ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <Volume2 className="w-12 h-12" />
                </div>
                <p className="text-xl font-semibold">{sermon.title}</p>
                <p className="text-white/80">{sermon.speaker}</p>
              </div>
              <audio ref={videoRef as any} src={sermon.audio_url} />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">
              No media available
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-900">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button onClick={() => skip(-10)} className="text-white hover:text-indigo-400">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button onClick={() => skip(10)} className="text-white hover:text-indigo-400">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white hover:text-indigo-400">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <select
                value={playbackSpeed}
                onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <button className="text-white hover:text-indigo-400">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sermon.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {sermon.speaker} - {new Date(sermon.date).toLocaleDateString()}
            </p>
            {sermon.series_name && (
              <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-2">
                Series: {sermon.series_name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <Link
              to={\`/sermons/\${id}/notes\`}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FileText className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {sermon.description && (
          <p className="text-gray-600 dark:text-gray-300 mt-4">{sermon.description}</p>
        )}

        {sermon.scripture && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Scripture</p>
            <p className="text-gray-900 dark:text-white mt-1">{sermon.scripture}</p>
          </div>
        )}
      </div>

      {relatedSermons && relatedSermons.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Sermons</h2>
          <div className="grid gap-3">
            {relatedSermons.slice(0, 4).map((related: any) => (
              <Link
                key={related.id}
                to={\`/sermons/\${related.id}\`}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
              >
                {related.thumbnail_url ? (
                  <img src={related.thumbnail_url} alt={related.title} className="w-20 h-12 object-cover rounded" />
                ) : (
                  <div className="w-20 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center">
                    <Play className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{related.title}</p>
                  <p className="text-sm text-gray-500">{related.speaker}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePrayerList(options: ChurchOptions = {}): string {
  const { componentName = 'PrayerList', endpoint = '/prayers' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Heart, MessageCircle, Plus, X, Send, Lock, Globe, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showForm?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showForm = true }) => {
  const queryClient = useQueryClient();
  const [showNewPrayer, setShowNewPrayer] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'praying'>('all');
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    description: '',
    visibility: 'public',
    category: 'general'
  });

  const { data: prayers, isLoading } = useQuery({
    queryKey: ['prayers', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newPrayer) => {
      return api.post<any>('${endpoint}', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
      setShowNewPrayer(false);
      setNewPrayer({ title: '', description: '', visibility: 'public', category: 'general' });
    },
  });

  const prayMutation = useMutation({
    mutationFn: async (prayerId: string) => {
      return api.post<any>(\`${endpoint}/\${prayerId}/pray\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {(['all', 'mine', 'praying'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {f === 'all' ? 'All Requests' : f === 'mine' ? 'My Requests' : 'Praying For'}
            </button>
          ))}
        </div>
        {showForm && (
          <button
            onClick={() => setShowNewPrayer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Prayer Request
          </button>
        )}
      </div>

      {showNewPrayer && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Prayer Request</h3>
            <button onClick={() => setShowNewPrayer(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={newPrayer.title}
                onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                placeholder="Prayer request title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newPrayer.description}
                onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                placeholder="Share your prayer request..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={newPrayer.category}
                  onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="health">Health</option>
                  <option value="family">Family</option>
                  <option value="work">Work/Career</option>
                  <option value="spiritual">Spiritual Growth</option>
                  <option value="relationships">Relationships</option>
                  <option value="finances">Finances</option>
                  <option value="praise">Praise Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                <select
                  value={newPrayer.visibility}
                  onChange={(e) => setNewPrayer({ ...newPrayer, visibility: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                >
                  <option value="public">Public - Everyone can see</option>
                  <option value="members">Members Only</option>
                  <option value="private">Private - Prayer Team Only</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => createMutation.mutate(newPrayer)}
              disabled={createMutation.isPending || !newPrayer.title}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Prayer Request
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {prayers && prayers.length > 0 ? (
          prayers.map((prayer: any) => (
            <div
              key={prayer.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {prayer.user_avatar ? (
                    <img src={prayer.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {prayer.user_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{prayer.user_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-1 text-xs rounded-full \${
                    prayer.category === 'praise'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  }\`}>
                    {prayer.category}
                  </span>
                  {prayer.visibility === 'private' && <Lock className="w-4 h-4 text-gray-400" />}
                  {prayer.visibility === 'members' && <Users className="w-4 h-4 text-gray-400" />}
                  {prayer.visibility === 'public' && <Globe className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{prayer.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{prayer.description}</p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => prayMutation.mutate(prayer.id)}
                  disabled={prayMutation.isPending}
                  className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                    prayer.is_praying
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  <Heart className={\`w-4 h-4 \${prayer.is_praying ? 'fill-current' : ''}\`} />
                  {prayer.prayer_count || 0} Praying
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  {prayer.comment_count || 0} Comments
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No prayer requests yet</p>
            {showForm && (
              <button
                onClick={() => setShowNewPrayer(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Submit the first prayer request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
