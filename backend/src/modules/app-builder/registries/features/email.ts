/**
 * Email Feature Definition
 *
 * Email templates, sending, and delivery tracking
 * for transactional and marketing emails.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const EMAIL_FEATURE: FeatureDefinition = {
  id: 'email',
  name: 'Email',
  category: 'communication',
  description: 'Email templates, sending, and delivery tracking',
  icon: 'send',

  includedInAppTypes: [
    'saas',
    'ecommerce',
    'marketing',
    'newsletter',
    'crm',
    'email-marketing',
    'automation',
    'hr-management',
    'project-management',
    'healthcare',
  ],

  activationKeywords: [
    'email',
    'emails',
    'email templates',
    'transactional email',
    'email notifications',
    'sendgrid',
    'mailgun',
    'mailchimp',
    'newsletter',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'email-templates',
      route: '/admin/email/templates',
      section: 'admin',
      title: 'Email Templates',
      authRequired: true,
      templateId: 'email-templates',
      components: [
        'templates-list',
        'template-card',
        'create-template-button',
      ],
      layout: 'admin',
    },
    {
      id: 'template-editor',
      route: '/admin/email/templates/:id',
      section: 'admin',
      title: 'Edit Template',
      authRequired: true,
      templateId: 'template-editor',
      components: [
        'email-editor',
        'variable-picker',
        'preview-panel',
        'send-test-button',
      ],
      layout: 'admin',
    },
    {
      id: 'email-logs',
      route: '/admin/email/logs',
      section: 'admin',
      title: 'Email Logs',
      authRequired: true,
      templateId: 'email-logs',
      components: [
        'logs-table',
        'status-filter',
        'date-filter',
        'email-stats',
      ],
      layout: 'admin',
    },
    {
      id: 'email-compose',
      route: '/admin/email/compose',
      section: 'admin',
      title: 'Compose Email',
      authRequired: true,
      templateId: 'email-compose',
      components: [
        'recipient-selector',
        'template-picker',
        'email-composer',
        'schedule-picker',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Templates
    'templates-list',
    'template-card',
    'create-template-button',

    // Editor
    'email-editor',
    'variable-picker',
    'preview-panel',
    'send-test-button',
    'html-editor',
    'wysiwyg-editor',

    // Compose
    'recipient-selector',
    'template-picker',
    'email-composer',
    'schedule-picker',

    // Logs
    'logs-table',
    'status-filter',
    'date-filter',
    'email-stats',
    'delivery-status',
  ],

  entities: [
    {
      name: 'email_templates',
      displayName: 'Email Templates',
      description: 'Email templates',
      isCore: true,
    },
    {
      name: 'email_logs',
      displayName: 'Email Logs',
      description: 'Sent email logs',
      isCore: true,
    },
    {
      name: 'email_campaigns',
      displayName: 'Campaigns',
      description: 'Email campaigns',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/email/templates',
      auth: true,
      handler: 'crud',
      entity: 'email_templates',
      description: 'List templates',
    },
    {
      method: 'GET',
      path: '/email/templates/:id',
      auth: true,
      handler: 'crud',
      entity: 'email_templates',
      description: 'Get template',
    },
    {
      method: 'POST',
      path: '/email/templates',
      auth: true,
      handler: 'crud',
      entity: 'email_templates',
      description: 'Create template',
    },
    {
      method: 'PUT',
      path: '/email/templates/:id',
      auth: true,
      handler: 'crud',
      entity: 'email_templates',
      description: 'Update template',
    },
    {
      method: 'DELETE',
      path: '/email/templates/:id',
      auth: true,
      handler: 'crud',
      entity: 'email_templates',
      description: 'Delete template',
    },
    {
      method: 'POST',
      path: '/email/send',
      auth: true,
      handler: 'custom',
      entity: 'email_logs',
      description: 'Send email',
    },
    {
      method: 'POST',
      path: '/email/send-test',
      auth: true,
      handler: 'custom',
      entity: 'email_logs',
      description: 'Send test email',
    },
    {
      method: 'GET',
      path: '/email/logs',
      auth: true,
      handler: 'crud',
      entity: 'email_logs',
      description: 'Get email logs',
    },
    {
      method: 'GET',
      path: '/email/stats',
      auth: true,
      handler: 'custom',
      entity: 'email_logs',
      description: 'Get email stats',
    },
  ],

  config: [
    {
      key: 'fromEmail',
      label: 'From Email',
      type: 'string',
      default: 'noreply@example.com',
      description: 'Default sender email',
    },
    {
      key: 'fromName',
      label: 'From Name',
      type: 'string',
      default: 'App Name',
      description: 'Default sender name',
    },
    {
      key: 'provider',
      label: 'Email Provider',
      type: 'string',
      default: 'smtp',
      description: 'Email service provider',
    },
    {
      key: 'trackOpens',
      label: 'Track Opens',
      type: 'boolean',
      default: true,
      description: 'Track email opens',
    },
  ],
};
