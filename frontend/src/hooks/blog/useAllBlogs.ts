import { useState, useEffect } from 'react';
import { useBlogPosts } from '../useBlog';
import { BlogPost } from '../../types/blog';

export const useAllBlogs = (): { blogs: BlogPost[], loading: boolean, error: any } => {
  const { data, error, loading } = useBlogPosts({});
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      setBlogs(data.data);
    } else if (error && !loading) {
      setBlogs([]);
    }
  }, [data, error, loading]);

  return { blogs, loading, error };
};
