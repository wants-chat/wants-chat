/**
 * Feedback Feature Definition
 *
 * User feedback collection, feature requests,
 * and bug reports with voting and status tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const FEEDBACK_FEATURE: FeatureDefinition = {
  id: 'feedback',
  name: 'Feedback',
  category: 'communication',
  description: 'User feedback, feature requests, and bug reports',
  icon: 'message-circle-plus',

  includedInAppTypes: [
    'saas',
    'product',
    'startup',
    'software',
    'mobile-app',
    'web-app',
    'community',
    'marketplace',
  ],

  activationKeywords: [
    'feedback',
    'feature requests',
    'bug reports',
    'user feedback',
    'suggestions',
    'canny',
    'uservoice',
    'upvote',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'feedback-board',
      route: '/feedback',
      section: 'frontend',
      title: 'Feedback',
      authRequired: false,
      templateId: 'feedback-board',
      components: [
        'feedback-list',
        'feedback-card',
        'category-tabs',
        'sort-options',
        'submit-button',
      ],
      layout: 'default',
    },
    {
      id: 'feedback-detail',
      route: '/feedback/:id',
      section: 'frontend',
      title: 'Feedback Detail',
      authRequired: false,
      templateId: 'feedback-detail',
      components: [
        'feedback-header',
        'vote-button',
        'feedback-content',
        'status-badge',
        'comments-section',
      ],
      layout: 'default',
    },
    {
      id: 'submit-feedback',
      route: '/feedback/new',
      section: 'frontend',
      title: 'Submit Feedback',
      authRequired: true,
      templateId: 'submit-feedback',
      components: [
        'feedback-form',
        'category-selector',
        'screenshot-upload',
      ],
      layout: 'default',
    },
    {
      id: 'admin-feedback',
      route: '/admin/feedback',
      section: 'admin',
      title: 'Manage Feedback',
      authRequired: true,
      templateId: 'admin-feedback',
      components: [
        'feedback-table',
        'status-manager',
        'roadmap-view',
        'feedback-analytics',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // List
    'feedback-list',
    'feedback-card',
    'category-tabs',
    'sort-options',
    'submit-button',

    // Detail
    'feedback-header',
    'vote-button',
    'feedback-content',
    'status-badge',
    'comments-section',

    // Form
    'feedback-form',
    'category-selector',
    'screenshot-upload',

    // Admin
    'feedback-table',
    'status-manager',
    'roadmap-view',
    'feedback-analytics',
    'merge-feedback',
  ],

  entities: [
    {
      name: 'feedback',
      displayName: 'Feedback',
      description: 'User feedback items',
      isCore: true,
    },
    {
      name: 'feedback_votes',
      displayName: 'Votes',
      description: 'Feedback votes',
      isCore: true,
    },
    {
      name: 'feedback_comments',
      displayName: 'Comments',
      description: 'Feedback comments',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/feedback',
      auth: false,
      handler: 'crud',
      entity: 'feedback',
      description: 'List feedback',
    },
    {
      method: 'GET',
      path: '/feedback/:id',
      auth: false,
      handler: 'crud',
      entity: 'feedback',
      description: 'Get feedback',
    },
    {
      method: 'POST',
      path: '/feedback',
      auth: true,
      handler: 'crud',
      entity: 'feedback',
      description: 'Submit feedback',
    },
    {
      method: 'PUT',
      path: '/feedback/:id',
      auth: true,
      handler: 'crud',
      entity: 'feedback',
      description: 'Update feedback',
    },
    {
      method: 'DELETE',
      path: '/feedback/:id',
      auth: true,
      handler: 'crud',
      entity: 'feedback',
      description: 'Delete feedback',
    },
    {
      method: 'POST',
      path: '/feedback/:id/vote',
      auth: true,
      handler: 'custom',
      entity: 'feedback_votes',
      description: 'Vote on feedback',
    },
    {
      method: 'DELETE',
      path: '/feedback/:id/vote',
      auth: true,
      handler: 'custom',
      entity: 'feedback_votes',
      description: 'Remove vote',
    },
    {
      method: 'PUT',
      path: '/feedback/:id/status',
      auth: true,
      handler: 'custom',
      entity: 'feedback',
      description: 'Update status',
    },
    {
      method: 'GET',
      path: '/feedback/:id/comments',
      auth: false,
      handler: 'crud',
      entity: 'feedback_comments',
      description: 'Get comments',
    },
    {
      method: 'POST',
      path: '/feedback/:id/comments',
      auth: true,
      handler: 'crud',
      entity: 'feedback_comments',
      description: 'Add comment',
    },
  ],

  config: [
    {
      key: 'categories',
      label: 'Feedback Categories',
      type: 'string',
      default: 'feature,bug,improvement',
      description: 'Comma-separated categories',
    },
    {
      key: 'statuses',
      label: 'Status Options',
      type: 'string',
      default: 'open,planned,in-progress,completed',
      description: 'Comma-separated statuses',
    },
    {
      key: 'allowAnonymous',
      label: 'Allow Anonymous Viewing',
      type: 'boolean',
      default: true,
      description: 'Allow viewing without login',
    },
    {
      key: 'moderationRequired',
      label: 'Require Moderation',
      type: 'boolean',
      default: false,
      description: 'Approve feedback before publishing',
    },
  ],
};
