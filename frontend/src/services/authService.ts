/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.login(credentials.email, credentials.password);
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LOGIN_FAILED'
      );
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await api.register(
        registerData.email,
        registerData.password,
        registerData.name
      );
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REGISTER_FAILED'
      );
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await api.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
      // Always clear local tokens even if server request fails
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.getProfile();
      return response.user || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROFILE_FETCH_FAILED'
      );
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await api.updateProfile(profileData);
      return response.user || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROFILE_UPDATE_FAILED'
      );
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    try {
      return await api.request('/auth/password/reset-request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PASSWORD_RESET_REQUEST_FAILED'
      );
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ success: boolean; message: string }> {
    try {
      return await api.request('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({
          token: data.token,
          password: data.newPassword,
        }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PASSWORD_RESET_CONFIRM_FAILED'
      );
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      return await api.request('/auth/password/change', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PASSWORD_CHANGE_FAILED'
      );
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      return await api.request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMAIL_VERIFICATION_FAILED'
      );
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<{ message: string }> {
    try {
      return await api.request('/auth/verify-email/resend', {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMAIL_RESEND_FAILED'
      );
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      return await api.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: api.getRefreshToken(),
        }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 401,
        'TOKEN_REFRESH_FAILED'
      );
    }
  }
}

export const authService = new AuthService();