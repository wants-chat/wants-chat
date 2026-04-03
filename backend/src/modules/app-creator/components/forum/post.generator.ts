/**
 * Forum Post Component Generators
 */

export interface PostOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePostList(options: PostOptions = {}): string {
  const { componentName = 'PostList', endpoint = '/forum/posts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  threadId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ threadId }) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', threadId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?thread_id=' + threadId);
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

  return (
    <div className="space-y-4">
      {posts && posts.length > 0 ? (
        posts.map((post: any, index: number) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{post.author_name}</span>
                    {post.author_role && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                        {post.author_role}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(post.created_at).toLocaleString()}
                    <span className="text-gray-400">#{index + 1}</span>
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                    <ThumbsUp className="w-4 h-4" />
                    {post.like_count || 0}
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">No replies yet</div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePostEditor(options: PostOptions = {}): string {
  const { componentName = 'PostEditor' } = options;

  return `import React, { useState } from 'react';
import { Bold, Italic, Link, Image, List, ListOrdered, Code, Quote } from 'lucide-react';

interface ${componentName}Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ value, onChange, placeholder = 'Write your reply...' }) => {
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const tools = [
    { icon: Bold, action: () => insertFormatting('**'), title: 'Bold' },
    { icon: Italic, action: () => insertFormatting('*'), title: 'Italic' },
    { icon: Link, action: () => insertFormatting('[', '](url)'), title: 'Link' },
    { icon: Image, action: () => insertFormatting('![alt](', ')'), title: 'Image' },
    { icon: List, action: () => insertFormatting('- ', ''), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertFormatting('1. ', ''), title: 'Numbered List' },
    { icon: Code, action: () => insertFormatting('\`\`\`\\n', '\\n\`\`\`'), title: 'Code Block' },
    { icon: Quote, action: () => insertFormatting('> ', ''), title: 'Quote' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {tools.map(({ icon: Icon, action, title }) => (
          <button
            key={title}
            type="button"
            onClick={action}
            title={title}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none"
      />
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePostReply(options: PostOptions = {}): string {
  const { componentName = 'PostReply', endpoint = '/forum/posts' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Paperclip, Image } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  threadId: string;
  replyTo?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ threadId, replyTo, onSuccess }) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const replyMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['posts', threadId] });
      setContent('');
      toast.success('Reply posted!');
      onSuccess?.();
    },
    onError: () => toast.error('Failed to post reply'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      replyMutation.mutate({
        thread_id: threadId,
        content,
        reply_to: replyTo,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
        />
      </div>
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex gap-2">
          <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Paperclip className="w-4 h-4 text-gray-500" />
          </button>
          <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Image className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || replyMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {replyMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Post Reply
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
