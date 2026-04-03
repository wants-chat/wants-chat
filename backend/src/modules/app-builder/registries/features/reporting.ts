/**
 * Reporting Feature Definition
 *
 * Reports, data visualization, charts, and exports
 * for business intelligence and analytics.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const REPORTING_FEATURE: FeatureDefinition = {
  id: 'reporting',
  name: 'Reporting',
  category: 'business',
  description: 'Reports, charts, and data exports for business intelligence',
  icon: 'bar-chart-2',

  includedInAppTypes: [
    'saas',
    'crm',
    'erp',
    'hr-management',
    'finance',
    'accounting',
    'inventory',
    'project-management',
    'sales',
    'marketing',
    'enterprise',
  ],

  activationKeywords: [
    'reports',
    'reporting',
    'analytics',
    'charts',
    'dashboards',
    'data visualization',
    'export',
    'insights',
    'metrics',
    'kpi',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'reports-list',
      route: '/reports',
      section: 'frontend',
      title: 'Reports',
      authRequired: true,
      templateId: 'reports-list',
      components: [
        'reports-grid',
        'report-card',
        'category-filter',
        'create-report-button',
      ],
      layout: 'default',
    },
    {
      id: 'report-view',
      route: '/reports/:id',
      section: 'frontend',
      title: 'Report',
      authRequired: true,
      templateId: 'report-view',
      components: [
        'report-header',
        'chart-container',
        'data-table',
        'date-range-picker',
        'export-button',
      ],
      layout: 'default',
    },
    {
      id: 'report-builder',
      route: '/reports/builder',
      section: 'frontend',
      title: 'Report Builder',
      authRequired: true,
      templateId: 'report-builder',
      components: [
        'data-source-picker',
        'field-selector',
        'chart-type-picker',
        'filter-builder',
        'preview-panel',
      ],
      layout: 'default',
    },
    {
      id: 'scheduled-reports',
      route: '/reports/scheduled',
      section: 'frontend',
      title: 'Scheduled Reports',
      authRequired: true,
      templateId: 'scheduled-reports',
      components: [
        'schedules-list',
        'schedule-form',
        'recipient-picker',
      ],
      layout: 'default',
    },
  ],

  components: [
    // List
    'reports-grid',
    'report-card',
    'category-filter',
    'create-report-button',

    // View
    'report-header',
    'chart-container',
    'data-table',
    'date-range-picker',
    'export-button',

    // Charts
    'bar-chart',
    'line-chart',
    'pie-chart',
    'area-chart',
    'scatter-chart',
    'table-chart',

    // Builder
    'data-source-picker',
    'field-selector',
    'chart-type-picker',
    'filter-builder',
    'preview-panel',

    // Schedule
    'schedules-list',
    'schedule-form',
    'recipient-picker',
  ],

  entities: [
    {
      name: 'reports',
      displayName: 'Reports',
      description: 'Saved reports',
      isCore: true,
    },
    {
      name: 'report_schedules',
      displayName: 'Schedules',
      description: 'Report schedules',
      isCore: false,
    },
    {
      name: 'report_exports',
      displayName: 'Exports',
      description: 'Export history',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/reports',
      auth: true,
      handler: 'crud',
      entity: 'reports',
      description: 'List reports',
    },
    {
      method: 'GET',
      path: '/reports/:id',
      auth: true,
      handler: 'crud',
      entity: 'reports',
      description: 'Get report',
    },
    {
      method: 'POST',
      path: '/reports',
      auth: true,
      handler: 'crud',
      entity: 'reports',
      description: 'Create report',
    },
    {
      method: 'PUT',
      path: '/reports/:id',
      auth: true,
      handler: 'crud',
      entity: 'reports',
      description: 'Update report',
    },
    {
      method: 'DELETE',
      path: '/reports/:id',
      auth: true,
      handler: 'crud',
      entity: 'reports',
      description: 'Delete report',
    },
    {
      method: 'POST',
      path: '/reports/:id/run',
      auth: true,
      handler: 'custom',
      entity: 'reports',
      description: 'Run report',
    },
    {
      method: 'POST',
      path: '/reports/:id/export',
      auth: true,
      handler: 'custom',
      entity: 'report_exports',
      description: 'Export report',
    },
    {
      method: 'GET',
      path: '/reports/schedules',
      auth: true,
      handler: 'crud',
      entity: 'report_schedules',
      description: 'List schedules',
    },
    {
      method: 'POST',
      path: '/reports/schedules',
      auth: true,
      handler: 'crud',
      entity: 'report_schedules',
      description: 'Create schedule',
    },
    {
      method: 'GET',
      path: '/reports/data-sources',
      auth: true,
      handler: 'custom',
      entity: 'reports',
      description: 'Get data sources',
    },
  ],

  config: [
    {
      key: 'defaultExportFormat',
      label: 'Default Export Format',
      type: 'string',
      default: 'pdf',
      description: 'Default export format (pdf, csv, xlsx)',
    },
    {
      key: 'maxDataPoints',
      label: 'Max Data Points',
      type: 'number',
      default: 10000,
      description: 'Maximum data points per report',
    },
    {
      key: 'enableScheduling',
      label: 'Enable Scheduling',
      type: 'boolean',
      default: true,
      description: 'Allow scheduled reports',
    },
    {
      key: 'retentionDays',
      label: 'Export Retention (days)',
      type: 'number',
      default: 30,
      description: 'Days to keep exports',
    },
  ],
};
