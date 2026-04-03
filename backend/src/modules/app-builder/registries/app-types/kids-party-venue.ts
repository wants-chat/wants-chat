/**
 * Kids Party Venue App Type Definition
 *
 * Complete definition for kids party venues and birthday party locations.
 * Essential for party venues, entertainment centers, and celebration spaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KIDS_PARTY_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'kids-party-venue',
  name: 'Kids Party Venue',
  category: 'children',
  description: 'Kids party venue platform with party booking, package selection, add-on management, and event coordination',
  icon: 'party-popper',

  keywords: [
    'kids party venue',
    'birthday party venue',
    'party venue software',
    'kids birthday',
    'party booking',
    'party venue management',
    'celebration venue',
    'party packages',
    'party scheduling',
    'kids events',
    'party venue crm',
    'party room',
    'party venue business',
    'party entertainment',
    'party venue pos',
    'themed parties',
    'party venue operations',
    'party planning',
    'party venue services',
    'kids celebration',
  ],

  synonyms: [
    'kids party venue platform',
    'kids party venue software',
    'birthday party venue software',
    'party booking software',
    'party venue management software',
    'celebration venue software',
    'party package software',
    'kids party software',
    'party planning software',
    'kids event software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'adult party'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Packages and booking' },
    { id: 'admin', name: 'Venue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'host', layout: 'admin', description: 'Parties and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Venue Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'host', name: 'Party Host', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/parties' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a kids party venue booking platform',
    'Create a birthday party venue app',
    'I need a party package management system',
    'Build a kids celebration venue platform',
    'Create a party venue scheduling app',
  ],
};
