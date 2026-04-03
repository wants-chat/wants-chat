import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BlogPost } from '../../types/blog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import JoditEditor from 'jodit-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ArrowLeft, TrendingUp, Clock, Save, Calendar } from 'lucide-react';
import { useAllBlogs } from '../../hooks/blog/useAllBlogs';
import { useCreateBlog, CreateBlogData } from '../../hooks/useBlog';
import { api } from '../../lib/api';
import { toast } from '../../components/ui/sonner';
import { SEO } from '../../components/SEO';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

const CreateBlog: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { blogs: samplePosts } = useAllBlogs();
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<string>('draft');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useRef(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing post for editing
  useEffect(() => {
    const loadPost = async () => {
      if (!editId) return;

      setLoadingPost(true);
      setIsEditMode(true);
      try {
        const response = await api.get(`/blog/posts/${editId}`);
        const post: BlogPost = response.data?.data || response.data;

        setTitle(post.title || '');
        setContent(post.content || '');
        setCategory(post.category || '');
        setDraftId(post.id);
        setOriginalStatus(post.status || 'draft');

        // Load existing images
        const existingImages = post.imageUrls || post.image_urls || [];
        if (existingImages.length > 0) {
          setImagePreviews(existingImages);
        }

        // If scheduled, load schedule info
        const scheduledAt = post.scheduledAt || post.scheduled_at;
        if (scheduledAt) {
          const scheduleDate = new Date(scheduledAt);
          setScheduledDate(scheduleDate.toISOString().split('T')[0]);
          setScheduledTime(scheduleDate.toTimeString().slice(0, 5));
          setShowScheduler(true);
        }
      } catch (error) {
        console.error('Failed to load post:', error);
        toast.error('Failed to load post for editing');
        navigate('/blog/my-blogs');
      } finally {
        setLoadingPost(false);
      }
    };

    loadPost();
  }, [editId, navigate]);

  const config = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      readonly: false,
      placeholder: 'Start typing your amazing blog content...',
      height: 400,
      minHeight: 400,
      maxHeight: 800,
      width: '100%',
      toolbarSticky: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      toolbarAdaptive: true,
      sizeLG: 900,
      sizeMD: 700,
      sizeSM: 400,
      buttons: [
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'fontsize', 'brush', '|',
        'ul', 'ol', '|',
        'outdent', 'indent', '|',
        'align', '|',
        'link', 'image', '|',
        'table', 'hr', '|',
        'undo', 'redo', '|',
        'source', 'preview', 'fullsize'
      ],
      uploader: {
        insertImageAsBase64URI: true
      },
      removeButtons: ['about'],
      theme: isDark ? 'dark' : 'default',
      editorClassName: isDark ? 'jodit-dark-mode' : '',
      editorCssClass: isDark ? 'jodit-dark-editor' : '',
      style: {
        font: '14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
        background: isDark ? 'transparent' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#000000',
      },
      iframeStyle: isDark ? `
        body {
          background: transparent !important;
          background-color: transparent !important;
          color: #e2e8f0 !important;
        }
      ` : '',
      events: {
        afterInit: (editor: any) => {
          if (isDark) {
            // Set editor area background
            const editorArea = editor.editor;
            if (editorArea) {
              editorArea.style.backgroundColor = 'transparent';
              editorArea.style.color = '#e2e8f0';
            }
            // Set container background
            const container = editor.container;
            if (container) {
              container.style.backgroundColor = 'transparent';
            }
            // Set workplace background
            const workplace = container?.querySelector('.jodit-workplace');
            if (workplace) {
              workplace.style.backgroundColor = 'transparent';
            }
            // If using iframe, set iframe body background
            const iframe = container?.querySelector('iframe');
            if (iframe && iframe.contentDocument) {
              iframe.contentDocument.body.style.backgroundColor = 'transparent';
              iframe.contentDocument.body.style.color = '#e2e8f0';
            }
          }
        }
      }
    };
  }, [theme]);

  const createBlogMutation = useCreateBlog();

  // Auto-save functionality
  const autoSaveDraft = useCallback(async () => {
    if (!title && !content) return;
    if (autoSaving) return;

    setAutoSaving(true);
    try {
      if (draftId) {
        // Update existing draft via API
        await api.put(`/blog/posts/${draftId}/auto-save`, {
          title: title || 'Untitled Draft',
          content,
          category: category || undefined,
        });
      } else {
        // Create new draft
        const blogData: CreateBlogData = {
          title: title || 'Untitled Draft',
          content: content || '<p></p>',
          category: category || 'uncategorized',
          author: user?.name || 'Anonymous',
          status: 'draft',
          image_urls: [],
          featured: false,
        };
        const response = await api.post('/blog/posts', blogData);
        if (response?.data?.id) {
          setDraftId(response.data.id);
        }
      }
      setLastAutoSave(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [title, content, category, draftId, user?.name, autoSaving]);

  // Set up auto-save timer
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save if there's content
    if (title || content) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveDraft();
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, category, autoSaveDraft]);

  const handleSaveAsDraft = async () => {
    let imageUrls: string[] = [];
    if (images.length > 0) {
      setUploadingImages(true);
      try {
        const response = await api.uploadBlogImages(images);
        if (response?.urls) {
          imageUrls = response.urls;
        }
      } catch (error) {
        toast.error('Failed to upload images');
        return;
      } finally {
        setUploadingImages(false);
      }
    }

    const blogData: CreateBlogData = {
      title: title || 'Untitled Draft',
      content: content || '<p></p>',
      category: category || 'uncategorized',
      author: user?.name || 'Anonymous',
      status: 'draft',
      image_urls: imageUrls,
      featured: false,
    };

    try {
      await createBlogMutation.mutate(blogData);
      toast.success('Draft saved successfully!');
      navigate('/blog');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time for scheduling');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    let imageUrls: string[] = [];
    if (images.length > 0) {
      setUploadingImages(true);
      try {
        const response = await api.uploadBlogImages(images);
        if (response?.urls) {
          imageUrls = response.urls;
        }
      } catch (error) {
        toast.error('Failed to upload images');
        return;
      } finally {
        setUploadingImages(false);
      }
    }

    const blogData: CreateBlogData = {
      title,
      content,
      category,
      author: user?.name || 'Anonymous',
      status: 'scheduled',
      image_urls: imageUrls,
      featured: false,
      scheduled_at: scheduledDateTime.toISOString(),
    };

    try {
      await createBlogMutation.mutate(blogData);
      toast.success(`Post scheduled for ${scheduledDateTime.toLocaleString()}`);
      navigate('/blog');
    } catch (error) {
      toast.error('Failed to schedule post');
    }
  };

  const popularPosts = useMemo(
    () => {
      if (!samplePosts || samplePosts.length === 0) {
        return [];
      }
      return [...samplePosts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 7);
    },
    [samplePosts],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      setImages(prevImages => [...prevImages, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrls: string[] = [];
    if (images.length > 0) {
      setUploadingImages(true);
      try {
        setUploadProgress(`Uploading ${images.length} images...`);

        const response = await api.uploadBlogImages(images);

        if (response && response.urls && Array.isArray(response.urls)) {
          imageUrls = response.urls;
          setUploadProgress('All images uploaded successfully!');
        } else if (response && response.url) {
          imageUrls = [response.url];
          setUploadProgress('Image uploaded successfully!');
        } else {
          throw new Error('Invalid response from image upload service');
        }
      } catch (error) {
        toast.error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      } finally {
        setUploadingImages(false);
        setUploadProgress('');
      }
    }

    const blogData: CreateBlogData = {
      title,
      content,
      category,
      author: user?.name || 'Anonymous',
      status: 'published',
      image_urls: imageUrls.length > 0 ? imageUrls : [],
      featured: false,
    };

    try {
      await createBlogMutation.mutate(blogData);
      toast.success('Blog post created successfully!');
      navigate('/blog');
    } catch (error) {
      toast.error('Failed to create blog post. Please try again.');
    }
  };

  // Show loading state when loading post for editing
  if (loadingPost) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={isEditMode ? "Edit Blog Post | Wants AI" : "Create Blog Post | Wants AI"}
        description={isEditMode ? "Edit your blog post on Wants AI." : "Create and publish your blog post on Wants AI."}
        url={isEditMode ? `/blog/edit/${editId}` : "/blog/create"}
        noindex={true}
      />
      <div className="min-h-screen relative">
      <BackgroundEffects />
      <main className="container mx-auto max-w-7xl px-4 py-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlassCard className="overflow-hidden p-0">
              <div className="p-8">
                <div className="flex items-center justify-center relative mb-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 p-2 text-white/60 hover:text-teal-400 transition-colors rounded-lg hover:bg-white/10"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h1 className="text-4xl font-extrabold text-white">
                    {isEditMode ? 'Edit Blog Post' : 'Create a New Blog Post'}
                  </h1>
                </div>
                <p className="text-center text-white/60 mb-8">
                  {isEditMode
                    ? `Editing ${originalStatus === 'scheduled' ? 'scheduled' : 'draft'} post`
                    : 'Share your thoughts and ideas with the world.'
                  }
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Blog Title
                      </label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a catchy title"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Category
                      </label>
                      <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Blog Content
                    </label>
                    <div className="w-full min-h-[450px] rounded-lg overflow-hidden border border-white/20 bg-white/5">
                      <JoditEditor
                        ref={editor}
                        value={content}
                        config={config}
                        onBlur={newContent => setContent(newContent)}
                        onChange={newContent => {}}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Images ({imagePreviews.length} selected)
                        </label>
                      
                      {/* Upload Area */}
                      <div
                        className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/60 cursor-pointer hover:bg-white/5 transition-colors mb-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <span className="block">Click to upload images</span>
                          <span className="text-xs">Multiple files allowed</span>
                        </div>
                      </div>
                      
                      {/* Image Previews Grid */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                ×
                              </button>
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                  Featured
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                          accept="image/*"
                          multiple
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6 flex flex-col justify-end">
                      <div className="text-sm text-white/70 text-right space-y-1">
                        <p>
                          <span className="text-white font-medium">Date:</span>{' '}
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p>
                          <span className="text-white font-medium">Author:</span> {user?.name ?? '...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Auto-save indicator */}
                  {lastAutoSave && (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      {autoSaving ? 'Saving...' : `Last saved ${lastAutoSave.toLocaleTimeString()}`}
                    </div>
                  )}

                  {/* Schedule section */}
                  {showScheduler && (
                    <div className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        Schedule Post
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-1">Date</label>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-white/5 border-white/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-1">Time</label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="bg-white/5 border-white/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSchedule}
                          disabled={createBlogMutation.loading || uploadingImages || !title || !content}
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowScheduler(false)}
                          className="border border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-3 mt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/blog')}
                      className="border border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSaveAsDraft}
                      disabled={createBlogMutation.loading || uploadingImages}
                      className="border border-white/20 text-white hover:bg-white/10"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowScheduler(!showScheduler)}
                      className="border border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBlogMutation.loading || uploadingImages}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    >
                      {uploadingImages ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {uploadProgress || 'Uploading images...'}
                        </div>
                      ) : createBlogMutation.loading ? (
                        'Publishing...'
                      ) : (
                        'Publish Now'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </GlassCard>
          </div>
          <aside>
            <div className="sticky top-24 space-y-8">
              <GlassCard className="overflow-hidden p-0">
                <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Popular Posts
                    </h2>
                  </div>
                </div>
                <div className="p-6">
              {popularPosts.length > 0 ? (
                <ul className="space-y-6">
                  {popularPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={`/blog/details/${post.id}`}
                        className="flex cursor-pointer items-start space-x-4"
                      >
                        <img
                          src={
                            ((post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null) ||
                              post.featured_image ||
                              post.imageUrl ||
                              '/placeholder-blog.svg') as string
                          }
                          alt={post.title}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-white hover:text-teal-400 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-white/60 mt-1">
                            By {post.author}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-white/60 text-sm">
                  <p>No popular posts available yet.</p>
                  <p className="mt-2">Posts will appear here once they have ratings.</p>
                </div>
              )}
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

export default CreateBlog;
