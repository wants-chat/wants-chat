// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useUpdateBlog, UpdateBlogData, useBlogPost } from '../../hooks/useBlog';
import { useAllBlogs } from '../../hooks/blog/useAllBlogs';
import { ArrowLeft, X, Upload, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
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
import { toast } from '../../components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

const UpdateBlog: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { blogs: samplePosts } = useAllBlogs();
  const popularPosts = useMemo(
    () => [...samplePosts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 7),
    [samplePosts],
  );

  const updateBlog = useUpdateBlog();
  const { data: blog, loading: blogLoading, error: blogError } = useBlogPost(id || null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    published: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [showUploadFailureModal, setShowUploadFailureModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useRef(null);

  const config = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      readonly: false,
      placeholder: 'Start editing your blog content...',
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
        'left', 'center', 'right', 'justify', '|',
        'link', 'image', 'table', '|',
        'undo', 'redo', '|',
        'hr', 'fullsize', 'source'
      ],
      style: {
        font: '16px Arial, sans-serif',
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#000000',
      },
      editorClassName: isDark ? 'jodit-dark-mode' : '',
      theme: isDark ? 'dark' : 'default',
      // Add custom CSS for dark mode
      extraButtons: [],
      events: {
        afterInit: (editor: any) => {
          // Apply dark mode styles to the editor content area
          const editorArea = editor.editor;
          if (editorArea && isDark) {
            editorArea.style.backgroundColor = '#1e293b';
            editorArea.style.color = '#e2e8f0';
          }
        }
      }
    };
  }, [theme]);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        category: blog.category || '',
        content: blog.content || '',
        published: blog.published || false,
      });
      
      // Set existing images from blog
      if (blog.image_urls && Array.isArray(blog.image_urls)) {
        setExistingImages(blog.image_urls);
      } else if (blog.featured_image || blog.imageUrl) {
        const imageUrl = blog.featured_image || blog.imageUrl;
        if (imageUrl) {
          setExistingImages([imageUrl]);
        }
      }
    }
  }, [blog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log('📁 Selected files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        console.warn('Invalid file type:', file.name, file.type);
        toast.error(`File ${file.name} is not a valid image type`);
        return false;
      }
      
      if (!isValidSize) {
        console.warn('File too large:', file.name, file.size);
        toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files to existing ones
    setImages(prev => [...prev, ...validFiles]);

    // Create preview URLs for new files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    console.log('✅ Added files to upload queue:', {
      newFilesCount: validFiles.length,
      totalFilesCount: images.length + validFiles.length,
      totalPreviewsCount: imagePreviews.length + newPreviews.length
    });

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    console.log('🗑️ Removing image at index:', index);
    
    // Revoke object URL to prevent memory leaks
    if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    console.log('🗑️ Removing existing image at index:', index);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      console.error('Blog ID is required for update');
      return;
    }

    console.log('🚀 Starting blog update process...');

    // Handle image uploads if there are new images
    let imageUrls: string[] = [...existingImages]; // Start with existing images

    if (images.length > 0) {
      console.log('📸 Uploading new images:', images.length);
      setUploadingImages(true);
      setUploadProgress(`Uploading ${images.length} images...`);

      try {
        const response = await api.uploadBlogImages(images);
        if (response && response.urls && Array.isArray(response.urls)) {
          imageUrls = [...imageUrls, ...response.urls]; // Add new images to existing ones
          console.log('✅ All images uploaded successfully:', response.urls);
          setUploadProgress('Images uploaded successfully!');
        } else {
          throw new Error('Invalid response from image upload');
        }
      } catch (error) {
        console.error('❌ Image upload failed:', error);
        setUploadingImages(false);
        setUploadProgress('');
        
        setShowUploadFailureModal(true);
        return;
        // Continue with existing images only
        console.log('Continuing with existing images only');
      }
    }

    const blogData: UpdateBlogData = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      published: formData.published,
      image_urls: imageUrls, // Use new multi-image field
      author: blog?.author,
    };

    console.log('📝 Final blog update data being sent:', {
      ...blogData,
      image_urls_count: blogData.image_urls?.length || 0,
    });

    setUploadingImages(false);
    setUploadProgress('');

    try {
      const result = await updateBlog.mutate({ id, data: blogData });
      console.log('✅ Blog updated successfully:', result);

      if (result) {
        toast.success('Blog updated successfully!');
        navigate(`/blog/details/${id}?refresh=true`);
      } else {
        console.error('No result returned from update');
        toast.error('Blog update may have failed. Please check and try again.');
      }
    } catch (error) {
      console.error('❌ Failed to update blog:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update blog: ${errorMessage}`);
    }
  };

  const handleContinueWithoutImages = async () => {
    setShowUploadFailureModal(false);

    // Continue with existing images only
    console.log('Continuing with existing images only');

    // Proceed with the update using existing images
    const blogData: UpdateBlogData = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      published: formData.published,
      imageUrls: existingImages, // Use existing images
    };

    try {
      const result = await updateBlog.mutate({ id, data: blogData });
      console.log('✅ Blog updated successfully with existing images:', result);

      if (result) {
        toast.success('Blog updated successfully with existing images!');
        navigate(`/blog/details/${id}?refresh=true`);
      } else {
        toast.error('Blog update may have failed. Please check and try again.');
      }
    } catch (error) {
      console.error('❌ Failed to update blog with existing images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update blog: ${errorMessage}`);
    }
  };

  if (blogLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading blog post...</div>
      </div>
    );
  }

  if (blogError || !blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">
            {blogError ? 'Error loading blog post' : 'Blog post not found'}
          </div>
          <Button onClick={() => navigate('/blog')} variant="outline">
            Back to Blog List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <main className="max-w-7xl mx-auto py-8 relative z-10">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
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
                  <h1 className="text-4xl font-bold text-white">
                    Update Blog Post
                  </h1>
                </div>
                <p className="text-center text-white/60 mb-8">
                  Edit and update your blog post.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Title</label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category
                    </label>
                    <Select onValueChange={handleCategoryChange} value={formData.category}>
                      <SelectTrigger className="w-full">
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

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Images
                    </label>
                    
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Current images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {existingImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Existing image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Images Preview */}
                    {imagePreviews.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">New images to upload:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`New image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-green-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                              >
                                <X size={12} />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                                New
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Input */}
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to add more images or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {uploadProgress && (
                      <div className="mt-2 text-sm text-primary">
                        {uploadProgress}
                      </div>
                    )}
                  </div>

                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-white mb-2">
                      Content
                    </label>
                    <div className="w-full">
                      <style>
                        {`
                          /* Dark mode styles for Jodit editor */
                          .jodit-dark-mode .jodit-workplace,
                          .jodit-dark-mode .jodit-wysiwyg {
                            background-color: #1e293b !important;
                            color: #e2e8f0 !important;
                          }
                          .jodit-dark-mode .jodit-wysiwyg p,
                          .jodit-dark-mode .jodit-wysiwyg div,
                          .jodit-dark-mode .jodit-wysiwyg span,
                          .jodit-dark-mode .jodit-wysiwyg li,
                          .jodit-dark-mode .jodit-wysiwyg h1,
                          .jodit-dark-mode .jodit-wysiwyg h2,
                          .jodit-dark-mode .jodit-wysiwyg h3,
                          .jodit-dark-mode .jodit-wysiwyg h4,
                          .jodit-dark-mode .jodit-wysiwyg h5,
                          .jodit-dark-mode .jodit-wysiwyg h6 {
                            color: #e2e8f0 !important;
                          }
                          .jodit-dark-mode .jodit-placeholder {
                            color: #64748b !important;
                          }
                          .jodit-dark-mode .jodit-toolbar-button {
                            color: #e2e8f0 !important;
                          }
                          .jodit-dark-mode .jodit-status-bar {
                            background-color: #0f172a !important;
                            color: #94a3b8 !important;
                          }
                        `}
                      </style>
                      <div className={theme === 'dark' ? 'jodit-dark-mode' : ''}>
                        <JoditEditor
                          ref={editor}
                          value={formData.content}
                          config={config}
                          onBlur={(newContent) => setFormData({ ...formData, content: newContent })}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleChange}
                        className="w-4 h-4 text-teal-500 bg-white/10 border-white/20 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-white">Published</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={updateBlog.loading || uploadingImages}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                    >
                      {uploadingImages ? 'Uploading Images...' : updateBlog.loading ? 'Updating...' : 'Update Blog'}
                    </Button>
                    <Button
                      type="button"
                      className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20"
                      disabled={updateBlog.loading || uploadingImages}
                      onClick={() => navigate(`/blog/details/${id}`)}
                    >
                      Cancel
                    </Button>
                  </div>

                  {updateBlog.error && (
                    <div className="text-red-600 text-sm mt-2">
                      Error: {String(updateBlog.error)}
                    </div>
                  )}
                </form>
              </div>
            </GlassCard>
          </div>
          <aside>
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Popular Posts
              </h2>
              <ul className="space-y-6">
                {popularPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      to={`/blog/details/${post.id}`}
                      className="flex cursor-pointer items-start space-x-4"
                    >
                      <img
                        src={(post.featured_image || post.imageUrl) || '/placeholder-blog.svg'}
                        alt={post.title}
                        className="w-20 h-20 rounded-lg object-cover"
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
            </div>
          </aside>
        </div>
      </main>

      {/* Upload Failure Modal */}
      <Dialog open={showUploadFailureModal} onOpenChange={setShowUploadFailureModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Image Upload Failed
            </DialogTitle>
            <DialogDescription className="text-left">
              Failed to upload new images.
              <br />
              <br />
              Do you want to continue updating the blog with existing images only?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadFailureModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinueWithoutImages}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Continue with Existing Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateBlog;