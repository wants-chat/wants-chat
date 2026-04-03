/**
 * Article Component Generators
 * Modular components for article content display, feedback, sidebar, and related articles
 */

export interface ArticleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateArticleContent(options: ArticleOptions = {}): string {
  const { componentName = 'ArticleContent', endpoint = '/articles' } = options;

  return `import React from 'react';
import { Clock, Eye, Calendar, Tag } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  tags?: string[];
  read_time?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

interface ${componentName}Props {
  article: Article;
  showMeta?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ article, showMeta = true }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {article.category && (
          <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium mb-3">
            {article.category.name}
          </span>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{article.title}</h1>

        {showMeta && (
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            {article.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.read_time} min read
              </span>
            )}
            {article.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views.toLocaleString()} views
              </span>
            )}
            {article.updated_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Updated {new Date(article.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <div
          className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {article.author && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <div className="flex items-center gap-3">
            {article.author.avatar_url ? (
              <img
                src={article.author.avatar_url}
                alt={article.author.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Written by</p>
              <p className="font-medium text-gray-900 dark:text-white">{article.author.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateArticleFeedback(options: ArticleOptions = {}): string {
  const { componentName = 'ArticleFeedback', endpoint = '/articles' } = options;

  return `import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, Loader2, MessageSquare, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  articleId: string;
  showCommentForm?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ articleId, showCommentForm = false }) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const feedbackMutation = useMutation({
    mutationFn: (helpful: boolean) =>
      api.post('${endpoint}/' + articleId + '/feedback', { helpful }),
    onSuccess: () => {
      toast.success('Thanks for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}/' + articleId + '/comments', { content }),
    onSuccess: () => {
      toast.success('Comment submitted!');
      setComment('');
      setShowComment(false);
    },
    onError: () => {
      toast.error('Failed to submit comment');
    },
  });

  const handleFeedback = (helpful: boolean) => {
    setFeedback(helpful ? 'helpful' : 'not_helpful');
    feedbackMutation.mutate(helpful);
    if (!helpful && showCommentForm) {
      setShowComment(true);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMutation.mutate(comment);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-gray-700 dark:text-gray-300 mb-4">Was this article helpful?</p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => handleFeedback(true)}
          disabled={feedback !== null || feedbackMutation.isPending}
          className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${
            feedback === 'helpful'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'border-gray-300 dark:border-gray-600 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:border-green-700'
          } disabled:opacity-50\`}
        >
          {feedbackMutation.isPending && feedback === null ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsUp className={\`w-4 h-4 \${feedback === 'helpful' ? 'fill-current' : ''}\`} />
          )}
          Yes, helpful
        </button>

        <button
          onClick={() => handleFeedback(false)}
          disabled={feedback !== null || feedbackMutation.isPending}
          className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${
            feedback === 'not_helpful'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              : 'border-gray-300 dark:border-gray-600 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-700'
          } disabled:opacity-50\`}
        >
          {feedbackMutation.isPending && feedback === null ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsDown className={\`w-4 h-4 \${feedback === 'not_helpful' ? 'fill-current' : ''}\`} />
          )}
          No
        </button>
      </div>

      {feedback !== null && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {feedback === 'helpful'
            ? 'Great! We\\'re glad this helped.'
            : 'Sorry this wasn\\'t helpful. We\\'ll work to improve it.'}
        </p>
      )}

      {showComment && showCommentForm && (
        <form onSubmit={handleSubmitComment} className="mt-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              Tell us how we can improve
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="What information were you looking for?"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!comment.trim() || commentMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {commentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateArticleSidebar(options: ArticleOptions = {}): string {
  const { componentName = 'ArticleSidebar', endpoint = '/articles' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Folder, FileText, TrendingUp, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  currentArticleId?: string;
  categoryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ currentArticleId, categoryId }) => {
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['article-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: recentArticles, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?sort=created_at&order=desc&limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: popularArticles, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-articles'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?popular=true&limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Folder className="w-4 h-4 text-purple-600" />
          Categories
        </h3>
        {loadingCategories ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="space-y-2">
            {categories?.map((category: any) => (
              <li key={category.id}>
                <Link
                  to={\`/help/\${category.slug || category.id}\`}
                  className={\`flex items-center justify-between p-2 rounded-lg transition-colors \${
                    categoryId === category.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }\`}
                >
                  <span className="text-sm">{category.name}</span>
                  {category.article_count !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {category.article_count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Popular Articles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Popular Articles
        </h3>
        {loadingPopular ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="space-y-2">
            {popularArticles?.filter((a: any) => a.id !== currentArticleId).slice(0, 5).map((article: any) => (
              <li key={article.id}>
                <Link
                  to={\`/help/article/\${article.slug || article.id}\`}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Articles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          Recent Articles
        </h3>
        {loadingRecent ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="space-y-2">
            {recentArticles?.filter((a: any) => a.id !== currentArticleId).slice(0, 5).map((article: any) => (
              <li key={article.id}>
                <Link
                  to={\`/help/article/\${article.slug || article.id}\`}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2 block">
                      {article.title}
                    </span>
                    {article.created_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRelatedArticles(options: ArticleOptions = {}): string {
  const { componentName = 'RelatedArticles', endpoint = '/articles' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FileText, ChevronRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  articleId: string;
  categoryId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ articleId, categoryId, limit = 5 }) => {
  const { data: relatedArticles, isLoading } = useQuery({
    queryKey: ['related-articles', articleId, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append('category', categoryId);
      params.append('exclude', articleId);
      params.append('limit', limit.toString());

      const response = await api.get<any>('${endpoint}/related?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          Related Articles
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {relatedArticles.map((article: any) => (
          <Link
            key={article.id}
            to={\`/help/article/\${article.slug || article.id}\`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                {article.read_time && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {article.read_time} min
                  </span>
                )}
                {article.category && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {article.category.name}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
