/**
 * Time Tracking Feature Definition
 *
 * Complete time tracking functionality for project management,
 * freelancing, and productivity apps.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const TIME_TRACKING_FEATURE: FeatureDefinition = {
  id: 'time-tracking',
  name: 'Time Tracking',
  category: 'utility',
  description: 'Track time spent on projects and tasks with timer, reports, and analytics',
  icon: 'clock',

  includedInAppTypes: [
    'project-management',
    'saas',
    'crm',
    'freelance',
    'agency',
    'consulting',
  ],

  activationKeywords: [
    'time tracking',
    'time tracker',
    'timesheet',
    'timer',
    'hours tracking',
    'work hours',
    'time log',
    'time logging',
    'clockify',
    'toggl',
    'harvest',
    'billable hours',
    'time entry',
    'track time',
    'stopwatch',
    'pomodoro',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'dashboard',
      route: '/dashboard',
      section: 'frontend',
      title: 'Dashboard',
      authRequired: true,
      templateId: 'time-tracking-dashboard',
      components: [
        'timer-widget',
        'stats-cards',
        'recent-entries-list',
        'weekly-chart',
        'project-breakdown',
      ],
      layout: 'default',
    },
    {
      id: 'timer',
      route: '/timer',
      section: 'frontend',
      title: 'Timer',
      authRequired: true,
      templateId: 'timer-page',
      components: [
        'active-timer',
        'quick-entry-form',
        'recent-entries',
        'project-selector',
      ],
      layout: 'default',
    },
    {
      id: 'time-entries',
      route: '/time-entries',
      section: 'frontend',
      title: 'Time Entries',
      authRequired: true,
      templateId: 'time-entries-list',
      components: [
        'time-entries-table',
        'date-range-filter',
        'project-filter',
        'export-button',
      ],
      layout: 'default',
    },
    {
      id: 'projects',
      route: '/projects',
      section: 'frontend',
      title: 'Projects',
      authRequired: true,
      templateId: 'projects-list',
      components: [
        'project-grid',
        'project-card',
        'create-project-modal',
        'project-stats',
      ],
      layout: 'default',
    },
    {
      id: 'project-detail',
      route: '/projects/:id',
      section: 'frontend',
      title: 'Project Detail',
      authRequired: true,
      templateId: 'project-detail',
      components: [
        'project-header',
        'task-list',
        'project-time-entries',
        'project-analytics',
      ],
      layout: 'default',
    },
    {
      id: 'reports',
      route: '/reports',
      section: 'frontend',
      title: 'Reports',
      authRequired: true,
      templateId: 'reports-page',
      components: [
        'report-type-selector',
        'date-range-picker',
        'time-chart',
        'project-breakdown-chart',
        'export-report-button',
      ],
      layout: 'default',
    },
    {
      id: 'clients',
      route: '/clients',
      section: 'frontend',
      title: 'Clients',
      authRequired: true,
      templateId: 'clients-list',
      components: [
        'client-table',
        'create-client-modal',
        'client-card',
      ],
      layout: 'default',
    },
    {
      id: 'settings',
      route: '/settings',
      section: 'frontend',
      title: 'Settings',
      authRequired: true,
      templateId: 'settings-page',
      components: [
        'work-hours-config',
        'timer-preferences',
        'notification-settings',
        'integrations',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Timer components
    'timer-widget',
    'active-timer',
    'timer-controls',
    'quick-entry-form',

    // Time entry components
    'time-entries-table',
    'time-entry-row',
    'time-entry-form',
    'time-entry-modal',
    'recent-entries-list',

    // Project components
    'project-grid',
    'project-card',
    'project-selector',
    'create-project-modal',
    'project-header',
    'project-stats',
    'project-breakdown',

    // Task components
    'task-list',
    'task-item',
    'create-task-form',

    // Client components
    'client-table',
    'client-card',
    'create-client-modal',

    // Report components
    'time-chart',
    'weekly-chart',
    'project-breakdown-chart',
    'report-type-selector',
    'export-report-button',

    // Filter components
    'date-range-filter',
    'date-range-picker',
    'project-filter',
    'export-button',

    // Stats components
    'stats-cards',
    'project-analytics',

    // Settings components
    'work-hours-config',
    'timer-preferences',
    'notification-settings',
    'integrations',
  ],

  entities: [
    {
      name: 'time_entries',
      displayName: 'Time Entries',
      description: 'Individual time tracking records',
      isCore: true,
    },
    {
      name: 'projects',
      displayName: 'Projects',
      description: 'Projects for organizing time entries',
      isCore: true,
    },
    {
      name: 'tasks',
      displayName: 'Tasks',
      description: 'Tasks within projects',
      isCore: false,
    },
    {
      name: 'clients',
      displayName: 'Clients',
      description: 'Client information for billing',
      isCore: false,
    },
  ],

  apiRoutes: [
    // Time Entry Routes
    {
      method: 'GET',
      path: '/time-entries',
      auth: true,
      handler: 'crud',
      entity: 'time_entries',
      description: 'List time entries with filters',
    },
    {
      method: 'POST',
      path: '/time-entries',
      auth: true,
      handler: 'crud',
      entity: 'time_entries',
      description: 'Create a time entry',
    },
    {
      method: 'GET',
      path: '/time-entries/:id',
      auth: true,
      handler: 'crud',
      entity: 'time_entries',
      description: 'Get time entry details',
    },
    {
      method: 'PUT',
      path: '/time-entries/:id',
      auth: true,
      handler: 'crud',
      entity: 'time_entries',
      description: 'Update a time entry',
    },
    {
      method: 'DELETE',
      path: '/time-entries/:id',
      auth: true,
      handler: 'crud',
      entity: 'time_entries',
      description: 'Delete a time entry',
    },

    // Timer Routes
    {
      method: 'POST',
      path: '/timer/start',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Start timer',
    },
    {
      method: 'POST',
      path: '/timer/stop',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Stop timer',
    },
    {
      method: 'GET',
      path: '/timer/current',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get current running timer',
    },

    // Project Routes
    {
      method: 'GET',
      path: '/projects',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'List projects',
    },
    {
      method: 'POST',
      path: '/projects',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Create a project',
    },
    {
      method: 'GET',
      path: '/projects/:id',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Get project details',
    },
    {
      method: 'PUT',
      path: '/projects/:id',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Update a project',
    },
    {
      method: 'DELETE',
      path: '/projects/:id',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Delete a project',
    },

    // Task Routes
    {
      method: 'GET',
      path: '/projects/:projectId/tasks',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'List tasks for a project',
    },
    {
      method: 'POST',
      path: '/projects/:projectId/tasks',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Create a task',
    },
    {
      method: 'PUT',
      path: '/tasks/:id',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Update a task',
    },
    {
      method: 'DELETE',
      path: '/tasks/:id',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Delete a task',
    },

    // Client Routes
    {
      method: 'GET',
      path: '/clients',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'List clients',
    },
    {
      method: 'POST',
      path: '/clients',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Create a client',
    },
    {
      method: 'PUT',
      path: '/clients/:id',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Update a client',
    },
    {
      method: 'DELETE',
      path: '/clients/:id',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Delete a client',
    },

    // Report Routes
    {
      method: 'GET',
      path: '/reports/summary',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get time tracking summary',
    },
    {
      method: 'GET',
      path: '/reports/daily',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get daily report',
    },
    {
      method: 'GET',
      path: '/reports/weekly',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get weekly report',
    },
    {
      method: 'GET',
      path: '/reports/project/:projectId',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get project time report',
    },

    // Dashboard Stats
    {
      method: 'GET',
      path: '/stats/today',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get today\'s stats',
    },
    {
      method: 'GET',
      path: '/stats/week',
      auth: true,
      handler: 'custom',
      entity: 'time_entries',
      description: 'Get this week\'s stats',
    },
  ],

  config: [
    {
      key: 'defaultBillableRate',
      label: 'Default Billable Rate',
      type: 'number',
      default: 50,
      description: 'Default hourly rate for billable time',
    },
    {
      key: 'roundingInterval',
      label: 'Rounding Interval (minutes)',
      type: 'number',
      default: 15,
      description: 'Round time entries to nearest interval',
    },
    {
      key: 'autoStopTimer',
      label: 'Auto-stop Timer (hours)',
      type: 'number',
      default: 8,
      description: 'Automatically stop timer after X hours',
    },
    {
      key: 'workHoursPerDay',
      label: 'Work Hours Per Day',
      type: 'number',
      default: 8,
      description: 'Target work hours per day',
    },
    {
      key: 'enablePomodoro',
      label: 'Enable Pomodoro Mode',
      type: 'boolean',
      default: false,
      description: 'Use Pomodoro technique with breaks',
    },
  ],
};
