import { useMemo } from 'react';
import { useAllBlogs } from './useAllBlogs';
import { BlogPost } from '../../types/blog';

export const useSingleBlog = (id: string | undefined): BlogPost | undefined => {
  const { blogs } = useAllBlogs();

  return useMemo(() => (id ? blogs.find((b: BlogPost) => b.id === id) : undefined), [blogs, id]);
};
