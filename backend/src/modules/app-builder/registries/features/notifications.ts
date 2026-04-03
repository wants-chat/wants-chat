/**
 * Notifications Feature Definition
 *
 * Complete notifications functionality including push notifications,
 * in-app alerts, email notifications, and user notification preferences.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const NOTIFICATIONS_FEATURE: FeatureDefinition = {
  id: 'notifications',
  name: 'Notifications',
  category: 'communication',
  description: 'Push notifications, in-app alerts, and notification preferences',
  icon: 'bell',

  includedInAppTypes: [
    'ecommerce',
    'saas',
    'booking',
    'healthcare',
    'crm',
    'social',
    'marketplace',
    'education',
    'fitness',
    'fintech',
    'real-estate',
    'food-delivery',
    'travel',
    'project-management',
    'hr-management',
    'inventory',
    'logistics',
    'event-management',
    'subscription',
    'customer-support',
    'freelance',
    'agency',
    'consulting',
    'community',
  ],

  activationKeywords: [
    'notifications',
    'alerts',
    'push notifications',
    'notify',
    'bell',
    'notification center',
    'in-app notifications',
    'email alerts',
    'push alerts',
    'real-time alerts',
    'notification preferences',
    'notification settings',
    'alert system',
    'messaging',
    'reminders',
    'updates',
    'announcements',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'notifications-list',
      route: '/notifications',
      section: 'frontend',
      title: 'Notifications',
      authRequired: true,
      templateId: 'notifications-list',
      components: [
        'notification-list',
        'notification-card',
        'notification-badge',
        'notification-filters',
        'mark-all-read-button',
      ],
      layout: 'default',
    },
    {
      id: 'notification-settings',
      route: '/notifications/settings',
      section: 'frontend',
      title: 'Notification Settings',
      authRequired: true,
      templateId: 'settings-page',
      components: [
        'notification-preferences',
        'push-notification-toggle',
        'email-notification-toggle',
        'notification-categories',
        'quiet-hours-config',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Core notification components
    'notification-card',
    'notification-bell',
    'notification-list',
    'notification-preferences',
    'notification-badge',

    // Notification display components
    'notification-item',
    'notification-dropdown',
    'notification-toast',
    'notification-center',
    'notification-panel',

    // Filter and action components
    'notification-filters',
    'notification-categories',
    'mark-all-read-button',
    'clear-notifications-button',

    // Settings components
    'push-notification-toggle',
    'email-notification-toggle',
    'in-app-notification-toggle',
    'quiet-hours-config',
    'notification-sound-picker',

    // Empty states
    'empty-notifications',
  ],

  entities: [
    {
      name: 'notifications',
      displayName: 'Notifications',
      description: 'User notifications and alerts',
      isCore: true,
    },
    {
      name: 'notification_preferences',
      displayName: 'Notification Preferences',
      description: 'User notification preference settings',
      isCore: true,
    },
  ],

  apiRoutes: [
    // Notification CRUD Routes
    {
      method: 'GET',
      path: '/notifications',
      auth: true,
      handler: 'crud',
      entity: 'notifications',
      operation: 'list',
      description: 'List all notifications for the user',
    },
    {
      method: 'GET',
      path: '/notifications/:id',
      auth: true,
      handler: 'crud',
      entity: 'notifications',
      operation: 'get',
      description: 'Get a single notification by ID',
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      auth: true,
      handler: 'crud',
      entity: 'notifications',
      operation: 'delete',
      description: 'Delete a notification',
    },

    // Custom notification actions
    {
      method: 'PUT',
      path: '/notifications/:id/read',
      auth: true,
      handler: 'custom',
      entity: 'notifications',
      description: 'Mark a single notification as read',
    },
    {
      method: 'PUT',
      path: '/notifications/mark-all-read',
      auth: true,
      handler: 'custom',
      entity: 'notifications',
      description: 'Mark all notifications as read',
    },
    {
      method: 'DELETE',
      path: '/notifications/clear-all',
      auth: true,
      handler: 'custom',
      entity: 'notifications',
      description: 'Clear all notifications',
    },

    // Notification counts
    {
      method: 'GET',
      path: '/notifications/unread-count',
      auth: true,
      handler: 'custom',
      entity: 'notifications',
      description: 'Get count of unread notifications',
    },

    // Notification Preferences Routes
    {
      method: 'GET',
      path: '/notifications/preferences',
      auth: true,
      handler: 'crud',
      entity: 'notification_preferences',
      operation: 'get',
      description: 'Get user notification preferences',
    },
    {
      method: 'PUT',
      path: '/notifications/preferences',
      auth: true,
      handler: 'crud',
      entity: 'notification_preferences',
      operation: 'update',
      description: 'Update user notification preferences',
    },

    // Push notification subscription
    {
      method: 'POST',
      path: '/notifications/subscribe',
      auth: true,
      handler: 'custom',
      entity: 'notification_preferences',
      description: 'Subscribe to push notifications',
    },
    {
      method: 'POST',
      path: '/notifications/unsubscribe',
      auth: true,
      handler: 'custom',
      entity: 'notification_preferences',
      description: 'Unsubscribe from push notifications',
    },
  ],

  config: [
    {
      key: 'enablePush',
      label: 'Enable Push Notifications',
      type: 'boolean',
      default: true,
      description: 'Allow sending push notifications to users',
    },
    {
      key: 'enableEmail',
      label: 'Enable Email Notifications',
      type: 'boolean',
      default: true,
      description: 'Allow sending email notifications to users',
    },
    {
      key: 'enableInApp',
      label: 'Enable In-App Notifications',
      type: 'boolean',
      default: true,
      description: 'Show notifications within the application',
    },
    {
      key: 'retentionDays',
      label: 'Notification Retention (days)',
      type: 'number',
      default: 30,
      description: 'Number of days to keep notifications before auto-delete',
    },
    {
      key: 'maxNotificationsPerUser',
      label: 'Max Notifications Per User',
      type: 'number',
      default: 100,
      description: 'Maximum number of notifications to store per user',
    },
    {
      key: 'enableQuietHours',
      label: 'Enable Quiet Hours',
      type: 'boolean',
      default: false,
      description: 'Allow users to set quiet hours for notifications',
    },
    {
      key: 'defaultSound',
      label: 'Default Notification Sound',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'chime', label: 'Chime' },
        { value: 'bell', label: 'Bell' },
        { value: 'pop', label: 'Pop' },
        { value: 'none', label: 'Silent' },
      ],
      description: 'Default sound for notifications',
    },
  ],
};
