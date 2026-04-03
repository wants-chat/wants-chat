/**
 * Event Management App Type Definition
 *
 * Complete definition for event management and ticketing applications.
 * Essential for event planners, venues, conferences, and organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'event-management',
  name: 'Event Management',
  category: 'events',
  description: 'Event planning and management with ticketing, registrations, scheduling, and attendee management',
  icon: 'calendar-days',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'event management',
    'event planning',
    'event ticketing',
    'ticketing',
    'ticket sales',
    'event registration',
    'registration',
    'conference',
    'conference management',
    'seminar',
    'workshop',
    'webinar',
    'meetup',
    'event booking',
    'event app',
    'eventbrite',
    'ticketmaster',
    'splash',
    'bizzabo',
    'cvent',
    'hopin',
    'venue management',
    'event scheduling',
    'event calendar',
    'rsvp',
    'attendee management',
    'speaker management',
    'expo',
    'trade show',
    'festival',
  ],

  synonyms: [
    'event software',
    'event platform',
    'ticketing system',
    'ticket platform',
    'registration system',
    'event organizer',
    'conference platform',
    'booking platform',
    'event tracker',
    'event planner',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'fitness',
    'restaurant',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Event Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public event listing and ticket purchasing',
    },
    {
      id: 'admin',
      name: 'Organizer Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'organizer',
      layout: 'admin',
      description: 'Event creation and management for organizers',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Platform Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'organizer',
      name: 'Event Organizer',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/events',
    },
    {
      id: 'staff',
      name: 'Event Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/check-in',
    },
    {
      id: 'speaker',
      name: 'Speaker/Presenter',
      level: 30,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/sessions',
    },
    {
      id: 'attendee',
      name: 'Attendee',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/my-tickets',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'waitlist',
    'analytics',
    'feedback',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an event management platform',
    'Create a ticketing system like Eventbrite',
    'I need an event registration app',
    'Build a conference management system',
    'Create an app for selling event tickets',
    'I want to build a platform for hosting virtual events',
    'Make an event planning app with RSVP and ticketing',
  ],
};
