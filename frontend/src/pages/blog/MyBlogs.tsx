// @ts-nocheck
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, PenTool, FileText, Clock, CheckCircle, Loader2, Trash2, Edit3 } from 'lucide-react';
import { toast } from '../../components/ui/sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../../components/ui/pagination';
import { Skeleton } from '../../components/ui/skeleton';
import BlogCard from '../../components/blog/BlogCard';
import { useBlogPosts } from '../../hooks/useBlog';
import { useAllBlogs } from '../../hooks/blog/useAllBlogs';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import { SEO } from '../../components/SEO';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { api } from '../../lib/api';
import { BlogPost } from '../../types/blog';

type TabType = 'published' | 'drafts' | 'scheduled';

const MyBlogs: React.FC = () => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('published');
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<BlogPost[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [scheduledLoading, setScheduledLoading] = useState(false);

  // Fetch user's own blogs using author_id parameter with pagination
  const paginatedBlogs = useBlogPosts(
    user?.id
      ? {
          user_id: user.id, // Use user_id parameter to filter by author
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        }
      : undefined,
    {
      enabled: !!user?.id, // Only fetch if user is logged in
      initialPage: currentPage,
      initialLimit: 10, // Show 10 blogs per page
    },
  );

  // Fetch all blogs for trending/popular recommendations (like Home page)
  const { blogs: allBlogs, loading: allBlogsLoading } = useAllBlogs();

  const myBlogsData = paginatedBlogs.data?.data || [];

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    if (!user?.id) return;
    setDraftsLoading(true);
    try {
      const response = await api.get('/blog/user/drafts');
      const data = response.data?.data || response.data || [];
      setDrafts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
      setDrafts([]);
    } finally {
      setDraftsLoading(false);
    }
  }, [user?.id]);

  // Fetch scheduled posts
  const fetchScheduledPosts = useCallback(async () => {
    if (!user?.id) return;
    setScheduledLoading(true);
    try {
      const response = await api.get(`/blog/posts?author_id=${user.id}&status=scheduled`);
      const data = response.data?.data || response.data || [];
      setScheduledPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error);
      setScheduledPosts([]);
    } finally {
      setScheduledLoading(false);
    }
  }, [user?.id]);

  // Fetch drafts and scheduled posts on mount for counts
  useEffect(() => {
    if (user?.id) {
      fetchDrafts();
      fetchScheduledPosts();
    }
  }, [user?.id, fetchDrafts, fetchScheduledPosts]);

  // Delete post handler
  const handleDeletePost = useCallback(async (postId: string, postTitle: string, type: 'draft' | 'scheduled') => {
    const confirmed = await confirm({
      title: 'Delete Post',
      message: `Are you sure you want to delete "${postTitle || 'this post'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/blog/posts/${postId}`);
      toast.success('Post deleted successfully');

      // Refresh the appropriate list
      if (type === 'draft') {
        fetchDrafts();
      } else {
        fetchScheduledPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  }, [confirm, fetchDrafts, fetchScheduledPosts]);

  // Create popular/trending posts (include both own and others' posts)
  const trendingPosts = useMemo(
    () => [...allBlogs]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating (popular)
      .slice(0, 5), // Show top 5 trending posts
    [allBlogs],
  );
  const loading = paginatedBlogs.loading;
  
  // Pagination info
  const pagination = {
    total: paginatedBlogs.data?.total || 0,
    totalPages: paginatedBlogs.totalPages,
    currentPage: paginatedBlogs.page,
    limit: paginatedBlogs.limit
  };

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (paginatedBlogs.page > 1) {
      params.set('page', paginatedBlogs.page.toString());
    }
    setSearchParams(params, { replace: true });
  }, [paginatedBlogs.page, setSearchParams]);

  // Debug logging
  console.log('🔍 MyBlogs Debug:', {
    userId: user?.id,
    userName: user?.name,
    myBlogsDisplayed: myBlogsData.length,
    myBlogsTotalFromAPI: pagination.total,
    myBlogsCurrentPage: pagination.currentPage,
    myBlogsLimit: pagination.limit,
    myBlogsTotalPages: pagination.totalPages,
    myBlogsLoading: loading,
    allBlogsLoading,
    allBlogsCount: allBlogs.length,
    trendingCount: trendingPosts.length,
    trendingPostTitles: trendingPosts.map(p => p.title).slice(0, 3), // Show first 3 titles
  });

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
          <GlassCard className="text-center py-16">
            <h2 className="text-2xl font-bold text-white mb-4">
              Please log in to view your blogs
            </h2>
            <p className="text-white/60 mb-6">
              You need to be logged in to see your personal blog posts.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Log In
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }
  // Pagination handlers
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

  // Use actual view/like counts from API data
  const totalViews = myBlogsData.reduce(
    (acc, post) => acc + (post.views || 0),
    0,
  );
  const totalLikes = myBlogsData.reduce(
    (acc, post) => acc + (post.likes || 0),
    0,
  );

  return (
    <>
      <SEO
        title="My Blogs | Wants AI"
        description="Manage your blog posts on Wants AI."
        url="/blog/my-blogs"
        noindex={true}
      />
      <div className="min-h-screen relative">
      <BackgroundEffects />
      <main className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        {/* Header Section */}
        <GlassCard className="p-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Blog Dashboard</h1>
              <p className="text-lg text-white/60">
                Manage your published articles and track your writing journey
              </p>
            </div>
            <Link
              to="/blog/createBlog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600"
            >
              <Plus className="w-5 h-5" />
              Create New Blog
            </Link>
          </div>

          {/* Stats Section */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/80 rounded-xl p-6 shadow-lg border border-border/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 dark:from-blue-400/30 dark:to-blue-500/30 rounded-lg shadow-sm">
                  <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{myBlogsData.length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/80 rounded-xl p-6 shadow-lg border border-border/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 dark:from-emerald-400/30 dark:to-emerald-500/30 rounded-lg shadow-sm">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {totalViews.toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/80 rounded-xl p-6 shadow-lg border border-border/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500/20 to-red-600/20 dark:from-red-400/30 dark:to-red-500/30 rounded-lg shadow-sm">
                  <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-8 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">3</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total Popular</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/80 rounded-xl p-6 shadow-lg border border-border/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 dark:from-purple-400/30 dark:to-purple-500/30 rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-8 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {myBlogsData.filter((post) => post.featured).length}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Featured</p>
                </div>
              </div>
            </div>
          </div> */}
        </GlassCard>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('published')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'published'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Published
                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">{pagination.total}</span>
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'drafts'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                Drafts
                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">{drafts.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'scheduled'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                Scheduled
                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">{scheduledPosts.length}</span>
              </button>
            </div>

            {/* My Blogs - Published Tab */}
            {activeTab === 'published' && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">My Published Articles</h2>
                <span className="text-sm text-white/60 bg-white/10 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">
                  {pagination.total} posts
                </span>
              </div>

              {loading ? (
                // Skeleton loading for my blogs
                <div className="grid md:grid-cols-2 gap-8">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-card border rounded-xl overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-6 space-y-3">
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
                  ))}
                </div>
              ) : myBlogsData.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-8">
                    {myBlogsData.map((post) => (
                      <Link
                        to={`/blog/details/${post.id}`}
                        key={post.id}
                        className="group h-full block"
                      >
                        <BlogCard post={post} />
                      </Link>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <>
                      <div className="flex justify-center items-center mt-8">
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
                      
                      {/* Results Summary */}
                      <div className="text-center mt-6 text-sm text-white/60">
                        Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} articles
                      </div>
                    </>
                  )}
                </>
              ) : (
                <GlassCard className="text-center py-16">
                  <PenTool className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No blog posts yet</h3>
                  <p className="text-white/60 mb-6">
                    Start sharing your thoughts and ideas with the world
                  </p>
                  <Link
                    to="/blog/createBlog"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Write Your First Post
                  </Link>
                </GlassCard>
              )}
            </section>
            )}

            {/* Drafts Tab */}
            {activeTab === 'drafts' && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">My Drafts</h2>
                  <span className="text-sm text-amber-300/70 bg-amber-500/10 backdrop-blur-xl px-3 py-1 rounded-full border border-amber-500/30">
                    {drafts.length} drafts
                  </span>
                </div>

                {draftsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  </div>
                ) : drafts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {drafts.map((post) => (
                      <div key={post.id} className="relative group">
                        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-amber-500/20 overflow-hidden hover:border-amber-500/40 transition-all duration-300">
                          {post.featured_image || post.imageUrl || (post.imageUrls && post.imageUrls.length > 0) || (post.image_urls && post.image_urls.length > 0) ? (
                            <img
                              src={(post.imageUrls?.[0] || post.image_urls?.[0] || post.featured_image || post.imageUrl) as string}
                              alt={post.title}
                              className="w-full h-48 object-cover opacity-70"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                              <FileText className="w-16 h-16 text-amber-400/40" />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-500/30">
                                Draft
                              </span>
                              {post.category && (
                                <span className="text-xs text-white/50">{post.category}</span>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                              {post.title || 'Untitled Draft'}
                            </h3>
                            <p className="text-white/60 text-sm line-clamp-2 mb-4">
                              {post.excerpt || 'No content yet...'}
                            </p>
                            <div className="flex items-center justify-between text-sm text-white/40">
                              <span>Last edited: {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</span>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                              <Link
                                to={`/blog/edit/${post.id}`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit Draft
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id, post.title, 'draft')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="text-center py-16">
                    <FileText className="w-16 h-16 text-amber-400/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No drafts yet</h3>
                    <p className="text-white/60 mb-6">
                      Start writing a new post and save it as a draft
                    </p>
                    <Link
                      to="/blog/createBlog"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      Start Writing
                    </Link>
                  </GlassCard>
                )}
              </section>
            )}

            {/* Scheduled Tab */}
            {activeTab === 'scheduled' && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Scheduled Posts</h2>
                  <span className="text-sm text-purple-300/70 bg-purple-500/10 backdrop-blur-xl px-3 py-1 rounded-full border border-purple-500/30">
                    {scheduledPosts.length} scheduled
                  </span>
                </div>

                {scheduledLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : scheduledPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {scheduledPosts.map((post) => (
                      <div key={post.id} className="relative group">
                        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-300">
                          {post.featured_image || post.imageUrl || (post.imageUrls && post.imageUrls.length > 0) || (post.image_urls && post.image_urls.length > 0) ? (
                            <img
                              src={(post.imageUrls?.[0] || post.image_urls?.[0] || post.featured_image || post.imageUrl) as string}
                              alt={post.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Clock className="w-16 h-16 text-purple-400/40" />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Scheduled
                              </span>
                              {post.category && (
                                <span className="text-xs text-white/50">{post.category}</span>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-white/60 text-sm line-clamp-2 mb-4">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-purple-300 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.scheduledAt || post.scheduled_at ? new Date(post.scheduledAt || post.scheduled_at!).toLocaleString() : 'Schedule pending'}
                              </span>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                              <Link
                                to={`/blog/edit/${post.id}`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit Post
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id, post.title, 'scheduled')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="text-center py-16">
                    <Clock className="w-16 h-16 text-purple-400/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No scheduled posts</h3>
                    <p className="text-white/60 mb-6">
                      Schedule your posts to be published at a specific time
                    </p>
                    <Link
                      to="/blog/createBlog"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      Create & Schedule
                    </Link>
                  </GlassCard>
                )}
              </section>
            )}
          </div>

          {/* You May Like Posts */}
          <aside>
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-white">Trending in Community</h2>
              <GlassCard className="p-6">
                <ul className="space-y-6">
                  {allBlogsLoading
                    ? // Skeleton loading for trending posts
                      Array.from({ length: 5 }).map((_, index) => (
                        <li key={index}>
                          <div className="flex items-start space-x-4 p-3 rounded-lg">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                          </div>
                        </li>
                      ))
                    : trendingPosts.map((post) => (
                        <li key={post.id}>
                          <Link
                            to={`/blog/details/${post.id}`}
                            className="flex cursor-pointer items-start space-x-4 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/20 hover:shadow-sm"
                          >
                            <img
                              src={
                                ((post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null) ||
                                  post.featured_image ||
                                  post.imageUrl ||
                                  '/placeholder-blog.svg') as string
                              }
                              alt={post.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-white hover:text-teal-400 transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-sm text-white/60 mt-1">By {post.author}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 px-2 py-1 rounded-full border border-teal-500/30 shadow-sm">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <Link
                    to="/blog/explorer"
                    className="text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors"
                  >
                    View all trending posts →
                  </Link>
                </div>
              </GlassCard>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </>
  );
};

export default MyBlogs;