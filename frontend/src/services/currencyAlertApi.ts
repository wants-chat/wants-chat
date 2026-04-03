/**
 * Currency Alert API Service
 * Handles all API operations for currency alerts with localStorage fallback
 */

import { api } from '../lib/api';
import { 
  CurrencyAlert, 
  CurrencyAlertFormData, 
  CurrencyAlertResponse,
  UpdateAlertRequest 
} from '../types/currency-converter/currencyAlert';

// API endpoints base path
const ALERTS_BASE_PATH = '/currency/alerts';

// LocalStorage key for alerts
const STORAGE_KEY = 'life_os_currency_alerts';

// Demo data for testing
const createDemoData = (): CurrencyAlert[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'demo_1',
      user_id: 'local_user',
      name: 'EUR/USD Daily Monitor',
      base_currency: 'EUR',
      target_currency: 'USD',
      alert_type: 'above',
      threshold: 1.10,
      frequency: 'daily',
      is_active: true,
      email_notification: true,
      push_notification: false,
      current_rate: 1.0850,
      last_triggered_at: null,
      trigger_count: 0,
      metadata: { created_from: 'demo' },
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo_2',
      user_id: 'local_user',
      name: 'GBP/USD Alert',
      base_currency: 'GBP',
      target_currency: 'USD',
      alert_type: 'below',
      threshold: 1.25,
      frequency: 'weekly',
      is_active: true,
      email_notification: false,
      push_notification: true,
      current_rate: 1.2650,
      last_triggered_at: null,
      trigger_count: 5,
      metadata: { created_from: 'demo' },
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo_3',
      user_id: 'local_user',
      name: 'Bitcoin Price Change Alert',
      base_currency: 'BTC',
      target_currency: 'USD',
      alert_type: 'change',
      threshold: 5.0,
      frequency: 'once',
      is_active: false,
      email_notification: true,
      push_notification: true,
      current_rate: 42000,
      last_triggered_at: new Date(Date.now() - 86400000).toISOString(),
      trigger_count: 12,
      metadata: { created_from: 'demo' },
      created_at: now,
      updated_at: now,
    }
  ];
};

// Helper functions for localStorage
const getStoredAlerts = (): CurrencyAlert[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('getStoredAlerts: Raw localStorage value:', stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('getStoredAlerts: Parsed alerts count:', parsed.length);
      return parsed;
    } else {
      // Initialize with demo data if nothing exists
      console.log('getStoredAlerts: No stored alerts, creating demo data');
      const demoData = createDemoData();
      saveStoredAlerts(demoData);
      return demoData;
    }
  } catch (error) {
    console.error('Error reading alerts from localStorage:', error);
    return createDemoData();
  }
};

const saveStoredAlerts = (alerts: CurrencyAlert[]): void => {
  try {
    console.log('saveStoredAlerts: Saving alerts count:', alerts.length);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    console.log('saveStoredAlerts: Saved successfully');
  } catch (error) {
    console.error('Error saving alerts to localStorage:', error);
  }
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Helper function to handle API calls with fallback
const withFallback = async <T>(
  apiCall: () => Promise<T>,
  localCall: () => T,
  errorMessage: string
): Promise<T> => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error(`${errorMessage}. Full error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.warn(`Using localStorage fallback`);
    return localCall();
  }
};

export const currencyAlertApi = {
  /**
   * Get all alerts for the current user with localStorage fallback
   */
  getAllAlerts: async (page = 1, limit = 50): Promise<CurrencyAlertResponse> => {
    return withFallback(
      async () => {
        const response = await api.request(`${ALERTS_BASE_PATH}?page=${page}&limit=${limit}`);
        const data = response.data || response;
        console.log('getAllAlerts: API call succeeded, raw data:', data);

        // Handle different API response formats
        let apiAlerts: CurrencyAlert[] = [];
        if (Array.isArray(data)) {
          // Direct array response
          apiAlerts = data;
        } else if (data.data && Array.isArray(data.data)) {
          // { data: [...] } format
          apiAlerts = data.data;
        } else if (data.alerts && Array.isArray(data.alerts)) {
          // { alerts: [...] } format
          apiAlerts = data.alerts;
        }
        console.log('getAllAlerts: Parsed API alerts count:', apiAlerts.length);

        // Get localStorage alerts (including demo data if nothing exists)
        const localAlerts = getStoredAlerts();
        console.log('getAllAlerts: localStorage alerts count:', localAlerts.length);

        // Find alerts that exist only in localStorage (created offline)
        const localOnlyAlerts = localAlerts.filter(localAlert =>
          // localStorage-generated IDs start with 'alert_' or 'demo_'
          (localAlert.id.startsWith('alert_') || localAlert.id.startsWith('demo_')) &&
          !apiAlerts.some((apiAlert: CurrencyAlert) => apiAlert.id === localAlert.id)
        );
        console.log('getAllAlerts: Local-only alerts found:', localOnlyAlerts.length);

        // Merge: API alerts + local-only alerts
        const mergedAlerts = [...apiAlerts, ...localOnlyAlerts];
        console.log('getAllAlerts: Total merged alerts:', mergedAlerts.length);
        saveStoredAlerts(mergedAlerts);

        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedAlerts = mergedAlerts.slice(start, end);

        return {
          data: paginatedAlerts,
          page,
          limit,
          total: mergedAlerts.length,
          total_pages: Math.ceil(mergedAlerts.length / limit)
        };
      },
      () => {
        // Fallback to localStorage
        console.log('getAllAlerts: Using localStorage fallback');
        const alerts = getStoredAlerts();
        console.log('getAllAlerts localStorage fallback - total alerts in storage:', alerts.length);
        console.log('getAllAlerts localStorage fallback - alerts:', alerts);
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedAlerts = alerts.slice(start, end);
        console.log('getAllAlerts localStorage fallback - paginated alerts:', paginatedAlerts.length);

        const result = {
          data: paginatedAlerts,
          page,
          limit,
          total: alerts.length,
          total_pages: Math.ceil(alerts.length / limit)
        };
        console.log('getAllAlerts localStorage fallback - returning:', result);
        return result;
      },
      'Failed to fetch alerts from API'
    );
  },

  /**
   * Get a single alert by ID with localStorage fallback
   */
  getAlertById: async (id: string): Promise<CurrencyAlert> => {
    return withFallback(
      async () => {
        const response = await api.request(`${ALERTS_BASE_PATH}/${id}`);
        return response.data || response;
      },
      () => {
        const alerts = getStoredAlerts();
        const alert = alerts.find(a => a.id === id);
        if (!alert) {
          throw new Error(`Alert with id ${id} not found`);
        }
        return alert;
      },
      `Failed to fetch alert ${id} from API`
    );
  },

  /**
   * Create a new alert with localStorage fallback
   */
  createAlert: async (data: CurrencyAlertFormData & { is_active?: boolean }): Promise<CurrencyAlert> => {
    return withFallback(
      async () => {
        // Try including user_id from the profile if available
        const userProfile = localStorage.getItem('userProfile');
        let userId = null;
        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile);
            userId = profile.id;
          } catch (e) {
            console.warn('Could not parse user profile');
          }
        }

        // Send only the essential fields that match the backend schema
        const alertData: any = {
          name: data.name.trim(),
          base_currency: data.base_currency,
          target_currency: data.target_currency,
          alert_type: data.alert_type,
          threshold: Number(data.threshold), // Ensure it's a number
          is_active: Boolean(data.is_active ?? true),
          // Removed frequency, email_notification, push_notification - not in DB schema
        };

        // Add user_id if we have it (backend might require it explicitly)
        if (userId) {
          alertData.user_id = userId;
        }

        console.log('Sending alert data to API:', alertData);
        console.log('API endpoint:', ALERTS_BASE_PATH);
        console.log('Has auth token:', !!api.getToken());

        const response = await api.request(ALERTS_BASE_PATH, {
          method: 'POST',
          body: JSON.stringify(alertData),
        });
        
        const newAlert = response.data || response;
        // Sync with localStorage on successful creation
        const alerts = getStoredAlerts();
        saveStoredAlerts([...alerts, newAlert]);
        
        return newAlert;
      },
      () => {
        // Fallback to localStorage
        console.log('createAlert: Using localStorage fallback');
        const now = new Date().toISOString();
        const newAlert: CurrencyAlert = {
          id: generateId(),
          user_id: 'local_user',
          name: data.name,
          base_currency: data.base_currency,
          target_currency: data.target_currency,
          alert_type: data.alert_type,
          threshold: data.threshold,
          frequency: data.frequency,
          is_active: data.is_active ?? true,
          email_notification: data.email_notification,
          push_notification: data.push_notification,
          current_rate: 0, // Will be updated when API is available
          last_triggered_at: null,
          trigger_count: 0,
          metadata: {
            created_from: 'web_app',
            user_agent: navigator.userAgent,
            timestamp: now,
          },
          created_at: now,
          updated_at: now,
        };
        console.log('createAlert localStorage fallback - new alert:', newAlert);

        const alerts = getStoredAlerts();
        console.log('createAlert localStorage fallback - existing alerts:', alerts.length);
        const updatedAlerts = [...alerts, newAlert];
        console.log('createAlert localStorage fallback - updated alerts count:', updatedAlerts.length);
        saveStoredAlerts(updatedAlerts);

        return newAlert;
      },
      'Failed to create alert via API'
    );
  },

  /**
   * Update an existing alert with localStorage fallback
   */
  updateAlert: async (id: string, data: UpdateAlertRequest): Promise<CurrencyAlert> => {
    return withFallback(
      async () => {
        // Filter out fields that don't exist in the database schema
        const filteredData: any = {};
        if (data.name !== undefined) filteredData.name = data.name;
        if (data.base_currency !== undefined) filteredData.base_currency = data.base_currency;
        if (data.target_currency !== undefined) filteredData.target_currency = data.target_currency;
        if (data.alert_type !== undefined) filteredData.alert_type = data.alert_type;
        if (data.threshold !== undefined) filteredData.threshold = Number(data.threshold);
        if (data.is_active !== undefined) filteredData.is_active = Boolean(data.is_active);
        // Removed frequency, email_notification, push_notification - not in DB schema

        const response = await api.request(`${ALERTS_BASE_PATH}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(filteredData),
        });
        
        const updatedAlert = response.data || response;
        // Sync with localStorage on successful update
        const alerts = getStoredAlerts();
        const updatedAlerts = alerts.map(alert => 
          alert.id === id ? updatedAlert : alert
        );
        saveStoredAlerts(updatedAlerts);
        
        return updatedAlert;
      },
      () => {
        // Fallback to localStorage
        const alerts = getStoredAlerts();
        const alertIndex = alerts.findIndex(alert => alert.id === id);
        
        if (alertIndex === -1) {
          throw new Error(`Alert with id ${id} not found`);
        }
        
        const updatedAlert = {
          ...alerts[alertIndex],
          ...data,
          updated_at: new Date().toISOString(),
        };
        
        const updatedAlerts = [...alerts];
        updatedAlerts[alertIndex] = updatedAlert;
        saveStoredAlerts(updatedAlerts);
        
        return updatedAlert;
      },
      `Failed to update alert ${id} via API`
    );
  },

  /**
   * Delete an alert with localStorage fallback
   */
  deleteAlert: async (id: string): Promise<void> => {
    return withFallback(
      async () => {
        await api.request(`${ALERTS_BASE_PATH}/${id}`, {
          method: 'DELETE',
        });
        
        // Sync with localStorage on successful deletion
        const alerts = getStoredAlerts();
        const filteredAlerts = alerts.filter(alert => alert.id !== id);
        saveStoredAlerts(filteredAlerts);
      },
      () => {
        // Fallback to localStorage
        const alerts = getStoredAlerts();
        const alertExists = alerts.some(alert => alert.id === id);
        
        if (!alertExists) {
          throw new Error(`Alert with id ${id} not found`);
        }
        
        const filteredAlerts = alerts.filter(alert => alert.id !== id);
        saveStoredAlerts(filteredAlerts);
      },
      `Failed to delete alert ${id} via API`
    );
  },

  /**
   * Toggle alert active status
   */
  toggleAlertStatus: async (id: string, isActive: boolean): Promise<CurrencyAlert> => {
    return currencyAlertApi.updateAlert(id, { is_active: isActive });
  },

  /**
   * Get alerts by currency pair
   */
  getAlertsByCurrencyPair: async (
    baseCurrency: string, 
    targetCurrency: string
  ): Promise<CurrencyAlert[]> => {
    try {
      const response = await api.request(
        `${ALERTS_BASE_PATH}/pair/${baseCurrency}/${targetCurrency}`
      );
      return response.data || response;
    } catch (error) {
      console.error(`Failed to fetch alerts for ${baseCurrency}/${targetCurrency}:`, error);
      throw error;
    }
  },

  /**
   * Test an alert (trigger it manually for testing)
   */
  testAlert: async (id: string): Promise<{ success: boolean; message: string }> => {
    return withFallback(
      async () => {
        const response = await api.request(`${ALERTS_BASE_PATH}/${id}/test`, {
          method: 'POST',
        });
        return response.data || response;
      },
      () => {
        // Mock test response for localStorage fallback
        return {
          success: true,
          message: 'Test alert sent successfully (simulated)'
        };
      },
      `Failed to test alert ${id} via API`
    );
  },

  /**
   * Get alert history/logs
   */
  getAlertHistory: async (id: string): Promise<any[]> => {
    try {
      const response = await api.request(`${ALERTS_BASE_PATH}/${id}/history`);
      return response.data || response;
    } catch (error) {
      console.error(`Failed to fetch alert ${id} history:`, error);
      throw error;
    }
  },

  /**
   * Bulk update alerts
   */
  bulkUpdateAlerts: async (
    ids: string[], 
    data: UpdateAlertRequest
  ): Promise<CurrencyAlert[]> => {
    try {
      const response = await api.request(`${ALERTS_BASE_PATH}/bulk-update`, {
        method: 'PUT',
        body: JSON.stringify({ ids, data }),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to bulk update alerts:', error);
      throw error;
    }
  },

  /**
   * Get user's alert statistics
   */
  getAlertStats: async (): Promise<{
    total: number;
    active: number;
    triggered_today: number;
    most_watched_pair: string;
  }> => {
    try {
      const response = await api.request(`${ALERTS_BASE_PATH}/stats`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch alert statistics:', error);
      throw error;
    }
  },
};

// Export for convenience
export default currencyAlertApi;