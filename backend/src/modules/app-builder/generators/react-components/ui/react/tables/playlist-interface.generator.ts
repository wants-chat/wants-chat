import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePlaylistInterface = (
  resolved: ResolvedComponent,
  variant: 'sidebar' | 'inline' | 'compact' = 'sidebar'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Pause, X, GripVertical, Shuffle, Repeat, Music, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .playlist-container { @apply bg-white dark:bg-gray-800 rounded-lg; }
    .playlist-header { @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700; }
    .playlist-title { @apply text-lg font-bold text-gray-900 dark:text-white; }
    .playlist-controls { @apply flex gap-2; }
    .control-btn { @apply p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors; }
    .control-btn.active { @apply text-blue-500; }
    .track-list { @apply divide-y divide-gray-200 dark:divide-gray-700; }
    .track-item { @apply flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors; }
    .track-item.playing { @apply bg-blue-50 dark:bg-blue-900/20; }
    .track-drag-handle { @apply cursor-move text-gray-400 hover:text-gray-600; }
    .track-play-btn { @apply w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-500 hover:text-white transition-colors; }
    .track-info { @apply flex-1 min-w-0; }
    .track-title { @apply font-bold text-gray-900 dark:text-white truncate; }
    .track-artist { @apply text-sm text-gray-600 dark:text-gray-400 truncate; }
    .track-duration { @apply text-sm text-gray-500 dark:text-gray-500; }
    .track-remove { @apply p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100; }
  `;

  const variants = {
    sidebar: `${commonImports}
interface PlaylistInterfaceProps { ${dataName}?: any; className?: string; }
const PlaylistInterface: React.FC<PlaylistInterfaceProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const playlistData = ${dataName} || fetchedData || {};
  const initialTracks = playlistData.tracks || ${getField('tracks')};
  const allowReorder = playlistData.allowReorder ?? ${getField('allowReorder')};
  const allowRemove = playlistData.allowRemove ?? ${getField('allowRemove')};
  const showShuffle = playlistData.showShuffle ?? ${getField('showShuffle')};
  const showRepeat = playlistData.showRepeat ?? ${getField('showRepeat')};
  const [tracks, setTracks] = useState(initialTracks || []);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);

  useEffect(() => {
    if (initialTracks?.length) {
      setTracks(initialTracks);
      setCurrentTrack(initialTracks.find((t: any) => t.isPlaying)?.id || initialTracks[0]?.id);
    }
  }, [initialTracks]);

  if (isLoading && !${dataName}) {
    return (
      <div className={className}>
        <div className="playlist-container flex justify-center items-center min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={className}>
        <div className="playlist-container flex justify-center items-center min-h-[200px]">
          <p className="text-red-500 text-sm">Failed to load playlist</p>
        </div>
      </div>
    );
  }
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const playTrack = (id: number) => {
    setCurrentTrack(id);
    setTracks(tracks.map((t: any) => ({ ...t, isPlaying: t.id === id })));
  };

  const removeTrack = (id: number) => {
    setTracks(tracks.filter((t: any) => t.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const newTracks = [...tracks];
    const draggedTrack = newTracks[draggedItem];
    newTracks.splice(draggedItem, 1);
    newTracks.splice(index, 0, draggedTrack);
    setTracks(newTracks);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (<>
<div className={className}>
      <div className="playlist-container h-full max-h-screen overflow-hidden flex flex-col" style={{ width: '320px' }}>
        <div className="playlist-header">
          <div className="playlist-title">Playlist</div>
          <div className="playlist-controls">
            {showShuffle && (
              <button onClick={() => setIsShuffled(!isShuffled)} className={\`control-btn \${isShuffled ? 'active' : ''}\`}>
                <Shuffle className="w-4 h-4" />
              </button>
            )}
            {showRepeat && (
              <button onClick={() => setIsRepeat(!isRepeat)} className={\`control-btn \${isRepeat ? 'active' : ''}\`}>
                <Repeat className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="track-list overflow-y-auto flex-1">
          {tracks.map((track: any, index: number) => (
            <div key={track.id} className={\`track-item group \${track.id === currentTrack ? 'playing' : ''}\`} draggable={allowReorder} onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd}>
              {allowReorder && <GripVertical className="track-drag-handle w-4 h-4" />}
              <button onClick={() => playTrack(track.id)} className="track-play-btn">
                {track.id === currentTrack && track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
              </button>
              <div className="track-info">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
              <div className="track-duration">{track.duration}</div>
              {allowRemove && (
                <button onClick={() => removeTrack(track.id)} className="track-remove">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default PlaylistInterface;`,

    inline: `${commonImports}
interface PlaylistInterfaceProps { ${dataName}?: any; className?: string; }
const PlaylistInterface: React.FC<PlaylistInterfaceProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const playlistData = ${dataName} || fetchedData || {};
  const initialTracks = playlistData.tracks || ${getField('tracks')};
  const allowReorder = playlistData.allowReorder ?? ${getField('allowReorder')};
  const allowRemove = playlistData.allowRemove ?? ${getField('allowRemove')};
  const showShuffle = playlistData.showShuffle ?? ${getField('showShuffle')};
  const showRepeat = playlistData.showRepeat ?? ${getField('showRepeat')};
  const [tracks, setTracks] = useState(initialTracks || []);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    if (initialTracks?.length) {
      setTracks(initialTracks);
      setCurrentTrack(initialTracks.find((t: any) => t.isPlaying)?.id || initialTracks[0]?.id);
    }
  }, [initialTracks]);

  const playTrack = (id: number) => {
    setCurrentTrack(id);
    setTracks(tracks.map((t: any) => ({ ...t, isPlaying: t.id === id })));
  };

  const removeTrack = (id: number) => {
    setTracks(tracks.filter((t: any) => t.id !== id));
  };

  if (isLoading && !${dataName}) {
    return (
      <div className={className}>
        <div className="playlist-container flex justify-center items-center min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={className}>
        <div className="playlist-container flex justify-center items-center min-h-[200px]">
          <p className="text-red-500 text-sm">Failed to load playlist</p>
        </div>
      </div>
    );
  }

  return (<>
<div className={className}>
      <div className="playlist-container">
        <div className="playlist-header">
          <div className="playlist-title">Now Playing</div>
          <div className="playlist-controls">
            {showShuffle && (
              <button onClick={() => setIsShuffled(!isShuffled)} className={\`control-btn \${isShuffled ? 'active' : ''}\`}>
                <Shuffle className="w-4 h-4" />
              </button>
            )}
            {showRepeat && (
              <button onClick={() => setIsRepeat(!isRepeat)} className={\`control-btn \${isRepeat ? 'active' : ''}\`}>
                <Repeat className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="track-list">
          {tracks.map((track: any) => (
            <div key={track.id} className={\`track-item group \${track.id === currentTrack ? 'playing' : ''}\`}>
              <button onClick={() => playTrack(track.id)} className="track-play-btn">
                {track.id === currentTrack && track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
              </button>
              <div className="track-info">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
              <div className="track-duration">{track.duration}</div>
              {allowRemove && (
                <button onClick={() => removeTrack(track.id)} className="track-remove">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default PlaylistInterface;`,

    compact: `${commonImports}
interface PlaylistInterfaceProps { ${dataName}?: any; className?: string; }
const PlaylistInterface: React.FC<PlaylistInterfaceProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const playlistData = ${dataName} || fetchedData || {};
  const initialTracks = playlistData.tracks || ${getField('tracks')};
  const [tracks, setTracks] = useState(initialTracks || []);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);

  useEffect(() => {
    if (initialTracks?.length) {
      setTracks(initialTracks);
      setCurrentTrack(initialTracks.find((t: any) => t.isPlaying)?.id || initialTracks[0]?.id);
    }
  }, [initialTracks]);

  const playTrack = (id: number) => {
    setCurrentTrack(id);
    setTracks(tracks.map((t: any) => ({ ...t, isPlaying: t.id === id })));
  };

  const currentTrackData = tracks.find((t: any) => t.id === currentTrack);

  if (isLoading && !${dataName}) {
    return (
      <div className={className}>
        <div className="playlist-container flex justify-center items-center min-h-[150px]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={className}>
        <div className="playlist-container flex justify-center items-center min-h-[150px]">
          <p className="text-red-500 text-sm">Failed to load playlist</p>
        </div>
      </div>
    );
  }

  return (<>
<div className={className}>
      <div className="playlist-container">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 dark:text-white truncate">{currentTrackData?.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{currentTrackData?.artist}</div>
            </div>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {tracks.map((track: any) => (
            <div key={track.id} onClick={() => playTrack(track.id)} className={\`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors \${track.id === currentTrack ? 'bg-blue-50 dark:bg-blue-900/20' : ''}\`}>
              <div className="w-6 h-6 flex items-center justify-center">
                {track.id === currentTrack && track.isPlaying ? (
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-blue-500 animate-pulse" />
                    <div className="w-0.5 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="w-0.5 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                ) : (
                  <Play className="w-3 h-3 text-gray-400" fill="currentColor" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{track.title}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{track.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default PlaylistInterface;`
  };

  return variants[variant] || variants.sidebar;
};
