/**
 * Blog management hooks
 */

import { useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { BlogPost, BlogComment } from '../types/blog';

// Types
export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'scheduled';
  category?: string;
  tags?: string[];
  image_urls?: string[];
  meta_description?: string;
  featured?: boolean;
  author?: string;
  rating?: number;
  metadata?: object;
  scheduled_at?: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  excerpt?: string;
  image_urls?: string[];
  tags?: string[];
  category?: string;
  published?: boolean;
  author?: string;
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

// Hooks

/**
 * Get paginated list of blog posts
 */
export function useBlogPosts(
  params?: {
    published?: boolean;
    status?: string;
    type?: string;
    category?: string;
    search?: string;
    tags?: string[];
    user_id?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'likesCount';
    sortOrder?: 'asc' | 'desc';
  },
  options?: {
    initialPage?: number;
    initialLimit?: number;
    enabled?: boolean;
  }
) {
  // Prepare parameters for usePaginatedApi
  const paginatedParams = useMemo(() => {
    const cleanedParams = { ...params };
    // Handle status parameter - prefer explicit status over published boolean
    if (params?.published && !params?.status) {
      cleanedParams.status = 'published';
      delete cleanedParams.published;
    }
    return cleanedParams;
  }, [JSON.stringify(params)]);

  return usePaginatedApi<BlogPost>(
    useCallback(({ page, limit, ...extraParams }) => {
      // Build final API parameters
      const apiParams = {
        page,
        limit,
        ...extraParams,
      };
      return api.getBlogs(apiParams);
    }, []), // No dependencies needed since params come from usePaginatedApi
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      initialPage: options?.initialPage || 1,
      initialLimit: options?.initialLimit || 10,
      enabled: options?.enabled,
      params: paginatedParams, // Pass params to usePaginatedApi
    },
  );
}

/**
 * Get single blog post by ID
 */
export function useBlogPost(id: string | null, options?: { enabled?: boolean }) {
  return useApi(
    // Use useCallback to make the fetcher reactive to ID changes
    useCallback(() => api.getBlog(id!), [id]), 
    {
      enabled: !!id && (options?.enabled ?? true),
      refetchOnMount: true,
    }
  );
}

/**
 * Create a new blog post
 */
export function useCreateBlog() {
  return useMutation<BlogPost, CreateBlogData>(
    async (data) => {
      return api.createBlog(data);
    },
    {
      onSuccess: (data) => {
        console.log('Blog created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create blog:', error);
      },
    },
  );
}

/**
 * Update an existing blog post
 */
export function useUpdateBlog() {
  return useMutation<BlogPost, { id: string; data: UpdateBlogData }>(
    async ({ id, data }) => {
      return api.updateBlog(id, data);
    },
    {
      onSuccess: (data) => {
        console.log('Blog updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update blog:', error);
      },
    },
  );
}

/**
 * Delete a blog post
 */
export function useDeleteBlog() {
  return useMutation<void, string>((id) => api.deleteBlog(id), {
    onSuccess: () => {
      console.log('Blog deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete blog:', error);
    },
  });
}

/**
 * Publish a blog post
 */
export function usePublishBlog() {
  return useMutation<BlogPost, string>((id) => api.publishBlog(id), {
    onSuccess: (data) => {
      console.log('Blog published successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to publish blog:', error);
    },
  });
}

/**
 * Unpublish a blog post
 */
export function useUnpublishBlog() {
  return useMutation<BlogPost, string>((id) => api.unpublishBlog(id), {
    onSuccess: (data) => {
      console.log('Blog unpublished successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to unpublish blog:', error);
    },
  });
}

/**
 * Like a blog post
 */
// export function useLikeBlog() {
//   return useMutation<BlogPost, string>((id).likeBlog(id), {
//     onSuccess: (data) => {
//       console.log('Blog liked successfully:', data);
//     },
//     onError: (error) => {
//       console.error('Failed to like blog:', error);
//     },
//   });
// }

/**
 * Unlike a blog post
 */
export function useUnlikeBlog() {
  return useMutation<BlogPost, string>((id) => api.unlikeBlog(id), {
    onSuccess: (data) => {
      console.log('Blog unliked successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to unlike blog:', error);
    },
  });
}

/**
 * Rate a blog post
 */
export function useRateBlog() {
  return useMutation<BlogPost, { id: string; rating: number }>(
    ({ id, rating }) => api.rateBlog(id, rating),
    {
      onSuccess: (data) => {
        console.log('Blog rated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to rate blog:', error);
      },
    },
  );
}

// Comment hooks

/**
 * Get paginated comments for a blog post
 */
export function useBlogComments(
  blogId: string | null,
  params?: {
    parentId?: string;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  },
) {
  return usePaginatedApi<BlogComment>(
    useCallback(
      ({ page, limit }) => api.getBlogComments(blogId!, { ...params, page, limit }),
      [blogId, params],
    ),
    {
      enabled: !!blogId,
      refetchOnMount: true,
    },
  );
}

/**
 * Create a new comment on a blog post
 */
export function useCreateBlogComment() {
  return useMutation<BlogComment, { blogId: string; data: CreateCommentData }>(
    ({ blogId, data }) => api.createBlogComment(blogId, data),
    {
      onSuccess: (data) => {
        console.log('Comment created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create comment:', error);
      },
    },
  );
}

/**
 * Update a blog comment
 */
export function useUpdateBlogComment() {
  return useMutation<BlogComment, { blogId: string; commentId: string; content: string }>(
    ({ blogId, commentId, content }) => api.updateBlogComment(blogId, commentId, { content }),
    {
      onSuccess: (data) => {
        console.log('Comment updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update comment:', error);
      },
    },
  );
}

/**
 * Delete a blog comment
 */
export function useDeleteBlogComment() {
  return useMutation<void, { blogId: string; commentId: string }>(
    ({ blogId, commentId }) => api.deleteBlogComment(blogId, commentId),
    {
      onSuccess: () => {
        console.log('Comment deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete comment:', error);
      },
    },
  );
}

// Utility hooks

/**
 * Combined hook for blog post actions (like, publish, delete)
 */
export function useBlogActions() {
  // const likeBlog = useLikeBlog();
  const unlikeBlog = useUnlikeBlog();
  const publishBlog = usePublishBlog();
  const unpublishBlog = useUnpublishBlog();
  const deleteBlog = useDeleteBlog();

  return {
    // Like actions
    // toggleLike: useCallback(
    //   async (id: string, isCurrentlyLiked: boolean) => {
    //     try {
    //       if (isCurrentlyLiked) {
    //         await unlikeBlog.mutate(id);
    //       } else {
    //         // await likeBlog.mutate(id);
    //       }
    //     } catch (error) {
    //       console.error('Failed to toggle like:', error);
    //       throw error;
    //     }
    //   },
    //   // [likeBlog, unlikeBlog],
    // ),

    // Publish actions
    togglePublish: useCallback(
      async (id: string, isCurrentlyPublished: boolean) => {
        try {
          if (isCurrentlyPublished) {
            await unpublishBlog.mutate(id);
          } else {
            await publishBlog.mutate(id);
          }
        } catch (error) {
          console.error('Failed to toggle publish:', error);
          throw error;
        }
      },
      [publishBlog, unpublishBlog],
    ),

    // Delete action
    delete: deleteBlog.mutate,

    // Loading states
    // isLiking: likeBlog.loading || unlikeBlog.loading,
    isPublishing: publishBlog.loading || unpublishBlog.loading,
    isDeleting: deleteBlog.loading,
  };
}

/**
 * Hook for managing blog drafts
 */
export function useBlogDrafts() {
  return useBlogPosts({
    published: false,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
}

/**
 * Hook for managing published blogs
 */
export function usePublishedBlogs(params?: {
  category?: string;
  search?: string;
  tags?: string[];
}) {
  return useBlogPosts({
    ...params,
    published: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

/**
 * General blog hook - returns all published posts
 * For compatibility with existing components
 */
export function useBlog(params?: { category?: string; search?: string; tags?: string[] }) {
  const result = useBlogPosts({
    ...params,
    published: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return {
    posts: result.data?.data || [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
    hasMore: result.data ? result.data.total > result.data.data.length : false,
    total: result.data?.total || 0,
  };
}
