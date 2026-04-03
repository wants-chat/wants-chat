/**
 * Yacht Charter App Type Definition
 *
 * Complete definition for yacht charter and luxury boat rentals.
 * Essential for yacht charters, crewed charters, and luxury boat rentals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YACHT_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'yacht-charter',
  name: 'Yacht Charter',
  category: 'marine',
  description: 'Yacht charter platform with fleet management, crew scheduling, itinerary planning, and luxury amenity coordination',
  icon: 'anchor',

  keywords: [
    'yacht charter',
    'yacht rental',
    'yacht charter software',
    'luxury charter',
    'yacht booking',
    'yacht charter management',
    'crewed charter',
    'yacht fleet',
    'yacht charter scheduling',
    'bareboat charter',
    'yacht charter crm',
    'superyacht',
    'yacht charter business',
    'sailing charter',
    'yacht charter pos',
    'motor yacht',
    'yacht charter operations',
    'catamaran charter',
    'yacht charter services',
    'luxury yachting',
  ],

  synonyms: [
    'yacht charter platform',
    'yacht charter software',
    'yacht rental software',
    'luxury charter software',
    'yacht booking software',
    'crewed charter software',
    'yacht fleet software',
    'bareboat charter software',
    'superyacht charter software',
    'luxury yachting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'small boat'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Fleet and booking' },
    { id: 'admin', name: 'Charter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'captain', layout: 'admin', description: 'Bookings and fleet' },
  ],

  roles: [
    { id: 'admin', name: 'Charter Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Charter Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'captain', name: 'Captain', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/trips' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'marine',

  defaultColorScheme: 'navy',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build a yacht charter platform',
    'Create a luxury yacht booking app',
    'I need a crewed charter management system',
    'Build a yacht fleet rental platform',
    'Create a superyacht charter app',
  ],
};
