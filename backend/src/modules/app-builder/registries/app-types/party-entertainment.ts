/**
 * Party Entertainment App Type Definition
 *
 * Complete definition for party entertainment operations.
 * Essential for children's entertainers, party performers, and character services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARTY_ENTERTAINMENT_APP_TYPE: AppTypeDefinition = {
  id: 'party-entertainment',
  name: 'Party Entertainment',
  category: 'entertainment',
  description: 'Party entertainment platform with performer booking, character roster, package management, and event scheduling',
  icon: 'sparkles',

  keywords: [
    'party entertainment',
    'children entertainer',
    'party entertainment software',
    'party performer',
    'character service',
    'party entertainment management',
    'performer booking',
    'party entertainment practice',
    'party entertainment scheduling',
    'character roster',
    'party entertainment crm',
    'package management',
    'party entertainment business',
    'event scheduling',
    'party entertainment pos',
    'face painting',
    'party entertainment operations',
    'magic shows',
    'party entertainment platform',
    'balloon twisting',
  ],

  synonyms: [
    'party entertainment platform',
    'party entertainment software',
    'children entertainer software',
    'party performer software',
    'character service software',
    'performer booking software',
    'party entertainment practice software',
    'character roster software',
    'package management software',
    'magic shows software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and packages' },
    { id: 'admin', name: 'Business Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Performers and events' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Booking Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'performer', name: 'Performer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a party entertainment platform',
    'Create a children entertainer portal',
    'I need a party performer management system',
    'Build a character booking platform',
    'Create a performer and event scheduling app',
  ],
};
