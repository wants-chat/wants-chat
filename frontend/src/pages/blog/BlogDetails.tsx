import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useBlogPost, useDeleteBlog, useRateBlog } from '../../hooks/useBlog';
import { useAllBlogs } from '../../hooks/blog/useAllBlogs';
import { useAuth } from '../../contexts/AuthContext';
import CommentSection from '../../components/blog/CommentSection';
import { toast } from '../../components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { SEO } from '../../components/SEO';
import { PAGE_SEO } from '../../config/seo';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  
  // Debug user context
  useEffect(() => {
    console.log('👤 User context:', {
      user,
      isAuthenticated: !!user,
      userId: user?.id,
      userName: user?.name,
    });
  }, [user]);

  // Check if we're coming from an update (URL has a refresh parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const shouldRefresh = urlParams.get('refresh') === 'true';
  
  // Fetch single blog post
  const { data: blog, loading, error, refetch } = useBlogPost(id || null);
  
  // Handle navigation to different blog posts (via related posts)
  useEffect(() => {
    if (id) {
      console.log('📍 Navigated to blog:', id);
      // Reset rating state for new blog
      setUserRating(0);
      setHoveredRating(0);
      setCurrentImageIndex(0); // Reset image carousel
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);
  
  // Force refresh if coming from update
  useEffect(() => {
    // Check for stored update logs
    const updateLog = sessionStorage.getItem('blogUpdateLog');
    const updateResult = sessionStorage.getItem('blogUpdateResult');
    const updateError = sessionStorage.getItem('blogUpdateError');
    
    if (updateLog) {
      console.log('📋 Blog Update Log:', JSON.parse(updateLog));
      sessionStorage.removeItem('blogUpdateLog');
    }
    
    if (updateResult) {
      console.log('✅ Blog Update Result:', JSON.parse(updateResult));
      sessionStorage.removeItem('blogUpdateResult');
    }
    
    if (updateError) {
      console.error('❌ Blog Update Error:', JSON.parse(updateError));
      sessionStorage.removeItem('blogUpdateError');
    }
    
    if (shouldRefresh && refetch) {
      console.log('Forcing blog refresh after update');
      refetch();
      // Remove the refresh parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [shouldRefresh, refetch]);

  // For related blogs (can be refactored later)
  const { blogs: allBlogs } = useAllBlogs();
  const relatedBlogs = allBlogs.filter((b) => b.category === blog?.category && b.id !== blog?.id);

  // Mutations
  const deleteBlogMutation = useDeleteBlog();
  const rateBlogMutation = useRateBlog();

  // Check if current user is the owner of the blog
  // Compare by user_id (if available) or by author name
  const isOwner = user && blog && (
    // Check by user_id if both are available
    (blog.user_id && user.id && blog.user_id === user.id) ||
    // Check by author name (case-insensitive)
    (blog.author && user.name && blog.author.toLowerCase() === user.name.toLowerCase())
  );
  
  // Debug logging to troubleshoot ownership and image
  useEffect(() => {
    if (blog) {
      console.log('Blog details loaded:', {
        id: blog.id,
        title: blog.title,
        image_urls: blog.image_urls,
        featured_image: blog.featured_image,
        imageUrl: blog.imageUrl,
        actualImageSource: (blog.image_urls && blog.image_urls.length > 0 ? blog.image_urls[0] : blog.featured_image || blog.imageUrl) || '/placeholder-blog.svg',
        user_id: blog.user_id,
        author: blog.author,
        isOwner
      });
      
      // Log ownership details for debugging
      console.log('🔍 Ownership check:', {
        user_id_match: blog.user_id && user?.id && blog.user_id === user.id,
        author_name_match: blog.author && user?.name && blog.author.toLowerCase() === user.name.toLowerCase(),
        blog_user_id: blog.user_id,
        current_user_id: user?.id,
        blog_author: blog.author,
        current_user_name: user?.name,
        final_isOwner: isOwner
      });
      
      // Log the raw backend data structure
      console.log('Full blog object:', blog);
    }
  }, [blog, isOwner]);

  // Set initial user rating if exists
  useEffect(() => {
    if (blog?.isLiked && blog?.rating) {
      // If user has already rated, you might want to get their specific rating
      // For now, we'll just indicate they've rated
      setUserRating(0);
    }
  }, [blog]);

  const handleDelete = async () => {
    console.log('🗑️ Delete attempt:', {
      id,
      isOwner,
      userId: user?.id,
      userName: user?.name,
      blogUserId: blog?.user_id,
      blogAuthor: blog?.author,
    });

    if (id && isOwner) {
      setShowDeleteModal(true);
    } else {
      console.warn('⚠️ Delete blocked:', {
        hasId: !!id,
        isOwner,
        reason: !id ? 'No blog ID' : !isOwner ? 'Not owner' : 'Unknown'
      });

      if (!isOwner && user) {
        toast.error('You can only delete your own blog posts.');
      } else if (!user) {
        toast.error('Please log in to delete blog posts.');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      console.log('🚀 Starting deletion for blog ID:', id);
      await deleteBlogMutation.mutate(id);
      console.log('✅ Blog deleted successfully');

      // Show success message and navigate
      toast.success('Blog post deleted successfully!');
      setShowDeleteModal(false);
      navigate('/blog');
    } catch (err: any) {
      console.error('❌ Failed to delete blog', err);

      // Provide specific error messages based on error type
      let errorMessage = 'Failed to delete blog. Please try again.';

      if (err.name === 'BlogDeletionError') {
        errorMessage = err.message;
      } else if (err.message?.includes('Forbidden') || err.message?.includes('403')) {
        errorMessage = 'You do not have permission to delete this blog post.';
      } else if (err.message?.includes('Not found') || err.message?.includes('404')) {
        errorMessage = 'Blog post not found. It may have already been deleted.';
      } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      toast.error(errorMessage);
      setShowDeleteModal(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error('Please login to rate this blog post');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      setUserRating(rating);
      await rateBlogMutation.mutate({ id, rating });
      toast.success('Rating submitted successfully!');
      console.log(`Successfully rated blog ${id} with ${rating} stars`);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setUserRating(0);
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  // Image carousel navigation
  const images = blog?.image_urls && blog.image_urls.length > 0 ? blog.image_urls :
    [(blog?.featured_image || blog?.imageUrl || '/placeholder-blog.svg')];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Helper function to strip HTML and create description
  const getCleanDescription = (htmlContent: string, maxLength: number = 160): string => {
    const stripped = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
  };

  // Generate dynamic SEO data
  const blogImage = blog?.image_urls?.[0] || blog?.featured_image || blog?.imageUrl || '/og-image.png';
  const blogDescription = blog ? getCleanDescription(blog.content) : PAGE_SEO.blog.description;
  const blogTitle = blog ? `${blog.title} | Wants AI` : PAGE_SEO.blog.title;
  const blogUrl = `${window.location.origin}/blog/details/${id}`;
  const blogKeywords = blog?.category ? [blog.category, 'blog', 'article', 'wants ai'] : PAGE_SEO.blog.keywords;

  if (loading) {
    return (
      <>
        <SEO
          title={PAGE_SEO.blog.title}
          description={PAGE_SEO.blog.description}
          url={PAGE_SEO.blog.url}
          keywords={PAGE_SEO.blog.keywords}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left (Main Content) - Loading Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blog Image Skeleton */}
          <div className="rounded-2xl overflow-hidden shadow-md border">
            <Skeleton className="w-full h-[400px]" />
          </div>

          {/* Title + Meta Skeleton */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Blog Content Skeleton */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Reviews + Actions Skeleton */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-5 h-5 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Comments Section Skeleton */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {/* Right (Aside: Related Blogs) - Loading Skeleton */}
        <aside className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4 items-center bg-card p-3 rounded-xl border">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <SEO
          title="Blog Not Found | Wants AI"
          description="The blog post you are looking for could not be found."
          url={blogUrl}
        />
        <div className="max-w-3xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-foreground">Blog not found ❌</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={blogTitle}
        description={blogDescription}
        url={blogUrl}
        image={blogImage}
        keywords={blogKeywords}
        type="article"
      />
      <div className="min-h-screen relative">
      <BackgroundEffects />
      <div className="relative z-10">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Button
            onClick={() => navigate('/blog')}
            variant="outline"
            className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
        </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left (Main Content) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Blog Image Carousel */}
        <div className="rounded-2xl overflow-hidden shadow-md border relative group">
          <img
            src={images[currentImageIndex]}
            alt={`${blog.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-[400px] object-cover transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
            }}
          />
          
          {/* Navigation Arrows - Only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Dot Indicators - Only show if more than 1 image */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title + Meta */}
        <GlassCard className="p-6">
          <h1 className="text-3xl font-extrabold text-white">{blog.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span>
              {blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs font-medium">
              {blog.category}
            </span>
            <span>By {blog.author}</span>
          </div>
        </GlassCard>

        {/* Blog Content */}
        <GlassCard className="p-6">
          <article className="leading-relaxed text-white prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none prose-headings:text-white prose-p:text-white/90 prose-li:text-white/90 prose-strong:text-white">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </article>
        </GlassCard>

        {/* Reviews + Actions */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            {/* Ratings Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-3">
                Rate this Blog
              </h3>
              
              {/* Display Current Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < (blog.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  {blog.rating ? `${blog.rating.toFixed(1)}/5` : 'No ratings yet'}
                  {blog.likesCount ? ` (${blog.likesCount} ratings)` : ''}
                </span>
              </div>

              {/* User Rating Section - Show for all authenticated users */}
              {user && (
                <div className="mt-4">
                  <p className="text-sm text-white/60 mb-2">
                    {isOwner ? 'Rate your own blog:' : 'Your Rating:'}
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRating(i + 1)}
                        onMouseEnter={() => setHoveredRating(i + 1)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                        aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
                      >
                        <Star
                          size={24}
                          className={
                            i < (hoveredRating || userRating)
                              ? 'text-yellow-500 fill-yellow-500 cursor-pointer'
                              : 'text-gray-300 cursor-pointer hover:text-yellow-400'
                          }
                        />
                      </button>
                    ))}
                    {userRating > 0 && (
                      <span className="ml-2 text-sm text-white/60">
                        You rated: {userRating}/5
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Login prompt for non-authenticated users */}
              {!user && (
                <p className="text-sm text-white/60 mt-3">
                  <Link to="/login" className="text-teal-400 hover:underline">
                    Login
                  </Link>{' '}
                  to rate this blog
                </p>
              )}
            </div>

            {/* Actions - Only show for owner */}
            {isOwner && (
              <div className="flex gap-3">
                <Link to={`/blog/updateBlog/${id}`}>
                  <Button className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20">
                    <Edit size={18} />
                    Edit Blog
                  </Button>
                </Link>
                <Button
                  className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 text-white"
                  onClick={handleDelete}
                  disabled={deleteBlogMutation.loading}
                >
                  <Trash2 size={18} />
                  {deleteBlogMutation.loading ? 'Deleting...' : 'Delete Blog'}
                </Button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Comments Section */}
        <CommentSection postId={id!} />
      </div>

      {/* Right (Aside: Related Blogs) */}
      <aside className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Related Posts 📌</h2>
        <div className="space-y-4">
          {relatedBlogs.length > 0 ? (
            relatedBlogs.map((post) => (
              <GlassCard
                key={post.id}
                onClick={() => {
                  console.log('Clicking related post:', post.id);
                  // Force a hard navigation to ensure page refresh
                  window.location.href = `/blog/details/${post.id}`;
                }}
                className="flex gap-4 items-center group p-3 hover:shadow-md transition cursor-pointer"
              >
                <img
                  src={((post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null) || post.featured_image || post.imageUrl || '/placeholder-blog.svg') as string}
                  alt={post.title}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
                  }}
                />
                <div>
                  <h3 className="font-semibold text-white group-hover:text-teal-400 transition">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/60">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''}
                  </p>
                </div>
              </GlassCard>
            ))
          ) : (
            <p className="text-white/60 text-sm">No related posts found.</p>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Blog Post
            </DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to delete this blog post?
              <br />
              <br />
              <strong>This action cannot be undone</strong> and will remove all associated data including comments and ratings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Blog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
    </div>
    </div>
    </>
  );
};

export default BlogDetails;
