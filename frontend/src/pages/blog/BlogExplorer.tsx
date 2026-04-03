import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, TrendingUp, Clock, Award, ArrowLeft, Filter, PenTool, User, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../../components/ui/pagination';
import BlogCard from '../../components/blog/BlogCard';
import { useBlogPosts } from '../../hooks/useBlog';
import { SEO } from '../../components/SEO';
import { PAGE_SEO } from '../../config/seo';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';

type BlogCategory = 'popular' | 'featured' | 'latest' | 'all';

const BlogExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as BlogCategory) || 'popular';
  const initialCategory = searchParams.get('category') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [activeType, setActiveType] = useState<BlogCategory>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const { isAuthenticated } = useAuth();

  // Build API parameters dynamically with useMemo to ensure proper re-renders
  const apiParams = useMemo(() => {
    const params = {
      status: 'published',
      type: activeType, // Popular, featured, latest, all
      category: selectedCategory !== 'all' ? selectedCategory : undefined, // Only pass category if not 'all'
      sortBy: (activeType === 'latest' ? 'createdAt' : 'updatedAt') as 'createdAt' | 'updatedAt',
      sortOrder: 'desc' as const
    };
    
    return params;
  }, [activeType, selectedCategory]);

  // Get paginated blogs with 9 per page using dynamic API parameters
  const paginatedBlogs = useBlogPosts(apiParams, {
    initialPage: currentPage,
    initialLimit: 9
  });

  // Update URL when internal pagination changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (paginatedBlogs.page > 1) {
      params.set('page', paginatedBlogs.page.toString());
    }
    if (activeType !== 'popular') {
      params.set('type', activeType);
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    setSearchParams(params, { replace: true });
  }, [paginatedBlogs.page, activeType, selectedCategory, setSearchParams]);

  const allBlogs = paginatedBlogs.data?.data || [];
  const loading = paginatedBlogs.loading;
  const error = paginatedBlogs.error;
  const pagination = {
    total: paginatedBlogs.data?.total || 0,
    totalPages: paginatedBlogs.totalPages,
    currentPage: paginatedBlogs.page,
    limit: paginatedBlogs.limit
  };

  const categories = [
    {
      key: 'popular' as BlogCategory,
      label: 'Popular',
      icon: TrendingUp,
      description: 'Most rated blogs',
    },
    {
      key: 'featured' as BlogCategory,
      label: 'Featured',
      icon: Award,
      description: "Editor's choice",
    },
    {
      key: 'latest' as BlogCategory,
      label: 'Latest',
      icon: Clock,
      description: 'Recently published',
    },
    {
      key: 'all' as BlogCategory,
      label: 'All Blogs',
      icon: Filter,
      description: 'Browse everything',
    },
  ];

  const blogCategories = useMemo(() => {
    // Categories as specified in the API documentation
    const staticCategories = ['technology', 'wellness', 'travel', 'food', 'lifestyle'];
    return ['all', ...staticCategories];
  }, []);

  // Use blogs directly from API without client-side filtering
  const displayBlogs = allBlogs;

  const handleTypeChange = (type: BlogCategory) => {
    setActiveType(type);
    paginatedBlogs.goToPage(1); // Reset to first page when changing type
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    paginatedBlogs.goToPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (newPage: number) => {
    paginatedBlogs.goToPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;
    
    // Show first page
    if (totalPages > 0) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            onClick={() => handlePageChange(1)}
            isActive={current === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (current > 3) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }
    
    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => handlePageChange(i)}
              isActive={current === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Show ellipsis if needed
    if (current < totalPages - 2) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }
    
    // Show last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={current === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  const getCategoryIcon = (categoryKey: BlogCategory) => {
    const category = categories.find((c) => c.key === categoryKey);
    return category ? category.icon : Filter;
  };

  const getCategoryInfo = (categoryKey: BlogCategory) => {
    return categories.find((c) => c.key === categoryKey);
  };

  const currentTypeInfo = getCategoryInfo(activeType);

  return (
    <>
      <SEO
        title={PAGE_SEO.blog.title}
        description={PAGE_SEO.blog.description}
        url={PAGE_SEO.blog.url}
        keywords={PAGE_SEO.blog.keywords}
      />
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        {/* Header */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Explore Blogs</h1>
              <p className="text-white/60 mt-1">
                Discover amazing content from our community
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/blog/home">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10"
                  size="sm"
                >
                  <Home className="w-4 h-4" />
                  Blog Home
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/blog/my-blogs">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10"
                      size="sm"
                    >
                      <User className="w-4 h-4" />
                      My Blogs
                    </Button>
                  </Link>
                  <Link to="/blog/createBlog">
                    <Button
                      className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      size="sm"
                    >
                      <PenTool className="w-4 h-4" />
                      Create Blog
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Type Tabs (Popular, Featured, Latest, All) */}
        <GlassCard className="p-2 mb-8">
          <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => handleTypeChange(category.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeType === category.key
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl'
                    : 'text-white/60 hover:text-white hover:bg-white/10 hover:shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
          </div>
        </GlassCard>

        {/* Filter by Blog Category */}
        <GlassCard className="p-4 mb-8">
          <label className="block text-sm font-medium text-white mb-3">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:shadow-lg'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white hover:shadow-sm border border-white/20'
                }`}
              >
                {category === 'all'
                  ? 'All Categories'
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load blogs</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => paginatedBlogs.refetch()}
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Blog Grid */}
        {!error && loading ? (
          // Skeleton loading for blog explorer
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="relative">
                <div className="bg-card border rounded-xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center mb-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !error && displayBlogs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayBlogs.map((blog, index) => (
                <div key={blog.id} className="relative">
                  {/* Special badges for different types */}
                  {activeType === 'popular' && index < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all">
                      #{index + 1}
                    </div>
                  )}
                  {activeType === 'featured' && (
                    <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  {activeType === 'latest' && index < 5 && (
                    <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all">
                      New
                    </div>
                  )}

                  <Link to={`/blog/details/${blog.id}`} className="block h-full">
                    <BlogCard post={blog} />
                  </Link>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => paginatedBlogs.prevPage()}
                        className={!paginatedBlogs.canGoPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => paginatedBlogs.nextPage()}
                        className={!paginatedBlogs.canGoNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            {/* Results Summary */}
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} blogs
            </div>
          </>
        ) : !error && (
          <div className="text-center py-16 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-border">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No blogs found</h3>
            <p className="text-muted-foreground mb-6">
              {activeType === 'featured'
                ? 'No featured blogs available yet'
                : `No blogs found in this ${activeType} type`}
            </p>
            <Button
              onClick={() => handleTypeChange('all')}
              variant="outline"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground hover:text-primary-foreground border-primary hover:border-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
            >
              View All Blogs
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default BlogExplorer;