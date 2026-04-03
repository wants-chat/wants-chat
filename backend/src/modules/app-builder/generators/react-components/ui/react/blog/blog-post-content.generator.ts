import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogPostContent = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'magazine' | 'minimal' = 'standard'
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
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery|article/i)) {
      return `propData?.${fieldName} || ({
        image: '',
        title: '',
        subtitle: '',
        content: '',
        contentHtml: '',
        featuredImage: '',
        category: '',
        pullQuote: '',
        tags: [],
        author: {
          name: 'Author',
          avatar: 'https://ui-avatars.com/api/?name=Author&background=random',
          role: 'Writer',
          bio: ''
        },
        date: 'Recent',
        readTime: '5 min read'
      } as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'posts'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'posts';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    standard: `
${commonImports}
import { Calendar, Clock, User, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Article {
  title: string;
  subtitle: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio: string;
  };
  date: string;
  readTime: string;
  category: string;
  featuredImage: string;
  content: string;
  tags: string[];
}

interface StandardBlogContentProps {
  data?: any;
  className?: string;
  onAuthorClick?: (authorName: string) => void;
  onTagClick?: (tag: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  [key: string]: any; // Accept any additional props from catalog
}

const StandardBlogContent: React.FC<StandardBlogContentProps> = ({
  data: propData,
  className,
  onAuthorClick,
  onTagClick
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = postsData || {};

  // Map actual API fields directly from postsData
  const authorObj = postsData?.author || {};
  const article = {
    title: postsData?.title || '',
    subtitle: postsData?.excerpt || '',
    author: {
      name: authorObj?.name || authorObj?.email || postsData?.author_name || 'Anonymous',
      avatar: authorObj?.avatar || authorObj?.profile_picture || postsData?.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorObj?.name || 'Anonymous')}&background=random\`,
      role: authorObj?.role || authorObj?.bio || postsData?.author_role || 'Contributor',
      bio: authorObj?.bio || authorObj?.description || ''
    },
    date: postsData?.published_at ? new Date(postsData.published_at).toLocaleDateString() : new Date().toLocaleDateString(),
    readTime: postsData?.read_time || \`\${Math.ceil((postsData?.content?.length || 1000) / 1000)} min read\`,
    category: typeof postsData?.category === 'object' ? postsData?.category?.name || '' : (postsData?.category || ''),
    featuredImage: postsData?.featured_image || 'https://placehold.co/1200x600?text=Blog+Post',
    content: postsData?.content || '',
    tags: (postsData?.tags || []).map((tag: any) => typeof tag === 'object' ? tag?.name || '' : tag)
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(article.author.name);
    } else {
      console.log('Author clicked:', article.author.name);
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      console.log('Tag clicked:', tag);
    }
  };

  return (
    <article className={cn("max-w-4xl mx-auto", className)}>
      {/* Featured Image */}
      <div className="mb-8 rounded-xl overflow-hidden">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-96 object-cover"
        />
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-4">
          <span className="inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
            {article.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {article.subtitle}
          </p>
        )}

        {/* Author and Meta */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-6 border-y dark:border-gray-700">
          <div
            onClick={handleAuthorClick}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
          >
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{article.author.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{article.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <ReactMarkdown
          components={{
            code({ node, className, children, ...props }: any) {
              const match = /language-(\\w+)/.exec(className || '');
              const inline = (props as any).inline;
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  {...(props as any)}
                >
                  {String(children).replace(/\\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-blue-600 pl-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg my-6">
                  {children}
                </blockquote>
              );
            }
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 pt-8 border-t dark:border-gray-700">
        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 font-semibold">
          <Tag className="h-4 w-4" />
          Tags:
        </span>
        {article.tags.map((tag: any, index: number) => (
          <button
            key={index}
            onClick={() => handleTagClick(tag)}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </article>
  );
};

export default StandardBlogContent;
    `,

    magazine: `
${commonImports}
import { Calendar, Clock, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Article {
  title: string;
  subtitle: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio: string;
  };
  date: string;
  readTime: string;
  featuredImage: string;
  content: string;
  pullQuote: string;
}

interface MagazineBlogContentProps {
  data?: any;
  className?: string;
  onAuthorClick?: (authorName: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
}

const MagazineBlogContent: React.FC<MagazineBlogContentProps> = ({
  ${dataName}: propData,
  className,
  onAuthorClick
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = postsData || {};

  // Map actual API fields directly from postsData
  const authorObj = postsData?.author || {};
  const article = {
    title: postsData?.title || '',
    subtitle: postsData?.excerpt || '',
    author: {
      name: authorObj?.name || authorObj?.email || postsData?.author_name || 'Anonymous',
      avatar: authorObj?.avatar || authorObj?.profile_picture || postsData?.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorObj?.name || 'Anonymous')}&background=random\`,
      role: authorObj?.role || authorObj?.bio || postsData?.author_role || 'Contributor',
      bio: authorObj?.bio || authorObj?.description || ''
    },
    date: postsData?.published_at ? new Date(postsData.published_at).toLocaleDateString() : new Date().toLocaleDateString(),
    readTime: postsData?.read_time || \`\${Math.ceil((postsData?.content?.length || 1000) / 1000)} min read\`,
    featuredImage: postsData?.featured_image || 'https://placehold.co/1200x600?text=Blog+Post',
    content: postsData?.content || '',
    pullQuote: postsData?.excerpt || postsData?.summary || ''
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(article.author.name);
    } else {
      console.log('Author clicked:', article.author.name);
    }
  };

  return (
    <article className={cn("max-w-5xl mx-auto", className)}>
      {/* Magazine Header */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-2xl text-gray-600 dark:text-gray-400 font-serif italic mb-8 max-w-3xl mx-auto">
            {article.subtitle}
          </p>
        )}

        {/* Author Card */}
        <div
          onClick={handleAuthorClick}
          className="inline-flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors"
        >
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              By {article.author.name}
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{article.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image - Full Bleed */}
      <div className="mb-12 -mx-4 md:-mx-8 lg:-mx-16">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-[500px] object-cover"
        />
      </div>

      {/* Magazine Content with Drop Cap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="prose prose-xl dark:prose-invert max-w-none prose-headings:font-serif prose-p:text-justify prose-p:leading-relaxed">
            {/* Drop Cap for first paragraph */}
            <style>{\`
              .magazine-content p:first-of-type:first-letter {
                font-size: 4rem;
                font-weight: bold;
                float: left;
                line-height: 1;
                margin-right: 0.5rem;
                margin-top: -0.25rem;
                color: #2563eb;
              }
            \`}</style>
            <div className="magazine-content">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Pull Quote Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl border-l-4 border-blue-600">
              <Quote className="h-12 w-12 text-blue-600 mb-4" />
              <p className="text-2xl font-serif italic text-gray-900 dark:text-white leading-relaxed">
                {article.pullQuote}
              </p>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="font-bold text-gray-900 dark:text-white mb-2">About the Author</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {article.author.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MagazineBlogContent;
    `,

    minimal: `
${commonImports}

interface Article {
  title: string;
  author: {
    name: string;
  };
  date: string;
  readTime: string;
  content: string;
}

interface MinimalBlogContentProps {
  data?: any;
  className?: string;
  onAuthorClick?: (authorName: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
  [key: string]: any;
}

const MinimalBlogContent: React.FC<MinimalBlogContentProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = postsData || {};

  // Map actual API fields directly from postsData
  const authorObj = postsData?.author || {};
  const article = {
    title: postsData?.title || '',
    author: {
      name: authorObj?.name || authorObj?.email || postsData?.author_name || 'Anonymous'
    },
    date: postsData?.published_at ? new Date(postsData.published_at).toLocaleDateString() : new Date().toLocaleDateString(),
    readTime: postsData?.read_time || \`\${Math.ceil((postsData?.content?.length || 1000) / 1000)} min read\`,
    content: postsData?.content || ''
  };

  return (
    <article className={cn("max-w-2xl mx-auto", className)}>
      {/* Minimal Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">{article.author.name}</span>
          <span>•</span>
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </header>

      {/* Minimal Content - Pure Typography */}
      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
        <div
          dangerouslySetInnerHTML={{
            __html: article.content
              .split('\\n')
              .map(line => {
                if (line.startsWith('## ')) {
                  return \`<h2 className="text-3xl font-bold mt-12 mb-6">\${line.replace('## ', '')}</h2>\`;
                }
                if (line.startsWith('### ')) {
                  return \`<h3 className="text-2xl font-bold mt-8 mb-4">\${line.replace('### ', '')}</h3>\`;
                }
                if (line.startsWith('> ')) {
                  return \`<blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-6 italic my-6">\${line.replace('> ', '')}</blockquote>\`;
                }
                if (line.trim() === '') {
                  return '';
                }
                if (line.startsWith('- ') || line.match(/^\\d+\\. /)) {
                  return line;
                }
                return \`<p className="mb-6">\${line}</p>\`;
              })
              .join('\\n')
          }}
        />
      </div>

      {/* Minimal Footer */}
      <footer className="mt-16 pt-8 border-t dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Written by <span className="font-medium text-gray-900 dark:text-white">{article.author.name}</span>
        </p>
      </footer>
    </article>
  );
};

export default MinimalBlogContent;
    `
  };

  return variants[variant] || variants.standard;
};
