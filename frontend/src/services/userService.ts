/**
 * User Service
 * Handles all user profile and account management related API calls
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: Date;
  phone?: string;
  timezone: string;
  locale: string;
  theme: 'light' | 'dark' | 'auto';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showBirthday: boolean;
    allowDataCollection: boolean;
    allowMarketing: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    reminders: boolean;
    achievements: boolean;
    social: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
    units: {
      weight: 'kg' | 'lbs';
      height: 'cm' | 'ft';
      distance: 'km' | 'miles';
      temperature: 'celsius' | 'fahrenheit';
    };
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number; // in minutes
    allowedDevices: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  profile: {
    completionPercentage: number;
    joinedDaysAgo: number;
    lastActiveDate: Date;
  };
  health: {
    totalMetrics: number;
    recentEntries: number;
    streak: number;
  };
  fitness: {
    totalWorkouts: number;
    totalExerciseTime: number;
    currentStreak: number;
  };
  finance: {
    totalExpenses: number;
    totalIncome: number;
    budgetsCount: number;
  };
  meditation: {
    totalSessions: number;
    totalMeditationTime: number;
    currentStreak: number;
  };
  travel: {
    totalPlans: number;
    completedTrips: number;
    countriesVisited: number;
  };
  achievements: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      description: string;
      unlockedAt: Date;
    }>;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'workout' | 'meditation' | 'expense' | 'health_log' | 'travel_plan' | 'achievement' | 'profile_update' | 'settings_change';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
}

export interface UserGoal {
  id: string;
  userId: string;
  category: 'health' | 'fitness' | 'finance' | 'meditation' | 'travel' | 'personal';
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones?: Array<{
    id: string;
    title: string;
    value: number;
    completedAt?: Date;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: Record<string, any>;
  isHidden: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
  progress?: number;
  metadata?: Record<string, any>;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: 'google' | 'apple' | 'facebook' | 'strava' | 'fitbit' | 'myfitnesspal' | 'garmin' | 'polar';
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  accessToken?: string; // encrypted
  refreshToken?: string; // encrypted
  scopes: string[];
  isActive: boolean;
  lastSyncAt?: Date;
  connectedAt: Date;
  expiresAt?: Date;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class UserService {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.getProfile();
      return response.user || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_PROFILE_FETCH_FAILED'
      );
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.updateProfile(profileData);
      return response.user || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_PROFILE_UPDATE_FAILED'
      );
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      return await api.request('/user/avatar', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AVATAR_UPLOAD_FAILED'
      );
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<void> {
    try {
      await api.request('/user/avatar', {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AVATAR_DELETE_FAILED'
      );
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      return await api.request('/user/settings');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_SETTINGS_FETCH_FAILED'
      );
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      return await api.request('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_SETTINGS_UPDATE_FAILED'
      );
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      return await api.request('/user/stats');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_STATS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivity(params?: QueryParams): Promise<{ activities: UserActivity[]; total: number }> {
    try {
      return await api.request(`/user/activity${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_ACTIVITY_FETCH_FAILED'
      );
    }
  }

  /**
   * Get user goals
   */
  async getUserGoals(params?: QueryParams & { status?: string; category?: string }): Promise<{ data: UserGoal[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/user/goals${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.goals) {
        return {
          data: response.goals,
          total: response.total || response.goals.length,
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
        'USER_GOALS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create user goal
   */
  async createUserGoal(goalData: Omit<UserGoal, 'id' | 'userId' | 'currentValue' | 'createdAt' | 'updatedAt'>): Promise<UserGoal> {
    try {
      return await api.request('/user/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_GOAL_CREATE_FAILED'
      );
    }
  }

  /**
   * Update user goal
   */
  async updateUserGoal(id: string, goalData: Partial<UserGoal>): Promise<UserGoal> {
    try {
      return await api.request(`/user/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_GOAL_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete user goal
   */
  async deleteUserGoal(id: string): Promise<void> {
    try {
      await api.request(`/user/goals/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_GOAL_DELETE_FAILED'
      );
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(id: string, progress: number): Promise<UserGoal> {
    try {
      return await api.request(`/user/goals/${id}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ progress }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'GOAL_PROGRESS_UPDATE_FAILED'
      );
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(params?: QueryParams & { category?: string; rarity?: string }): Promise<{ data: UserAchievement[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/user/achievements${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.achievements) {
        return {
          data: response.achievements,
          total: response.total || response.achievements.length,
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
        'USER_ACHIEVEMENTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get all available achievements
   */
  async getAvailableAchievements(params?: QueryParams & { category?: string; rarity?: string }): Promise<{ achievements: Achievement[]; total: number }> {
    try {
      return await api.request(`/achievements${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACHIEVEMENTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get connected accounts
   */
  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    try {
      const response = await api.request('/user/connected-accounts');
      return response.accounts || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CONNECTED_ACCOUNTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Connect external account
   */
  async connectAccount(provider: string, authCode: string): Promise<ConnectedAccount> {
    try {
      return await api.request('/user/connected-accounts', {
        method: 'POST',
        body: JSON.stringify({ provider, authCode }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACCOUNT_CONNECTION_FAILED'
      );
    }
  }

  /**
   * Disconnect external account
   */
  async disconnectAccount(id: string): Promise<void> {
    try {
      await api.request(`/user/connected-accounts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACCOUNT_DISCONNECTION_FAILED'
      );
    }
  }

  /**
   * Sync data from connected account
   */
  async syncConnectedAccount(id: string): Promise<{ synced: boolean; message: string }> {
    try {
      return await api.request(`/user/connected-accounts/${id}/sync`, {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACCOUNT_SYNC_FAILED'
      );
    }
  }

  /**
   * Get account export data
   */
  async exportUserData(format: 'json' | 'csv' = 'json'): Promise<{ downloadUrl: string; expiresAt: Date }> {
    try {
      return await api.request(`/user/export?format=${format}`, {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_DATA_EXPORT_FAILED'
      );
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      return await api.request('/user/delete', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACCOUNT_DELETION_FAILED'
      );
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{ qrCode: string; backupCodes: string[]; secret: string }> {
    try {
      return await api.request('/user/2fa/enable', {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TWO_FACTOR_ENABLE_FAILED'
      );
    }
  }

  /**
   * Verify and confirm two-factor authentication setup
   */
  async verifyTwoFactor(token: string): Promise<{ enabled: boolean; backupCodes: string[] }> {
    try {
      return await api.request('/user/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TWO_FACTOR_VERIFY_FAILED'
      );
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(password: string): Promise<{ disabled: boolean }> {
    try {
      return await api.request('/user/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TWO_FACTOR_DISABLE_FAILED'
      );
    }
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<{ backupCodes: string[] }> {
    try {
      return await api.request('/user/2fa/backup-codes', {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BACKUP_CODES_GENERATION_FAILED'
      );
    }
  }

  // ============================================
  // APP PREFERENCES (Onboarding App Selection)
  // ============================================

  /**
   * Get user's app preferences (selected apps for onboarding)
   */
  async getAppPreferences(): Promise<AppPreferencesResponse> {
    try {
      return await api.request('/users/app-preferences');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APP_PREFERENCES_FETCH_FAILED'
      );
    }
  }

  /**
   * Update user's app preferences (selected apps)
   */
  async updateAppPreferences(
    selectedApps: string[],
    appOnboardingCompleted: boolean = true
  ): Promise<AppPreferencesResponse> {
    try {
      return await api.request('/users/app-preferences', {
        method: 'PUT',
        body: JSON.stringify({ selectedApps, appOnboardingCompleted }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APP_PREFERENCES_UPDATE_FAILED'
      );
    }
  }
}

// App Preferences Interface
export interface AppPreferencesResponse {
  selectedApps: string[];
  appOnboardingCompleted: boolean;
  updatedAt: string;
}

export const userService = new UserService();