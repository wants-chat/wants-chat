/**
 * Infrared Sauna App Type Definition
 *
 * Complete definition for infrared sauna studio applications.
 * Essential for sauna studios, infrared wellness centers, and heat therapy facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INFRARED_SAUNA_APP_TYPE: AppTypeDefinition = {
  id: 'infrared-sauna',
  name: 'Infrared Sauna',
  category: 'wellness',
  description: 'Infrared sauna studio platform with room booking, session management, membership tracking, and wellness programs',
  icon: 'flame',

  keywords: [
    'infrared sauna',
    'sauna studio',
    'infrared sauna software',
    'sauna booking',
    'infrared therapy',
    'sauna scheduling',
    'sauna room',
    'heat therapy',
    'sauna sessions',
    'infrared wellness',
    'sauna memberships',
    'sauna business',
    'far infrared',
    'sauna appointments',
    'detox sauna',
    'sauna spa',
    'sauna center',
    'red light sauna',
    'chromotherapy sauna',
    'sauna studio',
  ],

  synonyms: [
    'infrared sauna platform',
    'infrared sauna software',
    'sauna studio software',
    'sauna booking software',
    'infrared therapy software',
    'sauna scheduling software',
    'sauna management software',
    'heat therapy software',
    'sauna session software',
    'sauna business software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'sauna building'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and sessions' },
    { id: 'admin', name: 'Sauna Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Rooms and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'staff', name: 'Wellness Attendant', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'clients',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'waitlist',
    'scheduling',
    'reminders',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build an infrared sauna studio platform',
    'Create a sauna booking app',
    'I need a sauna session management system',
    'Build a heat therapy center app',
    'Create a sauna wellness platform',
  ],
};
