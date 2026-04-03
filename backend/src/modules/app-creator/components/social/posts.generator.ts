/**
 * Social Posts Component Generators
 *
 * Generates post composer, post feed, and comment components.
 */

export interface PostsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePostComposer(options: PostsOptions = {}): string {
  const { componentName = 'PostComposer', endpoint = '/posts' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, Video, Smile, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  placeholder?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  placeholder = "What's on your mind?",
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string }) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setContent('');
      toast.success('Post created!');
      onSuccess?.();
    },
    onError: () => toast.error('Failed to create post'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPostMutation.mutate({ content: content.trim() });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full border-0 bg-transparent resize-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
              <Image className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
              <Video className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || createPostMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePostFeed(options: PostsOptions = {}): string {
  const { componentName = 'PostFeed', endpoint = '/posts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Heart, MessageCircle, Share2, MoreHorizontal, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId, limit }) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', userId, limit],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (userId) params.push('user_id=' + userId);
      if (limit) params.push('limit=' + limit);
      if (params.length) url += '?' + params.join('&');
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

  if (!posts?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {post.user?.avatar_url || post.author_avatar ? (
                    <img
                      src={post.user?.avatar_url || post.author_avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {(post.user?.name || post.author_name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {post.user?.name || post.author_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="" className="mt-3 rounded-lg max-h-96 w-full object-cover" />
              )}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around">
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCommentSection(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'CommentSection', endpoint = '/comments' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, User, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  parentType: string;
  parentId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ parentType, parentId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', parentType, parentId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?parent_type=\${parentType}&parent_id=\${parentId}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => api.post('${endpoint}', {
      content,
      parent_type: parentType,
      parent_id: parentId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', parentType, parentId] });
      setNewComment('');
    },
    onError: () => toast.error('Failed to post comment'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createMutation.mutate(newComment.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || createMutation.isPending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : comments?.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {comment.user?.avatar_url ? (
                  <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {(comment.user?.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {comment.user?.name || 'Anonymous'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-4">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4 flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          No comments yet
        </p>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
