/**
 * Article/Content Component Generators
 *
 * Generators for article, blog, and content-related components.
 */

export interface ArticleOptions {
  title?: string;
  showAuthor?: boolean;
  showComments?: boolean;
}

// Article Content
export function generateArticleContent(options: ArticleOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  author: { name: string; avatar: string };
  publishedAt: string;
  readTime: number;
  tags: string[];
}

interface ArticleContentProps {
  articleId?: string;
}

export default function ArticleContent({ articleId }: ArticleContentProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated article data
    setTimeout(() => {
      setArticle({
        id: articleId || '1',
        title: 'Getting Started with Modern Web Development',
        content: \`
          <p>Web development has evolved significantly over the past decade. Modern frameworks and tools have made it easier than ever to build powerful, scalable applications.</p>

          <h2>Key Technologies</h2>
          <p>Today's web developers have access to a wide array of technologies including React, Vue, Angular, and many others. Each has its own strengths and use cases.</p>

          <h2>Best Practices</h2>
          <p>Following best practices is essential for maintaining clean, efficient code. This includes proper component structure, state management, and testing.</p>

          <h2>Getting Started</h2>
          <p>The best way to learn is by doing. Start with a simple project and gradually add complexity as you become more comfortable with the tools.</p>
        \`,
        author: { name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
        publishedAt: new Date().toISOString(),
        readTime: 5,
        tags: ['Web Development', 'React', 'Tutorial']
      });
      setLoading(false);
    }, 500);
  }, [articleId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!article) return <div>Article not found</div>;

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <img src={article.author.avatar} alt={article.author.name} className="w-8 h-8 rounded-full" />
            <span>{article.author.name}</span>
          </div>
          <span>•</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{article.readTime} min read</span>
        </div>
        <div className="flex gap-2 mt-4">
          {article.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}`;
}

// Article Feedback
export function generateArticleFeedback(options: ArticleOptions = {}): string {
  return `import React, { useState } from 'react';

interface ArticleFeedbackProps {
  articleId?: string;
}

export default function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log('Feedback submitted:', { articleId, helpful, feedback });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <span className="text-2xl">✓</span>
        <p className="text-green-800 font-medium mt-2">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-lg">Was this article helpful?</h3>
      <div className="flex gap-4">
        <button
          onClick={() => setHelpful(true)}
          className={\`flex items-center gap-2 px-4 py-2 rounded-lg border \${
            helpful === true ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
          }\`}
        >
          <span>👍</span> Yes
        </button>
        <button
          onClick={() => setHelpful(false)}
          className={\`flex items-center gap-2 px-4 py-2 rounded-lg border \${
            helpful === false ? 'bg-red-100 border-red-500' : 'bg-white border-gray-300'
          }\`}
        >
          <span>👎</span> No
        </button>
      </div>
      {helpful !== null && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {helpful ? 'What did you find most useful?' : 'How can we improve this article?'}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Your feedback..."
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}`;
}

// Article Sidebar
export function generateArticleSidebar(options: ArticleOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface RelatedArticle {
  id: string;
  title: string;
  thumbnail: string;
  readTime: number;
}

interface ArticleSidebarProps {
  currentArticleId?: string;
}

export default function ArticleSidebar({ currentArticleId }: ArticleSidebarProps) {
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [tableOfContents, setTableOfContents] = useState<string[]>([]);

  useEffect(() => {
    setRelatedArticles([
      { id: '2', title: 'Advanced React Patterns', thumbnail: 'https://via.placeholder.com/80', readTime: 8 },
      { id: '3', title: 'State Management Best Practices', thumbnail: 'https://via.placeholder.com/80', readTime: 6 },
      { id: '4', title: 'Testing React Applications', thumbnail: 'https://via.placeholder.com/80', readTime: 10 }
    ]);
    setTableOfContents(['Introduction', 'Key Technologies', 'Best Practices', 'Getting Started', 'Conclusion']);
  }, [currentArticleId]);

  return (
    <aside className="space-y-6">
      {/* Table of Contents */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Table of Contents</h3>
        <nav className="space-y-2">
          {tableOfContents.map((section, i) => (
            <a
              key={i}
              href={\`#\${section.toLowerCase().replace(/\\s+/g, '-')}\`}
              className="block text-gray-600 hover:text-blue-600 text-sm"
            >
              {section}
            </a>
          ))}
        </nav>
      </div>

      {/* Related Articles */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Related Articles</h3>
        <div className="space-y-3">
          {relatedArticles.map((article) => (
            <a key={article.id} href={\`/articles/\${article.id}\`} className="flex gap-3 group">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-16 h-16 rounded object-cover"
              />
              <div>
                <h4 className="text-sm font-medium group-hover:text-blue-600">{article.title}</h4>
                <span className="text-xs text-gray-500">{article.readTime} min read</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Subscribe to Newsletter</h3>
        <p className="text-sm text-gray-600 mb-3">Get the latest articles delivered to your inbox.</p>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
          Subscribe
        </button>
      </div>
    </aside>
  );
}`;
}

// Author Card
export function generateAuthorCard(options: ArticleOptions = {}): string {
  return `import React from 'react';

interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  articles: number;
  followers: number;
  socialLinks?: { platform: string; url: string }[];
}

interface AuthorCardProps {
  author?: Author;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  const defaultAuthor: Author = author || {
    id: '1',
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/80',
    bio: 'Senior developer with 10+ years of experience in web technologies. Passionate about sharing knowledge and helping others learn.',
    articles: 45,
    followers: 1234,
    socialLinks: [
      { platform: 'Twitter', url: '#' },
      { platform: 'LinkedIn', url: '#' },
      { platform: 'GitHub', url: '#' }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        <img
          src={defaultAuthor.avatar}
          alt={defaultAuthor.name}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{defaultAuthor.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{defaultAuthor.bio}</p>
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>{defaultAuthor.articles} articles</span>
            <span>{defaultAuthor.followers.toLocaleString()} followers</span>
          </div>
          {defaultAuthor.socialLinks && (
            <div className="flex gap-2 mt-3">
              {defaultAuthor.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="text-gray-400 hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Follow
        </button>
      </div>
    </div>
  );
}`;
}

// Author Profile
export function generateAuthorProfile(options: ArticleOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
}

interface AuthorProfileProps {
  authorId?: string;
}

export default function AuthorProfile({ authorId }: AuthorProfileProps) {
  const [author, setAuthor] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    setAuthor({
      id: authorId || '1',
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/120',
      bio: 'Senior developer with 10+ years of experience. I write about web development, software architecture, and best practices.',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      joinedAt: '2020-01-15',
      stats: { articles: 45, followers: 1234, following: 89 }
    });
    setArticles([
      { id: '1', title: 'Getting Started with React', excerpt: 'A comprehensive guide...', publishedAt: '2024-01-15', readTime: 8 },
      { id: '2', title: 'Advanced TypeScript Patterns', excerpt: 'Explore advanced patterns...', publishedAt: '2024-01-10', readTime: 12 },
      { id: '3', title: 'Building Scalable APIs', excerpt: 'Best practices for building...', publishedAt: '2024-01-05', readTime: 10 }
    ]);
  }, [authorId]);

  if (!author) return <div className="animate-pulse h-48 bg-gray-200 rounded-lg" />;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <img src={author.avatar} alt={author.name} className="w-24 h-24 rounded-full" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{author.name}</h1>
            <p className="text-gray-600 mt-1">{author.bio}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>📍 {author.location}</span>
              <span>🔗 <a href={author.website} className="text-blue-600">{author.website}</a></span>
              <span>📅 Joined {new Date(author.joinedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-6 mt-4">
              <div><span className="font-bold">{author.stats.articles}</span> articles</div>
              <div><span className="font-bold">{author.stats.followers}</span> followers</div>
              <div><span className="font-bold">{author.stats.following}</span> following</div>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Follow
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {['articles', 'about', 'followers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`pb-3 px-1 capitalize \${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-500'
              }\`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {articles.map((article) => (
            <a key={article.id} href={\`/articles/\${article.id}\`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md">
              <h3 className="font-semibold text-lg">{article.title}</h3>
              <p className="text-gray-600 mt-1">{article.excerpt}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                <span>{article.readTime} min read</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}`;
}

// Blog Author
export function generateBlogAuthor(options: ArticleOptions = {}): string {
  return `import React from 'react';

interface BlogAuthorProps {
  author?: {
    name: string;
    avatar: string;
    bio: string;
  };
}

export default function BlogAuthor({ author }: BlogAuthorProps) {
  const defaultAuthor = author || {
    name: 'Jane Smith',
    avatar: 'https://via.placeholder.com/60',
    bio: 'Content writer and editor with expertise in technology and business topics.'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <img
        src={defaultAuthor.avatar}
        alt={defaultAuthor.name}
        className="w-14 h-14 rounded-full"
      />
      <div>
        <h4 className="font-semibold">Written by {defaultAuthor.name}</h4>
        <p className="text-sm text-gray-600">{defaultAuthor.bio}</p>
      </div>
    </div>
  );
}`;
}

// Blog Sidebar
export function generateBlogSidebar(options: ArticleOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface RecentPost {
  id: string;
  title: string;
  date: string;
}

export default function BlogSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setCategories([
      { id: '1', name: 'Technology', count: 24 },
      { id: '2', name: 'Business', count: 18 },
      { id: '3', name: 'Design', count: 12 },
      { id: '4', name: 'Development', count: 32 },
      { id: '5', name: 'Marketing', count: 15 }
    ]);
    setRecentPosts([
      { id: '1', title: 'How to Build a Successful Startup', date: '2024-01-15' },
      { id: '2', title: 'The Future of AI in Web Development', date: '2024-01-12' },
      { id: '3', title: 'Design Trends for 2024', date: '2024-01-10' }
    ]);
    setTags(['React', 'JavaScript', 'TypeScript', 'CSS', 'Node.js', 'Design', 'UX', 'AI', 'Cloud']);
  }, []);

  return (
    <aside className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="search"
          placeholder="Search articles..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <a href={\`/blog/category/\${category.id}\`} className="flex justify-between text-gray-600 hover:text-blue-600">
                <span>{category.name}</span>
                <span className="text-gray-400">({category.count})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Recent Posts</h3>
        <ul className="space-y-3">
          {recentPosts.map((post) => (
            <li key={post.id}>
              <a href={\`/blog/\${post.id}\`} className="block group">
                <h4 className="text-sm font-medium group-hover:text-blue-600">{post.title}</h4>
                <span className="text-xs text-gray-500">{new Date(post.date).toLocaleDateString()}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <a
              key={tag}
              href={\`/blog/tag/\${tag.toLowerCase()}\`}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}`;
}

// Featured Article
export function generateFeaturedArticle(options: ArticleOptions = {}): string {
  return `import React from 'react';

interface FeaturedArticleProps {
  article?: {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    author: { name: string; avatar: string };
    publishedAt: string;
    category: string;
  };
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const defaultArticle = article || {
    id: '1',
    title: 'The Complete Guide to Modern Web Development',
    excerpt: 'Discover the latest tools, frameworks, and best practices that are shaping the future of web development in 2024 and beyond.',
    image: 'https://via.placeholder.com/800x400',
    author: { name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
    publishedAt: new Date().toISOString(),
    category: 'Development'
  };

  return (
    <article className="relative rounded-xl overflow-hidden shadow-lg group">
      <img
        src={defaultArticle.image}
        alt={defaultArticle.title}
        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm mb-3">
          {defaultArticle.category}
        </span>
        <h2 className="text-2xl font-bold mb-2">
          <a href={\`/articles/\${defaultArticle.id}\`} className="hover:underline">
            {defaultArticle.title}
          </a>
        </h2>
        <p className="text-gray-200 mb-4">{defaultArticle.excerpt}</p>
        <div className="flex items-center gap-3">
          <img
            src={defaultArticle.author.avatar}
            alt={defaultArticle.author.name}
            className="w-8 h-8 rounded-full"
          />
          <span>{defaultArticle.author.name}</span>
          <span>•</span>
          <span>{new Date(defaultArticle.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
}`;
}

// Related Articles
export function generateRelatedArticles(options: ArticleOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Article {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  readTime: number;
}

interface RelatedArticlesProps {
  currentArticleId?: string;
  limit?: number;
}

export default function RelatedArticles({ currentArticleId, limit = 3 }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles([
      { id: '2', title: 'Advanced React Patterns You Should Know', thumbnail: 'https://via.placeholder.com/300x200', category: 'React', readTime: 8 },
      { id: '3', title: 'Building Type-Safe APIs with TypeScript', thumbnail: 'https://via.placeholder.com/300x200', category: 'TypeScript', readTime: 10 },
      { id: '4', title: 'State Management Best Practices', thumbnail: 'https://via.placeholder.com/300x200', category: 'Architecture', readTime: 7 }
    ].slice(0, limit));
  }, [currentArticleId, limit]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((article) => (
          <a key={article.id} href={\`/articles/\${article.id}\`} className="group">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-4">
                <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                <h4 className="font-medium mt-1 group-hover:text-blue-600">{article.title}</h4>
                <span className="text-sm text-gray-500">{article.readTime} min read</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}`;
}

// About Story (Company/Business)
export function generateAboutStory(options: ArticleOptions = {}): string {
  return `import React from 'react';

interface AboutStoryProps {
  companyName?: string;
  story?: string;
  milestones?: { year: string; event: string }[];
}

export default function AboutStory({ companyName, story, milestones }: AboutStoryProps) {
  const defaultMilestones = milestones || [
    { year: '2015', event: 'Company founded' },
    { year: '2017', event: 'Launched first product' },
    { year: '2019', event: 'Expanded to international markets' },
    { year: '2021', event: 'Reached 1 million customers' },
    { year: '2023', event: 'Opened new headquarters' }
  ];

  return (
    <section className="space-y-8">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold mb-4">Our Story</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          {story || \`Founded in 2015, \${companyName || 'our company'} started with a simple mission: to make a difference in people's lives through innovative solutions. What began as a small team with big dreams has grown into a global organization serving customers worldwide.

          Our journey has been defined by a relentless pursuit of excellence and a commitment to our core values of integrity, innovation, and customer focus.\`}
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6">Our Journey</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />
          <div className="space-y-6">
            {defaultMilestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-4">
                  <span className="text-blue-600 font-semibold">{milestone.year}</span>
                  <p className="text-gray-700">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}`;
}

// CTA Section
export function generateCTASection(options: ArticleOptions = {}): string {
  return `import React from 'react';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
}

export default function CTASection({
  title,
  description,
  primaryButtonText,
  primaryButtonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  backgroundImage
}: CTASectionProps) {
  return (
    <section
      className="relative py-16 px-6 rounded-2xl overflow-hidden"
      style={backgroundImage ? { backgroundImage: \`url(\${backgroundImage})\`, backgroundSize: 'cover' } : {}}
    >
      {!backgroundImage && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title || 'Ready to Get Started?'}
        </h2>
        <p className="text-lg text-gray-200 mb-8">
          {description || 'Join thousands of satisfied customers who have transformed their business with our solutions.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={primaryButtonUrl || '#'}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {primaryButtonText || 'Get Started Free'}
          </a>
          {secondaryButtonText && (
            <a
              href={secondaryButtonUrl || '#'}
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}`;
}
