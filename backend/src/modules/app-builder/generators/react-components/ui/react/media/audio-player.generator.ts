import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAudioPlayer = (
  resolved: ResolvedComponent,
  variant: 'minimal' | 'standard' | 'playlist' = 'standard'
) => {
  const dataSource = resolved.dataSource;
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };
  const dataName = dataSource.split('.').pop() || 'data';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'audio'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'audio';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Download, Repeat, Shuffle, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .audio-player { @apply w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg; }
    .player-header { @apply flex items-center gap-4 p-6; }
    .cover-image { @apply w-20 h-20 rounded-lg object-cover; }
    .track-info { @apply flex-1; }
    .track-title { @apply text-lg font-semibold text-gray-900 dark:text-white; }
    .track-artist { @apply text-sm text-gray-600 dark:text-gray-400; }
    .progress-container { @apply px-6 pb-4; }
    .progress-bar { @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer; }
    .progress-fill { @apply h-full bg-blue-500 rounded-full relative; }
    .progress-thumb { @apply absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg; }
    .time-display { @apply flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2; }
    .controls { @apply flex items-center justify-center gap-4 px-6 pb-6; }
    .control-btn { @apply text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors; }
    .play-btn { @apply bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 transition-colors; }
    .volume-control { @apply flex items-center gap-2; }
    .volume-slider { @apply w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full; }
    .waveform { @apply w-full h-16 flex items-end gap-1 px-6 pb-4; }
    .waveform-bar { @apply flex-1 bg-gray-300 dark:bg-gray-700 rounded-t transition-all; }
    .waveform-bar.active { @apply bg-blue-500; }
    .playlist-container { @apply border-t border-gray-200 dark:border-gray-700; }
    .playlist-item { @apply flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors; }
    .playlist-item.active { @apply bg-blue-50 dark:bg-blue-900/20; }
  `;

  const variants = {
    minimal: `${commonImports}
interface AudioPlayerProps { ${dataName}?: any; className?: string; }
const AudioPlayer: React.FC<AudioPlayerProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};
  const audioUrl = playerData.audioUrl || ${getField('audioUrl')};
  const title = playerData.title || ${getField('title')};

  const togglePlay = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) audioRef.current.currentTime = pos * duration;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (<>
<div className={className}>
      <div className="audio-player">
        <audio ref={audioRef} src={audioUrl} />
        <div className="p-4">
          <div className="track-title text-center mb-4">{title}</div>
          <div className="progress-container">
            <div className="progress-bar" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: \`\${(currentTime / duration) * 100}%\` }}>
                <div className="progress-thumb" />
              </div>
            </div>
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="controls">
            <button onClick={togglePlay} className="play-btn">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>);
};
export default AudioPlayer;`,

    standard: `${commonImports}
interface AudioPlayerProps { ${dataName}?: any; className?: string; }
const AudioPlayer: React.FC<AudioPlayerProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};
  const audioUrl = playerData.audioUrl || ${getField('audioUrl')};
  const title = playerData.title || ${getField('title')};
  const artist = playerData.artist || ${getField('artist')};
  const coverImage = playerData.coverImage || ${getField('coverImage')};

  const togglePlay = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) audioRef.current.currentTime = pos * duration;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = \`\${title}.mp3\`;
    link.click();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  const waveformBars = Array.from({ length: 60 }, (_, i) => {
    const height = Math.random() * 100;
    const isActive = (currentTime / duration) * 60 > i;
    return { height, isActive };
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (<>
<div className={className}>
      <div className="audio-player">
        <audio ref={audioRef} src={audioUrl} />
        <div className="player-header">
          <img src={coverImage} alt={title} className="cover-image" />
          <div className="track-info">
            <div className="track-title">{title}</div>
            <div className="track-artist">{artist}</div>
          </div>
        </div>
        <div className="waveform">
          {waveformBars.map((bar, i) => (
            <div key={i} className={\`waveform-bar \${bar.isActive ? 'active' : ''}\`} style={{ height: \`\${bar.height}%\` }} />
          ))}
        </div>
        <div className="progress-container">
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: \`\${(currentTime / duration) * 100}%\` }}>
              <div className="progress-thumb" />
            </div>
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="controls">
          <button onClick={togglePlay} className="play-btn">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <div className="volume-control">
            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="volume-slider" />
          </div>
          <button onClick={handleDownload} className="control-btn">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </>);
};
export default AudioPlayer;`,

    playlist: `${commonImports}
interface AudioPlayerProps { ${dataName}?: any; className?: string; }
const AudioPlayer: React.FC<AudioPlayerProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};
  const playlist = playerData.playlist || ${getField('playlist')};
  const currentTrack = playlist[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) audioRef.current.currentTime = pos * duration;
  };

  const playNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setTimeout(() => {
      audioRef.current?.play();
      setIsPlaying(true);
    }, 100);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, isRepeat]);

  return (<>
<div className={className}>
      <div className="audio-player">
        <audio ref={audioRef} src={currentTrack.url} key={currentTrackIndex} />
        <div className="player-header">
          <div className="track-info">
            <div className="track-title">{currentTrack.title}</div>
            <div className="track-artist">{currentTrack.artist}</div>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: \`\${(currentTime / duration) * 100}%\` }}>
              <div className="progress-thumb" />
            </div>
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="controls">
          <button onClick={() => setIsShuffle(!isShuffle)} className={\`control-btn \${isShuffle ? 'text-blue-500' : ''}\`}>
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={playPrevious} className="control-btn">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={togglePlay} className="play-btn">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={playNext} className="control-btn">
            <SkipForward className="w-5 h-5" />
          </button>
          <button onClick={() => setIsRepeat(!isRepeat)} className={\`control-btn \${isRepeat ? 'text-blue-500' : ''}\`}>
            <Repeat className="w-4 h-4" />
          </button>
          <div className="volume-control">
            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="volume-slider" />
          </div>
        </div>
        <div className="playlist-container">
          {playlist.map((track: any, index: number) => (
            <div key={track.id} className={\`playlist-item \${currentTrackIndex === index ? 'active' : ''}\`} onClick={() => playTrack(index)}>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{track.artist}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{track.duration}</div>
              {currentTrackIndex === index && isPlaying && <Play className="w-4 h-4 text-blue-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default AudioPlayer;`
  };

  return variants[variant] || variants.standard;
};
