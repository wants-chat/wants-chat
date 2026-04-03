/**
 * Booking System App Type Definition
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOOKING_APP_TYPE: AppTypeDefinition = {
  id: 'booking',
  name: 'Booking System',
  category: 'booking',
  description: 'Appointment and reservation management system',
  icon: 'calendar',

  keywords: [
    'booking', 'appointment', 'reservation', 'schedule', 'calendar',
    'book', 'slot', 'availability', 'appointment-scheduling',
  ],

  synonyms: [
    'appointment system', 'reservation platform', 'scheduling app',
    'booking platform', 'appointment booking',
  ],

  negativeKeywords: ['blog', 'article', 'news'],

  sections: [
    {
      id: 'frontend',
      name: 'Booking Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public booking interface for customers',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Manage bookings, services, and availability',
    },
    {
      id: 'vendor',
      name: 'Provider Dashboard',
      enabled: true,
      basePath: '/provider',
      requiredRole: 'provider',
      layout: 'vendor',
      description: 'Service providers manage their schedule',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'provider',
      name: 'Service Provider',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/provider/dashboard',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 10,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'availability',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reminders',
    'scheduling',
    'reviews',
    'team-management',
    'clients',
    'waitlist',
    'check-in',
  ],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: false,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build an appointment booking system',
    'Create a salon booking app',
    'I need a reservation system for my restaurant',
    'Build a scheduling platform for consultants',
  ],
};
