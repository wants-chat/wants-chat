/**
 * Makeup Artist App Type Definition
 *
 * Complete definition for makeup artist and beauty studio applications.
 * Essential for makeup artists, bridal makeup, and special effects makeup.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MAKEUP_ARTIST_APP_TYPE: AppTypeDefinition = {
  id: 'makeup-artist',
  name: 'Makeup Artist',
  category: 'beauty',
  description: 'Makeup artist platform with booking, portfolio showcase, bridal packages, and client management',
  icon: 'palette',

  keywords: [
    'makeup artist',
    'makeup studio',
    'makeup software',
    'bridal makeup',
    'makeup booking',
    'mua',
    'makeup appointments',
    'beauty artist',
    'makeup business',
    'makeup scheduling',
    'special effects makeup',
    'glam makeup',
    'makeup portfolio',
    'makeup services',
    'airbrush makeup',
    'makeup crm',
    'makeup packages',
    'wedding makeup',
    'event makeup',
    'makeup artist management',
  ],

  synonyms: [
    'makeup artist platform',
    'makeup artist software',
    'mua software',
    'bridal makeup software',
    'makeup booking software',
    'makeup scheduling software',
    'beauty artist software',
    'makeup studio software',
    'makeup business software',
    'makeup appointment software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'cosmetic surgery'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and portfolio' },
    { id: 'admin', name: 'Artist Dashboard', enabled: true, basePath: '/admin', requiredRole: 'artist', layout: 'admin', description: 'Appointments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'artist', name: 'Makeup Artist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
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

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a makeup artist booking platform',
    'Create a bridal makeup app',
    'I need a makeup artist scheduling system',
    'Build a mua portfolio and booking app',
    'Create a makeup studio management platform',
  ],
};
