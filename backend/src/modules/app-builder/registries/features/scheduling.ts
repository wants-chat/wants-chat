/**
 * Scheduling Feature Definition
 *
 * Staff scheduling, shift management, and resource allocation
 * for businesses with multiple employees or resources.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SCHEDULING_FEATURE: FeatureDefinition = {
  id: 'scheduling',
  name: 'Scheduling',
  category: 'booking',
  description: 'Staff shifts, schedules, and resource allocation',
  icon: 'calendar-range',

  includedInAppTypes: [
    'restaurant',
    'retail',
    'healthcare',
    'hotel',
    'call-center',
    'manufacturing',
    'warehouse',
    'delivery-service',
    'security',
    'cleaning-service',
    'construction',
    'event-staffing',
    'temp-agency',
    'nursing-home',
    'daycare',
    'school',
    'fitness-center',
    'salon',
  ],

  activationKeywords: [
    'scheduling',
    'shift management',
    'staff scheduling',
    'employee scheduling',
    'roster',
    'work schedule',
    'shift planning',
    'resource scheduling',
    'crew scheduling',
    'when i work',
    'deputy',
    'homebase',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth', 'team-management'],
  conflicts: [],

  pages: [
    {
      id: 'schedule-view',
      route: '/schedule',
      section: 'frontend',
      title: 'Schedule',
      authRequired: true,
      templateId: 'schedule-view',
      components: [
        'schedule-grid',
        'week-navigator',
        'shift-card',
        'my-shifts',
      ],
      layout: 'default',
    },
    {
      id: 'admin-schedule',
      route: '/admin/schedule',
      section: 'admin',
      title: 'Staff Schedule',
      authRequired: true,
      templateId: 'admin-schedule',
      components: [
        'schedule-builder',
        'staff-list',
        'shift-templates',
        'coverage-view',
        'publish-button',
      ],
      layout: 'admin',
    },
    {
      id: 'shift-detail',
      route: '/shifts/:id',
      section: 'frontend',
      title: 'Shift Details',
      authRequired: true,
      templateId: 'shift-detail',
      components: [
        'shift-info',
        'swap-request-button',
        'drop-shift-button',
        'shift-notes',
      ],
      layout: 'default',
    },
    {
      id: 'shift-swaps',
      route: '/shifts/swaps',
      section: 'frontend',
      title: 'Shift Swaps',
      authRequired: true,
      templateId: 'shift-swaps',
      components: [
        'swap-requests-list',
        'open-shifts',
        'swap-approval',
      ],
      layout: 'default',
    },
    {
      id: 'time-off',
      route: '/time-off',
      section: 'frontend',
      title: 'Time Off Requests',
      authRequired: true,
      templateId: 'time-off',
      components: [
        'time-off-calendar',
        'request-form',
        'time-off-balance',
        'pending-requests',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Schedule views
    'schedule-grid',
    'schedule-builder',
    'week-navigator',
    'coverage-view',
    'my-shifts',

    // Shift components
    'shift-card',
    'shift-info',
    'shift-form',
    'shift-templates',
    'shift-notes',

    // Swap components
    'swap-request-button',
    'drop-shift-button',
    'swap-requests-list',
    'open-shifts',
    'swap-approval',

    // Time off
    'time-off-calendar',
    'request-form',
    'time-off-balance',
    'pending-requests',

    // Admin
    'staff-list',
    'publish-button',
    'auto-scheduler',
  ],

  entities: [
    {
      name: 'schedules',
      displayName: 'Schedules',
      description: 'Weekly/monthly schedules',
      isCore: true,
    },
    {
      name: 'shifts',
      displayName: 'Shifts',
      description: 'Individual work shifts',
      isCore: true,
    },
    {
      name: 'shift_swaps',
      displayName: 'Shift Swaps',
      description: 'Shift swap requests',
      isCore: false,
    },
    {
      name: 'time_off_requests',
      displayName: 'Time Off Requests',
      description: 'PTO and time off requests',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/schedules',
      auth: true,
      handler: 'crud',
      entity: 'schedules',
      description: 'List schedules',
    },
    {
      method: 'POST',
      path: '/schedules',
      auth: true,
      handler: 'crud',
      entity: 'schedules',
      description: 'Create schedule',
    },
    {
      method: 'GET',
      path: '/shifts',
      auth: true,
      handler: 'crud',
      entity: 'shifts',
      description: 'List shifts',
    },
    {
      method: 'POST',
      path: '/shifts',
      auth: true,
      handler: 'crud',
      entity: 'shifts',
      description: 'Create shift',
    },
    {
      method: 'PUT',
      path: '/shifts/:id',
      auth: true,
      handler: 'crud',
      entity: 'shifts',
      description: 'Update shift',
    },
    {
      method: 'DELETE',
      path: '/shifts/:id',
      auth: true,
      handler: 'crud',
      entity: 'shifts',
      description: 'Delete shift',
    },
    {
      method: 'POST',
      path: '/shifts/:id/swap',
      auth: true,
      handler: 'custom',
      entity: 'shift_swaps',
      description: 'Request shift swap',
    },
    {
      method: 'POST',
      path: '/shifts/:id/drop',
      auth: true,
      handler: 'custom',
      entity: 'shifts',
      description: 'Drop shift',
    },
    {
      method: 'GET',
      path: '/time-off',
      auth: true,
      handler: 'crud',
      entity: 'time_off_requests',
      description: 'List time off requests',
    },
    {
      method: 'POST',
      path: '/time-off',
      auth: true,
      handler: 'crud',
      entity: 'time_off_requests',
      description: 'Request time off',
    },
    {
      method: 'POST',
      path: '/schedules/:id/publish',
      auth: true,
      handler: 'custom',
      entity: 'schedules',
      description: 'Publish schedule',
    },
  ],

  config: [
    {
      key: 'shiftMinHours',
      label: 'Minimum Shift Hours',
      type: 'number',
      default: 4,
      description: 'Minimum hours for a shift',
    },
    {
      key: 'shiftMaxHours',
      label: 'Maximum Shift Hours',
      type: 'number',
      default: 12,
      description: 'Maximum hours for a shift',
    },
    {
      key: 'overtimeThreshold',
      label: 'Overtime Threshold (hours/week)',
      type: 'number',
      default: 40,
      description: 'Hours before overtime kicks in',
    },
    {
      key: 'allowSwaps',
      label: 'Allow Shift Swaps',
      type: 'boolean',
      default: true,
      description: 'Allow employees to swap shifts',
    },
    {
      key: 'requireApproval',
      label: 'Require Manager Approval',
      type: 'boolean',
      default: true,
      description: 'Require approval for swaps and time off',
    },
  ],
};
