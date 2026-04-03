/**
 * Waitlist Feature Definition
 *
 * Manage waitlists for restaurants, events, classes,
 * and any capacity-limited service.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const WAITLIST_FEATURE: FeatureDefinition = {
  id: 'waitlist',
  name: 'Waitlist',
  category: 'booking',
  description: 'Queue management and waitlist for capacity-limited services',
  icon: 'users',

  includedInAppTypes: [
    'restaurant',
    'clinic',
    'salon',
    'spa',
    'event-venue',
    'class-booking',
    'fitness-class',
    'popular-venue',
    'government-office',
    'dmv',
    'bank',
    'hospital',
    'urgent-care',
    'food-truck',
    'popup-store',
    'product-launch',
  ],

  activationKeywords: [
    'waitlist',
    'queue',
    'wait list',
    'waiting list',
    'queue management',
    'virtual queue',
    'line management',
    'join waitlist',
    'yelp waitlist',
    'nowait',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'join-waitlist',
      route: '/waitlist',
      section: 'frontend',
      title: 'Join Waitlist',
      authRequired: false,
      templateId: 'join-waitlist',
      components: [
        'waitlist-form',
        'party-size-selector',
        'estimated-wait',
        'position-display',
      ],
      layout: 'default',
    },
    {
      id: 'waitlist-status',
      route: '/waitlist/:id',
      section: 'frontend',
      title: 'Waitlist Status',
      authRequired: false,
      templateId: 'waitlist-status',
      components: [
        'position-tracker',
        'estimated-time',
        'leave-waitlist-button',
        'notification-preferences',
      ],
      layout: 'default',
    },
    {
      id: 'admin-waitlist',
      route: '/admin/waitlist',
      section: 'admin',
      title: 'Manage Waitlist',
      authRequired: true,
      templateId: 'admin-waitlist',
      components: [
        'waitlist-queue',
        'seat-button',
        'notify-button',
        'remove-button',
        'waitlist-stats',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Join components
    'waitlist-form',
    'party-size-selector',
    'estimated-wait',
    'position-display',

    // Status components
    'position-tracker',
    'estimated-time',
    'leave-waitlist-button',
    'notification-preferences',

    // Admin components
    'waitlist-queue',
    'seat-button',
    'notify-button',
    'remove-button',
    'waitlist-stats',
    'average-wait-display',
  ],

  entities: [
    {
      name: 'waitlist_entries',
      displayName: 'Waitlist Entries',
      description: 'People on the waitlist',
      isCore: true,
    },
    {
      name: 'waitlist_history',
      displayName: 'Waitlist History',
      description: 'Historical waitlist data',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'POST',
      path: '/waitlist',
      auth: false,
      handler: 'crud',
      entity: 'waitlist_entries',
      description: 'Join waitlist',
    },
    {
      method: 'GET',
      path: '/waitlist/:id',
      auth: false,
      handler: 'crud',
      entity: 'waitlist_entries',
      description: 'Get waitlist position',
    },
    {
      method: 'DELETE',
      path: '/waitlist/:id',
      auth: false,
      handler: 'crud',
      entity: 'waitlist_entries',
      description: 'Leave waitlist',
    },
    {
      method: 'GET',
      path: '/admin/waitlist',
      auth: true,
      handler: 'crud',
      entity: 'waitlist_entries',
      description: 'Get full waitlist',
    },
    {
      method: 'POST',
      path: '/waitlist/:id/notify',
      auth: true,
      handler: 'custom',
      entity: 'waitlist_entries',
      description: 'Notify guest',
    },
    {
      method: 'POST',
      path: '/waitlist/:id/seat',
      auth: true,
      handler: 'custom',
      entity: 'waitlist_entries',
      description: 'Mark as seated',
    },
    {
      method: 'GET',
      path: '/waitlist/estimate',
      auth: false,
      handler: 'custom',
      entity: 'waitlist_entries',
      description: 'Get wait time estimate',
    },
  ],

  config: [
    {
      key: 'maxWaitlistSize',
      label: 'Maximum Waitlist Size',
      type: 'number',
      default: 50,
      description: 'Maximum entries on waitlist',
    },
    {
      key: 'notificationMethod',
      label: 'Notification Method',
      type: 'string',
      default: 'sms',
      description: 'How to notify guests (sms, email, push)',
    },
    {
      key: 'expirationMinutes',
      label: 'Notification Expiration (minutes)',
      type: 'number',
      default: 15,
      description: 'Time to respond after notification',
    },
    {
      key: 'averageServiceTime',
      label: 'Average Service Time (minutes)',
      type: 'number',
      default: 45,
      description: 'Used for wait time estimates',
    },
  ],
};
