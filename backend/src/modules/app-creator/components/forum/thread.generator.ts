/**
 * Forum Thread Component Generators
 */

export interface ThreadOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateThreadList(options: ThreadOptions = {}): string {
  const { componentName = 'ThreadList', endpoint = '/forum/threads' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Loader2, MessageSquare, Pin, Lock, Eye, Clock, User, Plus } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [sort, setSort] = useState('latest');

  const { data, isLoading } = useQuery({
    queryKey: ['threads', categoryId, sort],
    queryFn: async () => {
      const url = '${endpoint}?category=' + categoryId + '&sort=' + sort;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const threads = data?.threads || data || [];
  const category = data?.category;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {category && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
              <p className="text-gray-500">{category.description}</p>
            </>
          )}
        </div>
        <Link
          to={\`/forum/\${categoryId}/new\`}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </Link>
      </div>

      <div className="flex gap-2">
        {['latest', 'popular', 'unanswered'].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
              sort === s
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }\`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {threads.length > 0 ? (
            threads.map((thread: any) => (
              <Link
                key={thread.id}
                to={\`/forum/thread/\${thread.id}\`}
                className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {thread.author_avatar ? (
                    <img src={thread.author_avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {thread.is_pinned && <Pin className="w-4 h-4 text-purple-600" />}
                    {thread.is_locked && <Lock className="w-4 h-4 text-gray-400" />}
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{thread.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Started by <span className="font-medium">{thread.author_name}</span>
                  </p>
                  {thread.tags && thread.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {thread.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="text-center hidden sm:block">
                    <p className="font-medium text-gray-900 dark:text-white">{thread.reply_count || 0}</p>
                    <p className="text-xs">Replies</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="font-medium text-gray-900 dark:text-white">{thread.view_count || 0}</p>
                    <p className="text-xs">Views</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500">{new Date(thread.last_activity || thread.created_at).toLocaleDateString()}</p>
                    {thread.last_reply_author && (
                      <p className="text-gray-400">by {thread.last_reply_author}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No threads yet. Be the first to start a discussion!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateThreadDetail(options: ThreadOptions = {}): string {
  const { componentName = 'ThreadDetail', endpoint = '/forum/threads' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Pin, Lock, Eye, Clock, MessageSquare, Share2, Flag, MoreVertical, User, ThumbsUp, Quote } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();

  const { data: thread, isLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + threadId);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!thread) {
    return <div className="text-center py-12 text-gray-500">Thread not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link to={\`/forum/\${thread.category_id}\`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to {thread.category_name || 'Category'}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            {thread.is_pinned && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{thread.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {thread.view_count || 0} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {thread.reply_count || 0} replies
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(thread.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Original Post */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {thread.author_avatar ? (
                <img src={thread.author_avatar} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{thread.author_name}</span>
                {thread.author_role && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                    {thread.author_role}
                  </span>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: thread.content }} />
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                  <ThumbsUp className="w-4 h-4" />
                  {thread.like_count || 0}
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                  <Quote className="w-4 h-4" />
                  Quote
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {thread.replies && thread.replies.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {thread.replies.map((reply: any, index: number) => (
              <div key={reply.id} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {reply.author_avatar ? (
                      <img src={reply.author_avatar} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{reply.author_name}</span>
                        <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-gray-400">#{index + 2}</span>
                    </div>
                    <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                        <ThumbsUp className="w-3 h-3" />
                        {reply.like_count || 0}
                      </button>
                      <button className="text-sm text-gray-500 hover:text-purple-600">Quote</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCreateThread(options: ThreadOptions = {}): string {
  const { componentName = 'CreateThread', endpoint = '/forum/threads' } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, X, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      toast.success('Thread created!');
      navigate('/forum/thread/' + (response?.data?.id || response?.id));
    },
    onError: () => toast.error('Failed to create thread'),
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      category_id: categoryId,
      title,
      content,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Thread</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
            <textarea
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or start a discussion..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Up to 5 tags</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Thread
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
