/**
 * Shipment Tracking Feature Definition
 *
 * Complete package and shipment tracking for logistics applications.
 * Supports real-time tracking, status updates, and delivery notifications.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

export const SHIPMENT_TRACKING_FEATURE: FeatureDefinition = {
  id: 'shipment-tracking',
  name: 'Shipment Tracking',
  category: 'business',
  description: 'Track packages and shipments with real-time status updates, location tracking, and delivery notifications',
  icon: 'package',

  includedInAppTypes: [
    'logistics',
    'shipping',
    'delivery',
    'courier',
    'freight',
    'supply-chain',
    'warehouse',
    'ecommerce',
    'fulfillment',
  ],

  activationKeywords: [
    'shipment tracking',
    'package tracking',
    'track shipment',
    'track package',
    'delivery tracking',
    'parcel tracking',
    'tracking number',
    'shipment status',
    'package status',
    'where is my package',
    'track order',
    'delivery status',
    'shipping status',
    'consignment tracking',
    'cargo tracking',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth', 'notifications'],
  conflicts: [],

  pages: [
    {
      id: 'tracking-search',
      route: '/tracking',
      section: 'frontend',
      title: 'Track Shipment',
      authRequired: false,
      templateId: 'tracking-search',
      components: [
        'tracking-search-form',
        'tracking-number-input',
        'recent-trackings',
      ],
      layout: 'centered',
    },
    {
      id: 'tracking-detail',
      route: '/tracking/:trackingNumber',
      section: 'frontend',
      title: 'Shipment Details',
      authRequired: false,
      templateId: 'tracking-detail',
      components: [
        'shipment-header',
        'tracking-timeline',
        'shipment-map',
        'delivery-estimate',
        'shipment-details-card',
        'share-tracking',
        'tracking-alerts-signup',
      ],
      layout: 'default',
    },
    {
      id: 'my-shipments',
      route: '/my-shipments',
      section: 'frontend',
      title: 'My Shipments',
      authRequired: true,
      templateId: 'my-shipments',
      components: [
        'shipments-list',
        'shipment-filters',
        'shipment-status-tabs',
        'shipment-card',
        'bulk-tracking',
      ],
      layout: 'dashboard',
    },
    {
      id: 'create-shipment',
      route: '/shipments/new',
      section: 'frontend',
      title: 'Create Shipment',
      authRequired: true,
      roles: ['shipper', 'admin'],
      templateId: 'create-shipment',
      components: [
        'shipment-form',
        'address-form',
        'package-details-form',
        'service-selector',
        'rate-calculator',
        'label-generator',
      ],
      layout: 'default',
    },
    {
      id: 'shipment-edit',
      route: '/shipments/:id/edit',
      section: 'frontend',
      title: 'Edit Shipment',
      authRequired: true,
      roles: ['shipper', 'admin'],
      templateId: 'shipment-edit',
      components: [
        'shipment-form',
        'address-form',
        'package-details-form',
        'shipment-status-update',
      ],
      layout: 'default',
    },
    {
      id: 'admin-shipments',
      route: '/admin/shipments',
      section: 'admin',
      title: 'Manage Shipments',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-shipments',
      components: [
        'shipments-table',
        'shipment-filters',
        'bulk-actions',
        'status-update-modal',
        'shipment-analytics',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Search components
    'tracking-search-form',
    'tracking-number-input',
    'recent-trackings',

    // Detail components
    'shipment-header',
    'tracking-timeline',
    'shipment-map',
    'delivery-estimate',
    'shipment-details-card',
    'share-tracking',
    'tracking-alerts-signup',

    // List components
    'shipments-list',
    'shipment-filters',
    'shipment-status-tabs',
    'shipment-card',
    'bulk-tracking',

    // Form components
    'shipment-form',
    'address-form',
    'package-details-form',
    'service-selector',
    'rate-calculator',
    'label-generator',
    'shipment-status-update',

    // Admin components
    'shipments-table',
    'bulk-actions',
    'status-update-modal',
    'shipment-analytics',
  ],

  entities: [
    {
      name: 'shipments',
      displayName: 'Shipments',
      description: 'Shipment records with tracking information',
      isCore: true,
    },
    {
      name: 'shipment_events',
      displayName: 'Shipment Events',
      description: 'Timeline events for shipment status updates',
      isCore: true,
    },
    {
      name: 'shipment_addresses',
      displayName: 'Shipment Addresses',
      description: 'Origin and destination addresses',
      isCore: true,
    },
    {
      name: 'shipment_packages',
      displayName: 'Packages',
      description: 'Individual packages within a shipment',
      isCore: true,
    },
    {
      name: 'tracking_subscriptions',
      displayName: 'Tracking Subscriptions',
      description: 'Email/SMS notification subscriptions',
      isCore: false,
    },
  ],

  apiRoutes: [
    // Shipment CRUD
    {
      method: 'GET',
      path: '/shipments',
      auth: true,
      handler: 'crud',
      entity: 'shipments',
      operation: 'list',
      description: 'List user shipments',
    },
    {
      method: 'GET',
      path: '/shipments/:id',
      auth: true,
      handler: 'crud',
      entity: 'shipments',
      operation: 'get',
      description: 'Get shipment details',
    },
    {
      method: 'POST',
      path: '/shipments',
      auth: true,
      role: 'shipper',
      handler: 'crud',
      entity: 'shipments',
      operation: 'create',
      description: 'Create new shipment',
    },
    {
      method: 'PUT',
      path: '/shipments/:id',
      auth: true,
      handler: 'crud',
      entity: 'shipments',
      operation: 'update',
      description: 'Update shipment',
    },
    {
      method: 'DELETE',
      path: '/shipments/:id',
      auth: true,
      handler: 'crud',
      entity: 'shipments',
      operation: 'delete',
      description: 'Cancel shipment',
    },

    // Public tracking
    {
      method: 'GET',
      path: '/tracking/:trackingNumber',
      auth: false,
      handler: 'custom',
      entity: 'shipments',
      description: 'Get tracking info by tracking number',
    },

    // Shipment events
    {
      method: 'GET',
      path: '/shipments/:id/events',
      auth: false,
      handler: 'crud',
      entity: 'shipment_events',
      operation: 'list',
      description: 'Get shipment timeline events',
    },
    {
      method: 'POST',
      path: '/shipments/:id/events',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipment_events',
      operation: 'create',
      description: 'Add shipment event',
    },

    // Status updates
    {
      method: 'PUT',
      path: '/shipments/:id/status',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'shipments',
      description: 'Update shipment status',
    },

    // Tracking subscriptions
    {
      method: 'POST',
      path: '/tracking/:trackingNumber/subscribe',
      auth: false,
      handler: 'custom',
      entity: 'tracking_subscriptions',
      description: 'Subscribe to tracking updates',
    },
    {
      method: 'DELETE',
      path: '/tracking/:trackingNumber/unsubscribe',
      auth: false,
      handler: 'custom',
      entity: 'tracking_subscriptions',
      description: 'Unsubscribe from tracking updates',
    },

    // Bulk operations
    {
      method: 'POST',
      path: '/shipments/bulk-track',
      auth: false,
      handler: 'custom',
      entity: 'shipments',
      description: 'Track multiple shipments at once',
    },
  ],

  config: [
    {
      key: 'enablePublicTracking',
      label: 'Enable Public Tracking',
      type: 'boolean',
      default: true,
      description: 'Allow tracking without authentication',
    },
    {
      key: 'enableRealTimeUpdates',
      label: 'Enable Real-Time Updates',
      type: 'boolean',
      default: true,
      description: 'Use WebSocket for live tracking updates',
    },
    {
      key: 'trackingNumberFormat',
      label: 'Tracking Number Format',
      type: 'string',
      default: 'XXXXX-NNNNNN',
      description: 'Format pattern for tracking numbers',
    },
    {
      key: 'enableEmailNotifications',
      label: 'Enable Email Notifications',
      type: 'boolean',
      default: true,
      description: 'Send email updates for status changes',
    },
    {
      key: 'enableSmsNotifications',
      label: 'Enable SMS Notifications',
      type: 'boolean',
      default: false,
      description: 'Send SMS updates for status changes',
    },
    {
      key: 'defaultCarrier',
      label: 'Default Carrier',
      type: 'select',
      default: 'internal',
      options: [
        { value: 'internal', label: 'Internal Tracking' },
        { value: 'ups', label: 'UPS' },
        { value: 'fedex', label: 'FedEx' },
        { value: 'usps', label: 'USPS' },
        { value: 'dhl', label: 'DHL' },
      ],
      description: 'Default shipping carrier',
    },
    {
      key: 'retentionDays',
      label: 'Data Retention (days)',
      type: 'number',
      default: 365,
      description: 'How long to keep shipment records',
    },
  ],
};
