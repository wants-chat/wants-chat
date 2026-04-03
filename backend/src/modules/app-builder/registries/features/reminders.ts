/**
 * Reminders Feature Definition
 *
 * Automated reminders for appointments, tasks, events,
 * and follow-ups via email, SMS, or push notifications.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const REMINDERS_FEATURE: FeatureDefinition = {
  id: 'reminders',
  name: 'Reminders',
  category: 'booking',
  description: 'Automated reminders via email, SMS, and push notifications',
  icon: 'bell',

  includedInAppTypes: [
    'healthcare',
    'dental',
    'veterinary',
    'salon',
    'spa',
    'fitness',
    'consulting',
    'coaching',
    'tutoring',
    'legal',
    'accounting',
    'real-estate',
    'auto-service',
    'home-services',
    'task-management',
    'project-management',
    'crm',
  ],

  activationKeywords: [
    'reminders',
    'reminder',
    'appointment reminder',
    'notification',
    'alert',
    'follow-up',
    'scheduled reminder',
    'sms reminder',
    'email reminder',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth', 'notifications'],
  conflicts: [],

  pages: [
    {
      id: 'reminders-settings',
      route: '/reminders/settings',
      section: 'frontend',
      title: 'Reminder Settings',
      authRequired: true,
      templateId: 'reminders-settings',
      components: [
        'reminder-preferences',
        'channel-toggles',
        'timing-settings',
        'quiet-hours',
      ],
      layout: 'default',
    },
    {
      id: 'scheduled-reminders',
      route: '/reminders',
      section: 'frontend',
      title: 'Scheduled Reminders',
      authRequired: true,
      templateId: 'scheduled-reminders',
      components: [
        'reminders-list',
        'reminder-card',
        'create-reminder-button',
      ],
      layout: 'default',
    },
    {
      id: 'admin-reminders',
      route: '/admin/reminders',
      section: 'admin',
      title: 'Reminder Templates',
      authRequired: true,
      templateId: 'admin-reminders',
      components: [
        'template-list',
        'template-editor',
        'variable-picker',
        'preview-button',
      ],
      layout: 'dashboard',
    },
  ],

  components: [
    // User settings
    'reminder-preferences',
    'channel-toggles',
    'timing-settings',
    'quiet-hours',

    // Reminder list
    'reminders-list',
    'reminder-card',
    'create-reminder-button',
    'reminder-form',

    // Admin
    'template-list',
    'template-editor',
    'variable-picker',
    'preview-button',
    'send-test-button',
  ],

  entities: [
    {
      name: 'reminders',
      displayName: 'Reminders',
      description: 'Scheduled reminders',
      isCore: true,
    },
    {
      name: 'reminder_templates',
      displayName: 'Reminder Templates',
      description: 'Message templates',
      isCore: true,
    },
    {
      name: 'reminder_logs',
      displayName: 'Reminder Logs',
      description: 'Sent reminder history',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/reminders',
      auth: true,
      handler: 'crud',
      entity: 'reminders',
      operation: 'list',
      description: 'List reminders',
    },
    {
      method: 'POST',
      path: '/reminders',
      auth: true,
      handler: 'crud',
      entity: 'reminders',
      operation: 'create',
      description: 'Create reminder',
    },
    {
      method: 'PUT',
      path: '/reminders/:id',
      auth: true,
      handler: 'crud',
      entity: 'reminders',
      operation: 'update',
      description: 'Update reminder',
    },
    {
      method: 'DELETE',
      path: '/reminders/:id',
      auth: true,
      handler: 'crud',
      entity: 'reminders',
      operation: 'delete',
      description: 'Delete reminder',
    },
    {
      method: 'GET',
      path: '/reminder-templates',
      auth: true,
      handler: 'crud',
      entity: 'reminder_templates',
      operation: 'list',
      description: 'List templates',
    },
    {
      method: 'POST',
      path: '/reminder-templates',
      auth: true,
      handler: 'crud',
      entity: 'reminder_templates',
      operation: 'create',
      description: 'Create template',
    },
    {
      method: 'PUT',
      path: '/reminder-templates/:id',
      auth: true,
      handler: 'crud',
      entity: 'reminder_templates',
      operation: 'update',
      description: 'Update template',
    },
    {
      method: 'POST',
      path: '/reminders/:id/send-now',
      auth: true,
      handler: 'custom',
      entity: 'reminders',
      description: 'Send reminder immediately',
    },
    {
      method: 'GET',
      path: '/reminder-logs',
      auth: true,
      handler: 'crud',
      entity: 'reminder_logs',
      operation: 'list',
      description: 'Get sent reminder history',
    },
  ],

  config: [
    {
      key: 'defaultChannel',
      label: 'Default Reminder Channel',
      type: 'select',
      default: 'email',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'push', label: 'Push Notification' },
      ],
      description: 'Default notification channel (email, sms, push)',
    },
    {
      key: 'defaultLeadTime',
      label: 'Default Reminder Time (hours before)',
      type: 'number',
      default: 24,
      description: 'Default hours before event to send reminder',
    },
    {
      key: 'enableSMS',
      label: 'Enable SMS Reminders',
      type: 'boolean',
      default: false,
      description: 'Allow SMS reminders',
    },
    {
      key: 'retryOnFailure',
      label: 'Retry Failed Reminders',
      type: 'boolean',
      default: true,
      description: 'Retry sending if initial send fails',
    },
  ],
};
