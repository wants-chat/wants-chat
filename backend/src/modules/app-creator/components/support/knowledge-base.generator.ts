/**
 * Knowledge Base Component Generators
 */

export interface KnowledgeBaseOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateKnowledgeBase(options: KnowledgeBaseOptions = {}): string {
  const { componentName = 'KnowledgeBase', endpoint = '/articles' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, Book, FileText, ChevronRight, Folder } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: popular } = useQuery({
    queryKey: ['kb-popular'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?popular=true&limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How can we help?</h1>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 shadow-sm"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.map((category: any) => (
          <Link
            key={category.id}
            to={\`/help/\${category.slug || category.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}>
                <Folder className="w-6 h-6" style={{ color: category.color || '#8B5CF6' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.article_count || 0} articles</p>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
            )}
          </Link>
        ))}
      </div>

      {popular && popular.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Book className="w-5 h-5" />
            Popular Articles
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {popular.map((article: any) => (
              <Link
                key={article.id}
                to={\`/help/article/\${article.slug || article.id}\`}
                className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-3 px-3 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-gray-900 dark:text-white">{article.title}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateArticleList(options: KnowledgeBaseOptions = {}): string {
  const { componentName = 'ArticleList', endpoint = '/articles' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FileText, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const { data: category } = useQuery({
    queryKey: ['kb-category', categoryId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories/' + categoryId);
      return response?.data || response;
    },
  });

  const { data: articles, isLoading } = useQuery({
    queryKey: ['kb-articles', categoryId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?category=' + categoryId);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/help" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
        {category && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
            {category.description && (
              <p className="text-gray-500 mt-1">{category.description}</p>
            )}
          </>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {articles && articles.length > 0 ? (
            articles.map((article: any) => (
              <Link
                key={article.id}
                to={\`/help/article/\${article.slug || article.id}\`}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {article.read_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.read_time} min read
                      </span>
                    )}
                    {article.views && (
                      <span>{article.views} views</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No articles found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateArticleDetail(options: KnowledgeBaseOptions = {}): string {
  const { componentName = 'ArticleDetail', endpoint = '/articles' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Clock, ThumbsUp, ThumbsDown, Share2, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ['kb-article', articleId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + articleId);
      return response?.data || response;
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (helpful: boolean) => api.post('${endpoint}/' + articleId + '/feedback', { helpful }),
    onSuccess: () => toast.success('Thanks for your feedback!'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-12 text-gray-500">Article not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/help" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Help Center
      </Link>

      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {article.category && (
            <Link to={\`/help/\${article.category.slug || article.category.id}\`} className="text-sm text-purple-600 hover:text-purple-700">
              {article.category.name}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{article.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {article.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.read_time} min read
              </span>
            )}
            {article.updated_at && (
              <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {article.related_articles && article.related_articles.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Related Articles</h3>
            <ul className="space-y-2">
              {article.related_articles.map((related: any) => (
                <li key={related.id}>
                  <Link to={\`/help/article/\${related.slug || related.id}\`} className="text-purple-600 hover:text-purple-700">
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <p className="text-sm text-gray-500 mb-4">Was this article helpful?</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => feedbackMutation.mutate(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
            >
              <ThumbsUp className="w-4 h-4" />
              Yes
            </button>
            <button
              onClick={() => feedbackMutation.mutate(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
            >
              <ThumbsDown className="w-4 h-4" />
              No
            </button>
            <div className="flex-1" />
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ${componentName};
`;
}
