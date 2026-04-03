/**
 * Appointment Scheduling App Type Definition
 *
 * Complete definition for appointment scheduling and calendar applications.
 * Essential for service businesses, consultants, and professionals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPOINTMENT_APP_TYPE: AppTypeDefinition = {
  id: 'appointment',
  name: 'Appointment Scheduling',
  category: 'booking',
  description: 'Appointment scheduling with calendar management, client booking, and reminders',
  icon: 'calendar-check',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'appointment',
    'appointment scheduling',
    'appointment booking',
    'calendar booking',
    'scheduling',
    'schedule',
    'book appointment',
    'calendly',
    'acuity',
    'cal.com',
    'doodle',
    'time slots',
    'availability',
    'meeting scheduler',
    'consultation booking',
    'service booking',
    'client scheduling',
    'online booking',
    'booking calendar',
    'appointment calendar',
    'schedule management',
    'booking system',
    'appointment system',
    'time booking',
    'slot booking',
  ],

  synonyms: [
    'booking calendar',
    'scheduling app',
    'appointment app',
    'calendar app',
    'meeting booker',
    'scheduler',
    'booking software',
    'appointment software',
    'scheduling software',
    'calendar management',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Booking Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public booking page for clients',
    },
    {
      id: 'admin',
      name: 'Calendar Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'provider',
      layout: 'admin',
      description: 'Calendar and appointment management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/calendar',
    },
    {
      id: 'provider',
      name: 'Service Provider',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/calendar',
    },
    {
      id: 'client',
      name: 'Client',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/book',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'appointments',
    'availability',
    'calendar',
    'notifications',
    'reminders',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'waitlist',
    'check-in',
    'clients',
    'documents',
    'dashboard',
    'analytics',
    'settings',
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
  complexity: 'moderate',
  industry: 'services',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build an appointment scheduling app',
    'Create a booking calendar like Calendly',
    'I need an online appointment booking system',
    'Build a scheduling app for my consulting business',
    'Create a client booking system',
    'I want to build a meeting scheduler',
    'Make an appointment app with calendar sync',
  ],
};
