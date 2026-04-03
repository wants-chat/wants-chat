/**
 * Entertainment & Media Component Generators
 * Includes video, music, podcast, movie, and game components
 */

export interface EntertainmentOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export function generateVideoCard(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Play, Clock, Eye, Heart, Share2, MoreVertical } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  channel: string;
  channelAvatar?: string;
  uploadedAt: string;
}

interface VideoCardProps {
  video: Video;
  onPlay?: (video: Video) => void;
  onLike?: (video: Video) => void;
  onShare?: (video: Video) => void;
}

export function VideoCard({ video, onPlay, onLike, onShare }: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) return \`\${(views / 1000000).toFixed(1)}M\`;
    if (views >= 1000) return \`\${(views / 1000).toFixed(1)}K\`;
    return views.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <button
            onClick={() => onPlay?.(video)}
            className="w-12 h-12 bg-${primary}-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-${primary}-700"
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </button>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex gap-3">
          {video.channelAvatar && (
            <img
              src={video.channelAvatar}
              alt={video.channel}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
              {video.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{video.channel}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(video.views)} views
              </span>
              <span>-</span>
              <span>{video.uploadedAt}</span>
            </div>
          </div>
          <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onLike?.(video)}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-${primary}-600"
          >
            <Heart className="w-4 h-4" />
            {formatViews(video.likes)}
          </button>
          <button
            onClick={() => onShare?.(video)}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-${primary}-600"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateVideoComments(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Flag, MoreVertical } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  likes: number;
  dislikes: number;
  timestamp: string;
  replies?: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface VideoCommentsProps {
  videoId: string;
  comments: Comment[];
  totalComments: number;
  onAddComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onDislikeComment?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
}

export function VideoComments({
  comments,
  totalComments,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onReply
}: VideoCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReply?.(commentId, replyContent.trim());
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return \`\${(count / 1000).toFixed(1)}K\`;
    return count.toString();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={\`flex gap-3 \${isReply ? 'ml-12' : ''}\`}>
      <div className="flex-shrink-0">
        {comment.avatar ? (
          <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
            <span className="text-${primary}-600 font-medium">{comment.author[0]}</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
          <span className="text-xs text-gray-500">{comment.timestamp}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => onLikeComment?.(comment.id)}
            className={\`flex items-center gap-1 text-sm \${comment.isLiked ? 'text-${primary}-600' : 'text-gray-500 hover:text-gray-700'}\`}
          >
            <ThumbsUp className="w-4 h-4" />
            {comment.likes > 0 && formatCount(comment.likes)}
          </button>
          <button
            onClick={() => onDislikeComment?.(comment.id)}
            className={\`flex items-center gap-1 text-sm \${comment.isDisliked ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}\`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Reply
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600 ml-auto">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Add a reply..."
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
            <button
              onClick={() => handleSubmitReply(comment.id)}
              className="px-4 py-2 bg-${primary}-600 text-white rounded-lg text-sm hover:bg-${primary}-700"
            >
              Reply
            </button>
            <button
              onClick={() => setReplyingTo(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatCount(totalComments)} Comments
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'top' | 'newest')}
          className="text-sm border-0 text-gray-600 dark:text-gray-400 bg-transparent cursor-pointer"
        >
          <option value="top">Top comments</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {/* Add comment */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-${primary}-500 focus:border-transparent"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-${primary}-600 text-white rounded-lg hover:bg-${primary}-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comment
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
}`;
}

export function generateMusicPlayer(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, ListMusic } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: number;
  url: string;
}

interface MusicPlayerProps {
  currentTrack?: Track;
  playlist?: Track[];
  onTrackChange?: (track: Track) => void;
  onPlaylistClick?: () => void;
}

export function MusicPlayer({ currentTrack, playlist = [], onTrackChange, onPlaylistClick }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePrevious = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      onTrackChange?.(playlist[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < playlist.length - 1) {
      onTrackChange?.(playlist[currentIndex + 1]);
    } else if (isRepeat) {
      onTrackChange?.(playlist[0]);
    }
  };

  if (!currentTrack) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-xl text-center">
        <p className="text-gray-400">No track selected</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-xl">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />

      <div className="flex items-center gap-4">
        {/* Album Art */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          {currentTrack.albumArt ? (
            <img src={currentTrack.albumArt} alt={currentTrack.album} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-${primary}-600 flex items-center justify-center">
              <ListMusic className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{currentTrack.title}</h4>
          <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={currentTrack.duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-xs text-gray-400 w-10">{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={\`p-2 rounded-full transition-colors \${isShuffle ? 'text-${primary}-500' : 'text-gray-400 hover:text-white'}\`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={handlePrevious} className="p-2 text-gray-400 hover:text-white">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-gray-900" />
            ) : (
              <Play className="w-5 h-5 text-gray-900 ml-0.5" />
            )}
          </button>
          <button onClick={handleNext} className="p-2 text-gray-400 hover:text-white">
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={\`p-2 rounded-full transition-colors \${isRepeat ? 'text-${primary}-500' : 'text-gray-400 hover:text-white'}\`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={\`p-2 rounded-full transition-colors \${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}\`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <button onClick={onPlaylistClick} className="p-2 text-gray-400 hover:text-white">
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateNowPlaying(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Music, Play, Heart, MoreHorizontal, Radio } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  isPlaying?: boolean;
  isLiked?: boolean;
}

interface NowPlayingProps {
  track?: Track;
  queue?: Track[];
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onMore?: (track: Track) => void;
}

export function NowPlaying({ track, queue = [], onPlay, onLike, onMore }: NowPlayingProps) {
  if (!track) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-40 text-gray-400">
          <div className="text-center">
            <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nothing playing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      {/* Current Track */}
      <div className="relative">
        {track.albumArt ? (
          <img src={track.albumArt} alt={track.album} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-${primary}-500 to-${primary}-700 flex items-center justify-center">
            <Music className="w-24 h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white">{track.title}</h3>
          <p className="text-white/80">{track.artist}</p>
          {track.album && <p className="text-sm text-white/60 mt-1">{track.album}</p>}
        </div>

        {/* Playing indicator */}
        {track.isPlaying && (
          <div className="absolute top-4 right-4 bg-${primary}-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
            </span>
            Now Playing
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onLike?.(track)}
          className={\`p-2 rounded-full transition-colors \${track.isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-gray-600'}\`}
        >
          <Heart className="w-5 h-5" fill={track.isLiked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onPlay?.(track)}
          className="w-12 h-12 bg-${primary}-600 hover:bg-${primary}-700 rounded-full flex items-center justify-center text-white"
        >
          <Play className="w-6 h-6 ml-0.5" />
        </button>
        <button
          onClick={() => onMore?.(track)}
          className="p-2 rounded-full text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Up Next</h4>
          <div className="space-y-2">
            {queue.slice(0, 3).map((queueTrack, index) => (
              <div
                key={queueTrack.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => onPlay?.(queueTrack)}
              >
                <span className="w-6 text-center text-sm text-gray-400">{index + 1}</span>
                {queueTrack.albumArt ? (
                  <img src={queueTrack.albumArt} alt="" className="w-10 h-10 rounded" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Music className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{queueTrack.title}</p>
                  <p className="text-sm text-gray-500 truncate">{queueTrack.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

export function generatePodcastSearch(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { Search, Mic, X, TrendingUp, Clock, Star } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'podcast' | 'episode' | 'category';
  title: string;
  subtitle?: string;
  image?: string;
}

interface PodcastSearchProps {
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  trendingSearches?: string[];
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
}

export function PodcastSearch({
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  onSearch,
  onSuggestionClick,
  onClearRecent
}: PodcastSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search podcasts, episodes, or topics..."
            className="w-full pl-12 pr-20 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-${primary}-500 focus:bg-white dark:focus:bg-gray-700"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-${primary}-600"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          {/* Search suggestions */}
          {query && suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {suggestion.image ? (
                    <img src={suggestion.image} alt="" className="w-10 h-10 rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-${primary}-100 dark:bg-${primary}-900/30 rounded flex items-center justify-center">
                      <Search className="w-5 h-5 text-${primary}-600" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{suggestion.title}</p>
                    {suggestion.subtitle && (
                      <p className="text-sm text-gray-500">{suggestion.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h4>
                <button
                  onClick={onClearRecent}
                  className="text-xs text-${primary}-600 hover:text-${primary}-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      onSearch(search);
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          {!query && trendingSearches.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                Trending
              </h4>
              <div className="space-y-1">
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      onSearch(search);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  >
                    <span className="w-6 h-6 bg-${primary}-100 dark:bg-${primary}-900/30 rounded-full flex items-center justify-center text-xs font-medium text-${primary}-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`;
}

export function generateEpisodeCard(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Play, Pause, Clock, Download, Share2, MoreVertical, CheckCircle } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  podcastName: string;
  duration: number;
  publishedAt: string;
  isPlayed?: boolean;
  isDownloaded?: boolean;
  progress?: number;
}

interface EpisodeCardProps {
  episode: Episode;
  isPlaying?: boolean;
  onPlay?: (episode: Episode) => void;
  onPause?: () => void;
  onDownload?: (episode: Episode) => void;
  onShare?: (episode: Episode) => void;
}

export function EpisodeCard({
  episode,
  isPlaying,
  onPlay,
  onPause,
  onDownload,
  onShare
}: EpisodeCardProps) {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return \`\${hrs}h \${mins}m\`;
    return \`\${mins} min\`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return \`\${diffDays} days ago\`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          {episode.thumbnail ? (
            <img
              src={episode.thumbnail}
              alt={episode.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-${primary}-100 dark:bg-${primary}-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-${primary}-600">
                {episode.podcastName[0]}
              </span>
            </div>
          )}
          {episode.isPlayed && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-${primary}-600 font-medium">{episode.podcastName}</p>
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mt-1">
                {episode.title}
              </h3>
            </div>
            <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {episode.description}
          </p>

          {/* Progress bar */}
          {episode.progress !== undefined && episode.progress > 0 && (
            <div className="mt-3">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-${primary}-600 rounded-full"
                  style={{ width: \`\${episode.progress}%\` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((episode.duration * episode.progress) / 100 / 60)} min left
              </p>
            </div>
          )}

          {/* Meta & Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{formatDate(episode.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(episode.duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDownload?.(episode)}
                className={\`p-2 rounded-full transition-colors \${
                  episode.isDownloaded
                    ? 'text-${primary}-600 bg-${primary}-50 dark:bg-${primary}-900/20'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }\`}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onShare?.(episode)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => (isPlaying ? onPause?.() : onPlay?.(episode))}
                className="w-10 h-10 bg-${primary}-600 hover:bg-${primary}-700 rounded-full flex items-center justify-center text-white"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateMovieFilters(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { Filter, ChevronDown, Star, Calendar, Clock, X } from 'lucide-react';

interface FilterOptions {
  genres: string[];
  years: number[];
  ratings: string[];
  durations: string[];
}

interface SelectedFilters {
  genres: string[];
  year?: number;
  minRating?: number;
  duration?: string;
}

interface MovieFiltersProps {
  options: FilterOptions;
  selected: SelectedFilters;
  onChange: (filters: SelectedFilters) => void;
  onClear?: () => void;
}

export function MovieFilters({ options, selected, onChange, onClear }: MovieFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const hasFilters = selected.genres.length > 0 || selected.year || selected.minRating || selected.duration;

  const toggleGenre = (genre: string) => {
    const newGenres = selected.genres.includes(genre)
      ? selected.genres.filter(g => g !== genre)
      : [...selected.genres, genre];
    onChange({ ...selected, genres: newGenres });
  };

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Genre dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg border \${
              selected.genres.length > 0
                ? 'border-${primary}-500 bg-${primary}-50 text-${primary}-700 dark:bg-${primary}-900/20 dark:text-${primary}-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }\`}
          >
            <Filter className="w-4 h-4" />
            Genre
            {selected.genres.length > 0 && (
              <span className="w-5 h-5 bg-${primary}-600 text-white rounded-full text-xs flex items-center justify-center">
                {selected.genres.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
          {openDropdown === 'genre' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-3 z-50">
              <div className="grid grid-cols-2 gap-2">
                {options.genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={\`px-3 py-2 rounded-lg text-sm transition-colors \${
                      selected.genres.includes(genre)
                        ? 'bg-${primary}-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }\`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Year dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg border \${
              selected.year
                ? 'border-${primary}-500 bg-${primary}-50 text-${primary}-700 dark:bg-${primary}-900/20 dark:text-${primary}-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }\`}
          >
            <Calendar className="w-4 h-4" />
            {selected.year || 'Year'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {openDropdown === 'year' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-2 max-h-60 overflow-y-auto z-50">
              <button
                onClick={() => {
                  onChange({ ...selected, year: undefined });
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                All Years
              </button>
              {options.years.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    onChange({ ...selected, year });
                    setOpenDropdown(null);
                  }}
                  className={\`w-full text-left px-3 py-2 text-sm rounded \${
                    selected.year === year
                      ? 'bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }\`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rating dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg border \${
              selected.minRating
                ? 'border-${primary}-500 bg-${primary}-50 text-${primary}-700 dark:bg-${primary}-900/20 dark:text-${primary}-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }\`}
          >
            <Star className="w-4 h-4" />
            {selected.minRating ? \`\${selected.minRating}+ Rating\` : 'Rating'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {openDropdown === 'rating' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-2 z-50">
              {[9, 8, 7, 6, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => {
                    onChange({ ...selected, minRating: rating });
                    setOpenDropdown(null);
                  }}
                  className={\`w-full flex items-center gap-2 px-3 py-2 text-sm rounded \${
                    selected.minRating === rating
                      ? 'bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }\`}
                >
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  {rating}+ and above
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Duration dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'duration' ? null : 'duration')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg border \${
              selected.duration
                ? 'border-${primary}-500 bg-${primary}-50 text-${primary}-700 dark:bg-${primary}-900/20 dark:text-${primary}-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }\`}
          >
            <Clock className="w-4 h-4" />
            {selected.duration || 'Duration'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {openDropdown === 'duration' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-2 z-50">
              {options.durations.map(duration => (
                <button
                  key={duration}
                  onClick={() => {
                    onChange({ ...selected, duration });
                    setOpenDropdown(null);
                  }}
                  className={\`w-full text-left px-3 py-2 text-sm rounded \${
                    selected.duration === duration
                      ? 'bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }\`}
                >
                  {duration}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Active filters tags */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {selected.genres.map(genre => (
            <span
              key={genre}
              className="inline-flex items-center gap-1 px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm"
            >
              {genre}
              <button onClick={() => toggleGenre(genre)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selected.year && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm">
              {selected.year}
              <button onClick={() => onChange({ ...selected, year: undefined })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selected.minRating && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm">
              {selected.minRating}+ Rating
              <button onClick={() => onChange({ ...selected, minRating: undefined })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selected.duration && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm">
              {selected.duration}
              <button onClick={() => onChange({ ...selected, duration: undefined })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}`;
}

export function generateGameListPopular(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Star, Users, Clock, Gamepad2, TrendingUp } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  genre: string;
  rating: number;
  players: number;
  playTime: string;
  isNew?: boolean;
  isTrending?: boolean;
}

interface GameListPopularProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  onPlayNow?: (game: Game) => void;
}

export function GameListPopular({ games, onGameClick, onPlayNow }: GameListPopularProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-${primary}-600" />
          Popular Games
        </h2>
        <button className="text-sm text-${primary}-600 hover:text-${primary}-700">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
            onClick={() => onGameClick?.(game)}
          >
            {/* Rank */}
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold \${
              index === 0 ? 'bg-yellow-100 text-yellow-700' :
              index === 1 ? 'bg-gray-200 text-gray-700' :
              index === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-600'
            }\`}>
              {index + 1}
            </div>

            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={game.thumbnail}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              {game.isNew && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                  NEW
                </div>
              )}
              {game.isTrending && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {game.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{game.genre}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                  {game.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  {game.players.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {game.playTime}
                </span>
              </div>
            </div>

            {/* Play button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayNow?.(game);
              }}
              className="flex-shrink-0 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Gamepad2 className="w-4 h-4" />
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

export function generateGenreGrid(options: EntertainmentOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Genre {
  id: string;
  name: string;
  icon?: React.ReactNode;
  image?: string;
  color: string;
  itemCount: number;
}

interface GenreGridProps {
  genres: Genre[];
  onGenreClick?: (genre: Genre) => void;
}

export function GenreGrid({ genres, onGenreClick }: GenreGridProps) {
  const defaultColors = [
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
    'from-red-500 to-pink-600',
    'from-teal-500 to-cyan-600',
    'from-violet-500 to-purple-600',
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {genres.map((genre, index) => (
        <button
          key={genre.id}
          onClick={() => onGenreClick?.(genre)}
          className="group relative aspect-[4/3] rounded-xl overflow-hidden"
        >
          {/* Background */}
          {genre.image ? (
            <img
              src={genre.image}
              alt={genre.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className={\`absolute inset-0 bg-gradient-to-br \${genre.color || defaultColors[index % defaultColors.length]}\`} />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
            {genre.icon && (
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
                {genre.icon}
              </div>
            )}
            <h3 className="font-bold text-lg text-center">{genre.name}</h3>
            <p className="text-sm text-white/80 mt-1">{genre.itemCount} items</p>
          </div>

          {/* Hover arrow */}
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </button>
      ))}
    </div>
  );
}`;
}
