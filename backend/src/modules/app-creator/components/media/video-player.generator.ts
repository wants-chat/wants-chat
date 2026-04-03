/**
 * Video Player Component Generators
 */

export interface VideoPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVideoPlayer(options: VideoPlayerOptions = {}): string {
  const { componentName = 'VideoPlayer' } = options;

  return `import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward } from 'lucide-react';

interface ${componentName}Props {
  src: string;
  poster?: string;
  title?: string;
  onEnded?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ src, poster, title, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
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

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        onClick={togglePlay}
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-purple-600/90 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={\`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity \${showControls ? 'opacity-100' : 'opacity-0'}\`}>
        {title && <p className="text-white font-medium mb-2">{title}</p>}

        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button onClick={() => skip(-10)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <SkipBack className="w-5 h-5 text-white" />
            </button>
            <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </button>
            <button onClick={() => skip(10)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <SkipForward className="w-5 h-5 text-white" />
            </button>
            <span className="text-white text-sm ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePlaylist(options: VideoPlayerOptions = {}): string {
  const { componentName = 'Playlist', endpoint = '/videos' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Play, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  playlistId?: string;
  currentVideoId?: string;
  onSelectVideo: (video: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ playlistId, currentVideoId, onSelectVideo }) => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const url = '${endpoint}' + (playlistId ? '?playlist_id=' + playlistId : '');
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Playlist</h3>
        <p className="text-sm text-gray-500">{videos?.length || 0} videos</p>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {videos?.map((video: any, index: number) => (
          <button
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className={\`w-full flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left \${
              currentVideoId === video.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
            }\`}
          >
            <div className="relative flex-shrink-0">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="" className="w-24 h-14 object-cover rounded" />
              ) : (
                <div className="w-24 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {currentVideoId === video.id && (
                <div className="absolute inset-0 bg-purple-600/80 rounded flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" fill="white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={\`font-medium text-sm line-clamp-2 \${
                currentVideoId === video.id ? 'text-purple-600' : 'text-gray-900 dark:text-white'
              }\`}>
                {video.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{index + 1}</span>
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </span>
                )}
                {video.watched && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateVideoGrid(options: VideoPlayerOptions = {}): string {
  const { componentName = 'VideoGrid', endpoint = '/videos' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Play, Clock, Eye } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  category?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category }) => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', category],
    queryFn: async () => {
      const url = '${endpoint}' + (category ? '?category=' + category : '');
      const response = await api.get<any>(url);
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos && videos.length > 0 ? (
        videos.map((video: any) => (
          <Link
            key={video.id}
            to={\`/videos/\${video.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="relative aspect-video">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                </div>
              </div>
              {video.duration && (
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                  {video.duration}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
              {video.channel_name && (
                <p className="text-sm text-gray-500 mt-1">{video.channel_name}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {video.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.views.toLocaleString()} views
                  </span>
                )}
                {video.published_at && (
                  <span>{new Date(video.published_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No videos found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
