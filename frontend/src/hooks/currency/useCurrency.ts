/**
 * Currency management hooks
 */

import { useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import { useApi, useMutation, usePaginatedApi } from '../useApi';

// Types
export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  lastUpdated: string;
  // Note: Frankfurter API doesn't provide these, so they're optional
  change24h?: number;
  changePercent24h?: number;
}

export interface CurrencyTransaction {
  id: string;
  user_id: string;
  amount: number;
  from_currency: string;
  to_currency: string;
  exchange_rate: number | null;
  converted_amount: number;
  timestamp: string;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

export interface CurrencyHistoryPoint {
  date: string;
  rate: number;
  high: number;
  low: number;
  volume?: number;
}

export type CurrencyHistoryPeriod = '1D' | '7D' | '30D' | '90D' | '1Y' | 'MAX';

export interface CurrencyAlert {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
  updatedAt: string;
  notificationMethod: 'email' | 'push' | 'both';
  description?: string;
}

export interface FavoriteCurrency {
  id: string;
  userId: string;
  currencyCode: string;
  createdAt: string;
}

export interface ConvertCurrencyData {
  from_currency: string;
  to_currency: string;
  amount: number;
}

export interface CreateCurrencyAlertData {
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'above' | 'below';
  notificationMethod: 'email' | 'push' | 'both';
  description?: string;
}

export interface UpdateCurrencyAlertData {
  targetRate?: number;
  condition?: 'above' | 'below';
  isActive?: boolean;
  notificationMethod?: 'email' | 'push' | 'both';
  description?: string;
}

export interface AddFavoriteCurrencyData {
  currencyCode: string;
}

// Currency rate hooks

/**
 * Get current currency rates
 */
type SortableFields = 'code' | 'name' | 'rate';

export function useCurrencyRates(params?: {
  base_currency?: string;
  currencies?: string[];
  sortBy?: SortableFields;
  sortOrder?: 'asc' | 'desc';
}) {
  return useApi<{ data: CurrencyRate[]; total: number }>(
    useCallback(
      () => api.getCurrencyRates({ 
        base_currency: params?.base_currency,
        currencies: params?.currencies
      }).then(response => {
        let data = [...response.data];
        
        // Handle sorting
        if (params?.sortBy) {
          data.sort((a, b) => {
            const aValue = a[params.sortBy as SortableFields];
            const bValue = b[params.sortBy as SortableFields];
            const modifier = params.sortOrder === 'desc' ? -1 : 1;
            
            if (params.sortBy === 'rate') {
              return ((aValue as number) - (bValue as number)) * modifier;
            }
            // For code and name, use string comparison
            return (aValue as string).localeCompare(bValue as string) * modifier;
          });
        }
        
        return {
          data,
          total: data.length
        };
      }),
      [params?.base_currency, params?.currencies, params?.sortBy, params?.sortOrder]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true, // Rates change frequently
    }
  );
}

/**
 * Convert currency using the centralized API client
 */
export function useConvertCurrency() {
  return useMutation<CurrencyConversion, ConvertCurrencyData>(
    async (data) => {
      try {
        const { from_currency, to_currency, amount } = data;

        // Use centralized API client method for external Frankfurter API
        const result = await api.convertCurrencyExternal(
          from_currency,
          to_currency,
          amount
        );

        console.log('Currency converted successfully:', {
          from: from_currency,
          to: to_currency,
          amount,
          convertedAmount: result.convertedAmount,
          rate: result.rate,
        });

        return result;
      } catch (error) {
        console.error('Error converting currency:', error);
        throw error;
      }
    },
    {
      onError: (error) => {
        console.error('Failed to convert currency:', error);
      },
    }
  );
}

/**
 * Get currency historical data
 */
export function useCurrencyHistory(
  from: string | null,
  to: string | null,
  params?: {
    period?: CurrencyHistoryPeriod;
    interval?: '1m' | '5m' | '15m' | '1h' | '1d';
  }
) {
  return useApi<CurrencyHistoryPoint[]>(
    () => {
      if (!from || !to) return Promise.resolve([]);

      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      if (params?.period) {
        switch (params.period) {
          case '1D':
            startDate.setDate(endDate.getDate() - 1);
            break;
          case '7D':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30D':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90D':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case '1Y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case 'MAX':
            startDate = new Date('1999-01-01');
            break;
        }
      } else {
        startDate.setDate(endDate.getDate() - 7); // Default to 7 days
      }

      return api.getCurrencyHistory(from, to, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }).then(response => {
        // Transform Frankfurter API response to our format
        const rates = response.rates;
        if (!rates) return [];
        
        return Object.entries(rates).map(([date, value]: [string, any]) => ({
          date,
          rate: value[to],
          high: value[to], 
          low: value[to],
          volume: 0
        }));
      });
    },
    {
      enabled: !!from && !!to,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

// Currency alert hooks

/**
 * Get user's currency alerts
 */
export function useCurrencyAlerts(params?: {
  isActive?: boolean;
  triggered?: boolean;
  fromCurrency?: string;
  toCurrency?: string;
  sortBy?: 'createdAt' | 'targetRate' | 'triggeredAt';
  sortOrder?: 'asc' | 'desc';
}) {
  return usePaginatedApi<CurrencyAlert>(
    useCallback(
      ({ page, limit }) => api.getCurrencyAlerts({ ...params, page, limit }),
      [params]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Create a new currency alert
 */
export function useCreateCurrencyAlert() {
  return useMutation<CurrencyAlert, CreateCurrencyAlertData>(
    (data) => api.createCurrencyAlert(data),
    {
      onSuccess: (data) => {
        console.log('Currency alert created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create currency alert:', error);
      },
    }
  );
}

/**
 * Update a currency alert
 */
export function useUpdateCurrencyAlert() {
  return useMutation<CurrencyAlert, { id: string; data: UpdateCurrencyAlertData }>(
    ({ id, data }) => api.updateCurrencyAlert(id, data),
    {
      onSuccess: (data) => {
        console.log('Currency alert updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update currency alert:', error);
      },
    }
  );
}

/**
 * Delete a currency alert
 */
export function useDeleteCurrencyAlert() {
  return useMutation<void, string>(
    (id) => api.deleteCurrencyAlert(id),
    {
      onSuccess: () => {
        console.log('Currency alert deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete currency alert:', error);
      },
    }
  );
}

// Favorite currency hooks

/**
 * Get user's favorite currencies
 */
export function useFavoriteCurrencies() {
  return useApi<FavoriteCurrency[]>(
    () => api.getFavoriteCurrencies(),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Add a currency to favorites
 */
export function useAddFavoriteCurrency() {
  return useMutation<FavoriteCurrency, AddFavoriteCurrencyData>(
    (data) => api.addFavoriteCurrency(data),
    {
      onSuccess: (data) => {
        console.log('Currency added to favorites successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to add currency to favorites:', error);
      },
    }
  );
}

/**
 * Remove a currency from favorites
 */
export function useRemoveFavoriteCurrency() {
  return useMutation<void, string>(
    (id) => api.removeFavoriteCurrency(id),
    {
      onSuccess: () => {
        console.log('Currency removed from favorites successfully');
      },
      onError: (error) => {
        console.error('Failed to remove currency from favorites:', error);
      },
    }
  );
}

// Utility hooks

/**
 * Combined hook for currency conversion and history
 */
export function useCurrencyExchange(from?: string, to?: string) {
  const conversion = useConvertCurrency();
  const history = useCurrencyHistory(from || null, to || null, { period: '7D' });

  const convert = useCallback(async (amount: number, fromCurrency?: string, toCurrency?: string) => {
    if (!fromCurrency || !toCurrency) return;
    
    try {
      const result = await conversion.mutate({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
      });
      return result;
    } catch (error) {
      console.error('Failed to convert currency:', error);
      throw error;
    }
  }, [conversion.mutate]);

  return {
    convert,
    history: history.data,
    isConverting: conversion.loading,
    conversionResult: conversion.data,
    historyLoading: history.loading,
    historyError: history.error,
    refetchHistory: history.refetch,
  };
}

/**
 * Hook for managing currency alerts
 */
export function useCurrencyAlertActions() {
  const createAlert = useCreateCurrencyAlert();
  const updateAlert = useUpdateCurrencyAlert();
  const deleteAlert = useDeleteCurrencyAlert();

  return {
    create: createAlert.mutate,
    update: updateAlert.mutate,
    delete: deleteAlert.mutate,
    
    toggleActive: useCallback(async (id: string, isCurrentlyActive: boolean) => {
      try {
        await updateAlert.mutate({ id, data: { isActive: !isCurrentlyActive } });
      } catch (error) {
        console.error('Failed to toggle alert active status:', error);
        throw error;
      }
    }, [updateAlert]),

    isCreating: createAlert.loading,
    isUpdating: updateAlert.loading,
    isDeleting: deleteAlert.loading,
  };
}

/**
 * Hook for managing favorite currencies
 */
export function useFavoriteCurrencyActions() {
  const favorites = useFavoriteCurrencies();
  const addFavorite = useAddFavoriteCurrency();
  const removeFavorite = useRemoveFavoriteCurrency();

  const isFavorite = useCallback((currencyCode: string) => {
    return favorites.data?.some(fav => fav.currencyCode === currencyCode) || false;
  }, [favorites.data]);

  const toggleFavorite = useCallback(async (currencyCode: string) => {
    try {
      const favorite = favorites.data?.find(fav => fav.currencyCode === currencyCode);
      
      if (favorite) {
        await removeFavorite.mutate(favorite.id);
      } else {
        await addFavorite.mutate({ currencyCode });
      }
      
      // Refetch favorites after toggle
      await favorites.refetch();
    } catch (error) {
      console.error('Failed to toggle favorite currency:', error);
      throw error;
    }
  }, [favorites, addFavorite, removeFavorite]);

  return {
    favorites: favorites.data || [],
    isFavorite,
    toggleFavorite,
    add: addFavorite.mutate,
    remove: removeFavorite.mutate,
    
    loading: favorites.loading,
    isAdding: addFavorite.loading,
    isRemoving: removeFavorite.loading,
    refetch: favorites.refetch,
  };
}

/**
 * Get active currency alerts only
 */
export function useActiveCurrencyAlerts() {
  return useCurrencyAlerts({
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

/**
 * Get triggered currency alerts
 */
export function useTriggeredCurrencyAlerts() {
  return useCurrencyAlerts({
    triggered: true,
    sortBy: 'triggeredAt',
    sortOrder: 'desc',
  });
}

/**
 * Hook for currency dashboard data
 */
export function useCurrencyDashboard(baseCurrency?: string) {
  const rates = useCurrencyRates({ 
    base_currency: baseCurrency || 'USD',
    sortBy: 'rate',  // Changed from change24h since we don't have that field
    sortOrder: 'desc',
  });
  
  const favorites = useFavoriteCurrencies();
  const activeAlerts = useActiveCurrencyAlerts();
  const triggeredAlerts = useTriggeredCurrencyAlerts();

  // Get rates for favorite currencies
  const favoriteRates = rates.data?.data.filter(rate => 
    favorites.data?.some(fav => fav.currencyCode === rate.code)
  ) || [];

  return {
    rates: rates.data?.data || [],
    favoriteRates,
    favorites: favorites.data || [],
    activeAlerts: activeAlerts.data?.data || [],
    triggeredAlerts: triggeredAlerts.data?.data || [],
    
    loading: rates.loading || favorites.loading || activeAlerts.loading || triggeredAlerts.loading,
    error: rates.error || favorites.error || activeAlerts.error || triggeredAlerts.error,
    
    refetch: useCallback(() => {
      rates.refetch();
      favorites.refetch();
      activeAlerts.refetch();
      triggeredAlerts.refetch();
    }, [rates, favorites, activeAlerts, triggeredAlerts]),
  };
}

/**
 * Hook for currency rate monitoring
 */
export function useCurrencyRateMonitor(from: string, to: string) {
  const history = useCurrencyHistory(from, to, { period: '1D' });
  const conversion = useConvertCurrency();

  const getCurrentRate = useCallback(async () => {
    try {
      const result = await conversion.mutate({ from_currency: from, to_currency: to, amount: 1 });
      return result.rate;
    } catch (error) {
      console.error('Failed to get current rate:', error);
      throw error;
    }
  }, [conversion, from, to]);

  const currentRate = history.data?.[history.data.length - 1]?.rate;
  const previousRate = history.data?.[history.data.length - 2]?.rate;
  const change = currentRate && previousRate ? currentRate - previousRate : 0;
  const changePercent = currentRate && previousRate ? ((change / previousRate) * 100) : 0;

  return {
    currentRate,
    previousRate,
    change,
    changePercent,
    history: history.data,
    getCurrentRate,
    
    loading: history.loading,
    error: history.error,
    refetch: history.refetch,
  };
}

/**
 * Hook for bulk alert operations
 */
export function useBulkAlertOperations() {
  const updateAlert = useUpdateCurrencyAlert();
  const deleteAlert = useDeleteCurrencyAlert();

  return {
    bulkToggleActive: useCallback(async (alertIds: string[], isActive: boolean) => {
      const promises = alertIds.map(id => 
        updateAlert.mutate({ id, data: { isActive } })
      );
      await Promise.all(promises);
    }, [updateAlert]),

    bulkDelete: useCallback(async (alertIds: string[]) => {
      const promises = alertIds.map(id => deleteAlert.mutate(id));
      await Promise.all(promises);
    }, [deleteAlert]),

    bulkUpdateNotificationMethod: useCallback(async (
      alertIds: string[], 
      notificationMethod: 'email' | 'push' | 'both'
    ) => {
      const promises = alertIds.map(id => 
        updateAlert.mutate({ id, data: { notificationMethod } })
      );
      await Promise.all(promises);
    }, [updateAlert]),

    isPerforming: updateAlert.loading || deleteAlert.loading,
  };
}

/**
 * Hook for currency rate analysis
 */
export function useCurrencyAnalysis(from: string, to: string, period: CurrencyHistoryPeriod = '30D') {
  const history = useCurrencyHistory(from, to, { period });

  const analysis = useMemo(() => {
    if (!history.data || history.data.length === 0) {
      return null;
    }

    const rates = history.data.map(point => point.rate);
    const currentRate = rates[rates.length - 1];
    const firstRate = rates[0];
    
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    
    const totalChange = currentRate - firstRate;
    const totalChangePercent = (totalChange / firstRate) * 100;
    
    const volatility = Math.sqrt(
      rates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / rates.length
    );

    return {
      currentRate,
      firstRate,
      minRate,
      maxRate,
      avgRate,
      totalChange,
      totalChangePercent,
      volatility,
      trend: totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable',
      support: minRate,
      resistance: maxRate,
    };
  }, [history.data]);

  return {
    analysis,
    history: history.data,
    loading: history.loading,
    error: history.error,
    refetch: history.refetch,
  };
}