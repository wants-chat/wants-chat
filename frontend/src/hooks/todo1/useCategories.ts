/**
 * Category hooks for Todo1 feature
 * Provides data fetching and mutations for categories
 */

import { useState, useEffect, useCallback } from 'react';
import { Category } from '../../types/todo1';
import { categoryApi, withErrorHandling } from '../../services/todo1Api';

// Hook return types
export interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCategoryMutationReturn {
  mutate: (...args: any[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch all categories
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await withErrorHandling(
        () => categoryApi.getAllCategories(),
        'Failed to fetch categories'
      );
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Hook to create a new category
 */
export function useCreateCategory(onSuccess?: (category: Category) => void): UseCategoryMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await withErrorHandling(
        () => categoryApi.createCategory(data),
        'Failed to create category'
      );
      onSuccess?.(newCategory);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Hook to update a category
 */
export function useUpdateCategory(onSuccess?: (category: Category) => void): UseCategoryMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await withErrorHandling(
        () => categoryApi.updateCategory(id, data),
        'Failed to update category'
      );
      onSuccess?.(updatedCategory);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory(onSuccess?: () => void): UseCategoryMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await withErrorHandling(
        () => categoryApi.deleteCategory(id),
        'Failed to delete category'
      );
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Hook to manage selected category state
 */
export function useCategorySelection(initialCategoryId?: string | null) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId || null);

  return {
    selectedCategoryId,
    selectCategory: setSelectedCategoryId,
  };
}

/**
 * Combined hook for all category operations
 */
export function useCategoryManager() {
  const categoriesData = useCategories();
  const { selectedCategoryId, selectCategory } = useCategorySelection();
  
  const createCategory = useCreateCategory(() => {
    categoriesData.refetch();
  });
  
  const updateCategory = useUpdateCategory(() => {
    categoriesData.refetch();
  });
  
  const deleteCategory = useDeleteCategory(() => {
    categoriesData.refetch();
  });

  // Auto-select first category if none selected
  useEffect(() => {
    if (!selectedCategoryId && categoriesData.categories.length > 0) {
      selectCategory(categoriesData.categories[0].id);
    }
  }, [categoriesData.categories, selectedCategoryId, selectCategory]);

  const selectedCategory = categoriesData.categories.find(c => c.id === selectedCategoryId);

  return {
    // Data
    categories: categoriesData.categories,
    selectedCategory,
    selectedCategoryId,
    loading: categoriesData.loading,
    error: categoriesData.error,
    
    // Actions
    selectCategory,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    refetch: categoriesData.refetch,
    
    // Loading states
    isCreating: createCategory.loading,
    isUpdating: updateCategory.loading,
    isDeleting: deleteCategory.loading,
  };
}