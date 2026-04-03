/**
 * Notification Service
 * Handles all notification and reminder related API calls
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'achievement' | 'system' | 'social' | 'health' | 'fitness' | 'finance' | 'travel' | 'meditation';
  title: string;
  message: string;
  data?: Record<string, any>; // Additional data for the notification
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  actionUrl?: string; // URL to navigate when notification is clicked
  actionLabel?: string; // Label for the action button
  imageUrl?: string;
  expiresAt?: Date;
  readAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'medication' | 'appointment' | 'workout' | 'meditation' | 'habit' | 'task' | 'bill' | 'custom';
  scheduledFor: Date;
  isRecurring: boolean;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number; // Every N days/weeks/months/years
    daysOfWeek?: number[]; // 0-6, Sunday = 0 (for weekly)
    dayOfMonth?: number; // 1-31 (for monthly)
    endDate?: Date;
    endAfterOccurrences?: number;
  };
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  snoozeUntil?: Date;
  snoozeDuration?: number; // in minutes
  notificationSettings: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
    advanceNotice: number; // minutes before
  };
  metadata?: Record<string, any>; // Additional data specific to reminder type
  completedAt?: Date;
  lastTriggered?: Date;
  nextTrigger?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  preferences: {
    push: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      categories: {
        reminders: boolean;
        achievements: boolean;
        system: boolean;
        social: boolean;
        health: boolean;
        fitness: boolean;
        finance: boolean;
        travel: boolean;
        meditation: boolean;
      };
    };
    email: {
      enabled: boolean;
      frequency: 'instant' | 'daily' | 'weekly' | 'never';
      categories: {
        reminders: boolean;
        achievements: boolean;
        system: boolean;
        social: boolean;
        health: boolean;
        fitness: boolean;
        finance: boolean;
        travel: boolean;
        meditation: boolean;
      };
    };
    sms: {
      enabled: boolean;
      categories: {
        reminders: boolean;
        critical: boolean;
      };
      phoneNumber?: string;
    };
    quietHours: {
      enabled: boolean;
      startTime: string; // HH:mm format
      endTime: string; // HH:mm format
      timezone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recent: Notification[];
}

export interface ReminderSummary {
  total: number;
  active: number;
  overdue: number;
  upcoming: number;
  completed: number;
  byType: Record<string, number>;
  nextReminders: Reminder[];
}

export interface QueryParams {
  page?: number;
  limit?: number;
  type?: string;
  is_read?: boolean;
  priority?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class NotificationService {
  /**
   * Get user's notifications
   */
  async getNotifications(params?: QueryParams): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getNotifications(params);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.notifications) {
        return {
          data: response.notifications,
          total: response.total || response.notifications.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Fallback: wrap response in data field
      return {
        data: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    try {
      return await api.request(`/notifications/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_FETCH_FAILED'
      );
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<Notification> {
    try {
      return await api.markNotificationRead(id);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_MARK_READ_FAILED'
      );
    }
  }

  /**
   * Mark notification as unread
   */
  async markNotificationUnread(id: string): Promise<Notification> {
    try {
      return await api.request(`/notifications/${id}/unread`, {
        method: 'PUT',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_MARK_UNREAD_FAILED'
      );
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(id: string): Promise<Notification> {
    try {
      return await api.request(`/notifications/${id}/archive`, {
        method: 'PUT',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_ARCHIVE_FAILED'
      );
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await api.request(`/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_DELETE_FAILED'
      );
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<{ updated: number }> {
    try {
      return await api.request('/notifications/mark-all-read', {
        method: 'PUT',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MARK_ALL_READ_FAILED'
      );
    }
  }

  /**
   * Get notifications summary
   */
  async getNotificationSummary(): Promise<NotificationSummary> {
    try {
      return await api.request('/notifications/summary');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_SUMMARY_FAILED'
      );
    }
  }

  /**
   * Get user's reminders
   */
  async getReminders(params?: QueryParams & { includeCompleted?: boolean; overdue?: boolean }): Promise<{ data: Reminder[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getReminders(params);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.reminders) {
        return {
          data: response.reminders,
          total: response.total || response.reminders.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Fallback: wrap response in data field
      return {
        data: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDERS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get reminder by ID
   */
  async getReminder(id: string): Promise<Reminder> {
    try {
      return await api.request(`/reminders/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_FETCH_FAILED'
      );
    }
  }

  /**
   * Create reminder
   */
  async createReminder(reminderData: Omit<Reminder, 'id' | 'userId' | 'lastTriggered' | 'nextTrigger' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    try {
      return await api.createReminder(reminderData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_CREATE_FAILED'
      );
    }
  }

  /**
   * Update reminder
   */
  async updateReminder(id: string, reminderData: Partial<Reminder>): Promise<Reminder> {
    try {
      return await api.updateReminder(id, reminderData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete reminder
   */
  async deleteReminder(id: string): Promise<void> {
    try {
      await api.deleteReminder(id);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_DELETE_FAILED'
      );
    }
  }

  /**
   * Complete/dismiss reminder
   */
  async completeReminder(id: string): Promise<Reminder> {
    try {
      return await api.request(`/reminders/${id}/complete`, {
        method: 'PUT',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_COMPLETE_FAILED'
      );
    }
  }

  /**
   * Snooze reminder
   */
  async snoozeReminder(id: string, duration: number): Promise<Reminder> {
    try {
      return await api.request(`/reminders/${id}/snooze`, {
        method: 'PUT',
        body: JSON.stringify({ duration }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_SNOOZE_FAILED'
      );
    }
  }

  /**
   * Get reminders summary
   */
  async getReminderSummary(): Promise<ReminderSummary> {
    try {
      return await api.request('/reminders/summary');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_SUMMARY_FAILED'
      );
    }
  }

  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(hours: number = 24): Promise<Reminder[]> {
    try {
      const response = await api.request(`/reminders/upcoming?hours=${hours}`);
      return response.reminders || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'UPCOMING_REMINDERS_FAILED'
      );
    }
  }

  /**
   * Get overdue reminders
   */
  async getOverdueReminders(): Promise<Reminder[]> {
    try {
      const response = await api.request('/reminders/overdue');
      return response.reminders || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'OVERDUE_REMINDERS_FAILED'
      );
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      return await api.request('/notifications/preferences');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_PREFERENCES_FETCH_FAILED'
      );
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences['preferences']>): Promise<NotificationPreferences> {
    try {
      return await api.request('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ preferences }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NOTIFICATION_PREFERENCES_UPDATE_FAILED'
      );
    }
  }

  /**
   * Test notification settings (sends a test notification)
   */
  async testNotificationSettings(channels: Array<'push' | 'email' | 'sms'>): Promise<{ sent: string[]; failed: string[] }> {
    try {
      return await api.request('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ channels }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEST_NOTIFICATION_FAILED'
      );
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(deviceToken: string, deviceType: 'ios' | 'android' | 'web'): Promise<{ success: boolean }> {
    try {
      return await api.request('/notifications/devices', {
        method: 'POST',
        body: JSON.stringify({ deviceToken, deviceType }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'DEVICE_REGISTRATION_FAILED'
      );
    }
  }

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(deviceToken: string): Promise<{ success: boolean }> {
    try {
      return await api.request('/notifications/devices', {
        method: 'DELETE',
        body: JSON.stringify({ deviceToken }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'DEVICE_UNREGISTRATION_FAILED'
      );
    }
  }

  /**
   * Send custom notification (for testing or admin use)
   */
  async sendCustomNotification(notificationData: {
    title: string;
    message: string;
    type?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    actionUrl?: string;
    actionLabel?: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    try {
      return await api.request('/notifications/custom', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CUSTOM_NOTIFICATION_SEND_FAILED'
      );
    }
  }
}

export const notificationService = new NotificationService();