/**
 * Route Optimization Feature Definition
 *
 * Delivery route planning and optimization for logistics applications.
 * Supports multi-stop routing, time windows, and real-time adjustments.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

export const ROUTE_OPTIMIZATION_FEATURE: FeatureDefinition = {
  id: 'route-optimization',
  name: 'Route Optimization',
  category: 'business',
  description: 'Plan and optimize delivery routes with multi-stop routing, time windows, and real-time traffic integration',
  icon: 'route',

  includedInAppTypes: [
    'logistics',
    'delivery',
    'courier',
    'field-service',
    'fleet-management',
    'last-mile-delivery',
    'food-delivery',
    'dispatch',
  ],

  activationKeywords: [
    'route optimization',
    'route planning',
    'delivery route',
    'route planner',
    'optimize route',
    'best route',
    'shortest route',
    'multi-stop route',
    'delivery planning',
    'dispatch routing',
    'vehicle routing',
    'trip planning',
    'route scheduling',
    'driver routes',
    'navigation',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth', 'fleet-tracking'],
  conflicts: [],

  pages: [
    {
      id: 'route-planner',
      route: '/routes/plan',
      section: 'frontend',
      title: 'Route Planner',
      authRequired: true,
      roles: ['dispatcher', 'driver', 'admin'],
      templateId: 'route-planner',
      components: [
        'route-map',
        'stop-list',
        'stop-form',
        'optimization-controls',
        'route-summary',
        'time-window-picker',
      ],
      layout: 'split',
    },
    {
      id: 'routes-list',
      route: '/routes',
      section: 'frontend',
      title: 'Routes',
      authRequired: true,
      templateId: 'routes-list',
      components: [
        'routes-grid',
        'route-card',
        'route-filters',
        'route-status-tabs',
        'date-range-picker',
      ],
      layout: 'dashboard',
    },
    {
      id: 'route-detail',
      route: '/routes/:id',
      section: 'frontend',
      title: 'Route Details',
      authRequired: true,
      templateId: 'route-detail',
      components: [
        'route-header',
        'route-map-detail',
        'stop-timeline',
        'route-metrics',
        'driver-info',
        'route-actions',
      ],
      layout: 'default',
    },
    {
      id: 'driver-route',
      route: '/driver/route',
      section: 'frontend',
      title: 'My Route',
      authRequired: true,
      roles: ['driver'],
      templateId: 'driver-route',
      components: [
        'navigation-map',
        'next-stop-card',
        'stop-checklist',
        'route-progress',
        'navigation-button',
        'delay-report-form',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'dispatch-board',
      route: '/dispatch',
      section: 'frontend',
      title: 'Dispatch Board',
      authRequired: true,
      roles: ['dispatcher', 'admin'],
      templateId: 'dispatch-board',
      components: [
        'dispatch-map',
        'unassigned-stops',
        'driver-list',
        'drag-drop-assignment',
        'auto-assign-button',
        'route-optimizer',
      ],
      layout: 'dashboard',
    },
    {
      id: 'admin-routes',
      route: '/admin/routes',
      section: 'admin',
      title: 'Manage Routes',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-routes',
      components: [
        'routes-table',
        'route-filters',
        'bulk-actions',
        'route-analytics',
        'efficiency-report',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Planner components
    'route-map',
    'stop-list',
    'stop-form',
    'optimization-controls',
    'route-summary',
    'time-window-picker',

    // List components
    'routes-grid',
    'route-card',
    'route-filters',
    'route-status-tabs',
    'date-range-picker',

    // Detail components
    'route-header',
    'route-map-detail',
    'stop-timeline',
    'route-metrics',
    'driver-info',
    'route-actions',

    // Driver components
    'navigation-map',
    'next-stop-card',
    'stop-checklist',
    'route-progress',
    'navigation-button',
    'delay-report-form',

    // Dispatch components
    'dispatch-map',
    'unassigned-stops',
    'driver-list',
    'drag-drop-assignment',
    'auto-assign-button',
    'route-optimizer',

    // Admin components
    'routes-table',
    'bulk-actions',
    'route-analytics',
    'efficiency-report',
  ],

  entities: [
    {
      name: 'routes',
      displayName: 'Routes',
      description: 'Planned delivery routes',
      isCore: true,
    },
    {
      name: 'route_stops',
      displayName: 'Route Stops',
      description: 'Individual stops within a route',
      isCore: true,
    },
    {
      name: 'route_optimizations',
      displayName: 'Route Optimizations',
      description: 'Optimization run history and results',
      isCore: false,
    },
    {
      name: 'time_windows',
      displayName: 'Time Windows',
      description: 'Delivery time window constraints',
      isCore: false,
    },
    {
      name: 'route_templates',
      displayName: 'Route Templates',
      description: 'Saved route templates for recurring routes',
      isCore: false,
    },
  ],

  apiRoutes: [
    // Routes CRUD
    {
      method: 'GET',
      path: '/routes',
      auth: true,
      handler: 'crud',
      entity: 'routes',
      operation: 'list',
      description: 'List routes',
    },
    {
      method: 'GET',
      path: '/routes/:id',
      auth: true,
      handler: 'crud',
      entity: 'routes',
      operation: 'get',
      description: 'Get route details',
    },
    {
      method: 'POST',
      path: '/routes',
      auth: true,
      role: 'dispatcher',
      handler: 'crud',
      entity: 'routes',
      operation: 'create',
      description: 'Create new route',
    },
    {
      method: 'PUT',
      path: '/routes/:id',
      auth: true,
      handler: 'crud',
      entity: 'routes',
      operation: 'update',
      description: 'Update route',
    },
    {
      method: 'DELETE',
      path: '/routes/:id',
      auth: true,
      handler: 'crud',
      entity: 'routes',
      operation: 'delete',
      description: 'Delete route',
    },

    // Route stops
    {
      method: 'GET',
      path: '/routes/:id/stops',
      auth: true,
      handler: 'crud',
      entity: 'route_stops',
      operation: 'list',
      description: 'Get route stops',
    },
    {
      method: 'POST',
      path: '/routes/:id/stops',
      auth: true,
      handler: 'crud',
      entity: 'route_stops',
      operation: 'create',
      description: 'Add stop to route',
    },
    {
      method: 'PUT',
      path: '/routes/:routeId/stops/:id',
      auth: true,
      handler: 'crud',
      entity: 'route_stops',
      operation: 'update',
      description: 'Update route stop',
    },
    {
      method: 'DELETE',
      path: '/routes/:routeId/stops/:id',
      auth: true,
      handler: 'crud',
      entity: 'route_stops',
      operation: 'delete',
      description: 'Remove stop from route',
    },

    // Optimization
    {
      method: 'POST',
      path: '/routes/:id/optimize',
      auth: true,
      role: 'dispatcher',
      handler: 'custom',
      entity: 'routes',
      description: 'Optimize route order',
    },
    {
      method: 'POST',
      path: '/routes/bulk-optimize',
      auth: true,
      role: 'dispatcher',
      handler: 'custom',
      entity: 'routes',
      description: 'Optimize multiple routes',
    },

    // Stop ordering
    {
      method: 'PUT',
      path: '/routes/:id/reorder',
      auth: true,
      handler: 'custom',
      entity: 'route_stops',
      description: 'Reorder stops manually',
    },

    // Driver route
    {
      method: 'GET',
      path: '/driver/route/current',
      auth: true,
      role: 'driver',
      handler: 'custom',
      entity: 'routes',
      description: 'Get driver current route',
    },
    {
      method: 'PUT',
      path: '/driver/route/stops/:id/complete',
      auth: true,
      role: 'driver',
      handler: 'custom',
      entity: 'route_stops',
      description: 'Mark stop as complete',
    },

    // Templates
    {
      method: 'GET',
      path: '/route-templates',
      auth: true,
      handler: 'crud',
      entity: 'route_templates',
      operation: 'list',
      description: 'List route templates',
    },
    {
      method: 'POST',
      path: '/routes/:id/save-template',
      auth: true,
      handler: 'custom',
      entity: 'route_templates',
      description: 'Save route as template',
    },
  ],

  config: [
    {
      key: 'optimizationAlgorithm',
      label: 'Optimization Algorithm',
      type: 'select',
      default: 'balanced',
      options: [
        { value: 'fastest', label: 'Fastest Route' },
        { value: 'shortest', label: 'Shortest Distance' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'time-windows', label: 'Time Window Priority' },
      ],
      description: 'Default optimization strategy',
    },
    {
      key: 'enableRealTimeTraffic',
      label: 'Enable Real-Time Traffic',
      type: 'boolean',
      default: true,
      description: 'Use live traffic data for routing',
    },
    {
      key: 'enableAutoReoptimize',
      label: 'Auto Re-optimize Routes',
      type: 'boolean',
      default: false,
      description: 'Automatically re-optimize when conditions change',
    },
    {
      key: 'maxStopsPerRoute',
      label: 'Maximum Stops Per Route',
      type: 'number',
      default: 50,
      description: 'Maximum number of stops allowed per route',
    },
    {
      key: 'defaultTimeWindow',
      label: 'Default Time Window (minutes)',
      type: 'number',
      default: 60,
      description: 'Default delivery time window duration',
    },
    {
      key: 'mapProvider',
      label: 'Map Provider',
      type: 'select',
      default: 'google',
      options: [
        { value: 'google', label: 'Google Maps' },
        { value: 'mapbox', label: 'Mapbox' },
        { value: 'here', label: 'HERE Maps' },
        { value: 'openstreetmap', label: 'OpenStreetMap' },
      ],
      description: 'Map and routing provider',
    },
    {
      key: 'enableDriverNavigation',
      label: 'Enable In-App Navigation',
      type: 'boolean',
      default: true,
      description: 'Provide turn-by-turn navigation for drivers',
    },
  ],
};
