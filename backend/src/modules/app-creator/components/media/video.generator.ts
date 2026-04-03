/**
 * Video Component Generators
 */

export interface VideoOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVideoCard(options: VideoOptions = {}): string {
  const { componentName = 'VideoCard' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Eye, ThumbsUp, MoreVertical, CheckCircle } from 'lucide-react';

interface ${componentName}Props {
  video: {
    id: string;
    title: string;
    thumbnail_url?: string;
    channel_name?: string;
    channel_avatar_url?: string;
    channel_verified?: boolean;
    duration?: string;
    views?: number;
    likes?: number;
    published_at?: string;
  };
  layout?: 'grid' | 'list' | 'compact';
  onPlay?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ video, layout = 'grid', onPlay }) => {
  const formatViews = (views: number) => {
    if (views >= 1000000) return \`\${(views / 1000000).toFixed(1)}M\`;
    if (views >= 1000) return \`\${(views / 1000).toFixed(1)}K\`;
    return views.toString();
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return \`\${days} days ago\`;
    if (days < 30) return \`\${Math.floor(days / 7)} weeks ago\`;
    if (days < 365) return \`\${Math.floor(days / 30)} months ago\`;
    return \`\${Math.floor(days / 365)} years ago\`;
  };

  if (layout === 'compact') {
    return (
      <Link
        to={\`/videos/\${video.id}\`}
        className="flex gap-3 group"
        onClick={(e) => {
          if (onPlay) {
            e.preventDefault();
            onPlay();
          }
        }}
      >
        <div className="relative w-40 aspect-video flex-shrink-0">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {video.duration && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
              {video.duration}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600">
            {video.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">{video.channel_name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            {video.views !== undefined && <span>{formatViews(video.views)} views</span>}
            {video.published_at && <span>{formatDate(video.published_at)}</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (layout === 'list') {
    return (
      <Link
        to={\`/videos/\${video.id}\`}
        className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
        onClick={(e) => {
          if (onPlay) {
            e.preventDefault();
            onPlay();
          }
        }}
      >
        <div className="relative w-64 aspect-video flex-shrink-0">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
          {video.duration && (
            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
              {video.duration}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {video.channel_avatar_url ? (
              <img src={video.channel_avatar_url} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
            )}
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {video.channel_name}
              {video.channel_verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {video.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViews(video.views)} views
              </span>
            )}
            {video.likes !== undefined && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {formatViews(video.likes)}
              </span>
            )}
            {video.published_at && <span>{formatDate(video.published_at)}</span>}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg self-start">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </Link>
    );
  }

  // Grid layout (default)
  return (
    <Link
      to={\`/videos/\${video.id}\`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
      onClick={(e) => {
        if (onPlay) {
          e.preventDefault();
          onPlay();
        }
      }}
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
        <div className="flex gap-3">
          {video.channel_avatar_url ? (
            <img src={video.channel_avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              {video.channel_name}
              {video.channel_verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              {video.views !== undefined && <span>{formatViews(video.views)} views</span>}
              {video.published_at && (
                <>
                  <span>-</span>
                  <span>{formatDate(video.published_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ${componentName};
`;
}

export function generateVideoComments(options: VideoOptions = {}): string {
  const { componentName = 'VideoComments', endpoint = '/videos' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, MoreVertical, Flag, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  videoId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ videoId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['video-comments', videoId, sortBy],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${videoId}/comments?sort=\${sortBy}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(\`${endpoint}/\${videoId}/comments\`, { content });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', videoId] });
      setNewComment('');
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const response = await api.post(\`${endpoint}/\${videoId}/comments/\${commentId}/replies\`, { content });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', videoId] });
      setReplyTo(null);
      setReplyText('');
      toast.success('Reply added!');
    },
    onError: () => toast.error('Failed to add reply'),
  });

  const likeMutation = useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' }) => {
      const response = await api.post(\`${endpoint}/\${videoId}/comments/\${commentId}/\${type}\`, {});
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', videoId] });
    },
  });

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyText.trim()) {
      addReplyMutation.mutate({ commentId, content: replyText.trim() });
    }
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return \`\${mins}m ago\`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return \`\${hours}h ago\`;
    const days = Math.floor(hours / 24);
    if (days < 30) return \`\${days}d ago\`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {comments?.length || 0} Comments
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'top' | 'newest')}
            className="text-sm bg-transparent border-none focus:outline-none text-gray-600 dark:text-gray-400 cursor-pointer"
          >
            <option value="top">Top comments</option>
            <option value="newest">Newest first</option>
          </select>
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="flex gap-3 mt-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-0 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
            {newComment && (
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Comment
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="p-4">
              <div className="flex gap-3">
                {comment.user_avatar_url ? (
                  <img src={comment.user_avatar_url} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.user_name}</span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                    {comment.edited && <span className="text-xs text-gray-400">(edited)</span>}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => likeMutation.mutate({ commentId: comment.id, type: 'like' })}
                      className={\`flex items-center gap-1 text-sm \${
                        comment.user_liked ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }\`}
                    >
                      <ThumbsUp className="w-4 h-4" fill={comment.user_liked ? 'currentColor' : 'none'} />
                      {comment.likes || 0}
                    </button>
                    <button
                      onClick={() => likeMutation.mutate({ commentId: comment.id, type: 'dislike' })}
                      className={\`flex items-center gap-1 text-sm \${
                        comment.user_disliked ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }\`}
                    >
                      <ThumbsDown className="w-4 h-4" fill={comment.user_disliked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Reply
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <div className="flex gap-3 mt-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Add a reply..."
                          autoFocus
                          className="w-full px-0 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => { setReplyTo(null); setReplyText(''); }}
                            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyText.trim() || addReplyMutation.isPending}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                          >
                            {addReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.reply_count > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="flex items-center gap-2 mt-3 text-sm text-purple-600 hover:text-purple-700"
                    >
                      {expandedReplies.has(comment.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                    </button>
                  )}

                  {expandedReplies.has(comment.id) && comment.replies && (
                    <div className="mt-3 space-y-3">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3">
                          {reply.user_avatar_url ? (
                            <img src={reply.user_avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-900 dark:text-white">{reply.user_name}</span>
                              <span className="text-xs text-gray-400">{formatTimeAgo(reply.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                <ThumbsUp className="w-3 h-3" />
                                {reply.likes || 0}
                              </button>
                              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
