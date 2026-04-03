import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BlogComment, CommentsResponse, CreateCommentRequest } from '../types/blog';

export function useBlogComments(postId: string | null, page: number = 1, limit: number = 20) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0
  });

  const fetchComments = async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const response: CommentsResponse = await api.getBlogComments(postId, {
        page,
        limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      console.log('📝 Comments fetched:', response);
      
      setComments(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        total_pages: response.total_pages
      });
    } catch (err) {
      console.error('❌ Failed to fetch comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page, limit]);

  return {
    comments,
    loading,
    error,
    pagination,
    refetch: fetchComments
  };
}

export function useCreateComment(postId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = async (data: CreateCommentRequest): Promise<BlogComment | null> => {
    if (!postId) {
      setError('Post ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const comment: BlogComment = await api.createBlogComment(postId, {
        ...data,
        metadata: data.metadata || {}
      });

      console.log('✅ Comment created:', comment);
      return comment;
    } catch (err) {
      console.error('❌ Failed to create comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createComment,
    loading,
    error
  };
}

export function useDeleteComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteComment = async (postId: string, commentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.deleteBlogComment(postId, commentId);
      console.log('✅ Comment deleted:', commentId);
      return true;
    } catch (err) {
      console.error('❌ Failed to delete comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteComment,
    loading,
    error
  };
}