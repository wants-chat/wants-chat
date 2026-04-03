import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateVideoPlayerEmbedded = (
  resolved: ResolvedComponent,
  variant: 'youtube' | 'vimeo' | 'custom' = 'youtube'
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

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'video'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'video';

  const commonImports = `
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';`;

  const commonStyles = `
    .video-container {
      @apply relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800;
    }

    .video-wrapper {
      @apply relative w-full;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
    }

    .video-iframe {
      @apply absolute top-0 left-0 w-full h-full;
    }

    .video-poster {
      @apply absolute inset-0 w-full h-full object-cover cursor-pointer;
    }

    .play-button-overlay {
      @apply absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 via-transparent to-black/40 cursor-pointer group;
    }

    .play-button {
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full p-6 transition-all group-hover:scale-125 shadow-2xl border-4 border-white/20;
    }

    .video-controls {
      @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity;
    }

    .controls-row {
      @apply flex items-center gap-2;
    }

    .control-button {
      @apply text-white hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all hover:scale-110 p-1.5 rounded-full;
    }

    .progress-bar {
      @apply w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer mb-2 shadow-inner;
    }

    .progress-fill {
      @apply h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transition-all shadow-lg;
    }

    .time-display {
      @apply text-white text-sm font-bold;
    }

    .settings-menu {
      @apply absolute bottom-16 right-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 text-white text-sm shadow-2xl border-2 border-gray-700;
    }

    .settings-option {
      @apply px-3 py-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg cursor-pointer transition-all hover:scale-105 font-medium;
    }
  `;

  const variants = {
    youtube: `
${commonImports}

interface VideoPlayerEmbeddedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VideoPlayerEmbedded: React.FC<VideoPlayerEmbeddedProps> = ({ ${dataName}: propData, className }) => {
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

  const [isPlaying, setIsPlaying] = useState(false);

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
  const title = playerData.title || ${getField('title')};
  const autoplay = playerData.autoplay || ${getField('autoplay')} || false;
  const muted = playerData.muted || ${getField('muted')} || false;
  const loop = playerData.loop || ${getField('loop')} || false;
  const controls = playerData.controls !== undefined ? playerData.controls : (${getField('controls')} || true);

  const buildYouTubeUrl = () => {
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      mute: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      rel: '0'
    });

    return \`\${videoUrl}?\${params.toString()}\`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <>
<div className={className}>
        <div className="video-container">
          <div className="video-wrapper">
            {!isPlaying ? (
              <>
                <img
                  src={posterImage}
                  alt={title}
                  className="video-poster"
                />
                <div className="play-button-overlay" onClick={handlePlay}>
                  <div className="play-button">
                    <Play className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                </div>
              </>
            ) : (
              <iframe
                className="video-iframe"
                src={buildYouTubeUrl()}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayerEmbedded;
    `,

    vimeo: `
${commonImports}

interface VideoPlayerEmbeddedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VideoPlayerEmbedded: React.FC<VideoPlayerEmbeddedProps> = ({ ${dataName}: propData, className }) => {
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

  const [isPlaying, setIsPlaying] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};

  const vimeoUrl = playerData.vimeoUrl || ${getField('vimeoUrl')};
  const posterImage = playerData.posterImage || ${getField('posterImage')};
  const title = playerData.title || ${getField('title')};
  const autoplay = playerData.autoplay || ${getField('autoplay')} || false;
  const muted = playerData.muted || ${getField('muted')} || false;
  const loop = playerData.loop || ${getField('loop')} || false;
  const controls = playerData.controls !== undefined ? playerData.controls : (${getField('controls')} || true);

  const buildVimeoUrl = () => {
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      muted: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      autopause: '0'
    });

    return \`\${vimeoUrl}?\${params.toString()}\`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <>
<div className={className}>
        <div className="video-container">
          <div className="video-wrapper">
            {!isPlaying ? (
              <>
                <img
                  src={posterImage}
                  alt={title}
                  className="video-poster"
                />
                <div className="play-button-overlay" onClick={handlePlay}>
                  <div className="play-button">
                    <Play className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                </div>
              </>
            ) : (
              <iframe
                className="video-iframe"
                src={buildVimeoUrl()}
                title={title}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayerEmbedded;
    `,

    custom: `
${commonImports}

interface VideoPlayerEmbeddedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VideoPlayerEmbedded: React.FC<VideoPlayerEmbeddedProps> = ({ ${dataName}: propData, className }) => {
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const playerData = ${dataName} || {};

  const customUrl = playerData.customUrl || ${getField('customUrl')};
  const posterImage = playerData.posterImage || ${getField('posterImage')};
  const title = playerData.title || ${getField('title')};
  const autoplay = playerData.autoplay || ${getField('autoplay')} || false;
  const muted = playerData.muted || ${getField('muted')} || false;
  const loop = playerData.loop || ${getField('loop')} || false;
  const controls = playerData.controls !== undefined ? playerData.controls : (${getField('controls')} || true);
  const captions = playerData.captions || ${getField('captions')};
  const playsinline = playerData.playsinline || ${getField('playsinline')} || false;

  const [isMuted, setIsMuted] = useState(muted);

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
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  return (
    <>
<div className={className}>
        <div className="video-container group">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              className="video-iframe"
              poster={posterImage}
              autoPlay={autoplay}
              muted={muted}
              loop={loop}
              playsInline={playsinline}
              onClick={togglePlay}
            >
              <source src={customUrl} type="video/mp4" />
              {captions.map((caption: any, index: number) => (
                <track
                  key={index}
                  kind="subtitles"
                  label={caption.label}
                  srcLang={caption.srclang}
                  src={caption.src}
                  default={caption.default}
                />
              ))}
              Your browser does not support the video tag.
            </video>

            {controls && (
              <div className="video-controls">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '30%' }} />
                </div>

                <div className="controls-row">
                  <button onClick={togglePlay} className="control-button">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button onClick={toggleMute} className="control-button">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <span className="time-display flex-1">0:00 / 0:00</span>

                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="control-button"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {showSettings && (
                      <div className="settings-menu">
                        <div className="settings-option" onClick={() => changeSpeed(0.5)}>
                          0.5x {playbackSpeed === 0.5 && '✓'}
                        </div>
                        <div className="settings-option" onClick={() => changeSpeed(1)}>
                          1x {playbackSpeed === 1 && '✓'}
                        </div>
                        <div className="settings-option" onClick={() => changeSpeed(1.5)}>
                          1.5x {playbackSpeed === 1.5 && '✓'}
                        </div>
                        <div className="settings-option" onClick={() => changeSpeed(2)}>
                          2x {playbackSpeed === 2 && '✓'}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={toggleFullscreen} className="control-button">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayerEmbedded;
    `
  };

  return variants[variant] || variants.youtube;
};
