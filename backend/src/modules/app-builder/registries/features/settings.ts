/**
 * Settings Feature Definition
 *
 * User settings, preferences, and profile management functionality.
 * This is a universal feature included in all app types.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SETTINGS_FEATURE: FeatureDefinition = {
  id: 'settings',
  name: 'Settings',
  category: 'utility',
  description: 'User settings, preferences, and profile management',
  icon: 'settings',

  includedInAppTypes: [
    // E-commerce & Marketplace
    'ecommerce',
    'marketplace',
    'multi-vendor',
    'dropshipping',
    'subscription-box',
    'digital-products',
    'auction',

    // Business & Professional
    'saas',
    'crm',
    'erp',
    'project-management',
    'freelance',
    'agency',
    'consulting',
    'invoicing',
    'booking',
    'appointment',

    // Social & Community
    'social-network',
    'community',
    'forum',
    'dating',
    'networking',

    // Content & Media
    'blog',
    'news',
    'magazine',
    'podcast',
    'video-streaming',
    'music-streaming',
    'photo-gallery',
    'portfolio',

    // Education & Learning
    'lms',
    'course-platform',
    'tutoring',
    'quiz-app',
    'knowledge-base',

    // Health & Fitness
    'fitness',
    'health-tracking',
    'meditation',
    'nutrition',
    'telemedicine',

    // Finance & Productivity
    'finance',
    'expense-tracker',
    'budget-planner',
    'investment',
    'crypto',
    'todo',
    'notes',
    'calendar',

    // Real Estate & Travel
    'real-estate',
    'property-management',
    'travel',
    'hotel-booking',
    'car-rental',

    // Food & Delivery
    'food-delivery',
    'restaurant',
    'recipe',
    'meal-planning',

    // Jobs & Services
    'job-board',
    'freelance-marketplace',
    'service-marketplace',
    'gig-economy',

    // Events & Entertainment
    'event-management',
    'ticketing',
    'gaming',
    'sports',

    // Utilities & Tools
    'dashboard',
    'analytics',
    'monitoring',
    'automation',
    'integration',

    // Communication
    'chat',
    'messaging',
    'email-client',
    'helpdesk',
    'support-ticket',

    // Other
    'directory',
    'review-platform',
    'survey',
    'poll',
    'custom',
  ],

  activationKeywords: [
    'settings',
    'preferences',
    'configuration',
    'options',
    'profile settings',
    'user settings',
    'app settings',
    'account settings',
    'config',
    'customize',
    'personalization',
    'user preferences',
    'theme settings',
    'privacy settings',
    'notification settings',
    'security settings',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'settings',
      route: '/settings',
      section: 'frontend',
      title: 'Settings',
      authRequired: true,
      templateId: 'settings-page',
      components: [
        'settings-form',
        'settings-section',
        'toggle-setting',
        'theme-selector',
      ],
      layout: 'default',
    },
    {
      id: 'profile-settings',
      route: '/settings/profile',
      section: 'frontend',
      title: 'Profile Settings',
      authRequired: true,
      templateId: 'profile-settings',
      components: [
        'profile-editor',
        'avatar-upload',
        'settings-form',
        'settings-section',
      ],
      layout: 'default',
    },
    {
      id: 'account-settings',
      route: '/settings/account',
      section: 'frontend',
      title: 'Account Settings',
      authRequired: true,
      templateId: 'account-settings',
      components: [
        'settings-form',
        'settings-section',
        'toggle-setting',
        'email-change-form',
      ],
      layout: 'default',
    },
    {
      id: 'security-settings',
      route: '/settings/security',
      section: 'frontend',
      title: 'Security Settings',
      authRequired: true,
      templateId: 'security-settings',
      components: [
        'password-change',
        'two-factor-setup',
        'session-manager',
        'settings-section',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Core settings components
    'settings-form',
    'settings-section',
    'toggle-setting',

    // Profile components
    'profile-editor',
    'avatar-upload',

    // Security components
    'password-change',
    'two-factor-setup',
    'session-manager',

    // Theme components
    'theme-selector',
    'color-scheme-picker',

    // Account components
    'email-change-form',
    'delete-account-button',

    // Notification preferences
    'notification-preferences',
    'email-preferences',
    'push-preferences',

    // Privacy components
    'privacy-settings',
    'data-export-button',
  ],

  entities: [
    {
      name: 'user_settings',
      displayName: 'User Settings',
      description: 'User preferences and settings storage',
      isCore: true,
    },
  ],

  apiRoutes: [
    // General settings routes
    {
      method: 'GET',
      path: '/settings',
      auth: true,
      handler: 'crud',
      entity: 'user_settings',
      operation: 'get',
      description: 'Get user settings',
    },
    {
      method: 'PUT',
      path: '/settings',
      auth: true,
      handler: 'crud',
      entity: 'user_settings',
      operation: 'update',
      description: 'Update user settings',
    },

    // Profile settings routes
    {
      method: 'GET',
      path: '/settings/profile',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Get profile settings',
    },
    {
      method: 'PUT',
      path: '/settings/profile',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Update profile settings',
    },

    // Password change route
    {
      method: 'PUT',
      path: '/settings/password',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Change user password',
    },

    // Theme settings route
    {
      method: 'PUT',
      path: '/settings/theme',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Update theme preferences',
    },

    // Notification preferences
    {
      method: 'GET',
      path: '/settings/notifications',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Get notification preferences',
    },
    {
      method: 'PUT',
      path: '/settings/notifications',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Update notification preferences',
    },

    // Privacy settings
    {
      method: 'GET',
      path: '/settings/privacy',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Get privacy settings',
    },
    {
      method: 'PUT',
      path: '/settings/privacy',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Update privacy settings',
    },

    // Data export
    {
      method: 'POST',
      path: '/settings/export-data',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Request data export',
    },

    // Account deletion
    {
      method: 'DELETE',
      path: '/settings/account',
      auth: true,
      handler: 'custom',
      entity: 'user_settings',
      description: 'Delete user account',
    },
  ],

  config: [
    {
      key: 'allowThemeChange',
      label: 'Allow Theme Change',
      type: 'boolean',
      default: true,
      description: 'Allow users to change the app theme',
    },
    {
      key: 'allowPasswordChange',
      label: 'Allow Password Change',
      type: 'boolean',
      default: true,
      description: 'Allow users to change their password',
    },
    {
      key: 'allowProfileEdit',
      label: 'Allow Profile Edit',
      type: 'boolean',
      default: true,
      description: 'Allow users to edit their profile information',
    },
    {
      key: 'allowAccountDeletion',
      label: 'Allow Account Deletion',
      type: 'boolean',
      default: true,
      description: 'Allow users to delete their account',
    },
    {
      key: 'enableTwoFactorAuth',
      label: 'Enable Two-Factor Authentication',
      type: 'boolean',
      default: false,
      description: 'Enable two-factor authentication option',
    },
    {
      key: 'enableDataExport',
      label: 'Enable Data Export',
      type: 'boolean',
      default: true,
      description: 'Allow users to export their data (GDPR compliance)',
    },
    {
      key: 'defaultTheme',
      label: 'Default Theme',
      type: 'select',
      default: 'system',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ],
      description: 'Default theme for new users',
    },
  ],
};
