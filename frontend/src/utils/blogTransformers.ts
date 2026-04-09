import { BlogPost } from '../types/blog';
import { cleanS3Url } from './imageUtils';

/**
 * Transform backend blog data (snake_case) to frontend format (camelCase)
 */
export function transformBlogFromBackend(backendBlog: any): BlogPost {
  // Handle image URLs - backend returns camelCase (imageUrls) per CLAUDE.md Rule #2
  let imageUrls: string[] = [];
  let featuredImage: string | undefined;

  // Backend returns camelCase: imageUrls (preferred) or snake_case: image_urls (legacy)
  const rawImageUrls = backendBlog.imageUrls || backendBlog.image_urls;
  if (rawImageUrls && Array.isArray(rawImageUrls)) {
    const mappedUrls = rawImageUrls.map(cleanS3Url);
    imageUrls = mappedUrls.filter((url): url is string => url !== undefined && url !== null && url !== '');
    featuredImage = imageUrls.length > 0 ? imageUrls[0] : undefined;
  }

  // Legacy fallback - backend may return featuredImage (camelCase) or featured_image (snake_case)
  if (!featuredImage) {
    const rawImageUrl = backendBlog.featuredImage || backendBlog.featured_image || backendBlog.imageUrl || backendBlog.image_url;
    if (rawImageUrl) {
      featuredImage = cleanS3Url(rawImageUrl);
      if (featuredImage && imageUrls.length === 0) {
        imageUrls = [featuredImage];
      }
    }
  }
  
  // Backend returns camelCase per CLAUDE.md Rule #2
  const likesCount = backendBlog.likesCount ?? backendBlog.likes_count ?? 0;
  const commentsCount = backendBlog.commentsCount ?? backendBlog.comments_count ?? 0;
  const viewsCount = backendBlog.viewsCount ?? backendBlog.views_count ?? 0;
  const isLiked = backendBlog.isLiked ?? backendBlog.is_liked ?? false;
  const publishedAt = backendBlog.publishedAt || backendBlog.published_at;
  const createdAt = backendBlog.createdAt || backendBlog.created_at;
  const updatedAt = backendBlog.updatedAt || backendBlog.updated_at;
  const userId = backendBlog.userId || backendBlog.user_id;
  const metaDescription = backendBlog.metaDescription || backendBlog.meta_description;

  return {
    id: backendBlog.id,
    user_id: userId,
    userId,
    title: backendBlog.title,
    content: backendBlog.content,
    excerpt: backendBlog.excerpt,
    status: backendBlog.status || 'draft',
    category: backendBlog.category,
    tags: backendBlog.tags || [],
    // Image fields
    image_urls: imageUrls,
    featured_image: featuredImage,
    imageUrl: featuredImage,
    // Counts and stats
    meta_description: metaDescription,
    likes_count: likesCount,
    comments_count: commentsCount,
    views_count: viewsCount,
    featured: backendBlog.featured || false,
    author: backendBlog.author || 'Anonymous',
    rating: backendBlog.rating || 0,
    is_liked: isLiked,
    published_at: publishedAt,
    metadata: backendBlog.metadata || {},
    created_at: createdAt,
    updated_at: updatedAt,
    // Legacy camelCase compatibility fields
    metaDescription: metaDescription,
    likesCount: likesCount,
    commentsCount: commentsCount,
    viewsCount: viewsCount,
    isLiked: isLiked,
    published: backendBlog.status === 'published',
    publishedAt: publishedAt,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
}

/**
 * Transform frontend blog data (camelCase) to backend format (snake_case)
 */
export function transformBlogToBackend(frontendBlog: Partial<BlogPost>): any {
  const backendData: any = {};

  if (frontendBlog.title !== undefined) backendData.title = frontendBlog.title;
  if (frontendBlog.content !== undefined) backendData.content = frontendBlog.content;
  if (frontendBlog.excerpt !== undefined) backendData.excerpt = frontendBlog.excerpt;
  if (frontendBlog.status !== undefined) backendData.status = frontendBlog.status;
  if (frontendBlog.category !== undefined) backendData.category = frontendBlog.category;
  if (frontendBlog.tags !== undefined) backendData.tags = frontendBlog.tags;

  // Handle new image_urls array (preferred method)
  if (frontendBlog.image_urls !== undefined && Array.isArray(frontendBlog.image_urls)) {
    backendData.image_urls = frontendBlog.image_urls;
  } else if (frontendBlog.featured_image || frontendBlog.imageUrl) {
    // Fallback: convert single image to array format
    const singleImageUrl = frontendBlog.featured_image || frontendBlog.imageUrl;
    backendData.image_urls = [singleImageUrl];
  }

  if (frontendBlog.metaDescription !== undefined) backendData.meta_description = frontendBlog.metaDescription;
  if (frontendBlog.featured !== undefined) backendData.featured = frontendBlog.featured;
  if (frontendBlog.author !== undefined) backendData.author = frontendBlog.author;
  if (frontendBlog.rating !== undefined) backendData.rating = frontendBlog.rating;
  if (frontendBlog.published !== undefined) {
    backendData.status = frontendBlog.published ? 'published' : 'draft';
  }
  if (frontendBlog.metadata !== undefined) backendData.metadata = frontendBlog.metadata;

  return backendData;
}

/**
 * Transform blog list response from backend
 */
export function transformBlogListResponse(response: any): any {
  if (!response) return response;

  // Handle paginated response
  if (response.data && Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map(transformBlogFromBackend),
    };
  }

  // Handle direct array response
  if (Array.isArray(response)) {
    return response.map(transformBlogFromBackend);
  }

  // Handle single blog response
  return transformBlogFromBackend(response);
}