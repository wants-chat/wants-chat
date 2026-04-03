/**
 * Custom hooks for managing currency alerts
 */

import { useState, useEffect, useCallback } from 'react';
import currencyAlertApi from '../../services/currencyAlertApi';
import { 
  CurrencyAlert, 
  CurrencyAlertFormData, 
  CurrencyAlertResponse 
} from '../../types/currency-converter/currencyAlert';

/**
 * Hook to fetch all alerts with pagination
 */
export function useCurrencyAlerts(page = 1, limit = 10) {
  const [alerts, setAlerts] = useState<CurrencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useCurrencyAlerts: Fetching alerts...');
      const response: CurrencyAlertResponse = await currencyAlertApi.getAllAlerts(page, limit);
      console.log('useCurrencyAlerts: Response received:', response);
      console.log('useCurrencyAlerts: Alerts data:', response.data);
      setAlerts(response.data || []);
      setTotalPages(response.total_pages || 0);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('useCurrencyAlerts: Error fetching alerts:', err);
      setError(err.message || 'Failed to fetch alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    totalPages,
    total,
    refetch: fetchAlerts,
  };
}

/**
 * Hook to create a new alert
 */
export function useCreateAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAlert = useCallback(async (
    data: CurrencyAlertFormData & { is_active?: boolean }
  ): Promise<CurrencyAlert | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('useCreateAlert: Creating alert with data:', data);
      const newAlert = await currencyAlertApi.createAlert(data);
      console.log('useCreateAlert: Alert created successfully:', newAlert);
      return newAlert;
    } catch (err: any) {
      console.error('useCreateAlert: Error creating alert:', err);
      setError(err.message || 'Failed to create alert');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createAlert,
    loading,
    error,
  };
}

/**
 * Hook to update an alert
 */
export function useUpdateAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAlert = useCallback(async (
    id: string, 
    data: Partial<CurrencyAlertFormData>
  ): Promise<CurrencyAlert | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedAlert = await currencyAlertApi.updateAlert(id, data);
      return updatedAlert;
    } catch (err: any) {
      setError(err.message || 'Failed to update alert');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateAlert,
    loading,
    error,
  };
}

/**
 * Hook to delete an alert
 */
export function useDeleteAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAlert = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await currencyAlertApi.deleteAlert(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete alert');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteAlert,
    loading,
    error,
  };
}

/**
 * Hook to toggle alert status
 */
export function useToggleAlertStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = useCallback(async (
    id: string, 
    isActive: boolean
  ): Promise<CurrencyAlert | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedAlert = await currencyAlertApi.toggleAlertStatus(id, isActive);
      return updatedAlert;
    } catch (err: any) {
      setError(err.message || 'Failed to toggle alert status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    toggleStatus,
    loading,
    error,
  };
}

/**
 * Hook to test an alert
 */
export function useTestAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testAlert = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await currencyAlertApi.testAlert(id);
      setTestResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to test alert');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    testAlert,
    testResult,
    loading,
    error,
  };
}

/**
 * Combined hook for alert management
 */
export function useAlertManager() {
  const alertsData = useCurrencyAlerts();
  const createHook = useCreateAlert();
  const updateHook = useUpdateAlert();
  const deleteHook = useDeleteAlert();
  const toggleHook = useToggleAlertStatus();

  return {
    // Data
    alerts: alertsData.alerts,
    loading: alertsData.loading,
    error: alertsData.error,
    total: alertsData.total,
    
    // Actions
    createAlert: createHook.createAlert,
    updateAlert: updateHook.updateAlert,
    deleteAlert: deleteHook.deleteAlert,
    toggleStatus: toggleHook.toggleStatus,
    refetch: alertsData.refetch,
    
    // Loading states
    isCreating: createHook.loading,
    isUpdating: updateHook.loading,
    isDeleting: deleteHook.loading,
    isToggling: toggleHook.loading,
  };
}