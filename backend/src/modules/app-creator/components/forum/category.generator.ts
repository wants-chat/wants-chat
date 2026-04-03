/**
 * Forum Category Component Generators
 */

export interface ForumCategoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateForumCategories(options: ForumCategoryOptions = {}): string {
  const { componentName = 'ForumCategories', endpoint = '/forum/categories' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Users, ChevronRight, Pin } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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
    <div className="space-y-4">
      {categories && categories.length > 0 ? (
        categories.map((category: any) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}>
                <MessageSquare className="w-5 h-5" style={{ color: category.color || '#8B5CF6' }} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description}</p>
                )}
              </div>
            </div>

            {category.subcategories && category.subcategories.length > 0 && (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.subcategories.map((sub: any) => (
                  <Link
                    key={sub.id}
                    to={\`/forum/\${sub.slug || sub.id}\`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{sub.name}</h3>
                      {sub.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{sub.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">{sub.thread_count || 0}</p>
                        <p className="text-xs">Threads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">{sub.post_count || 0}</p>
                        <p className="text-xs">Posts</p>
                      </div>
                    </div>
                    {sub.last_post && (
                      <div className="hidden md:block text-sm text-right max-w-[200px]">
                        <p className="text-gray-900 dark:text-white truncate">{sub.last_post.title}</p>
                        <p className="text-gray-500 text-xs">
                          by {sub.last_post.author} • {new Date(sub.last_post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No categories found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCategoryCard(options: ForumCategoryOptions = {}): string {
  const { componentName = 'CategoryCard' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  thread_count?: number;
  post_count?: number;
}

interface ${componentName}Props {
  category: Category;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category }) => {
  return (
    <Link
      to={\`/forum/\${category.slug || category.id}\`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}>
          <MessageSquare className="w-6 h-6" style={{ color: category.color || '#8B5CF6' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
          {category.description && (
            <p className="text-gray-500 mt-1 line-clamp-2">{category.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {category.thread_count || 0} threads
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {category.post_count || 0} posts
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ${componentName};
`;
}
