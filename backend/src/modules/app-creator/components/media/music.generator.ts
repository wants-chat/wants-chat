/**
 * Music Component Generators
 */

export interface MusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMusicPlayer(options: MusicOptions = {}): string {
  const { componentName = 'MusicPlayer' } = options;

  return `import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart, ListMusic, Maximize2, Minimize2 } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  src: string;
  cover_url?: string;
  duration?: number;
}

interface ${componentName}Props {
  track: Track;
  playlist?: Track[];
  onNext?: () => void;
  onPrevious?: () => void;
  onTrackChange?: (track: Track) => void;
  variant?: 'full' | 'mini' | 'bar';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  track,
  playlist = [],
  onNext,
  onPrevious,
  onTrackChange,
  variant = 'full'
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const toggleRepeat = () => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
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
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all' || playlist.length > 0) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (isShuffle && playlist.length > 1) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      onTrackChange?.(playlist[randomIndex]);
    } else {
      onNext?.();
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Mini variant
  if (variant === 'mini') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 max-w-sm">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-purple-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{track.title}</p>
          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
        </div>
        <button onClick={togglePlay} className="p-2 bg-purple-600 rounded-full hover:bg-purple-700">
          {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
        </button>
      </div>
    );
  }

  // Bar variant (bottom sticky player)
  if (variant === 'bar') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-purple-600" style={{ width: \`\${progress}%\` }} />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {track.cover_url ? (
              <img src={track.cover_url} alt={track.title} className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Play className="w-7 h-7 text-purple-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{track.title}</p>
              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
            </div>
            <button onClick={() => setIsLiked(!isLiked)} className={\`p-2 \${isLiked ? 'text-red-500' : 'text-gray-400'}\`}>
              <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsShuffle(!isShuffle)} className={\`p-2 \${isShuffle ? 'text-purple-600' : 'text-gray-400'}\`}>
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={onPrevious} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <SkipBack className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={togglePlay} className="p-3 bg-purple-600 rounded-full hover:bg-purple-700">
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <SkipForward className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={toggleRepeat} className={\`p-2 \${repeatMode !== 'none' ? 'text-purple-600' : 'text-gray-400'}\`}>
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume & extras */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <span className="text-xs text-gray-500">{formatTime(currentTime)} / {formatTime(duration)}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-400">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <button onClick={() => setShowPlaylist(!showPlaylist)} className={\`p-2 \${showPlaylist ? 'text-purple-600' : 'text-gray-400'}\`}>
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="p-6">
        {/* Album Art */}
        <div className="relative max-w-xs mx-auto mb-6">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              className={\`w-full aspect-square object-cover rounded-xl shadow-xl transition-transform \${isPlaying ? 'animate-pulse' : ''}\`}
            />
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Play className="w-24 h-24 text-white/80" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{track.title}</h2>
          <p className="text-gray-500">{track.artist}</p>
          {track.album && <p className="text-sm text-gray-400">{track.album}</p>}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setIsShuffle(!isShuffle)} className={\`p-2 rounded-lg \${isShuffle ? 'text-purple-600' : 'text-gray-400'}\`}>
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={onPrevious} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <SkipBack className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={togglePlay} className="p-4 bg-purple-600 rounded-full hover:bg-purple-700 shadow-lg">
            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </button>
          <button onClick={handleNext} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <SkipForward className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={toggleRepeat} className={\`p-2 rounded-lg \${repeatMode !== 'none' ? 'text-purple-600' : 'text-gray-400'}\`}>
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Extra Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => setIsLiked(!isLiked)} className={\`p-2 rounded-lg \${isLiked ? 'text-red-500' : 'text-gray-400'}\`}>
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-400">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <button onClick={() => setShowPlaylist(!showPlaylist)} className={\`p-2 rounded-lg \${showPlaylist ? 'text-purple-600' : 'text-gray-400'}\`}>
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Playlist Panel */}
      {showPlaylist && playlist.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          {playlist.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onTrackChange?.(item)}
              className={\`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${
                item.id === track.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }\`}
            >
              <span className="w-6 text-center text-sm text-gray-500">{index + 1}</span>
              {item.cover_url ? (
                <img src={item.cover_url} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Play className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className={\`font-medium text-sm truncate \${item.id === track.id ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{item.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateGenreGrid(options: MusicOptions = {}): string {
  const { componentName = 'GenreGrid', endpoint = '/genres' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Music, Headphones, Radio, Disc, Guitar, Piano, Drum, Mic2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onGenreSelect?: (genre: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onGenreSelect }) => {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Default genres with gradients if API doesn't return any
  const defaultGenres = [
    { id: 'pop', name: 'Pop', gradient: 'from-pink-500 to-rose-500', icon: 'mic' },
    { id: 'rock', name: 'Rock', gradient: 'from-red-600 to-orange-500', icon: 'guitar' },
    { id: 'hip-hop', name: 'Hip-Hop', gradient: 'from-purple-600 to-indigo-600', icon: 'headphones' },
    { id: 'electronic', name: 'Electronic', gradient: 'from-cyan-500 to-blue-500', icon: 'radio' },
    { id: 'jazz', name: 'Jazz', gradient: 'from-amber-500 to-yellow-500', icon: 'piano' },
    { id: 'classical', name: 'Classical', gradient: 'from-emerald-500 to-teal-500', icon: 'music' },
    { id: 'r&b', name: 'R&B', gradient: 'from-violet-600 to-purple-600', icon: 'disc' },
    { id: 'country', name: 'Country', gradient: 'from-orange-500 to-amber-500', icon: 'guitar' },
    { id: 'metal', name: 'Metal', gradient: 'from-gray-700 to-gray-900', icon: 'drum' },
    { id: 'indie', name: 'Indie', gradient: 'from-lime-500 to-green-500', icon: 'headphones' },
    { id: 'folk', name: 'Folk', gradient: 'from-amber-600 to-orange-600', icon: 'guitar' },
    { id: 'blues', name: 'Blues', gradient: 'from-blue-600 to-indigo-700', icon: 'music' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'headphones': return Headphones;
      case 'radio': return Radio;
      case 'disc': return Disc;
      case 'guitar': return Guitar;
      case 'piano': return Piano;
      case 'drum': return Drum;
      case 'mic': return Mic2;
      default: return Music;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const displayGenres = genres && genres.length > 0 ? genres : defaultGenres;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {displayGenres.map((genre: any) => {
        const Icon = getIcon(genre.icon);
        const gradient = genre.gradient || 'from-purple-500 to-pink-500';

        return onGenreSelect ? (
          <button
            key={genre.id}
            onClick={() => onGenreSelect(genre)}
            className={\`relative overflow-hidden rounded-xl aspect-[2/1] group bg-gradient-to-br \${gradient}\`}
          >
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <div>
                <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                {genre.track_count !== undefined && (
                  <p className="text-sm text-white/70">{genre.track_count} tracks</p>
                )}
              </div>
              <Icon className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform" />
            </div>
            {genre.cover_url && (
              <img
                src={genre.cover_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
              />
            )}
          </button>
        ) : (
          <Link
            key={genre.id}
            to={\`/genres/\${genre.id}\`}
            className={\`relative overflow-hidden rounded-xl aspect-[2/1] group bg-gradient-to-br \${gradient}\`}
          >
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <div>
                <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                {genre.track_count !== undefined && (
                  <p className="text-sm text-white/70">{genre.track_count} tracks</p>
                )}
              </div>
              <Icon className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform" />
            </div>
            {genre.cover_url && (
              <img
                src={genre.cover_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}
