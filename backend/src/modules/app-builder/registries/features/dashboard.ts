/**
 * Dashboard Feature Definition
 *
 * Universal dashboard functionality for main overview, stats,
 * quick actions, and recent activity across all app types.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const DASHBOARD_FEATURE: FeatureDefinition = {
  id: 'dashboard',
  name: 'Dashboard',
  category: 'utility',
  description: 'Main dashboard with overview stats, quick actions, and recent activity',
  icon: 'layout-dashboard',

  includedInAppTypes: [
    // E-commerce & Marketplace
    'ecommerce',
    'marketplace',
    'multi-vendor',
    'dropshipping',
    'auction',
    'rental',

    // SaaS & Business
    'saas',
    'crm',
    'erp',
    'hrms',
    'project-management',
    'admin-dashboard',
    'agency',
    'freelance',
    'consulting',

    // Finance
    'fintech',
    'banking',
    'payment',
    'accounting',
    'invoicing',
    'subscription',
    'membership',

    // Content & Social
    'blog',
    'cms',
    'social-network',
    'community',
    'forum',
    'media',
    'streaming',
    'podcast',

    // Education & Learning
    'lms',
    'e-learning',
    'course-platform',
    'tutoring',

    // Health & Wellness
    'healthcare',
    'telemedicine',
    'fitness',
    'wellness',

    // Real Estate & Property
    'real-estate',
    'property-management',

    // Booking & Services
    'booking',
    'appointment',
    'scheduling',
    'event-management',

    // Operations & Logistics
    'inventory',
    'logistics',
    'warehouse',
    'delivery',
    'fleet-management',

    // Support & Communication
    'support',
    'helpdesk',
    'ticketing',
    'live-chat',

    // Marketing & Analytics
    'marketing',
    'email-marketing',
    'seo-tool',
    'analytics-platform',

    // Other
    'iot',
    'automation',
    'workflow',
    'portal',
    'internal-tools',
    'custom',
  ],

  activationKeywords: [
    'dashboard',
    'home',
    'overview',
    'main',
    'control panel',
    'home page',
    'landing',
    'main page',
    'hub',
    'command center',
    'cockpit',
    'workspace',
    'home dashboard',
    'main dashboard',
    'admin home',
    'user home',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'dashboard',
      route: '/dashboard',
      section: 'frontend',
      title: 'Dashboard',
      authRequired: true,
      templateId: 'main-dashboard',
      components: [
        'welcome-card',
        'stats-overview',
        'quick-actions',
        'recent-activity',
        'activity-feed',
        'summary-cards',
      ],
      layout: 'dashboard',
    },
  ],

  components: [
    // Overview components
    'stats-overview',
    'summary-cards',
    'kpi-widget',
    'metric-card',

    // Action components
    'quick-actions',
    'action-button',
    'shortcut-grid',

    // Activity components
    'recent-activity',
    'activity-feed',
    'activity-item',
    'activity-timeline',

    // Welcome & User components
    'welcome-card',
    'user-greeting',
    'profile-summary',

    // Widget components
    'dashboard-widget',
    'widget-container',
    'widget-header',
  ],

  entities: [],

  apiRoutes: [
    // Dashboard Stats Routes
    {
      method: 'GET',
      path: '/dashboard/stats',
      auth: true,
      handler: 'custom',
      entity: 'dashboard',
      description: 'Get aggregated dashboard statistics',
    },
    {
      method: 'GET',
      path: '/dashboard/activity',
      auth: true,
      handler: 'custom',
      entity: 'dashboard',
      description: 'Get recent user activity feed',
    },
    {
      method: 'GET',
      path: '/dashboard/quick-stats',
      auth: true,
      handler: 'custom',
      entity: 'dashboard',
      description: 'Get quick summary statistics for widgets',
    },
  ],

  config: [
    {
      key: 'showWelcome',
      label: 'Show Welcome Card',
      type: 'boolean',
      default: true,
      description: 'Display welcome greeting card on dashboard',
    },
    {
      key: 'activityLimit',
      label: 'Activity Feed Limit',
      type: 'number',
      default: 10,
      description: 'Number of recent activity items to display',
    },
    {
      key: 'refreshInterval',
      label: 'Auto Refresh Interval (seconds)',
      type: 'number',
      default: 60,
      description: 'Interval for auto-refreshing dashboard data (0 to disable)',
    },
    {
      key: 'defaultLayout',
      label: 'Default Layout',
      type: 'select',
      default: 'grid',
      options: [
        { value: 'grid', label: 'Grid Layout' },
        { value: 'list', label: 'List Layout' },
        { value: 'compact', label: 'Compact Layout' },
      ],
      description: 'Default dashboard widget layout',
    },
  ],
};
