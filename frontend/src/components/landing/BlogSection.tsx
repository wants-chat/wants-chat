import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from '../ui/sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useBlogPosts, useDeleteBlog } from '../../hooks/useBlog';
import { BlogPost } from '../../types/blog';
import { cleanS3Url } from '../../utils/imageUtils';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Using BlogPost type from types/blog.ts instead of local interface

const BlogSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const deleteBlog = useDeleteBlog();
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch blog posts from API
  const { data: allBlogsData, loading: allBlogsLoading, error: allBlogsError, refetch: refetchAllBlogs } = useBlogPosts({
    status: 'published'
  }, {
    initialLimit: 12
  });

  const { data: myBlogsData, loading: myBlogsLoading, error: myBlogsError, refetch: refetchMyBlogs } = useBlogPosts({
    user_id: user?.id
  }, {
    initialLimit: 12
  });

  // Get filtered posts based on current filter
  const getBlogPosts = (): BlogPost[] => {
    if (filter === 'my') {
      return myBlogsData?.data || [];
    }
    return allBlogsData?.data || [];
  };

  const filteredPosts = getBlogPosts();
  const isLoading = filter === 'my' ? myBlogsLoading : allBlogsLoading;

  const [postsPerView, setPostsPerView] = useState(3);
  
  // Update posts per view based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPostsPerView(1);
      } else if (window.innerWidth < 1024) {
        setPostsPerView(2);
      } else {
        setPostsPerView(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const maxIndex = Math.max(0, Math.ceil(filteredPosts.length / postsPerView) - 1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleEdit = (postId: string) => {
    navigate(`/blog/updateBlog/${postId}`);
  };

  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deleteBlog.mutate(postToDelete);

      // If we get here, deletion was successful
      toast.success('Blog post deleted successfully!', {
        description: 'The blog post has been permanently removed.',
        duration: 4000,
      });

      // Refetch the blog posts to update the list
      setTimeout(() => {
        refetchAllBlogs();
        refetchMyBlogs();
      }, 500);

    } catch (error: any) {
      // Check if this is actually a successful deletion (some APIs return 404 or other codes on successful delete)
      if (error?.response?.status === 404 || error?.message?.includes('404') || error?.response?.status === 204) {
        toast.success('Blog post deleted successfully!', {
          description: 'The blog post has been permanently removed.',
          duration: 4000,
        });
        // Refetch the blog posts to update the list
        setTimeout(() => {
          refetchAllBlogs();
          refetchMyBlogs();
        }, 500);
      } else {
        // Only show error for genuine failures
        toast.error('Failed to delete blog post', {
          description: 'Please try again. If the problem persists, contact support.',
          duration: 5000,
        });
      }
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  // Helper function to get image from blog post
  const getBlogImage = (post: BlogPost): string => {
    // Priority: Backend images should ALWAYS be used if available

    // First check for imageUrls (camelCase - primary)
    if (post.imageUrls && post.imageUrls.length > 0) {
      const processedUrl = cleanS3Url(post.imageUrls[0]);
      return processedUrl || post.imageUrls[0];
    }

    // Check legacy snake_case field
    if (post.image_urls && post.image_urls.length > 0) {
      const processedUrl = cleanS3Url(post.image_urls[0]);
      return processedUrl || post.image_urls[0];
    }

    // Check legacy fields
    if (post.featured_image) {
      const processedUrl = cleanS3Url(post.featured_image);
      return processedUrl || post.featured_image;
    }
    if (post.imageUrl) {
      const processedUrl = cleanS3Url(post.imageUrl);
      return processedUrl || post.imageUrl;
    }

    // Return category-based default images
    const defaultImages = {
      'Health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop&q=80',
      'Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&q=80',
      'Nutrition': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=300&fit=crop&q=80',
      'Wellness': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop&q=80',
      'Mental Health': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=300&fit=crop&q=80',
      'Lifestyle': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&q=80',
      'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop&q=80',
      'Productivity': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop&q=80',
      'Finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop&q=80',
      'Travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&q=80'
    };

    // Get category-based image or use post ID to create variation
    const categoryImage = defaultImages[post.category as keyof typeof defaultImages];
    if (categoryImage) {
      return categoryImage;
    }

    // Create unique default images based on post ID
    const defaultImagePool = [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop&q=80', // Office/work
      'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=500&h=300&fit=crop&q=80', // Notebook
      'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500&h=300&fit=crop&q=80', // Coffee/study
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&q=80', // Mountain/nature
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop&q=80', // Meditation
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop&q=80', // Books
      'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&h=300&fit=crop&q=80', // Plant/growth
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop&q=80'  // Workspace
    ];

    // Use post ID and title to consistently select same image for same post
    // Create a simple hash from the post ID and title to ensure different images
    const hashInput = post.id.toString() + (post.title || '');
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      hash = ((hash << 5) - hash + hashInput.charCodeAt(i)) & 0xffffffff;
    }
    const imageIndex = Math.abs(hash) % defaultImagePool.length;

    return defaultImagePool[imageIndex];
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to calculate read time
  const calculateReadTime = (content: string): string => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const plainText = stripHtml(content);
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return `${readTime} min read`;
  };

  // Helper function to strip HTML tags and decode entities
  const stripHtml = (html: string): string => {
    if (!html) return '';

    try {
      // Create a temporary div to parse HTML safely
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Get plain text content
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Clean up whitespace and return
      return plainText.replace(/\s+/g, ' ').trim();
    } catch (error) {
      // Fallback: simple regex-based HTML stripping
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  };

  // Helper function to get clean excerpt
  const getExcerpt = (post: BlogPost): string => {
    // First try the excerpt field
    if (post.excerpt && post.excerpt.trim()) {
      const cleanExcerpt = stripHtml(post.excerpt);
      return cleanExcerpt || 'No excerpt available';
    }

    // Fall back to content
    if (post.content) {
      const plainText = stripHtml(post.content);

      if (plainText.length === 0) {
        return 'No content available';
      }

      // Truncate at word boundary for better readability
      if (plainText.length > 150) {
        const truncated = plainText.substring(0, 150);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 100) {
          return truncated.substring(0, lastSpace) + '...';
        }
        return truncated + '...';
      }

      return plainText;
    }

    return 'No content available';
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.section 
      className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={sectionVariants}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={cardVariants}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <ArticleIcon className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-semibold text-white">Stories & Insights</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">
            Discover Amazing <span className="text-teal-400">Stories</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Explore insights, tips, and experiences shared by our vibrant community
          </p>

          {/* Filter Dropdown - Redesigned */}
          <div className="flex justify-center">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="font-medium">
                  {filter === 'all' ? 'All Blogs' : 'My Blogs'}
                </span>
                <ExpandMoreIcon
                  className={`h-5 w-5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden z-10">
                  <button
                    onClick={() => {
                      navigate('/blog');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
                  >
                    <ArticleIcon className="h-4 w-4 text-teal-400" />
                    <span className="font-medium">All Blogs</span>
                  </button>
                  <div className="h-px bg-white/20"></div>
                  <button
                    onClick={() => {
                      navigate('/blog/my-blogs');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
                  >
                    <PersonIcon className="h-4 w-4 text-teal-400" />
                    <span className="font-medium">My Blogs</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Blog Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all ${
              currentIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 hover:shadow-xl hover:bg-white/20'
            }`}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all ${
              currentIndex === maxIndex
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 hover:shadow-xl hover:bg-white/20'
            }`}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-white/60">Loading blogs...</div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredPosts.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-lg text-white/60 mb-2">No blog posts found</div>
                <div className="text-sm text-white/50">
                  {filter === 'my' ? 'Start writing your first blog post!' : 'Check back later for new content.'}
                </div>
              </div>
            </div>
          )}

          {/* Carousel Container */}
          {!isLoading && filteredPosts.length > 0 && (
            <div className="overflow-hidden px-4" ref={carouselRef}>
              <motion.div
                className="flex gap-6"
                animate={{ x: -currentIndex * 100 + '%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)]"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className="overflow-hidden h-full flex flex-col bg-white/10 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300">
                      {/* Blog Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getBlogImage(post)}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                            {post.category || 'General'}
                          </span>
                        </div>

                        {/* Edit/Delete buttons for user's posts */}
                        {(post.userId === user?.id || post.user_id === user?.id) && (
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                              onClick={() => handleEdit(post.id)}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-teal-500 text-white transition-colors"
                              title="Edit post"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deleteBlog.loading}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={deleteBlog.loading ? "Deleting..." : "Delete post"}
                            >
                              {deleteBlog.loading ? (
                                <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
                              ) : (
                                <DeleteIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Blog Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3
                          className="text-xl font-bold mb-3 text-white hover:text-teal-400 transition-colors cursor-pointer"
                          onClick={() => navigate(`/blog/details/${post.id}`)}
                        >
                          {post.title}
                        </h3>

                        <p className="text-white/60 mb-4 flex-1">
                          {getExcerpt(post)}
                        </p>

                        {/* Blog Meta */}
                        <div className="flex items-center justify-between text-sm text-white/50 pt-4 border-t border-white/20">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <PersonIcon className="h-4 w-4" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarTodayIcon className="h-4 w-4" />
                              {formatDate(post.publishedAt || post.published_at || post.createdAt || post.created_at)}
                            </span>
                          </div>
                          <span>{calculateReadTime(post.content)}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Carousel Indicators */}
        {!isLoading && filteredPosts.length > 0 && maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-teal-500'
                    : 'w-2 bg-white/30 hover:bg-teal-500/50'
                } rounded-full`}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          variants={cardVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="group px-6 py-3 text-base font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-200"
              onClick={() => navigate('/blog/explorer')}
            >
              <ArticleIcon className="mr-2 h-5 w-5" />
              View All Articles
              <ArrowForwardIcon className="ml-2 h-5 w-5" />
            </Button>

            {isAuthenticated && (
              <Button
                size="lg"
                className="px-6 py-3 text-base font-medium rounded-xl bg-white/10 border-2 border-white/30 text-white hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/blog/createBlog')}
              >
                <EditIcon className="mr-2 h-5 w-5" />
                Write a Blog Post
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <DeleteIcon className="h-5 w-5 text-red-500" />
              Delete Blog Post
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone and will permanently remove the post from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteBlog.loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteBlog.loading}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {deleteBlog.loading ? (
                <>
                  <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <DeleteIcon className="h-4 w-4 mr-2" />
                  Delete Post
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
};

export default BlogSection;