import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import type { APIError } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface UseApiOptions {
  immediate?: boolean;
  cacheTime?: number; // milliseconds
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
  execute: (...args: any[]) => Promise<T | null>;
  refresh: () => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Base hook for API operations with loading states, error handling, caching, and retry logic
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    immediate = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retry = 2,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const { addToast } = useAppStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<any[]>([]);
  const retryCountRef = useRef(0);

  // Check if data is still fresh based on cache time
  const isDataFresh = useCallback(() => {
    if (!state.lastFetch || !state.data) return false;
    return Date.now() - state.lastFetch.getTime() < cacheTime;
  }, [state.lastFetch, state.data, cacheTime]);

  // Execute the API function with retry logic
  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // If data is fresh and no new args, return cached data
    if (args.length === 0 && isDataFresh()) {
      return state.data;
    }

    // Store arguments for refresh functionality
    lastArgsRef.current = args;
    retryCountRef.current = 0;

    const attemptRequest = async (attemptCount: number): Promise<T | null> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        abortControllerRef.current = new AbortController();
        
        const result = await apiFunction(...args);
        
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastFetch: new Date()
        }));

        onSuccess?.(result);
        return result;
      } catch (error: any) {
        // Don't handle aborted requests
        if (error.name === 'AbortError') {
          return null;
        }

        const errorMessage = error?.message || 'An unexpected error occurred';
        
        // Retry logic
        if (attemptCount < retry && !error?.status?.toString().startsWith('4')) {
          retryCountRef.current = attemptCount + 1;
          
          // Show retry toast
          addToast({
            type: 'warning',
            message: `Request failed. Retrying... (${attemptCount + 1}/${retry})`,
            duration: 2000
          });

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attemptCount)));
          return attemptRequest(attemptCount + 1);
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));

        onError?.(errorMessage);
        
        // Show error toast for final failure
        addToast({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });

        return null;
      }
    };

    return attemptRequest(0);
  }, [apiFunction, retry, retryDelay, onSuccess, onError, addToast, isDataFresh, state.data]);

  // Refresh with last used arguments
  const refresh = useCallback(async (): Promise<T | null> => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  // Reset state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null
    });
    lastArgsRef.current = [];
    retryCountRef.current = 0;
  }, []);

  // Set data manually (useful for optimistic updates)
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      lastFetch: data ? new Date() : null
    }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate]); // Only run on mount

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastFetch: state.lastFetch,
    execute,
    refresh,
    reset,
    setData
  };
}

/**
 * Hook for API operations that support pagination
 */
export function usePaginatedApi<T = any>(
  apiFunction: (page: number, pageSize: number, ...args: any[]) => Promise<{ data: T[]; total: number; hasNext: boolean }>,
  pageSize: number = 20,
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  const baseHook = useApi(
    async (...args: any[]) => {
      const result = await apiFunction(page, pageSize, ...args);
      return result;
    },
    {
      ...options,
      onSuccess: (result) => {
        if (page === 1) {
          setAllData(result.data);
        } else {
          setAllData(prev => [...prev, ...result.data]);
        }
        setHasNext(result.hasNext);
        setTotal(result.total);
        options.onSuccess?.(result);
      }
    }
  );

  const loadMore = useCallback(async () => {
    if (hasNext && !baseHook.loading) {
      setPage(prev => prev + 1);
      return baseHook.execute();
    }
    return null;
  }, [hasNext, baseHook.loading, baseHook.execute]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasNext(false);
    setTotal(0);
    baseHook.reset();
  }, [baseHook.reset]);

  return {
    ...baseHook,
    data: allData,
    page,
    hasNext,
    total,
    loadMore,
    reset
  };
}

/**
 * Hook for API mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation<T = any, P = any>(
  mutationFunction: (payload: P) => Promise<T>,
  options: UseApiOptions & {
    invalidateCache?: string[];
    optimisticUpdate?: (payload: P) => T;
  } = {}
) {
  const { optimisticUpdate, ...apiOptions } = options;
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const baseHook = useApi(mutationFunction, {
    ...apiOptions,
    immediate: false,
    onSuccess: (data) => {
      setOptimisticData(null); // Clear optimistic data on success
      options.onSuccess?.(data);
    },
    onError: (error) => {
      setOptimisticData(null); // Clear optimistic data on error
      options.onError?.(error);
    }
  });

  const mutate = useCallback(async (payload: P): Promise<T | null> => {
    // Apply optimistic update if provided
    if (optimisticUpdate) {
      const optimisticResult = optimisticUpdate(payload);
      setOptimisticData(optimisticResult);
    }

    return baseHook.execute(payload);
  }, [baseHook.execute, optimisticUpdate]);

  return {
    ...baseHook,
    data: optimisticData || baseHook.data,
    mutate,
    isOptimistic: optimisticData !== null
  };
}
