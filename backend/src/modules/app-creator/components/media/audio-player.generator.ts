/**
 * Audio Player Component Generators
 */

export interface AudioPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAudioPlayer(options: AudioPlayerOptions = {}): string {
  const { componentName = 'AudioPlayer' } = options;

  return `import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover_url?: string;
  duration?: number;
}

interface ${componentName}Props {
  track: Track;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ track, onNext, onPrevious }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    if (audioRef.current && track.src) {
      audioRef.current.src = track.src;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [track.src]);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onNext?.();
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex items-center gap-4">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Play className="w-8 h-8 text-purple-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{track.title}</h3>
          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
        </div>
        <button onClick={() => setIsLiked(!isLiked)} className={\`p-2 rounded-full \${isLiked ? 'text-red-500' : 'text-gray-400'}\`}>
          <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsShuffle(!isShuffle)} className={\`p-2 rounded-lg \${isShuffle ? 'text-purple-600' : 'text-gray-400'}\`}>
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onPrevious} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={togglePlay} className="p-3 bg-purple-600 rounded-full hover:bg-purple-700">
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
          </button>
          <button onClick={onNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsRepeat(!isRepeat)} className={\`p-2 rounded-lg \${isRepeat ? 'text-purple-600' : 'text-gray-400'}\`}>
            <Repeat className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 group">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-400">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTrackList(options: AudioPlayerOptions = {}): string {
  const { componentName = 'TrackList', endpoint = '/tracks' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Play, Pause, Clock, MoreVertical, Music } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  albumId?: string;
  playlistId?: string;
  currentTrackId?: string;
  isPlaying?: boolean;
  onSelectTrack: (track: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ albumId, playlistId, currentTrackId, isPlaying, onSelectTrack }) => {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', albumId, playlistId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (albumId) params.append('album_id', albumId);
      if (playlistId) params.append('playlist_id', playlistId);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
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
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tracks?.map((track: any, index: number) => {
          const isCurrent = currentTrackId === track.id;
          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={\`w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left \${
                isCurrent ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }\`}
            >
              <span className="w-6 text-center text-sm text-gray-500">
                {isCurrent && isPlaying ? (
                  <div className="flex justify-center gap-0.5">
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-pulse delay-150" />
                  </div>
                ) : (
                  index + 1
                )}
              </span>
              {track.cover_url ? (
                <img src={track.cover_url} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Music className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={\`font-medium truncate \${isCurrent ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
                  {track.title}
                </p>
                <p className="text-sm text-gray-500 truncate">{track.artist}</p>
              </div>
              {track.duration && (
                <span className="text-sm text-gray-500">{track.duration}</span>
              )}
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAlbumGrid(options: AudioPlayerOptions = {}): string {
  const { componentName = 'AlbumGrid', endpoint = '/albums' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Play, Music } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: albums, isLoading } = useQuery({
    queryKey: ['albums'],
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
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {albums && albums.length > 0 ? (
        albums.map((album: any) => (
          <Link
            key={album.id}
            to={\`/albums/\${album.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group p-4"
          >
            <div className="relative aspect-square mb-4">
              {album.cover_url ? (
                <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Music className="w-16 h-16 text-purple-600" />
                </div>
              )}
              <button className="absolute bottom-2 right-2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-purple-700 hover:scale-105">
                <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{album.title}</h3>
            <p className="text-sm text-gray-500 truncate">{album.artist}</p>
            {album.year && <p className="text-xs text-gray-400 mt-1">{album.year}</p>}
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No albums found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
