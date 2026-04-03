/**
 * Lash Studio App Type Definition
 *
 * Complete definition for lash extension and brow studio applications.
 * Essential for lash studios, brow bars, and lash technicians.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LASH_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'lash-studio',
  name: 'Lash Studio',
  category: 'beauty',
  description: 'Lash studio platform with booking, lash mapping, client records, and retention tracking',
  icon: 'eye',

  keywords: [
    'lash studio',
    'lash extensions',
    'lash software',
    'eyelash extensions',
    'lash booking',
    'brow studio',
    'lash technician',
    'lash artist',
    'lash appointments',
    'lash fills',
    'lash business',
    'lash scheduling',
    'brow lamination',
    'lash lift',
    'lash mapping',
    'lash retention',
    'lash crm',
    'lash bar',
    'lash management',
    'lash salon',
  ],

  synonyms: [
    'lash studio platform',
    'lash studio software',
    'lash extension software',
    'lash booking software',
    'lash scheduling software',
    'brow studio software',
    'lash technician software',
    'lash artist software',
    'lash management software',
    'lash appointment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'eyelash curler'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and history' },
    { id: 'admin', name: 'Lash Dashboard', enabled: true, basePath: '/admin', requiredRole: 'artist', layout: 'admin', description: 'Appointments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'artist', name: 'Lash Artist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'subscriptions',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a lash studio booking platform',
    'Create a lash extension app',
    'I need a lash artist scheduling system',
    'Build a brow and lash studio app',
    'Create a lash business management platform',
  ],
};
