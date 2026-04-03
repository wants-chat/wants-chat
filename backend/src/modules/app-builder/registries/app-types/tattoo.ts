/**
 * Tattoo & Piercing App Type Definition
 *
 * Complete definition for tattoo studio and piercing shop applications.
 * Essential for tattoo artists, piercing studios, and body art shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TATTOO_APP_TYPE: AppTypeDefinition = {
  id: 'tattoo',
  name: 'Tattoo & Piercing',
  category: 'services',
  description: 'Tattoo studio platform with appointment booking, artist portfolios, consent forms, and aftercare management',
  icon: 'pen-nib',

  keywords: [
    'tattoo',
    'tattoo studio',
    'tattoo shop',
    'tattoo artist',
    'piercing',
    'body piercing',
    'body art',
    'ink',
    'tattoo parlor',
    'custom tattoo',
    'tattoo design',
    'tattoo booking',
    'tattoo appointment',
    'cover up',
    'tattoo removal',
    'tattoo aftercare',
    'piercing studio',
    'ear piercing',
    'body modification',
    'tattoo flash',
    'tattoo portfolio',
    'walk-in tattoo',
  ],

  synonyms: [
    'tattoo platform',
    'tattoo studio software',
    'tattoo booking app',
    'piercing studio software',
    'tattoo shop app',
    'tattoo artist software',
    'body art platform',
    'tattoo management',
    'tattoo appointment app',
    'piercing booking',
  ],

  negativeKeywords: ['blog only', 'ecommerce', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse artists and book appointments' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Studio and artist management' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'artist', name: 'Tattoo Artist', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/my-schedule' },
    { id: 'piercer', name: 'Piercer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/artists' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'creative',

  defaultColorScheme: 'zinc',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a tattoo studio booking platform',
    'Create a tattoo artist portfolio and booking app',
    'I need a piercing studio management software',
    'Build a tattoo shop appointment system',
    'Create a body art studio platform',
  ],
};
