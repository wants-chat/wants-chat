/**
 * Availability Feature Definition
 *
 * Manage availability settings, working hours, time slots,
 * and booking windows for service providers.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const AVAILABILITY_FEATURE: FeatureDefinition = {
  id: 'availability',
  name: 'Availability',
  category: 'booking',
  description: 'Manage availability, working hours, and time slots',
  icon: 'clock',

  includedInAppTypes: [
    'healthcare',
    'medical-practice',
    'salon',
    'spa',
    'consulting',
    'coaching',
    'therapy',
    'tutoring',
    'freelance',
    'professional-services',
    'photography',
    'fitness-trainer',
    'music-teacher',
    'driving-school',
    'pet-grooming',
    'home-services',
    'cleaning-service',
  ],

  activationKeywords: [
    'availability',
    'working hours',
    'business hours',
    'time slots',
    'schedule settings',
    'open hours',
    'booking hours',
    'available times',
    'set availability',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'availability-settings',
      route: '/availability',
      section: 'frontend',
      title: 'Availability Settings',
      authRequired: true,
      templateId: 'availability-settings',
      components: [
        'weekly-hours-grid',
        'time-range-picker',
        'day-toggle',
        'break-time-settings',
      ],
      layout: 'default',
    },
    {
      id: 'blocked-times',
      route: '/availability/blocked',
      section: 'frontend',
      title: 'Blocked Times',
      authRequired: true,
      templateId: 'blocked-times',
      components: [
        'blocked-times-list',
        'block-time-form',
        'vacation-mode',
      ],
      layout: 'default',
    },
    {
      id: 'special-hours',
      route: '/availability/special',
      section: 'frontend',
      title: 'Special Hours',
      authRequired: true,
      templateId: 'special-hours',
      components: [
        'special-hours-list',
        'holiday-hours',
        'special-hours-form',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Hours management
    'weekly-hours-grid',
    'time-range-picker',
    'day-toggle',
    'break-time-settings',

    // Block times
    'blocked-times-list',
    'block-time-form',
    'vacation-mode',

    // Special hours
    'special-hours-list',
    'holiday-hours',
    'special-hours-form',

    // Display components
    'availability-calendar',
    'slot-picker',
    'availability-preview',
  ],

  entities: [
    {
      name: 'availability_schedules',
      displayName: 'Availability Schedules',
      description: 'Weekly availability patterns',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid' },
        { name: 'provider_id', type: 'uuid' },
        { name: 'day_of_week', type: 'integer', required: true },
        { name: 'start_time', type: 'time', required: true },
        { name: 'end_time', type: 'time', required: true },
        { name: 'is_active', type: 'boolean', default: 'true' },
        { name: 'timezone', type: 'text', default: "'UTC'" },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'blocked_times',
      displayName: 'Blocked Times',
      description: 'Time blocks when not available',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid' },
        { name: 'provider_id', type: 'uuid' },
        { name: 'start_time', type: 'timestamptz', required: true },
        { name: 'end_time', type: 'timestamptz', required: true },
        { name: 'reason', type: 'text' },
        { name: 'is_recurring', type: 'boolean', default: 'false' },
        { name: 'recurrence_rule', type: 'text' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'special_hours',
      displayName: 'Special Hours',
      description: 'Holiday and special day hours',
      isCore: false,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid' },
        { name: 'provider_id', type: 'uuid' },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'time' },
        { name: 'end_time', type: 'time' },
        { name: 'is_closed', type: 'boolean', default: 'false' },
        { name: 'reason', type: 'text' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/availability',
      auth: true,
      handler: 'crud',
      entity: 'availability_schedules',
      description: 'Get availability schedule',
    },
    {
      method: 'PUT',
      path: '/availability',
      auth: true,
      handler: 'crud',
      entity: 'availability_schedules',
      description: 'Update availability schedule',
    },
    {
      method: 'GET',
      path: '/availability/slots',
      auth: false,
      handler: 'custom',
      entity: 'availability_schedules',
      description: 'Get available slots for date range',
    },
    {
      method: 'GET',
      path: '/blocked-times',
      auth: true,
      handler: 'crud',
      entity: 'blocked_times',
      description: 'List blocked times',
    },
    {
      method: 'POST',
      path: '/blocked-times',
      auth: true,
      handler: 'crud',
      entity: 'blocked_times',
      description: 'Create blocked time',
    },
    {
      method: 'DELETE',
      path: '/blocked-times/:id',
      auth: true,
      handler: 'crud',
      entity: 'blocked_times',
      description: 'Remove blocked time',
    },
    {
      method: 'GET',
      path: '/special-hours',
      auth: true,
      handler: 'crud',
      entity: 'special_hours',
      description: 'List special hours',
    },
    {
      method: 'POST',
      path: '/special-hours',
      auth: true,
      handler: 'crud',
      entity: 'special_hours',
      description: 'Create special hours',
    },
  ],

  config: [
    {
      key: 'slotDuration',
      label: 'Time Slot Duration (minutes)',
      type: 'number',
      default: 30,
      description: 'Duration of each time slot',
    },
    {
      key: 'minBookingNotice',
      label: 'Minimum Booking Notice (hours)',
      type: 'number',
      default: 2,
      description: 'Minimum advance notice for bookings',
    },
    {
      key: 'maxAdvanceBooking',
      label: 'Maximum Advance Booking (days)',
      type: 'number',
      default: 60,
      description: 'How far ahead bookings can be made',
    },
    {
      key: 'timezone',
      label: 'Default Timezone',
      type: 'string',
      default: 'UTC',
      description: 'Default timezone for availability',
    },
  ],
};
