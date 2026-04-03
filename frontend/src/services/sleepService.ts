/**
 * Sleep Tracking Service
 * Handles all sleep tracking API calls
 */

import { api } from '../lib/api';
import type {
  SleepLog,
  CreateSleepLogRequest,
  UpdateSleepLogRequest,
  SleepLogQueryParams,
  PaginatedSleepLogs,
  SleepGoal,
  CreateSleepGoalRequest,
  UpdateSleepGoalRequest,
  SleepGoalProgress,
  SleepAlarm,
  CreateSleepAlarmRequest,
  UpdateSleepAlarmRequest,
  OptimalWakeTime,
  BedtimeReminder,
  CreateBedtimeReminderRequest,
  UpdateBedtimeReminderRequest,
  SleepSummary,
  SleepSummaryQueryParams
} from '../types/health/sleep';

// Helper to build query string from params
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

class SleepService {
  // ============================================
  // SLEEP LOGS
  // ============================================

  /**
   * Create a new sleep log
   */
  async createSleepLog(data: CreateSleepLogRequest): Promise<SleepLog> {
    const response = await api.request('/health/sleep-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Get all sleep logs with pagination and filters
   */
  async getSleepLogs(params?: SleepLogQueryParams): Promise<PaginatedSleepLogs> {
    const queryString = buildQueryString(params);
    const response = await api.request(`/health/sleep-logs${queryString}`);
    // Return full paginated response, don't extract data
    return response;
  }

  /**
   * Get sleep log by ID
   */
  async getSleepLogById(id: string): Promise<SleepLog> {
    const response = await api.request(`/health/sleep-logs/${id}`);
    return response.data || response;
  }

  /**
   * Get the latest sleep log
   */
  async getLatestSleepLog(): Promise<SleepLog | null> {
    const response = await api.request('/health/sleep-logs/latest');
    return response.data || response;
  }

  /**
   * Get sleep summary statistics
   */
  async getSleepSummary(params?: SleepSummaryQueryParams): Promise<SleepSummary> {
    const queryString = buildQueryString(params);
    const response = await api.request(`/health/sleep-logs/summary${queryString}`);
    return response.data || response;
  }

  /**
   * Update sleep log
   */
  async updateSleepLog(id: string, data: UpdateSleepLogRequest): Promise<SleepLog> {
    const response = await api.request(`/health/sleep-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Delete sleep log
   */
  async deleteSleepLog(id: string): Promise<void> {
    await api.request(`/health/sleep-logs/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // SLEEP GOALS
  // ============================================

  /**
   * Get user's sleep goals
   */
  async getSleepGoal(): Promise<SleepGoal | null> {
    const response = await api.request('/health/sleep-goals');
    return response.data || response;
  }

  /**
   * Create or update sleep goals
   */
  async createOrUpdateSleepGoal(data: CreateSleepGoalRequest): Promise<SleepGoal> {
    const response = await api.request('/health/sleep-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Update sleep goals
   */
  async updateSleepGoal(data: UpdateSleepGoalRequest): Promise<SleepGoal> {
    const response = await api.request('/health/sleep-goals', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Get sleep goal progress
   */
  async getSleepGoalProgress(): Promise<SleepGoalProgress> {
    const response = await api.request('/health/sleep-goals/progress');
    return response.data || response;
  }

  // ============================================
  // SLEEP ALARMS
  // ============================================

  /**
   * Create a new sleep alarm
   */
  async createSleepAlarm(data: CreateSleepAlarmRequest): Promise<SleepAlarm> {
    const response = await api.request('/health/sleep-alarms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Get all sleep alarms
   */
  async getSleepAlarms(): Promise<SleepAlarm[]> {
    const response = await api.request('/health/sleep-alarms');
    return response.data || response;
  }

  /**
   * Get sleep alarm by ID
   */
  async getSleepAlarmById(id: string): Promise<SleepAlarm> {
    const response = await api.request(`/health/sleep-alarms/${id}`);
    return response.data || response;
  }

  /**
   * Update sleep alarm
   */
  async updateSleepAlarm(id: string, data: UpdateSleepAlarmRequest): Promise<SleepAlarm> {
    const response = await api.request(`/health/sleep-alarms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Toggle sleep alarm active status
   */
  async toggleSleepAlarm(id: string): Promise<SleepAlarm> {
    const response = await api.request(`/health/sleep-alarms/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    return response.data || response;
  }

  /**
   * Delete sleep alarm
   */
  async deleteSleepAlarm(id: string): Promise<void> {
    await api.request(`/health/sleep-alarms/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Calculate optimal wake time based on bedtime
   */
  async calculateOptimalWakeTime(bedtime: string): Promise<OptimalWakeTime> {
    const queryString = buildQueryString({ bedtime });
    const response = await api.request(`/health/sleep-alarms/optimal-wake${queryString}`);
    return response.data || response;
  }

  // ============================================
  // BEDTIME REMINDERS
  // ============================================

  /**
   * Create a new bedtime reminder
   */
  async createBedtimeReminder(data: CreateBedtimeReminderRequest): Promise<BedtimeReminder> {
    const response = await api.request('/health/bedtime-reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Get all bedtime reminders
   */
  async getBedtimeReminders(): Promise<BedtimeReminder[]> {
    const response = await api.request('/health/bedtime-reminders');
    return response.data || response;
  }

  /**
   * Get bedtime reminder by ID
   */
  async getBedtimeReminderById(id: string): Promise<BedtimeReminder> {
    const response = await api.request(`/health/bedtime-reminders/${id}`);
    return response.data || response;
  }

  /**
   * Update bedtime reminder
   */
  async updateBedtimeReminder(id: string, data: UpdateBedtimeReminderRequest): Promise<BedtimeReminder> {
    const response = await api.request(`/health/bedtime-reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  /**
   * Toggle bedtime reminder active status
   */
  async toggleBedtimeReminder(id: string): Promise<BedtimeReminder> {
    const response = await api.request(`/health/bedtime-reminders/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    return response.data || response;
  }

  /**
   * Delete bedtime reminder
   */
  async deleteBedtimeReminder(id: string): Promise<void> {
    await api.request(`/health/bedtime-reminders/${id}`, {
      method: 'DELETE',
    });
  }
}

export const sleepService = new SleepService();
export default sleepService;
