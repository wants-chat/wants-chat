/**
 * Shipping Feature Definition
 *
 * This feature adds shipping management, carrier integration, and package
 * tracking functionality to e-commerce and logistics applications.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SHIPPING_FEATURE: FeatureDefinition = {
  id: 'shipping',
  name: 'Shipping',
  category: 'commerce',
  description: 'Shipping management with carrier integration, rate calculation, and package tracking',
  icon: 'truck',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'food-delivery',
    'logistics',
    'retail',
    'wholesale',
    'dropshipping',
    'grocery',
    'pharmacy',
    'fashion',
    'electronics',
    'furniture',
    'subscription-box',
    'b2b-commerce',
    'automotive',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'shipping',
    'delivery',
    'shipment',
    'tracking',
    'carrier',
    'freight',
    'logistics',
    'courier',
    'parcel',
    'package',
    'dispatch',
    'fulfillment',
    'ship',
    'deliver',
    'tracking number',
    'shipping label',
    'shipping rate',
    'express delivery',
    'same day delivery',
    'next day delivery',
  ],

  /** Enabled by default for included app types */
  enabledByDefault: true,

  /** User can opt-out */
  optional: true,

  // ─────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────────────────────

  /** Other features this depends on */
  dependencies: [
    'user-auth',        // Need users to ship to
    'checkout',         // Shipping is part of checkout flow
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'shipping-settings',
      route: '/settings/shipping',
      section: 'admin',
      title: 'Shipping Settings',
      authRequired: true,
      roles: ['admin'],
      templateId: 'settings-page',
      components: [
        'shipping-zones-manager',
        'carrier-settings',
        'shipping-rate-table',
        'default-packaging-settings',
      ],
      layout: 'dashboard',
    },
    {
      id: 'shipments',
      route: '/admin/shipments',
      section: 'admin',
      title: 'Shipments',
      authRequired: true,
      roles: ['admin', 'fulfillment'],
      templateId: 'list-page',
      components: [
        'shipments-table',
        'shipment-filters',
        'bulk-shipping-actions',
        'shipping-analytics-summary',
      ],
      layout: 'dashboard',
    },
    {
      id: 'tracking',
      route: '/tracking/:trackingNumber',
      section: 'frontend',
      title: 'Track Shipment',
      authRequired: false,
      templateId: 'tracking-page',
      components: [
        'tracking-info',
        'tracking-timeline',
        'delivery-map',
        'delivery-eta',
      ],
      layout: 'centered',
    },
    {
      id: 'my-shipments',
      route: '/account/shipments',
      section: 'frontend',
      title: 'My Shipments',
      authRequired: true,
      templateId: 'list-page',
      components: [
        'user-shipments-list',
        'shipment-status-filter',
        'tracking-quick-view',
      ],
      layout: 'default',
    },
    {
      id: 'shipment-detail',
      route: '/admin/shipments/:id',
      section: 'admin',
      title: 'Shipment Details',
      authRequired: true,
      roles: ['admin', 'fulfillment'],
      templateId: 'detail-page',
      components: [
        'shipment-detail-header',
        'shipment-timeline',
        'shipping-label',
        'package-contents',
        'carrier-info',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'shipping-calculator',
    'tracking-info',
    'carrier-selector',
    'shipping-label',
    'shipping-zones-manager',
    'carrier-settings',
    'shipping-rate-table',
    'default-packaging-settings',
    'shipments-table',
    'shipment-filters',
    'bulk-shipping-actions',
    'shipping-analytics-summary',
    'tracking-timeline',
    'delivery-map',
    'delivery-eta',
    'user-shipments-list',
    'shipment-status-filter',
    'tracking-quick-view',
    'shipment-detail-header',
    'shipment-timeline',
    'package-contents',
    'carrier-info',
    'shipping-method-selector',
    'estimated-delivery-date',
    'shipping-address-form',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'shipments',
      displayName: 'Shipments',
      description: 'Package shipments with tracking and delivery information',
      isCore: true,
    },
    {
      name: 'carriers',
      displayName: 'Carriers',
      description: 'Shipping carriers and their configurations',
      isCore: true,
    },
    {
      name: 'shipping_rates',
      displayName: 'Shipping Rates',
      description: 'Shipping rates by zone, weight, and carrier',
      isCore: true,
    },
    {
      name: 'shipping_zones',
      displayName: 'Shipping Zones',
      description: 'Geographic zones for shipping rate calculation',
      isCore: false,
    },
    {
      name: 'tracking_events',
      displayName: 'Tracking Events',
      description: 'Shipment tracking history and status updates',
      isCore: false,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Shipping calculation routes
    {
      method: 'POST',
      path: '/shipping/calculate',
      auth: false,
      handler: 'custom',
      entity: 'shipping_rates',
      description: 'Calculate shipping rates for given parameters',
    },
    {
      method: 'GET',
      path: '/shipping/rates',
      auth: false,
      handler: 'crud',
      entity: 'shipping_rates',
      operation: 'list',
      description: 'Get available shipping rates',
    },
    {
      method: 'GET',
      path: '/shipping/methods',
      auth: false,
      handler: 'custom',
      entity: 'carriers',
      description: 'Get available shipping methods for checkout',
    },

    // Tracking routes
    {
      method: 'GET',
      path: '/tracking/:trackingNumber',
      auth: false,
      handler: 'custom',
      entity: 'shipments',
      description: 'Get shipment tracking information',
    },
    {
      method: 'POST',
      path: '/tracking/subscribe',
      auth: false,
      handler: 'custom',
      entity: 'shipments',
      description: 'Subscribe to tracking updates via email/SMS',
    },

    // Shipment routes (authenticated)
    {
      method: 'GET',
      path: '/shipments',
      auth: true,
      handler: 'crud',
      entity: 'shipments',
      operation: 'list',
      description: 'Get user shipments',
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

    // Admin carrier management
    {
      method: 'GET',
      path: '/admin/carriers',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'carriers',
      operation: 'list',
      description: 'Admin: list all carriers',
    },
    {
      method: 'POST',
      path: '/admin/carriers',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'carriers',
      operation: 'create',
      description: 'Admin: add new carrier',
    },
    {
      method: 'PUT',
      path: '/admin/carriers/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'carriers',
      operation: 'update',
      description: 'Admin: update carrier settings',
    },
    {
      method: 'DELETE',
      path: '/admin/carriers/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'carriers',
      operation: 'delete',
      description: 'Admin: remove carrier',
    },

    // Admin shipment management
    {
      method: 'GET',
      path: '/admin/shipments',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipments',
      operation: 'list',
      description: 'Admin: list all shipments',
    },
    {
      method: 'POST',
      path: '/admin/shipments',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipments',
      operation: 'create',
      description: 'Admin: create shipment',
    },
    {
      method: 'PUT',
      path: '/admin/shipments/:id/status',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'shipments',
      description: 'Admin: update shipment status',
    },
    {
      method: 'POST',
      path: '/admin/shipments/:id/label',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'shipments',
      description: 'Admin: generate shipping label',
    },
    {
      method: 'POST',
      path: '/admin/shipments/bulk',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'shipments',
      description: 'Admin: bulk create shipments',
    },

    // Admin shipping rates
    {
      method: 'GET',
      path: '/admin/shipping-rates',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipping_rates',
      operation: 'list',
      description: 'Admin: list all shipping rates',
    },
    {
      method: 'POST',
      path: '/admin/shipping-rates',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipping_rates',
      operation: 'create',
      description: 'Admin: create shipping rate',
    },
    {
      method: 'PUT',
      path: '/admin/shipping-rates/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipping_rates',
      operation: 'update',
      description: 'Admin: update shipping rate',
    },
    {
      method: 'DELETE',
      path: '/admin/shipping-rates/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'shipping_rates',
      operation: 'delete',
      description: 'Admin: delete shipping rate',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'enableFreeShipping',
      label: 'Enable Free Shipping',
      type: 'boolean',
      default: true,
      description: 'Allow free shipping based on order total',
    },
    {
      key: 'freeShippingThreshold',
      label: 'Free Shipping Threshold',
      type: 'number',
      default: 50,
      description: 'Minimum order amount for free shipping',
    },
    {
      key: 'defaultCarrier',
      label: 'Default Carrier',
      type: 'select',
      default: 'auto',
      options: [
        { value: 'auto', label: 'Auto-select Best Rate' },
        { value: 'ups', label: 'UPS' },
        { value: 'fedex', label: 'FedEx' },
        { value: 'usps', label: 'USPS' },
        { value: 'dhl', label: 'DHL' },
        { value: 'custom', label: 'Custom Carrier' },
      ],
      description: 'Default shipping carrier for orders',
    },
    {
      key: 'enableRealTimeTracking',
      label: 'Enable Real-Time Tracking',
      type: 'boolean',
      default: true,
      description: 'Fetch real-time tracking updates from carriers',
    },
    {
      key: 'showEstimatedDelivery',
      label: 'Show Estimated Delivery',
      type: 'boolean',
      default: true,
      description: 'Display estimated delivery dates at checkout',
    },
    {
      key: 'enableInternationalShipping',
      label: 'Enable International Shipping',
      type: 'boolean',
      default: false,
      description: 'Allow shipping to international addresses',
    },
    {
      key: 'labelFormat',
      label: 'Label Format',
      type: 'select',
      default: 'pdf',
      options: [
        { value: 'pdf', label: 'PDF' },
        { value: 'zpl', label: 'ZPL (Thermal Printer)' },
        { value: 'png', label: 'PNG Image' },
      ],
      description: 'Format for generated shipping labels',
    },
  ],
};
