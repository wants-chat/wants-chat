import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTrackDetailPage = (
  resolved: ResolvedComponent
) => {
  return `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Heart, Share2, Download, Clock, Music2, SkipBack, SkipForward, Repeat, Shuffle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Track {
  id: string;
  title: string;
  artist_name?: string;
  artist_id?: string;
  album_name?: string;
  album_id?: string;
  cover_image?: string;
  track_url?: string;
  file_url?: string;
  duration_seconds?: number;
  genre?: string;
  description?: string;
  play_count?: number;
}

interface TrackDetailPageProps {
  data?: Track;
  className?: string;
  [key: string]: any;
}

const TrackDetailPage: React.FC<TrackDetailPageProps> = ({ data: propData, className }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch track data from API if no prop data provided
  const { data: fetchedTrack, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['tracks', id],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/tracks/' + id);
        return response.data || response;
      } catch (err: any) {
        throw new Error(err.message || 'Failed to load track');
      }
    },
    enabled: !propData && !!id,
    retry: 1,
  });

  const track = propData || fetchedTrack;
  const error = queryError?.message || null;

  // Audio player effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track]);

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
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return minutes + ':' + seconds.toString().padStart(2, '0');
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (loading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading track...</div>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Track not found'}</div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const audioUrl = track.track_url || track.file_url;

  return (
    <div className={className}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white">
        {/* Header with back button */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-32">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Album Art */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <div className="relative group">
                {track.cover_image ? (
                  <img
                    src={track.cover_image}
                    alt={track.title}
                    className="w-full lg:w-80 h-auto aspect-square rounded-2xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-track.png';
                    }}
                  />
                ) : (
                  <div className="w-full lg:w-80 aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center">
                    <Music2 className="w-32 h-32 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-colors" />
              </div>
            </div>

            {/* Track Information */}
            <div className="flex-1 min-w-0">
              {/* Type Badge */}
              <div className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-4">
                Track
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight break-words">
                {track.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base mb-8">
                <span className="font-semibold text-lg">
                  {track.artist_name || 'Unknown Artist'}
                </span>

                {track.album_name && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{track.album_name}</span>
                  </>
                )}

                {track.genre && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs font-medium">
                      {track.genre}
                    </span>
                  </>
                )}

                {track.duration_seconds && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Clock className="w-4 h-4" />
                      {formatTime(track.duration_seconds)}
                    </span>
                  </>
                )}

                {track.play_count !== undefined && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{track.play_count.toLocaleString()} plays</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" fill="white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  )}
                </button>

                <button
                  onClick={toggleLike}
                  className={'p-3 rounded-full transition-colors ' + (isLiked ? 'bg-purple-600/30 text-purple-400' : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white')}
                >
                  <Heart className={'w-6 h-6 ' + (isLiked ? 'fill-current' : '')} />
                </button>

                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-gray-300 hover:text-white">
                  <Share2 className="w-6 h-6" />
                </button>

                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-gray-300 hover:text-white">
                  <Download className="w-6 h-6" />
                </button>
              </div>

              {/* Description */}
              {track.description && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-3">About This Track</h2>
                  <p className="text-gray-300 leading-relaxed">{track.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Player */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800 z-50">
          <div className="container mx-auto px-4 py-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
            />

            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group relative"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full relative transition-all"
                  style={{ width: (duration ? (currentTime / duration) * 100 : 0) + '%' }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || track.duration_seconds || 0)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-6">
              {/* Left: Track info (mobile hidden) */}
              <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
                {track.cover_image ? (
                  <img
                    src={track.cover_image}
                    alt={track.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold truncate">{track.title}</div>
                  <div className="text-sm text-gray-400 truncate">{track.artist_name || 'Unknown Artist'}</div>
                </div>
                <button
                  onClick={toggleLike}
                  className={'p-2 transition-colors ' + (isLiked ? 'text-purple-400' : 'text-gray-400 hover:text-white')}
                >
                  <Heart className={'w-5 h-5 ' + (isLiked ? 'fill-current' : '')} />
                </button>
              </div>

              {/* Center: Playback controls */}
              <div className="flex items-center gap-4 justify-center flex-1">
                <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
                  <Shuffle className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-all transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-black" fill="black" />
                  ) : (
                    <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                  )}
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Volume control */}
              <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPage;
`;
};
