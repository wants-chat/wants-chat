/**
 * Announcements Feature Definition
 *
 * System announcements, banners, and important notifications
 * for communicating with users.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const ANNOUNCEMENTS_FEATURE: FeatureDefinition = {
  id: 'announcements',
  name: 'Announcements',
  category: 'communication',
  description: 'System announcements and banners for user communication',
  icon: 'megaphone',

  includedInAppTypes: [
    'saas',
    'community',
    'forum',
    'school',
    'university',
    'church',
    'nonprofit',
    'intranet',
    'company-portal',
    'government',
    'hoa',
  ],

  activationKeywords: [
    'announcements',
    'announcement',
    'banners',
    'system messages',
    'news',
    'updates',
    'broadcast',
    'notices',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'announcements-list',
      route: '/announcements',
      section: 'frontend',
      title: 'Announcements',
      authRequired: false,
      templateId: 'announcements-list',
      components: [
        'announcements-feed',
        'announcement-card',
        'category-filter',
      ],
      layout: 'default',
    },
    {
      id: 'announcement-detail',
      route: '/announcements/:id',
      section: 'frontend',
      title: 'Announcement',
      authRequired: false,
      templateId: 'announcement-detail',
      components: [
        'announcement-header',
        'announcement-content',
        'related-announcements',
      ],
      layout: 'default',
    },
    {
      id: 'admin-announcements',
      route: '/admin/announcements',
      section: 'admin',
      title: 'Manage Announcements',
      authRequired: true,
      templateId: 'admin-announcements',
      components: [
        'announcements-table',
        'create-button',
        'schedule-view',
        'announcement-stats',
      ],
      layout: 'admin',
    },
    {
      id: 'create-announcement',
      route: '/admin/announcements/new',
      section: 'admin',
      title: 'Create Announcement',
      authRequired: true,
      templateId: 'create-announcement',
      components: [
        'announcement-form',
        'visibility-settings',
        'schedule-picker',
        'target-audience',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Display
    'announcements-feed',
    'announcement-card',
    'announcement-banner',
    'announcement-popup',

    // Detail
    'announcement-header',
    'announcement-content',
    'related-announcements',

    // Admin
    'announcements-table',
    'announcement-form',
    'visibility-settings',
    'schedule-picker',
    'target-audience',
    'announcement-stats',

    // Filters
    'category-filter',
    'date-filter',
  ],

  entities: [
    {
      name: 'announcements',
      displayName: 'Announcements',
      description: 'System announcements',
      isCore: true,
    },
    {
      name: 'announcement_reads',
      displayName: 'Read Status',
      description: 'Track read announcements',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/announcements',
      auth: false,
      handler: 'crud',
      entity: 'announcements',
      description: 'List announcements',
    },
    {
      method: 'GET',
      path: '/announcements/:id',
      auth: false,
      handler: 'crud',
      entity: 'announcements',
      description: 'Get announcement',
    },
    {
      method: 'POST',
      path: '/announcements',
      auth: true,
      handler: 'crud',
      entity: 'announcements',
      description: 'Create announcement',
    },
    {
      method: 'PUT',
      path: '/announcements/:id',
      auth: true,
      handler: 'crud',
      entity: 'announcements',
      description: 'Update announcement',
    },
    {
      method: 'DELETE',
      path: '/announcements/:id',
      auth: true,
      handler: 'crud',
      entity: 'announcements',
      description: 'Delete announcement',
    },
    {
      method: 'POST',
      path: '/announcements/:id/read',
      auth: true,
      handler: 'custom',
      entity: 'announcement_reads',
      description: 'Mark as read',
    },
    {
      method: 'GET',
      path: '/announcements/active',
      auth: false,
      handler: 'custom',
      entity: 'announcements',
      description: 'Get active announcements',
    },
  ],

  config: [
    {
      key: 'showBanner',
      label: 'Show Banner',
      type: 'boolean',
      default: true,
      description: 'Show announcements as banners',
    },
    {
      key: 'autoHideDays',
      label: 'Auto-hide After (days)',
      type: 'number',
      default: 7,
      description: 'Days until announcement auto-hides',
    },
    {
      key: 'allowDismiss',
      label: 'Allow Dismiss',
      type: 'boolean',
      default: true,
      description: 'Let users dismiss announcements',
    },
    {
      key: 'maxActive',
      label: 'Max Active Announcements',
      type: 'number',
      default: 5,
      description: 'Maximum simultaneous announcements',
    },
  ],
};
