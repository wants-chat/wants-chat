/**
 * Check-in Feature Definition
 *
 * Guest check-in, event arrival, appointment confirmation
 * with QR codes and digital sign-in.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CHECK_IN_FEATURE: FeatureDefinition = {
  id: 'check-in',
  name: 'Check-in',
  category: 'booking',
  description: 'Guest check-in with QR codes, kiosk mode, and digital sign-in',
  icon: 'check-circle',

  includedInAppTypes: [
    'hotel',
    'event-venue',
    'conference',
    'clinic',
    'hospital',
    'dental',
    'salon',
    'spa',
    'gym',
    'coworking',
    'visitor-management',
    'office-building',
    'school',
    'daycare',
    'airport-lounge',
    'members-club',
  ],

  activationKeywords: [
    'check-in',
    'checkin',
    'check in',
    'arrival',
    'sign in',
    'sign-in',
    'visitor check-in',
    'guest arrival',
    'qr check-in',
    'kiosk',
    'self check-in',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'check-in-page',
      route: '/check-in',
      section: 'frontend',
      title: 'Check In',
      authRequired: false,
      templateId: 'check-in-page',
      components: [
        'qr-scanner',
        'check-in-form',
        'confirmation-number-input',
        'check-in-success',
      ],
      layout: 'default',
    },
    {
      id: 'kiosk-mode',
      route: '/kiosk',
      section: 'frontend',
      title: 'Kiosk Check-in',
      authRequired: false,
      templateId: 'kiosk-mode',
      components: [
        'kiosk-welcome',
        'kiosk-search',
        'kiosk-keyboard',
        'kiosk-confirmation',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'admin-check-ins',
      route: '/admin/check-ins',
      section: 'admin',
      title: "Today's Check-ins",
      authRequired: true,
      templateId: 'admin-check-ins',
      components: [
        'check-ins-list',
        'expected-arrivals',
        'manual-check-in',
        'check-in-stats',
      ],
      layout: 'admin',
    },
    {
      id: 'visitor-log',
      route: '/admin/visitors',
      section: 'admin',
      title: 'Visitor Log',
      authRequired: true,
      templateId: 'visitor-log',
      components: [
        'visitor-table',
        'visitor-search',
        'export-log',
        'visitor-analytics',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Check-in components
    'qr-scanner',
    'check-in-form',
    'confirmation-number-input',
    'check-in-success',
    'check-out-button',

    // Kiosk components
    'kiosk-welcome',
    'kiosk-search',
    'kiosk-keyboard',
    'kiosk-confirmation',

    // Admin components
    'check-ins-list',
    'expected-arrivals',
    'manual-check-in',
    'check-in-stats',

    // Visitor components
    'visitor-table',
    'visitor-search',
    'visitor-badge-printer',
    'visitor-photo',
    'export-log',
    'visitor-analytics',
  ],

  entities: [
    {
      name: 'check_ins',
      displayName: 'Check-ins',
      description: 'Check-in records',
      isCore: true,
    },
    {
      name: 'visitors',
      displayName: 'Visitors',
      description: 'Visitor information',
      isCore: true,
    },
    {
      name: 'visitor_badges',
      displayName: 'Visitor Badges',
      description: 'Printed badges',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'POST',
      path: '/check-in',
      auth: false,
      handler: 'custom',
      entity: 'check_ins',
      description: 'Check in guest',
    },
    {
      method: 'POST',
      path: '/check-in/qr',
      auth: false,
      handler: 'custom',
      entity: 'check_ins',
      description: 'Check in via QR code',
    },
    {
      method: 'POST',
      path: '/check-out/:id',
      auth: false,
      handler: 'custom',
      entity: 'check_ins',
      description: 'Check out guest',
    },
    {
      method: 'GET',
      path: '/check-ins',
      auth: true,
      handler: 'crud',
      entity: 'check_ins',
      description: 'List check-ins',
    },
    {
      method: 'GET',
      path: '/check-ins/today',
      auth: true,
      handler: 'custom',
      entity: 'check_ins',
      description: "Get today's check-ins",
    },
    {
      method: 'GET',
      path: '/visitors',
      auth: true,
      handler: 'crud',
      entity: 'visitors',
      description: 'List visitors',
    },
    {
      method: 'POST',
      path: '/visitors',
      auth: true,
      handler: 'crud',
      entity: 'visitors',
      description: 'Register visitor',
    },
    {
      method: 'GET',
      path: '/check-ins/expected',
      auth: true,
      handler: 'custom',
      entity: 'check_ins',
      description: 'Get expected arrivals',
    },
    {
      method: 'POST',
      path: '/visitors/:id/badge',
      auth: true,
      handler: 'custom',
      entity: 'visitor_badges',
      description: 'Print visitor badge',
    },
  ],

  config: [
    {
      key: 'enableQRCode',
      label: 'Enable QR Code Check-in',
      type: 'boolean',
      default: true,
      description: 'Allow check-in via QR code scan',
    },
    {
      key: 'requirePhoto',
      label: 'Require Visitor Photo',
      type: 'boolean',
      default: false,
      description: 'Capture photo during check-in',
    },
    {
      key: 'printBadge',
      label: 'Print Visitor Badge',
      type: 'boolean',
      default: false,
      description: 'Print badge upon check-in',
    },
    {
      key: 'autoCheckout',
      label: 'Auto Check-out (hours)',
      type: 'number',
      default: 8,
      description: 'Automatically check out after X hours',
    },
    {
      key: 'notifyHost',
      label: 'Notify Host on Arrival',
      type: 'boolean',
      default: true,
      description: 'Send notification when visitor arrives',
    },
  ],
};
