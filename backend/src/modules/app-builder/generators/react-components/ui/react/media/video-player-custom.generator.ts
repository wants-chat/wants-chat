import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateVideoPlayerCustom = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' | 'advanced' = 'standard'
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
    return `/${dataSource || 'media'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'media';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Settings, List, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .video-player { @apply relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800; }
    .video-wrapper { @apply relative w-full; padding-bottom: 56.25%; }
    .video-element { @apply absolute top-0 left-0 w-full h-full cursor-pointer; }
    .controls-container { @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity; }
    .progress-bar { @apply w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer mb-3 shadow-inner; }
    .progress-fill { @apply h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 shadow-lg; }
    .controls-row { @apply flex items-center gap-3; }
    .control-btn { @apply text-white hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all hover:scale-110 p-1.5 rounded-full; }
    .time-text { @apply text-white text-sm font-bold; }
    .volume-slider { @apply w-20 h-2 bg-white/20 rounded-full shadow-inner; }
    .settings-popup { @apply absolute bottom-16 right-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 text-white text-sm w-48 shadow-2xl border-2 border-gray-700; }
    .settings-item { @apply px-3 py-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg cursor-pointer flex items-center justify-between transition-all hover:scale-105 font-medium; }
    .playlist-sidebar { @apply absolute top-0 right-0 h-full w-80 bg-gradient-to-br from-gray-900/98 to-gray-800/98 p-4 transform translate-x-full transition-transform shadow-2xl border-l-2 border-gray-700; }
    .playlist-sidebar.open { @apply translate-x-0; }
    .playlist-item { @apply flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 rounded-xl cursor-pointer transition-all hover:scale-105 border-2 border-transparent hover:border-gray-600; }
    .playlist-item.active { @apply bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-500 shadow-lg; }
  `;

  const variants = {
    standard: `${commonImports}
interface VideoPlayerCustomProps { ${dataName}?: any; className?: string; [key: string]: any; }
const VideoPlayerCustom: React.FC<VideoPlayerCustomProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};
  const videoUrl = playerData.videoUrl || ${getField('videoUrl')};
  const posterImage = playerData.posterImage || ${getField('posterImage')};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen?.();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (<>
<div className={className}>
      <div className="video-player group">
        <div className="video-wrapper">
          <video ref={videoRef} className="video-element" poster={posterImage} onClick={togglePlay}>
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="controls-container">
            <div className="progress-bar" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: \`\${progress}%\` }} />
            </div>
            <div className="controls-row">
              <button onClick={togglePlay} className="control-btn">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={toggleMute} className="control-btn">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="volume-slider" />
              <span className="time-text flex-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <button onClick={toggleFullscreen} className="control-btn">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>);
};
export default VideoPlayerCustom;`,

    minimal: `${commonImports}
interface VideoPlayerCustomProps { ${dataName}?: any; className?: string; [key: string]: any; }
const VideoPlayerCustom: React.FC<VideoPlayerCustomProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};
  const videoUrl = playerData.videoUrl || ${getField('videoUrl')};
  const posterImage = playerData.posterImage || ${getField('posterImage')};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (<>
<div className={className}>
      <div className="video-player">
        <div className="video-wrapper">
          <video ref={videoRef} className="video-element" poster={posterImage} onClick={togglePlay} controls>
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  </>);
};
export default VideoPlayerCustom;`,

    advanced: `${commonImports}
interface VideoPlayerCustomProps { ${dataName}?: any; className?: string; [key: string]: any; }
const VideoPlayerCustom: React.FC<VideoPlayerCustomProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};
  const playlist = playerData.playlist || ${getField('playlist')};
  const qualities = playerData.qualities || ${getField('qualities')};
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentVideo = playlist[currentVideoIndex];

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const skipForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const changeQuality = (newQuality: string) => {
    setQuality(newQuality);
    setShowSettings(false);
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const playVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setShowPlaylist(false);
    setTimeout(() => {
      videoRef.current?.play();
      setIsPlaying(true);
    }, 100);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentVideoIndex]);

  return (<>
<div className={className}>
      <div className="video-player relative group">
        <div className="video-wrapper">
          <video ref={videoRef} className="video-element" onClick={togglePlay} key={currentVideoIndex}>
            <source src={currentVideo.url} type="video/mp4" />
          </video>
          <div className="controls-container">
            <div className="progress-bar" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: \`\${progress}%\` }} />
            </div>
            <div className="controls-row">
              <button onClick={togglePlay} className="control-btn">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={skipBackward} className="control-btn">
                <SkipBack className="w-4 h-4" />
              </button>
              <button onClick={skipForward} className="control-btn">
                <SkipForward className="w-4 h-4" />
              </button>
              <button onClick={toggleMute} className="control-btn">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="volume-slider" />
              <span className="time-text flex-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <button onClick={() => setShowSettings(!showSettings)} className="control-btn">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={() => setShowPlaylist(!showPlaylist)} className="control-btn">
                <List className="w-5 h-5" />
              </button>
              <button onClick={() => videoRef.current?.requestFullscreen?.()} className="control-btn">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {showSettings && (
          <div className="settings-popup">
            <div className="text-xs text-gray-400 px-3 py-2">Quality</div>
            {qualities.map((q: string) => (
              <div key={q} className="settings-item" onClick={() => changeQuality(q)}>
                {q} {quality === q && '✓'}
              </div>
            ))}
            <div className="text-xs text-gray-400 px-3 py-2 border-t border-gray-700 mt-2">Speed</div>
            {[0.5, 1, 1.5, 2].map((speed) => (
              <div key={speed} className="settings-item" onClick={() => changeSpeed(speed)}>
                {speed}x {playbackSpeed === speed && '✓'}
              </div>
            ))}
          </div>
        )}
        <div className={\`playlist-sidebar \${showPlaylist ? 'open' : ''}\`}>
          <h3 className="text-white font-semibold mb-4">Playlist</h3>
          {playlist.map((video: any, index: number) => (
            <div key={video.id} className={\`playlist-item \${currentVideoIndex === index ? 'active' : ''}\`} onClick={() => playVideo(index)}>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{video.title}</div>
                <div className="text-gray-400 text-xs">{video.duration}</div>
              </div>
              {currentVideoIndex === index && <Play className="w-4 h-4 text-white" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default VideoPlayerCustom;`
  };

  return variants[variant] || variants.standard;
};
