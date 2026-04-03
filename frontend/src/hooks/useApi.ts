/**
 * API data fetching hooks
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getErrorMessage } from '../lib/api';

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  retryOnError?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Generic hook for API data fetching with loading, error states, and caching
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiState<T> & {
  refetch: () => Promise<void>;
  mutate: (data: T | ((prevData: T | null) => T)) => void;
} {
  const {
    initialData = null,
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    retryOnError = false,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) {
      return;
    }

    setState(prev => {
      if (!isRetry && prev.loading) {
        return prev;
      }
      return {
        ...prev,
        loading: true,
        error: isRetry ? prev.error : null,
        isError: false
      };
    });

    try {
      const result = await apiFunctionRef.current();

      if (!isMountedRef.current) {
        return;
      }

      setState({
        data: result,
        loading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      retryCountRef.current = 0;
      onSuccess?.(result);
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMessage = getErrorMessage(error);

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        isSuccess: false,
        isError: true,
      });

      onError?.(errorMessage);

      // Retry logic
      if (retryOnError && retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData(true);
          }
        }, retryDelay * retryCountRef.current);
      }
    }
  }, [enabled, retryOnError, retryAttempts, retryDelay, onSuccess, onError]);

  const refetch = useCallback(() => fetchData(false), [fetchData]);

  const mutate = useCallback((data: T | ((prevData: T | null) => T)) => {
    setState(prev => ({
      ...prev,
      data: typeof data === 'function' ? (data as Function)(prev.data) : data,
      isSuccess: true,
      isError: false,
    }));
  }, []);

  // Update fetchData ref without triggering refetch
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  // Initial fetch on mount
  useEffect(() => {
    if (refetchOnMount && enabled) {
      fetchDataRef.current();
    }
  }, [refetchOnMount, enabled]);


  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (enabled) {
        fetchDataRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    refetch,
    mutate,
  };
}

/**
 * Hook for paginated API data
 */
export function usePaginatedApi<T>(
  apiFunction: (params: { page: number; limit: number; [key: string]: any }) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options: UseApiOptions<{ data: T[]; total: number; page: number; limit: number }> & {
    initialPage?: number;
    initialLimit?: number;
    params?: Record<string, any>;
  } = {}
) {
  const {
    initialPage = 1,
    initialLimit = 10,
    params = {},
    ...useApiOptions
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // Create a stable reference for params to avoid infinite re-renders
  const stableParams = useMemo(() => {
    // Only recreate if params actually changed
    return Object.keys(params || {}).length > 0 ? params : {};
  }, [JSON.stringify(params)]);

  // Use stable ref to prevent recreation of apiCall function
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const apiCall = useCallback(() => {
    return apiFunctionRef.current({ page, limit, ...stableParams });
  }, [page, limit, stableParams]);

  const result = useApi(apiCall, useApiOptions);

  // Track previous stableParams to detect changes
  const prevParamsRef = useRef(JSON.stringify(stableParams));

  // Refetch when stableParams change (but not on initial mount)
  useEffect(() => {
    const currentParamsStr = JSON.stringify(stableParams);
    if (prevParamsRef.current !== currentParamsStr) {
      prevParamsRef.current = currentParamsStr;
      result.refetch();
    }
  }, [stableParams, result.refetch]);

  const nextPage = useCallback(() => {
    if (result.data && page < Math.ceil(result.data.total / limit)) {
      setPage(prev => prev + 1);
    }
  }, [result.data, page, limit]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const canGoNext = result.data ? page < Math.ceil(result.data.total / limit) : false;
  const canGoPrev = page > 1;

  return {
    ...result,
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    canGoNext,
    canGoPrev,
    totalPages: result.data ? Math.ceil(result.data.total / limit) : 0,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation<TData, TVariables = void>(
  mutationFunction: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: string, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: string | null, variables: TVariables) => void;
  } = {}
) {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
    isSuccess: boolean;
    isError: boolean;
  }>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const { onSuccess, onError, onSettled } = options;

  const mutate = useCallback(async (variables: TVariables) => {
    setState({
      data: null,
      loading: true,
      error: null,
      isSuccess: false,
      isError: false,
    });

    try {
      const result = await mutationFunction(variables);
      
      setState({
        data: result,
        loading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        isSuccess: false,
        isError: true,
      });

      onError?.(errorMessage, variables);
      onSettled?.(null, errorMessage, variables);
      throw error;
    }
  }, [mutationFunction, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  // mutateAsync is just an alias for mutate since mutate already returns a promise
  const mutateAsync = mutate;

  return {
    ...state,
    isPending: state.loading, // alias for compatibility with react-query naming
    mutate,
    mutateAsync,
    reset,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  data: T | null,
  updateFunction: (optimisticData: T) => Promise<T>
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(data);
  const [isOptimistic, setIsOptimistic] = useState(false);

  useEffect(() => {
    setOptimisticData(data);
  }, [data]);

  const mutate = useCallback(async (newData: T) => {
    // Apply optimistic update
    setOptimisticData(newData);
    setIsOptimistic(true);

    try {
      const result = await updateFunction(newData);
      setOptimisticData(result);
      setIsOptimistic(false);
      return result;
    } catch (error) {
      // Rollback optimistic update
      setOptimisticData(data);
      setIsOptimistic(false);
      throw error;
    }
  }, [data, updateFunction]);

  return {
    data: optimisticData,
    isOptimistic,
    mutate,
  };
}

/**
 * Hook for infinite scrolling/loading
 */
export function useInfiniteApi<T>(
  apiFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean; page: number }>,
  options: {
    limit?: number;
    enabled?: boolean;
    onSuccess?: (data: T[]) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const { limit = 10, enabled = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<{
    data: T[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
  }>({
    data: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    page: 1,
  });

  const fetchPage = useCallback(async (page: number, reset = false) => {
    setState(prev => ({
      ...prev,
      loading: page === 1,
      loadingMore: page > 1,
      error: null,
    }));

    try {
      const result = await apiFunction(page, limit);
      
      setState(prev => ({
        ...prev,
        data: reset ? result.data : [...prev.data, ...result.data],
        loading: false,
        loadingMore: false,
        hasMore: result.hasMore,
        page: result.page,
      }));

      onSuccess?.(result.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: errorMessage,
      }));

      onError?.(errorMessage);
    }
  }, [apiFunction, limit, onSuccess, onError]);

  const loadMore = useCallback(() => {
    if (!state.loading && !state.loadingMore && state.hasMore) {
      fetchPage(state.page + 1);
    }
  }, [state.loading, state.loadingMore, state.hasMore, state.page, fetchPage]);

  const refetch = useCallback(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  useEffect(() => {
    if (enabled) {
      fetchPage(1, true);
    }
  }, [enabled, fetchPage]);

  return {
    ...state,
    loadMore,
    refetch,
  };
}