export interface BlogPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  category?: string;
  tags?: string[];
  imageUrls?: string[];
  metaDescription?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  featured: boolean;
  author: string;
  rating: number;
  isLiked: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  metadata?: object;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility with any remaining snake_case usages
  user_id?: string;
  image_urls?: string[];
  meta_description?: string;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  is_liked?: boolean;
  published_at?: string;
  scheduled_at?: string;
  created_at?: string;
  updated_at?: string;
  featured_image?: string;
  imageUrl?: string;
  published?: boolean;
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  likesCount: number;
  isLiked: boolean;
  replies: BlogComment[];
  metadata: object;
  createdAt: string;
  updatedAt: string;
  // Author info from backend
  authorName?: string;
  authorEmail?: string;
  author_name?: string;
  author_email?: string;
  // Legacy snake_case for backward compatibility
  post_id?: string;
  user_id?: string;
  parent_comment_id?: string | null;
  likes_count?: number;
  is_liked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommentsResponse {
  data: BlogComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // Legacy
  total_pages?: number;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
  metadata?: object;
  // Legacy
  parent_comment_id?: string;
}

// API Response types
export interface BlogListResponse {
  data: BlogPost[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  // Legacy
  total_pages?: number;
}

export interface BlogImageUploadResponse {
  urls: string[];
  message: string;
}

export interface SingleBlogImageUploadResponse {
  url: string;
  filename?: string;
  size?: number;
}

// Request types for creating/updating blogs
export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  tags?: string[];
  category: string;
  status?: 'draft' | 'published' | 'scheduled';
  author: string;
  published?: boolean;
  scheduled_at?: string;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  imageUrl?: string;
  tags?: string[];
  category?: string;
  published?: boolean;
  status?: 'draft' | 'published' | 'scheduled';
  scheduled_at?: string;
}

// Social links for author profiles
export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
}

// Author Profile types
export interface AuthorProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  socialLinks?: SocialLinks;
  postsCount: number;
  totalLikes: number;
  createdAt: string;
  updatedAt: string;
  // Legacy snake_case
  user_id?: string;
  display_name?: string;
  avatar_url?: string;
  social_links?: SocialLinks;
  posts_count?: number;
  total_likes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAuthorProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  social_links?: SocialLinks;
}

export interface UpdateAuthorProfileRequest extends CreateAuthorProfileRequest {}

export interface SchedulePostRequest {
  scheduled_at: string;
}
