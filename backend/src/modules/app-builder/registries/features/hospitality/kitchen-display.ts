/**
 * Kitchen Display System Feature Definition
 *
 * Kitchen order display and management system with station-based
 * views, prep timers, and order priority handling.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

export const KITCHEN_DISPLAY_FEATURE: FeatureDefinition = {
  id: 'kitchen-display',
  name: 'Kitchen Display System',
  category: 'hospitality',
  description: 'Kitchen order display with station views, timers, and priority management',
  icon: 'monitor',

  includedInAppTypes: [
    'restaurant',
    'hotel',
    'cafe',
    'bar',
    'bakery',
    'catering',
    'food-truck',
    'hostel',
    'resort',
    'vacation-rental',
    'fine-dining',
    'bistro',
    'fast-food',
    'pizzeria',
    'ghost-kitchen',
  ],

  activationKeywords: [
    'kitchen display',
    'kds',
    'kitchen screen',
    'order display',
    'kitchen management',
    'order queue',
    'prep station',
    'bump bar',
    'kitchen orders',
    'cook time',
    'order tracking',
    'kitchen monitor',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'kitchen-screen',
      route: '/kitchen',
      section: 'admin',
      title: 'Kitchen Display',
      authRequired: true,
      templateId: 'kitchen-screen',
      components: [
        'order-ticket',
        'order-queue',
        'timer-display',
        'bump-button',
        'priority-indicator',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'order-queue',
      route: '/kitchen/queue',
      section: 'admin',
      title: 'Order Queue',
      authRequired: true,
      templateId: 'order-queue',
      components: [
        'queue-list',
        'order-card',
        'status-filter',
        'time-elapsed',
      ],
      layout: 'admin',
    },
    {
      id: 'station-view',
      route: '/kitchen/station/:stationId',
      section: 'admin',
      title: 'Station View',
      authRequired: true,
      templateId: 'station-view',
      components: [
        'station-orders',
        'station-header',
        'item-checklist',
        'ready-button',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'prep-timer',
      route: '/kitchen/prep',
      section: 'admin',
      title: 'Prep Timer',
      authRequired: true,
      templateId: 'prep-timer',
      components: [
        'timer-grid',
        'countdown-timer',
        'alert-indicator',
        'batch-timer',
      ],
      layout: 'admin',
    },
    {
      id: 'kitchen-settings',
      route: '/admin/kitchen/settings',
      section: 'admin',
      title: 'Kitchen Settings',
      authRequired: true,
      templateId: 'kitchen-settings',
      components: [
        'station-manager',
        'timer-settings',
        'alert-config',
        'display-settings',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Order display components
    'order-ticket',
    'order-queue',
    'order-card',
    'queue-list',
    'order-details',

    // Timer components
    'timer-display',
    'countdown-timer',
    'timer-grid',
    'batch-timer',
    'time-elapsed',

    // Action components
    'bump-button',
    'ready-button',
    'priority-indicator',
    'item-checklist',

    // Station components
    'station-orders',
    'station-header',
    'station-manager',
    'station-selector',

    // Alert components
    'alert-indicator',
    'late-order-warning',
    'audio-alert',

    // Settings components
    'timer-settings',
    'alert-config',
    'display-settings',
    'status-filter',
  ],

  entities: [
    {
      name: 'kitchen_orders',
      displayName: 'Kitchen Orders',
      description: 'Orders sent to kitchen for preparation',
      isCore: true,
    },
    {
      name: 'order_items',
      displayName: 'Order Items',
      description: 'Individual items in kitchen orders',
      isCore: true,
    },
    {
      name: 'stations',
      displayName: 'Stations',
      description: 'Kitchen prep stations',
      isCore: true,
    },
    {
      name: 'prep_times',
      displayName: 'Prep Times',
      description: 'Item preparation time records',
      isCore: true,
    },
    {
      name: 'station_assignments',
      displayName: 'Station Assignments',
      description: 'Item to station assignments',
      isCore: false,
    },
  ],

  apiRoutes: [
    // Kitchen order routes
    {
      method: 'GET',
      path: '/kitchen-orders',
      auth: true,
      handler: 'crud',
      entity: 'kitchen_orders',
      description: 'List kitchen orders',
    },
    {
      method: 'GET',
      path: '/kitchen-orders/active',
      auth: true,
      handler: 'custom',
      entity: 'kitchen_orders',
      description: 'Get active orders',
    },
    {
      method: 'GET',
      path: '/kitchen-orders/:id',
      auth: true,
      handler: 'crud',
      entity: 'kitchen_orders',
      description: 'Get order details',
    },
    {
      method: 'PUT',
      path: '/kitchen-orders/:id',
      auth: true,
      handler: 'crud',
      entity: 'kitchen_orders',
      description: 'Update order',
    },
    {
      method: 'POST',
      path: '/kitchen-orders/:id/bump',
      auth: true,
      handler: 'custom',
      entity: 'kitchen_orders',
      description: 'Bump order to next status',
    },
    {
      method: 'POST',
      path: '/kitchen-orders/:id/priority',
      auth: true,
      handler: 'custom',
      entity: 'kitchen_orders',
      description: 'Set order priority',
    },
    {
      method: 'POST',
      path: '/kitchen-orders/:id/recall',
      auth: true,
      handler: 'custom',
      entity: 'kitchen_orders',
      description: 'Recall completed order',
    },

    // Order items routes
    {
      method: 'GET',
      path: '/kitchen-orders/:orderId/items',
      auth: true,
      handler: 'crud',
      entity: 'order_items',
      description: 'Get order items',
    },
    {
      method: 'PUT',
      path: '/order-items/:id/complete',
      auth: true,
      handler: 'custom',
      entity: 'order_items',
      description: 'Mark item complete',
    },
    {
      method: 'PUT',
      path: '/order-items/:id/void',
      auth: true,
      handler: 'custom',
      entity: 'order_items',
      description: 'Void item',
    },

    // Station routes
    {
      method: 'GET',
      path: '/stations',
      auth: true,
      handler: 'crud',
      entity: 'stations',
      description: 'List stations',
    },
    {
      method: 'POST',
      path: '/stations',
      auth: true,
      handler: 'crud',
      entity: 'stations',
      description: 'Create station',
    },
    {
      method: 'PUT',
      path: '/stations/:id',
      auth: true,
      handler: 'crud',
      entity: 'stations',
      description: 'Update station',
    },
    {
      method: 'DELETE',
      path: '/stations/:id',
      auth: true,
      handler: 'crud',
      entity: 'stations',
      description: 'Delete station',
    },
    {
      method: 'GET',
      path: '/stations/:id/orders',
      auth: true,
      handler: 'custom',
      entity: 'stations',
      description: 'Get orders for station',
    },

    // Prep times routes
    {
      method: 'GET',
      path: '/prep-times',
      auth: true,
      handler: 'crud',
      entity: 'prep_times',
      description: 'Get prep time records',
    },
    {
      method: 'GET',
      path: '/prep-times/analytics',
      auth: true,
      handler: 'aggregate',
      entity: 'prep_times',
      description: 'Get prep time analytics',
    },
  ],

  config: [
    {
      key: 'defaultPrepTime',
      label: 'Default Prep Time (minutes)',
      type: 'number',
      default: 15,
      description: 'Default preparation time for orders',
    },
    {
      key: 'warningThreshold',
      label: 'Warning Threshold (minutes)',
      type: 'number',
      default: 10,
      description: 'Show warning when order exceeds this time',
    },
    {
      key: 'criticalThreshold',
      label: 'Critical Threshold (minutes)',
      type: 'number',
      default: 20,
      description: 'Show critical alert when order exceeds this time',
    },
    {
      key: 'audioAlerts',
      label: 'Audio Alerts',
      type: 'boolean',
      default: true,
      description: 'Play audio alerts for new orders',
    },
    {
      key: 'autoBumpEnabled',
      label: 'Auto-Bump Enabled',
      type: 'boolean',
      default: false,
      description: 'Automatically bump orders when all items complete',
    },
    {
      key: 'showModifiers',
      label: 'Show Modifiers',
      type: 'boolean',
      default: true,
      description: 'Display item modifiers on tickets',
    },
    {
      key: 'colorCodedItems',
      label: 'Color-Coded Items',
      type: 'boolean',
      default: true,
      description: 'Color code items by category',
    },
    {
      key: 'ticketFontSize',
      label: 'Ticket Font Size',
      type: 'select',
      default: 'medium',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      description: 'Font size for order tickets',
    },
  ],
};
