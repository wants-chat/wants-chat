/**
 * Services Index
 * Central export for all API services
 */

// Export services
export { authService } from './authService';
export { notificationService } from './notificationService';
export { userService } from './userService';
export { socketService } from './socketService';

// Export types from authService
export type {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordData,
} from './authService';

// Export types from notificationService
export type {
  Notification,
  Reminder,
  NotificationPreferences,
  NotificationSummary,
  ReminderSummary,
} from './notificationService';

// Export types from userService
export type {
  UserProfile,
  UserSettings,
  UserStats,
  UserActivity,
  UserGoal,
  Achievement,
  UserAchievement,
  ConnectedAccount,
} from './userService';
