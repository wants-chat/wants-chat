/**
 * Calendar Feature Definition
 *
 * Calendar views and event management for scheduling,
 * planning, and organization apps.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CALENDAR_FEATURE: FeatureDefinition = {
  id: 'calendar',
  name: 'Calendar',
  category: 'booking',
  description: 'Calendar views with event creation, scheduling, and reminders',
  icon: 'calendar',

  includedInAppTypes: [
    'project-management',
    'team-collaboration',
    'event-planning',
    'personal-organizer',
    'school-management',
    'church-management',
    'community',
    'sports-team',
    'club-management',
    'gym',
    'studio',
    'class-scheduling',
    'course-management',
    'employee-scheduling',
    'shift-management',
    'hr-management',
    'resource-booking',
  ],

  activationKeywords: [
    'calendar',
    'events',
    'schedule',
    'scheduling',
    'planner',
    'organizer',
    'google calendar',
    'event calendar',
    'class schedule',
    'event management',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'calendar-view',
      route: '/calendar',
      section: 'frontend',
      title: 'Calendar',
      authRequired: true,
      templateId: 'calendar-view',
      components: [
        'calendar-month-view',
        'calendar-week-view',
        'calendar-day-view',
        'view-switcher',
        'event-quick-add',
        'mini-calendar',
      ],
      layout: 'default',
    },
    {
      id: 'event-detail',
      route: '/events/:id',
      section: 'frontend',
      title: 'Event Details',
      authRequired: true,
      templateId: 'event-detail',
      components: [
        'event-header',
        'event-info',
        'event-attendees',
        'event-actions',
        'event-reminders',
      ],
      layout: 'default',
    },
    {
      id: 'create-event',
      route: '/events/new',
      section: 'frontend',
      title: 'Create Event',
      authRequired: true,
      templateId: 'create-event',
      components: [
        'event-form',
        'date-time-picker',
        'recurrence-picker',
        'attendee-selector',
        'reminder-settings',
      ],
      layout: 'default',
    },
    {
      id: 'agenda-view',
      route: '/agenda',
      section: 'frontend',
      title: 'Agenda',
      authRequired: true,
      templateId: 'agenda-view',
      components: [
        'agenda-list',
        'event-card',
        'date-navigator',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Calendar views
    'calendar-month-view',
    'calendar-week-view',
    'calendar-day-view',
    'view-switcher',
    'mini-calendar',
    'date-navigator',

    // Event components
    'event-card',
    'event-quick-add',
    'event-form',
    'event-header',
    'event-info',
    'event-attendees',
    'event-actions',
    'event-reminders',

    // Form components
    'date-time-picker',
    'recurrence-picker',
    'attendee-selector',
    'reminder-settings',
    'color-picker',

    // List components
    'agenda-list',
    'upcoming-events',
  ],

  entities: [
    {
      name: 'events',
      displayName: 'Events',
      description: 'Calendar events',
      isCore: true,
    },
    {
      name: 'calendars',
      displayName: 'Calendars',
      description: 'User calendars',
      isCore: true,
    },
    {
      name: 'event_attendees',
      displayName: 'Attendees',
      description: 'Event attendees/invites',
      isCore: false,
    },
    {
      name: 'event_reminders',
      displayName: 'Reminders',
      description: 'Event reminders',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/events',
      auth: true,
      handler: 'crud',
      entity: 'events',
      description: 'List events',
    },
    {
      method: 'POST',
      path: '/events',
      auth: true,
      handler: 'crud',
      entity: 'events',
      description: 'Create event',
    },
    {
      method: 'GET',
      path: '/events/:id',
      auth: true,
      handler: 'crud',
      entity: 'events',
      description: 'Get event details',
    },
    {
      method: 'PUT',
      path: '/events/:id',
      auth: true,
      handler: 'crud',
      entity: 'events',
      description: 'Update event',
    },
    {
      method: 'DELETE',
      path: '/events/:id',
      auth: true,
      handler: 'crud',
      entity: 'events',
      description: 'Delete event',
    },
    {
      method: 'GET',
      path: '/calendars',
      auth: true,
      handler: 'crud',
      entity: 'calendars',
      description: 'List calendars',
    },
    {
      method: 'POST',
      path: '/calendars',
      auth: true,
      handler: 'crud',
      entity: 'calendars',
      description: 'Create calendar',
    },
    {
      method: 'POST',
      path: '/events/:id/rsvp',
      auth: true,
      handler: 'custom',
      entity: 'event_attendees',
      description: 'RSVP to event',
    },
    {
      method: 'GET',
      path: '/events/range',
      auth: true,
      handler: 'custom',
      entity: 'events',
      description: 'Get events in date range',
    },
  ],

  config: [
    {
      key: 'defaultView',
      label: 'Default Calendar View',
      type: 'string',
      default: 'month',
      description: 'Default calendar view (month, week, day)',
    },
    {
      key: 'weekStartsOn',
      label: 'Week Starts On',
      type: 'number',
      default: 0,
      description: '0 = Sunday, 1 = Monday',
    },
    {
      key: 'defaultReminderMinutes',
      label: 'Default Reminder (minutes before)',
      type: 'number',
      default: 30,
      description: 'Default reminder time before events',
    },
    {
      key: 'allowRecurring',
      label: 'Allow Recurring Events',
      type: 'boolean',
      default: true,
      description: 'Enable recurring event creation',
    },
  ],
};
