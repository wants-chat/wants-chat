/**
 * Vehicle History Feature Definition
 *
 * Complete vehicle history report management for automotive applications.
 * Carfax-style reports with accident history, ownership records, and service logs.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

export const VEHICLE_HISTORY_FEATURE: FeatureDefinition = {
  id: 'vehicle-history',
  name: 'Vehicle History Reports',
  category: 'business',
  description: 'Generate and display vehicle history reports including accidents, ownership, and service records',
  icon: 'file-text',

  includedInAppTypes: [
    'automotive-dealership',
    'car-dealership',
    'used-car-lot',
    'vehicle-marketplace',
    'auto-dealer',
    'vehicle-history-service',
    'auto-auction',
  ],

  activationKeywords: [
    'vehicle history',
    'car history',
    'carfax',
    'autocheck',
    'accident history',
    'ownership history',
    'service history',
    'title history',
    'vehicle report',
    'car report',
    'vin check',
    'vin history',
    'vehicle background',
    'car background check',
    'odometer history',
    'lemon check',
  ],

  enabledByDefault: true,
  optional: true,

  dependencies: ['user-auth', 'vehicle-inventory'],
  conflicts: [],

  pages: [
    {
      id: 'vehicle-history-report',
      route: '/vehicles/:id/history',
      section: 'frontend',
      title: 'Vehicle History Report',
      authRequired: false,
      templateId: 'vehicle-history-report',
      components: [
        'history-summary-badge',
        'accident-timeline',
        'ownership-history',
        'service-records',
        'title-history',
        'odometer-readings',
        'recall-history',
        'damage-report',
        'history-score',
      ],
      layout: 'default',
    },
    {
      id: 'run-history-check',
      route: '/history-check',
      section: 'frontend',
      title: 'Run History Check',
      authRequired: false,
      templateId: 'run-history-check',
      components: [
        'vin-input-form',
        'license-plate-lookup',
        'pricing-tiers',
        'sample-report',
        'checkout-form',
      ],
      layout: 'centered',
    },
    {
      id: 'my-history-reports',
      route: '/my-history-reports',
      section: 'frontend',
      title: 'My Reports',
      authRequired: true,
      templateId: 'my-history-reports',
      components: [
        'reports-list',
        'report-download',
        'report-share',
        'purchase-history',
      ],
      layout: 'dashboard',
    },
    {
      id: 'admin-history-reports',
      route: '/admin/history-reports',
      section: 'admin',
      title: 'Manage History Reports',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-history-reports',
      components: [
        'reports-table',
        'report-sources',
        'data-providers',
        'report-analytics',
        'pricing-management',
      ],
      layout: 'admin',
    },
    {
      id: 'add-service-record',
      route: '/vehicles/:id/service-record/add',
      section: 'frontend',
      title: 'Add Service Record',
      authRequired: true,
      roles: ['dealer', 'admin', 'service'],
      templateId: 'add-service-record',
      components: [
        'service-record-form',
        'mileage-input',
        'service-type-selector',
        'document-upload',
        'technician-notes',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Report display components
    'history-summary-badge',
    'accident-timeline',
    'ownership-history',
    'service-records',
    'title-history',
    'odometer-readings',
    'recall-history',
    'damage-report',
    'history-score',

    // Check components
    'vin-input-form',
    'license-plate-lookup',
    'pricing-tiers',
    'sample-report',
    'checkout-form',

    // User components
    'reports-list',
    'report-download',
    'report-share',
    'purchase-history',

    // Admin components
    'reports-table',
    'report-sources',
    'data-providers',
    'report-analytics',
    'pricing-management',

    // Service record components
    'service-record-form',
    'mileage-input',
    'service-type-selector',
    'document-upload',
    'technician-notes',
  ],

  entities: [
    {
      name: 'vehicle_history_reports',
      displayName: 'Vehicle History Reports',
      description: 'Generated vehicle history reports',
      isCore: true,
    },
    {
      name: 'accident_records',
      displayName: 'Accident Records',
      description: 'Vehicle accident history records',
      isCore: true,
    },
    {
      name: 'ownership_records',
      displayName: 'Ownership Records',
      description: 'Vehicle ownership history',
      isCore: true,
    },
    {
      name: 'service_records',
      displayName: 'Service Records',
      description: 'Vehicle service and maintenance records',
      isCore: true,
    },
    {
      name: 'title_records',
      displayName: 'Title Records',
      description: 'Vehicle title and registration history',
      isCore: false,
    },
    {
      name: 'odometer_readings',
      displayName: 'Odometer Readings',
      description: 'Historical odometer readings',
      isCore: false,
    },
    {
      name: 'report_purchases',
      displayName: 'Report Purchases',
      description: 'Customer report purchase records',
      isCore: false,
    },
  ],

  apiRoutes: [
    // Report retrieval
    {
      method: 'GET',
      path: '/vehicles/:id/history',
      auth: false,
      handler: 'crud',
      entity: 'vehicle_history_reports',
      operation: 'get',
      description: 'Get vehicle history report',
    },
    {
      method: 'POST',
      path: '/history-check',
      auth: false,
      handler: 'custom',
      entity: 'vehicle_history_reports',
      description: 'Run history check by VIN',
    },
    {
      method: 'POST',
      path: '/history-check/license-plate',
      auth: false,
      handler: 'custom',
      entity: 'vehicle_history_reports',
      description: 'Run history check by license plate',
    },

    // Report management
    {
      method: 'GET',
      path: '/my-history-reports',
      auth: true,
      handler: 'crud',
      entity: 'vehicle_history_reports',
      operation: 'list',
      description: 'Get user purchased reports',
    },
    {
      method: 'GET',
      path: '/history-reports/:id/download',
      auth: true,
      handler: 'custom',
      entity: 'vehicle_history_reports',
      description: 'Download PDF report',
    },
    {
      method: 'POST',
      path: '/history-reports/:id/share',
      auth: true,
      handler: 'custom',
      entity: 'vehicle_history_reports',
      description: 'Share report via email',
    },

    // Accident records
    {
      method: 'GET',
      path: '/vehicles/:id/accidents',
      auth: false,
      handler: 'crud',
      entity: 'accident_records',
      operation: 'list',
      description: 'Get vehicle accident records',
    },
    {
      method: 'POST',
      path: '/vehicles/:id/accidents',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'accident_records',
      operation: 'create',
      description: 'Add accident record',
    },

    // Ownership records
    {
      method: 'GET',
      path: '/vehicles/:id/ownership',
      auth: false,
      handler: 'crud',
      entity: 'ownership_records',
      operation: 'list',
      description: 'Get ownership history',
    },

    // Service records
    {
      method: 'GET',
      path: '/vehicles/:id/service-records',
      auth: false,
      handler: 'crud',
      entity: 'service_records',
      operation: 'list',
      description: 'Get service records',
    },
    {
      method: 'POST',
      path: '/vehicles/:id/service-records',
      auth: true,
      handler: 'crud',
      entity: 'service_records',
      operation: 'create',
      description: 'Add service record',
    },
    {
      method: 'PUT',
      path: '/vehicles/:vehicleId/service-records/:id',
      auth: true,
      handler: 'crud',
      entity: 'service_records',
      operation: 'update',
      description: 'Update service record',
    },

    // Title records
    {
      method: 'GET',
      path: '/vehicles/:id/title-history',
      auth: false,
      handler: 'crud',
      entity: 'title_records',
      operation: 'list',
      description: 'Get title history',
    },

    // Odometer readings
    {
      method: 'GET',
      path: '/vehicles/:id/odometer',
      auth: false,
      handler: 'crud',
      entity: 'odometer_readings',
      operation: 'list',
      description: 'Get odometer readings',
    },
    {
      method: 'POST',
      path: '/vehicles/:id/odometer',
      auth: true,
      handler: 'crud',
      entity: 'odometer_readings',
      operation: 'create',
      description: 'Record odometer reading',
    },

    // Purchases
    {
      method: 'POST',
      path: '/history-reports/purchase',
      auth: true,
      handler: 'custom',
      entity: 'report_purchases',
      description: 'Purchase history report',
    },
    {
      method: 'GET',
      path: '/history-reports/pricing',
      auth: false,
      handler: 'custom',
      entity: 'report_purchases',
      description: 'Get report pricing tiers',
    },

    // Admin
    {
      method: 'GET',
      path: '/admin/history-reports',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'vehicle_history_reports',
      operation: 'list',
      description: 'List all history reports (admin)',
    },
    {
      method: 'GET',
      path: '/admin/history-reports/stats',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'vehicle_history_reports',
      description: 'Get report statistics',
    },
  ],

  config: [
    {
      key: 'enableFreePreview',
      label: 'Enable Free Preview',
      type: 'boolean',
      default: true,
      description: 'Show limited free preview before purchase',
    },
    {
      key: 'reportProvider',
      label: 'History Report Provider',
      type: 'select',
      default: 'internal',
      options: [
        { value: 'internal', label: 'Internal Database' },
        { value: 'carfax', label: 'Carfax API' },
        { value: 'autocheck', label: 'AutoCheck API' },
        { value: 'nmvtis', label: 'NMVTIS' },
      ],
      description: 'Primary data provider for history reports',
    },
    {
      key: 'basicReportPrice',
      label: 'Basic Report Price',
      type: 'number',
      default: 14.99,
      description: 'Price for basic history report',
    },
    {
      key: 'fullReportPrice',
      label: 'Full Report Price',
      type: 'number',
      default: 39.99,
      description: 'Price for comprehensive history report',
    },
    {
      key: 'freeForDealers',
      label: 'Free Reports for Dealers',
      type: 'boolean',
      default: true,
      description: 'Provide free reports for registered dealers',
    },
    {
      key: 'includeRecalls',
      label: 'Include Recall Information',
      type: 'boolean',
      default: true,
      description: 'Include open recalls in reports',
    },
    {
      key: 'includeMarketValue',
      label: 'Include Market Value',
      type: 'boolean',
      default: true,
      description: 'Include estimated market value in reports',
    },
    {
      key: 'retentionDays',
      label: 'Report Retention (days)',
      type: 'number',
      default: 30,
      description: 'Days to retain purchased reports for re-download',
    },
  ],
};
